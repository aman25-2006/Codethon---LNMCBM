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

/**
 * Submits a new candidate self-registration request.
 * All fields are mandatory. File size must not exceed 2 MB.
 */
export async function submitRegistrationRequest(
  input: RegistrationInput
): Promise<{ success: boolean; message: string; id: string }> {
  const full_name = input.full_name?.trim();
  const roll_number = input.roll_number?.trim();
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
    throw new Error("College ID Card photo is mandatory.");
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
    throw new Error(`ID Card photo size (${sizeMb} MB) exceeds the 2 MB limit. Please upload a smaller image.`);
  }

  const nowIso = new Date().toISOString();

  // 3. Supabase or Local Storage
  if (isSupabaseLive()) {
    const admin = createAdminClient();

    // Check duplicate pending request
    const { data: existingPending, error: pendingCheckErr } = await admin
      .from("student_registrations")
      .select("id, status")
      .or(`roll_number.eq.${roll_number},email.eq.${email}`)
      .eq("status", "pending")
      .maybeSingle();

    if (pendingCheckErr) {
      console.error("Supabase pending check error:", pendingCheckErr);
      throw new Error(`Failed to submit registration: ${pendingCheckErr.message}`);
    }

    if (existingPending) {
      throw new Error(
        "A registration request with this Roll Number or Email is already pending administrative verification."
      );
    }

    // Check if already approved/enrolled in students
    const { data: existingStudent, error: studentCheckErr } = await admin
      .from("students")
      .select("id")
      .or(`roll_number.eq.${roll_number},email.eq.${email}`)
      .maybeSingle();

    if (studentCheckErr) {
      console.error("Supabase student check error:", studentCheckErr);
      throw new Error(`Failed to submit registration: ${studentCheckErr.message}`);
    }

    if (existingStudent) {
      throw new Error(
        "A candidate with this Roll Number or Email is already enrolled in the competition. Please sign in directly."
      );
    }

    const { data: inserted, error } = await admin
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
        status: "pending",
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("Supabase registration insert error:", error);
      throw new Error(`Failed to submit registration: ${error?.message || "Database write error"}`);
    }

    return {
      success: true,
      message:
        "Your request has been submitted successfully! Our team will verify it and send the mail soon. Thank you for registering.",
      id: inserted.id,
    };
  }

  // Local fallback store
  const store = getLocalStore();
  const existingPending = store.find(
    (r) =>
      r.status === "pending" &&
      (r.roll_number.toLowerCase() === roll_number.toLowerCase() ||
        r.email.toLowerCase() === email.toLowerCase())
  );

  if (existingPending) {
    throw new Error(
      "A registration request with this Roll Number or Email is already pending administrative verification."
    );
  }

  const newId = `reg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const record: StudentRegistrationRecord = {
    id: newId,
    full_name,
    roll_number,
    email,
    department,
    semester,
    mobile,
    id_card_data,
    id_card_mime: mime,
    status: "pending",
    created_at: nowIso,
    updated_at: nowIso,
  };

  store.unshift(record);

  return {
    success: true,
    message:
      "Your request has been submitted successfully! Our team will verify it and send the mail soon. Thank you for registering.",
    id: newId,
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

