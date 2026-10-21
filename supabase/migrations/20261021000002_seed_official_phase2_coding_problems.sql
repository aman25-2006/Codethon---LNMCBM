-- ============================================================================
-- LNMCBM CODTHON 2026 — Phase 2 Official Coding Test Suite Seed Migration
-- Source: CODTHON 2026 — PHASE 2 CODING TEST SUITE (Official Test Suite)
-- 16 Problems across 6 Tracks (C, C++, Java, Python, Web Dev, DSA with C/C++/Java)
-- 5 Hidden Test Cases per Problem (80 test cases total, 2 marks each = 10 marks/problem)
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_coding_problems_slug ON coding_problems (slug);

-- ----------------------------------------------------------------------------
-- Problem: Student Marks Processing & Distinction Counter (C / C)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'Student Marks Processing & Distinction Counter',
    'student-marks-processing-distinction',
    'C',
    'C',
    'The examination department at LNMCBM requires a utility to analyze student scores in an introductory programming assessment. Given an integer N representing the number of students, followed by N integers representing individual exam scores (out of 100):
1. Compute the class average mark rounded to two decimal places.
2. Count the number of students who achieved a Distinction (score >= 75).
3. Identify the highest (maximum) score in the class.',
    '1 <= N <= 100
0 <= M_i <= 100
Time Limit: 1.0 second
Memory Limit: 64 MB',
    'First line contains a single integer N — the number of students.
Second line contains N space-separated integers representing the marks: M_1, M_2, ..., M_N.',
    'Print three values on a single line separated by spaces:
<Average_Mark> <Distinction_Count> <Highest_Score>
(Average mark must be printed formatted to exactly 2 decimal places).',
    '5
60 85 75 90 40',
    '70.00 3 90',
    1000,
    64,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, '1
88', '88.00 1 88', 2, true
FROM coding_problems WHERE slug = 'student-marks-processing-distinction'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, '4
0 0 0 0', '0.00 0 0', 2, true
FROM coding_problems WHERE slug = 'student-marks-processing-distinction'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '5
100 100 100 100 100', '100.00 5 100', 2, true
FROM coding_problems WHERE slug = 'student-marks-processing-distinction'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, '6
74 75 76 74 75 73', '74.83 3 76', 2, true
FROM coding_problems WHERE slug = 'student-marks-processing-distinction'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, '7
45 55 65 75 85 95 35', '65.00 3 95', 2, true
FROM coding_problems WHERE slug = 'student-marks-processing-distinction'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: String Vowel Sanitizer & Space Transformer (C / C)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'String Vowel Sanitizer & Space Transformer',
    'string-vowel-sanitizer-space-transformer',
    'C',
    'C',
    'Write a program in C that reads a line of text (containing letters, digits, and spaces) and performs two operations:
1. Replaces every space '' '' with a hyphen ''-''.
2. Counts the total number of vowels (A, E, I, O, U, case-insensitive).
3. Prints the modified string and the total vowel count on two separate lines.',
    '1 <= length(S) <= 100
Characters are printable ASCII.
Time Limit: 1.0 second
Memory Limit: 64 MB',
    'A single line of text S (may contain spaces, terminated by newline).',
    'Line 1: The modified string with all spaces replaced by ''-''.
Line 2: An integer representing the total count of vowels.',
    'Codthon 2026 LNMCBM',
    'Codthon-2026-LNMCBM
3',
    1000,
    64,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, 'a e i o u', 'a-e-i-o-u
5', 2, true
FROM coding_problems WHERE slug = 'string-vowel-sanitizer-space-transformer'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, 'AEIOU', 'AEIOU
5', 2, true
FROM coding_problems WHERE slug = 'string-vowel-sanitizer-space-transformer'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '12345 67890', '12345-67890
0', 2, true
FROM coding_problems WHERE slug = 'string-vowel-sanitizer-space-transformer'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, 'C programming language', 'C-programming-language
7', 2, true
FROM coding_problems WHERE slug = 'string-vowel-sanitizer-space-transformer'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, 'Z', 'Z
0', 2, true
FROM coding_problems WHERE slug = 'string-vowel-sanitizer-space-transformer'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: Inventory Item Valuation Class (C++ / C++)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'Inventory Item Valuation Class',
    'inventory-item-valuation-class',
    'C++',
    'C++',
    'Design a class InventoryItem in C++ that encapsulates id (integer), name (string), unitPrice (double), and quantity (integer).
