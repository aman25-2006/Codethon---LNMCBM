/**
 * LNMCBM College Coding Competition Portal
 * Phase G: Student Examination & Session Management Service
 *
 * Responsibilities:
 * 1. Server-authoritative exam lifecycle & session creation.
 * 2. 45-Minute deadline enforcement & timer stability across browser refreshes.
 * 3. Per-attempt randomized question & option delivery.
 * 4. Resilient answer persistence (debounced autosave, race condition prevention).
 * 5. Server-side trusted scoring with strict answer key & score secrecy (hidden from students).
 * 6. Academic integrity & fullscreen / tab-switch monitoring.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { getDeterministicExamQuestions } from "./exam-randomizer";
import { StudentSafeQuestion, getQuestions, MCQCategory, CATEGORY_SPECS } from "./questions-service";
import {
  CodingCategory,
  DSALanguage,
  StudentSafeCodingProblem,
  getAssignedProblemsForTrack,
  CATEGORY_METADATA,
  getProblemWithHiddenTestCases,
  getProblemById,
} from "./coding-problems-service";
import {
  runSampleTest,
  evaluateHiddenTestCases,
  checkRunRateLimit,
  getStarterTemplate,
  SampleRunResponse,
  HiddenEvaluationSummary,
} from "./code-execution-service";
import { StudentRecord, getStudents, getStudentById } from "./students-service";
import { AdminResultItemDTO, PublicScorecardDTO, VerificationResultDTO } from "@/types";
import { getCompetitionSettings } from "./settings-service";

export const DEFAULT_WARNING_THRESHOLD = 3;
export const MONITORING_DEDUPLICATION_WINDOW_MS = 3500;

export interface MonitoringSessionSummary {
  sessionId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  participantId: string;
  course: string;
  email: string;
  currentPhase: 1 | 2;
  status: ExamSessionRecord["status"];
  warningsCount: number;
  isTerminated: boolean;
  terminationReason: string | null;
  lastActivityAt: string;
  phase1SubmittedAt: string | null;
  phase2SubmittedAt: string | null;
  phase2Category: string | null;
  phase2Language: string | null;
  totalViolations: number;
}

export interface MonitoringTelemetrySummary {
  totalCandidates: number;
  activeInProgress: number;
  warnedCandidates: number;
  terminatedCandidates: number;
  cleanCandidates: number;
}

export interface MonitoringEventRecord {
  id: string;
  session_id: string;
  student_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ExamSessionRecord {
  id: string;
  student_id: string;
  competition_id: string | null;
  current_phase: 1 | 2;
  status:
    | "not_started"
    | "phase1_in_progress"
    | "phase1_completed"
    | "phase2_in_progress"
    | "phase2_completed"
    | "terminated";
  phase1_started_at: string | null;
  phase1_expires_at: string | null;
  phase1_submitted_at: string | null;
  phase2_category: string | null;
  phase2_language: string | null;
  phase2_started_at: string | null;
  phase2_expires_at: string | null;
  phase2_submitted_at: string | null;
  is_terminated: boolean;
  termination_reason: string | null;
  fullscreen_warnings_count: number;
  last_activity_at: string;
  created_at: string;
}

export interface SavedCandidateAnswer {
  question_id: string;
  selected_option_id: string | null;
  selected_option_key: string | null;
  is_marked_for_review: boolean;
  saved_at: string;
}

export interface StudentExamSessionState {
  session: ExamSessionRecord;
  serverTime: string;
  remainingSeconds: number;
  isExpired: boolean;
  questions: StudentSafeQuestion[];
  answers: Record<string, SavedCandidateAnswer>;
  paletteSummary: {
    answered: number;
    unanswered: number;
    markedForReview: number;
    total: number;
  };
  track?: string;
  language?: string | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __lnmcbm_local_exam_sessions__: ExamSessionRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __lnmcbm_local_exam_answers__: Record<string, Record<string, SavedCandidateAnswer>> | undefined;
  // eslint-disable-next-line no-var
  var __lnmcbm_local_final_results__: Array<{
    id: string;
    student_id: string;
    session_id: string;
    phase1_score: number;
    coding_q1_score: number;
    coding_q2_score: number;
    total_score: number;
    rank?: number | null;
    is_finalized: boolean;
    is_published: boolean;
    verification_id: string;
    finalized_at: string | null;
    created_at: string;
    updated_at?: string;
  }> | undefined;
  // eslint-disable-next-line no-var
  var __lnmcbm_local_monitoring_events__: Array<{
    id: string;
    session_id: string;
    student_id: string;
    event_type: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }> | undefined;
  // eslint-disable-next-line no-var
  var __lnmcbm_local_coding_submissions__: Array<{
    id: string;
    session_id: string;
    problem_id: string;
    source_code: string;
    selected_language: string;
    submission_type: "run" | "final_submit";
    is_final: boolean;
    created_at: string;
  }> | undefined;
  // eslint-disable-next-line no-var
  var __lnmcbm_local_submission_evaluations__: Array<{
    id: string;
    submission_id: string;
    evaluation_status: "pending" | "evaluating" | "completed" | "error";
    passed_test_cases: number;
    awarded_marks: number;
    execution_summary: unknown;
    evaluated_at: string;
  }> | undefined;
  // eslint-disable-next-line no-var
  var __lnmcbm_local_coding_drafts__: Record<string, Record<string, { source_code: string; language: string; updated_at: string }>> | undefined;
  // eslint-disable-next-line no-var
  var __lnmcbm_last_monitoring_timestamps__: Map<string, number> | undefined;
}

function getMonitoringTimestampsMap(): Map<string, number> {
  if (!global.__lnmcbm_last_monitoring_timestamps__) {
    global.__lnmcbm_last_monitoring_timestamps__ = new Map();
  }
  return global.__lnmcbm_last_monitoring_timestamps__;
}

function getLocalSessionsStore(): ExamSessionRecord[] {
  if (!global.__lnmcbm_local_exam_sessions__) {
    global.__lnmcbm_local_exam_sessions__ = [];
  }
  return global.__lnmcbm_local_exam_sessions__;
}

function getLocalAnswersStore(): Record<string, Record<string, SavedCandidateAnswer>> {
  if (!global.__lnmcbm_local_exam_answers__) {
    global.__lnmcbm_local_exam_answers__ = {};
  }
  return global.__lnmcbm_local_exam_answers__;
}

function getLocalResultsStore() {
  if (!global.__lnmcbm_local_final_results__) {
    global.__lnmcbm_local_final_results__ = [];
  }
  return global.__lnmcbm_local_final_results__;
}

function getLocalMonitoringStore() {
  if (!global.__lnmcbm_local_monitoring_events__) {
    global.__lnmcbm_local_monitoring_events__ = [];
  }
  return global.__lnmcbm_local_monitoring_events__;
}

function getLocalCodingSubmissionsStore() {
  if (!global.__lnmcbm_local_coding_submissions__) {
    global.__lnmcbm_local_coding_submissions__ = [];
  }
  return global.__lnmcbm_local_coding_submissions__;
}

function getLocalSubmissionEvaluationsStore() {
  if (!global.__lnmcbm_local_submission_evaluations__) {
    global.__lnmcbm_local_submission_evaluations__ = [];
  }
  return global.__lnmcbm_local_submission_evaluations__;
}

function getLocalCodingDraftsStore(): Record<string, Record<string, { source_code: string; language: string; updated_at: string }>> {
  if (!global.__lnmcbm_local_coding_drafts__) {
    global.__lnmcbm_local_coding_drafts__ = {};
  }
  return global.__lnmcbm_local_coding_drafts__;
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
 * Phase 1 Duration: Exactly 45 minutes in milliseconds.
 */
export const PHASE_1_DURATION_MS = 45 * 60 * 1000;

/**
 * Retrieves the current exam session for a student, or null if not yet started.
 */
export async function getStudentSession(studentId: string): Promise<ExamSessionRecord | null> {
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("exam_sessions")
      .select("*")
      .eq("student_id", studentId)
      .maybeSingle();

    if (error || !data) return null;
    return data as ExamSessionRecord;
  }

  const store = getLocalSessionsStore();
  return store.find((s) => s.student_id === studentId) || null;
}

/**
 * Starts Phase 1 examination or resumes an existing active attempt.
 * Enforces:
 * 1. Timer idempotency: Repeated calls or browser refreshes NEVER reset the 45-minute deadline.
 * 2. Inactive account or terminated session rejection.
 * 3. Already completed Phase 1 detection.
 * 4. Language track assignment (C, C++, Java, Python, Web Development, DSA).
 */
