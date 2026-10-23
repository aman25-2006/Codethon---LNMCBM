import { createAdminClient, isSupabaseLive } from "@/lib/supabase/admin";
import { logAuditEvent } from "@/lib/audit";
import { getStudents } from "@/lib/services/students-service";
import { getQuestions } from "@/lib/services/questions-service";
import {
  getAllCodingProblems,
  getProblemWithHiddenTestCases,
  CodingCategory,
} from "@/lib/services/coding-problems-service";
import { publishResults } from "@/lib/services/exam-service";
import { CompetitionStatus } from "@/types/database";

export interface CompetitionSettingsDTO {
  id: string;
  competition_name: string;
  college_name: string;
  college_logo_url: string;
  competition_date: string;
  registration_status: "open" | "closed";
  status: CompetitionStatus;
  phase1_duration_minutes: number;
  phase2_duration_minutes: number;
  fullscreen_warning_threshold: number;
  eligible_coding_categories: CodingCategory[];
  results_published: boolean;
  participant_instructions: string | null;
  contact_email: string;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreflightCheckItem {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;
  details: string;
  currentValue?: number | string;
  expectedValue?: number | string;
}

export interface PreflightChecklistResult {
  canStart: boolean;
  canMarkReady: boolean;
  checks: PreflightCheckItem[];
  summary: {
    passedCount: number;
    totalRequired: number;
    totalChecks: number;
  };
}

export const ALLOWED_STATE_TRANSITIONS: Record<CompetitionStatus, CompetitionStatus[]> = {
  draft: ["registration_open", "registration_closed", "ready", "in_progress"],
  registration_open: ["registration_closed", "ready", "in_progress"],
  registration_closed: ["registration_open", "ready", "in_progress"],
  ready: ["registration_closed", "in_progress", "draft"],
  in_progress: ["evaluation_pending", "completed", "ready"],
  evaluation_pending: ["completed", "in_progress"],
  completed: ["results_published", "in_progress", "ready"],
  results_published: ["completed", "in_progress"],
};

export const DEFAULT_COMPETITION_SETTINGS: CompetitionSettingsDTO = {
  id: "comp-settings-default-2026",
  competition_name: "Codethon 2026",
  college_name: "Lalit Narayan Mishra College of Business Management",
  college_logo_url: "/images/college-logo.png",
  competition_date: new Date().toISOString().split("T")[0],
  registration_status: "open",
  status: "draft",
  phase1_duration_minutes: 45,
  phase2_duration_minutes: 30,
  fullscreen_warning_threshold: 3,
  eligible_coding_categories: ["C", "C++", "Java", "Python", "Web Development", "DSA"],
  results_published: false,
  participant_instructions:
    "1. Fullscreen mode is mandatory throughout the examination.\n2. Exiting fullscreen or switching tabs triggers automated integrity warnings.\n3. Phase 1 comprises 40 MCQs carrying 80 marks within 45 minutes.\n4. Phase 2 comprises 2 coding problems carrying 20 marks total within 30 minutes.",
  contact_email: "exams@lnmcbm.ac.in",
  contact_phone: "+91-621-2268100",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

declare global {
  // eslint-disable-next-line no-var
  var __lnmcbm_local_competition_settings__: CompetitionSettingsDTO | undefined;
}

function getLocalSettingsStore(): CompetitionSettingsDTO {
  if (!global.__lnmcbm_local_competition_settings__) {
    global.__lnmcbm_local_competition_settings__ = { ...DEFAULT_COMPETITION_SETTINGS };
  }
  return global.__lnmcbm_local_competition_settings__;
}

/**
 * Retrieves global competition settings from database or local memory store.
 */
export async function getCompetitionSettings(): Promise<CompetitionSettingsDTO> {
  if (isSupabaseLive()) {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("competition_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const dto: CompetitionSettingsDTO = {
          id: data.id,
          competition_name: data.competition_name || DEFAULT_COMPETITION_SETTINGS.competition_name,
          college_name: data.college_name || DEFAULT_COMPETITION_SETTINGS.college_name,
          college_logo_url: data.college_logo_url || DEFAULT_COMPETITION_SETTINGS.college_logo_url,
          competition_date: data.competition_date || DEFAULT_COMPETITION_SETTINGS.competition_date,
          registration_status: (data.registration_status as "open" | "closed") || "open",
          status: (data.status as CompetitionStatus) || "draft",
          phase1_duration_minutes: data.phase1_duration_minutes || 45,
          phase2_duration_minutes: data.phase2_duration_minutes || 30,
          fullscreen_warning_threshold: data.fullscreen_warning_threshold || 3,
          eligible_coding_categories: (data.eligible_coding_categories || DEFAULT_COMPETITION_SETTINGS.eligible_coding_categories) as CodingCategory[],
          results_published: Boolean(data.results_published),
          participant_instructions: data.participant_instructions || DEFAULT_COMPETITION_SETTINGS.participant_instructions,
          contact_email: data.contact_email || DEFAULT_COMPETITION_SETTINGS.contact_email,
          contact_phone: data.contact_phone || DEFAULT_COMPETITION_SETTINGS.contact_phone,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        };
        // Keep in-memory store in sync with the database source of truth
        global.__lnmcbm_local_competition_settings__ = { ...dto };
        return dto;
      }

      // If no row exists, initialize default
      const { data: inserted, error: insertError } = await admin
        .from("competition_settings")
        .insert({
          competition_name: DEFAULT_COMPETITION_SETTINGS.competition_name,
          college_name: DEFAULT_COMPETITION_SETTINGS.college_name,
          college_logo_url: DEFAULT_COMPETITION_SETTINGS.college_logo_url,
          competition_date: DEFAULT_COMPETITION_SETTINGS.competition_date,
          registration_status: DEFAULT_COMPETITION_SETTINGS.registration_status,
          status: DEFAULT_COMPETITION_SETTINGS.status,
          phase1_duration_minutes: DEFAULT_COMPETITION_SETTINGS.phase1_duration_minutes,
          phase2_duration_minutes: DEFAULT_COMPETITION_SETTINGS.phase2_duration_minutes,
          fullscreen_warning_threshold: DEFAULT_COMPETITION_SETTINGS.fullscreen_warning_threshold,
          eligible_coding_categories: DEFAULT_COMPETITION_SETTINGS.eligible_coding_categories,
          results_published: DEFAULT_COMPETITION_SETTINGS.results_published,
          participant_instructions: DEFAULT_COMPETITION_SETTINGS.participant_instructions,
          contact_email: DEFAULT_COMPETITION_SETTINGS.contact_email,
          contact_phone: DEFAULT_COMPETITION_SETTINGS.contact_phone,
        })
        .select("*")
        .single();

      if (!insertError && inserted) {
        const dto = inserted as unknown as CompetitionSettingsDTO;
        global.__lnmcbm_local_competition_settings__ = { ...dto };
        return dto;
      }
    } catch (err) {
      console.warn("Supabase competition_settings query error, falling back to local store:", err);
    }
  }

