-- ==============================================================================
-- COLLEGE CODING COMPETITION PORTAL - DATABASE SCHEMA MIGRATION
-- Institution: Lalit Narayan Mishra College of Business Management (LNMCBM)
-- File: 20261018000001_initial_schema.sql
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper trigger function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES & ROLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')) DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Prevent regular users from updating their own role directly
CREATE OR REPLACE FUNCTION prevent_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.role <> NEW.role) AND (auth.uid() = OLD.id) THEN
        -- Only service-role or existing admins can alter roles
        IF NOT EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Privilege escalation rejected: Only administrators can assign user roles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_role_escalation
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_self_escalation();

-- ------------------------------------------------------------------------------
-- 3. COMPETITION SETTINGS
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
    )) DEFAULT 'draft',
    phase1_duration_minutes INT NOT NULL CHECK (phase1_duration_minutes >= 5 AND phase1_duration_minutes <= 180) DEFAULT 45,
    phase2_duration_minutes INT NOT NULL CHECK (phase2_duration_minutes >= 5 AND phase2_duration_minutes <= 180) DEFAULT 30,
    fullscreen_warning_threshold INT NOT NULL CHECK (fullscreen_warning_threshold >= 1 AND fullscreen_warning_threshold <= 10) DEFAULT 3,
    eligible_coding_categories TEXT[] NOT NULL DEFAULT ARRAY['C', 'C++', 'Java', 'Python', 'Web Development', 'DSA'],
    results_published BOOLEAN NOT NULL DEFAULT false,
    participant_instructions TEXT DEFAULT 'Follow all examination rules strictly. Fullscreen is mandatory. Tab switching is logged.',
    contact_email TEXT NOT NULL DEFAULT 'exams@lnmcbm.ac.in',
    contact_phone TEXT DEFAULT '+91-621-2268100',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER set_competition_settings_updated_at
    BEFORE UPDATE ON competition_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. STUDENTS DIRECTORY