export async function startOrResumePhase1(
  studentId: string,
  requestedTrack?: string,
  requestedLanguage?: string
): Promise<StudentExamSessionState> {
  const now = new Date();
  const nowIso = now.toISOString();

  let session = await getStudentSession(studentId);

  const selectedTrack = requestedTrack || session?.phase2_category || "C";
  const selectedLang =
    requestedLanguage ||
    session?.phase2_language ||
    (selectedTrack === "Web Development" ? "JavaScript" : selectedTrack);

  if (!session) {
    // Create new exam session
    const compSettings = await getCompetitionSettings();
    const durationMin = compSettings?.phase1_duration_minutes || 45;
    const expiresAt = new Date(now.getTime() + durationMin * 60 * 1000).toISOString();

    if (isSupabaseLive()) {
      const admin = createAdminClient();

      // Find active competition settings
      const { data: comp } = await admin
        .from("competition_settings")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data, error } = await admin
        .from("exam_sessions")
        .insert({
          student_id: studentId,
          competition_id: comp?.id || null,
          current_phase: 1,
          status: "phase1_in_progress",
          phase1_started_at: nowIso,
          phase1_expires_at: expiresAt,
          phase2_category: selectedTrack,
          phase2_language: selectedLang,
          last_activity_at: nowIso,
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(`Failed to initialize exam session: ${error?.message}`);
      }
      session = data as ExamSessionRecord;
    } else {
      const newSession: ExamSessionRecord = {
        id: `sess-${studentId}-${Date.now()}`,
        student_id: studentId,
        competition_id: "comp-lnmcbm-2026",
        current_phase: 1,
        status: "phase1_in_progress",
        phase1_started_at: nowIso,
        phase1_expires_at: expiresAt,
        phase1_submitted_at: null,
        phase2_category: selectedTrack,
        phase2_language: selectedLang,
        phase2_started_at: null,
        phase2_expires_at: null,
        phase2_submitted_at: null,
        is_terminated: false,
        termination_reason: null,
        fullscreen_warnings_count: 0,
        last_activity_at: nowIso,
        created_at: nowIso,
      };
      getLocalSessionsStore().push(newSession);
      session = newSession;
    }
  } else {
    // Existing session checks
    if (session.is_terminated) {
      throw new Error(`EXAM_TERMINATED: Examination access terminated: ${session.termination_reason || "Violation of rules"}`);
    }

    // Check if Phase 1 has expired
    if (
      session.status === "phase1_in_progress" &&
      session.phase1_expires_at &&
      new Date(session.phase1_expires_at).getTime() <= now.getTime()
    ) {
      // Auto-submit expired Phase 1
      await submitPhase1Exam(studentId);
      session = (await getStudentSession(studentId))!;
    } else if (
      requestedTrack &&
      session.status === "phase1_in_progress" &&
      session.phase2_category !== requestedTrack
    ) {
      // Candidate specifically updated their chosen track
      session.phase2_category = requestedTrack;
      session.phase2_language = selectedLang;

      if (isSupabaseLive()) {
        const admin = createAdminClient();
        await admin
          .from("exam_sessions")
          .update({
            phase2_category: requestedTrack,
            phase2_language: selectedLang,
            last_activity_at: nowIso,
          })
          .eq("id", session.id);

        // Delete any old answers for mismatched questions if track changed
        await admin.from("mcq_answers").delete().eq("session_id", session.id);
      } else {
        const store = getLocalAnswersStore();
        store[session.id] = {};
      }
    }
  }

  return await getFullStudentExamState(studentId, session);
}

/**
 * Builds the complete student-safe exam state, including questions, saved answers, and remaining time.
 */
export async function getFullStudentExamState(
  studentId: string,
  existingSession?: ExamSessionRecord
): Promise<StudentExamSessionState> {
  const session = existingSession || (await getStudentSession(studentId));
  if (!session) {
    throw new Error("No exam session found for candidate.");
  }

  const now = Date.now();
  const expiresAtMs = session.phase1_expires_at ? new Date(session.phase1_expires_at).getTime() : now;
  const remainingSeconds = Math.max(0, Math.floor((expiresAtMs - now) / 1000));
  const isExpired = remainingSeconds === 0 && session.status === "phase1_in_progress";

  // If expired right now, auto-complete
  if (isExpired && session.status === "phase1_in_progress") {
    await submitPhase1Exam(studentId);
    session.status = "phase1_completed";
  }

  // Authoritative track for candidate
  const activeTrack = session.phase2_category || "C";

  // Fetch deterministic student-safe questions (answer keys strictly excluded) for the active track
  const examPayload = await getDeterministicExamQuestions(studentId, {
    shuffleOptions: true,
    track: activeTrack,
  });

  // Fetch saved candidate answers
  const answersMap: Record<string, SavedCandidateAnswer> = {};

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data: rawAnswers } = await admin
      .from("mcq_answers")
      .select("question_id, selected_option_id, selected_option_key, is_marked_for_review, saved_at")
      .eq("session_id", session.id);

    (rawAnswers || []).forEach((row: any) => {
      answersMap[row.question_id] = {
        question_id: row.question_id,
        selected_option_id: row.selected_option_id,
        selected_option_key: row.selected_option_key,
        is_marked_for_review: row.is_marked_for_review,
        saved_at: row.saved_at,
      };
    });
  } else {
    const store = getLocalAnswersStore();
    const sessionAnswers = store[session.id] || {};
    Object.assign(answersMap, sessionAnswers);
  }

  // Calculate palette summary
  let answeredCount = 0;
  let markedCount = 0;

  examPayload.questions.forEach((q) => {
    const ans = answersMap[q.id];
    if (ans?.selected_option_key || ans?.selected_option_id) {
      answeredCount++;
    }
    if (ans?.is_marked_for_review) {
      markedCount++;
    }
  });

  return {
    session,
    serverTime: new Date().toISOString(),
    remainingSeconds,
    isExpired: remainingSeconds === 0,
    questions: examPayload.questions,
    answers: answersMap,
    paletteSummary: {
      answered: answeredCount,
      unanswered: examPayload.questions.length - answeredCount,
      markedForReview: markedCount,
      total: examPayload.questions.length,
    },
    track: activeTrack,
    language: session.phase2_language,
  };
}

/**
 * Persists an individual candidate answer safely to the server.
 * Validates that the session is in progress and the 45-minute timer has not expired.
 */
export async function saveCandidateAnswer(
  studentId: string,
  payload: {
    question_id: string;
    selected_option_id?: string | null;
    selected_option_key?: string | null;
    is_marked_for_review?: boolean;
    question_order_index?: number;
  }
): Promise<{ success: boolean; savedAt: string }> {
  const session = await getStudentSession(studentId);
  if (!session) {
    throw new Error("No active exam session found.");
  }

  if (session.is_terminated) {
    throw new Error(
      `EXAM_TERMINATED: Examination access has been terminated: ${session.termination_reason || "Integrity policy violation."}`
    );
  }

  if (session.status !== "phase1_in_progress") {
    throw new Error(`Cannot save answer: Phase 1 is already in '${session.status}' status.`);
  }

  const now = Date.now();
  if (session.phase1_expires_at && new Date(session.phase1_expires_at).getTime() < now) {
    // Auto-complete and reject further answers
    await submitPhase1Exam(studentId);
    throw new Error("EXAM_EXPIRED: Phase 1 time has elapsed. Your answers have been automatically submitted.");
  }

  const savedAt = new Date().toISOString();

  if (isSupabaseLive()) {
    const admin = createAdminClient();

    const upsertPayload: Record<string, unknown> = {
      session_id: session.id,
      question_id: payload.question_id,
      selected_option_id: payload.selected_option_id || null,
      selected_option_key: payload.selected_option_key || null,
      is_marked_for_review: payload.is_marked_for_review ?? false,
      question_order_index: payload.question_order_index ?? 0,
      saved_at: savedAt,
    };

    const { error } = await admin
      .from("mcq_answers")
      .upsert(upsertPayload, { onConflict: "session_id,question_id" });

    if (error) {
      throw new Error(`Failed to save answer: ${error.message}`);
    }

    // Update last activity
    await admin
      .from("exam_sessions")
      .update({ last_activity_at: savedAt })
      .eq("id", session.id);
  } else {
    const store = getLocalAnswersStore();
    if (!store[session.id]) store[session.id] = {};

    store[session.id][payload.question_id] = {
      question_id: payload.question_id,
      selected_option_id: payload.selected_option_id || null,
      selected_option_key: payload.selected_option_key || null,
      is_marked_for_review: payload.is_marked_for_review ?? false,
      saved_at: savedAt,
    };

    session.last_activity_at = savedAt;
  }

  return { success: true, savedAt };
}

/**
 * Concludes Phase 1 examination, calculates the candidate's score securely server-side,
 * and persists the result.
 *
 * CRITICAL SECURITY MANDATE:
 * 1. Score is kept strictly confidential/hidden from the candidate.
 * 2. Response only confirms phase completion and readiness for Phase 2.
 */