  return { ...getLocalSettingsStore() };
}

/**
 * Counts how many student attempts are actively in-progress right now.
 */
export async function getActiveExamsCount(): Promise<number> {
  const nowIso = new Date().toISOString();
  if (isSupabaseLive()) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("exam_sessions")
        .select("id, status, phase1_expires_at, phase2_expires_at, is_terminated")
        .in("status", ["phase1_in_progress", "phase2_in_progress"])
        .eq("is_terminated", false);

      if (!data) return 0;
      return data.filter((s: any) => {
        if (s.status === "phase1_in_progress") {
          return !s.phase1_expires_at || s.phase1_expires_at > nowIso;
        }
        if (s.status === "phase2_in_progress") {
          return !s.phase2_expires_at || s.phase2_expires_at > nowIso;
        }
        return false;
      }).length;
    } catch (err) {
      console.error("Failed to query active exam count in Supabase:", err);
    }
  }

  // Fallback in-memory session inspection
  const localStore = ((global as any).__lnmcbm_local_exam_sessions__ || []) as any[];
  return localStore.filter(
    (s: any) =>
      !s.is_terminated &&
      ((s.status === "phase1_in_progress" && (!s.phase1_expires_at || s.phase1_expires_at > nowIso)) ||
       (s.status === "phase2_in_progress" && (!s.phase2_expires_at || s.phase2_expires_at > nowIso)))
  ).length;
}

