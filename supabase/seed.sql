-- ==============================================================================
-- COLLEGE CODING COMPETITION PORTAL - DEVELOPMENT SEED FIXTURES
-- Institution: Lalit Narayan Mishra College of Business Management (LNMCBM)
-- File: supabase/seed.sql
-- ==============================================================================
-- NOTE: For local/testing environments ONLY.
-- Do NOT run this in production without verifying contest questions.
-- ==============================================================================

DO $$
DECLARE
    v_comp_id UUID := '11111111-1111-1111-1111-111111111111';
    v_q_id UUID;
    v_opt_a UUID;
    v_opt_b UUID;
    v_opt_c UUID;
    v_opt_d UUID;
    v_prob_id UUID;
BEGIN
    -- 1. Create Default Competition
    INSERT INTO competition_settings (
        id, competition_name, college_name, college_logo_url, 
        phase1_duration_minutes, phase2_duration_minutes, 
        fullscreen_warning_threshold, registration_status, status,
        contact_email
    ) VALUES (
        v_comp_id,
        'Codethon 2026',
        'Lalit Narayan Mishra College of Business Management',
        '/images/college-logo.png',
        45, 30, 3, 'open', 'ready',
        'exams@lnmcbm.ac.in'
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Insert 40 Standard MCQ Questions (10 Fundamentals, 10 Technical, 10 Logic, 10 Case Study)
    -- Total: 40 Questions = 80 Marks

    -- A. Fundamentals (10 Questions, 1 Mark each = 10 Marks)
    FOR i IN 1..10 LOOP
        v_q_id := gen_random_uuid();
        INSERT INTO mcq_questions (id, competition_id, category, question_text, marks, is_active)
        VALUES (
            v_q_id, v_comp_id, 'Fundamentals',
            'Fundamentals Question ' || i || ': In computational time complexity analysis, what is the best-case time complexity of standard Binary Search on a sorted array of size N?',
            1, true
        );

        v_opt_a := gen_random_uuid();
        v_opt_b := gen_random_uuid();
        v_opt_c := gen_random_uuid();
        v_opt_d := gen_random_uuid();

        INSERT INTO mcq_options (id, question_id, option_key, option_text) VALUES
            (v_opt_a, v_q_id, 'A', 'O(1)'),
            (v_opt_b, v_q_id, 'B', 'O(log N)'),
            (v_opt_c, v_q_id, 'C', 'O(N)'),
            (v_opt_d, v_q_id, 'D', 'O(N log N)');

        INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
        VALUES (v_q_id, v_opt_a, 'A', 'Best case occurs when target element is exactly at the middle index on the first comparison.');
    END LOOP;

    -- B. Technical Understanding (10 Questions, 2 Marks each = 20 Marks)
    FOR i IN 1..10 LOOP
        v_q_id := gen_random_uuid();
        INSERT INTO mcq_questions (id, competition_id, category, question_text, marks, is_active)
        VALUES (
            v_q_id, v_comp_id, 'Technical Understanding',
            'Technical Understanding Question ' || i || ': Which memory area in the Java Virtual Machine (JVM) is shared across all concurrent execution threads?',
            2, true
        );

        v_opt_a := gen_random_uuid();
        v_opt_b := gen_random_uuid();
        v_opt_c := gen_random_uuid();
        v_opt_d := gen_random_uuid();

        INSERT INTO mcq_options (id, question_id, option_key, option_text) VALUES
            (v_opt_a, v_q_id, 'A', 'Program Counter (PC) Register'),
            (v_opt_b, v_q_id, 'B', 'JVM Thread Stack'),
            (v_opt_c, v_q_id, 'C', 'Heap Memory & Method Area'),
            (v_opt_d, v_q_id, 'D', 'Native Method Stack');

        INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
        VALUES (v_q_id, v_opt_c, 'C', 'Heap and Method areas are allocated when the JVM starts and shared by all running threads.');
    END LOOP;

    -- C. Logic and Debugging (10 Questions, 3 Marks each = 30 Marks)
    FOR i IN 1..10 LOOP
        v_q_id := gen_random_uuid();
        INSERT INTO mcq_questions (id, competition_id, category, question_text, code_snippet, marks, is_active)
        VALUES (
            v_q_id, v_comp_id, 'Logic and Debugging',
            'Logic & Debugging Question ' || i || ': Examine the following code snippet. What will be the exact standard output after execution?',
            E'int a = 5;\nint b = a++ + ++a;\nprintf("%d", b);',
            3, true
        );

        v_opt_a := gen_random_uuid();
        v_opt_b := gen_random_uuid();
        v_opt_c := gen_random_uuid();
        v_opt_d := gen_random_uuid();

        INSERT INTO mcq_options (id, question_id, option_key, option_text) VALUES
            (v_opt_a, v_q_id, 'A', '10'),
            (v_opt_b, v_q_id, 'B', '12'),
            (v_opt_c, v_q_id, 'C', '11'),
            (v_opt_d, v_q_id, 'D', 'Undefined Behavior');

        INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
        VALUES (v_q_id, v_opt_b, 'B', 'In sequence points evaluation: a++ yields 5 (a becomes 6), ++a yields 7. 5 + 7 = 12.');
    END LOOP;

    -- D. Case Study (10 Questions, 2 Marks each = 20 Marks)
    FOR i IN 1..10 LOOP
        v_q_id := gen_random_uuid();
        INSERT INTO mcq_questions (id, competition_id, category, question_text, case_study_passage, marks, is_active)
        VALUES (
            v_q_id, v_comp_id, 'Case Study',
            'Case Study Question ' || i || ': Based on the system architecture scenario described, which index type provides optimal performance for range queries on the transaction timestamp?',
            'SCENARIO PASSAGE: LNMCBM Campus Financial Services processes 50,000 daily micro-transactions. Queries frequently request transactions filtered by date ranges (e.g., between Oct 1 and Oct 15) sorted in descending order.',
            2, true
        );

        v_opt_a := gen_random_uuid();
        v_opt_b := gen_random_uuid();
        v_opt_c := gen_random_uuid();
        v_opt_d := gen_random_uuid();

        INSERT INTO mcq_options (id, question_id, option_key, option_text) VALUES
            (v_opt_a, v_q_id, 'A', 'Hash Index'),
            (v_opt_b, v_q_id, 'B', 'B-Tree Index'),
            (v_opt_c, v_q_id, 'C', 'Bitmap Index only'),
            (v_opt_d, v_q_id, 'D', 'Full Text Inverted Index');

        INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
        VALUES (v_q_id, v_opt_b, 'B', 'B-Tree indexes maintain sorted order and support O(log N) equality and range boundary scanning.');
    END LOOP;

    -- 3. Insert Sample Coding Problems for Tracks with 5 Hidden Test Cases (10 Marks each)
    -- Sample Problem 1: C / C++ / Python / Java
    v_prob_id := '22222222-2222-2222-2222-222222222222';
    INSERT INTO coding_problems (
        id, competition_id, title, slug, category, problem_statement,
        constraints, input_format, output_format, sample_input, sample_output,
        marks_per_test_case, total_marks, is_active
    ) VALUES (
        v_prob_id, v_comp_id,
        'Sum of Prime Factors',
        'sum-of-prime-factors',
        'Python',
        'Given a positive integer N, compute and return the sum of all distinct prime factors of N.',
        '2 <= N <= 10^7',
        'A single integer N on standard input.',
        'Print the integer sum of distinct prime factors to standard output.',
        '12',
        '5',
        2, 10, true
    ) ON CONFLICT (id) DO NOTHING;

    -- 5 Hidden Test Cases for Problem 1 (2 Marks each = 10 Marks)
    INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks) VALUES
        (v_prob_id, 1, '18', '5', 2),
        (v_prob_id, 2, '30', '10', 2),
        (v_prob_id, 3, '100', '7', 2),
        (v_prob_id, 4, '97', '97', 2),
        (v_prob_id, 5, '100000', '7', 2)
    ON CONFLICT (problem_id, test_case_order) DO NOTHING;

    -- Sample Problem 2: DSA Track (C/C++/Java)
    v_prob_id := '33333333-3333-3333-3333-333333333333';
    INSERT INTO coding_problems (
        id, competition_id, title, slug, category, programming_language,
        problem_statement, constraints, input_format, output_format,
        sample_input, sample_output, marks_per_test_case, total_marks, is_active
    ) VALUES (
        v_prob_id, v_comp_id,
        'Balanced Parentheses Depth',
        'balanced-parentheses-depth',
        'DSA',
        'C++',
        'Given a valid parentheses string S, compute the maximum nesting depth of the parentheses.',
        '1 <= S.length <= 10^5',
        'A single line containing the string S.',
        'Print a single integer indicating maximum nesting depth.',
        '(1+(2*3)+((8)/4))+1',
        '3',
        2, 10, true
    ) ON CONFLICT (id) DO NOTHING;

    -- 5 Hidden Test Cases for Problem 2 (2 Marks each = 10 Marks)
    INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks) VALUES
        (v_prob_id, 1, '(1)+((2))+(((3)))', '3', 2),
        (v_prob_id, 2, '1+(2*3)/(2-1)', '1', 2),
        (v_prob_id, 3, '1', '0', 2),
        (v_prob_id, 4, '((((10))))', '4', 2),
        (v_prob_id, 5, '()(())((()))', '3', 2)
    ON CONFLICT (problem_id, test_case_order) DO NOTHING;

END $$;

