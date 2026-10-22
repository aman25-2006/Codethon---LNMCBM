-- ==============================================================================
-- LALIT NARAYAN MISHRA COLLEGE OF BUSINESS MANAGEMENT (LNMCBM), MUZAFFARPUR
-- CODETHON 2026: COMPLETE CONSOLIDATED SUPABASE POSTGRESQL DATABASE SETUP
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql
-- 2. Click "New Query" or open the SQL Editor.
-- 3. Paste this entire script into the editor and click "RUN" (or Ctrl + Enter).
-- 4. All tables, relations, indexes, and triggers will be provisioned permanently.
-- 5. Data stored in this database will NEVER be deleted automatically.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. USER PROFILES & ROLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')) DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. COMPETITION SETTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS competition_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_name TEXT NOT NULL DEFAULT 'Codethon 2026',
    college_name TEXT NOT NULL DEFAULT 'Lalit Narayan Mishra College of Business Management',
    college_logo_url TEXT NOT NULL DEFAULT '/images/college-logo.png',
    competition_date DATE NOT NULL DEFAULT CURRENT_DATE,
    registration_status TEXT NOT NULL CHECK (registration_status IN ('open', 'closed')) DEFAULT 'open',
    status TEXT NOT NULL CHECK (status IN (
        'draft', 
        'registration_open', 
        'registration_closed', 
        'ready', 
        'in_progress', 
        'evaluation_pending', 
        'completed', 
        'results_published'
    )) DEFAULT 'registration_open',
    phase1_duration_minutes INT NOT NULL CHECK (phase1_duration_minutes >= 5 AND phase1_duration_minutes <= 180) DEFAULT 45,
    phase2_duration_minutes INT NOT NULL CHECK (phase2_duration_minutes >= 5 AND phase2_duration_minutes <= 180) DEFAULT 30,
    fullscreen_warning_threshold INT NOT NULL CHECK (fullscreen_warning_threshold >= 1 AND fullscreen_warning_threshold <= 10) DEFAULT 3,
    eligible_coding_categories TEXT[] NOT NULL DEFAULT ARRAY['C', 'C++', 'Java', 'Python', 'Web Development', 'DSA'],
    results_published BOOLEAN NOT NULL DEFAULT false,
    participant_instructions TEXT DEFAULT 'Follow all examination rules strictly. Fullscreen is mandatory. Tab switching is logged.',
    contact_email TEXT NOT NULL DEFAULT 'lnmcbmhackathoncell@gmail.com',
    contact_phone TEXT DEFAULT '+91-621-2268100',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

DROP TRIGGER IF EXISTS set_competition_settings_updated_at ON competition_settings;
CREATE TRIGGER set_competition_settings_updated_at
    BEFORE UPDATE ON competition_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed initial competition row if not exists
INSERT INTO competition_settings (
    competition_name,
    college_name,
    status,
    contact_email
)
SELECT 'Codethon 2026', 'Lalit Narayan Mishra College of Business Management', 'registration_open', 'lnmcbmhackathoncell@gmail.com'
WHERE NOT EXISTS (SELECT 1 FROM competition_settings LIMIT 1);

-- ------------------------------------------------------------------------------
-- 5. STUDENTS DIRECTORY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    competition_id UUID REFERENCES competition_settings(id) ON DELETE CASCADE,
    roll_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    course TEXT NOT NULL,
    mobile TEXT,
    participant_id TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_roll_number UNIQUE (roll_number),
    CONSTRAINT unique_participant_id UNIQUE (participant_id)
);

CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students (roll_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON students (email);
CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_students_is_active ON students (is_active);

DROP TRIGGER IF EXISTS set_students_updated_at ON students;
CREATE TRIGGER set_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 6. CANDIDATE SELF-REGISTRATION & ID CARD REQUESTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    semester TEXT NOT NULL,
    mobile TEXT NOT NULL,
    id_card_data TEXT NOT NULL,
    id_card_mime TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_student_registrations_status ON student_registrations(status);
CREATE INDEX IF NOT EXISTS idx_student_registrations_roll ON student_registrations(roll_number);
CREATE INDEX IF NOT EXISTS idx_student_registrations_email ON student_registrations(email);

DROP TRIGGER IF EXISTS set_student_registrations_updated_at ON student_registrations;
CREATE TRIGGER set_student_registrations_updated_at
    BEFORE UPDATE ON student_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 7. PHASE 1: MCQ QUESTIONS & PASSAGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mcq_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competition_settings(id) ON DELETE CASCADE,
    track TEXT NOT NULL DEFAULT 'C',
    category TEXT NOT NULL CHECK (category IN (
        'Fundamentals', 
        'Technical Understanding', 
        'Logic and Debugging', 
        'Case Study'
    )),
    question_text TEXT NOT NULL,
    code_snippet TEXT,
    case_study_passage TEXT,
    marks INT NOT NULL CHECK (marks > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Ensure track column exists if table was created previously without it
ALTER TABLE mcq_questions ADD COLUMN IF NOT EXISTS track TEXT DEFAULT 'C';

CREATE INDEX IF NOT EXISTS idx_mcq_track ON mcq_questions (track);
CREATE INDEX IF NOT EXISTS idx_mcq_category ON mcq_questions (category);
CREATE INDEX IF NOT EXISTS idx_mcq_is_active ON mcq_questions (is_active);

DROP TRIGGER IF EXISTS set_mcq_questions_updated_at ON mcq_questions;
CREATE TRIGGER set_mcq_questions_updated_at
    BEFORE UPDATE ON mcq_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 8. MCQ OPTIONS (Visible to Students)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mcq_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES mcq_questions(id) ON DELETE CASCADE,
    option_key TEXT NOT NULL CHECK (option_key IN ('A', 'B', 'C', 'D')),
    option_text TEXT NOT NULL,
    CONSTRAINT unique_option_per_question UNIQUE (question_id, option_key)
);

CREATE INDEX IF NOT EXISTS idx_mcq_options_question_id ON mcq_options (question_id);

-- ------------------------------------------------------------------------------
-- 9. MCQ ANSWER KEYS & EXPLANATIONS (ADMIN & SERVER ROLE ONLY)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mcq_answer_keys (
    question_id UUID PRIMARY KEY REFERENCES mcq_questions(id) ON DELETE CASCADE,
    correct_option_id UUID NOT NULL REFERENCES mcq_options(id) ON DELETE CASCADE,
    correct_option_key TEXT NOT NULL CHECK (correct_option_key IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ------------------------------------------------------------------------------
-- 10. EXAM SESSIONS (Authoritative server timing & lifecycle state)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competition_settings(id) ON DELETE CASCADE,
    current_phase INT NOT NULL CHECK (current_phase IN (1, 2, 3)) DEFAULT 1,
    status TEXT NOT NULL CHECK (status IN (
        'not_started',
        'phase1_in_progress',
        'phase1_completed',
        'phase2_in_progress',
        'phase2_completed',
        'completed',
        'terminated'
    )) DEFAULT 'not_started',
    phase1_started_at TIMESTAMPTZ,
    phase1_expires_at TIMESTAMPTZ,
    phase1_submitted_at TIMESTAMPTZ,
    phase2_category TEXT,
    phase2_language TEXT,
    phase2_started_at TIMESTAMPTZ,
    phase2_expires_at TIMESTAMPTZ,
    phase2_submitted_at TIMESTAMPTZ,
    is_terminated BOOLEAN NOT NULL DEFAULT false,
    termination_reason TEXT,
    fullscreen_warnings_count INT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_session_per_student UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_student_id ON exam_sessions (student_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON exam_sessions (status);

-- ------------------------------------------------------------------------------
-- 11. MCQ STUDENT ANSWERS & ATTEMPT ORDER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mcq_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES mcq_questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES mcq_options(id) ON DELETE SET NULL,
    selected_option_key TEXT CHECK (selected_option_key IN ('A', 'B', 'C', 'D')),
    is_marked_for_review BOOLEAN NOT NULL DEFAULT false,
    question_order_index INT NOT NULL DEFAULT 0,
    shuffled_option_keys TEXT[] DEFAULT ARRAY['A', 'B', 'C', 'D'],
    saved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_answer_per_question_session UNIQUE (session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_mcq_answers_session_id ON mcq_answers (session_id);

-- ------------------------------------------------------------------------------
-- 12. PHASE 2: CODING PROBLEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coding_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competition_settings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('C', 'C++', 'Java', 'Python', 'Web Development', 'DSA')),
    programming_language TEXT,
    problem_statement TEXT NOT NULL,
    constraints TEXT NOT NULL,
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    sample_input TEXT NOT NULL,
    sample_output TEXT NOT NULL,
    time_limit_ms INT NOT NULL DEFAULT 2000,
    memory_limit_mb INT NOT NULL DEFAULT 256,
    marks_per_test_case INT NOT NULL DEFAULT 2,
    total_marks INT NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_coding_problems_category ON coding_problems (category);

DROP TRIGGER IF EXISTS set_coding_problems_updated_at ON coding_problems;
CREATE TRIGGER set_coding_problems_updated_at
    BEFORE UPDATE ON coding_problems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 13. HIDDEN TEST CASES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hidden_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
    test_case_order INT NOT NULL CHECK (test_case_order BETWEEN 1 AND 5),
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    marks INT NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_test_case_order UNIQUE (problem_id, test_case_order)
);

CREATE INDEX IF NOT EXISTS idx_hidden_test_cases_problem_id ON hidden_test_cases (problem_id);

-- ------------------------------------------------------------------------------
-- 14. CODING SUBMISSIONS (Runs & Final Submissions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coding_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
    source_code TEXT NOT NULL,
    selected_language TEXT NOT NULL,
    submission_type TEXT NOT NULL CHECK (submission_type IN ('run', 'final_submit')) DEFAULT 'run',
    is_final BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_coding_submissions_session_problem ON coding_submissions (session_id, problem_id);

-- ------------------------------------------------------------------------------
-- 15. SUBMISSION EVALUATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submission_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL UNIQUE REFERENCES coding_submissions(id) ON DELETE CASCADE,
    evaluation_status TEXT NOT NULL CHECK (evaluation_status IN (
        'pending', 
        'evaluating', 
        'completed', 
        'error'
    )) DEFAULT 'pending',
    passed_test_cases INT NOT NULL CHECK (passed_test_cases BETWEEN 0 AND 5) DEFAULT 0,
    awarded_marks INT NOT NULL CHECK (awarded_marks BETWEEN 0 AND 10) DEFAULT 0,
    execution_summary JSONB DEFAULT '{}'::jsonb,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_submission_evaluations_submission_id ON submission_evaluations (submission_id);

-- ------------------------------------------------------------------------------
-- 16. MONITORING EVENTS & PROCTORING AUDIT
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitoring_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'fullscreen_exit',
        'window_blur',
        'tab_switch',
        'devtools_open',
        'warning_threshold_exceeded',
        'auto_terminated'
    )),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_monitoring_events_session_id ON monitoring_events (session_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_events_student_id ON monitoring_events (student_id);

-- ------------------------------------------------------------------------------
-- 17. FINAL RESULTS & SCORECARDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS final_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    session_id UUID REFERENCES exam_sessions(id) ON DELETE CASCADE,
    phase1_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    coding_q1_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    coding_q2_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    total_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
    rank INT,
    is_finalized BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT false,
    verification_id TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    finalized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Ensure all required columns exist even if the table was created in an earlier migration
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS rank INT;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS state_merit_rank INT;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS phase1_score NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS phase1_mcq_score INT DEFAULT 0;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS coding_q1_score NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS coding_q2_score NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS phase2_coding_score INT DEFAULT 0;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS total_score NUMERIC(5, 2) DEFAULT 0;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS total_time_taken_seconds INT DEFAULT 0;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS is_finalized BOOLEAN DEFAULT false;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS is_disqualified BOOLEAN DEFAULT false;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS disqualification_reason TEXT;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS verification_id TEXT;
ALTER TABLE final_results ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_final_results_student_id ON final_results (student_id);
CREATE INDEX IF NOT EXISTS idx_final_results_rank ON final_results (rank);
CREATE INDEX IF NOT EXISTS idx_final_results_total_score ON final_results (total_score DESC);
CREATE INDEX IF NOT EXISTS idx_final_results_verification_id ON final_results (verification_id);

DROP TRIGGER IF EXISTS set_final_results_updated_at ON final_results;
CREATE TRIGGER set_final_results_updated_at
    BEFORE UPDATE ON final_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 18. EMAIL DELIVERY LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    email_type TEXT NOT NULL DEFAULT 'credentials',
    recipient_email TEXT NOT NULL,
    provider_message_id TEXT,
    delivery_status TEXT NOT NULL,
    attempt_count INT NOT NULL DEFAULT 1,
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Relax delivery_status check constraint to support all provider statuses
ALTER TABLE email_delivery_logs DROP CONSTRAINT IF EXISTS email_delivery_logs_delivery_status_check;

CREATE INDEX IF NOT EXISTS idx_email_delivery_student_id ON email_delivery_logs (student_id);

-- ------------------------------------------------------------------------------
-- 19. AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    actor_email TEXT,
    action TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- ==============================================================================
-- SUCCESS MESSAGE
-- ==============================================================================
DO $$
BEGIN
    RAISE NOTICE 'LNMCBM Codethon 2026 database schema successfully provisioned!';
END;
$$;