/**
 * Verifies all 8 preflight requirements before a competition can be marked ready or started.
 */
export async function checkCompetitionPreflight(): Promise<PreflightChecklistResult> {
  const settings = await getCompetitionSettings();
  const checks: PreflightCheckItem[] = [];

  // Check 0: Database Persistence Mode (Supabase PostgreSQL)
  const isDbLive = isSupabaseLive();
  checks.push({
    id: "database_persistence",
    label: "Persistent Database Storage (Supabase PostgreSQL)",
    required: true,
    passed: isDbLive,
    currentValue: isDbLive ? "Supabase Live" : "In-Memory RAM",
    expectedValue: "Supabase Live (Persistent)",
    details: isDbLive
      ? "Supabase PostgreSQL connected. Candidate roster, credentials, and scores are permanently retained."
      : "Portal is operating in temporary server RAM! All candidate details and passwords will be lost when the server sleeps after 1–2 minutes. Add Supabase keys to Vercel.",
  });

  // Check 1: Active students registered
  let studentCount = 0;
  try {
    const { metrics } = await getStudents({ status: "active" });
    studentCount = metrics.active;
  } catch {
    studentCount = 0;
  }
  checks.push({
    id: "students_registered",
    label: "Active Student Enrollment",
    required: true,
    passed: studentCount >= 1,
    currentValue: studentCount,
    expectedValue: ">= 1 active student",
    details:
      studentCount >= 1
        ? `${studentCount} active student(s) confirmed registered in candidate roster.`
        : "No active candidates enrolled. Register students or import roster first.",
  });

  // Check 2: 40 MCQ Questions in bank
  let mcqCount = 0;
  let mcqTotalMarks = 0;
  try {
    const { metrics } = await getQuestions();
    mcqCount = metrics.enabled;
    mcqTotalMarks = metrics.totalMarks;
  } catch {
    mcqCount = 0;
    mcqTotalMarks = 0;
  }
  checks.push({
    id: "mcq_questions_count",
    label: "Phase 1 Question Bank Completeness",
    required: true,
    passed: mcqCount === 40,
    currentValue: mcqCount,
    expectedValue: 40,
    details:
      mcqCount === 40
        ? "Exactly 40 enabled MCQ questions ready for Phase 1 examination."
        : `Found ${mcqCount} enabled questions. Exactly 40 required. Seed curriculum questions.`,
  });

  // Check 3: MCQ Marks total exactly 80 marks
  checks.push({
    id: "mcq_marks_total",
    label: "Phase 1 Mark Distribution Balance",
    required: true,
    passed: mcqTotalMarks === 80,
    currentValue: `${mcqTotalMarks} Marks`,
    expectedValue: "80 Marks",
    details:
      mcqTotalMarks === 80
        ? "Curriculum mark distribution balanced at exactly 80 marks."
        : `Current total is ${mcqTotalMarks} marks. Must total exactly 80 marks across 4 categories.`,
  });

  // Check 4: Eligible coding categories configured
  const categories = settings.eligible_coding_categories || [];
  checks.push({
    id: "coding_categories_configured",
    label: "Phase 2 Category Track Configuration",
    required: true,
    passed: categories.length >= 1,
    currentValue: `${categories.length} categories enabled`,
    expectedValue: ">= 1 enabled",
    details:
      categories.length >= 1
        ? `Configured tracks: ${categories.join(", ")}.`
        : "No coding categories enabled. Enable at least one programming track in settings.",
  });

  // Check 5: Coding problems completeness (2 problems per enabled track carrying 10 marks each)
  let codingProblemsValid = true;
  let codingProblemsMessage = "";
  let missingTracks: string[] = [];
  try {
    const allProblems = await getAllCodingProblems();
    for (const cat of categories) {
      if (cat === "DSA") {
        for (const lang of ["C", "C++", "Java"] as const) {
          const matching = allProblems.filter(
            (p) => p.category === "DSA" && p.programming_language === lang && p.is_active
          );
          if (matching.length < 2) {
            codingProblemsValid = false;
            missingTracks.push(`DSA (${lang}): ${matching.length}/2`);
          }
        }
      } else {
        const matching = allProblems.filter((p) => p.category === cat && p.is_active);
        if (matching.length < 2) {
          codingProblemsValid = false;
          missingTracks.push(`${cat}: ${matching.length}/2`);
        }
      }
    }

    if (codingProblemsValid) {
      codingProblemsMessage = "All enabled categories have at least 2 active problems (10 marks each).";
    } else {
      codingProblemsMessage = `Incomplete problem sets for: ${missingTracks.join(", ")}.`;
    }
  } catch (err) {
    codingProblemsValid = false;
    codingProblemsMessage = "Failed to verify coding problems bank.";
  }

  checks.push({
    id: "coding_problems_valid",
    label: "Phase 2 Problems Bank (2 per track @ 10M)",
    required: true,
    passed: codingProblemsValid,
    currentValue: codingProblemsValid ? "Configured" : "Incomplete",
    expectedValue: "2 problems per enabled track",
    details: codingProblemsMessage,
  });

  // Check 6: Hidden evaluation test cases configured
  let hiddenTestsValid = true;
  let hiddenTestsMessage = "";
  try {
    const allProblems = await getAllCodingProblems();
    const activeEnabledProblems = allProblems.filter(
      (p) => p.is_active && categories.includes(p.category)
    );

    let problemsWithoutTests: string[] = [];
    for (const prob of activeEnabledProblems) {
      const probData = await getProblemWithHiddenTestCases(prob.id);
      if (!probData || !probData.testCases || probData.testCases.length === 0) {
        hiddenTestsValid = false;
        problemsWithoutTests.push(prob.title);
      }
    }

    if (hiddenTestsValid && activeEnabledProblems.length > 0) {
      hiddenTestsMessage = "Every active problem has at least 1 verified hidden evaluation test case.";
    } else if (activeEnabledProblems.length === 0) {
      hiddenTestsValid = false;
      hiddenTestsMessage = "No active coding problems configured.";
    } else {
      hiddenTestsMessage = `Problems missing hidden test cases: ${problemsWithoutTests.slice(0, 3).join(", ")}${problemsWithoutTests.length > 3 ? "..." : ""}`;
    }
  } catch {
    hiddenTestsValid = false;
    hiddenTestsMessage = "Failed to verify hidden evaluation test cases.";
  }

  checks.push({
    id: "hidden_test_cases_valid",
    label: "Evaluation Test Cases & Test Suite",
    required: true,
    passed: hiddenTestsValid,
    currentValue: hiddenTestsValid ? "Configured" : "Missing Cases",
    expectedValue: ">= 1 test case per problem",
    details: hiddenTestsMessage,
  });

  // Check 7: Parameter validity
  const paramsValid =
    settings.phase1_duration_minutes >= 5 &&
    settings.phase1_duration_minutes <= 180 &&
    settings.phase2_duration_minutes >= 5 &&
    settings.phase2_duration_minutes <= 180 &&
    settings.fullscreen_warning_threshold >= 1 &&
    settings.fullscreen_warning_threshold <= 10 &&
    Boolean(settings.competition_name?.trim()) &&
    Boolean(settings.college_name?.trim()) &&
    Boolean(settings.contact_email?.includes("@"));

  checks.push({
    id: "settings_valid",
    label: "Competition Parameters & Timers",
    required: true,
    passed: paramsValid,
    currentValue: paramsValid ? "Valid" : "Invalid",
    expectedValue: "Phase 1: 5-180m, Phase 2: 5-180m, Warnings: 1-10",
    details: paramsValid
      ? `Phase 1: ${settings.phase1_duration_minutes}m | Phase 2: ${settings.phase2_duration_minutes}m | Max Strikes: ${settings.fullscreen_warning_threshold}.`
      : "One or more parameters violate range constraints. Check settings.",
  });

  const passedRequired = checks.filter((c) => c.required && c.passed).length;
  const totalRequired = checks.filter((c) => c.required).length;
  const canStart = passedRequired === totalRequired;

  return {
    canStart,
    canMarkReady: canStart,
    checks,
    summary: {
      passedCount: passedRequired,
      totalRequired,
      totalChecks: checks.length,
    },
  };
}

