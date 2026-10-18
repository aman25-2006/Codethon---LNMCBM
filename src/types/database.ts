export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "student";

export type CompetitionStatus =
  | "draft"
  | "registration_open"
  | "registration_closed"
  | "ready"
  | "in_progress"
  | "evaluation_pending"
  | "completed"
  | "results_published";

export type MCQCategory =
  | "Fundamentals"
  | "Technical Understanding"
  | "Logic and Debugging"
  | "Case Study";

export type CodingCategory =
  | "C"
  | "C++"
  | "Java"
  | "Python"
  | "Web Development"
  | "DSA";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      competition_settings: {
        Row: {
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
          eligible_coding_categories: string[];
          results_published: boolean;
          participant_instructions: string | null;
          contact_email: string;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competition_name?: string;
          college_name?: string;
          college_logo_url?: string;
          competition_date?: string;
          registration_status?: "open" | "closed";
          status?: CompetitionStatus;
          phase1_duration_minutes?: number;
          phase2_duration_minutes?: number;
          fullscreen_warning_threshold?: number;
          eligible_coding_categories?: string[];
          results_published?: boolean;
          participant_instructions?: string | null;
          contact_email?: string;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          competition_name?: string;
          college_name?: string;
          college_logo_url?: string;
          competition_date?: string;
          registration_status?: "open" | "closed";
          status?: CompetitionStatus;
          phase1_duration_minutes?: number;
          phase2_duration_minutes?: number;
          fullscreen_warning_threshold?: number;
          eligible_coding_categories?: string[];
          results_published?: boolean;
          participant_instructions?: string | null;
          contact_email?: string;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
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
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          competition_id?: string | null;
          roll_number: string;
          full_name: string;
          email: string;
          course: string;
          mobile?: string | null;
          participant_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          competition_id?: string | null;
          roll_number?: string;
          full_name?: string;
          email?: string;
          course?: string;
          mobile?: string | null;
          participant_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      mcq_questions: {
        Row: {
          id: string;
          competition_id: string | null;
          category: MCQCategory;
          question_text: string;
          code_snippet: string | null;
          case_study_passage: string | null;
          marks: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competition_id?: string | null;
          category: MCQCategory;
          question_text: string;
          code_snippet?: string | null;
          case_study_passage?: string | null;
          marks: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          competition_id?: string | null;
          category?: MCQCategory;
          question_text?: string;
          code_snippet?: string | null;
          case_study_passage?: string | null;
          marks?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      mcq_options: {
        Row: {
          id: string;
          question_id: string;
          option_key: "A" | "B" | "C" | "D";
          option_text: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          option_key: "A" | "B" | "C" | "D";
          option_text: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          option_key?: "A" | "B" | "C" | "D";
          option_text?: string;
        };
      };
      mcq_answer_keys: {
        Row: {
          question_id: string;
          correct_option_id: string;
          correct_option_key: "A" | "B" | "C" | "D";
          explanation: string | null;
          created_at: string;
        };
        Insert: {
          question_id: string;
          correct_option_id: string;
          correct_option_key: "A" | "B" | "C" | "D";
          explanation?: string | null;
          created_at?: string;
        };
        Update: {
          question_id?: string;
          correct_option_id?: string;
          correct_option_key?: "A" | "B" | "C" | "D";
          explanation?: string | null;
          created_at?: string;
        };
      };
      exam_sessions: {
        Row: {
          id: string;
          student_id: string;
          competition_id: string;
          current_phase: number;
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
          phase2_category: CodingCategory | null;
          phase2_language: string | null;
          phase2_started_at: string | null;
          phase2_expires_at: string | null;
          phase2_submitted_at: string | null;
          is_terminated: boolean;
          termination_reason: string | null;
          fullscreen_warnings_count: number;
          last_activity_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          competition_id: string;
          current_phase?: number;
          status?:
            | "not_started"
            | "phase1_in_progress"
            | "phase1_completed"
            | "phase2_in_progress"
            | "phase2_completed"
            | "terminated";
          phase1_started_at?: string | null;
          phase1_expires_at?: string | null;
          phase1_submitted_at?: string | null;
          phase2_category?: CodingCategory | null;
          phase2_language?: string | null;
          phase2_started_at?: string | null;
          phase2_expires_at?: string | null;
          phase2_submitted_at?: string | null;
          is_terminated?: boolean;
          termination_reason?: string | null;
          fullscreen_warnings_count?: number;
          last_activity_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          competition_id?: string;
          current_phase?: number;
          status?:
            | "not_started"
            | "phase1_in_progress"
            | "phase1_completed"
            | "phase2_in_progress"
            | "phase2_completed"
            | "terminated";
          phase1_started_at?: string | null;
          phase1_expires_at?: string | null;
          phase1_submitted_at?: string | null;
          phase2_category?: CodingCategory | null;
          phase2_language?: string | null;
          phase2_started_at?: string | null;
          phase2_expires_at?: string | null;
          phase2_submitted_at?: string | null;
          is_terminated?: boolean;
          termination_reason?: string | null;
          fullscreen_warnings_count?: number;
          last_activity_at?: string;
          created_at?: string;
        };
      };
      mcq_answers: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          selected_option_id: string | null;
          selected_option_key: "A" | "B" | "C" | "D" | null;
          is_marked_for_review: boolean;
          question_order_index: number;
          shuffled_option_keys: string[];
          saved_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question_id: string;
          selected_option_id?: string | null;
          selected_option_key?: "A" | "B" | "C" | "D" | null;
          is_marked_for_review?: boolean;
          question_order_index: number;
          shuffled_option_keys?: string[];
          saved_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          question_id?: string;
          selected_option_id?: string | null;
          selected_option_key?: "A" | "B" | "C" | "D" | null;
          is_marked_for_review?: boolean;
          question_order_index?: number;
          shuffled_option_keys?: string[];
          saved_at?: string;
        };
      };
      coding_problems: {
        Row: {
          id: string;
          competition_id: string | null;
          title: string;
          slug: string;
          category: CodingCategory;
          programming_language: string | null;
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
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competition_id?: string | null;
          title: string;
          slug: string;
          category: CodingCategory;
          programming_language?: string | null;
          problem_statement: string;
          constraints: string;
          input_format: string;
          output_format: string;
          sample_input: string;
          sample_output: string;
          time_limit_ms?: number;
          memory_limit_mb?: number;
          marks_per_test_case?: number;
          total_marks?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          competition_id?: string | null;
          title?: string;
          slug?: string;
          category?: CodingCategory;
          programming_language?: string | null;
          problem_statement?: string;
          constraints?: string;
          input_format?: string;
          output_format?: string;
          sample_input?: string;
          sample_output?: string;
          time_limit_ms?: number;
          memory_limit_mb?: number;
          marks_per_test_case?: number;
          total_marks?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      hidden_test_cases: {
        Row: {
          id: string;
          problem_id: string;
          test_case_order: number;
          input_data: string;
          expected_output: string;
          marks: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          problem_id: string;
          test_case_order: number;
          input_data: string;
          expected_output: string;
          marks?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          problem_id?: string;
          test_case_order?: number;
          input_data?: string;
          expected_output?: string;
          marks?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      coding_submissions: {
        Row: {
          id: string;
          session_id: string;
          problem_id: string;
          source_code: string;
          selected_language: string;
          submission_type: "run" | "final_submit";
          is_final: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          problem_id: string;
          source_code: string;
          selected_language: string;
          submission_type?: "run" | "final_submit";
          is_final?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          problem_id?: string;
          source_code?: string;
          selected_language?: string;
          submission_type?: "run" | "final_submit";
          is_final?: boolean;
          created_at?: string;
        };
      };
      submission_evaluations: {
        Row: {
          id: string;
          submission_id: string;
          evaluation_status: "pending" | "evaluating" | "completed" | "error";
          passed_test_cases: number;
          awarded_marks: number;
          execution_summary: Json;
          evaluated_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          evaluation_status?: "pending" | "evaluating" | "completed" | "error";
          passed_test_cases?: number;
          awarded_marks?: number;
          execution_summary?: Json;
          evaluated_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          evaluation_status?: "pending" | "evaluating" | "completed" | "error";
          passed_test_cases?: number;
          awarded_marks?: number;
          execution_summary?: Json;
          evaluated_at?: string;
        };
      };
      monitoring_events: {
        Row: {
          id: string;
          session_id: string;
          student_id: string;
          event_type:
            | "fullscreen_exit"
            | "window_blur"
            | "tab_switch"
            | "devtools_open"
            | "warning_threshold_exceeded"
            | "auto_terminated";
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          student_id: string;
          event_type:
            | "fullscreen_exit"
            | "window_blur"
            | "tab_switch"
            | "devtools_open"
            | "warning_threshold_exceeded"
            | "auto_terminated";
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          student_id?: string;
          event_type?:
            | "fullscreen_exit"
            | "window_blur"
            | "tab_switch"
            | "devtools_open"
            | "warning_threshold_exceeded"
            | "auto_terminated";
          metadata?: Json;
          created_at?: string;
        };
      };
      final_results: {
        Row: {
          id: string;
          student_id: string;
          session_id: string;
          phase1_score: number;
          coding_q1_score: number;
          coding_q2_score: number;
          total_score: number;
          rank: number | null;
          is_finalized: boolean;
          is_published: boolean;
          verification_id: string;
          finalized_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          session_id: string;
          phase1_score?: number;
          coding_q1_score?: number;
          coding_q2_score?: number;
          total_score?: number;
          rank?: number | null;
          is_finalized?: boolean;
          is_published?: boolean;
          verification_id: string;
          finalized_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          session_id?: string;
          phase1_score?: number;
          coding_q1_score?: number;
          coding_q2_score?: number;
          total_score?: number;
          rank?: number | null;
          is_finalized?: boolean;
          is_published?: boolean;
          verification_id?: string;
          finalized_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_delivery_logs: {
        Row: {
          id: string;
          student_id: string | null;
          email_type: "credentials" | "reminder" | "scorecard";
          recipient_email: string;
          provider_message_id: string | null;
          delivery_status: "queued" | "accepted" | "delivered" | "failed" | "bounced";
          attempt_count: number;
          error_details: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          email_type: "credentials" | "reminder" | "scorecard";
          recipient_email: string;
          provider_message_id?: string | null;
          delivery_status?: "queued" | "accepted" | "delivered" | "failed" | "bounced";
          attempt_count?: number;
          error_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          email_type?: "credentials" | "reminder" | "scorecard";
          recipient_email?: string;
          provider_message_id?: string | null;
          delivery_status?: "queued" | "accepted" | "delivered" | "failed" | "bounced";
          attempt_count?: number;
          error_details?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string;
          action: string;
          target_resource: string;
          details: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email: string;
          action: string;
          target_resource: string;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string;
          action?: string;
          target_resource?: string;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