export async function submitPhase1Exam(studentId: string): Promise<{
  success: boolean;
  phase: number;
  completed: boolean;
  nextPhase: number;
}> {
  const session = await getStudentSession(studentId);
  if (!session) {
    throw new Error("No active exam session found.");
  }

  if (session.is_terminated) {
    throw new Error(
      `EXAM_TERMINATED: Examination access has been terminated: ${session.termination_reason || "Integrity policy violation."}`
    );
  }

  if (session.status !== "phase1_in_progress") {
    // Already submitted / completed
    return {
      success: true,
      phase: 1,
      completed: true,
      nextPhase: 2,
    };
  }

  const submittedAt = new Date().toISOString();

  // Retrieve all questions with authoritative answer keys from server
  const { questions: allQuestions } = await getQuestions();
  const activeQuestionsMap = new Map(allQuestions.map((q) => [q.id, q]));

  // Retrieve student's saved answers
  let candidateAnswers: SavedCandidateAnswer[] = [];

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("mcq_answers")
      .select("question_id, selected_option_id, selected_option_key, is_marked_for_review, saved_at")
      .eq("session_id", session.id);
    candidateAnswers = (data || []) as SavedCandidateAnswer[];
  } else {
    const store = getLocalAnswersStore();
    candidateAnswers = Object.values(store[session.id] || {});
  }

  // Calculate score strictly on the server
  let phase1Score = 0;
  const categoryScores: Record<MCQCategory, number> = {
    Fundamentals: 0,
    "Technical Understanding": 0,
    "Logic and Debugging": 0,
    "Case Study": 0,
  };

  candidateAnswers.forEach((ans) => {
    const question = activeQuestionsMap.get(ans.question_id);
    if (!question) return;

    // Check if candidate's chosen option matches the authoritative correct answer
    const isCorrectById =
      ans.selected_option_id &&
      question.correct_option_id &&
      ans.selected_option_id === question.correct_option_id;

    const isCorrectByKey =
      ans.selected_option_key &&
      question.correct_option_key &&
      ans.selected_option_key.toUpperCase() === question.correct_option_key.toUpperCase();

    if (isCorrectById || isCorrectByKey) {
      const marksAwarded = question.marks || CATEGORY_SPECS[question.category]?.marksEach || 1;
      phase1Score += marksAwarded;
      if (categoryScores[question.category] !== undefined) {
        categoryScores[question.category] += marksAwarded;
      }
    }
  });

  // Clamp Phase 1 score to maximum 80
  phase1Score = Math.min(80, Math.max(0, phase1Score));

  // Persist update in database
  if (isSupabaseLive()) {
    const admin = createAdminClient();

    // 1. Update session status
    await admin
      .from("exam_sessions")
      .update({
        status: "phase1_completed",
        phase1_submitted_at: submittedAt,
        last_activity_at: submittedAt,
      })
      .eq("id", session.id);

    // 2. Persist in final_results table
    const verificationId = generateVerificationId(studentId);

    await admin.from("final_results").upsert(
      {
        student_id: studentId,
        session_id: session.id,
        phase1_score: phase1Score,
        coding_q1_score: 0,
        coding_q2_score: 0,
        total_score: phase1Score,
        verification_id: verificationId,
        is_finalized: false,
        is_published: false,
      },
      { onConflict: "student_id" }
    );
  } else {
    session.status = "phase1_completed";
    session.phase1_submitted_at = submittedAt;
    session.last_activity_at = submittedAt;

    const resultsStore = getLocalResultsStore();
    const existingResult = resultsStore.find((r) => r.student_id === studentId);
    if (existingResult) {
      existingResult.phase1_score = phase1Score;
      existingResult.total_score = phase1Score;
    } else {
      resultsStore.push({
        id: `res-${studentId}`,
        student_id: studentId,
        session_id: session.id,
        phase1_score: phase1Score,
        coding_q1_score: 0,
        coding_q2_score: 0,
        total_score: phase1Score,
        is_finalized: false,
        is_published: false,
        rank: null,
        finalized_at: null,
        verification_id: generateVerificationId(studentId),
        created_at: submittedAt,
      });
    }
  }

  // Return strictly safe completion metadata (NO score, NO answers)
  return {
    success: true,
    phase: 1,
    completed: true,
    nextPhase: 2,
  };
}

/**
 * Records an integrity monitoring event (fullscreen exit, tab switch, etc.)
 * Strictly enforces:
 * 1. Deduplication window (3.5s) to avoid multi-strike penalties from single OS actions.
 * 2. Only fullscreen_exit increments formal warning strike counter.
 * 3. Default 3-strike threshold triggering immediate, permanent session termination.
 * 4. Comprehensive audit event logging for invigilator review.
 */
export async function recordMonitoringEvent(
  studentId: string,
  eventType:
    | "fullscreen_exit"
    | "window_blur"
    | "tab_switch"
    | "devtools_open"
    | "warning_acknowledged"
    | "technical_exception_granted",
  metadata?: Record<string, unknown>
): Promise<{
  warningsCount: number;
  isTerminated: boolean;
  remainingStrikes: number;
  threshold: number;
  deduplicated?: boolean;
  terminationReason?: string | null;
}> {
  const session = await getStudentSession(studentId);
  if (!session) {
    return {
      warningsCount: 0,
      isTerminated: false,
      remainingStrikes: DEFAULT_WARNING_THRESHOLD,
      threshold: DEFAULT_WARNING_THRESHOLD,
    };
  }

  // If already terminated, return terminated state immediately
  if (session.is_terminated) {
    return {
      warningsCount: session.fullscreen_warnings_count || DEFAULT_WARNING_THRESHOLD,
      isTerminated: true,
      remainingStrikes: 0,
      threshold: DEFAULT_WARNING_THRESHOLD,
      deduplicated: false,
      terminationReason: session.termination_reason,
    };
  }

  const now = Date.now();
  const dedupKey = `${studentId}:${eventType}`;
  const timestamps = getMonitoringTimestampsMap();
  const lastTimestamp = timestamps.get(dedupKey) || 0;
  const isDeduplicated =
    metadata?.bypass_dedup !== true &&
    now - lastTimestamp < MONITORING_DEDUPLICATION_WINDOW_MS;

  timestamps.set(dedupKey, now);

  if (isDeduplicated) {
    return {
      warningsCount: session.fullscreen_warnings_count || 0,
      isTerminated: Boolean(session.is_terminated),
      remainingStrikes: Math.max(
        0,
        DEFAULT_WARNING_THRESHOLD - (session.fullscreen_warnings_count || 0)
      ),
      threshold: DEFAULT_WARNING_THRESHOLD,
      deduplicated: true,
      terminationReason: session.termination_reason,
    };
  }

  let warnings = session.fullscreen_warnings_count || 0;
  let isTerminated = Boolean(session.is_terminated);
  let terminationReason = session.termination_reason;

  // Strict Policy: Only fullscreen_exit increments the formal strike count
  if (eventType === "fullscreen_exit") {
    warnings += 1;
    session.fullscreen_warnings_count = warnings;
    if (warnings >= DEFAULT_WARNING_THRESHOLD) {
      isTerminated = true;
      terminationReason = `Exceeded maximum permissible fullscreen exit violations (${warnings}/${DEFAULT_WARNING_THRESHOLD}).`;
      session.is_terminated = true;
      session.termination_reason = terminationReason;
      session.status = "terminated";
    }
  }

  const nowIso = new Date(now).toISOString();

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    await admin.from("monitoring_events").insert({
      session_id: session.id,
      student_id: studentId,
      event_type: eventType,
      metadata: metadata || {},
      created_at: nowIso,
    });

    if (isTerminated && eventType === "fullscreen_exit") {
      await admin.from("monitoring_events").insert({
        session_id: session.id,
        student_id: studentId,
        event_type: "auto_terminated",
        metadata: {
          reason: terminationReason,
          final_warnings_count: warnings,
          threshold: DEFAULT_WARNING_THRESHOLD,
        },
        created_at: nowIso,
      });
    }

    await admin
      .from("exam_sessions")
      .update({
        fullscreen_warnings_count: warnings,
        last_activity_at: nowIso,
        ...(isTerminated
          ? {
              is_terminated: true,
              termination_reason: terminationReason,
              status: "terminated",
            }
          : {}),
      })
      .eq("id", session.id);
  } else {
    session.last_activity_at = nowIso;
    getLocalMonitoringStore().push({
      id: `mon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      session_id: session.id,
      student_id: studentId,
      event_type: eventType,
      metadata: metadata || {},
      created_at: nowIso,
    });

    if (isTerminated && eventType === "fullscreen_exit") {
      getLocalMonitoringStore().push({
        id: `mon-term-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        session_id: session.id,
        student_id: studentId,
        event_type: "auto_terminated",
        metadata: {
          reason: terminationReason,
          final_warnings_count: warnings,
          threshold: DEFAULT_WARNING_THRESHOLD,
        },
        created_at: nowIso,
      });
    }
  }

  return {
    warningsCount: warnings,
    isTerminated,
    remainingStrikes: Math.max(0, DEFAULT_WARNING_THRESHOLD - warnings),
    threshold: DEFAULT_WARNING_THRESHOLD,
    deduplicated: false,
    terminationReason,
  };
}

/**
 * Retrieves all examination sessions with candidate identities and monitoring telemetry summary.
 */
export async function getAllMonitoringSessions(): Promise<{
  sessions: MonitoringSessionSummary[];
  summary: MonitoringTelemetrySummary;
}> {
  let allSessions: ExamSessionRecord[] = [];
  let allStudents: StudentRecord[] = [];
  let allEvents: Array<{ session_id: string; event_type: string }> = [];

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const [sessRes, studRes, evRes] = await Promise.all([
      admin.from("exam_sessions").select("*").order("last_activity_at", { ascending: false }),
      admin.from("students").select("*"),
      admin.from("monitoring_events").select("session_id, event_type"),
    ]);
    allSessions = (sessRes.data || []) as ExamSessionRecord[];
    allStudents = (studRes.data || []) as StudentRecord[];
    allEvents = (evRes.data || []) as Array<{ session_id: string; event_type: string }>;
  } else {
    allSessions = getLocalSessionsStore();
    const { students } = await getStudents();
    allStudents = students;
    allEvents = getLocalMonitoringStore();
  }

  const studentMap = new Map<string, StudentRecord>();
  allStudents.forEach((s) => studentMap.set(s.id, s));

  // Count incidents per session
  const eventCounts = new Map<string, number>();
  allEvents.forEach((ev) => {
    eventCounts.set(ev.session_id, (eventCounts.get(ev.session_id) || 0) + 1);
  });

  const formattedSessions: MonitoringSessionSummary[] = allSessions.map((sess) => {
    const stud = studentMap.get(sess.student_id);
    return {
      sessionId: sess.id,
      studentId: sess.student_id,
      studentName: stud?.full_name || "Unknown Candidate",
      rollNumber: stud?.roll_number || "N/A",
      participantId: stud?.participant_id || "N/A",
      course: stud?.course || "BCA",
      email: stud?.email || "",
      currentPhase: sess.current_phase,
      status: sess.status,
      warningsCount: sess.fullscreen_warnings_count || 0,
      isTerminated: Boolean(sess.is_terminated),
      terminationReason: sess.termination_reason || null,
      lastActivityAt: sess.last_activity_at || sess.created_at,
      phase1SubmittedAt: sess.phase1_submitted_at,
      phase2SubmittedAt: sess.phase2_submitted_at,
      phase2Category: sess.phase2_category,
      phase2Language: sess.phase2_language,
      totalViolations: eventCounts.get(sess.id) || 0,
    };
  });

  const summary: MonitoringTelemetrySummary = {
    totalCandidates: formattedSessions.length,
    activeInProgress: formattedSessions.filter(
      (s) => s.status === "phase1_in_progress" || s.status === "phase2_in_progress"
    ).length,
    warnedCandidates: formattedSessions.filter(
      (s) => s.warningsCount > 0 && !s.isTerminated
    ).length,
    terminatedCandidates: formattedSessions.filter((s) => s.isTerminated).length,
    cleanCandidates: formattedSessions.filter(
      (s) => s.warningsCount === 0 && !s.isTerminated
    ).length,
  };

  return { sessions: formattedSessions, summary };
}