/**
 * Updates competition settings with validation, active session safety guards, and audit trail.
 */
export async function updateCompetitionSettings(
  updates: Partial<CompetitionSettingsDTO>,
  actor: { id?: string; email: string },
  options?: { forceEmergencyBypass?: boolean; justification?: string }
): Promise<CompetitionSettingsDTO> {
  const current = await getCompetitionSettings();

  // Range validation
  if (updates.phase1_duration_minutes !== undefined) {
    if (
      typeof updates.phase1_duration_minutes !== "number" ||
      updates.phase1_duration_minutes < 5 ||
      updates.phase1_duration_minutes > 180
    ) {
      throw new Error("Phase 1 duration must be a valid number between 5 and 180 minutes.");
    }
  }

  if (updates.phase2_duration_minutes !== undefined) {
    if (
      typeof updates.phase2_duration_minutes !== "number" ||
      updates.phase2_duration_minutes < 5 ||
      updates.phase2_duration_minutes > 180
    ) {
      throw new Error("Phase 2 duration must be a valid number between 5 and 180 minutes.");
    }
  }

  if (updates.fullscreen_warning_threshold !== undefined) {
    if (
      typeof updates.fullscreen_warning_threshold !== "number" ||
      updates.fullscreen_warning_threshold < 1 ||
      updates.fullscreen_warning_threshold > 10
    ) {
      throw new Error("Fullscreen warning threshold must be between 1 and 10 strikes.");
    }
  }

  if (updates.competition_name !== undefined && !updates.competition_name.trim()) {
    throw new Error("Competition title cannot be empty.");
  }

  if (updates.college_name !== undefined && !updates.college_name.trim()) {
    throw new Error("Institution name cannot be empty.");
  }

  if (updates.contact_email !== undefined) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(updates.contact_email.trim())) {
      throw new Error("Please provide a valid contact email address.");
    }
  }

  if (updates.eligible_coding_categories !== undefined) {
    const validCats: CodingCategory[] = ["C", "C++", "Java", "Python", "Web Development", "DSA"];
    if (
      !Array.isArray(updates.eligible_coding_categories) ||
      updates.eligible_coding_categories.length === 0 ||
      updates.eligible_coding_categories.some((c) => !validCats.includes(c))
    ) {
      throw new Error("Eligible coding categories must contain at least one valid track.");
    }
  }

  // ACTIVE EXAM SAFETY GUARD
  const activeExams = await getActiveExamsCount();
  const isAlteringCriticalParams =
    (updates.phase1_duration_minutes !== undefined &&
      updates.phase1_duration_minutes !== current.phase1_duration_minutes) ||
    (updates.phase2_duration_minutes !== undefined &&
      updates.phase2_duration_minutes !== current.phase2_duration_minutes) ||
    (updates.fullscreen_warning_threshold !== undefined &&
      updates.fullscreen_warning_threshold !== current.fullscreen_warning_threshold) ||
    (updates.eligible_coding_categories !== undefined &&
      JSON.stringify(updates.eligible_coding_categories) !==
        JSON.stringify(current.eligible_coding_categories));

  if (activeExams > 0 && isAlteringCriticalParams) {
    if (!options?.forceEmergencyBypass) {
      throw new Error(
        `ACTIVE_EXAM_PROTECTION: Cannot modify examination durations, warning thresholds, or coding tracks while ${activeExams} student attempt(s) are actively in progress. Wait for attempts to complete or submit.`
      );
    }
    if (!options.justification || options.justification.trim().length < 10) {
      throw new Error(
        "Emergency bypass requires an explicit justification of at least 10 characters."
      );
    }

    await logAuditEvent({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "EMERGENCY_SETTINGS_OVERRIDE",
      targetResource: `competition_settings:${current.id}`,
      details: {
        activeExams,
        justification: options.justification,
        intendedUpdates: updates,
      },
    });
  }

  const nowIso = new Date().toISOString();
  const merged: CompetitionSettingsDTO = {
    ...current,
    ...updates,
    updated_at: nowIso,
  };

  // Sync results_published if explicitly set
  if (updates.results_published !== undefined && updates.results_published !== current.results_published) {
    await publishResults(updates.results_published);
  }

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const dbUpdatePayload: Record<string, any> = {
      updated_at: nowIso,
    };
    if (updates.status !== undefined) dbUpdatePayload.status = updates.status;
    if (updates.registration_status !== undefined) dbUpdatePayload.registration_status = updates.registration_status;
    if (updates.competition_name !== undefined) dbUpdatePayload.competition_name = updates.competition_name;
    if (updates.college_name !== undefined) dbUpdatePayload.college_name = updates.college_name;
    if (updates.college_logo_url !== undefined) dbUpdatePayload.college_logo_url = updates.college_logo_url;
    if (updates.competition_date !== undefined) dbUpdatePayload.competition_date = updates.competition_date;
    if (updates.phase1_duration_minutes !== undefined) dbUpdatePayload.phase1_duration_minutes = updates.phase1_duration_minutes;
    if (updates.phase2_duration_minutes !== undefined) dbUpdatePayload.phase2_duration_minutes = updates.phase2_duration_minutes;
    if (updates.fullscreen_warning_threshold !== undefined) dbUpdatePayload.fullscreen_warning_threshold = updates.fullscreen_warning_threshold;
    if (updates.eligible_coding_categories !== undefined) dbUpdatePayload.eligible_coding_categories = updates.eligible_coding_categories;
    if (updates.results_published !== undefined) dbUpdatePayload.results_published = updates.results_published;
    if (updates.participant_instructions !== undefined) dbUpdatePayload.participant_instructions = updates.participant_instructions;
    if (updates.contact_email !== undefined) dbUpdatePayload.contact_email = updates.contact_email;
    if (updates.contact_phone !== undefined) dbUpdatePayload.contact_phone = updates.contact_phone;

    // Update ALL rows in the singleton competition_settings table so no stale rows survive
    const { data: updatedRows, error: updateError } = await admin
      .from("competition_settings")
      .update(dbUpdatePayload)
      .not("id", "is", null)
      .select();

    if (updateError) {
      console.error("Critical error updating competition_settings in Supabase:", updateError);
      throw new Error(`Database error updating competition status: ${updateError.message}`);
    }

    if (!updatedRows || updatedRows.length === 0) {
      // If table was completely empty, insert initial record
      const { data: insertedRow, error: insertError } = await admin
        .from("competition_settings")
        .insert({
          ...DEFAULT_COMPETITION_SETTINGS,
          ...dbUpdatePayload,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Critical error inserting competition_settings in Supabase:", insertError);
        throw new Error(`Database error initializing competition status: ${insertError.message}`);
      }
      if (insertedRow) {
        merged.id = insertedRow.id;
      }
    }
  }

  // Always keep in-memory global store in sync
  global.__lnmcbm_local_competition_settings__ = { ...merged };

  await logAuditEvent({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "SETTINGS_UPDATED",
    targetResource: `competition_settings:${current.id}`,
    details: {
      changedFields: Object.keys(updates),
      newSettings: {
        competition_name: merged.competition_name,
        status: merged.status,
        phase1_duration_minutes: merged.phase1_duration_minutes,
        phase2_duration_minutes: merged.phase2_duration_minutes,
        fullscreen_warning_threshold: merged.fullscreen_warning_threshold,
      },
    },
  });

  return merged;
}

