import { createAdminClient, isSupabaseLive } from "@/lib/supabase/admin";
import { createStudent, getStudents, StudentRecord } from "./students-service";
import { issueStudentCredentials, CredentialIssueResult } from "./credentials-service";

export interface StudentRegistrationRecord {
  id: string;
  full_name: string;
  roll_number: string;
  email: string;
  department: string;
  semester: string;
  mobile: string;
  id_card_data: string;
  id_card_mime: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  student_id?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationInput {
  full_name: string;
  roll_number: string;
  email: string;
  department: string;
  semester: string;
  mobile: string;
  id_card_data: string; // Base64 data URL
  id_card_mime?: string;
}

export interface RegistrationMetrics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

// In-memory fallback store for development or when Supabase table is not yet provisioned
declare global {
  // eslint-disable-next-line no-var
  var __lnmcbm_local_registrations_store__: StudentRegistrationRecord[] | undefined;
}

function getLocalStore(): StudentRegistrationRecord[] {
  if (!global.__lnmcbm_local_registrations_store__) {
    global.__lnmcbm_local_registrations_store__ = [];
  }
  return global.__lnmcbm_local_registrations_store__;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Calculates approximate byte size of base64 data string.
 */
function getBase64SizeBytes(base64String: string): number {
  const base64Data = base64String.includes(",") ? base64String.split(",")[1] : base64String;
  const padding = (base64Data.match(/=/g) || []).length;
  return Math.floor((base64Data.length * 3) / 4) - padding;
}

export interface RegistrationSubmitResult {
  success: boolean;
  message: string;
  id: string;
  student: {
    id: string;
    roll_number: string;
    full_name: string;
    participant_id: string;
    course: string;
    email: string;
  };
  emailDispatched: boolean;
}

/**
 * Submits a new candidate self-registration:
 * - Automatically registers and activates candidate profile in the students directory.
 * - Immediately provisions login credentials and dispatches official email from lnmcbmhackathoncell@gmail.com.
 * - Stores ID Card / Admission receipt permanently in student_registrations for invigilator reference.
 */
export async function submitRegistrationRequest(
  input: RegistrationInput
): Promise<RegistrationSubmitResult> {
  const full_name = input.full_name?.trim();
  const roll_number = input.roll_number?.trim().toUpperCase();
  const email = input.email?.trim().toLowerCase();
  const department = input.department?.trim();
  const semester = input.semester?.trim();
  const mobile = input.mobile?.trim().replace(/[^0-9]/g, "");
  const id_card_data = input.id_card_data?.trim();

  // 1. Mandatory field validations
  if (!full_name || full_name.length < 2) {
    throw new Error("Candidate full name is mandatory (minimum 2 characters).");
  }
  if (!roll_number) {
    throw new Error("College / University Roll Number is mandatory.");
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new Error("A valid email address is mandatory (e.g., student@domain.com).");
  }
  if (!department) {
    throw new Error("Department / Program is mandatory (e.g. BCA, MCA, BBA, IT).");
  }
  if (!semester) {
    throw new Error("Semester is mandatory (e.g. 1st, 2nd, 3rd, 4th, 5th, 6th).");
  }
  if (!mobile || !PHONE_REGEX.test(mobile)) {
    throw new Error("A valid 10-digit mobile number is mandatory.");
  }
  if (!id_card_data) {
    throw new Error("College ID Card or Admission Receipt photo is mandatory.");
  }

  // 2. MIME and File Size validation (strict 2MB limit)
  let mime = input.id_card_mime || "image/jpeg";
  if (id_card_data.startsWith("data:")) {
    const mimeMatch = id_card_data.match(/^data:([^;]+);base64,/);
    if (mimeMatch) {
      mime = mimeMatch[1].toLowerCase();
    }
  }

  const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedMimes.includes(mime)) {
    throw new Error("ID Card must be an image in PNG, JPEG, or JPG format.");
  }

  const fileSizeBytes = getBase64SizeBytes(id_card_data);
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (fileSizeBytes / (1024 * 1024)).toFixed(2);
    throw new Error(`Uploaded photo size (${sizeMb} MB) exceeds the 2 MB limit. Please upload an image under 2 MB.`);
  }