/**
 * Retrieves the complete chronological monitoring timeline for a specific exam session.
 */
export async function getSessionMonitoringTimeline(
  sessionId: string
): Promise<MonitoringEventRecord[]> {
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("monitoring_events")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to load monitoring events: ${error.message}`);
    }
    return (data || []) as MonitoringEventRecord[];
  }

  const store = getLocalMonitoringStore();
  return store
    .filter((e) => e.session_id === sessionId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) as MonitoringEventRecord[];
}

/**
 * Grants an administrative technical exception and restores a candidate's exam attempt.
 * Retains all prior audit and incident logs permanently.
 */
export async function grantTechnicalException(
  adminUser: { id: string; email: string },
  sessionId: string,
  reason: string
): Promise<{ success: boolean; session: ExamSessionRecord; message: string }> {
  if (!reason || !reason.trim()) {
    throw new Error("A clear administrative justification reason is required to grant an exception.");
  }

  let session: ExamSessionRecord | undefined;
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("exam_sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();
    session = (data as ExamSessionRecord) || undefined;
  } else {
    session = getLocalSessionsStore().find((s) => s.id === sessionId);
  }

  if (!session) {
    throw new Error(`Session '${sessionId}' not found.`);
  }

  const priorWarnings = session.fullscreen_warnings_count || 0;
  const priorTerminationReason = session.termination_reason;

  // Determine appropriate restored status based on exam progress
  let restoredStatus: ExamSessionRecord["status"] = "phase1_in_progress";
  if (session.phase2_submitted_at || session.status === "phase2_completed") {
    restoredStatus = "phase2_completed";
  } else if (session.phase1_submitted_at || session.current_phase === 2) {
    restoredStatus = "phase2_in_progress";
  } else {
    restoredStatus = "phase1_in_progress";
  }

  // Grant access with 1 final warning remaining (2 of 3)
  const restoredWarnings = Math.max(0, DEFAULT_WARNING_THRESHOLD - 1);
  const nowIso = new Date().toISOString();

  session.is_terminated = false;
  session.termination_reason = null;
  session.status = restoredStatus;
  session.fullscreen_warnings_count = restoredWarnings;
  session.last_activity_at = nowIso;

  const eventMetadata = {
    reason: reason.trim(),
    granted_by: adminUser.email,
    admin_id: adminUser.id,
    previous_warnings_count: priorWarnings,
    previous_termination_reason: priorTerminationReason,
    restored_status: restoredStatus,
    restored_warnings_count: restoredWarnings,
    restored_at: nowIso,
  };

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    await admin.from("monitoring_events").insert({
      session_id: session.id,
      student_id: session.student_id,
      event_type: "technical_exception_granted",
      metadata: eventMetadata,
      created_at: nowIso,
    });

    await admin
      .from("exam_sessions")
      .update({
        is_terminated: false,
        termination_reason: null,
        status: restoredStatus,
        fullscreen_warnings_count: restoredWarnings,
        last_activity_at: nowIso,
      })
      .eq("id", session.id);
  } else {
    getLocalMonitoringStore().push({
      id: `mon-exc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      session_id: session.id,
      student_id: session.student_id,
      event_type: "technical_exception_granted",
      metadata: eventMetadata,
      created_at: nowIso,
    });
  }

  return {
    success: true,
    session,
    message: `Technical exception approved by ${adminUser.email}. Candidate session restored to '${restoredStatus}'.`,
  };
}

/**
 * Phase 2 Duration: Exactly 30 minutes in milliseconds.
 */
export const PHASE_2_DURATION_MS = 30 * 60 * 1000;

export interface ProblemWorkstate {
  problem_id: string;
  source_code: string;
  language: string;
  is_submitted: boolean;
  submitted_at?: string | null;
  status: "draft" | "submitted";
  last_run_result?: SampleRunResponse | null;
}

export interface Phase2SessionState {
  session: ExamSessionRecord;
  category: CodingCategory;
  language: string;
  problems: StudentSafeCodingProblem[];
  workstates: Record<string, ProblemWorkstate>;
  remainingSeconds: number;
  isExpired: boolean;
  serverTime: string;
}

/**
 * Starts Phase 2 examination or resumes an active attempt.
 * Enforces:
 * 1. Phase 1 must be completed and submitted.
 * 2. Category & Language selection locking (cannot be altered once started).
 * 3. 30-Minute server-authoritative timer idempotency (repeated start calls do not reset timer).
 * 4. Verification that the track has 2 valid problems.
 */
