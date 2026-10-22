import { createAdminClient } from "@/lib/supabase/admin";
import { generateParticipantIds, generateSingleParticipantId } from "@/lib/participant-id";

export interface StudentRecord {
  id: string;
  auth_user_id: string | null;
  competition_id: string | null;
  roll_number: string;
  full_name: string;
  email: string;
  course: string;
  mobile: string | null;
  participant_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentMetrics {
  total: number;
  active: number;
  inactive: number;
  pendingAuth: number;
}

// In-memory fallback store for local development before live Supabase setup
declare global {
  // eslint-disable-next-line no-var
  var __lnmcbm_local_students_store__: StudentRecord[] | undefined;
}

function getLocalStore(): StudentRecord[] {
  if (!global.__lnmcbm_local_students_store__) {
    global.__lnmcbm_local_students_store__ = [];
  }
  return global.__lnmcbm_local_students_store__;
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

export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * Fetch all students with optional search query, course filter, and status filter.
 */
export async function getStudents(params?: {
  search?: string;
  course?: string;
  status?: string;
}): Promise<{ students: StudentRecord[]; metrics: StudentMetrics; isLiveDatabase: boolean }> {
  const search = params?.search?.trim().toLowerCase() || "";
  const course = params?.course?.trim() || "";
  const status = params?.status?.trim() || "";

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    let query = admin.from("students").select("*").order("created_at", { ascending: false });

    if (course && course !== "ALL") {
      query = query.eq("course", course);
    }
    if (status === "active") {
      query = query.eq("is_active", true);
    } else if (status === "inactive") {
      query = query.eq("is_active", false);
    } else if (status === "pending_auth") {
      query = query.is("auth_user_id", null);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Failed to query students from Supabase:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    let allStudents = (data || []) as StudentRecord[];

    // Calculate metrics across all students
    const { data: allData } = await admin.from("students").select("is_active, auth_user_id");
    const fullRoster = allData || [];
    const metrics: StudentMetrics = {
      total: fullRoster.length,
      active: fullRoster.filter((s) => s.is_active).length,
      inactive: fullRoster.filter((s) => !s.is_active).length,
      pendingAuth: fullRoster.filter((s) => !s.auth_user_id).length,
    };

    // Client search filter on server
    if (search) {
      allStudents = allStudents.filter(
        (s) =>
          s.full_name.toLowerCase().includes(search) ||
          s.roll_number.toLowerCase().includes(search) ||
          s.email.toLowerCase().includes(search) ||
          s.participant_id.toLowerCase().includes(search)
      );
    }

    return { students: allStudents, metrics, isLiveDatabase: true };
  }

  // Local fallback store
  const store = getLocalStore();
  let filtered = [...store];

  const metrics: StudentMetrics = {
    total: store.length,
    active: store.filter((s) => s.is_active).length,
    inactive: store.filter((s) => !s.is_active).length,
    pendingAuth: store.filter((s) => !s.auth_user_id).length,
  };

  if (course && course !== "ALL") {
    filtered = filtered.filter((s) => s.course.toLowerCase() === course.toLowerCase());
  }

  if (status === "active") {
    filtered = filtered.filter((s) => s.is_active);
  } else if (status === "inactive") {
    filtered = filtered.filter((s) => !s.is_active);
  } else if (status === "pending_auth") {
    filtered = filtered.filter((s) => !s.auth_user_id);
  }

  if (search) {
    filtered = filtered.filter(
      (s) =>
        s.full_name.toLowerCase().includes(search) ||
        s.roll_number.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.participant_id.toLowerCase().includes(search)
    );
  }

  return { students: filtered, metrics, isLiveDatabase: false };
}

/**
 * Retrieve a single student by UUID.
 */
export async function getStudentById(id: string): Promise<StudentRecord | null> {
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data, error } = await admin.from("students").select("*").eq("id", id).single();
    if (error || !data) return null;
    return data as StudentRecord;
  }

  const store = getLocalStore();
  return store.find((s) => s.id === id) || null;
}

/**
 * Register a single student manually.
 */