  const nowIso = new Date().toISOString();
  const formattedCourse = `${department} (Sem ${semester})`;

  // 3. Duplicate enrollment prevention: check if student is already in the roster
  if (isSupabaseLive()) {
    try {
      const admin = createAdminClient();
      const { data: existingStudent, error: studentCheckErr } = await admin
        .from("students")
        .select("id, roll_number, email")
        .or(`roll_number.eq.${roll_number},email.eq.${email}`)
        .maybeSingle();

      if (studentCheckErr) {
        console.error("Supabase student duplicate check error:", studentCheckErr);
      } else if (existingStudent) {
        throw new Error(
          `A candidate with Roll Number '${roll_number}' or Email '${email}' is already enrolled in the competition. Please sign in directly.`
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("already enrolled")) {
        throw err;
      }
      console.warn("Notice: Continuing registration after remote duplicate check fallback:", err);
    }
  } else {
    const { students } = await getStudents();
    const existingStudent = students.find(
      (s) =>
        s.roll_number.toUpperCase() === roll_number ||
        s.email.toLowerCase() === email
    );
    if (existingStudent) {
      throw new Error(
        `A candidate with Roll Number '${roll_number}' or Email '${email}' is already enrolled in the competition. Please sign in directly.`
      );
    }
  }

  // 4. Directly create candidate in active students directory (no manual verification delay)
  const student = await createStudent({
    full_name,
    roll_number,
    course: formattedCourse,
    email,
    mobile,
  });

  // 5. Automatically issue credentials and dispatch official credentials email immediately
  let emailDispatched = false;
  try {
    const credResult = await issueStudentCredentials(student.id, { sendEmail: true });
    emailDispatched =
      credResult.emailStatus === "accepted" || credResult.emailStatus === "delivered";
  } catch (credErr) {
    console.error("Failed to auto-dispatch credentials email during registration:", credErr);
  }

  // 6. Persist uploaded ID Card / Admission receipt permanently in student_registrations
  let regId = `reg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  if (isSupabaseLive()) {
    try {
      const admin = createAdminClient();
      const { data: inserted, error: insertError } = await admin
        .from("student_registrations")
        .insert({
          full_name,
          roll_number,
          email,
          department,
          semester,
          mobile,
          id_card_data,
          id_card_mime: mime,
          status: "approved",
          student_id: student.id,
          reviewed_at: nowIso,
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select("id")
        .single();

      if (!insertError && inserted) {
        regId = inserted.id;
      }
    } catch (saveErr) {
      console.warn("Could not save to student_registrations table:", saveErr);
    }
  } else {
    const store = getLocalStore();
    store.unshift({
      id: regId,
      full_name,
      roll_number,
      email,
      department,
      semester,
      mobile,
      id_card_data,
      id_card_mime: mime,
      status: "approved",
      student_id: student.id,
      reviewed_at: nowIso,
      created_at: nowIso,
      updated_at: nowIso,
    });
  }

  return {
    success: true,
    message:
      "Registration completed successfully! Your official examination login credentials (Roll Number, Participant ID, and Password) have been dispatched directly to your email address.",
    id: regId,
    student: {
      id: student.id,
      roll_number: student.roll_number,
      full_name: student.full_name,
      participant_id: student.participant_id,
      course: student.course,
      email: student.email,
    },
    emailDispatched,
  };
}

/**
 * Retrieves registration requests for admin review with filtering and metrics.
 */
export async function getRegistrationRequests(params?: {
  status?: string;
  search?: string;
}): Promise<{
  registrations: StudentRegistrationRecord[];
  metrics: RegistrationMetrics;
  isLiveDatabase: boolean;
}> {
  const statusFilter = params?.status?.toLowerCase();
  const search = params?.search?.trim().toLowerCase();

  let allRegistrations: StudentRegistrationRecord[] = [];

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    let query = admin
      .from("student_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase getRegistrationRequests error:", error);
      allRegistrations = getLocalStore();
    } else {
      allRegistrations = (data || []) as StudentRegistrationRecord[];
    }
  } else {
    allRegistrations = getLocalStore();
    if (statusFilter && statusFilter !== "all") {
      allRegistrations = allRegistrations.filter((r) => r.status === statusFilter);
    }
  }

  // Calculate metrics across all requests
  let rawAll: StudentRegistrationRecord[] = [];
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data } = await admin.from("student_registrations").select("status");
    rawAll = (data || []) as any;
  } else {
    rawAll = getLocalStore();
  }

  const metrics: RegistrationMetrics = {
    total: rawAll.length,
    pending: rawAll.filter((r) => r.status === "pending").length,
    approved: rawAll.filter((r) => r.status === "approved").length,
    rejected: rawAll.filter((r) => r.status === "rejected").length,
  };

  // Apply client-side search filter if provided
  let filtered = allRegistrations;
  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.full_name.toLowerCase().includes(search) ||
        r.roll_number.toLowerCase().includes(search) ||
        r.email.toLowerCase().includes(search) ||
        r.department.toLowerCase().includes(search) ||
        r.mobile.includes(search)
    );
  }

  return {
    registrations: filtered,
    metrics,
    isLiveDatabase: isSupabaseLive(),
  };
}

/**
 * Approves a candidate registration request:
 * 1. Creates/links the student record in the students directory.
 * 2. Generates credentials and sends the login credentials email directly from lnmcbmhackathoncell@gmail.com.
 * 3. Updates registration status to 'approved'.
 */
export async function approveRegistrationRequest(registrationId: string): Promise<{
  success: boolean;
  registration: StudentRegistrationRecord;
  student: StudentRecord;
  credentials: CredentialIssueResult;
}> {
  let registration: StudentRegistrationRecord | null = null;

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("student_registrations")
      .select("*")
      .eq("id", registrationId)
      .maybeSingle();
    registration = data as StudentRegistrationRecord;
  } else {
    registration = getLocalStore().find((r) => r.id === registrationId) || null;
  }

  if (!registration) {
    throw new Error(`Registration request with ID '${registrationId}' was not found.`);
  }

  if (registration.status === "approved") {
    throw new Error("This registration request has already been approved.");
  }

  // 1. Find or create the student record
  const { students } = await getStudents();
  let student = students.find(
    (s) =>
      s.roll_number.toLowerCase() === registration!.roll_number.toLowerCase() ||
      s.email.toLowerCase() === registration!.email.toLowerCase()
  );

  const formattedCourse = `${registration.department} (Sem ${registration.semester})`;

  if (!student) {
    student = await createStudent({
      full_name: registration.full_name,
      roll_number: registration.roll_number,
      course: formattedCourse,
      email: registration.email,
      mobile: registration.mobile,
    });
  }

  // 2. Issue credentials and immediately dispatch email to the student
  const credentials = await issueStudentCredentials(student.id, { sendEmail: true });

  const nowIso = new Date().toISOString();

  // 3. Mark registration approved
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    await admin
      .from("student_registrations")
      .update({
        status: "approved",
        student_id: student.id,
        reviewed_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", registrationId);
  } else {
    registration.status = "approved";
    registration.student_id = student.id;
    registration.reviewed_at = nowIso;
    registration.updated_at = nowIso;
  }

  return {
    success: true,
    registration: {
      ...registration,
      status: "approved",
      student_id: student.id,
      reviewed_at: nowIso,
    },
    student,
    credentials,
  };
}

/**
 * Rejects a candidate registration request with optional reason.
 */
export async function rejectRegistrationRequest(
  registrationId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  const nowIso = new Date().toISOString();

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { error } = await admin
      .from("student_registrations")
      .update({
        status: "rejected",
        rejection_reason: reason || "ID Card details could not be verified.",
        reviewed_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", registrationId);

    if (error) {
      throw new Error(`Failed to reject registration: ${error.message}`);
    }
  } else {
    const record = getLocalStore().find((r) => r.id === registrationId);
    if (!record) throw new Error("Registration record not found.");
    record.status = "rejected";
    record.rejection_reason = reason || "ID Card details could not be verified.";
    record.reviewed_at = nowIso;
    record.updated_at = nowIso;
  }

  return {
    success: true,
    message: "Registration request has been rejected.",
  };
}