export async function startPhase2(
  studentId: string,
  category: CodingCategory,
  language?: string | null
): Promise<Phase2SessionState> {
  const now = new Date();
  const nowIso = now.toISOString();

  let session = await getStudentSession(studentId);
  if (!session) {
    throw new Error("No exam session found for candidate.");
  }

  if (session.is_terminated) {
    throw new Error(`EXAM_TERMINATED: Examination access terminated: ${session.termination_reason || "Violation of rules"}`);
  }

  if (session.status === "not_started" || session.status === "phase1_in_progress") {
    throw new Error("Phase 1 examination must be completed and submitted before Phase 2 can be initiated.");
  }

  if (session.status === "phase2_completed") {
    throw new Error("Phase 2 examination has already been completed.");
  }

  // If Phase 2 is already in progress, enforce category & language locks
  if (session.status === "phase2_in_progress") {
    if (category && category !== session.phase2_category) {
      throw new Error(
        `Selection Locked: Phase 2 is already locked to track '${session.phase2_category}'. You cannot switch categories after starting.`
      );
    }
    if (
      session.phase2_category === "DSA" &&
      language &&
      language !== session.phase2_language
    ) {
      throw new Error(
        `Selection Locked: DSA language is already locked to '${session.phase2_language}'. You cannot switch languages after starting.`
      );
    }

    // Return existing locked session state (Timer is preserved, never reset!)
    return await getPhase2ExamState(studentId, session);
  }

  // Phase 1 is completed; starting Phase 2 for the first time
  if (!CATEGORY_METADATA[category]) {
    throw new Error(`Invalid coding category '${category}'.`);
  }

  let resolvedLang = language;
  if (category === "DSA") {
    if (!language || !["C", "C++", "Java"].includes(language)) {
      throw new Error("DSA category requires selecting a valid language (C, C++, or Java).");
    }
    resolvedLang = language;
  } else {
    resolvedLang = CATEGORY_METADATA[category].languages[0];
  }

  // Validate track readiness (must have 2 valid problems)
  const problems = await getAssignedProblemsForTrack(category, resolvedLang);

  const compSettings = await getCompetitionSettings();
  const durationMin = compSettings?.phase2_duration_minutes || 30;
  const expiresAt = new Date(now.getTime() + durationMin * 60 * 1000).toISOString();

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("exam_sessions")
      .update({
        current_phase: 2,
        status: "phase2_in_progress",
        phase2_category: category,
        phase2_language: resolvedLang,
        phase2_started_at: nowIso,
        phase2_expires_at: expiresAt,
        last_activity_at: nowIso,
      })
      .eq("id", session.id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to initialize Phase 2 session: ${error?.message}`);
    }
    session = data as ExamSessionRecord;
  } else {
    session.current_phase = 2;
    session.status = "phase2_in_progress";
    session.phase2_category = category;
    session.phase2_language = resolvedLang;
    session.phase2_started_at = nowIso;
    session.phase2_expires_at = expiresAt;
    session.last_activity_at = nowIso;
  }

  const workstates = await buildPhase2Workstates(session.id, category, resolvedLang!, problems);

  return {
    session,
    category,
    language: resolvedLang!,
    problems,
    workstates,
    remainingSeconds: 30 * 60,
    isExpired: false,
    serverTime: nowIso,
  };
}

/**
 * Builds candidate workstates (source code drafts, starter templates, and submission states)
 * for the assigned coding problems.
 */
async function buildPhase2Workstates(
  sessionId: string,
  category: CodingCategory,
  defaultLanguage: string,
  problems: StudentSafeCodingProblem[]
): Promise<Record<string, ProblemWorkstate>> {
  const workstates: Record<string, ProblemWorkstate> = {};

  let finalSubmissions: Array<{
    problem_id: string;
    source_code: string;
    selected_language: string;
    created_at: string;
  }> = [];

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("coding_submissions")
      .select("problem_id, source_code, selected_language, created_at")
      .eq("session_id", sessionId)
      .eq("is_final", true);
    if (data) finalSubmissions = data;
  } else {
    finalSubmissions = getLocalCodingSubmissionsStore().filter(
      (s) => s.session_id === sessionId && s.is_final
    );
  }

  const localDrafts = getLocalCodingDraftsStore()[sessionId] || {};

  for (const prob of problems) {
    const finalSub = finalSubmissions.find((s) => s.problem_id === prob.id);
    if (finalSub) {
      workstates[prob.id] = {
        problem_id: prob.id,
        source_code: finalSub.source_code,
        language: finalSub.selected_language,
        is_submitted: true,
        submitted_at: finalSub.created_at,
        status: "submitted",
      };
      continue;
    }

    const draft = localDrafts[prob.id];
    if (draft) {
      workstates[prob.id] = {
        problem_id: prob.id,
        source_code: draft.source_code,
        language: draft.language || defaultLanguage,
        is_submitted: false,
        status: "draft",
      };
      continue;
    }

    const starterLang = defaultLanguage || prob.programming_language || "python";
    workstates[prob.id] = {
      problem_id: prob.id,
      source_code: getStarterTemplate(starterLang, prob.title),
      language: starterLang,
      is_submitted: false,
      status: "draft",
    };
  }

  return workstates;
}

/**
 * Retrieves the current Phase 2 state, workstates, and assigned problems.
 */
export async function getPhase2ExamState(
  studentId: string,
  existingSession?: ExamSessionRecord
): Promise<Phase2SessionState> {
  let session = existingSession || (await getStudentSession(studentId));
  if (!session) {
    throw new Error("No exam session found for candidate.");
  }

  if (!session.phase2_category) {
    throw new Error("Phase 2 category has not yet been selected.");
  }

  const now = Date.now();
  const expiresAtMs = session.phase2_expires_at ? new Date(session.phase2_expires_at).getTime() : now;
  const remainingSeconds = Math.max(0, Math.floor((expiresAtMs - now) / 1000));
  const isExpired = remainingSeconds === 0 && session.status === "phase2_in_progress";

  if (isExpired && session.status === "phase2_in_progress") {
    await autoSubmitPhase2OnExpiry(studentId);
    session = (await getStudentSession(studentId))!;
  }

  const problems = await getAssignedProblemsForTrack(
    session.phase2_category as CodingCategory,
    session.phase2_language
  );

  const workstates = await buildPhase2Workstates(
    session.id,
    session.phase2_category as CodingCategory,
    session.phase2_language || "Default",
    problems
  );

  return {
    session,
    category: session.phase2_category as CodingCategory,
    language: session.phase2_language || "Default",
    problems,
    workstates,
    remainingSeconds,
    isExpired,
    serverTime: new Date().toISOString(),
  };
}

/**
 * Saves candidate in-progress code buffer for a problem (autosave).
 */
export async function savePhase2Draft(
  studentId: string,
  problemId: string,
  sourceCode: string,
  language: string
): Promise<{ success: boolean; savedAt: string }> {
  const session = await getStudentSession(studentId);
  if (!session) throw new Error("No exam session found.");
  if (session.is_terminated) {
    throw new Error(
      `EXAM_TERMINATED: Examination access has been terminated: ${session.termination_reason || "Integrity policy violation."}`
    );
  }
  if (session.status !== "phase2_in_progress") {
    throw new Error("Phase 2 examination is not currently in progress.");
  }

  // Check if problem is already finalized
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("coding_submissions")
      .select("id")
      .eq("session_id", session.id)
      .eq("problem_id", problemId)
      .eq("is_final", true)
      .maybeSingle();
    if (data) {
      throw new Error("This problem has already been finalized and cannot be modified.");
    }
  } else {
    const store = getLocalCodingSubmissionsStore();
    const existingFinal = store.find(
      (s) => s.session_id === session.id && s.problem_id === problemId && s.is_final
    );
    if (existingFinal) {
      throw new Error("This problem has already been finalized and cannot be modified.");
    }
  }

  const draftsStore = getLocalCodingDraftsStore();
  if (!draftsStore[session.id]) {
    draftsStore[session.id] = {};
  }

  const nowIso = new Date().toISOString();
  draftsStore[session.id][problemId] = {
    source_code: sourceCode,
    language,
    updated_at: nowIso,
  };

  return { success: true, savedAt: nowIso };
}

/**
 * Executes student code against a problem's public sample input.
 * Strictly avoids running hidden test cases and awards zero marks.
 */
export async function runPhase2SampleTest(
  studentId: string,
  problemId: string,
  sourceCode: string,
  language: string
): Promise<SampleRunResponse> {
  const rateLimit = checkRunRateLimit(studentId);
  if (!rateLimit.allowed) {
    const waitSec = Math.ceil((rateLimit.retryAfterMs || 1500) / 1000);
    throw new Error(`Rate limit exceeded: Please wait ${waitSec} second(s) before running code again.`);
  }

  const session = await getStudentSession(studentId);
  if (!session) throw new Error("No exam session found.");
  if (session.is_terminated) {
    throw new Error(
      `EXAM_TERMINATED: Examination access has been terminated: ${session.termination_reason || "Integrity policy violation."}`
    );
  }
  if (session.status !== "phase2_in_progress") {
    throw new Error("Phase 2 examination is not currently in progress.");
  }

  const now = Date.now();
  const expiresAtMs = session.phase2_expires_at ? new Date(session.phase2_expires_at).getTime() : now;
  if (now > expiresAtMs) {
    throw new Error("Phase 2 deadline has expired. Code execution is no longer permitted.");
  }

  const problem = await getProblemById(problemId);
  if (!problem) throw new Error(`Problem not found: ${problemId}`);

  // Autosave draft alongside the run
  await savePhase2Draft(studentId, problemId, sourceCode, language).catch(() => {});

  return await runSampleTest(
    language,
    sourceCode,
    problem.sample_input,
    problem.sample_output,
    problem.time_limit_ms
  );
}

/**
 * Finalizes submission for a single Phase 2 coding problem.
 * Evaluates code against the 5 hidden test cases (2 marks each, total 10 marks).
 * Enforces one submission per problem and locks the code permanently.
 * Score is kept strictly hidden from candidate.
 */
export async function submitPhase2Problem(
  studentId: string,
  problemId: string,
  sourceCode: string,
  language: string
): Promise<{
  success: boolean;
  problem_id: string;
  is_submitted: boolean;
  is_all_problems_submitted: boolean;
  message: string;
}> {
  const session = await getStudentSession(studentId);
  if (!session) throw new Error("No exam session found.");
  if (session.is_terminated) {
    throw new Error(
      `EXAM_TERMINATED: Examination access has been terminated: ${session.termination_reason || "Integrity policy violation."}`
    );
  }
  if (session.status !== "phase2_in_progress") {
    throw new Error("Phase 2 examination is not currently in progress.");
  }

  const now = Date.now();
  const expiresAtMs = session.phase2_expires_at ? new Date(session.phase2_expires_at).getTime() : now;
  if (now > expiresAtMs) {
    throw new Error("Phase 2 deadline has expired. Final submissions are no longer accepted.");
  }

  let alreadySubmitted = false;
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("coding_submissions")
      .select("id")
      .eq("session_id", session.id)
      .eq("problem_id", problemId)
      .eq("is_final", true)
      .maybeSingle();
    alreadySubmitted = Boolean(data);
  } else {
    const store = getLocalCodingSubmissionsStore();
    alreadySubmitted = store.some(
      (s) => s.session_id === session.id && s.problem_id === problemId && s.is_final
    );
  }

  if (alreadySubmitted) {
    throw new Error("A final submission for this problem has already been accepted and locked.");
  }

  const probData = await getProblemWithHiddenTestCases(problemId);
  if (!probData) {
    throw new Error(`Problem '${problemId}' not found in official question bank.`);
  }

  const evalResult = await evaluateHiddenTestCases(
    problemId,
    language,
    sourceCode,
    probData.testCases,
    probData.problem.time_limit_ms
  );

  const submissionId = evalResult.submission_id;
  const nowIso = new Date().toISOString();

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data: subData, error: subErr } = await admin
      .from("coding_submissions")
      .insert({
        session_id: session.id,
        problem_id: problemId,
        source_code: sourceCode,
        selected_language: language,
        submission_type: "final_submit",
        is_final: true,
      })
      .select()
      .single();

    if (subErr || !subData) {
      throw new Error(`Failed to record submission: ${subErr?.message}`);
    }

    await admin.from("submission_evaluations").insert({
      submission_id: subData.id,
      evaluation_status: "completed",
      passed_test_cases: evalResult.passed_test_cases,
      awarded_marks: evalResult.awarded_marks,
      execution_summary: evalResult.test_case_results as any,
      evaluated_at: nowIso,
    });
  } else {
    getLocalCodingSubmissionsStore().push({
      id: submissionId,
      session_id: session.id,
      problem_id: problemId,
      source_code: sourceCode,
      selected_language: language,
      submission_type: "final_submit",
      is_final: true,
      created_at: nowIso,
    });

    getLocalSubmissionEvaluationsStore().push({
      id: `eval-${Date.now()}`,
      submission_id: submissionId,
      evaluation_status: "completed",
      passed_test_cases: evalResult.passed_test_cases,
      awarded_marks: evalResult.awarded_marks,
      execution_summary: evalResult.test_case_results,
      evaluated_at: nowIso,
    });
  }

  // Update final results scorecard
  const assigned = await getAssignedProblemsForTrack(
    session.phase2_category as CodingCategory,
    session.phase2_language
  );
  const isQ1 = assigned[0]?.id === problemId;
  const isQ2 = assigned[1]?.id === problemId;

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const updateField = isQ1 ? { coding_q1_score: evalResult.awarded_marks } : { coding_q2_score: evalResult.awarded_marks };
    const { data: currentRes } = await admin.from("final_results").select("*").eq("session_id", session.id).maybeSingle();
    const p1 = currentRes?.phase1_score || 0;
    const q1 = isQ1 ? evalResult.awarded_marks : (currentRes?.coding_q1_score || 0);
    const q2 = isQ2 ? evalResult.awarded_marks : (currentRes?.coding_q2_score || 0);

    await admin.from("final_results").update({
      ...updateField,
      total_score: p1 + q1 + q2,
    }).eq("session_id", session.id);
  } else {
    const resultsStore = getLocalResultsStore();
    const res = resultsStore.find((r) => r.session_id === session.id);
    if (res) {
      if (isQ1) res.coding_q1_score = evalResult.awarded_marks;
      if (isQ2) res.coding_q2_score = evalResult.awarded_marks;
      res.total_score = res.phase1_score + res.coding_q1_score + res.coding_q2_score;
    }
  }

  // Check if both problems are finalized
  let allSubmissions: Array<{ problem_id: string; is_final: boolean }> = [];
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("coding_submissions")
      .select("problem_id, is_final")
      .eq("session_id", session.id)
      .eq("is_final", true);
    if (data) allSubmissions = data;
  } else {
    allSubmissions = getLocalCodingSubmissionsStore().filter(
      (s) => s.session_id === session.id && s.is_final
    );
  }

  const q1Done = allSubmissions.some((s) => s.problem_id === assigned[0]?.id);
  const q2Done = allSubmissions.some((s) => s.problem_id === assigned[1]?.id);
  const isAllProblemsSubmitted = q1Done && q2Done;

  if (isAllProblemsSubmitted) {
    if (isSupabaseLive()) {
      const admin = createAdminClient();
      await admin
        .from("exam_sessions")
        .update({
          status: "phase2_completed",
          phase2_submitted_at: nowIso,
          last_activity_at: nowIso,
        })
        .eq("id", session.id);
      await admin.from("final_results").update({ is_finalized: true }).eq("session_id", session.id);
    } else {
      session.status = "phase2_completed";
      session.phase2_submitted_at = nowIso;
      session.last_activity_at = nowIso;
      const res = getLocalResultsStore().find((r) => r.session_id === session.id);
      if (res) res.is_finalized = true;
    }
  }

  return {
    success: true,
    problem_id: problemId,
    is_submitted: true,
    is_all_problems_submitted: isAllProblemsSubmitted,
    message: "Problem solution successfully submitted and evaluated. Records secured.",
  };
}

/**
 * Auto-submits any unsubmitted problem drafts when the 30-minute timer expires.
 */
export async function autoSubmitPhase2OnExpiry(studentId: string): Promise<void> {
  const session = await getStudentSession(studentId);
  if (!session || session.status !== "phase2_in_progress") return;

  const assigned = await getAssignedProblemsForTrack(
    session.phase2_category as CodingCategory,
    session.phase2_language
  );

  const drafts = getLocalCodingDraftsStore()[session.id] || {};

  for (const prob of assigned) {
    let isSubmitted = false;
    if (isSupabaseLive()) {
      const admin = createAdminClient();
      const { data } = await admin
        .from("coding_submissions")
        .select("id")
        .eq("session_id", session.id)
        .eq("problem_id", prob.id)
        .eq("is_final", true)
        .maybeSingle();
      isSubmitted = Boolean(data);
    } else {
      isSubmitted = getLocalCodingSubmissionsStore().some(
        (s) => s.session_id === session.id && s.problem_id === prob.id && s.is_final
      );
    }

    if (!isSubmitted) {
      const draft = drafts[prob.id];
      if (draft && draft.source_code && draft.source_code.trim()) {
        try {
          await submitPhase2Problem(
            studentId,
            prob.id,
            draft.source_code,
            draft.language || session.phase2_language || "python"
          );
        } catch {
          // ignore auto-submit individual failure
        }
      }
    }
  }

  const nowIso = new Date().toISOString();
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    await admin
      .from("exam_sessions")
      .update({
        status: "phase2_completed",
        phase2_submitted_at: nowIso,
        last_activity_at: nowIso,
      })
      .eq("id", session.id);
  } else {
    session.status = "phase2_completed";
    session.phase2_submitted_at = nowIso;
    session.last_activity_at = nowIso;
  }
}

// ==============================================================================
// PHASE K: FINAL RESULT PROCESSING, MERIT LIST & SCORECARD SERVICE
// ==============================================================================

export function generateVerificationId(studentId: string): string {
  const cleanId = studentId.replace(/[^a-zA-Z0-9]/g, "").substring(0, 6).toUpperCase() || "CAND";
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const time = Date.now().toString(36).substring(3, 7).toUpperCase();
  return `LNMC-RES-${cleanId}-${rand}${time}`;
}

export function maskStudentName(fullName: string): string {
  if (!fullName) return "Candidate";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    const p = parts[0];
    return p.length > 2 ? `${p.slice(0, 2)}***` : `${p}*`;
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first} ${last.charAt(0)}***`;
}

export function maskRollNumber(rollNumber: string): string {
  if (!rollNumber) return "ROLL***";
  const r = rollNumber.trim();
  if (r.length <= 4) return `${r.slice(0, 2)}**`;
  return `${r.slice(0, 5)}***`;
}

/**
 * Computes authoritative scores strictly from database evaluation records.
 * Never accepts browser-supplied marks.
 */
export async function calculateExamScore(studentId: string): Promise<{
  phase1_score: number;
  coding_q1_score: number;
  coding_q2_score: number;
  total_score: number;
}> {
  const session = await getStudentSession(studentId);
  if (!session) {
    return { phase1_score: 0, coding_q1_score: 0, coding_q2_score: 0, total_score: 0 };
  }

  let phase1_score = 0;
  let coding_q1_score = 0;
  let coding_q2_score = 0;

  if (isSupabaseLive()) {
    const admin = createAdminClient();

    // Check final_results first for existing verified phase 1 score
    const { data: existingRes } = await admin
      .from("final_results")
      .select("phase1_score, coding_q1_score, coding_q2_score")
      .eq("student_id", studentId)
      .maybeSingle();

    if (existingRes && typeof existingRes.phase1_score === "number") {
      phase1_score = Number(existingRes.phase1_score);
    } else {
      // Re-verify from mcq_answers
      const { data: answers } = await admin
        .from("mcq_answers")
        .select("question_id, selected_option_key")
        .eq("session_id", session.id);

      if (answers && answers.length > 0) {
        const { data: questions } = await admin
          .from("mcq_questions")
          .select("id, marks, mcq_answer_keys(correct_option_key)");

        if (questions) {
          for (const ans of answers) {
            const q = questions.find((item) => item.id === ans.question_id);
            if (q) {
              const keys = (q as any).mcq_answer_keys;
              const correctKey = Array.isArray(keys) ? keys[0]?.correct_option_key : keys?.correct_option_key;
              if (correctKey && ans.selected_option_key === correctKey) {
                phase1_score += Number(q.marks || 1);
              }
            }
          }
        }
      }
    }

    // Coding scores from final submissions and evaluations
    if (session.phase2_category) {
      const assigned = await getAssignedProblemsForTrack(
        session.phase2_category as CodingCategory,
        session.phase2_language
      );

      const prob1 = assigned[0];
      const prob2 = assigned[1];

      if (prob1) {
        const { data: sub1 } = await admin
          .from("coding_submissions")
          .select("id, submission_evaluations(awarded_marks)")
          .eq("session_id", session.id)
          .eq("problem_id", prob1.id)
          .eq("is_final", true)
          .maybeSingle();

        const evals1 = (sub1 as any)?.submission_evaluations;
        const marks1 = Array.isArray(evals1) ? evals1[0]?.awarded_marks : evals1?.awarded_marks;
        if (typeof marks1 === "number") coding_q1_score = marks1;
      }

      if (prob2) {
        const { data: sub2 } = await admin
          .from("coding_submissions")
          .select("id, submission_evaluations(awarded_marks)")
          .eq("session_id", session.id)
          .eq("problem_id", prob2.id)
          .eq("is_final", true)
          .maybeSingle();

        const evals2 = (sub2 as any)?.submission_evaluations;
        const marks2 = Array.isArray(evals2) ? evals2[0]?.awarded_marks : evals2?.awarded_marks;
        if (typeof marks2 === "number") coding_q2_score = marks2;
      }
    }
  } else {
    // Local memory store
    const localRes = getLocalResultsStore().find((r) => r.student_id === studentId);
    if (localRes) {
      phase1_score = localRes.phase1_score || 0;
    } else {
      const sessionAnswers = getLocalAnswersStore()[session.id] || {};
      const { questions: allQuestions } = await getQuestions();
      for (const q of allQuestions) {
        const ans = sessionAnswers[q.id];
        if (ans && ans.selected_option_key && ans.selected_option_key === q.correct_option_key) {
          phase1_score += q.marks;
        }
      }
    }

    if (session.phase2_category) {
      const assigned = await getAssignedProblemsForTrack(
        session.phase2_category as CodingCategory,
        session.phase2_language
      );
      const prob1 = assigned[0];
      const prob2 = assigned[1];

      const submissions = getLocalCodingSubmissionsStore();
      const evaluations = getLocalSubmissionEvaluationsStore();

      if (prob1) {
        const sub1 = submissions.find(
          (s) => s.session_id === session.id && s.problem_id === prob1.id && s.is_final
        );
        if (sub1) {
          const eval1 = evaluations.find((e) => e.submission_id === sub1.id);
          if (eval1 && typeof eval1.awarded_marks === "number") {
            coding_q1_score = eval1.awarded_marks;
          }
        }
      }

      if (prob2) {
        const sub2 = submissions.find(
          (s) => s.session_id === session.id && s.problem_id === prob2.id && s.is_final
        );
        if (sub2) {
          const eval2 = evaluations.find((e) => e.submission_id === sub2.id);
          if (eval2 && typeof eval2.awarded_marks === "number") {
            coding_q2_score = eval2.awarded_marks;
          }
        }
      }
    }
  }

  // Enforce strict constraints:
  // Phase 1: 0 - 80
  // Problem 1: 0 - 10
  // Problem 2: 0 - 10
  // Total: 0 - 100
  phase1_score = Math.min(80, Math.max(0, phase1_score));
  coding_q1_score = Math.min(10, Math.max(0, coding_q1_score));
  coding_q2_score = Math.min(10, Math.max(0, coding_q2_score));
  const total_score = Math.min(100, Math.max(0, phase1_score + coding_q1_score + coding_q2_score));

  return {
    phase1_score,
    coding_q1_score,
    coding_q2_score,
    total_score,
  };
}

/**
 * Finalizes result for a single student attempt.
 * Ensures:
 * 1. Attempt is completed or terminated.
 * 2. All scores calculated from authoritative database records.
 * 3. Prevents duplicate result creation (idempotent).
 * 4. Generates unique verification ID.
 */
export async function finalizeStudentResult(
  studentId: string,
  options?: { force?: boolean }
): Promise<{
  id: string;
  student_id: string;
  session_id: string;
  phase1_score: number;
  coding_q1_score: number;
  coding_q2_score: number;
  total_score: number;
  rank?: number | null;
  is_finalized: boolean;
  is_published: boolean;
  verification_id: string;
  finalized_at: string;
}> {
  const session = await getStudentSession(studentId);
  if (!session) {
    throw new Error(`Cannot finalize result: No exam session exists for candidate ${studentId}.`);
  }

  const isEligible =
    session.status === "phase2_completed" ||
    session.status === "phase1_completed" ||
    session.is_terminated ||
    options?.force === true;

  if (!isEligible) {
    throw new Error(
      `Cannot finalize active examination (Status: ${session.status}). Candidate must complete Phase 2 or attempt must be officially concluded.`
    );
  }

  const scores = await calculateExamScore(studentId);
  const nowIso = new Date().toISOString();

  if (isSupabaseLive()) {
    const admin = createAdminClient();

    // Check if result already exists
    const { data: existing } = await admin
      .from("final_results")
      .select("*")
      .eq("student_id", studentId)
      .maybeSingle();

    const verificationId = existing?.verification_id || generateVerificationId(studentId);
    const finalizedAt = existing?.finalized_at || nowIso;
    const isPublished = Boolean(existing?.is_published);

    const payload = {
      student_id: studentId,
      session_id: session.id,
      phase1_score: scores.phase1_score,
      coding_q1_score: scores.coding_q1_score,
      coding_q2_score: scores.coding_q2_score,
      total_score: scores.total_score,
      is_finalized: true,
      is_published: isPublished,
      verification_id: verificationId,
      finalized_at: finalizedAt,
      updated_at: nowIso,
    };

    const { data: saved, error } = await admin
      .from("final_results")
      .upsert(payload, { onConflict: "student_id" })
      .select()
      .single();

    if (error || !saved) {
      throw new Error(`Failed to finalize result: ${error?.message}`);
    }

    return saved as any;
  }

  // Local store
  const store = getLocalResultsStore();
  let existing = store.find((r) => r.student_id === studentId);

  if (existing) {
    existing.phase1_score = scores.phase1_score;
    existing.coding_q1_score = scores.coding_q1_score;
    existing.coding_q2_score = scores.coding_q2_score;
    existing.total_score = scores.total_score;
    existing.is_finalized = true;
    if (!existing.verification_id || !existing.verification_id.startsWith("LNMC-RES-")) {
      existing.verification_id = generateVerificationId(studentId);
    }
    if (!existing.finalized_at) existing.finalized_at = nowIso;
    existing.updated_at = nowIso;
    return existing as any;
  }

  const newResult = {
    id: `res-${studentId}`,
    student_id: studentId,
    session_id: session.id,
    phase1_score: scores.phase1_score,
    coding_q1_score: scores.coding_q1_score,
    coding_q2_score: scores.coding_q2_score,
    total_score: scores.total_score,
    rank: null,
    is_finalized: true,
    is_published: false,
    verification_id: generateVerificationId(studentId),
    finalized_at: nowIso,
    created_at: nowIso,
    updated_at: nowIso,
  };
  store.push(newResult);
  return newResult as any;
}

/**
 * Re-computes and assigns standard competition ranks using deterministic tie-breaking.
 * Rules:
 * 1. Total score DESC
 * 2. Phase 1 score DESC
 * 3. Coding total (Q1 + Q2) DESC
 * 4. Completion timestamp (finalized_at) ASC
 * 5. Declares explicit tie for identical metrics
 */
export async function recalculateRanks(): Promise<void> {
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data: results, error } = await admin
      .from("final_results")
      .select("id, total_score, phase1_score, coding_q1_score, coding_q2_score, finalized_at, created_at")
      .eq("is_finalized", true);

    if (error || !results || results.length === 0) return;

    const sorted = [...results].sort((a, b) => {
      if (b.total_score !== a.total_score) return b.total_score - a.total_score;
      if (b.phase1_score !== a.phase1_score) return b.phase1_score - a.phase1_score;
      const bCoding = (b.coding_q1_score || 0) + (b.coding_q2_score || 0);
      const aCoding = (a.coding_q1_score || 0) + (a.coding_q2_score || 0);
      if (bCoding !== aCoding) return bCoding - aCoding;
      const aTime = new Date(a.finalized_at || a.created_at).getTime();
      const bTime = new Date(b.finalized_at || b.created_at).getTime();
      return aTime - bTime;
    });

    let currentRank = 1;
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        const prevCoding = (prev.coding_q1_score || 0) + (prev.coding_q2_score || 0);
        const currCoding = (curr.coding_q1_score || 0) + (curr.coding_q2_score || 0);
        const isTie =
          curr.total_score === prev.total_score &&
          curr.phase1_score === prev.phase1_score &&
          currCoding === prevCoding;
        if (!isTie) {
          currentRank = i + 1;
        }
      }
      await admin.from("final_results").update({ rank: currentRank }).eq("id", sorted[i].id);
    }
    return;
  }

  const store = getLocalResultsStore().filter((r) => r.is_finalized);
  if (store.length === 0) return;

  store.sort((a, b) => {
    if (b.total_score !== a.total_score) return b.total_score - a.total_score;
    if (b.phase1_score !== a.phase1_score) return b.phase1_score - a.phase1_score;
    const bCoding = (b.coding_q1_score || 0) + (b.coding_q2_score || 0);
    const aCoding = (a.coding_q1_score || 0) + (a.coding_q2_score || 0);
    if (bCoding !== aCoding) return bCoding - aCoding;
    const aTime = new Date(a.finalized_at || a.created_at).getTime();
    const bTime = new Date(b.finalized_at || b.created_at).getTime();
    return aTime - bTime;
  });

  let currentRank = 1;
  for (let i = 0; i < store.length; i++) {
    if (i > 0) {
      const prev = store[i - 1];
      const curr = store[i];
      const prevCoding = (prev.coding_q1_score || 0) + (prev.coding_q2_score || 0);
      const currCoding = (curr.coding_q1_score || 0) + (curr.coding_q2_score || 0);
      const isTie =
        curr.total_score === prev.total_score &&
        curr.phase1_score === prev.phase1_score &&
        currCoding === prevCoding;
      if (!isTie) {
        currentRank = i + 1;
      }
    }
    store[i].rank = currentRank;
  }
}