/**
 * Transitions the competition state with transition model validation, preflight checks, and audit logging.
 */
export async function transitionCompetitionStatus(
  targetStatus: CompetitionStatus,
  actor: { id?: string; email: string },
  options?: { force?: boolean; justification?: string }
): Promise<CompetitionSettingsDTO> {
  const current = await getCompetitionSettings();
  const currentStatus = current.status;

  if (currentStatus === targetStatus) {
    return current; // Idempotent
  }

  const allowed = ALLOWED_STATE_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus) && !options?.force) {
    throw new Error(
      `INVALID_STATE_TRANSITION: Cannot transition competition state from '${currentStatus}' to '${targetStatus}'. Allowed transitions: ${allowed.join(", ") || "none"}.`
    );
  }

  // Preflight check enforcement when marking ready or starting
  if ((targetStatus === "ready" || targetStatus === "in_progress") && !options?.force) {
    const preflight = await checkCompetitionPreflight();
    if (!preflight.canStart) {
      const failing = preflight.checks.filter((c) => c.required && !c.passed).map((c) => c.label);
      throw new Error(
        `PREFLIGHT_CHECK_FAILED: Cannot mark competition '${targetStatus}'. Preflight requirements not met: ${failing.join("; ")}.`
      );
    }
  }

  // Side-effect: sync registration_status
  let regStatus: "open" | "closed" = current.registration_status;
  if (targetStatus === "registration_open") {
    regStatus = "open";
  } else if (
    targetStatus === "registration_closed" ||
    targetStatus === "ready" ||
    targetStatus === "in_progress"
  ) {
    regStatus = "closed";
  }

  // Side-effect: sync results_published
  let resultsPublished = current.results_published;
  if (targetStatus === "results_published") {
    resultsPublished = true;
    await publishResults(true);
  } else if (currentStatus === "results_published" && targetStatus === "completed") {
    resultsPublished = false;
    await publishResults(false);
  }

  const updated = await updateCompetitionSettings(
    {
      status: targetStatus,
      registration_status: regStatus,
      results_published: resultsPublished,
    },
    actor,
    { forceEmergencyBypass: options?.force, justification: options?.justification }
  );

  await logAuditEvent({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "STATE_TRANSITION",
    targetResource: `competition_settings:${current.id}`,
    details: {
      fromStatus: currentStatus,
      toStatus: targetStatus,
      forced: Boolean(options?.force),
      justification: options?.justification || null,
    },
  });

  return updated;
}

/**
 * Emergency Halt action to immediately freeze competition access.
 */
export async function emergencyHaltCompetition(
  actor: { id?: string; email: string },
  justification: string
): Promise<CompetitionSettingsDTO> {
  if (!justification || justification.trim().length < 10) {
    throw new Error("Emergency halt requires an explicit reason of at least 10 characters.");
  }

  const current = await getCompetitionSettings();

  const updated = await updateCompetitionSettings(
    {
      status: "completed",
      registration_status: "closed",
    },
    actor,
    { forceEmergencyBypass: true, justification }
  );

  await logAuditEvent({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "EMERGENCY_COMPETITION_HALT",
    targetResource: `competition_settings:${current.id}`,
    details: {
      previousStatus: current.status,
      justification,
    },
  });

  return updated;
}