The class must provide:
1. A parameterized constructor to initialize data members.
2. A member function double getTotalValue() returning unitPrice * quantity.
3. A member function bool needsRestock() returning true if quantity < 10, else false.
Given N items, compute the total valuation of all items combined, and count how many items need restocking.',
    '1 <= N <= 100
0.0 <= unitPrice <= 10000.0
0 <= quantity <= 1000
Time Limit: 1.0 second
Memory Limit: 64 MB',
    'First line: Integer N — number of inventory items.
Next N lines: Each line contains id name unitPrice quantity separated by spaces.',
    'Print two space-separated values:
<Total_Inventory_Value> <Restock_Count>
(Total value formatted to 2 decimal places).',
    '3
101 Pen 15.50 50
102 Notebook 45.00 8
103 Folder 20.00 5',
    '1235.00 2',
    1000,
    64,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, '1
1 Eraser 5.00 10', '50.00 0', 2, true
FROM coding_problems WHERE slug = 'inventory-item-valuation-class'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, '1
2 Marker 25.00 9', '225.00 1', 2, true
FROM coding_problems WHERE slug = 'inventory-item-valuation-class'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '2
10 A 100.00 0
20 B 50.00 0', '0.00 2', 2, true
FROM coding_problems WHERE slug = 'inventory-item-valuation-class'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, '3
1 P1 12.25 100
2 P2 8.75 200
3 P3 5.00 300', '4475.00 0', 2, true
FROM coding_problems WHERE slug = 'inventory-item-valuation-class'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, '4
1 X 10.50 4
2 Y 20.25 15
3 Z 30.00 2
4 W 40.00 8', '725.75 3', 2, true
FROM coding_problems WHERE slug = 'inventory-item-valuation-class'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: BankAccount Transaction & Balance Guard (C++ / C++)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'BankAccount Transaction & Balance Guard',
    'bankaccount-transaction-balance-guard',
    'C++',
    'C++',
    'Create a BankAccount class with private data members accountNumber (string) and balance (double).
Implement:
1. deposit(double amount): Adds amount to balance if amount > 0.
2. withdraw(double amount): Deducts amount from balance if amount > 0 and amount <= balance, returning true. If amount > balance, leaves balance unchanged and returns false (insufficient funds).
Given an initial balance and M sequential transaction commands (D amount for deposit, W amount for withdraw):
Execute the commands.
Count the number of rejected withdrawal attempts.
Print final balance and total rejected withdrawals.',
    'Initial balance >= 0.0
1 <= M <= 50
Transaction amount > 0.0
Time Limit: 1.0 second
Memory Limit: 64 MB',
    'First line: accountNumber initialBalance
Second line: Integer M — number of transactions.
Next M lines: Character command (D or W) and a double amount.',
    'Print two space-separated values:
<Final_Balance> <Rejected_Count>
(Balance formatted to 2 decimal places).',
    'ACC101 500.00
4
D 200.00
W 100.00
W 800.00
W 500.00',
    '100.00 1',
    1000,
    64,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, 'ACC1 100.00
1
W 100.00', '0.00 0', 2, true
FROM coding_problems WHERE slug = 'bankaccount-transaction-balance-guard'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, 'ACC2 50.00
2
W 50.01
W 60.00', '50.00 2', 2, true
FROM coding_problems WHERE slug = 'bankaccount-transaction-balance-guard'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, 'ACC3 0.00
3
D 150.00
D 50.00
W 120.00', '80.00 0', 2, true
FROM coding_problems WHERE slug = 'bankaccount-transaction-balance-guard'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, 'ACC4 1000.00
3
W 200.00
W 300.00
W 500.00', '0.00 0', 2, true
FROM coding_problems WHERE slug = 'bankaccount-transaction-balance-guard'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, 'ACC5 500.00
5
W 600.00
D 300.00
W 600.00
W 300.00
W 100.00', '200.00 1', 2, true
FROM coding_problems WHERE slug = 'bankaccount-transaction-balance-guard'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: Array Range Filter & Statistical Summary (Java / Java)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'Array Range Filter & Statistical Summary',
    'array-range-filter-mean-stats',
    'Java',
    'Java',
    'Write a Java program that reads an integer N, followed by an array of N integers, and two range boundary integers L and R (L <= R).