/**
 * Finalizes all eligible student sessions and recalculates rankings.
 */
export async function finalizeAllEligibleResults(): Promise<{
  finalizedCount: number;
  totalEligible: number;
}> {
  let eligibleStudentIds: string[] = [];

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data: sessions } = await admin
      .from("exam_sessions")
      .select("student_id, status, is_terminated");

    if (sessions) {
      eligibleStudentIds = sessions
        .filter(
          (s) =>
            s.status === "phase2_completed" ||
            s.status === "phase1_completed" ||
            s.is_terminated
        )
        .map((s) => s.student_id);
    }
  } else {
    eligibleStudentIds = getLocalSessionsStore()
      .filter(
        (s) =>
          s.status === "phase2_completed" ||
          s.status === "phase1_completed" ||
          s.is_terminated
      )
      .map((s) => s.student_id);
  }

  let finalizedCount = 0;
  for (const studentId of eligibleStudentIds) {
    try {
      await finalizeStudentResult(studentId, { force: true });
      finalizedCount++;
    } catch (err) {
      console.error(`Failed to auto-finalize student ${studentId}:`, err);
    }
  }

  await recalculateRanks();

  return {
    finalizedCount,
    totalEligible: eligibleStudentIds.length,
  };
}

/**
 * Toggles publication state of all finalized results.
 */
