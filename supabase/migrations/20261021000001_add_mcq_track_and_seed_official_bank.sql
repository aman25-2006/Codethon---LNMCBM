-- ============================================================================
-- CODTHON 2026: PHASE 1 OFFICIAL QUESTION BANK MIGRATION & SEED
-- Adds track column to mcq_questions and seeds all 240 official MCQs
-- across 6 competition tracks (C, C++, Java, Python, Web Development, DSA)
-- ============================================================================

-- 1. Add track column if it doesn't already exist
ALTER TABLE mcq_questions ADD COLUMN IF NOT EXISTS track TEXT DEFAULT 'C' CHECK (track IN ('C', 'C++', 'Java', 'Python', 'Web Development', 'DSA'));
CREATE INDEX IF NOT EXISTS idx_mcq_track ON mcq_questions (track);

-- 2. Temporary procedure to seed questions idempotently
DO $$
DECLARE
    q_id UUID;
    opt_a_id UUID;
    opt_b_id UUID;
    opt_c_id UUID;
    opt_d_id UUID;
    corr_id UUID;
BEGIN
    -- Track C Q1 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Fundamentals', 'Which of the following header files must be included in a standard C program to use printf() and scanf() functions?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '<stdlib.h>') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '<stdio.h>') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '<conio.h>') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '<string.h>') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q2 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Fundamentals', 'What is the standard format specifier used in C to read or print a double-precision floating-point number using printf() ?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '%f') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '%lf') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '%d') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '%c') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q3 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Fundamentals', 'Which of the following is a VALID identifier name in C?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '2nd_student') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'total$sum') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '_student_score') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'float') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q4 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Fundamentals', 'What is the default return type of the main() function in standard C according to the ISO C standard?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'void') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'int') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'float') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'char') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q5 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Fundamentals', 'What does the dereference operator * do when applied to a pointer variable in C?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Returns the memory address where the pointer is stored') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Multiplies the pointer by a scalar constant') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Accesses or manipulates the value stored at the memory address pointed to') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Allocates dynamic heap memory') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q6 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Fundamentals', 'Which operator in C is used to determine the memory address of an existing variable?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '*') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '->') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '&') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '%') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q7 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Fundamentals', 'In C, what is the mandatory sentinel character that terminates all standard character strings?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '''\n''') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', ''' '' (Space)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '''\0''') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '''EOF''') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q8 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Fundamentals', 'What is the index of the very first element in an array of size N in the C programming language?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '1') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '-1') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'N - 1') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q9 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Fundamentals', 'What is the result of evaluating the arithmetic expression 17 % 5 in C?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '3.4') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '3') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '2') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '1') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q10 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Fundamentals', 'Which of the following standard string library functions is used to concatenate (append) one string to the end of another in C?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'strcpy()') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'strcmp()') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'strcat()') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'strlen()') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q11 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Technical Understanding', 'Consider the following integer variable declaration:
int marks = 75;
Which condition correctly tests if marks is between 60 and 80 inclusive?', 'int marks = 75;', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '60 <= marks <= 80') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'marks >= 60 || marks <= 80') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'marks >= 60 && marks <= 80') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'marks == (60 && 80)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q12 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Technical Understanding', 'How many times will the body of the following do-while loop execute?', 'int count = 5;
do {
    count++;
} while (count < 5);', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '0 times') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '1 time') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '5 times') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Infinite loop') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q13 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Technical Understanding', 'In a C switch statement, what occurs if a matching case does not contain a break statement?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Compile-time syntax error') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'The program immediately exits the switch') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Execution falls through to subsequent case blocks until a break or closing brace is reached') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'The default block executes immediately') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q14 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Technical Understanding', 'What is the return value of strcmp(\', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Positive integer (> 0)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Negative integer (< 0)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Undefined behavior') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q15 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Technical Understanding', 'Consider the following array declaration:
int arr[5] = {10, 20, 30};
What are the values of arr[3] and arr[4] in C?', 'int arr[5] = {10, 20, 30};', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Garbage values') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '10 and 20') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '0 and 0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compile-time error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q16 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Technical Understanding', 'What is the effect of the continue statement when encountered inside a for loop?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Terminates the loop immediately') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Skips the rest of the current iteration and jumps directly to the update expression') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Restarts the loop from the beginning') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Exits the enclosing function') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q17 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Technical Understanding', 'Consider the following code snippet:
What is printed by this program?', 'void compute(int val) {\n    val = val + 10;\n}\nint main() {\n    int x = 20;\n    compute(x);\n    printf(\', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '30') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '20') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compilation error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q18 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Technical Understanding', 'What is the memory size allocated to a single char variable in standard C?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '1 byte') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '2 bytes') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '4 bytes') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '8 bytes') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q19 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Technical Understanding', 'What is the output of the following C code snippet?', 'int a = 0, b = 5;\nif (a && ++b) {\n    printf(\', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'True b = 6') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'b = 6') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'b = 5') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'True b = 5') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q20 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Technical Understanding', 'What will be printed by the following code?', 'int x = 5;\nint y = x++ + ++x;\nprintf(\', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'y = 12') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'y = 11') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'y = 10') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Undefined behavior in C standard') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q21 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Logic and Debugging', 'What is the output of the following C program?', '#include <stdio.h>\nint main() {\n    int sum = 0;\n    for (int i = 1; i <= 4; i++) {\n        sum += i;\n    }\n    printf(\', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '4') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '10') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '6') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '15') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q22 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Logic and Debugging', 'What is printed by the following C snippet?', 'int p = 12, q = 5;\nfloat res = p / q;\nprintf(\', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '2.4') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '2.0') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '2') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '2.5') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q23 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Logic and Debugging', 'What is the output of the following pointer code?', '#include <stdio.h>\nint main() {\n    int num = 40;\n    int *ptr = &num;\n    *ptr = *ptr + 15;\n    printf(\', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '40') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '15') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '55') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Address of num') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q24 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Logic and Debugging', 'What is printed by the following loop construct?', 'int count = 0;\nfor (int i = 0; i < 3; i++) {\n    for (int j = 0; j < 2; j++) {\n        count++;\n    }\n}\nprintf(\', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '5') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '6') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '9') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '4') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q25 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Logic and Debugging', 'What is the output of the following string code?', '#include <stdio.h>\n#include <string.h>\nint main() {\n    char str[] = \', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Cod (len = 3)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Codthon (len = 7)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Codthon (len = 3)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Cod (len = 7)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q26 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Logic and Debugging', 'Identify the compile-time syntax error in the following function definition:', 'int multiply(int a, int b) {
    int prod = a * b;
    return;
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Parameter list must use semicolons') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Variable prod must be global') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'The function return type is int, but return; provides no value expression') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Multiplication cannot be performed in functions') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q27 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Logic and Debugging', 'What is the output of the following array processing loop?', 'int arr[] = {3, 7, 2, 9, 4};\nint max = arr[0];\nfor (int i = 1; i < 5; i++) {\n    if (arr[i] > max) {\n        max = arr[i];\n    }\n}\nprintf(\', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '3') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '4') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '9') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '7') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q28 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Logic and Debugging', 'What will be printed by the following code?', 'int k = 1;\nswitch (k) {\n    case 1: printf(\', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'A') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'A B') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'A B C D') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'B') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q29 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Logic and Debugging', 'What is the output of the following C program?', '#include <stdio.h>\nint main() {\n    int a = 10, b = 20;\n    if (a = 5) {\n        printf(\', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '10') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Equal 5') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '5') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compilation error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q30 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Logic and Debugging', 'What is the output of the following code involving pointers and arrays?', '#include <stdio.h>\nint main() {\n    int vals[] = {100, 200, 300};\n    int *p = vals;\n    p++;\n    printf(\', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '100') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '101') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '200') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '300') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q31 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Case Study', '[Scenario: Student Grading System] A college grading module assigns ''Pass'' if a student scores at least 40 in theory and at least 20 in practical, otherwise ''Fail''. Which C statement accurately implements this logic?', NULL, 'Scenario: Student Grading System
A college grading module assigns ''Pass'' if a student scores at least 40 in theory and at least 20 in practical, otherwise ''Fail''.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'if (theory >= 40 || practical >= 20) printf(\') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'if (theory >= 40 && practical >= 20) printf(\') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'if (theory + practical >= 60) printf(\') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if (theory > 40 && practical > 20) printf(\') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q32 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Case Study', '[Scenario: Supermarket Billing System] A store offers a 10% discount on total purchases exceeding 1000 rupees. Which snippet correctly computes final_bill ?', NULL, 'Scenario: Supermarket Billing System
A store offers a 10% discount on total purchases exceeding 1000 rupees.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'if (total > 1000) final_bill = total * 0.10;') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'if (total >= 1000) final_bill = total * 0.90; else final_bill = total;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'if (total > 1000) final_bill = total * 0.90; else final_bill = total;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'final_bill = total - 10;') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q33 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Case Study', '[Scenario: Sensor Data Logging] An IoT temperature monitor records 7 daily readings in an array float temp[7] . Which code snippet correctly calculates the weekly average temperature?', NULL, 'Scenario: Sensor Data Logging
An IoT temperature monitor records 7 daily readings in an array float temp[7].', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'float sum = 0; for (int i = 0; i <= 7; i++) sum += temp[i]; float avg = sum / 7;') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'float sum = 0; for (int i = 0; i < 7; i++) sum += temp[i]; float avg = sum / 7.0;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'float avg = temp[0] + temp[6] / 2.0;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'float sum = temp[7]; float avg = sum / 7;') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q34 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Case Study', '[Scenario: Bank ATM Cash Dispenser] An ATM accepts withdrawal amount W only if W is a positive multiple of 100. Which condition properly validates W ?', NULL, 'Scenario: Bank ATM Cash Dispenser
An ATM accepts withdrawal amount W only if W is a positive multiple of 100.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'if (W > 0 && W % 100 == 0)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'if (W > 0 || W / 100 == 0)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'if (W % 100 != 0)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if (W >= 100 && W % 10 == 0)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q35 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Case Study', '[Scenario: Attendance Shortage Detector] A college regulation requires a student to maintain at least 75% attendance across total_classes . Which formula correctly checks if a student with attended classes is eligible?', NULL, 'Scenario: Attendance Shortage Detector
A college regulation requires a student to maintain at least 75% attendance across total_classes.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'if ((attended / total_classes) * 100 >= 75)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'if ((float)attended / total_classes >= 0.75)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'if (attended * 75 >= total_classes)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if (attended >= 75)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q36 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Case Study', '[Scenario: Inventory Stock Counter] A warehouse system represents items in stock as positive numbers, out of stock as 0, and returned items as negative. A clerk wants to count how many items are currently in stock from an array int inv[N] . Which loop structure achieves this?', NULL, 'Scenario: Inventory Stock Counter
A warehouse system represents items in stock as positive numbers, out of stock as 0, and returned items as negative. A clerk wants to count how many items are currently in stock from an array int inv[N].', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'int count = 0; for(int i=0; i<N; i++) if(inv[i] >= 0) count++;') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'int count = 0; for(int i=0; i<N; i++) if(inv[i] > 0) count++;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'int count = 0; for(int i=0; i<N; i++) if(inv[i] != 0) count++;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'int count = N - inv[0];') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q37 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Case Study', '[Scenario: User Password Length Validation] A registration portal requires the user''s password to be between 8 and 16 characters inclusive. Given char pwd[50]; , which code segment correctly verifies this rule?', NULL, 'Scenario: User Password Length Validation
A registration portal requires the user''s password to be between 8 and 16 characters inclusive.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'if (strlen(pwd) > 8 && strlen(pwd) < 16)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'if (sizeof(pwd) >= 8 && sizeof(pwd) <= 16)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'int len = strlen(pwd); if (len >= 8 && len <= 16)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if (pwd >= 8 && pwd <= 16)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q38 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Case Study', '[Scenario: Telecom Billing Minutes Rounding] A telecom provider charges per minute. Any partial minute of call duration (e.g. 61 seconds) is billed as a full extra minute (e.g. 2 minutes). Which integer arithmetic expression in C converts seconds into billed minutes?', NULL, 'Scenario: Telecom Billing Minutes Rounding
A telecom provider charges per minute. Any partial minute of call duration (e.g. 61 seconds) is billed as a full extra minute (e.g. 2 minutes).', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'minutes = seconds / 60;') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'minutes = (seconds + 59) / 60;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'minutes = (seconds / 60) + 1;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'minutes = seconds % 60;') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q39 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Case Study', '[Scenario: Vowel Counter in Customer Feedback] A technician writes a loop to count vowels in string char str[100] . What is the logical bug in the following snippet?', 'int vowels = 0;
for (int i = 0; str[i] != ''\0''; i++) {
    if (str[i] == ''a'' || ''e'' || ''i'' || ''o'' || ''u'') {
        vowels++;
    }
}', 'Scenario: Vowel Counter in Customer Feedback
A technician writes a loop to count vowels in string char str[100].', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'The loop condition causes an infinite loop') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Character constants like ''e'' are non-zero truthy values, making the if condition always true for every character') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'vowels must be initialized to 1') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Arrays cannot be indexed with i') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C Q40 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C', 'Case Study', '[Scenario: Two-Variable Swapping Without Auxiliary Memory] A programmer needs to swap two integer variables x and y without declaring a third temporary variable. Which sequence of operations correctly performs the swap?', NULL, 'Scenario: Two-Variable Swapping Without Auxiliary Memory
A programmer needs to swap two integer variables x and y without declaring a third temporary variable.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'x = x * y; y = x * y; x = x * y;') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'x = x + y; y = x - y; x = x - y;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'x = y; y = x;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'x = x - y; y = y - x; x = x + y;') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q1 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Fundamentals', 'Which standard header file in C++ is required to use the standard stream objects cin and cout ?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '<stdio.h>') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '<iostream>') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '<conio.h>') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '<fstream>') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q2 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Fundamentals', 'What is the primary purpose of the directive using namespace std; in a C++ source file?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Imports external dynamic link libraries') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Allows standard library elements to be accessed without prefixing them with `std::`') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Allocates memory on the stack') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Enables object-oriented inheritance') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q3 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Fundamentals', 'Which data type in C++ is specifically designed to store boolean truth values (true or false )?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'int') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'bit') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'bool') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'boolean') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q4 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Fundamentals', 'What is the insertion operator used in conjunction with cout to print output to the console?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '>>') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '<<') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '→') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '::') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q5 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Fundamentals', 'What is the default access specifier for members of a class in C++ if none is explicitly specified?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'public') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'private') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'protected') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'internal') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q6 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Fundamentals', 'Which special member function has the same name as the class and possesses NO return type (not even void )?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Destructor') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Constructor') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Friend function') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Static method') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q7 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Fundamentals', 'What OOP concept binds data members and member functions into a single unit while restricting direct outside access?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Inheritance') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Polymorphism') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Encapsulation') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Dynamic Binding') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q8 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Fundamentals', 'In C++, which syntax correctly declares that class Derived publicly inherits from class Base ?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'class Derived extends Base') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'class Derived : public Base') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'class Derived inherits Base') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'class Derived :: public Base') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q9 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Fundamentals', 'What is ''function overloading'' in C++?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Defining multiple functions with different names but identical parameters') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Defining two or more functions with the same name in the same scope, differing in parameter types or count') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Calling a function repeatedly until stack overflow occurs') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Overriding a base class function in a derived class') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q10 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Fundamentals', 'Which members of a base class are accessible to derived class member functions, but hidden from external non-member functions?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'private members') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'protected members') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'public members') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'global members') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q11 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Technical Understanding', 'Consider the following string declaration in C++:
Which expression returns the number of characters in string s ?', 'string s = \', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 's.size() or s.length()') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'sizeof(s)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 's.count()') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'strlen(s)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q12 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Technical Understanding', 'What happens when an object of a class is created without arguments, assuming no constructors were defined by the programmer?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Compilation error occurs') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'The compiler automatically generates an implicit default constructor') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'The program crashes at runtime') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'The object is placed in read-only memory') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q13 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Technical Understanding', 'Consider the overloaded functions:
What happens when show(4.5) is called?', 'void show(int x);
void show(double x);', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Ambiguous call compile error') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '`show(double)` is invoked because 4.5 is a double literal') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '`show(int)` is invoked after truncating to 4') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Both functions execute') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q14 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Technical Understanding', 'In single inheritance, in what order are constructors executed when an object of the derived class is created?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Derived class constructor first, then Base class constructor') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Base class constructor first, then Derived class constructor') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Only the Derived class constructor executes') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Randomized order') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q15 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Technical Understanding', 'What is the output of the following C++ code snippet?', '#include <iostream>\nusing namespace std;\nint main() {\n    int a = 15, b = 4;\n    cout << (float)a / b << \', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '3.75 3.75') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '3.75 3') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '3 3') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '3.0 3') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q16 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Technical Understanding', 'What is printed when the following code executes?', '#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string str1 = \', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Hello') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'World') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Hello World') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Hello') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q17 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Technical Understanding', 'Consider the following class definition:
Which object declaration in main() is INVALID?', 'class Student {
    int roll;
public:
    Student(int r) { roll = r; }
};', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Student s1(101);') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Student s2 = Student(102);') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Student s3;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Student s4 = 104;') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q18 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Technical Understanding', 'What is the key functional difference between break and continue inside a loop in C++?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '`break` skips to the next iteration, while `continue` terminates the entire loop') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '`break` terminates the enclosing loop entirely, while `continue` skips the rest of the current iteration and advances to the next iteration') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Both statements perform identical actions') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '`continue` can only be used inside a switch statement') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q19 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Technical Understanding', 'What is the output of the following C++ program?', '#include <iostream>\nusing namespace std;\nclass Base {\npublic:\n    Base() { cout << \', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'D') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'B') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'B D') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'D B') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q20 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Technical Understanding', 'What is the result of attempting to compile and run the following C++ snippet?', '#include <iostream>\nusing namespace std;\nint main() {\n    const int x = 10;\n    int *ptr = (int*)&x;\n    *ptr = 20;\n    cout << x << \', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '20 20') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '10 20') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '10 10') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Modifying a const object via cast invokes undefined behavior') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q21 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Logic and Debugging', 'What is the output of the following C++ program?', '#include <iostream>
using namespace std;
int main() {
    int total = 0;
    for (int i = 1; i <= 5; i++) {
        if (i % 2 == 0) total += i;
    }
    cout << total;
    return 0;
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '15') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '6') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '9') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '12') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q22 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Logic and Debugging', 'What is the output of the following C++ code?', '#include <iostream>
using namespace std;
int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int sum = 0;
    for (int i = 0; i < 3; i++) {
        sum += arr[i];
    }
    cout << sum;
    return 0;
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '60') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '100') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '150') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '30') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q23 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Logic and Debugging', 'What will be printed by the following program?', '#include <iostream>
using namespace std;
void update(int &ref) {
    ref += 25;
}
int main() {
    int val = 50;
    update(val);
    cout << val;
    return 0;
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '50') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '25') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '75') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compile error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q24 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Logic and Debugging', 'What is the output of the following class-based program?', '#include <iostream>
using namespace std;
class Counter {
    int count;
public:
    Counter() { count = 1; }
    void inc() { count++; }
    int get() { return count; }
};
int main() {
    Counter c;
    c.inc();
    c.inc();
    cout << c.get();
    return 0;
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '1') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '2') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '3') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '0') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q25 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Logic and Debugging', 'What is the output of the following code snippet?', '#include <iostream>\nusing namespace std;\nint main() {\n    int x = 2;\n    switch (x * 2) {\n        case 2: cout << \', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Four') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Four Six') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Four Six Default') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Two Four') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q26 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Logic and Debugging', 'Identify the compiler error in the following C++ code snippet:', '#include <iostream>
using namespace std;
class Sample {
    int data;
public:
    void setData(int d) { data = d; }
};
int main() {
    Sample s;
    s.setData(100);
    cout << s.data;
    return 0;
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '`setData` cannot have parameters') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '`s.data` is private by default in class `Sample` and cannot be accessed in `main()`') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '`cout` cannot print integers') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '`Sample s;` requires parentheses') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q27 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Logic and Debugging', 'What is the output of the following array traversal program?', '#include <iostream>\nusing namespace std;\nint main() {\n    int a[] = {1, 2, 3, 4, 5};\n    for (int i = 4; i >= 0; i -= 2) {\n        cout << a[i] << \', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '5 3 1') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '5 4 3 2 1') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '4 2 0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '1 3 5') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q28 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Logic and Debugging', 'What is the output of the following function overloading program?', '#include <iostream>
using namespace std;
int calc(int a) { return a * a; }
int calc(int a, int b) { return a + b; }
int main() {
    cout << calc(5) + calc(3, 4);
    return 0;
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '25') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '32') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '12') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '35') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q29 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Logic and Debugging', 'What is printed by the following C++ code?', '#include <iostream>\nusing namespace std;\nint main() {\n    int x = 10;\n    int y = 20;\n    int z = (x > y) ? x : y;\n    cout << \', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Max=10') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Max=20') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Max=0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compile error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q30 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Logic and Debugging', 'What is the output of the following inheritance program?', '#include <iostream>
using namespace std;
class Parent {
public:
    int x;
    Parent() { x = 10; }
};
class Child : public Parent {
public:
    int y;
    Child() { y = 20; }
};
int main() {
    Child c;
    cout << c.x + c.y;
    return 0;
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '30') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '20') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '10') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compile error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q31 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Case Study', '[Scenario: Bank Account Encapsulation] A banking application models a bank account with balance . To prevent negative balances, which method
implementation in class BankAccount correctly encapsulates withdrawals?', NULL, '[Scenario: Bank Account Encapsulation]
A banking application models a bank account with balance .', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'public: void withdraw(double amt) { balance -= amt; }') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'public: bool withdraw(double amt) { if (amt > 0 && amt <= balance) { balance -= amt; return true; } return false; }') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'public: double balance;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'private: bool withdraw(double amt) { balance = balance - amt; }') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q32 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Case Study', '[Scenario: Student Grade Tracker] A class Student stores scores for 3 subjects. Which member function accurately calculates and returns the student''s
average as a double ?', NULL, '[Scenario: Student Grade Tracker]
A class Student stores scores for 3 subjects.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'double getAverage() { return (sub1 + sub2 + sub3) / 3; }') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'double getAverage() { return (double)(sub1 + sub2 + sub3) / 3.0; }') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'int getAverage() { return sub1 + sub2 + sub3 / 3.0; }') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'void getAverage() { cout << sub1 + sub2 + sub3; }') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q33 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Case Study', '[Scenario: E-Commerce Product Catalog] An online bookstore stores book objects with title, price, and stock count. If a customer orders $K$ units of an item with
stock $S$, which logical branch correctly handles the order?', NULL, '[Scenario: E-Commerce Product Catalog]
An online bookstore stores book objects with title, price, and stock count.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'if (K <= S) { S -= K; cout << \') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'if (K > S) { S -= K; cout << \') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'S = S - K; cout << \') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if (K == S) cout << \') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q34 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Case Study', '[Scenario: Vehicle Fleet Management] A company has a base class Vehicle with speed and derived class Car with numDoors . Which constructor
implementation in Car correctly initializes both base and derived attributes?', NULL, '[Scenario: Vehicle Fleet Management]
A company has a base class Vehicle with speed and derived class Car with numDoors .', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Car(int s, int d) { speed = s; numDoors = d; }') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Car(int s, int d) : Vehicle(s) { numDoors = d; }') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Car(int s, int d) { Vehicle(s); numDoors = d; }') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Car(int s, int d) : numDoors(d) : Vehicle(s) {}') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q35 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Case Study', '[Scenario: Temperature Unit Converter] A weather station needs an overloaded function convert() : one version converts C to F, and another converts F to C.
How can the developer resolve signature collision if both take a single float?', NULL, '[Scenario: Temperature Unit Converter]
A weather station needs an overloaded function convert() : one version converts C to F, and another converts F to C.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Overload using different return types only') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Introduce an additional character parameter e.g., `convert(float val, char scale)` to differentiate signatures') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'C++ automatically deduces conversion direction') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Functions cannot perform conversions in C++') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q36 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Case Study', '[Scenario: Password Verification] A security module validates that a password string has at least 8 characters and contains at least one digit. Which loop
structure correctly inspects string pwd ?', NULL, '[Scenario: Password Verification]
A security module validates that a password string has at least 8 characters and contains at least one digit.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'bool ok = (pwd.length() >= 8); for(char c : pwd) if(isdigit(c)) { ok = true; break; }') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'bool hasDigit = false; if (pwd.length() >= 8) { for (int i=0; i<pwd.length(); i++) if (isdigit(pwd[i])) hasDigit = true; } return hasDigit;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'return (pwd.length() >= 8) || isdigit(pwd[0]);') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'return pwd == \') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q37 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Case Study', '[Scenario: Library Management Overdue Fine Calculation] A library charges 2 rupees per day for the first 5 overdue days, and 5 rupees per day for every day thereafter. Which
code correctly computes fine for days overdue?', NULL, '[Scenario: Library Management Overdue Fine Calculation]
A library charges 2 rupees per day for the first 5 overdue days, and 5 rupees per day for every day thereafter.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'if (days <= 5) fine = days * 2; else fine = 10 + (days - 5) * 5;') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'if (days <= 5) fine = days * 2; else fine = days * 5;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'fine = days * 2 + days * 5;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if (days > 5) fine = (days - 5) * 5; else fine = 0;') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q38 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Case Study', '[Scenario: Copy Constructor vs Default Assignment]
Consider class Point :', 'class Point {
    int x, y;
public:
    Point(int a, int b) { x = a; y = b; }
};
What occurs when a developer writes:
Point p1(10, 20);
Point p2 = p1;', '[Scenario: Copy Constructor vs Default Assignment]
Consider class Point :
class Point {
    int x, y;
public:
    Point(int a, int b) { x = a; y = b; }
};
What occurs when a developer writes:
Point p1(10, 20);
Point p2 = p1;', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Compile-time error because no copy constructor was defined') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'The compiler invokes the default memberwise copy constructor to copy `x` and `y` from `p1` to `p2`') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '`p2` shares memory reference with `p1`') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '`p2` has garbage values') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q39 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Case Study', '[Scenario: Loop Condition with Decrement Operator]
What is the exact output of this program?', 'int arr[] = {10, 20, 30};\nint i = 3;\nwhile (i-- > 0) {\n    cout << arr[i] << \', '[Scenario: Loop Condition with Decrement Operator]
What is the exact output of this program?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '30 20 10') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '20 10 0') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Garbage value, then 30 20') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Infinite loop') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track C++ Q40 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('C++', 'Case Study', '[Scenario: Counter Reset in Multi-Department Audit] A department score counter must be reset to zero at the start of each new department iteration. Which loop placement
guarantees proper reinitialization?', NULL, '[Scenario: Counter Reset in Multi-Department Audit]
A department score counter must be reset to zero at the start of each new department iteration.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'int deptScore = 0; for (int d=0; d<D; d++) { ... }') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'for (int d=0; d<D; d++) { int deptScore = 0; for(int s=0; s<S; s++) deptScore += score[d][s]; cout << deptScore; }') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Declare `deptScore` globally') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Reset `deptScore` only inside the inner loop') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q1 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Fundamentals', 'Which component of the Java platform is directly responsible for executing compiled Java bytecode (.class files)?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'JDK (Java Development Kit)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'JVM (Java Virtual Machine)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Javadoc') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Javac') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q2 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Fundamentals', 'What is the exact signature of the application entry point main method in standard Java?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'public void main(String[] args)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'public static void main(String[] args)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'static void main(String args)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'public int main(String[] args)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q3 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Fundamentals', 'Which of the following is NOT a primitive data type in Java?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'int') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'boolean') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'String') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'double') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q4 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Fundamentals', 'What is the default initial value of an uninitialized boolean instance variable in a Java class?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'true') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'false') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'null') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q5 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Fundamentals', 'Which keyword is used in Java by a subclass to inherit from a superclass?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'implements') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'inherits') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'extends') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'super') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q6 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Fundamentals', 'Which statement correctly prints text followed by a new line to the console in Java?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Console.writeLine(\') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'System.out.println(\') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'printf(\') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'System.in.read(\') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q7 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Fundamentals', 'What is the effect of declaring a class method as static in Java?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'The method cannot return any value') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'The method belongs to the class itself rather than instances and can be invoked without creating an object') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'The method cannot accept arguments') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'The method cannot access static variables') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q8 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Fundamentals', 'What built-in method in Java is used to determine the total number of characters in a String object?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'str.length') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'str.length()') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'str.size()') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'str.count()') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q9 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Fundamentals', 'What is the result of widening type conversion when assigning an int holding 42 to a double in Java?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Compile error') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'The value is safely converted to 42.0 without loss of precision') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Runtime ClassCastException') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'The value remains integer 42') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q10 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Fundamentals', 'Which block in Java is guaranteed to execute whether an exception is thrown or caught in a try-catch construct?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'throw') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'finally') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'throws') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'catch-all') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q11 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Technical Understanding', 'What is the difference between str1 == str2 and str1.equals(str2) when comparing two String objects in Java?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '`==` compares character content, while `.equals()` compares memory references') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '`==` compares memory references (identity), while `.equals()` compares character sequence content') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Both operators are completely interchangeable') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '`.equals()` only works for primitive data types') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q12 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Technical Understanding', 'What exception is thrown at runtime if a program attempts to divide an integer by zero (e.g. 10 / 0 ) in Java?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'NullPointerException') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'ArithmeticException') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'NumberFormatException') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'ArrayIndexOutOfBoundsException') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q13 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Technical Understanding', 'Consider array declaration int[] scores = new int[5]; . What is the default value of each element immediately after allocation?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Garbage value') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '0') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'null') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '-1') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q14 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Technical Understanding', 'What character is returned by calling \', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '''D''') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '''T''') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '''O''') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '''H''') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q15 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Technical Understanding', 'What occurs when the following code is compiled?', 'class Test {
    int add(int a, int b) { return a + b; }
    double add(int a, int b) { return (double)(a + b); }
}', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Valid method overloading') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Compile error: method add(int, int) is already defined (return type alone cannot distinguish overloaded methods)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Runtime NoSuchMethodError') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compiler picks method with larger return type') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q16 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Technical Understanding', 'What is the output of the following Java snippet?', 'int x = (int) 7.89;
System.out.print(x);', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '8') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '7') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '7.89') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compilation error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q17 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Technical Understanding', 'Consider the loop: int count = 0; for (int i = 0; i < 10; i++) { if (i == 4) break; count++; } System.out.print(count); What is printed?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '3') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '4') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '5') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '10') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q18 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Technical Understanding', 'Which access modifier in Java restricts visibility strictly within the declaring class itself?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'protected') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'public') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'private') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'default') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q19 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Technical Understanding', 'What is the output of the following Java program?', 'public class StringTest {\n    public static void main(String[] args) {\n        String s1 = \', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'true true') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'false true') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'false false') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'true false') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q20 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Technical Understanding', 'What is printed by the following code? int a = 5; int b = a > 2 ? a++ : ++a; System.out.print(a + \', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '6 5') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '6 6') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '5 5') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '7 6') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q21 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Logic and Debugging', 'What is the output of the following Java program?', 'public class App {
    public static void main(String[] args) {
        int product = 1;
        for (int i = 1; i <= 4; i++) {
            product *= i;
        }
        System.out.print(product);
    }
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '10') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '24') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '12') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '4') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q22 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Logic and Debugging', 'What will be printed by the following code?', 'public class Test {
    public static void main(String[] args) {
        int[] nums = {5, 12, 8, 20};
        int max = nums[0];
        for (int x : nums) {
            if (x > max) max = x;
        }
        System.out.print(max);
    }
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '5') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '12') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '20') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '45') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q23 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Logic and Debugging', 'What is the output of the following program?', 'class Box {
    int length;
    Box(int l) { length = l; }
}
public class Main {
    public static void main(String[] args) {
        Box b1 = new Box(10);
        Box b2 = b1;
        b2.length = 25;
        System.out.print(b1.length);
    }
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '10') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '25') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compilation error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q24 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Logic and Debugging', 'What is printed when the following code executes?', 'public class LoopTrace {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            if (i == 3) continue;
            sum += i;
        }
        System.out.print(sum);
    }
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '15') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '12') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '10') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '7') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q25 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Logic and Debugging', 'What is the output of the following code involving String concatenation?', 'public class StringConcat {\n    public static void main(String[] args) {\n        System.out.print(10 + 20 + \', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '30Java30') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '1020Java1020') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '30Java1020') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compilation error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q26 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Logic and Debugging', 'What does the following exception handling snippet output?', 'public class ExTest {\n    public static void main(String[] args) {\n        try {\n            int x = 10 / 0;\n            System.out.print(\', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'A B C') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'B C') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'B') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'A C') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q27 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Logic and Debugging', 'Identify the compile-time error in the following Java snippet:', 'public class ScopeTest {
    public static void main(String[] args) {
        if (true) {
            int temp = 50;
        }
        System.out.print(temp);
    }
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '`if (true)` is illegal syntax') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Variable `temp` is local to the `if` block and cannot be resolved outside its scope') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '`System.out.print` cannot print variables named `temp`') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Braces are forbidden') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q28 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Logic and Debugging', 'What is the output of the following Java program?', 'class Base {\n    Base() { System.out.print(\', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '2 1') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '2') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '1 2') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '1') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q29 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Logic and Debugging', 'What will be printed by the following code involving static variables?', 'class Item {
    static int count = 0;
    Item() { count++; }
}
public class Test {
    public static void main(String[] args) {
        Item a = new Item();
        Item b = new Item();
        Item c = new Item();
        System.out.print(Item.count);
    }
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '1') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '3') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compilation error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q30 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Logic and Debugging', 'What is the output of the following method invocation?', 'public class MethodRef {
    static void modify(int[] arr) {
        arr[0] = 99;
    }
    public static void main(String[] args) {
        int[] data = {10, 20, 30};
        modify(data);
        System.out.print(data[0]);
    }
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '10') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '99') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'ArrayIndexOutOfBoundsException') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q31 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Case Study', '[Scenario: Bank Account Security] A fintech startup designs an Account class. Which design ensures that the account balance cannot be set to a negative
value from outside the class?', NULL, '[Scenario: Bank Account Security]
A fintech startup designs an Account class.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Make `balance` public') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Declare `private double balance;` and provide a public deposit/withdraw method with validation checks') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Declare `protected double balance;` with no methods') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Make `balance` static across all accounts') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q32 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Case Study', '[Scenario: Student Registration System] A university portal registers students with roll numbers. If roll must be unique and constant once assigned, which
modifier should precede int roll; ?', NULL, '[Scenario: Student Registration System]
A university portal registers students with roll numbers.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'static') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'final') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'abstract') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'volatile') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q33 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Case Study', '[Scenario: Payroll Calculation] If basic salary is basic , medical allowance is 15%, and tax deduction is 10%, which Java expression computes net
salary?', NULL, '[Scenario: Payroll Calculation]
If basic salary is basic , medical allowance is 15%, and tax deduction is 10%, which Java expression computes net
salary?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'double net = basic + (basic * 0.15) - (basic * 0.10);') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'double net = basic * 0.15 - 0.10;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'double net = basic + 15 - 10;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'double net = (basic - 0.10) * 0.15;') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q34 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Case Study', '[Scenario: Robust Input Parser] A programmer converts user text to an integer. Which construct ensures the app does not crash if non-numeric
characters are entered?', NULL, '[Scenario: Robust Input Parser]
A programmer converts user text to an integer.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'try { int val = Integer.parseInt(text); } catch (NumberFormatException e) { System.out.println(\') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'if (text == 0) return 0;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'int val = (int) text;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'while (text.length() > 0) Integer.parseInt(text);') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q35 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Case Study', '[Scenario: Inventory Item Out-of-Stock Alert] Given int[] inventory = {15, 0, 8, 0, 12}; , which loop correctly prints the indices of all items that are out of
stock?', NULL, '[Scenario: Inventory Item Out-of-Stock Alert]
Given int[] inventory = {15, 0, 8, 0, 12}; , which loop correctly prints the indices of all items that are out of
stock?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'for (int x : inventory) if (x == 0) System.out.print(x + \') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'for (int i = 0; i < inventory.length; i++) if (inventory[i] == 0) System.out.print(i + \') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'for (int i = 1; i <= inventory.length; i++) if (inventory[i] == 0) System.out.print(i);') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if (inventory[0] == 0) System.out.print(\') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q36 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Case Study', '[Scenario: Domain Email Validator] A company permits login only for users with an @lnmcbm.ac.in email. Which expression correctly validates String
email ?', NULL, '[Scenario: Domain Email Validator]
A company permits login only for users with an @lnmcbm.ac.in email.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'email.contains(\') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'email.endsWith(\') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'email == \') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'email.substring(0, 5).equals(\') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q37 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Case Study', '[Scenario: Supermarket Billing Cashier] What is the bug in the following snippet?
double total = 600.0;
if (total > 500.0);
    total -= 50.0;
System.out.print(total);', NULL, '[Scenario: Supermarket Billing Cashier]
What is the bug in the following snippet?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '`total` should be an int') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'The stray semicolon after `if (total > 500.0);` terminates the conditional statement prematurely, causing `total -= 50.0;` to execute unconditionally') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'The subtraction operator `-=` cannot be used with floating point numbers') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '`total > 500.0` is an invalid expression') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q38 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Case Study', '[Scenario: Exam Answer Key Grader] When comparing two character arrays char[] a and char[] b , what is the result of calling a.equals(b) in Java?', NULL, '[Scenario: Exam Answer Key Grader]
When comparing two character arrays char[] a and char[] b , what is the result of calling a.equals(b) in Java?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Returns true if all characters match') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Returns false unless `a` and `b` reference the exact same array object in memory (arrays do not override Object''s `.equals()`)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Causes compile-time error') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Returns the number of matching elements') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q39 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Case Study', '[Scenario: Safe Array Traversal Boundary] What happens when the loop executes on int[] data = {4, 8, 12}; ?
int sum = 0;
for (int i = 0; i <= data.length; i++) {
    sum += data[i];
}', NULL, '[Scenario: Safe Array Traversal Boundary]
What happens when the loop executes on int[] data = {4, 8, 12}; ?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Computes correct sum of 24') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Throws `ArrayIndexOutOfBoundsException` at runtime when `i == data.length`') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Treats `data[data.length]` as 0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compilation error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Java Q40 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Java', 'Case Study', '[Scenario: Hospital Patient Ward Counter] A hospital software increments a counter totalPatients when a new Patient is created. Which keyword ensures
totalPatients is shared across all patient objects?', NULL, '[Scenario: Hospital Patient Ward Counter]
A hospital software increments a counter totalPatients when a new Patient is created.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'private') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'static') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'transient') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'synchronized') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q1 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Fundamentals', 'What is the primary mechanism used in Python to define code blocks (such as the body of loops or conditional statements)?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Curly braces { }') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Consistent whitespace indentation') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Begin ... End statements') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Parentheses ( )') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q2 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Fundamentals', 'Which operator in Python performs integer floor division (discarding the fractional part)?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '/') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '//') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '%') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '**') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q3 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Fundamentals', 'What is the data type returned by Python''s built-in input() function by default?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'int') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'float') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'str') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'bool') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q4 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Fundamentals', 'Which data structure in Python is IMMUTABLE (its elements cannot be modified in place after creation)?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'List') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Dictionary') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Set') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Tuple') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q5 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Fundamentals', 'What is the result of evaluating 2 ** 3 in Python?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '6') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '8') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '5') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '9') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q6 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Fundamentals', 'Which character is used to denote a single-line comment in Python?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '//') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '/*') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '#') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '--') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q7 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Fundamentals', 'Which built-in function returns the number of items in a list or characters in a string in Python?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'size()') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'count()') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'len()') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'length()') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q8 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Fundamentals', 'Which Python collection type stores an unordered collection of UNIQUE elements, eliminating duplicate entries?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'List') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Tuple') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Set') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'String') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q9 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Fundamentals', 'What are the numbers generated by list(range(2, 9, 3)) in Python?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '[2, 5, 8]') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '[2, 5, 8, 11]') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '[2, 3, 4, 5, 6, 7, 8]') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '[3, 6, 9]') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q10 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Fundamentals', 'How do you check whether a specific key ''email'' exists in a dictionary named user ?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'if ''email'' in user:') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'if user.has_key(''email''):') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'if ''email'' == user.key:') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if user[''email''] != None:') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q11 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Technical Understanding', 'What is the output of the following string slicing operation in Python? text = \', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'DTHO') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'THON') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'THON2') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'DTHON') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q12 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Technical Understanding', 'What happens when you append an element to a list using nums.append(50) ?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Creates a new list and returns it') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Mutates the original list in place by adding 50 to the end, returning None') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Inserts 50 at index 0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Throws error if 50 is already present') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q13 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Technical Understanding', 'What is the output of the following code snippet?', 's = \', NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'LNMCBM') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'lnmcbm') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Lnmcbm') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q14 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Technical Understanding', 'What is the output of the following boolean expression in Python? print(True and False or True)', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'False') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'True') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'None') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'SyntaxError') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q15 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Technical Understanding', 'Consider the dictionary: student = {\', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '2') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '3') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '4') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '90') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q16 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Technical Understanding', 'What is the output of the following list operation? colors = [\', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '[''red'', ''blue'']') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '[''red'', ''blue'', ''green'']') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '[''red'', ''green'', ''blue'']') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '[''green'', ''green'']') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q17 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Technical Understanding', 'What is the output of the following set operation? a = {1, 2, 3} b = {3, 4, 5} print(a & b)', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '{1, 2, 3, 4, 5}') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '{3}') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '{1, 2, 4, 5}') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '{}') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q18 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Technical Understanding', 'What happens when tup[1] = 99 is executed on tup = (10, 20, 30) ?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'tup becomes (10, 99, 30)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'TypeError is raised because tuples do not support item assignment') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '99 is appended') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'tup converted to list') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q19 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Technical Understanding', 'What is the output of the following negative slicing operation in Python? word = \', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'PYTHON') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'NOHTYP') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'N') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'IndexError') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q20 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Technical Understanding', 'What is the output of the following loop with a break statement? total = 0 for i in range(1, 10): if i % 3 == 0: break total += i print(total)', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '0') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '3') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '6') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '45') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q21 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Logic and Debugging', 'What is the output of the following loop in Python? nums = [2, 4, 6, 8] s = 0 for x in nums: s += x print(s)', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '8') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '20') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '12') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '16') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q22 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Logic and Debugging', 'What is printed by the following code snippet? s = \', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'og') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Cg') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'on') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'od') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q23 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Logic and Debugging', 'What is the output of the following list manipulation snippet? items = [10, 20] items = items * 2 items[1] = 99 print(items)', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '[10, 20, 10, 20]') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '[10, 99, 10, 20]') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '[10, 99, 10, 99]') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '[20, 40]') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q24 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Logic and Debugging', 'What is the output of the following nested loop? c = 0 for i in range(2): for j in range(3): c += 1 print(c)', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '5') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '6') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '9') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '4') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q25 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Logic and Debugging', 'What is printed by the following code? data = {\', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '3') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '6') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '[''a'', ''b'', ''c'']') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'TypeError') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q26 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Logic and Debugging', 'Identify the syntax error in the following Python snippet: age = 19 if age >= 18 print(\', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Parentheses required around condition') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Missing colon `:` at the end of the `if` statement line') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'print cannot take string literals') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'age cannot be assigned integer') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q27 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Logic and Debugging', 'What is the output of the following loop with continue ? val = 0 for k in range(5): if k == 2: continue val += k print(val)', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '10') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '8') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '6') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '7') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q28 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Logic and Debugging', 'What is printed by the following string replace snippet? msg = \', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'bonana') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'bonono') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'banana') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q29 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Logic and Debugging', 'What is the output of the following Python snippet? x = [1, 2, 3] y = x y.append(4) print(len(x))', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '3') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '4') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '1') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q30 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Logic and Debugging', 'What is the output of the following set logic? s = set([10, 20, 10, 30, 20]) print(sum(s))', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '90') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '60') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '50') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '30') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q31 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Case Study', '[Scenario: Student Exam Score Filter] A teacher has test scores scores = [45, 78, 92, 33, 64, 88] . Which code snippet correctly counts how many
students scored 60 or above?', NULL, '[Scenario: Student Exam Score Filter]
A teacher has test scores scores = [45, 78, 92, 33, 64, 88] .', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'count = 0; for s in scores: if s >= 60: count += 1') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'count = sum(scores) / 60') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'count = scores.count(60)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'count = len(scores) - 60') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q32 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Case Study', '[Scenario: Online Shopping Cart Subtotal] A shopper adds items with prices prices = [150, 499, 299] . If a delivery fee of 50 is added only when subtotal is
under 1000, which code calculates total ?', NULL, '[Scenario: Online Shopping Cart Subtotal]
A shopper adds items with prices prices = [150, 499, 299] .', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'total = sum(prices); if total < 1000: total += 50') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'total = sum(prices) + 50') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'total = max(prices) + 50') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if total < 1000: total = 50') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q33 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Case Study', '[Scenario: Product Inventory Lookup] A store keeps inventory stock = {\', NULL, '[Scenario: Product Inventory Lookup]\nA store keeps inventory stock = {\', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'qty = stock.get(item_name, 0)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'qty = stock[item_name]') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'qty = stock.pop(item_name)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'qty = stock.find(item_name)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q34 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Case Study', '[Scenario: Clean User Input] A web form receives a phone string raw = \', NULL, '[Scenario: Clean User Input]\nA web form receives a phone string raw = \', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'raw.clean()') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'raw.strip()') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'raw.remove('' '')') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'raw.lower()') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q35 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Case Study', '[Scenario: Duplicate Email Detection] Given emails = [\', NULL, '[Scenario: Duplicate Email Detection]\nGiven emails = [\', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'unique_count = len(set(emails))') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'unique_count = len(emails) - 1') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'unique_count = sum(emails)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'unique_count = emails.unique()') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q36 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Case Study', '[Scenario: Word Palindrome Checker] Given w = \', NULL, '[Scenario: Word Palindrome Checker]\nGiven w = \', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'if w == w[::-1]:') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'if w == reversed(w):') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'if w[0] == w[-1]:') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if len(w) % 2 != 0:') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q37 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Case Study', '[Scenario: Daily Steps Milestone Tracker] Given steps = [4500, 10200, 8300, 11500, 6200] , which code finds the highest and lowest daily step count?', NULL, '[Scenario: Daily Steps Milestone Tracker]
Given steps = [4500, 10200, 8300, 11500, 6200] , which code finds the highest and lowest daily step count?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'highest = max(steps); lowest = min(steps)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'highest = steps[0]; lowest = steps[-1]') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'highest = sum(steps); lowest = 0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'highest = steps.sort(); lowest = steps.reverse()') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q38 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Case Study', '[Scenario: Default Mutable Trap in Slicing] A programmer clones original = [1, 2, 3] :
original = [1, 2, 3]
clone = original[:]
clone.append(4)
print(original)
What is printed?', NULL, '[Scenario: Default Mutable Trap in Slicing]
A programmer clones original = [1, 2, 3] :
original = [1, 2, 3]
clone = original[:]
clone.append(4)
print(original)
What is printed?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '[1, 2, 3]') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '[1, 2, 3, 4]') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '[4, 1, 2, 3]') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q39 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Case Study', '[Scenario: Multi-Condition Membership Testing] What is the logical bug in the following check?\nrole = \', NULL, '[Scenario: Multi-Condition Membership Testing]
What is the logical bug in the following check?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'String comparison fails without double quotes') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '`or \') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'role cannot be compared with or') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'IndentationError') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Python Q40 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Python', 'Case Study', '[Scenario: Total Bill with Tax Calculator] With qty = 5 and price = 40.0 , plus 5% GST, which expression computes the total bill?', NULL, '[Scenario: Total Bill with Tax Calculator]
With qty = 5 and price = 40.0 , plus 5% GST, which expression computes the total bill?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'total = (qty * price) * 1.05') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'total = qty * price + 5') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'total = qty * price * 0.05') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'total = (qty + price) * 1.05') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q1 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Fundamentals', 'Which HTML tag is used to create an interactive clickable hyperlink?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '<link>') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '<a>') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '<href>') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '<nav>') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q2 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Fundamentals', 'Which CSS property is used to specify the background color of an HTML element?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'color') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'bgcolor') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'background-color') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'surface-color') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q3 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Fundamentals', 'Which layer of the CSS Box Model represents the transparent spacing between an element''s content area and its border?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Margin') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Padding') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Outline') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Gutter') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q4 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Fundamentals', 'Which keyword in modern JavaScript declares a block-scoped variable whose value CANNOT be reassigned after initialization?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'var') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'let') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'const') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'static') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q5 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Fundamentals', 'Which method on the browser document object retrieves an element matching a unique id attribute?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'document.findId()') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'document.getElementById()') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'document.selectId()') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'document.locate()') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q6 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Fundamentals', 'Which HTML5 semantic tag is designated to contain introductory content or primary navigational links at the top of a webpage?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '<header>') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '<top>') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '<section>') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '<caption>') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q7 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Fundamentals', 'Which CSS selector syntax targets all elements having the class name card ?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '#card') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '.card') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'card') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '*card') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q8 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Fundamentals', 'What standard function prints debugging diagnostic messages to the browser''s developer console?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'window.print()') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'console.log()') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'System.out.println()') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'document.write()') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q9 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Fundamentals', 'In a CSS Flexbox container with default flex-direction: row , which property controls alignment along the main (horizontal) axis?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'align-items') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'justify-content') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'align-content') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'flex-wrap') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q10 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Fundamentals', 'What is the difference between let and var in JavaScript regarding variable scoping?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'var is block-scoped, while let is function-scoped') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'let is block-scoped, while var is function-scoped (or globally scoped)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'let cannot be reassigned') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Both possess identical block scoping rules') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q11 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Technical Understanding', 'Consider the CSS rule: .container { display: flex; justify-content: center; align-items: center; } What is the visual layout of child items inside .container ?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Stacked vertically top-left') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Centered both horizontally and vertically within the container') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Distributed with space-between') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Aligned along right boundary') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q12 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Technical Understanding', 'What does element.textContent = \', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Renders ''Hello'' in bold text') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Inserts the literal string ''<b>Hello</b>'' as plain text without parsing HTML tags') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Throws DOMException') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Deletes the element') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q13 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Technical Understanding', 'Which CSS position value positions an element relative to the viewport, keeping it fixed during scrolling?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'position: relative') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'position: absolute') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'position: fixed') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'position: static') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q14 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Technical Understanding', 'Which event triggers in JavaScript when a user clicks on an HTML button?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'onhover') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'click') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'submit') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'change') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q15 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Technical Understanding', 'What is the total calculated width of .box under standard CSS content-box ? .box { width: 200px; padding: 15px; border: 5px solid black; margin: 10px; }', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '200px') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '240px') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '260px') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '220px') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q16 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Technical Understanding', 'What is the result of evaluating ''5'' + 3 versus ''5'' - 3 in JavaScript?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '''8'' and ''2''') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '''53'' and 2') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '8 and 2') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'NaN and 2') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q17 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Technical Understanding', 'Which CSS media query applies styles when the viewport width is 768px or narrower?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '@media (min-width: 768px)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '@media (max-width: 768px)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '@media (screen-width <= 768px)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '@media mobile-only') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q18 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Technical Understanding', 'How do you programmatically change the background color of element btn to green in JavaScript?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'btn.background = \') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'btn.style.backgroundColor = \') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'btn.css(\') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'btn.style.background-color = \') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q19 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Technical Understanding', 'What is the output of console.log((0 == false) + \', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'true true') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'false false') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'true false') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'false true') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q20 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Technical Understanding', 'What color is text inside <p id=\', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'blue') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'green') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'red') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'black') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q21 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Logic and Debugging', 'What is printed by the following JavaScript loop?', 'let count = 0;
for (let i = 1; i <= 4; i++) {
    count += i;
}
console.log(count);', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '4') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '10') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '6') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '15') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q22 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Logic and Debugging', 'What is the output of calculateArea(5, 8) ?', 'function calculateArea(w, h) {
    return w * h;
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '13') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '40') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '26') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'undefined') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q23 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Logic and Debugging', 'What is the result of:', 'const heading = document.getElementById(\', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Appends new heading at bottom') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Updates visible text in element with id ''title'' to ''CODTHON 2026''') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Changes browser tab title') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q24 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Logic and Debugging', 'What will be printed to the console?', 'let x = 10;
if (x > 5) {
    let x = 20;
    console.log(x);
}', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '10') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '20') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'undefined') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'SyntaxError') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q25 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Logic and Debugging', 'What is the output of the following JavaScript code snippet?', 'let fruits = [\', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '2') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '3') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'undefined') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '[''apple'', ''banana'', ''orange'']') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q26 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Logic and Debugging', 'How can an event listener prevent form submit from automatically reloading the webpage?', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'event.stopPropagation();') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'event.preventDefault();') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'return false;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'window.stop();') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q27 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Logic and Debugging', 'What is the output of:', 'let score = 70;\nlet result = (score >= 60) ? \', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Pass') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Fail') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'true') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'undefined') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q28 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Logic and Debugging', 'Identify the CSS error in: .card { background-color: #ffffff border-radius: 8px; }', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Class names cannot be card') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Missing semicolon `;` after background-color value') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Hex color codes must be 8 digits') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Units must be %') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q29 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Logic and Debugging', 'What is printed by:', 'let a;
console.log(typeof a);', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '\') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '\') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '\') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '\') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q30 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Logic and Debugging', 'What is printed by:', 'let sum = 0;
for (let i = 0; i < 5; i++) {
    if (i === 2) continue;
    sum += i;
}
console.log(sum);', NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '10') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '8') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '6') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '7') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q31 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Case Study', '[Scenario: Interactive Dark Mode Toggle] Which JavaScript snippet toggles class \', NULL, '[Scenario: Interactive Dark Mode Toggle]\nWhich JavaScript snippet toggles class \', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'document.body.classList.toggle(\') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'document.body.className = \') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'document.body.style = \') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'document.body.setAttribute(\') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q32 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Case Study', '[Scenario: Form Input Required Validation] Which condition verifies that input <input type=\', NULL, '[Scenario: Form Input Required Validation]\nWhich condition verifies that input <input type=\', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'if (document.getElementById(\') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'if (document.getElementById(\') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'if (document.getElementById(\') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if (username == null)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q33 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Case Study', '[Scenario: Accessible Responsive Navbar] Which HTML tag provides the most semantically accessible wrapper for site navigation links?', NULL, '[Scenario: Accessible Responsive Navbar]
Which HTML tag provides the most semantically accessible wrapper for site navigation links?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '<div class=\') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '<nav>') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '<section>') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '<article>') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q34 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Case Study', '[Scenario: Modal Dialog Visibility] Which CSS property cleanly hides a modal popup from rendering and layout calculation until triggered?', NULL, '[Scenario: Modal Dialog Visibility]
Which CSS property cleanly hides a modal popup from rendering and layout calculation until triggered?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'display: none;') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'opacity: 1;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'position: static;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'color: transparent;') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q35 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Case Study', '[Scenario: Cart Badge Counter] <span id=\', NULL, '[Scenario: Cart Badge Counter]\n<span id=\', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'const b = document.getElementById(\') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'b.textContent = b.textContent + 1;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'b.value++;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'document.getElementById(\') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q36 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Case Study', '[Scenario: Responsive Grid Breakpoints] To make grid columns full-width on mobile (< 600px), which rule belongs inside @media (max-width: 600px) ?', NULL, '[Scenario: Responsive Grid Breakpoints]
To make grid columns full-width on mobile (< 600px), which rule belongs inside @media (max-width: 600px) ?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '.col { width: 100%; }') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '.col { display: none; }') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '.col { width: 25%; }') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '.col { float: left; }') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q37 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Case Study', '[Scenario: Disabling Submit Button During Processing] Which JavaScript line disables <button id=\', NULL, '[Scenario: Disabling Submit Button During Processing]\nWhich JavaScript line disables <button id=\', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'document.getElementById(\') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'document.getElementById(\') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'document.getElementById(\') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'document.getElementById(\') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q38 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Case Study', '[Scenario: QuerySelectorAll NodeList Traversal] What is returned by document.querySelectorAll(''.btn'') ?', NULL, '[Scenario: QuerySelectorAll NodeList Traversal]
What is returned by document.querySelectorAll(''.btn'') ?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'A single element') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'A static NodeList containing all matching elements supporting .forEach()') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'A dynamic HTMLCollection') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'An array of strings') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q39 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Case Study', '[Scenario: CSS Box-Sizing Reset] Why is * { box-sizing: border-box; } universally applied in CSS?', NULL, '[Scenario: CSS Box-Sizing Reset]
Why is * { box-sizing: border-box; } universally applied in CSS?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Eliminates all borders') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Ensures declared width and height include padding and borders, preventing layout overflow calculations') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Enforces responsive text') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Forces flex layout') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track Web Development Q40 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('Web Development', 'Case Study', '[Scenario: Table Construction for Student Roster] Which HTML tags create a valid table row with two header cells?', NULL, '[Scenario: Table Construction for Student Roster]
Which HTML tags create a valid table row with two header cells?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '<tr><th>Roll No</th><th>Name</th></tr>') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '<row><head>Roll No</head><head>Name</head></row>') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '<table-row><td>Roll No</td><td>Name</td></table- row>') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '<th><tr>Roll No</tr><tr>Name</tr></th>') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q1 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Fundamentals', 'What is the time complexity of accessing an array element at a known index arr[k] in memory?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'O(1)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'O(n)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'O(log n)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'O(n^2)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q2 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Fundamentals', 'What fundamental data structure operates under the Last-In, First-Out (LIFO) operational principle?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Queue') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Stack') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Array') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Hash Table') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q3 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Fundamentals', 'What fundamental data structure operates under the First-In, First-Out (FIFO) operational principle?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Queue') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Stack') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Tree') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Binary Search Tree') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q4 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Fundamentals', 'What is the strict prerequisite condition required before Binary Search can be applied to an array?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'The array must contain only positive integers') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'The array elements must be arranged in sorted order') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'The array must have an even number of elements') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'The array must not contain duplicate values') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q5 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Fundamentals', 'What is the worst-case time complexity of searching for an element in an unsorted array of size $N$ using Linear Search?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'O(1)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'O(log N)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'O(N)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'O(N^2)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q6 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Fundamentals', 'Which of the following operations is used to insert a new element onto the top of a Stack?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Pop') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Push') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Enqueue') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Dequeue') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q7 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Fundamentals', 'What are the two essential components required in every recursive function to prevent stack overflow?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'A loop header and an array') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'A base case (termination condition) and a recursive case (progressing toward base case)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'A try block and a catch block') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'A global pointer and a counter') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q8 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Fundamentals', 'What is the typical average and worst-case time complexity of Bubble Sort on an array of size $N$?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'O(N)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'O(N^2)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'O(N log N)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'O(1)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q9 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Fundamentals', 'What is the maximum number of comparisons required by Binary Search on a sorted array of 64 elements in the worst case?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '64') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '32') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '7') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '6') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q10 (Fundamentals)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Fundamentals', 'In a Queue implemented using a fixed-size array, from which end are elements deleted (removed)?', NULL, NULL, 1, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Rear (Tail)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Front (Head)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Middle') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Top') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q11 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Technical Understanding', 'Consider array arr = [24, 18, 35, 12, 40] . What is the array state after the FIRST full pass of Bubble Sort (ascending order)?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '[12, 18, 24, 35, 40]') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '[18, 24, 12, 35, 40]') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '[18, 24, 35, 12, 40]') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '[24, 18, 12, 35, 40]') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q12 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Technical Understanding', 'How does Selection Sort find the next element to place into its sorted position during each pass?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Repeatedly swapping adjacent pairs') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Scanning the unsorted subarray to find the minimum element and swapping it with the first unsorted position') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Dividing the array in half') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Inserting elements into a secondary queue') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q13 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Technical Understanding', 'Which algorithm design tests if a string of length $N$ is a palindrome in $O(N)$ time with $O(1)$ extra space?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Two-pointer technique comparing characters from both ends moving inward: `left = 0, right = N - 1`') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Nested loops checking all character pairs: $O(N^2)$') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Sorting the string first') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Converting each character to binary') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q14 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Technical Understanding', 'What is the time complexity of checking whether an integer $N$ is prime by testing divisibility up to $\sqrt{N}$?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'O(N)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'O(sqrt(N))') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'O(N^2)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'O(1)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q15 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Technical Understanding', 'Consider Binary Search for key = 37 in sorted array [10, 15, 23, 37, 45, 52, 68, 79, 90] (indices 0 to 8). What index is inspected in the FIRST comparison?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '0') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '4') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '3') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '5') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q16 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Technical Understanding', 'What is the return value of mystery(4) ? int mystery(int n) { if (n <= 1) return 1; return n + mystery(n - 1); }', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '10') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '24') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '4') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '15') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q17 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Technical Understanding', 'A Stack is initially empty. Operations: push(10) , push(20) , pop() , push(30) , push(40) , pop() , push(50) . What element is at the top?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '10') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '30') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '40') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '50') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q18 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Technical Understanding', 'A Queue is initially empty. Operations: enqueue(A) , enqueue(B) , dequeue() , enqueue(C) , dequeue() . What is next in line to dequeue?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'A') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'B') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'C') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Empty') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q19 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Technical Understanding', 'In Binary Search, why is mid = low + (high - low) / 2 preferred over (low + high) / 2 ?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Executes faster') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Prevents signed 32-bit integer overflow when low + high exceeds maximum integer value') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Handles negative numbers') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Avoids floating point') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q20 (Technical Understanding)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Technical Understanding', 'For an array of $N$ integers with values in range $1$ to $100$, what is the time complexity to find frequencies using an array freq[101] ?', NULL, NULL, 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'O(N^2)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'O(N log N)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'O(N)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'O(1)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q21 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Logic and Debugging', 'What is the output of the following number reversing algorithm for num = 1234 ? int rev = 0, num = 1234; while (num > 0) { rev = rev * 10 + num % 10; num /= 10; } printf(\', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '1234') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '4321') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '10') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '4') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q22 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Logic and Debugging', 'What does the following code compute on array arr of size n ? int ans = arr[0]; for (int i = 1; i < n; i++) { if (arr[i] < ans) ans = arr[i]; }', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Maximum element') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Minimum element') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Average value') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Sum of elements') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q23 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Logic and Debugging', 'What is the return value of factorial(3) ? int factorial(int n) { if (n <= 1) return 1; return n * factorial(n - 1); }', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '3') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '6') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '9') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '1') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q24 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Logic and Debugging', 'What is the output of the following sum-of-digits code for n = 456 ? int n = 456, sum = 0; while (n > 0) { sum += n % 10; n /= 10; } printf(\', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '15') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '456') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '24') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '6') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q25 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Logic and Debugging', 'What is the output of the following array reversal code? int a[] = {1, 2, 3, 4, 5}; int l = 0, r = 4; while (l < r) { int temp = a[l]; a[l] = a[r]; a[r] = temp; l++; r--; } printf(\', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '1 5') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '5 1') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '3 3') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '5 5') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q26 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Logic and Debugging', 'What is the bug in the following Linear Search function? int search(int arr[], int n, int target) { for (int i = 0; i < n; i++) { if (arr[i] == target) return i; else return -1; } }', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Loop condition out of bounds') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'The `else return -1;` statement exits the function during iteration 0 if the first element does not match') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Linear search cannot return -1') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Target must be float') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q27 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Logic and Debugging', 'What is the state of arr = [5, 1, 4, 2, 8] after the FIRST pass of Selection Sort (ascending order)?', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '[1, 5, 4, 2, 8]') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '[1, 2, 4, 5, 8]') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '[5, 1, 4, 2, 8]') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '[8, 1, 4, 2, 5]') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q28 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Logic and Debugging', 'What is the time complexity of the following nested loop? for (int i = 0; i < n; i++) { for (int j = 0; j < n; j++) { printf(\', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'O(n)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'O(n^2)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'O(1)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'O(log n)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q29 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Logic and Debugging', 'What is printed by checking num = 121 ? int num = 121, orig = num, rev = 0; while (num > 0) { rev = rev * 10 + num % 10; num /= 10; } if (orig == rev) printf(\', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'NO') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'YES') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '121') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Compilation error') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q30 (Logic and Debugging)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Logic and Debugging', 'What is the output of counting vowels in \', NULL, NULL, 3, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', '2') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', '3') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', '4') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', '5') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q31 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Case Study', '[Scenario: Two-Sum Target Search] Which brute-force nested loop correctly checks all unique pairs $(i, j)$ in array arr of size $n$?', NULL, '[Scenario: Two-Sum Target Search]
Which brute-force nested loop correctly checks all unique pairs $(i, j)$ in array arr of size $n$?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'for (int i=0; i<n; i++) for (int j=0; j<n; j++) if (arr[i]+arr[j] == target) return true;') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'for (int i=0; i<n-1; i++) for (int j=i+1; j<n; j++) if (arr[i]+arr[j] == target) return true;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'for (int i=0; i<n; i++) if (arr[i]+arr[i] == target) return true;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if (arr[0] + arr[n-1] == target) return true;') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q32 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Case Study', '[Scenario: Leaderboard Score Ranking] Which condition in Bubble Sort rearranges scores in DESCENDING order?', NULL, '[Scenario: Leaderboard Score Ranking]
Which condition in Bubble Sort rearranges scores in DESCENDING order?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'if (scores[j] < scores[j + 1]) swap(scores[j], scores[j + 1]);') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'if (scores[j] > scores[j + 1]) swap(scores[j], scores[j + 1]);') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'if (scores[j] == scores[j + 1]) swap(scores[j], scores[j + 1]);') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'if (scores[0] < scores[n - 1]) swap(scores[0], scores[n - 1]);') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q33 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Case Study', '[Scenario: Print Spooler Task Management] Which data structure guarantees documents are printed First-Come, First-Served?', NULL, '[Scenario: Print Spooler Task Management]
Which data structure guarantees documents are printed First-Come, First-Served?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Stack') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Queue') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Array with binary search') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Recursion stack') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q34 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Case Study', '[Scenario: Text Editor Undo Buffer] Which data structure is ideal for an editor''s ''Undo'' history (reverting the most recent action)?', NULL, '[Scenario: Text Editor Undo Buffer]
Which data structure is ideal for an editor''s ''Undo'' history (reverting the most recent action)?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Queue') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Stack') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Sorted Array') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Binary Search') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q35 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Case Study', '[Scenario: Efficient Prime Number Filter] Which loop boundary tests if integer $N > 1$ is prime with optimal $O(\sqrt{N})$ efficiency?', NULL, '[Scenario: Efficient Prime Number Filter]
Which loop boundary tests if integer $N > 1$ is prime with optimal $O(\sqrt{N})$ efficiency?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'for (int i = 2; i < N; i++)') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'for (int i = 2; i * i <= N; i++)') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'for (int i = 1; i <= N / 2; i++)') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'for (int i = N; i >= 1; i--)') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q36 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Case Study', '[Scenario: Customer Rating Frequency Counter] A kiosk records ratings 1 to 5. Using frequency array int freq[6] = {0}; , how is rating r recorded?', NULL, '[Scenario: Customer Rating Frequency Counter]
A kiosk records ratings 1 to 5.', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'freq[r] = freq[r] + 1;') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'freq[0] = freq[0] + r;') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'freq[r] = r;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'freq[r++] = 0;') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q37 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Case Study', '[Scenario: Duplicate Detector in Sorted List] In an already sorted array of size $N$, how quickly can duplicates be detected?', NULL, '[Scenario: Duplicate Detector in Sorted List]
In an already sorted array of size $N$, how quickly can duplicates be detected?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'In O(N) time by checking adjacent pairs arr[i] == arr[i+1]') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'In O(N^2) time only') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'In O(1) time') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Cannot be detected') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q38 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Case Study', '[Scenario: Binary Search Infinite Loop Bug] Why does using low = mid; without + 1 cause an infinite loop in Binary Search when high - low == 1 ?', NULL, '[Scenario: Binary Search Infinite Loop Bug]
Why does using low = mid; without + 1 cause an infinite loop in Binary Search when high - low == 1 ?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Array size is odd') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Integer division rounds down, keeping mid equal to low and never advancing boundaries') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Array has zeros') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Target is at index 0') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q39 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Case Study', '[Scenario: Stack Overflow in Recursive Sum] What happens when calling sum(5) with definition int sum(int n) { return n + sum(n - 1); } ?', NULL, '[Scenario: Stack Overflow in Recursive Sum]
What happens when calling sum(5) with definition int sum(int n) { return n + sum(n - 1); } ?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'Returns 15') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'Causes Stack Overflow due to the absence of a terminating base case') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'Returns 0') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'Returns 5') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

    -- Track DSA Q40 (Case Study)
    INSERT INTO mcq_questions (track, category, question_text, code_snippet, case_study_passage, marks, is_active)
    VALUES ('DSA', 'Case Study', '[Scenario: Array Element Shift for Deletion] To delete element at index k in an array of size $N$, how should elements shift?', NULL, '[Scenario: Array Element Shift for Deletion]
To delete element at index k in an array of size $N$, how should elements shift?', 2, true)
    RETURNING id INTO q_id;

    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'A', 'for (int i = k; i < N - 1; i++) arr[i] = arr[i + 1];') RETURNING id INTO opt_a_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'B', 'for (int i = N - 1; i > k; i--) arr[i] = arr[i - 1];') RETURNING id INTO opt_b_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'C', 'arr[k] = 0;') RETURNING id INTO opt_c_id;
    INSERT INTO mcq_options (question_id, option_key, option_text) VALUES (q_id, 'D', 'for (int i = 0; i < k; i++) arr[i] = arr[i + 1];') RETURNING id INTO opt_d_id;

    IF 'None' = 'A' THEN corr_id := opt_a_id;
    ELSIF 'None' = 'B' THEN corr_id := opt_b_id;
    ELSIF 'None' = 'C' THEN corr_id := opt_c_id;
    ELSE corr_id := opt_d_id;
    END IF;

    INSERT INTO mcq_answer_keys (question_id, correct_option_id, correct_option_key, explanation)
    VALUES (q_id, corr_id, 'None', NULL);

END $$;