1. Filter all elements X that satisfy L <= X <= R.
2. Calculate the count and arithmetic average of the qualifying elements.
3. If no elements fall within the range, output 0 0.00.',
    '1 <= N <= 1000
-10^5 <= arr[i], L, R <= 10^5
Time Limit: 1.5 seconds
Memory Limit: 128 MB',
    'Line 1: Integer N — size of array.
Line 2: N space-separated integers.
Line 3: Two integers L and R.',
    'Print <Count> <Average> separated by space (Average formatted to 2 decimal places).',
    '6
10 25 40 5 80 30
15 50',
    '3 31.67',
    1500,
    128,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, '5
10 20 30 40 50
60 100', '0 0.00', 2, true
FROM coding_problems WHERE slug = 'array-range-filter-mean-stats'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, '3
15 15 15
15 15', '3 15.00', 2, true
FROM coding_problems WHERE slug = 'array-range-filter-mean-stats'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '4
-20 -10 0 10
-15 5', '2 -5.00', 2, true
FROM coding_problems WHERE slug = 'array-range-filter-mean-stats'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, '1
42
40 50', '1 42.00', 2, true
FROM coding_problems WHERE slug = 'array-range-filter-mean-stats'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, '5
1 2 3 4 5
1 5', '5 3.00', 2, true
FROM coding_problems WHERE slug = 'array-range-filter-mean-stats'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: Robust Numeric Token Parser with Exception Guard (Java / Java)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'Robust Numeric Token Parser with Exception Guard',
    'numeric-token-parser-exception-guard',
    'Java',
    'Java',
    'In an automated data pipeline, data streams contain mixed tokens (valid integers and corrupted non-numeric text). Write a Java program that reads N tokens. For each token:
Use Integer.parseInt() wrapped in a try-catch block (NumberFormatException).
If parsing succeeds, add the integer value to a running total.
If parsing fails (NumberFormatException), increment an invalidTokenCount.
Output the sum of all valid integers and the count of invalid tokens.',
    '1 <= N <= 200
Valid integers fit in standard 32-bit signed integer range.
Time Limit: 1.5 seconds
Memory Limit: 128 MB',
    'Line 1: Integer N — number of tokens.
Line 2: N space-separated string tokens.',
    'Print <Valid_Sum> <Invalid_Count> separated by a space.',
    '5
100 ABC 250 XYZ 50',
    '400 2',
    1500,
    128,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, '3
10 20 30', '60 0', 2, true
FROM coding_problems WHERE slug = 'numeric-token-parser-exception-guard'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, '3
FAIL ERR N/A', '0 3', 2, true
FROM coding_problems WHERE slug = 'numeric-token-parser-exception-guard'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '4
-50 100 -25 TEST', '25 1', 2, true
FROM coding_problems WHERE slug = 'numeric-token-parser-exception-guard'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, '1
0', '0 0', 2, true
FROM coding_problems WHERE slug = 'numeric-token-parser-exception-guard'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, '6
15.5 20 30.2 40 ABC 10', '70 3', 2, true
FROM coding_problems WHERE slug = 'numeric-token-parser-exception-guard'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: Daily Sales Revenue & Peak Day Tracker (Python / Python)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'Daily Sales Revenue & Peak Day Tracker',
    'daily-sales-tally-peak-tracker',
    'Python',
    'Python',
    'A retail store tracks daily sales across N days. Given N daily sales numbers:
1. Calculate the total revenue.
2. Find the average daily sales rounded to two decimal places.
3. Identify the highest daily sale value.
4. Count the number of days that achieved sales strictly greater than the average.

Strict Pedagogical Policy: Strictly pure top-level procedural logic (zero def, zero recursion, zero try-except).',
    '1 <= N <= 365
Sales values >= 0
Time Limit: 1.5 seconds
Memory Limit: 128 MB',
    'Line 1: Integer N — number of days.
Line 2: N space-separated integers representing sales for each day.',
    'Print four space-separated values:
<Total> <Average_Rounded_2_Decimals> <Max_Sale> <Days_Above_Average>',
    '5
1200 2500 1800 3200 1500',
    '10200 2040.00 3200 2',
    1500,
    128,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, '1