export async function createStudent(input: {
  full_name: string;
  roll_number: string;
  course: string;
  email: string;
  mobile?: string | null;
}): Promise<StudentRecord> {
  const full_name = input.full_name.trim();
  const roll_number = input.roll_number.trim();
  const course = input.course.trim();
  const email = input.email.trim().toLowerCase();
  const mobile = input.mobile?.trim() || null;

  if (!full_name || full_name.length < 2) {
    throw new Error("Student full name must be at least 2 characters.");
  }
  if (!roll_number) {
    throw new Error("Roll number is mandatory.");
  }
  if (!course) {
    throw new Error("Course is mandatory.");
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    throw new Error("Please provide a valid email address (e.g. name@domain.com).");
  }

  if (isSupabaseLive()) {
    const admin = createAdminClient();

    // Check duplicate roll number
    const { data: existingRoll } = await admin
      .from("students")
      .select("id")
      .eq("roll_number", roll_number)
      .maybeSingle();

    if (existingRoll) {
      throw new Error(`A student with Roll Number '${roll_number}' is already registered.`);
    }

    // Check duplicate email
    const { data: existingEmail } = await admin
      .from("students")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingEmail) {
      throw new Error(`A student with Email '${email}' is already registered.`);
    }

    // Get all existing participant IDs to generate next unique ID
    const { data: allIds } = await admin.from("students").select("participant_id");
    const existingIds = (allIds || []).map((r) => r.participant_id);
    const participant_id = generateSingleParticipantId(existingIds);

    // Fetch active competition if available
    const { data: competition } = await admin
      .from("competition_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    const insertPayload = {
      full_name,
      roll_number,
      course,
      email,
      mobile,
      participant_id,
      competition_id: competition?.id || null,
      is_active: true,
    };

    const { data, error } = await admin.from("students").insert(insertPayload).select().single();
    if (error) {
      throw new Error(`Failed to create student: ${error.message}`);
    }

    return data as StudentRecord;
  }

  // Local fallback
  const store = getLocalStore();
  if (store.some((s) => s.roll_number.toLowerCase() === roll_number.toLowerCase())) {
    throw new Error(`A student with Roll Number '${roll_number}' is already registered.`);
  }
  if (store.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
    throw new Error(`A student with Email '${email}' is already registered.`);
  }

  const existingIds = store.map((s) => s.participant_id);
  const participant_id = generateSingleParticipantId(existingIds);

  const newRecord: StudentRecord = {
    id: `local-std-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    auth_user_id: null,
    competition_id: null,
    roll_number,
    full_name,
    email,
    course,
    mobile,
    participant_id,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.unshift(newRecord);
  return newRecord;
}

/**
 * Update an existing student's details.
 */
export async function updateStudent(
  id: string,
  input: {
    full_name?: string;
    roll_number?: string;
    course?: string;
    email?: string;
    mobile?: string | null;
    is_active?: boolean;
  }
): Promise<StudentRecord> {
  if (isSupabaseLive()) {
    const admin = createAdminClient();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.full_name !== undefined) updatePayload.full_name = input.full_name.trim();
    if (input.course !== undefined) updatePayload.course = input.course.trim();
    if (input.mobile !== undefined) updatePayload.mobile = input.mobile?.trim() || null;
    if (input.is_active !== undefined) updatePayload.is_active = input.is_active;

    if (input.roll_number !== undefined) {
      const roll = input.roll_number.trim();
      const { data: existing } = await admin
        .from("students")
        .select("id")
        .eq("roll_number", roll)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        throw new Error(`Roll Number '${roll}' is already in use by another student.`);
      }
      updatePayload.roll_number = roll;
    }

    if (input.email !== undefined) {
      const mail = input.email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(mail)) {
        throw new Error("Invalid email format.");
      }
      const { data: existing } = await admin
        .from("students")
        .select("id")
        .eq("email", mail)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        throw new Error(`Email '${mail}' is already associated with another student.`);
      }
      updatePayload.email = mail;
    }

    const { data, error } = await admin
      .from("students")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update student: ${error?.message || "Record not found"}`);
    }

    return data as StudentRecord;
  }

  // Local fallback
  const store = getLocalStore();
  const index = store.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error("Student record not found.");
  }

  const existing = store[index];

  if (input.roll_number !== undefined && input.roll_number.trim() !== existing.roll_number) {
    const roll = input.roll_number.trim();
    if (store.some((s) => s.id !== id && s.roll_number.toLowerCase() === roll.toLowerCase())) {
      throw new Error(`Roll Number '${roll}' is already in use.`);
    }
    existing.roll_number = roll;
  }

  if (input.email !== undefined && input.email.trim().toLowerCase() !== existing.email) {
    const mail = input.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(mail)) {
      throw new Error("Invalid email format.");
    }
    if (store.some((s) => s.id !== id && s.email.toLowerCase() === mail)) {
      throw new Error(`Email '${mail}' is already in use.`);
    }
    existing.email = mail;
  }

  if (input.full_name !== undefined) existing.full_name = input.full_name.trim();
  if (input.course !== undefined) existing.course = input.course.trim();
  if (input.mobile !== undefined) existing.mobile = input.mobile?.trim() || null;
  if (input.is_active !== undefined) existing.is_active = input.is_active;
  existing.updated_at = new Date().toISOString();

  return existing;
}

