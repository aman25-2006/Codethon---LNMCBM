import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateTemporaryPassword } from "@/lib/auth/password-generator";
import { generateSalt, hashPassword, verifyPassword } from "@/lib/auth/password-hasher";
import { sendStudentCredentialsEmail, EmailDispatchResult } from "@/lib/email/email-service";
import { getStudentById, StudentRecord } from "@/lib/services/students-service";

export interface StudentAuthProfile {
  id: string;
  auth_user_id: string;
  roll_number: string;
  full_name: string;
  email: string;
  course: string;
  participant_id: string;
}

export interface CredentialIssueResult {
  studentId: string;
  roll_number: string;
  full_name: string;
  email: string;
  participant_id: string;
  accountCreated: boolean;
  emailStatus: "accepted" | "delivered" | "failed" | "provider_not_configured" | "skipped";
  providerMessageId?: string;
  errorMessage?: string;
  // Ephemeral: returned exclusively for immediate one-time display or invigilator export
  temporaryPassword?: string;
}

export interface EmailDeliveryRecord {
  id: string;
  student_id: string | null;
  student_name?: string;
  roll_number?: string;
  email_type: string;
  recipient_email: string;
  provider_message_id: string | null;
  delivery_status: "queued" | "accepted" | "delivered" | "failed" | "bounced" | "provider_not_configured";
  attempt_count: number;
  error_details: string | null;
  created_at: string;
  updated_at: string;
}

// In-memory fallback stores for local testing
declare global {
  // eslint-disable-next-line no-var
  var __lnmcbm_local_student_hashes__: Record<string, { salt: string; hash: string }> | undefined;
  // eslint-disable-next-line no-var
  var __lnmcbm_local_email_logs__: EmailDeliveryRecord[] | undefined;
}

function getLocalHashes(): Record<string, { salt: string; hash: string }> {
  if (!global.__lnmcbm_local_student_hashes__) {
    global.__lnmcbm_local_student_hashes__ = {};
  }
  return global.__lnmcbm_local_student_hashes__;
}

function getLocalEmailLogs(): EmailDeliveryRecord[] {
  if (!global.__lnmcbm_local_email_logs__) {
    global.__lnmcbm_local_email_logs__ = [];
  }
  return global.__lnmcbm_local_email_logs__;
}

function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("your-project-id") &&
    !key.includes("your-supabase-service-role-key")
  );
}

/**
 * Issue or rotate credentials for a single student.
 * Creates/updates the authentication user and optionally dispatches the credential email.
 */
