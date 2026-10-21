/**
 * LNMCBM CODTHON 2026 — Official Phase 2 Coding Test Suite
 * Master Curriculum & Evaluation Benchmark
 *
 * Source: CODTHON 2026 — PHASE 2 CODING TEST SUITE Official Blueprint
 * 2 Problems per Track (Problem 1: Easy • 10M, Problem 2: Easy-Moderate • 10M = 20M Total)
 * 5 Hidden Test Cases per Problem (2 Marks each = 10 Marks per Problem)
 * 30-Minute Examination Window
 */

export interface TestCaseDefinition {
  order: number;
  input: string;
  output: string;
  explanation?: string;
}

export interface OfficialCodingProblemDefinition {
  title: string;
  slug: string;
  category: "C" | "C++" | "Java" | "Python" | "Web Development" | "DSA";
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
  test_cases: TestCaseDefinition[];
}

export const OFFICIAL_PHASE2_CODING_PROBLEMS: OfficialCodingProblemDefinition[] = [
  // =========================================================================
  // TRACK A: C PROGRAMMING (Core Track)
  // =========================================================================
  {
    title: "Student Marks Processing & Distinction Counter",
    slug: "student-marks-processing-distinction",
    category: "C",
    programming_language: "C",
    problem_statement:
      "The examination department at LNMCBM requires a utility to analyze student scores in an introductory programming assessment. Given an integer N representing the number of students, followed by N integers representing individual exam scores (out of 100):\n" +
      "1. Compute the class average mark rounded to two decimal places.\n" +
      "2. Count the number of students who achieved a Distinction (score >= 75).\n" +
      "3. Identify the highest (maximum) score in the class.",
    constraints: "1 <= N <= 100\n0 <= M_i <= 100\nTime Limit: 1.0 second\nMemory Limit: 64 MB",
    input_format:
      "First line contains a single integer N — the number of students.\n" +
      "Second line contains N space-separated integers representing the marks: M_1, M_2, ..., M_N.",
    output_format:
      "Print three values on a single line separated by spaces:\n" +
      "<Average_Mark> <Distinction_Count> <Highest_Score>\n" +
      "(Average mark must be printed formatted to exactly 2 decimal places).",
    sample_input: "5\n60 85 75 90 40",
    sample_output: "70.00 3 90",
    time_limit_ms: 1000,
    memory_limit_mb: 64,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "1\n88", output: "88.00 1 88", explanation: "Single-student boundary (N=1, distinction)" },
      { order: 2, input: "4\n0 0 0 0", output: "0.00 0 0", explanation: "All scores minimum boundary (zero values)" },
      { order: 3, input: "5\n100 100 100 100 100", output: "100.00 5 100", explanation: "Perfect score boundary (all 100)" },
      { order: 4, input: "6\n74 75 76 74 75 73", output: "74.83 3 76", explanation: "Exact distinction boundary checks around 75" },
      { order: 5, input: "7\n45 55 65 75 85 95 35", output: "65.00 3 95", explanation: "Mixed distribution across fail, pass, distinction" },
    ],
  },
  {
    title: "String Vowel Sanitizer & Space Transformer",
    slug: "string-vowel-sanitizer-space-transformer",
    category: "C",
    programming_language: "C",
    problem_statement:
      "Write a program in C that reads a line of text (containing letters, digits, and spaces) and performs two operations:\n" +
      "1. Replaces every space ' ' with a hyphen '-'.\n" +
      "2. Counts the total number of vowels (A, E, I, O, U, case-insensitive).\n" +
      "3. Prints the modified string and the total vowel count on two separate lines.",
    constraints: "1 <= length(S) <= 100\nCharacters are printable ASCII.\nTime Limit: 1.0 second\nMemory Limit: 64 MB",
    input_format: "A single line of text S (may contain spaces, terminated by newline).",
    output_format:
      "Line 1: The modified string with all spaces replaced by '-'.\n" +
      "Line 2: An integer representing the total count of vowels.",
    sample_input: "Codthon 2026 LNMCBM",
    sample_output: "Codthon-2026-LNMCBM\n3",
    time_limit_ms: 1000,
    memory_limit_mb: 64,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "a e i o u", output: "a-e-i-o-u\n5", explanation: "Lowercase vowels separated by multiple single spaces" },
      { order: 2, input: "AEIOU", output: "AEIOU\n5", explanation: "Uppercase vowel sequence with zero spaces" },
      { order: 3, input: "12345 67890", output: "12345-67890\n0", explanation: "Digits only with spaces (zero vowels)" },
      { order: 4, input: "C programming language", output: "C-programming-language\n7", explanation: "Mixed case with spaces (o, a, i, a, u, a, e = 7)" },
      { order: 5, input: "Z", output: "Z\n0", explanation: "Single consonant boundary (minimum length)" },
    ],
  },

  // =========================================================================
  // TRACK B: C++ PROGRAMMING (OOP Track)
  // =========================================================================
  {
    title: "Inventory Item Valuation Class",
    slug: "inventory-item-valuation-class",
    category: "C++",
    programming_language: "C++",
    problem_statement:
      "Design a class InventoryItem in C++ that encapsulates id (integer), name (string), unitPrice (double), and quantity (integer).\n" +
      "The class must provide:\n" +
      "1. A parameterized constructor to initialize data members.\n" +
      "2. A member function double getTotalValue() returning unitPrice * quantity.\n" +
      "3. A member function bool needsRestock() returning true if quantity < 10, else false.\n" +
      "Given N items, compute the total valuation of all items combined, and count how many items need restocking.",
    constraints: "1 <= N <= 100\n0.0 <= unitPrice <= 10000.0\n0 <= quantity <= 1000\nTime Limit: 1.0 second\nMemory Limit: 64 MB",
    input_format:
      "First line: Integer N — number of inventory items.\n" +
      "Next N lines: Each line contains id name unitPrice quantity separated by spaces.",
    output_format:
      "Print two space-separated values:\n" +
      "<Total_Inventory_Value> <Restock_Count>\n" +
      "(Total value formatted to 2 decimal places).",
    sample_input: "3\n101 Pen 15.50 50\n102 Notebook 45.00 8\n103 Folder 20.00 5",
    sample_output: "1235.00 2",
    time_limit_ms: 1000,
    memory_limit_mb: 64,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "1\n1 Eraser 5.00 10", output: "50.00 0", explanation: "Boundary qty = 10 (not < 10)" },
      { order: 2, input: "1\n2 Marker 25.00 9", output: "225.00 1", explanation: "Boundary qty = 9 (< 10)" },
      { order: 3, input: "2\n10 A 100.00 0\n20 B 50.00 0", output: "0.00 2", explanation: "Zero quantity / zero stock" },
      { order: 4, input: "3\n1 P1 12.25 100\n2 P2 8.75 200\n3 P3 5.00 300", output: "4475.00 0", explanation: "High quantities, zero restocking" },
      { order: 5, input: "4\n1 X 10.50 4\n2 Y 20.25 15\n3 Z 30.00 2\n4 W 40.00 8", output: "725.75 3", explanation: "Multiple items with decimals" },
    ],
  },
  {
    title: "BankAccount Transaction & Balance Guard",
    slug: "bankaccount-transaction-balance-guard",
    category: "C++",
    programming_language: "C++",
    problem_statement:
      "Create a BankAccount class with private data members accountNumber (string) and balance (double).\n" +
      "Implement:\n" +
      "1. deposit(double amount): Adds amount to balance if amount > 0.\n" +
      "2. withdraw(double amount): Deducts amount from balance if amount > 0 and amount <= balance, returning true. If amount > balance, leaves balance unchanged and returns false (insufficient funds).\n" +
      "Given an initial balance and M sequential transaction commands (D amount for deposit, W amount for withdraw):\n" +
      "Execute the commands.\n" +
      "Count the number of rejected withdrawal attempts.\n" +
      "Print final balance and total rejected withdrawals.",
    constraints: "Initial balance >= 0.0\n1 <= M <= 50\nTransaction amount > 0.0\nTime Limit: 1.0 second\nMemory Limit: 64 MB",
    input_format:
      "First line: accountNumber initialBalance\n" +
      "Second line: Integer M — number of transactions.\n" +
      "Next M lines: Character command (D or W) and a double amount.",
    output_format:
      "Print two space-separated values:\n" +
      "<Final_Balance> <Rejected_Count>\n" +
      "(Balance formatted to 2 decimal places).",
    sample_input: "ACC101 500.00\n4\nD 200.00\nW 100.00\nW 800.00\nW 500.00",
    sample_output: "100.00 1",
    time_limit_ms: 1000,
    memory_limit_mb: 64,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "ACC1 100.00\n1\nW 100.00", output: "0.00 0", explanation: "Exact withdrawal down to zero" },
      { order: 2, input: "ACC2 50.00\n2\nW 50.01\nW 60.00", output: "50.00 2", explanation: "Repeated insufficient fund rejections" },
      { order: 3, input: "ACC3 0.00\n3\nD 150.00\nD 50.00\nW 120.00", output: "80.00 0", explanation: "Zero initial balance with successive deposits" },
      { order: 4, input: "ACC4 1000.00\n3\nW 200.00\nW 300.00\nW 500.00", output: "0.00 0", explanation: "Sequential withdrawals exhausting balance" },
      { order: 5, input: "ACC5 500.00\n5\nW 600.00\nD 300.00\nW 600.00\nW 300.00\nW 100.00", output: "200.00 1", explanation: "Interleaved rejected and accepted withdrawals" },
    ],
  },

  // =========================================================================
  // TRACK C: JAVA PROGRAMMING (Core Java)
  // =========================================================================
  {
    title: "Array Range Filter & Statistical Summary",
    slug: "array-range-filter-mean-stats",
    category: "Java",
    programming_language: "Java",
    problem_statement:
      "Write a Java program that reads an integer N, followed by an array of N integers, and two range boundary integers L and R (L <= R).\n" +
      "1. Filter all elements X that satisfy L <= X <= R.\n" +
      "2. Calculate the count and arithmetic average of the qualifying elements.\n" +
      "3. If no elements fall within the range, output 0 0.00.",
    constraints: "1 <= N <= 1000\n-10^5 <= arr[i], L, R <= 10^5\nTime Limit: 1.5 seconds\nMemory Limit: 128 MB",
    input_format:
      "Line 1: Integer N — size of array.\n" +
      "Line 2: N space-separated integers.\n" +
      "Line 3: Two integers L and R.",
    output_format: "Print <Count> <Average> separated by space (Average formatted to 2 decimal places).",
    sample_input: "6\n10 25 40 5 80 30\n15 50",
    sample_output: "3 31.67",
    time_limit_ms: 1500,
    memory_limit_mb: 128,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "5\n10 20 30 40 50\n60 100", output: "0 0.00", explanation: "Zero matching elements" },
      { order: 2, input: "3\n15 15 15\n15 15", output: "3 15.00", explanation: "Exact point range L = R" },
      { order: 3, input: "4\n-20 -10 0 10\n-15 5", output: "2 -5.00", explanation: "Negative and positive integers" },
      { order: 4, input: "1\n42\n40 50", output: "1 42.00", explanation: "Single element within range" },
      { order: 5, input: "5\n1 2 3 4 5\n1 5", output: "5 3.00", explanation: "All elements qualifying" },
    ],
  },
  {
    title: "Robust Numeric Token Parser with Exception Guard",
    slug: "numeric-token-parser-exception-guard",
    category: "Java",
    programming_language: "Java",
    problem_statement:
      "In an automated data pipeline, data streams contain mixed tokens (valid integers and corrupted non-numeric text). Write a Java program that reads N tokens. For each token:\n" +
      "Use Integer.parseInt() wrapped in a try-catch block (NumberFormatException).\n" +
      "If parsing succeeds, add the integer value to a running total.\n" +
      "If parsing fails (NumberFormatException), increment an invalidTokenCount.\n" +
      "Output the sum of all valid integers and the count of invalid tokens.",
    constraints: "1 <= N <= 200\nValid integers fit in standard 32-bit signed integer range.\nTime Limit: 1.5 seconds\nMemory Limit: 128 MB",
    input_format:
      "Line 1: Integer N — number of tokens.\n" +
      "Line 2: N space-separated string tokens.",
    output_format: "Print <Valid_Sum> <Invalid_Count> separated by a space.",
    sample_input: "5\n100 ABC 250 XYZ 50",
    sample_output: "400 2",
    time_limit_ms: 1500,
    memory_limit_mb: 128,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "3\n10 20 30", output: "60 0", explanation: "All tokens valid integers" },
      { order: 2, input: "3\nFAIL ERR N/A", output: "0 3", explanation: "All tokens invalid non-numerics" },
      { order: 3, input: "4\n-50 100 -25 TEST", output: "25 1", explanation: "Negative numbers handled correctly" },
      { order: 4, input: "1\n0", output: "0 0", explanation: "Single zero token boundary" },
      { order: 5, input: "6\n15.5 20 30.2 40 ABC 10", output: "70 3", explanation: "Floating point tokens caught as non-integers" },
    ],
  },

  // =========================================================================
  // TRACK D: PYTHON PROGRAMMING (Python Logic)
  // Strict Pedagogical Policy: Zero def / Zero try-except
  // =========================================================================
  {
    title: "Daily Sales Revenue & Peak Day Tracker",
    slug: "daily-sales-tally-peak-tracker",
    category: "Python",
    programming_language: "Python",
    problem_statement:
      "A retail store tracks daily sales across N days. Given N daily sales numbers:\n" +
      "1. Calculate the total revenue.\n" +
      "2. Find the average daily sales rounded to two decimal places.\n" +
      "3. Identify the highest daily sale value.\n" +
      "4. Count the number of days that achieved sales strictly greater than the average.\n\n" +
      "Strict Pedagogical Policy: Strictly pure top-level procedural logic (zero def, zero recursion, zero try-except).",
    constraints: "1 <= N <= 365\nSales values >= 0\nTime Limit: 1.5 seconds\nMemory Limit: 128 MB",
    input_format:
      "Line 1: Integer N — number of days.\n" +
      "Line 2: N space-separated integers representing sales for each day.",
    output_format: "Print four space-separated values:\n<Total> <Average_Rounded_2_Decimals> <Max_Sale> <Days_Above_Average>",
    sample_input: "5\n1200 2500 1800 3200 1500",
    sample_output: "10200 2040.00 3200 2",
    time_limit_ms: 1500,
    memory_limit_mb: 128,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "1\n500", output: "500 500.00 500 0", explanation: "Single day boundary (no days above avg)" },
      { order: 2, input: "4\n100 100 100 100", output: "400 100.00 100 0", explanation: "All identical sales (none strictly greater than avg)" },
      { order: 3, input: "3\n0 0 300", output: "300 100.00 300 1", explanation: "Zero sales on prior days" },
      { order: 4, input: "5\n10 20 30 40 50", output: "150 30.00 50 2", explanation: "Linear progression" },
      { order: 5, input: "6\n500 1000 1500 2000 2500 3000", output: "10500 1750.00 3000 3", explanation: "Even count distribution" },
    ],
  },
  {
    title: "Product Code Frequency & Slicing Inversion",
    slug: "dictionary-frequency-slicing",
    category: "Python",
    programming_language: "Python",
    problem_statement:
      "A warehouse receives a list of N product codes. Write a Python script using dictionaries and lists to:\n" +
      "1. Count the frequency of each unique product code using a dictionary.\n" +
      "2. Find the product code with the highest frequency. If there is a tie, choose the lexicographically smaller code.\n" +
      "3. Print the most frequent product code, its frequency, and the reversed code string obtained using string slicing [::-1].\n\n" +
      "Strict Pedagogical Policy: Strictly pure top-level procedural logic (zero def, zero recursion, zero try-except).",
    constraints: "1 <= N <= 500\nProduct codes consist of alphanumeric uppercase characters.\nTime Limit: 1.5 seconds\nMemory Limit: 128 MB",
    input_format:
      "Line 1: Integer N — number of product codes.\n" +
      "Line 2: N space-separated string product codes.",
    output_format: "Print three values separated by space:\n<Best_Code> <Frequency> <Reversed_Code>",
    sample_input: "6\nITEMA ITEMB ITEMA ITEMC ITEMB ITEMA",
    sample_output: "ITEMA 3 AMETI",
    time_limit_ms: 1500,
    memory_limit_mb: 128,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "1\nCODE99", output: "CODE99 1 99EDOC", explanation: "Single product code" },
      { order: 2, input: "4\nXYZ ABC XYZ ABC", output: "ABC 2 CBA", explanation: "Tie breaker: 'ABC' chosen over 'XYZ'" },
      { order: 3, input: "5\nRADAR RADAR RADAR RADAR RADAR", output: "RADAR 5 RADAR", explanation: "Palindrome code string" },
      { order: 4, input: "4\nPROD1 PROD2 PROD3 PROD4", output: "PROD1 1 1DORP", explanation: "All unique frequencies = 1" },
      { order: 5, input: "7\nK10 K20 K10 K30 K20 K10 K40", output: "K10 3 01K", explanation: "Clear majority item" },
    ],
  },

  // =========================================================================
  // TRACK E: WEB DEVELOPMENT (Frontend Track)
  // Evaluated on box model styling, responsiveness, and interactive DOM handlers
  // =========================================================================
  {
    title: "Responsive Student Profile Card Component",
    slug: "responsive-student-profile-card",
    category: "Web Development",
    programming_language: "JavaScript",
    problem_statement:
      "Build an accessible, responsive student identity card using HTML5 and CSS3:\n" +
      "1. HTML Structure: Semantic wrapper (<article class=\"id-card\">), profile picture avatar (<div class=\"avatar\">), student name heading (<h2>), roll number, department, and status badge (<span class=\"badge\">Active</span>).\n" +
      "2. CSS Requirements: max-width 320px centered on screen, box-sizing: border-box, white card background with subtle border #E2E8F0, rounded corners 12px, box shadow, flexbox alignment, and green pill badge.\n\n" +
      "Functional Evaluation Points:\n" +
      "• Semantic HTML (2M): Valid tags (<article>, <h2>, <p>, <span>) without broken containers.\n" +
      "• CSS Box Model (2M): Proper margins, padding (at least 16px), and box-sizing: border-box.\n" +
      "• Flexbox Centering (2M): Uses display: flex; flex-direction: column; align-items: center;.\n" +
      "• Visual Aesthetics (2M): Typography hierarchy, clean contrast, border radius.\n" +
      "• Responsiveness (2M): Fluid scaling down to 280px screen widths.",
    constraints: "Standard HTML5 and CSS3. Responsive down to 280px width.",
    input_format: "Complete HTML5 document with embedded <style> block.",
    output_format: "Rendered HTML5 UI component adhering to all 5 functional criteria.",
    sample_input: "render",
    sample_output: "PASS: Responsive Student Profile Card component rendered",
    time_limit_ms: 2000,
    memory_limit_mb: 256,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "semantic-html", output: "PASS: Semantic HTML tags present (<article>, <h2>, <p>, <span>)", explanation: "Semantic tags verified" },
      { order: 2, input: "box-model", output: "PASS: CSS box-sizing and padding configured", explanation: "Box model padding and box-sizing" },
      { order: 3, input: "flexbox-layout", output: "PASS: Flexbox centering and column direction verified", explanation: "Flexbox column centering" },
      { order: 4, input: "badge-styling", output: "PASS: Active status badge styling and colors verified", explanation: "Green pill badge styling" },
      { order: 5, input: "responsive-design", output: "PASS: Responsive card max-width verified", explanation: "Max-width 320px and fluid scaling" },
    ],
  },
  {
    title: "Dynamic Counter & Dark/Light Theme Widget",
    slug: "dynamic-counter-theme-switcher",
    category: "Web Development",
    programming_language: "JavaScript",
    problem_statement:
      "Build an interactive widget featuring an interactive item counter and theme switcher using HTML, CSS, and vanilla JavaScript:\n" +
      "1. Interactive Counter: Display <div id=\"count\">0</div>, increment button (+), decrement button (- stopping at 0 without going negative), reset button (Reset), and dynamic styling (green #16A34A when > 0, gray #64748B when 0).\n" +
      "2. Theme Switcher: Button #theme-btn toggling class 'dark-mode' on #widget container.\n\n" +
      "Functional Evaluation Points:\n" +
      "• Increment Click Handler (2M): Increases counter value on button click.\n" +
      "• Floor at Zero (2M): Decrement button stops at 0 and does not produce negative numbers.\n" +
      "• Reset Action (2M): Resets count to 0 upon clicking Reset.\n" +
      "• Dynamic Color Mutator (2M): Updates text color based on numeric threshold.\n" +
      "• Class Toggle Interaction (2M): Correctly toggles dark-mode class using classList.toggle().",
    constraints: "Vanilla ES6 JavaScript, HTML5, and CSS3. Zero external dependencies.",
    input_format: "Complete HTML Document with embedded <style> and <script> tags.",
    output_format: "Interactive widget DOM behaviors verifying counter and theme transitions.",
    sample_input: "init",
    sample_output: "PASS: Counter initialized to 0 and widget container attached",
    time_limit_ms: 2000,
    memory_limit_mb: 256,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "inc-click", output: "PASS: Increment click handler increases count", explanation: "Increment count on click" },
      { order: 2, input: "dec-floor", output: "PASS: Decrement floor prevents negative numbers", explanation: "Floor at zero guard" },
      { order: 3, input: "reset-action", output: "PASS: Reset button restores counter to 0", explanation: "Reset action clears value" },
      { order: 4, input: "dynamic-color", output: "PASS: Text color mutates on value change", explanation: "Dynamic green/gray text color update" },
      { order: 5, input: "theme-toggle", output: "PASS: Dark mode class toggled successfully", explanation: "ClassList dark-mode toggle" },
    ],
  },

  // =========================================================================
  // TRACK F: DATA STRUCTURES & ALGORITHMS (DSA)
  // Solvable in C, C++, and Java across all 3 tracks
  // =========================================================================
  // --- DSA for C ---
  {
    title: "Target Sum Pair in a Sorted Array (Two-Pointer Technique)",
    slug: "target-sum-pair-two-pointers-c",
    category: "DSA",
    programming_language: "C",
    problem_statement:
      "Given an array of N integers sorted in non-decreasing order and a target value K, determine if there exists a pair of distinct elements whose sum is exactly equal to K.\n" +
      "If a pair exists, print the two values separated by a space (smaller value first). If multiple pairs exist, print the pair that begins with the smallest first element.\n" +
      "If no such pair exists, print -1.\n\n" +
      "An optimal solution must run in O(N) time and O(1) auxiliary space using the two-pointer approach.",
    constraints: "2 <= N <= 10^5\n-10^9 <= A_i, K <= 10^9\nTime Limit: 1.0 second\nMemory Limit: 64 MB",
    input_format:
      "Line 1: Two space-separated integers N and K — the array size and target sum.\n" +
      "Line 2: N space-separated integers arranged in non-decreasing order: A_1, A_2, ..., A_N.",
    output_format: "Print the two integers forming the pair separated by a space, or -1 if no pair exists.",
    sample_input: "6 16\n1 4 6 10 12 15",
    sample_output: "1 15",
    time_limit_ms: 1000,
    memory_limit_mb: 64,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "2 10\n5 5", output: "5 5", explanation: "Minimum array size (N=2) with duplicate values summing to target" },
      { order: 2, input: "5 0\n-10 -5 0 5 10", output: "-10 10", explanation: "Negative integers cancelling to target zero" },
      { order: 3, input: "4 50\n10 20 30 40", output: "10 40", explanation: "Pair located at extreme ends (left=0, right=N-1)" },
      { order: 4, input: "6 20\n1 2 3 4 5 6", output: "-1", explanation: "All pair sums strictly less than target" },
      { order: 5, input: "5 2000000000\n100000000 500000000 900000000 1000000000 1100000000", output: "900000000 1100000000", explanation: "64-bit integer overflow guard (sum exceeding 2^31 - 1)" },
    ],
  },
  {
    title: "First and Last Occurrence in a Sorted Array (Binary Search)",
    slug: "first-last-occurrence-binary-search-c",
    category: "DSA",
    programming_language: "C",
    problem_statement:
      "Given a sorted array of N integers (which may contain repeated elements) and a target value X, find the first (starting) and last (ending) 0-based indices of X in the array.\n" +
      "If X is present, print the two indices separated by a space: <first_index> <last_index>.\n" +
      "If X is not present in the array, print -1 -1.\n\n" +
      "An optimal algorithm must achieve O(log N) time complexity using modified Binary Search without linear scanning.",
    constraints: "1 <= N <= 10^5\n-10^9 <= arr[i], X <= 10^9\nTime Limit: 1.0 second\nMemory Limit: 64 MB",
    input_format:
      "Line 1: Two space-separated integers N and X — the size of the array and target value.\n" +
      "Line 2: N space-separated integers sorted in non-decreasing order.",
    output_format: "Print <first_index> <last_index> separated by a space, or -1 -1 if X does not exist.",
    sample_input: "8 5\n1 3 5 5 5 5 67 123",
    sample_output: "2 5",
    time_limit_ms: 1000,
    memory_limit_mb: 64,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "1 7\n7", output: "0 0", explanation: "Single element array matching target" },
      { order: 2, input: "6 4\n4 4 4 4 4 4", output: "0 5", explanation: "Entire array composed exclusively of target element" },
      { order: 3, input: "5 1\n1 2 3 4 5", output: "0 0", explanation: "Target at first index only (first = last = 0)" },
      { order: 4, input: "5 5\n1 2 3 4 5", output: "4 4", explanation: "Target at last index only (first = last = N-1)" },
      { order: 5, input: "7 50\n10 20 30 40 60 70 80", output: "-1 -1", explanation: "Target missing between existing elements" },
    ],
  },

  // --- DSA for C++ ---
  {
    title: "Target Sum Pair in a Sorted Array (Two-Pointer Technique)",
    slug: "target-sum-pair-two-pointers-cpp",
    category: "DSA",
    programming_language: "C++",
    problem_statement:
      "Given an array of N integers sorted in non-decreasing order and a target value K, determine if there exists a pair of distinct elements whose sum is exactly equal to K.\n" +
      "If a pair exists, print the two values separated by a space (smaller value first). If multiple pairs exist, print the pair that begins with the smallest first element.\n" +
      "If no such pair exists, print -1.\n\n" +
      "An optimal solution must run in O(N) time and O(1) auxiliary space using the two-pointer approach.",
    constraints: "2 <= N <= 10^5\n-10^9 <= A_i, K <= 10^9\nTime Limit: 1.0 second\nMemory Limit: 64 MB",
    input_format:
      "Line 1: Two space-separated integers N and K — the array size and target sum.\n" +
      "Line 2: N space-separated integers arranged in non-decreasing order: A_1, A_2, ..., A_N.",
    output_format: "Print the two integers forming the pair separated by a space, or -1 if no pair exists.",
    sample_input: "6 16\n1 4 6 10 12 15",
    sample_output: "1 15",
    time_limit_ms: 1000,
    memory_limit_mb: 64,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "2 10\n5 5", output: "5 5", explanation: "Minimum array size (N=2) with duplicate values summing to target" },
      { order: 2, input: "5 0\n-10 -5 0 5 10", output: "-10 10", explanation: "Negative integers cancelling to target zero" },
      { order: 3, input: "4 50\n10 20 30 40", output: "10 40", explanation: "Pair located at extreme ends (left=0, right=N-1)" },
      { order: 4, input: "6 20\n1 2 3 4 5 6", output: "-1", explanation: "All pair sums strictly less than target" },
      { order: 5, input: "5 2000000000\n100000000 500000000 900000000 1000000000 1100000000", output: "900000000 1100000000", explanation: "64-bit integer overflow guard (sum exceeding 2^31 - 1)" },
    ],
  },
  {
    title: "First and Last Occurrence in a Sorted Array (Binary Search)",
    slug: "first-last-occurrence-binary-search-cpp",
    category: "DSA",
    programming_language: "C++",
    problem_statement:
      "Given a sorted array of N integers (which may contain repeated elements) and a target value X, find the first (starting) and last (ending) 0-based indices of X in the array.\n" +
      "If X is present, print the two indices separated by a space: <first_index> <last_index>.\n" +
      "If X is not present in the array, print -1 -1.\n\n" +
      "An optimal algorithm must achieve O(log N) time complexity using modified Binary Search without linear scanning.",
    constraints: "1 <= N <= 10^5\n-10^9 <= arr[i], X <= 10^9\nTime Limit: 1.0 second\nMemory Limit: 64 MB",
    input_format:
      "Line 1: Two space-separated integers N and X — the size of the array and target value.\n" +
      "Line 2: N space-separated integers sorted in non-decreasing order.",
    output_format: "Print <first_index> <last_index> separated by a space, or -1 -1 if X does not exist.",
    sample_input: "8 5\n1 3 5 5 5 5 67 123",
    sample_output: "2 5",
    time_limit_ms: 1000,
    memory_limit_mb: 64,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "1 7\n7", output: "0 0", explanation: "Single element array matching target" },
      { order: 2, input: "6 4\n4 4 4 4 4 4", output: "0 5", explanation: "Entire array composed exclusively of target element" },
      { order: 3, input: "5 1\n1 2 3 4 5", output: "0 0", explanation: "Target at first index only (first = last = 0)" },
      { order: 4, input: "5 5\n1 2 3 4 5", output: "4 4", explanation: "Target at last index only (first = last = N-1)" },
      { order: 5, input: "7 50\n10 20 30 40 60 70 80", output: "-1 -1", explanation: "Target missing between existing elements" },
    ],
  },

  // --- DSA for Java ---
  {
    title: "Target Sum Pair in a Sorted Array (Two-Pointer Technique)",
    slug: "target-sum-pair-two-pointers-java",
    category: "DSA",
    programming_language: "Java",
    problem_statement:
      "Given an array of N integers sorted in non-decreasing order and a target value K, determine if there exists a pair of distinct elements whose sum is exactly equal to K.\n" +
      "If a pair exists, print the two values separated by a space (smaller value first). If multiple pairs exist, print the pair that begins with the smallest first element.\n" +
      "If no such pair exists, print -1.\n\n" +
      "An optimal solution must run in O(N) time and O(1) auxiliary space using the two-pointer approach.",
    constraints: "2 <= N <= 10^5\n-10^9 <= A_i, K <= 10^9\nTime Limit: 1.5 seconds\nMemory Limit: 128 MB",
    input_format:
      "Line 1: Two space-separated integers N and K — the array size and target sum.\n" +
      "Line 2: N space-separated integers arranged in non-decreasing order: A_1, A_2, ..., A_N.",
    output_format: "Print the two integers forming the pair separated by a space, or -1 if no pair exists.",
    sample_input: "6 16\n1 4 6 10 12 15",
    sample_output: "1 15",
    time_limit_ms: 1500,
    memory_limit_mb: 128,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "2 10\n5 5", output: "5 5", explanation: "Minimum array size (N=2) with duplicate values summing to target" },
      { order: 2, input: "5 0\n-10 -5 0 5 10", output: "-10 10", explanation: "Negative integers cancelling to target zero" },
      { order: 3, input: "4 50\n10 20 30 40", output: "10 40", explanation: "Pair located at extreme ends (left=0, right=N-1)" },
      { order: 4, input: "6 20\n1 2 3 4 5 6", output: "-1", explanation: "All pair sums strictly less than target" },
      { order: 5, input: "5 2000000000\n100000000 500000000 900000000 1000000000 1100000000", output: "900000000 1100000000", explanation: "64-bit integer overflow guard (sum exceeding 2^31 - 1)" },
    ],
  },
  {
    title: "First and Last Occurrence in a Sorted Array (Binary Search)",
    slug: "first-last-occurrence-binary-search-java",
    category: "DSA",
    programming_language: "Java",
    problem_statement:
      "Given a sorted array of N integers (which may contain repeated elements) and a target value X, find the first (starting) and last (ending) 0-based indices of X in the array.\n" +
      "If X is present, print the two indices separated by a space: <first_index> <last_index>.\n" +
      "If X is not present in the array, print -1 -1.\n\n" +
      "An optimal algorithm must achieve O(log N) time complexity using modified Binary Search without linear scanning.",
    constraints: "1 <= N <= 10^5\n-10^9 <= arr[i], X <= 10^9\nTime Limit: 1.5 seconds\nMemory Limit: 128 MB",
    input_format:
      "Line 1: Two space-separated integers N and X — the size of the array and target value.\n" +
      "Line 2: N space-separated integers sorted in non-decreasing order.",
    output_format: "Print <first_index> <last_index> separated by a space, or -1 -1 if X does not exist.",
    sample_input: "8 5\n1 3 5 5 5 5 67 123",
    sample_output: "2 5",
    time_limit_ms: 1500,
    memory_limit_mb: 128,
    marks_per_test_case: 2,
    total_marks: 10,
    test_cases: [
      { order: 1, input: "1 7\n7", output: "0 0", explanation: "Single element array matching target" },
      { order: 2, input: "6 4\n4 4 4 4 4 4", output: "0 5", explanation: "Entire array composed exclusively of target element" },
      { order: 3, input: "5 1\n1 2 3 4 5", output: "0 0", explanation: "Target at first index only (first = last = 0)" },
      { order: 4, input: "5 5\n1 2 3 4 5", output: "4 4", explanation: "Target at last index only (first = last = N-1)" },
      { order: 5, input: "7 50\n10 20 30 40 60 70 80", output: "-1 -1", explanation: "Target missing between existing elements" },
    ],
  },
];