500', '500 500.00 500 0', 2, true
FROM coding_problems WHERE slug = 'daily-sales-tally-peak-tracker'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, '4
100 100 100 100', '400 100.00 100 0', 2, true
FROM coding_problems WHERE slug = 'daily-sales-tally-peak-tracker'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '3
0 0 300', '300 100.00 300 1', 2, true
FROM coding_problems WHERE slug = 'daily-sales-tally-peak-tracker'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, '5
10 20 30 40 50', '150 30.00 50 2', 2, true
FROM coding_problems WHERE slug = 'daily-sales-tally-peak-tracker'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, '6
500 1000 1500 2000 2500 3000', '10500 1750.00 3000 3', 2, true
FROM coding_problems WHERE slug = 'daily-sales-tally-peak-tracker'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: Product Code Frequency & Slicing Inversion (Python / Python)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'Product Code Frequency & Slicing Inversion',
    'dictionary-frequency-slicing',
    'Python',
    'Python',
    'A warehouse receives a list of N product codes. Write a Python script using dictionaries and lists to:
1. Count the frequency of each unique product code using a dictionary.
2. Find the product code with the highest frequency. If there is a tie, choose the lexicographically smaller code.
3. Print the most frequent product code, its frequency, and the reversed code string obtained using string slicing [::-1].

Strict Pedagogical Policy: Strictly pure top-level procedural logic (zero def, zero recursion, zero try-except).',
    '1 <= N <= 500
Product codes consist of alphanumeric uppercase characters.
Time Limit: 1.5 seconds
Memory Limit: 128 MB',
    'Line 1: Integer N — number of product codes.
Line 2: N space-separated string product codes.',
    'Print three values separated by space:
<Best_Code> <Frequency> <Reversed_Code>',
    '6
ITEMA ITEMB ITEMA ITEMC ITEMB ITEMA',
    'ITEMA 3 AMETI',
    1500,
    128,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, '1
CODE99', 'CODE99 1 99EDOC', 2, true
FROM coding_problems WHERE slug = 'dictionary-frequency-slicing'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, '4
XYZ ABC XYZ ABC', 'ABC 2 CBA', 2, true
FROM coding_problems WHERE slug = 'dictionary-frequency-slicing'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '5
RADAR RADAR RADAR RADAR RADAR', 'RADAR 5 RADAR', 2, true
FROM coding_problems WHERE slug = 'dictionary-frequency-slicing'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, '4
PROD1 PROD2 PROD3 PROD4', 'PROD1 1 1DORP', 2, true
FROM coding_problems WHERE slug = 'dictionary-frequency-slicing'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, '7
K10 K20 K10 K30 K20 K10 K40', 'K10 3 01K', 2, true
FROM coding_problems WHERE slug = 'dictionary-frequency-slicing'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: Responsive Student Profile Card Component (Web Development / JavaScript)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'Responsive Student Profile Card Component',
    'responsive-student-profile-card',
    'Web Development',
    'JavaScript',
    'Build an accessible, responsive student identity card using HTML5 and CSS3:
1. HTML Structure: Semantic wrapper (<article class="id-card">), profile picture avatar (<div class="avatar">), student name heading (<h2>), roll number, department, and status badge (<span class="badge">Active</span>).
2. CSS Requirements: max-width 320px centered on screen, box-sizing: border-box, white card background with subtle border #E2E8F0, rounded corners 12px, box shadow, flexbox alignment, and green pill badge.

Functional Evaluation Points:
• Semantic HTML (2M): Valid tags (<article>, <h2>, <p>, <span>) without broken containers.
• CSS Box Model (2M): Proper margins, padding (at least 16px), and box-sizing: border-box.
• Flexbox Centering (2M): Uses display: flex; flex-direction: column; align-items: center;.
• Visual Aesthetics (2M): Typography hierarchy, clean contrast, border radius.
• Responsiveness (2M): Fluid scaling down to 280px screen widths.',
    'Standard HTML5 and CSS3. Responsive down to 280px width.',
    'Complete HTML5 document with embedded <style> block.',
    'Rendered HTML5 UI component adhering to all 5 functional criteria.',
    'render',
    'PASS: Responsive Student Profile Card component rendered',
    2000,
    256,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, 'semantic-html', 'PASS: Semantic HTML tags present (<article>, <h2>, <p>, <span>)', 2, true