export async function publishResults(publish: boolean): Promise<{
  success: boolean;
  is_published: boolean;
  count: number;
}> {
  if (publish) {
    await recalculateRanks();
  }

  const nowIso = new Date().toISOString();

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("final_results")
      .update({ is_published: publish, updated_at: nowIso })
      .eq("is_finalized", true)
      .select("id");

    if (error) {
      throw new Error(`Failed to update publication status: ${error.message}`);
    }

    return {
      success: true,
      is_published: publish,
      count: data?.length || 0,
    };
  }

  const store = getLocalResultsStore();
  let count = 0;
  for (const r of store) {
    if (r.is_finalized) {
      r.is_published = publish;
      r.updated_at = nowIso;
      count++;
    }
  }

  return {
    success: true,
    is_published: publish,
    count,
  };
}

/**
 * Retrieves enriched admin results list with summary metrics and pagination.
 */
export async function getAdminResultsList(params?: {
  search?: string;
  course?: string;
  status?: string;
  is_published?: boolean;
  page?: number;
  limit?: number;
}): Promise<{
  results: AdminResultItemDTO[];
  summary: {
    totalStudents: number;
    finalizedCount: number;
    publishedCount: number;
    highestScore: number;
    averageScore: number;
    isPublished: boolean;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const { students } = await getStudents();

  let allResults: any[] = [];
  let allSessions: any[] = [];

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data: resData } = await admin.from("final_results").select("*");
    if (resData) allResults = resData;

    const { data: sessData } = await admin.from("exam_sessions").select("*");
    if (sessData) allSessions = sessData;
  } else {
    allResults = getLocalResultsStore();
    allSessions = getLocalSessionsStore();
  }

  // Merge each student with session and final_results
  const enriched: AdminResultItemDTO[] = students.map((std) => {
    const session = allSessions.find((s) => s.student_id === std.id);
    const result = allResults.find((r) => r.student_id === std.id);

    const isFinalized = Boolean(result?.is_finalized);
    const isPublished = Boolean(result?.is_published);

    let evalStatus = "No Submissions";
    if (session?.status === "phase2_completed") {
      evalStatus = "Completed";
    } else if (session?.status === "phase1_completed") {
      evalStatus = "Phase 1 Only";
    } else if (session?.is_terminated) {
      evalStatus = "Terminated (Partial)";
    }

    return {
      id: result?.id || `draft-${std.id}`,
      student_id: std.id,
      session_id: session?.id || "",
      student_name: std.full_name,
      roll_number: std.roll_number,
      participant_id: std.participant_id,
      course: std.course,
      phase1_score: Number(result?.phase1_score) || 0,
      coding_q1_score: Number(result?.coding_q1_score) || 0,
      coding_q2_score: Number(result?.coding_q2_score) || 0,
      total_score: Number(result?.total_score) || 0,
      rank: result?.rank ?? null,
      is_finalized: isFinalized,
      is_published: isPublished,
      attempt_status: session?.status || "not_started",
      evaluation_status: evalStatus,
      verification_id: result?.verification_id || "PENDING",
      finalized_at: result?.finalized_at || null,
      is_terminated: Boolean(session?.is_terminated),
      termination_reason: session?.termination_reason || null,
    };
  });

  // Calculate summary metrics across all students
  const totalStudents = students.length;
  const finalizedItems = enriched.filter((r) => r.is_finalized);
  const finalizedCount = finalizedItems.length;
  const publishedCount = enriched.filter((r) => r.is_published).length;
  const highestScore = finalizedItems.length > 0
    ? Math.max(...finalizedItems.map((r) => r.total_score))
    : 0;
  const avgRaw = finalizedItems.length > 0
    ? finalizedItems.reduce((acc, curr) => acc + curr.total_score, 0) / finalizedItems.length
    : 0;
  const averageScore = Math.round(avgRaw * 10) / 10;
  const isPublished = publishedCount > 0 && publishedCount >= finalizedCount;

  // Apply filters
  let filtered = [...enriched];

  const search = params?.search?.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.student_name.toLowerCase().includes(search) ||
        r.roll_number.toLowerCase().includes(search) ||
        r.participant_id.toLowerCase().includes(search)
    );
  }

  const course = params?.course?.trim();
  if (course && course !== "ALL") {
    filtered = filtered.filter((r) => r.course.toLowerCase() === course.toLowerCase());
  }

  const status = params?.status?.trim();
  if (status === "finalized") {
    filtered = filtered.filter((r) => r.is_finalized);
  } else if (status === "pending") {
    filtered = filtered.filter((r) => !r.is_finalized);
  } else if (status === "terminated") {
    filtered = filtered.filter((r) => r.is_terminated);
  }

  if (typeof params?.is_published === "boolean") {
    filtered = filtered.filter((r) => r.is_published === params.is_published);
  }

  // Sort: Rank ASC (nulls at the end), then total_score DESC
  filtered.sort((a, b) => {
    if (a.is_finalized && !b.is_finalized) return -1;
    if (!a.is_finalized && b.is_finalized) return 1;
    if (typeof a.rank === "number" && typeof b.rank === "number") {
      if (a.rank !== b.rank) return a.rank - b.rank;
    }
    if (b.total_score !== a.total_score) return b.total_score - a.total_score;
    return a.roll_number.localeCompare(b.roll_number);
  });

  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 50);
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    results: paginated,
    summary: {
      totalStudents,
      finalizedCount,
      publishedCount,
      highestScore,
      averageScore,
      isPublished,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Retrieves official student scorecard.
 * Guaranteed:
 * - Rejects unfinalized results.
 * - Rejects unpublished results.
 * - Restricts access to candidate's own data.
 */
export async function getStudentScorecard(studentId: string): Promise<PublicScorecardDTO> {
  let result: any = null;
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("final_results")
      .select("*")
      .eq("student_id", studentId)
      .maybeSingle();
    result = data;
  } else {
    result = getLocalResultsStore().find((r) => r.student_id === studentId);
  }

  if (!result || !result.is_finalized) {
    throw new Error("RESULT_NOT_FINALIZED: Your examination result has not been finalized yet.");
  }

  if (!result.is_published) {
    throw new Error("RESULTS_NOT_PUBLISHED: Official competition results and scorecards have not been published yet by the Examination Controller.");
  }

  const student = await getStudentById(studentId);
  if (!student) {
    throw new Error("Student record not found.");
  }

  return {
    student_name: student.full_name,
    roll_number: student.roll_number,
    course: student.course,
    participant_id: student.participant_id,
    college_name: "Lalit Narayan Mishra College of Business Management",
    competition_name: "Codethon 2026: Annual Inter-Departmental Coding Championship",
    phase1_score: Number(result.phase1_score) || 0,
    coding_q1_score: Number(result.coding_q1_score) || 0,
    coding_q2_score: Number(result.coding_q2_score) || 0,
    total_score: Number(result.total_score) || 0,
    rank: result.rank ?? null,
    is_published: Boolean(result.is_published),
    verification_id: result.verification_id,
    finalized_at: result.finalized_at,
  };
}

