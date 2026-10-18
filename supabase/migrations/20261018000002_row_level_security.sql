-- ==============================================================================
-- COLLEGE CODING COMPETITION PORTAL - ROW LEVEL SECURITY (RLS) POLICIES
-- Institution: Lalit Narayan Mishra College of Business Management (LNMCBM)
-- File: 20261018000002_row_level_security.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SECURITY DEFINER HELPER FUNCTIONS
-- (Fast, secure role evaluation executed within trusted database context)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'student'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.current_student_id()
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_student_id UUID;
BEGIN
    SELECT id INTO v_student_id 
    FROM students 
    WHERE auth_user_id = auth.uid() 
    LIMIT 1;
    RETURN v_student_id;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "profiles_select_own_or_admin" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR public.is_admin()
    );

CREATE POLICY "profiles_insert_own_or_admin" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id OR public.is_admin()
    );

CREATE POLICY "profiles_update_own_or_admin" ON profiles
    FOR UPDATE USING (
        auth.uid() = id OR public.is_admin()
    ) WITH CHECK (
        -- User cannot escalate their own role
        public.is_admin() OR (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()))
    );

CREATE POLICY "profiles_delete_admin_only" ON profiles
    FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. COMPETITION SETTINGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "settings_select_authenticated" ON competition_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "settings_modify_admin_only" ON competition_settings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. STUDENTS DIRECTORY POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "students_select_own_or_admin" ON students
    FOR SELECT USING (
        public.is_admin() OR auth_user_id = auth.uid()
    );

CREATE POLICY "students_modify_admin_only" ON students
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. MCQ QUESTIONS & OPTIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "mcq_questions_select" ON mcq_questions
    FOR SELECT USING (
        public.is_admin() OR (is_active = true AND auth.role() = 'authenticated')
    );

CREATE POLICY "mcq_questions_modify_admin" ON mcq_questions
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "mcq_options_select" ON mcq_options
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "mcq_options_modify_admin" ON mcq_options
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. MCQ ANSWER KEYS POLICIES (STRICT: ZERO STUDENT ACCESS)
-- ------------------------------------------------------------------------------
CREATE POLICY "answer_keys_admin_only" ON mcq_answer_keys
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. EXAM SESSIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "sessions_select_own_or_admin" ON exam_sessions
    FOR SELECT USING (
        public.is_admin() OR student_id = public.current_student_id()
    );

CREATE POLICY "sessions_update_own_or_admin" ON exam_sessions
    FOR UPDATE USING (
        public.is_admin() OR (student_id = public.current_student_id() AND is_terminated = false)
    ) WITH CHECK (
        public.is_admin() OR (student_id = public.current_student_id())
    );

CREATE POLICY "sessions_admin_insert_delete" ON exam_sessions
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. MCQ ANSWERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "answers_select_own_or_admin" ON mcq_answers
    FOR SELECT USING (
        public.is_admin() OR session_id IN (
            SELECT id FROM exam_sessions WHERE student_id = public.current_student_id()
        )
    );

CREATE POLICY "answers_write_own_active_session" ON mcq_answers
    FOR INSERT WITH CHECK (
        public.is_admin() OR session_id IN (
            SELECT id FROM exam_sessions 
            WHERE student_id = public.current_student_id()
              AND is_terminated = false 
              AND status = 'phase1_in_progress'
              AND (phase1_expires_at IS NULL OR phase1_expires_at >= timezone('utc', now()))
        )
    );

CREATE POLICY "answers_update_own_active_session" ON mcq_answers
    FOR UPDATE USING (
        public.is_admin() OR session_id IN (
            SELECT id FROM exam_sessions 
            WHERE student_id = public.current_student_id()
              AND is_terminated = false 
              AND status = 'phase1_in_progress'
              AND (phase1_expires_at IS NULL OR phase1_expires_at >= timezone('utc', now()))
        )
    ) WITH CHECK (
        public.is_admin() OR session_id IN (
            SELECT id FROM exam_sessions 
            WHERE student_id = public.current_student_id()
              AND is_terminated = false 
              AND status = 'phase1_in_progress'
              AND (phase1_expires_at IS NULL OR phase1_expires_at >= timezone('utc', now()))
        )
    );

-- ------------------------------------------------------------------------------
-- 10. CODING PROBLEMS & HIDDEN TEST CASES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "coding_problems_select" ON coding_problems
    FOR SELECT USING (
        public.is_admin() OR (is_active = true AND auth.role() = 'authenticated')
    );

CREATE POLICY "coding_problems_modify_admin" ON coding_problems
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- HIDDEN TEST CASES: Strictly accessible ONLY by admin or server execution engine
CREATE POLICY "hidden_test_cases_admin_only" ON hidden_test_cases
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 11. CODING SUBMISSIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "submissions_select_own_or_admin" ON coding_submissions
    FOR SELECT USING (
        public.is_admin() OR session_id IN (
            SELECT id FROM exam_sessions WHERE student_id = public.current_student_id()
        )
    );

CREATE POLICY "submissions_insert_own_active_session" ON coding_submissions
    FOR INSERT WITH CHECK (
        public.is_admin() OR session_id IN (
            SELECT id FROM exam_sessions 
            WHERE student_id = public.current_student_id()
              AND is_terminated = false 
              AND status = 'phase2_in_progress'
              AND (phase2_expires_at IS NULL OR phase2_expires_at >= timezone('utc', now()))
        )
    );

-- ------------------------------------------------------------------------------
-- 12. SUBMISSION EVALUATIONS POLICIES (STUDENTS CANNOT WRITE SCORES)
-- ------------------------------------------------------------------------------
CREATE POLICY "evaluations_select_own_or_admin" ON submission_evaluations
    FOR SELECT USING (
        public.is_admin() OR submission_id IN (
            SELECT id FROM coding_submissions 
            WHERE session_id IN (
                SELECT id FROM exam_sessions WHERE student_id = public.current_student_id()
            )
        )
    );

CREATE POLICY "evaluations_modify_admin_only" ON submission_evaluations
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 13. MONITORING EVENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "monitoring_select_own_or_admin" ON monitoring_events
    FOR SELECT USING (
        public.is_admin() OR student_id = public.current_student_id()
    );

CREATE POLICY "monitoring_insert_own_session" ON monitoring_events
    FOR INSERT WITH CHECK (
        public.is_admin() OR (
            student_id = public.current_student_id() AND
            session_id IN (
                SELECT id FROM exam_sessions WHERE student_id = public.current_student_id()
            )
        )
    );

-- ------------------------------------------------------------------------------
-- 14. FINAL RESULTS POLICIES (STUDENTS CAN ONLY VIEW PUBLISHED RESULTS)
-- ------------------------------------------------------------------------------
CREATE POLICY "results_select_own_published_or_admin" ON final_results
    FOR SELECT USING (
        public.is_admin() OR (
            student_id = public.current_student_id() AND is_published = true
        )
    );

CREATE POLICY "results_modify_admin_only" ON final_results
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 15. EMAIL DELIVERY LOGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "email_logs_admin_only" ON email_delivery_logs
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 16. AUDIT LOGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "audit_logs_select_admin_only" ON audit_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "audit_logs_insert_authenticated" ON audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