-- (Plaintext passwords are NEVER stored; auth is managed via Supabase auth.users)
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
    CONSTRAINT unique_participant_id UNIQUE (participant_id),
    CONSTRAINT valid_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students (roll_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON students (email);
CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON students (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_students_is_active ON students (is_active);

CREATE TRIGGER set_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. PHASE 1: MCQ QUESTIONS & PASSAGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mcq_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competition_settings(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_mcq_category ON mcq_questions (category);
CREATE INDEX IF NOT EXISTS idx_mcq_is_active ON mcq_questions (is_active);

CREATE TRIGGER set_mcq_questions_updated_at
    BEFORE UPDATE ON mcq_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 6. MCQ OPTIONS (Visible to Students)
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
-- 7. MCQ ANSWER KEYS & EXPLANATIONS (ADMIN & SERVER ONLY - STRICTLY PROTECTED)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mcq_answer_keys (
    question_id UUID PRIMARY KEY REFERENCES mcq_questions(id) ON DELETE CASCADE,
    correct_option_id UUID NOT NULL REFERENCES mcq_options(id) ON DELETE CASCADE,
    correct_option_key TEXT NOT NULL CHECK (correct_option_key IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ------------------------------------------------------------------------------
-- 8. EXAM SESSIONS (Authoritative server timing & lifecycle state)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    competition_id UUID NOT NULL REFERENCES competition_settings(id) ON DELETE CASCADE,
    current_phase INT NOT NULL CHECK (current_phase IN (1, 2, 3)) DEFAULT 1,
    status TEXT NOT NULL CHECK (status IN (
        'not_started',
        'phase1_in_progress',
        'phase1_completed',
        'phase2_in_progress',
        'phase2_completed',
        'terminated'
    )) DEFAULT 'not_started',
    phase1_started_at TIMESTAMPTZ,
    phase1_expires_at TIMESTAMPTZ,
    phase1_submitted_at TIMESTAMPTZ,
    phase2_category TEXT CHECK (phase2_category IN ('C', 'C++', 'Java', 'Python', 'Web Development', 'DSA')),
    phase2_language TEXT,
    phase2_started_at TIMESTAMPTZ,
    phase2_expires_at TIMESTAMPTZ,
    phase2_submitted_at TIMESTAMPTZ,
    is_terminated BOOLEAN NOT NULL DEFAULT false,
    termination_reason TEXT,
    fullscreen_warnings_count INT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_session_per_student UNIQUE (student_id, competition_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_student_id ON exam_sessions (student_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON exam_sessions (status);

-- ------------------------------------------------------------------------------
-- 9. MCQ STUDENT ANSWERS & ATTEMPT ORDER PERSISTENCE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mcq_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES mcq_questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES mcq_options(id) ON DELETE SET NULL,
    selected_option_key TEXT CHECK (selected_option_key IN ('A', 'B', 'C', 'D')),
    is_marked_for_review BOOLEAN NOT NULL DEFAULT false,
    question_order_index INT NOT NULL,
    shuffled_option_keys TEXT[] DEFAULT ARRAY['A', 'B', 'C', 'D'],
    saved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_answer_per_question_session UNIQUE (session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_mcq_answers_session_id ON mcq_answers (session_id);

-- ------------------------------------------------------------------------------
-- 10. PHASE 2: CODING PROBLEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coding_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID REFERENCES competition_settings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('C', 'C++', 'Java', 'Python', 'Web Development', 'DSA')),
    programming_language TEXT, -- Selected language for DSA (C, C++, Java)
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

CREATE TRIGGER set_coding_problems_updated_at
    BEFORE UPDATE ON coding_problems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 11. HIDDEN TEST CASES (ADMIN & EVALUATION ENGINE ONLY - 100% PROTECTED)
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
-- 12. CODING SUBMISSIONS (Run requests & Final Submissions)
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

-- Mathematical guarantee: only 1 final submission per problem per exam session!
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_final_submission 
    ON coding_submissions (session_id, problem_id) 
    WHERE is_final = true;

-- ------------------------------------------------------------------------------
-- 13. SUBMISSION EVALUATIONS
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
-- 14. MONITORING EVENTS & PROCTORING AUDIT
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
-- 15. FINAL RESULTS & SCORECARDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS final_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
    phase1_score NUMERIC(5, 2) NOT NULL CHECK (phase1_score >= 0 AND phase1_score <= 80) DEFAULT 0,
    coding_q1_score NUMERIC(5, 2) NOT NULL CHECK (coding_q1_score >= 0 AND coding_q1_score <= 10) DEFAULT 0,
    coding_q2_score NUMERIC(5, 2) NOT NULL CHECK (coding_q2_score >= 0 AND coding_q2_score <= 10) DEFAULT 0,
    total_score NUMERIC(5, 2) NOT NULL CHECK (total_score >= 0 AND total_score <= 100) DEFAULT 0,
    rank INT,
    is_finalized BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT false,
    verification_id TEXT NOT NULL UNIQUE,
    finalized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_final_results_student_id ON final_results (student_id);
CREATE INDEX IF NOT EXISTS idx_final_results_total_score ON final_results (total_score DESC);
CREATE INDEX IF NOT EXISTS idx_final_results_verification_id ON final_results (verification_id);

CREATE TRIGGER set_final_results_updated_at
    BEFORE UPDATE ON final_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 16. EMAIL DELIVERY LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    email_type TEXT NOT NULL CHECK (email_type IN ('credentials', 'reminder', 'scorecard')),
    recipient_email TEXT NOT NULL,
    provider_message_id TEXT,
    delivery_status TEXT NOT NULL CHECK (delivery_status IN (
        'queued', 
        'accepted', 
        'delivered', 
        'failed', 
        'bounced'
    )) DEFAULT 'queued',
    attempt_count INT NOT NULL DEFAULT 1,
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_email_delivery_student_id ON email_delivery_logs (student_id);

CREATE TRIGGER set_email_delivery_logs_updated_at
    BEFORE UPDATE ON email_delivery_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 17. AUDIT LOGS (Immutable security log)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