export async function issueStudentCredentials(
  studentId: string,
  options?: { sendEmail?: boolean }
): Promise<CredentialIssueResult> {
  const student = await getStudentById(studentId);
  if (!student) {
    throw new Error("Student record not found.");
  }

  const temporaryPassword = generateTemporaryPassword();
  let accountCreated = false;
  let authUserId = student.auth_user_id;

  // ----------------------------------------------------------------------------
  // Case A: Supabase Remote Authentication
  // ----------------------------------------------------------------------------
  if (isSupabaseLive()) {
    const admin = createAdminClient();

    if (authUserId) {
      // Reissue / reset credentials on existing auth account
      const { error: updateError } = await admin.auth.admin.updateUserById(authUserId, {
        password: temporaryPassword,
      });

      if (updateError) {
        throw new Error(`Failed to update authentication user: ${updateError.message}`);
      }
    } else {
      // Create new Supabase Auth user
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: student.email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          role: "student",
          full_name: student.full_name,
          roll_number: student.roll_number,
          participant_id: student.participant_id,
        },
      });

      if (createError || !newUser?.user) {
        throw new Error(`Failed to create authentication user: ${createError?.message || "Unknown error"}`);
      }

      authUserId = newUser.user.id;
      accountCreated = true;

      // Ensure corresponding row in profiles table with student role
      await admin.from("profiles").upsert({
        id: authUserId,
        email: student.email,
        full_name: student.full_name,
        role: "student",
      });

      // Link auth_user_id in students table
      await admin
        .from("students")
        .update({ auth_user_id: authUserId, updated_at: new Date().toISOString() })
        .eq("id", studentId);
    }
  } else {
    // ----------------------------------------------------------------------------
    // Case B: Local Bootstrap / Dev Fallback
    // ----------------------------------------------------------------------------
    const salt = generateSalt();
    const hash = hashPassword(temporaryPassword, salt);
    const hashes = getLocalHashes();

    authUserId = `auth-local-${student.id}`;
    hashes[student.roll_number.toUpperCase()] = { salt, hash };

    // Update local student store record
    student.auth_user_id = authUserId;
    student.updated_at = new Date().toISOString();
    accountCreated = true;
  }

  // ----------------------------------------------------------------------------
  // Email Dispatch Handling
  // ----------------------------------------------------------------------------
  let emailStatus: CredentialIssueResult["emailStatus"] = "skipped";
  let providerMessageId: string | undefined;
  let errorMessage: string | undefined;

  if (options?.sendEmail !== false) {
    const dispatchResult: EmailDispatchResult = await sendStudentCredentialsEmail({
      studentName: student.full_name,
      rollNumber: student.roll_number,
      email: student.email,
      temporaryPassword,
      participantId: student.participant_id,
    });

    emailStatus = dispatchResult.status;
    providerMessageId = dispatchResult.messageId;
    errorMessage = dispatchResult.error;

    // Log to email_delivery_logs table (or local store)
    await recordEmailLog({
      student_id: student.id,
      student_name: student.full_name,
      roll_number: student.roll_number,
      recipient_email: student.email,
      delivery_status: dispatchResult.status,
      provider_message_id: dispatchResult.messageId || null,
      error_details: dispatchResult.error || null,
    });
  }

  return {
    studentId: student.id,
    roll_number: student.roll_number,
    full_name: student.full_name,
    email: student.email,
    participant_id: student.participant_id,
    accountCreated,
    emailStatus,
    providerMessageId,
    errorMessage,
    temporaryPassword,
  };
}

/**
 * Bulk issue credentials for multiple students.
 */
export async function bulkIssueCredentials(options?: {
  studentIds?: string[];
  sendEmail?: boolean;
}): Promise<{
  total: number;
  created: number;
  emailSent: number;
  emailFailed: number;
  emailPending: number;
  results: CredentialIssueResult[];
}> {
  let targetIds = options?.studentIds;

  if (!targetIds || targetIds.length === 0) {
    // Fetch all students where auth_user_id is null or all active students
    if (isSupabaseLive()) {
      const admin = createAdminClient();
      const { data } = await admin.from("students").select("id").eq("is_active", true);
      targetIds = (data || []).map((s) => s.id);
    } else {
      const store = global.__lnmcbm_local_students_store__ || [];
      targetIds = store.filter((s) => s.is_active).map((s) => s.id);
    }
  }

  const results: CredentialIssueResult[] = [];
  let emailSent = 0;
  let emailFailed = 0;
  let emailPending = 0;

  for (const id of targetIds) {
    try {
      const res = await issueStudentCredentials(id, { sendEmail: options?.sendEmail });
      results.push(res);
      if (res.emailStatus === "accepted" || res.emailStatus === "delivered") {
        emailSent++;
      } else if (res.emailStatus === "failed") {
        emailFailed++;
      } else {
        emailPending++;
      }
    } catch (err: unknown) {
      console.error(`Failed to issue credentials for student ${id}:`, err);
    }
  }

  return {
    total: results.length,
    created: results.filter((r) => r.accountCreated).length,
    emailSent,
    emailFailed,
    emailPending,
    results,
  };
}

/**
 * Authenticate student via Roll Number and Password.
 */