FROM coding_problems WHERE slug = 'responsive-student-profile-card'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, 'box-model', 'PASS: CSS box-sizing and padding configured', 2, true
FROM coding_problems WHERE slug = 'responsive-student-profile-card'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, 'flexbox-layout', 'PASS: Flexbox centering and column direction verified', 2, true
FROM coding_problems WHERE slug = 'responsive-student-profile-card'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, 'badge-styling', 'PASS: Active status badge styling and colors verified', 2, true
FROM coding_problems WHERE slug = 'responsive-student-profile-card'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, 'responsive-design', 'PASS: Responsive card max-width verified', 2, true
FROM coding_problems WHERE slug = 'responsive-student-profile-card'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: Dynamic Counter & Dark/Light Theme Widget (Web Development / JavaScript)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'Dynamic Counter & Dark/Light Theme Widget',
    'dynamic-counter-theme-switcher',
    'Web Development',
    'JavaScript',
    'Build an interactive widget featuring an interactive item counter and theme switcher using HTML, CSS, and vanilla JavaScript:
1. Interactive Counter: Display <div id="count">0</div>, increment button (+), decrement button (- stopping at 0 without going negative), reset button (Reset), and dynamic styling (green #16A34A when > 0, gray #64748B when 0).
2. Theme Switcher: Button #theme-btn toggling class ''dark-mode'' on #widget container.

Functional Evaluation Points:
• Increment Click Handler (2M): Increases counter value on button click.
• Floor at Zero (2M): Decrement button stops at 0 and does not produce negative numbers.
• Reset Action (2M): Resets count to 0 upon clicking Reset.
• Dynamic Color Mutator (2M): Updates text color based on numeric threshold.
• Class Toggle Interaction (2M): Correctly toggles dark-mode class using classList.toggle().',
    'Vanilla ES6 JavaScript, HTML5, and CSS3. Zero external dependencies.',
    'Complete HTML Document with embedded <style> and <script> tags.',
    'Interactive widget DOM behaviors verifying counter and theme transitions.',
    'init',
    'PASS: Counter initialized to 0 and widget container attached',
    2000,
    256,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, 'inc-click', 'PASS: Increment click handler increases count', 2, true
FROM coding_problems WHERE slug = 'dynamic-counter-theme-switcher'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, 'dec-floor', 'PASS: Decrement floor prevents negative numbers', 2, true
FROM coding_problems WHERE slug = 'dynamic-counter-theme-switcher'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, 'reset-action', 'PASS: Reset button restores counter to 0', 2, true
FROM coding_problems WHERE slug = 'dynamic-counter-theme-switcher'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, 'dynamic-color', 'PASS: Text color mutates on value change', 2, true
FROM coding_problems WHERE slug = 'dynamic-counter-theme-switcher'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, 'theme-toggle', 'PASS: Dark mode class toggled successfully', 2, true
FROM coding_problems WHERE slug = 'dynamic-counter-theme-switcher'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: Target Sum Pair in a Sorted Array (Two-Pointer Technique) (DSA / C)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'Target Sum Pair in a Sorted Array (Two-Pointer Technique)',
    'target-sum-pair-two-pointers-c',
    'DSA',
    'C',
    'Given an array of N integers sorted in non-decreasing order and a target value K, determine if there exists a pair of distinct elements whose sum is exactly equal to K.
If a pair exists, print the two values separated by a space (smaller value first). If multiple pairs exist, print the pair that begins with the smallest first element.
If no such pair exists, print -1.

An optimal solution must run in O(N) time and O(1) auxiliary space using the two-pointer approach.',
    '2 <= N <= 10^5
-10^9 <= A_i, K <= 10^9
Time Limit: 1.0 second
Memory Limit: 64 MB',
    'Line 1: Two space-separated integers N and K — the array size and target sum.
Line 2: N space-separated integers arranged in non-decreasing order: A_1, A_2, ..., A_N.',
    'Print the two integers forming the pair separated by a space, or -1 if no pair exists.',
    '6 16
1 4 6 10 12 15',
    '1 15',
    1000,
    64,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, '2 10
5 5', '5 5', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-c'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, '5 0
-10 -5 0 5 10', '-10 10', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-c'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '4 50
10 20 30 40', '10 40', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-c'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, '6 20
1 2 3 4 5 6', '-1', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-c'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, '5 2000000000
100000000 500000000 900000000 1000000000 1100000000', '900000000 1100000000', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-c'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: First and Last Occurrence in a Sorted Array (Binary Search) (DSA / C)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'First and Last Occurrence in a Sorted Array (Binary Search)',
    'first-last-occurrence-binary-search-c',
    'DSA',
    'C',
    'Given a sorted array of N integers (which may contain repeated elements) and a target value X, find the first (starting) and last (ending) 0-based indices of X in the array.
If X is present, print the two indices separated by a space: <first_index> <last_index>.
If X is not present in the array, print -1 -1.

An optimal algorithm must achieve O(log N) time complexity using modified Binary Search without linear scanning.',
    '1 <= N <= 10^5
-10^9 <= arr[i], X <= 10^9
Time Limit: 1.0 second
Memory Limit: 64 MB',
    'Line 1: Two space-separated integers N and X — the size of the array and target value.
Line 2: N space-separated integers sorted in non-decreasing order.',
    'Print <first_index> <last_index> separated by a space, or -1 -1 if X does not exist.',
    '8 5
1 3 5 5 5 5 67 123',
    '2 5',
    1000,
    64,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, '1 7
7', '0 0', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-c'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, '6 4
4 4 4 4 4 4', '0 5', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-c'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '5 1
1 2 3 4 5', '0 0', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-c'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, '5 5
1 2 3 4 5', '4 4', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-c'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, '7 50
10 20 30 40 60 70 80', '-1 -1', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-c'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: Target Sum Pair in a Sorted Array (Two-Pointer Technique) (DSA / C++)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'Target Sum Pair in a Sorted Array (Two-Pointer Technique)',
    'target-sum-pair-two-pointers-cpp',
    'DSA',
    'C++',
    'Given an array of N integers sorted in non-decreasing order and a target value K, determine if there exists a pair of distinct elements whose sum is exactly equal to K.
If a pair exists, print the two values separated by a space (smaller value first). If multiple pairs exist, print the pair that begins with the smallest first element.
If no such pair exists, print -1.

An optimal solution must run in O(N) time and O(1) auxiliary space using the two-pointer approach.',
    '2 <= N <= 10^5
-10^9 <= A_i, K <= 10^9
Time Limit: 1.0 second
Memory Limit: 64 MB',
    'Line 1: Two space-separated integers N and K — the array size and target sum.
Line 2: N space-separated integers arranged in non-decreasing order: A_1, A_2, ..., A_N.',
    'Print the two integers forming the pair separated by a space, or -1 if no pair exists.',
    '6 16
1 4 6 10 12 15',
    '1 15',
    1000,
    64,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, '2 10
5 5', '5 5', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-cpp'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, '5 0
-10 -5 0 5 10', '-10 10', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-cpp'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '4 50
10 20 30 40', '10 40', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-cpp'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, '6 20
1 2 3 4 5 6', '-1', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-cpp'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, '5 2000000000
100000000 500000000 900000000 1000000000 1100000000', '900000000 1100000000', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-cpp'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: First and Last Occurrence in a Sorted Array (Binary Search) (DSA / C++)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'First and Last Occurrence in a Sorted Array (Binary Search)',
    'first-last-occurrence-binary-search-cpp',
    'DSA',
    'C++',
    'Given a sorted array of N integers (which may contain repeated elements) and a target value X, find the first (starting) and last (ending) 0-based indices of X in the array.
If X is present, print the two indices separated by a space: <first_index> <last_index>.
If X is not present in the array, print -1 -1.

An optimal algorithm must achieve O(log N) time complexity using modified Binary Search without linear scanning.',
    '1 <= N <= 10^5
-10^9 <= arr[i], X <= 10^9
Time Limit: 1.0 second
Memory Limit: 64 MB',
    'Line 1: Two space-separated integers N and X — the size of the array and target value.
Line 2: N space-separated integers sorted in non-decreasing order.',
    'Print <first_index> <last_index> separated by a space, or -1 -1 if X does not exist.',
    '8 5
1 3 5 5 5 5 67 123',
    '2 5',
    1000,
    64,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, '1 7
7', '0 0', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-cpp'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, '6 4
4 4 4 4 4 4', '0 5', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-cpp'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '5 1
1 2 3 4 5', '0 0', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-cpp'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, '5 5
1 2 3 4 5', '4 4', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-cpp'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, '7 50
10 20 30 40 60 70 80', '-1 -1', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-cpp'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: Target Sum Pair in a Sorted Array (Two-Pointer Technique) (DSA / Java)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'Target Sum Pair in a Sorted Array (Two-Pointer Technique)',
    'target-sum-pair-two-pointers-java',
    'DSA',
    'Java',
    'Given an array of N integers sorted in non-decreasing order and a target value K, determine if there exists a pair of distinct elements whose sum is exactly equal to K.
If a pair exists, print the two values separated by a space (smaller value first). If multiple pairs exist, print the pair that begins with the smallest first element.
If no such pair exists, print -1.

An optimal solution must run in O(N) time and O(1) auxiliary space using the two-pointer approach.',
    '2 <= N <= 10^5
-10^9 <= A_i, K <= 10^9
Time Limit: 1.5 seconds
Memory Limit: 128 MB',
    'Line 1: Two space-separated integers N and K — the array size and target sum.
Line 2: N space-separated integers arranged in non-decreasing order: A_1, A_2, ..., A_N.',
    'Print the two integers forming the pair separated by a space, or -1 if no pair exists.',
    '6 16
1 4 6 10 12 15',
    '1 15',
    1500,
    128,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, '2 10
5 5', '5 5', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-java'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, '5 0
-10 -5 0 5 10', '-10 10', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-java'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '4 50
10 20 30 40', '10 40', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-java'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, '6 20
1 2 3 4 5 6', '-1', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-java'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, '5 2000000000
100000000 500000000 900000000 1000000000 1100000000', '900000000 1100000000', 2, true
FROM coding_problems WHERE slug = 'target-sum-pair-two-pointers-java'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Problem: First and Last Occurrence in a Sorted Array (Binary Search) (DSA / Java)
-- ----------------------------------------------------------------------------
INSERT INTO coding_problems (
    title, slug, category, programming_language, problem_statement, constraints,
    input_format, output_format, sample_input, sample_output,
    time_limit_ms, memory_limit_mb, marks_per_test_case, total_marks, is_active
) VALUES (
    'First and Last Occurrence in a Sorted Array (Binary Search)',
    'first-last-occurrence-binary-search-java',
    'DSA',
    'Java',
    'Given a sorted array of N integers (which may contain repeated elements) and a target value X, find the first (starting) and last (ending) 0-based indices of X in the array.
If X is present, print the two indices separated by a space: <first_index> <last_index>.
If X is not present in the array, print -1 -1.

An optimal algorithm must achieve O(log N) time complexity using modified Binary Search without linear scanning.',
    '1 <= N <= 10^5
-10^9 <= arr[i], X <= 10^9
Time Limit: 1.5 seconds
Memory Limit: 128 MB',
    'Line 1: Two space-separated integers N and X — the size of the array and target value.
Line 2: N space-separated integers sorted in non-decreasing order.',
    'Print <first_index> <last_index> separated by a space, or -1 -1 if X does not exist.',
    '8 5
1 3 5 5 5 5 67 123',
    '2 5',
    1500,
    128,
    2,
    10,
    true
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    programming_language = EXCLUDED.programming_language,
    problem_statement = EXCLUDED.problem_statement,
    constraints = EXCLUDED.constraints,
    input_format = EXCLUDED.input_format,
    output_format = EXCLUDED.output_format,
    sample_input = EXCLUDED.sample_input,
    sample_output = EXCLUDED.sample_output,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    marks_per_test_case = EXCLUDED.marks_per_test_case,
    total_marks = EXCLUDED.total_marks,
    is_active = EXCLUDED.is_active;

INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 1, '1 7
7', '0 0', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-java'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 2, '6 4
4 4 4 4 4 4', '0 5', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-java'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 3, '5 1
1 2 3 4 5', '0 0', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-java'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 4, '5 5
1 2 3 4 5', '4 4', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-java'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;
INSERT INTO hidden_test_cases (problem_id, test_case_order, input_data, expected_output, marks, is_active)
SELECT id, 5, '7 50
10 20 30 40 60 70 80', '-1 -1', 2, true
FROM coding_problems WHERE slug = 'first-last-occurrence-binary-search-java'
ON CONFLICT (problem_id, test_case_order) DO UPDATE SET
    input_data = EXCLUDED.input_data,
    expected_output = EXCLUDED.expected_output,
    marks = EXCLUDED.marks,
    is_active = EXCLUDED.is_active;

