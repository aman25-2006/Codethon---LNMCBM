import type { Database, Json } from "./database";

export * from "./database";

// Entity row types
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type CompetitionSettingsRow = Database["public"]["Tables"]["competition_settings"]["Row"];
export type StudentRow = Database["public"]["Tables"]["students"]["Row"];
export type MCQQuestionRow = Database["public"]["Tables"]["mcq_questions"]["Row"];
export type MCQOptionRow = Database["public"]["Tables"]["mcq_options"]["Row"];
export type MCQAnswerKeyRow = Database["public"]["Tables"]["mcq_answer_keys"]["Row"];
export type ExamSessionRow = Database["public"]["Tables"]["exam_sessions"]["Row"];
export type MCQAnswerRow = Database["public"]["Tables"]["mcq_answers"]["Row"];
export type CodingProblemRow = Database["public"]["Tables"]["coding_problems"]["Row"];
export type HiddenTestCaseRow = Database["public"]["Tables"]["hidden_test_cases"]["Row"];
export type CodingSubmissionRow = Database["public"]["Tables"]["coding_submissions"]["Row"];
export type SubmissionEvaluationRow = Database["public"]["Tables"]["submission_evaluations"]["Row"];
export type MonitoringEventRow = Database["public"]["Tables"]["monitoring_events"]["Row"];
export type FinalResultRow = Database["public"]["Tables"]["final_results"]["Row"];
export type EmailDeliveryLogRow = Database["public"]["Tables"]["email_delivery_logs"]["Row"];
export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

// Backward compatible aliases
export type CompetitionSettings = CompetitionSettingsRow;
export type Student = StudentRow;
export type MCQQuestion = MCQQuestionRow;
export type MCQOption = MCQOptionRow;
export type CodingProblem = CodingProblemRow;
export type ExamSession = ExamSessionRow;
export type FinalScorecard = FinalResultRow;

// ==============================================================================
// PUBLIC STUDENT-FACING DTOs
// (Strictly sanitized: Answer keys, hidden tests, & other student data omitted)
// ==============================================================================

/**
 * Public MCQ Option presented to students during exam.
 * Note: Never contains is_correct.
 */
export interface PublicMCQOptionDTO {
  id: string;
  question_id: string;
  option_key: "A" | "B" | "C" | "D";
  option_text: string;
}

/**
 * Public MCQ Question presented to candidates during Phase 1.
 * Note: Never contains correct_option_id or answer explanation.
 */
export interface PublicMCQQuestionDTO {
  id: string;
  category: Database["public"]["Tables"]["mcq_questions"]["Row"]["category"];
  question_text: string;
  code_snippet?: string | null;
  case_study_passage?: string | null;
  marks: number;
  options: PublicMCQOptionDTO[];
}

/**
 * Public Coding Problem presented to candidates during Phase 2.
 * Note: Never contains hidden test cases. Only public sample tests are visible.
 */
export interface PublicCodingProblemDTO {
  id: string;
  title: string;
  slug: string;
  category: Database["public"]["Tables"]["coding_problems"]["Row"]["category"];
  programming_language?: string | null;
  problem_statement: string;
  constraints: string;
  input_format: string;
  output_format: string;
  sample_input: string;
  sample_output: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  marks_per_test_case: number;
  total_marks: number;
}

/**
 * Student Examination State DTO.
 */
export interface StudentExamStateDTO {
  session_id: string;
  student_name: string;
  roll_number: string;
  current_phase: number;
  status: Database["public"]["Tables"]["exam_sessions"]["Row"]["status"];
  time_remaining_seconds: number;
  phase1_expires_at: string | null;
  phase2_expires_at: string | null;
  fullscreen_warnings_count: number;
  is_terminated: boolean;
  termination_reason?: string | null;
}

/**
 * Final Published Scorecard DTO for verification and student view.
 */
export interface PublicScorecardDTO {
  student_name: string;
  roll_number: string;
  course: string;
  participant_id: string;
  college_name: string;
  competition_name: string;
  phase1_score: number;
  coding_q1_score: number;
  coding_q2_score: number;
  total_score: number;
  rank?: number | null;
  is_published: boolean;
  verification_id: string;
  finalized_at: string | null;
}

/**
 * Admin Result Item DTO for merit list table and operations.
 */
export interface AdminResultItemDTO {
  id: string;
  student_id: string;
  session_id: string;
  student_name: string;
  roll_number: string;
  participant_id: string;
  course: string;
  phase1_score: number;
  coding_q1_score: number;
  coding_q2_score: number;
  total_score: number;
  rank?: number | null;
  is_finalized: boolean;
  is_published: boolean;
  attempt_status: string;
  evaluation_status: string;
  verification_id: string;
  finalized_at: string | null;
  is_terminated: boolean;
  termination_reason?: string | null;
}

/**
 * Public Verification Result DTO for unauthenticated credential checking.
 */
export interface VerificationResultDTO {
  is_valid: boolean;
  verification_id: string;
  student_name_masked?: string;
  roll_number_masked?: string;
  participant_id?: string;
  course?: string;
  college_name?: string;
  competition_name?: string;
  total_score?: number;
  max_score?: number;
  rank?: number | null;
  finalized_at?: string | null;
  message?: string;
}

export type {
  CompetitionSettingsDTO,
  PreflightCheckItem,
  PreflightChecklistResult,
} from "@/lib/services/settings-service";

export type { AuditLogEntry } from "@/lib/audit";