export async function authenticateStudent(
  rollNumber: string,
  password: string
): Promise<{ success: boolean; student?: StudentAuthProfile; error?: string }> {
  const cleanRoll = rollNumber.trim().toUpperCase();
  const cleanPass = password.trim();

  if (!cleanRoll || !cleanPass) {
    return { success: false, error: "Please enter your Roll Number and Password." };
  }

  if (isSupabaseLive()) {
    const admin = createAdminClient();

    // 1. Look up student record securely on server
    const { data: student, error: studentError } = await admin
      .from("students")
      .select("id, auth_user_id, roll_number, full_name, email, course, participant_id, is_active")
      .ilike("roll_number", cleanRoll)
      .maybeSingle();

    if (studentError || !student) {
      return { success: false, error: "Invalid Roll Number or Password." };
    }

    if (!student.is_active) {
      return {
        success: false,
        error: "Participation Suspended: Your candidate account has been deactivated by the administrator. Contact your exam invigilator.",
      };
    }

    if (!student.auth_user_id) {
      return {
        success: false,
        error: "Credentials Pending Setup: Your login credentials have not been issued yet. Please check your registered email or contact the administrator.",
      };
    }

    // 2. Authenticate against Supabase Auth using email + password mapping via Anon client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: student.email,
      password: cleanPass,
    });

    if (authError || !authData?.user) {
      console.warn("Student signInWithPassword rejected:", authError?.message);
      return { success: false, error: "Invalid Roll Number or Password." };
    }

    return {
      success: true,
      student: {
        id: student.id,
        auth_user_id: student.auth_user_id,
        roll_number: student.roll_number,
        full_name: student.full_name,
        email: student.email,
        course: student.course,
        participant_id: student.participant_id,
      },
    };
  }

  // ----------------------------------------------------------------------------
  // Case B: Local Development Authentication
  // ----------------------------------------------------------------------------
  const store = global.__lnmcbm_local_students_store__ || [];
  const student = store.find((s) => s.roll_number.toUpperCase() === cleanRoll);

  if (!student) {
    return { success: false, error: "Invalid Roll Number or Password." };
  }

  if (!student.is_active) {
    return {
      success: false,
      error: "Participation Suspended: Your candidate account has been deactivated by the administrator. Contact your exam invigilator.",
    };
  }

  if (!student.auth_user_id) {
    return {
      success: false,
      error: "Credentials Pending Setup: Your login credentials have not been issued yet. Please check your registered email or contact the administrator.",
    };
  }

  const hashes = getLocalHashes();
  const creds = hashes[cleanRoll];

  if (!creds || !verifyPassword(cleanPass, creds.salt, creds.hash)) {
    return { success: false, error: "Invalid Roll Number or Password." };
  }

  return {
    success: true,
    student: {
      id: student.id,
      auth_user_id: student.auth_user_id,
      roll_number: student.roll_number,
      full_name: student.full_name,
      email: student.email,
      course: student.course,
      participant_id: student.participant_id,
    },
  };
}

/**
 * Record an email attempt in email_delivery_logs.
 */
async function recordEmailLog(data: {
  student_id: string;
  student_name?: string;
  roll_number?: string;
  recipient_email: string;
  delivery_status: EmailDeliveryRecord["delivery_status"];
  provider_message_id: string | null;
  error_details: string | null;
}) {
  if (isSupabaseLive()) {
    try {
      const admin = createAdminClient();
      await admin.from("email_delivery_logs").insert({
        student_id: data.student_id,
        email_type: "credentials",
        recipient_email: data.recipient_email,
        provider_message_id: data.provider_message_id,
        delivery_status: data.delivery_status === "provider_not_configured" ? "failed" : data.delivery_status,
        error_details: data.error_details,
        attempt_count: 1,
      });
      return;
    } catch (err) {
      console.error("Failed to insert email_delivery_logs in Supabase:", err);
    }
  }

  const localLogs = getLocalEmailLogs();
  localLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    student_id: data.student_id,
    student_name: data.student_name,
    roll_number: data.roll_number,
    email_type: "credentials",
    recipient_email: data.recipient_email,
    provider_message_id: data.provider_message_id,
    delivery_status: data.delivery_status,
    attempt_count: 1,
    error_details: data.error_details,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

/**
 * Fetch email delivery logs for the administrator panel.
 */
export async function getEmailDeliveryLogs(): Promise<EmailDeliveryRecord[]> {
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("email_delivery_logs")
      .select("*, students(full_name, roll_number)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !data) return [];
    return data.map((item: any) => ({
      ...item,
      student_name: item.students?.full_name,
      roll_number: item.students?.roll_number,
    }));
  }

  return getLocalEmailLogs();
}