/**
 * Public verification lookup.
 * Exposes minimal certified verification metadata without sensitive personal information.
 */
export async function getPublicVerificationScorecard(
  verificationId: string
): Promise<VerificationResultDTO> {
  const cleanId = verificationId.trim();
  let result: any = null;

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("final_results")
      .select("*")
      .eq("verification_id", cleanId)
      .maybeSingle();
    result = data;
  } else {
    result = getLocalResultsStore().find((r) => r.verification_id === cleanId);
  }

  if (!result || !result.is_finalized || !result.is_published) {
    return {
      is_valid: false,
      verification_id: cleanId,
      message: `No certified published scorecard exists with verification code: ${cleanId}`,
    };
  }

  const student = await getStudentById(result.student_id);
  if (!student) {
    return {
      is_valid: false,
      verification_id: cleanId,
      message: "Student record unavailable.",
    };
  }

  return {
    is_valid: true,
    verification_id: result.verification_id,
    student_name_masked: maskStudentName(student.full_name),
    roll_number_masked: maskRollNumber(student.roll_number),
    participant_id: student.participant_id,
    course: student.course,
    college_name: "Lalit Narayan Mishra College of Business Management",
    competition_name: "Codethon 2026: Annual Inter-Departmental Coding Championship",
    total_score: Number(result.total_score) || 0,
    max_score: 100,
    rank: result.rank ?? null,
    finalized_at: result.finalized_at,
  };
}

function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  // Protect against formula injection (CSV/DDE injection)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape internal double quotes by doubling them
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates an RFC-compliant CSV with formula injection protection and UTF-8 BOM.
 */
export function generateResultsCsv(results: AdminResultItemDTO[]): string {
  const headers = [
    "Rank",
    "Participant ID",
    "Roll Number",
    "Student Name",
    "Course",
    "Phase 1 Score (80M)",
    "Coding Problem 1 (10M)",
    "Coding Problem 2 (10M)",
    "Total Score (100M)",
    "Attempt Status",
    "Evaluation Status",
    "Publication Status",
    "Verification ID",
    "Finalized At",
  ];

  const rows = results.map((r) => [
    sanitizeCsvCell(r.rank !== null && r.rank !== undefined ? r.rank : "N/A"),
    sanitizeCsvCell(r.participant_id),
    sanitizeCsvCell(r.roll_number),
    sanitizeCsvCell(r.student_name),
    sanitizeCsvCell(r.course),
    sanitizeCsvCell(r.phase1_score),
    sanitizeCsvCell(r.coding_q1_score),
    sanitizeCsvCell(r.coding_q2_score),
    sanitizeCsvCell(r.total_score),
    sanitizeCsvCell(r.attempt_status),
    sanitizeCsvCell(r.evaluation_status),
    sanitizeCsvCell(r.is_published ? "Published" : "Unpublished"),
    sanitizeCsvCell(r.verification_id),
    sanitizeCsvCell(r.finalized_at || "Pending"),
  ]);

  // UTF-8 BOM (\uFEFF) ensures Excel properly decodes Unicode characters
  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
  return csvContent;
}