/**
 * Delete a student record.
 */
export async function deleteStudent(id: string): Promise<boolean> {
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { error } = await admin.from("students").delete().eq("id", id);
    if (error) {
      throw new Error(`Failed to delete student: ${error.message}`);
    }
    return true;
  }

  const store = getLocalStore();
  const index = store.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error("Student not found.");
  }
  store.splice(index, 1);
  return true;
}

/**
 * Bulk Import Rows Definition & Results
 */
export interface RawCSVRow {
  name: string;
  roll_number: string;
  course: string;
  email: string;
  mobile?: string | null;
}

export interface ImportSummary {
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  details: Array<{
    rowNumber: number;
    roll_number: string;
    name: string;
    status: "imported" | "skipped" | "failed";
    reason?: string;
  }>;
  importedStudents: StudentRecord[];
}

/**
 * Authoritative Server-Side Bulk Import Workflow.
 * Safely parses, validates, detects duplicates (file & DB), and commits records.
 */
export async function bulkImportStudents(rows: RawCSVRow[]): Promise<ImportSummary> {
  if (!rows || rows.length === 0) {
    throw new Error("No student records provided for import.");
  }

  const summary: ImportSummary = {
    totalRows: rows.length,
    importedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    details: [],
    importedStudents: [],
  };

  // 1. Gather all existing roll numbers and emails to check duplicates
  let existingRollSet = new Set<string>();
  let existingEmailSet = new Set<string>();
  let existingParticipantIds: string[] = [];
  let competitionId: string | null = null;

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data: existingData } = await admin
      .from("students")
      .select("roll_number, email, participant_id");

    (existingData || []).forEach((r) => {
      existingRollSet.add(r.roll_number.trim().toUpperCase());
      existingEmailSet.add(r.email.trim().toLowerCase());
      existingParticipantIds.push(r.participant_id);
    });

    const { data: comp } = await admin
      .from("competition_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    competitionId = comp?.id || null;
  } else {
    const store = getLocalStore();
    store.forEach((s) => {
      existingRollSet.add(s.roll_number.trim().toUpperCase());
      existingEmailSet.add(s.email.trim().toLowerCase());
      existingParticipantIds.push(s.participant_id);
    });
  }

  // 2. Validate row by row, tracking duplicates inside this CSV batch
  const seenBatchRolls = new Set<string>();
  const seenBatchEmails = new Set<string>();
  const validRowsToInsert: Array<{
    rowNumber: number;
    full_name: string;
    roll_number: string;
    course: string;
    email: string;
    mobile: string | null;
  }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 1;
    const name = (row.name || "").trim();
    const roll = (row.roll_number || "").trim();
    const course = (row.course || "").trim();
    const email = (row.email || "").trim().toLowerCase();
    const mobile = (row.mobile || "").trim() || null;

    // Check mandatory fields
    if (!name || !roll || !course || !email) {
      const missing = [];
      if (!name) missing.push("Name");
      if (!roll) missing.push("Roll Number");
      if (!course) missing.push("Course");
      if (!email) missing.push("Email");

      summary.failedCount++;
      summary.details.push({
        rowNumber,
        roll_number: roll || "N/A",
        name: name || "N/A",
        status: "failed",
        reason: `Missing required field(s): ${missing.join(", ")}`,
      });
      continue;
    }

    // Check email syntax
    if (!EMAIL_REGEX.test(email)) {
      summary.failedCount++;
      summary.details.push({
        rowNumber,
        roll_number: roll,
        name,
        status: "failed",
        reason: `Invalid email address format: '${email}'`,
      });
      continue;
    }

    const rollUpper = roll.toUpperCase();

    // Check internal duplicate within this CSV batch
    if (seenBatchRolls.has(rollUpper)) {
      summary.failedCount++;
      summary.details.push({
        rowNumber,
        roll_number: roll,
        name,
        status: "failed",
        reason: `Duplicate roll number within CSV file: '${roll}'`,
      });
      continue;
    }

    if (seenBatchEmails.has(email)) {
      summary.failedCount++;
      summary.details.push({
        rowNumber,
        roll_number: roll,
        name,
        status: "failed",
        reason: `Duplicate email address within CSV file: '${email}'`,
      });
      continue;
    }

    // Check if already in Database (Skip safely instead of crashing or silently overwriting)
    if (existingRollSet.has(rollUpper)) {
      summary.skippedCount++;
      summary.details.push({
        rowNumber,
        roll_number: roll,
        name,
        status: "skipped",
        reason: `Roll number '${roll}' already exists in competition database`,
      });
      continue;
    }

    if (existingEmailSet.has(email)) {
      summary.skippedCount++;
      summary.details.push({
        rowNumber,
        roll_number: roll,
        name,
        status: "skipped",
        reason: `Email '${email}' already exists in competition database`,
      });
      continue;
    }

    // Mark as seen in this batch
    seenBatchRolls.add(rollUpper);
    seenBatchEmails.add(email);

    validRowsToInsert.push({
      rowNumber,
      full_name: name,
      roll_number: roll,
      course,
      email,
      mobile,
    });
  }

  if (validRowsToInsert.length === 0) {
    return summary;
  }

  // 3. Generate unique sequential participant IDs for all valid rows
  const generatedIds = generateParticipantIds(validRowsToInsert.length, existingParticipantIds);

  const recordsToInsert = validRowsToInsert.map((item, idx) => ({
    ...item,
    participant_id: generatedIds[idx],
  }));

  // 4. Commit to database or local store
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const insertPayload = recordsToInsert.map((r) => ({
      full_name: r.full_name,
      roll_number: r.roll_number,
      course: r.course,
      email: r.email,
      mobile: r.mobile,
      participant_id: r.participant_id,
      competition_id: competitionId,
      is_active: true,
    }));

    const { data: inserted, error } = await admin
      .from("students")
      .insert(insertPayload)
      .select();

    if (error) {
      console.error("Bulk insert failed in Supabase:", error);
      throw new Error(`Database bulk insert failed: ${error.message}`);
    }

    const insertedList = (inserted || []) as StudentRecord[];
    summary.importedCount = insertedList.length;
    summary.importedStudents = insertedList;

    recordsToInsert.forEach((r) => {
      summary.details.push({
        rowNumber: r.rowNumber,
        roll_number: r.roll_number,
        name: r.full_name,
        status: "imported",
        reason: `Enrolled successfully as ${r.participant_id}`,
      });
    });
  } else {
    const store = getLocalStore();
    recordsToInsert.forEach((r) => {
      const newRec: StudentRecord = {
        id: `local-std-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        auth_user_id: null,
        competition_id: null,
        roll_number: r.roll_number,
        full_name: r.full_name,
        email: r.email,
        course: r.course,
        mobile: r.mobile,
        participant_id: r.participant_id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.unshift(newRec);
      summary.importedStudents.push(newRec);
      summary.importedCount++;
      summary.details.push({
        rowNumber: r.rowNumber,
        roll_number: r.roll_number,
        name: r.full_name,
        status: "imported",
        reason: `Enrolled successfully as ${r.participant_id}`,
      });
    });
  }

  // Sort details by original row number
  summary.details.sort((a, b) => a.rowNumber - b.rowNumber);

  return summary;
}

