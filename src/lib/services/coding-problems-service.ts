/**
 * LNMCBM College Coding Competition Portal
 * Phase H: Coding Problems & Category Management Service
 *
 * Responsibilities:
 * 1. Category and Language track specifications (C, C++, Java, Python, Web Development, DSA).
 * 2. DSA language selection path isolation (C, C++, Java).
 * 3. Configuration readiness verification (Exactly 2 problems per track, 10 marks each = 20 marks total).
 * 4. Preload official curriculum across all 6 categories.
 * 5. Student-safe problem retrieval (Hidden test cases strictly isolated).
 */

import { createAdminClient } from "@/lib/supabase/admin";

export type CodingCategory =
  | "C"
  | "C++"
  | "Java"
  | "Python"
  | "Web Development"
  | "DSA";

export type DSALanguage = "C" | "C++" | "Java";

export interface HiddenTestCase {
  id: string;
  problem_id: string;
  test_case_order: number;
  input_data: string;
  expected_output: string;
  marks: number;
  is_active: boolean;
}

export interface CodingProblemRecord {
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
  test_cases_count?: number;
  created_at: string;
  updated_at: string;
}

export interface StudentSafeCodingProblem {
  id: string;
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
  total_marks: number;
}

export interface CategoryTrackConfig {
  category: CodingCategory;
  name: string;
  description: string;
  isConfigured: boolean;
  problemCount: number;
  requiredProblems: number;
  totalMarks: number;
  requiredMarks: number;
  supportedLanguages: string[];
  requiresLanguageSelection: boolean;
  dsaTracks?: Record<
    DSALanguage,
    {
      language: DSALanguage;
      isConfigured: boolean;
      problemCount: number;
    }
  >;
}

declare global {
  // eslint-disable-next-line no-var
  var __lnmcbm_local_coding_problems__: CodingProblemRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __lnmcbm_local_hidden_test_cases__: HiddenTestCase[] | undefined;
}

function getLocalProblemsStore(): CodingProblemRecord[] {
  if (!global.__lnmcbm_local_coding_problems__) {
    global.__lnmcbm_local_coding_problems__ = [];
  }
  return global.__lnmcbm_local_coding_problems__;
}

function getLocalTestCasesStore(): HiddenTestCase[] {
  if (!global.__lnmcbm_local_hidden_test_cases__) {
    global.__lnmcbm_local_hidden_test_cases__ = [];
  }
  return global.__lnmcbm_local_hidden_test_cases__;
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

export const CATEGORY_METADATA: Record<
  CodingCategory,
  { name: string; description: string; languages: string[]; requiresLang: boolean }
> = {
  Python: {
    name: "Python 3",
    description: "Algorithmic challenges, data structures, and string parsing in Python 3.11+",
    languages: ["Python"],
    requiresLang: false,
  },
  "C++": {
    name: "C++ (GCC)",
    description: "High-performance systems programming, STL containers, and competitive algorithms",
    languages: ["C++"],
    requiresLang: false,
  },
  Java: {
    name: "Java (OpenJDK 21)",
    description: "Object-oriented problem solving, collections framework, and robust algorithms",
    languages: ["Java"],
    requiresLang: false,
  },
  C: {
    name: "C (C11)",
    description: "Foundational memory management, pointers, bitwise arithmetic, and data structures",
    languages: ["C"],
    requiresLang: false,
  },
  "Web Development": {
    name: "Web Development / JavaScript",
    description: "DOM manipulation, asynchronous JavaScript, array pipelines, and data transformations",
    languages: ["JavaScript"],
    requiresLang: false,
  },
  DSA: {
    name: "Data Structures & Algorithms (DSA)",
    description: "Rigorous core algorithmic challenges with your choice of standard systems language (C, C++, or Java)",
    languages: ["C", "C++", "Java"],
    requiresLang: true,
  },
};

/**
 * Retrieves the status and readiness of each Phase 2 category.
 */
export async function getCategoryConfigurations(): Promise<CategoryTrackConfig[]> {
  const problems = await getAllCodingProblems();

  const configs: CategoryTrackConfig[] = (Object.keys(CATEGORY_METADATA) as CodingCategory[]).map(
    (cat) => {
      const meta = CATEGORY_METADATA[cat];

      if (cat === "DSA") {
        // DSA tracks are segregated by language (C, C++, Java)
        const dsaLanguages: DSALanguage[] = ["C", "C++", "Java"];
        const dsaTracks: CategoryTrackConfig["dsaTracks"] = {
          C: { language: "C", isConfigured: false, problemCount: 0 },
          "C++": { language: "C++", isConfigured: false, problemCount: 0 },
          Java: { language: "Java", isConfigured: false, problemCount: 0 },
        };

        let totalDsaProblems = 0;
        dsaLanguages.forEach((lang) => {
          const matching = problems.filter(
            (p) => p.category === "DSA" && p.programming_language === lang && p.is_active
          );
          dsaTracks[lang].problemCount = matching.length;
          dsaTracks[lang].isConfigured = matching.length >= 2;
          totalDsaProblems += matching.length;
        });

        // Fully configured if at least one language track has >= 2 problems
        const hasConfiguredTrack = Object.values(dsaTracks).some((t) => t.isConfigured);

        return {
          category: cat,
          name: meta.name,
          description: meta.description,
          isConfigured: hasConfiguredTrack,
          problemCount: totalDsaProblems,
          requiredProblems: 2,
          totalMarks: 20,
          requiredMarks: 20,
          supportedLanguages: meta.languages,
          requiresLanguageSelection: true,
          dsaTracks,
        };
      }

      // Standard non-DSA categories
      const matching = problems.filter((p) => p.category === cat && p.is_active);
      const isConfigured = matching.length >= 2;

      return {
        category: cat,
        name: meta.name,
        description: meta.description,
        isConfigured,
        problemCount: matching.length,
        requiredProblems: 2,
        totalMarks: 20,
        requiredMarks: 20,
        supportedLanguages: meta.languages,
        requiresLanguageSelection: false,
      };
    }
  );

  return configs;
}

/**
 * Retrieves all coding problems with test cases count.
 */
export async function getAllCodingProblems(): Promise<CodingProblemRecord[]> {
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("coding_problems")
      .select("*, hidden_test_cases(count)")
      .order("created_at", { ascending: true });

    if (error || !data) {
      console.error("Failed to query coding problems:", error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      competition_id: row.competition_id,
      title: row.title,
      slug: row.slug,
      category: row.category,
      programming_language: row.programming_language,
      problem_statement: row.problem_statement,
      constraints: row.constraints,
      input_format: row.input_format,
      output_format: row.output_format,
      sample_input: row.sample_input,
      sample_output: row.sample_output,
      time_limit_ms: row.time_limit_ms,
      memory_limit_mb: row.memory_limit_mb,
      marks_per_test_case: row.marks_per_test_case,
      total_marks: row.total_marks,
      is_active: row.is_active,
      test_cases_count: row.hidden_test_cases?.[0]?.count || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  const store = getLocalProblemsStore();
  const testCasesStore = getLocalTestCasesStore();

  return store.map((p) => ({
    ...p,
    test_cases_count: testCasesStore.filter((tc) => tc.problem_id === p.id).length,
  }));
}

/**
 * Validates and retrieves the 2 assigned problems for a specific candidate category & language.
 * Strictly excludes hidden test case data from student exposure.
 */
export async function getAssignedProblemsForTrack(
  category: CodingCategory,
  language?: string | null
): Promise<StudentSafeCodingProblem[]> {
  const allProblems = await getAllCodingProblems();

  let matching: CodingProblemRecord[] = [];

  if (category === "DSA") {
    if (!language || !["C", "C++", "Java"].includes(language)) {
      throw new Error("Invalid DSA track: A valid language (C, C++, or Java) must be designated.");
    }
    matching = allProblems.filter(
      (p) => p.category === "DSA" && p.programming_language === language && p.is_active
    );
  } else {
    matching = allProblems.filter((p) => p.category === category && p.is_active);
  }

  if (matching.length < 2) {
    throw new Error(
      `Incomplete Track Configuration: Category '${category}'${
        language ? ` (${language})` : ""
      } currently has only ${matching.length} problem(s). Exactly 2 problems (10 marks each) are required before this track can be launched.`
    );
  }

  // Take the first 2 eligible active problems
  const assigned = matching.slice(0, 2);

  return assigned.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category,
    programming_language: p.programming_language,
    problem_statement: p.problem_statement,
    constraints: p.constraints,
    input_format: p.input_format,
    output_format: p.output_format,
    sample_input: p.sample_input,
    sample_output: p.sample_output,
    time_limit_ms: p.time_limit_ms,
    memory_limit_mb: p.memory_limit_mb,
    total_marks: p.total_marks,
  }));
}

/**
 * Preload the official Phase 2 coding curriculum.
 * Ensures every single track (C, C++, Java, Python, Web Development, and DSA with C, C++, and Java)
 * has exactly 2 rigorous problems with 5 evaluation test cases each.
 */
export async function preloadOfficialCodingProblems(): Promise<{ count: number }> {
  const problemsPayload = [
    // ---------------- PYTHON TRACK ----------------
    {
      title: "Sum of Prime Factors",
      slug: "sum-of-prime-factors",
      category: "Python" as const,
      programming_language: "Python",
      problem_statement:
        "Given a positive integer N, compute and return the sum of all unique prime factors of N. If N has no prime factors, return 0.",
      constraints: "2 <= N <= 10^7",
      input_format: "A single integer N on standard input.",
      output_format: "Print the integer sum of distinct prime factors to standard output.",
      sample_input: "12",
      sample_output: "5",
      test_cases: [
        { input: "18", output: "5" },
        { input: "30", output: "10" },
        { input: "100", output: "7" },
        { input: "97", output: "97" },
        { input: "100000", output: "7" },
      ],
    },
    {
      title: "Longest Substring Without Repeating Characters",
      slug: "longest-substring-without-repeating-characters",
      category: "Python" as const,
      programming_language: "Python",
      problem_statement:
        "Given a string S, find the length of the longest substring containing all distinct characters.",
      constraints: "0 <= S.length <= 10^5, S consists of English letters, digits, symbols and spaces.",
      input_format: "A single line containing the string S.",
      output_format: "Print a single integer indicating the length of the longest distinct substring.",
      sample_input: "abcabcbb",
      sample_output: "3",
      test_cases: [
        { input: "bbbbb", output: "1" },
        { input: "pwwkew", output: "3" },
        { input: "abcdefg", output: "7" },
        { input: "tmmzuxt", output: "5" },
        { input: "a", output: "1" },
      ],
    },

    // ---------------- C TRACK ----------------
    {
      title: "Matrix Boundary Ring Traversal",
      slug: "matrix-boundary-ring-traversal",
      category: "C" as const,
      programming_language: "C",
      problem_statement:
        "Given an R x C integer matrix, print all elements located on its outer boundary in clockwise order starting from (0,0).",
      constraints: "1 <= R, C <= 100, -10^4 <= matrix[i][j] <= 10^4",
      input_format: "First line contains R and C. Next R lines each contain C space-separated integers.",
      output_format: "Print the boundary elements space-separated on a single line.",
      sample_input: "3 3\n1 2 3\n4 5 6\n7 8 9",
      sample_output: "1 2 3 6 9 8 7 4",
      test_cases: [
        { input: "2 2\n1 2\n3 4", output: "1 2 4 3" },
        { input: "1 4\n5 10 15 20", output: "5 10 15 20" },
        { input: "4 1\n1\n2\n3\n4", output: "1 2 3 4" },
        { input: "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12", output: "1 2 3 4 8 12 11 10 9 5" },
        { input: "1 1\n42", output: "42" },
      ],
    },
    {
      title: "Bitwise Subarray XOR Maximization",
      slug: "bitwise-subarray-xor-maximization",
      category: "C" as const,
      programming_language: "C",
      problem_statement:
        "Given an array of N integers, find the maximum XOR value attainable from any non-empty contiguous subarray.",
      constraints: "1 <= N <= 10^5, 0 <= A[i] <= 10^6",
      input_format: "First line contains integer N. Second line contains N space-separated integers.",
      output_format: "Print the maximum XOR value.",
      sample_input: "4\n1 2 3 4",
      sample_output: "7",
      test_cases: [
        { input: "3\n8 1 2", output: "11" },
        { input: "5\n4 6 8 2 1", output: "14" },
        { input: "1\n15", output: "15" },
        { input: "4\n1 2 4 8", output: "15" },
        { input: "6\n0 0 0 0 0 0", output: "0" },
      ],
    },

    // ---------------- C++ TRACK ----------------
    {
      title: "K-th Largest Element in Running Stream",
      slug: "kth-largest-element-in-stream",
      category: "C++" as const,
      programming_language: "C++",
      problem_statement:
        "Given an integer K and a sequence of N numbers arriving in an input stream, output the K-th largest element seen so far after each insertion. If fewer than K elements have arrived, output -1.",
      constraints: "1 <= K <= N <= 10^5, -10^6 <= num <= 10^6",
      input_format: "First line contains K and N. Second line contains N space-separated integers.",
      output_format: "Print N space-separated integers representing the K-th largest at each step.",
      sample_input: "3 6\n10 20 11 70 50 40",
      sample_output: "-1 -1 10 20 20 40",
      test_cases: [
        { input: "2 4\n5 15 10 20", output: "-1 5 10 15" },
        { input: "1 3\n100 200 150", output: "100 200 200" },
        { input: "4 5\n1 2 3 4 5", output: "-1 -1 -1 1 2" },
        { input: "2 5\n-5 -1 -10 -2 -3", output: "-1 -5 -5 -2 -2" },
        { input: "3 3\n3 2 1", output: "-1 -1 1" },
      ],
    },
    {
      title: "Merge K Sorted Arrays with Minimum Heap",
      slug: "merge-k-sorted-arrays",
      category: "C++" as const,
      programming_language: "C++",
      problem_statement:
        "Given K sorted arrays each of size N, merge them efficiently into a single completely sorted array of size K*N.",
      constraints: "1 <= K <= 100, 1 <= N <= 1000, -10^6 <= element <= 10^6",
      input_format: "First line contains K and N. Next K lines each contain N space-separated sorted integers.",
      output_format: "Print the K*N elements space-separated in non-decreasing order.",
      sample_input: "3 3\n1 5 9\n2 4 8\n3 7 10",
      sample_output: "1 2 3 4 5 7 8 9 10",
      test_cases: [
        { input: "2 2\n1 3\n2 4", output: "1 2 3 4" },
        { input: "1 3\n10 20 30", output: "10 20 30" },
        { input: "3 1\n3\n1\n2", output: "1 2 3" },
        { input: "2 3\n-5 0 5\n-10 -2 8", output: "-10 -5 -2 0 5 8" },
        { input: "2 4\n1 1 1 1\n2 2 2 2", output: "1 1 1 1 2 2 2 2" },
      ],
    },

    // ---------------- JAVA TRACK ----------------
    {
      title: "Daily Temperature Warmth Distance",
      slug: "daily-temperature-warmth-distance",
      category: "Java" as const,
      programming_language: "Java",
      problem_statement:
        "Given an array of daily temperatures T, return an array answer such that answer[i] is the number of days you have to wait after the i-th day to get a warmer temperature. If no warmer day exists, answer[i] = 0.",
      constraints: "1 <= T.length <= 10^5, 30 <= T[i] <= 100",
      input_format: "First line contains integer N. Second line contains N space-separated integers.",
      output_format: "Print N space-separated integers representing days to wait.",
      sample_input: "8\n73 74 75 71 69 72 76 73",
      sample_output: "1 1 4 2 1 1 0 0",
      test_cases: [
        { input: "4\n30 40 50 60", output: "1 1 1 0" },
        { input: "3\n30 60 90", output: "1 1 0" },
        { input: "5\n80 70 60 50 40", output: "0 0 0 0 0" },
        { input: "2\n50 50", output: "0 0" },
        { input: "6\n31 32 31 33 32 34", output: "1 2 1 2 1 0" },
      ],
    },
    {
      title: "LRU Cache Capacity and Access Ordering",
      slug: "lru-cache-ordering",
      category: "Java" as const,
      programming_language: "Java",
      problem_statement:
        "Simulate an LRU (Least Recently Used) cache with capacity C and process Q operations: PUT key val or GET key. Print the result of all GET operations space-separated (-1 if key not found).",
      constraints: "1 <= C <= 1000, 1 <= Q <= 10^4",
      input_format: "First line contains C and Q. Next Q lines each contain PUT k v or GET k.",
      output_format: "Print the results of all GET operations separated by spaces.",
      sample_input: "2 6\nPUT 1 1\nPUT 2 2\nGET 1\nPUT 3 3\nGET 2\nGET 3",
      sample_output: "1 -1 3",
      test_cases: [
        { input: "1 4\nPUT 5 50\nGET 5\nPUT 6 60\nGET 5", output: "50 -1" },
        { input: "2 3\nGET 1\nPUT 1 10\nGET 1", output: "-1 10" },
        { input: "2 5\nPUT 1 1\nPUT 2 2\nPUT 1 10\nGET 1\nGET 2", output: "10 2" },
        { input: "3 4\nPUT 1 100\nPUT 2 200\nGET 2\nGET 1", output: "200 100" },
        { input: "2 4\nPUT 1 1\nPUT 2 2\nPUT 3 3\nGET 1", output: "-1" },
      ],
    },

    // ---------------- WEB DEVELOPMENT TRACK ----------------
    {
      title: "Query Parameter Serialization & Canonicalization",
      slug: "query-parameter-canonicalization",
      category: "Web Development" as const,
      programming_language: "JavaScript",
      problem_statement:
        "Given an un-normalized URL query string with possible duplicates and unordered keys, parse and canonicalize it by sorting keys alphabetically, removing empty values, and joining array values with commas.",
      constraints: "1 <= query.length <= 1000",
      input_format: "A single line containing the raw query string (e.g. ?b=2&a=1&c=&b=3).",
      output_format: "Print the normalized canonical query string starting with '?' (or empty if no valid params).",
      sample_input: "?b=2&a=1&c=&b=3",
      sample_output: "?a=1&b=2,3",
      test_cases: [
        { input: "?z=9&x=1", output: "?x=1&z=9" },
        { input: "?name=Alice&empty=&role=admin", output: "?name=Alice&role=admin" },
        { input: "?tag=css&tag=html&tag=js", output: "?tag=css,html,js" },
        { input: "?empty1=&empty2=", output: "" },
        { input: "?alpha=bravo", output: "?alpha=bravo" },
      ],
    },
    {
      title: "Nested JSON Object Flattener",
      slug: "nested-json-flattener",
      category: "Web Development" as const,
      programming_language: "JavaScript",
      problem_statement:
        "Given a nested JSON string, flatten its hierarchical key-value structure using dot notation (e.g. {a: {b: 1}} -> {'a.b': 1}). Output sorted flattened keys with their primitive values.",
      constraints: "JSON depth <= 10, key length <= 50, primitive values are strings, numbers, or booleans.",
      input_format: "A single line containing valid nested JSON.",
      output_format: "Print each flattened key:value on a new line sorted alphabetically by key.",
      sample_input: '{"user":{"name":"Alice","meta":{"age":22}}}',
      sample_output: "user.meta.age:22\nuser.name:Alice",
      test_cases: [
        { input: '{"a":{"b":{"c":10}}}', output: "a.b.c:10" },
        { input: '{"active":true,"id":1}', output: "active:true\nid:1" },
        { input: '{"config":{"theme":"dark","font":{"size":14}}}', output: "config.font.size:14\nconfig.theme:dark" },
        { input: '{"single":"val"}', output: "single:val" },
        { input: '{"x":{"y":0}}', output: "x.y:0" },
      ],
    },

    // ---------------- DSA (C LANGUAGE TRACK) ----------------
    {
      title: "Linked List Cycle & Floyd Detection (C)",
      slug: "linked-list-cycle-detection-c",
      category: "DSA" as const,
      programming_language: "C",
      problem_statement:
        "Given an array representation of a linked list with next pointers and a cycle-entry index pos (-1 if no cycle), detect if a loop exists using Floyd's Tortoise and Hare algorithm.",
      constraints: "1 <= N <= 10^5, -1 <= pos < N",
      input_format: "First line contains N and pos. Second line contains N node values.",
      output_format: "Print 'CYCLE_DETECTED' if a cycle exists, else 'NO_CYCLE'.",
      sample_input: "4 1\n3 2 0 -4",
      sample_output: "CYCLE_DETECTED",
      test_cases: [
        { input: "2 0\n1 2", output: "CYCLE_DETECTED" },
        { input: "1 -1\n1", output: "NO_CYCLE" },
        { input: "5 -1\n10 20 30 40 50", output: "NO_CYCLE" },
        { input: "3 2\n1 2 3", output: "CYCLE_DETECTED" },
        { input: "6 3\n1 2 3 4 5 6", output: "CYCLE_DETECTED" },
      ],
    },
    {
      title: "Binary Search in Rotated Sorted Array (C)",
      slug: "rotated-sorted-array-search-c",
      category: "DSA" as const,
      programming_language: "C",
      problem_statement:
        "Given an integer array nums sorted in ascending order with distinct values rotated at an unknown pivot, find the index of target in O(log N) time (-1 if not present).",
      constraints: "1 <= N <= 10^5, -10^6 <= nums[i], target <= 10^6",
      input_format: "First line contains N and target. Second line contains N space-separated integers.",
      output_format: "Print the 0-based index of target, or -1.",
      sample_input: "7 0\n4 5 6 7 0 1 2",
      sample_output: "4",
      test_cases: [
        { input: "7 3\n4 5 6 7 0 1 2", output: "-1" },
        { input: "1 0\n0", output: "0" },
        { input: "5 5\n1 2 3 4 5", output: "4" },
        { input: "6 2\n5 6 1 2 3 4", output: "3" },
        { input: "4 10\n20 30 10 15", output: "2" },
      ],
    },

    // ---------------- DSA (C++ LANGUAGE TRACK) ----------------
    {
      title: "Balanced Parentheses Maximum Depth (C++)",
      slug: "balanced-parentheses-depth-cpp",
      category: "DSA" as const,
      programming_language: "C++",
      problem_statement:
        "Given a valid parentheses string S, compute the maximum nesting depth of the parentheses.",
      constraints: "1 <= S.length <= 10^5",
      input_format: "A single line containing the string S.",
      output_format: "Print a single integer indicating maximum nesting depth.",
      sample_input: "(1+(2*3)+((8)/4))+1",
      sample_output: "3",
      test_cases: [
        { input: "(1)+((2))+(((3)))", output: "3" },
        { input: "1+(2*3)/(2-1)", output: "1" },
        { input: "1", output: "0" },
        { input: "((((10))))", output: "4" },
        { input: "()(())((()))", output: "3" },
      ],
    },
    {
      title: "Lowest Common Ancestor in Binary Search Tree (C++)",
      slug: "lowest-common-ancestor-bst-cpp",
      category: "DSA" as const,
      programming_language: "C++",
      problem_statement:
        "Given the level-order traversal of a valid Binary Search Tree and two node values P and Q, find the value of their Lowest Common Ancestor (LCA).",
      constraints: "2 <= BST nodes <= 10^5, all node values are distinct.",
      input_format: "First line contains P and Q. Second line contains N space-separated BST elements in preorder.",
      output_format: "Print the integer value of the LCA.",
      sample_input: "2 8\n6 2 8 0 4 7 9",
      sample_output: "6",
      test_cases: [
        { input: "2 4\n6 2 8 0 4 7 9", output: "2" },
        { input: "7 9\n6 2 8 0 4 7 9", output: "8" },
        { input: "1 3\n2 1 3", output: "2" },
        { input: "10 20\n30 20 40 10 25 35 50", output: "20" },
        { input: "10 50\n30 20 40 10 25 35 50", output: "30" },
      ],
    },

    // ---------------- DSA (JAVA LANGUAGE TRACK) ----------------
    {
      title: "Priority Queue Task Scheduler (Java)",
      slug: "priority-queue-task-scheduler-java",
      category: "DSA" as const,
      programming_language: "Java",
      problem_statement:
        "Given a list of CPU tasks represented by capital letters and a non-negative integer n representing the cooling interval between identical tasks, return the least number of intervals the CPU requires to finish all tasks.",
      constraints: "1 <= tasks.length <= 10^4, 0 <= n <= 100",
      input_format: "First line contains cooling interval n. Second line contains space-separated task characters.",
      output_format: "Print the minimum integer CPU intervals required.",
      sample_input: "2\nA A A B B B",
      sample_output: "8",
      test_cases: [
        { input: "0\nA A A B B B", output: "6" },
        { input: "2\nA A A A B B B C C", output: "10" },
        { input: "1\nA B C D", output: "4" },
        { input: "3\nA A A", output: "9" },
        { input: "1\nA A B B", output: "4" },
      ],
    },
    {
      title: "Dijkstra Shortest Path in Weighted Graph (Java)",
      slug: "dijkstra-shortest-path-java",
      category: "DSA" as const,
      programming_language: "Java",
      problem_statement:
        "Given a directed weighted graph with V vertices (0 to V-1) and E edges, compute the shortest distance from source vertex S to all other vertices (-1 if unreachable).",
      constraints: "1 <= V <= 10^4, 0 <= E <= 10^5, weights >= 0",
      input_format: "First line contains V, E, and source S. Next E lines each contain u v w.",
      output_format: "Print V space-separated integers representing the shortest distance to each vertex.",
      sample_input: "3 3 0\n0 1 1\n1 2 2\n0 2 4",
      sample_output: "0 1 3",
      test_cases: [
        { input: "2 1 0\n0 1 5", output: "0 5" },
        { input: "3 2 0\n0 1 2\n2 1 1", output: "0 2 -1" },
        { input: "4 4 0\n0 1 1\n1 2 2\n2 3 3\n0 3 10", output: "0 1 3 6" },
        { input: "1 0 0", output: "0" },
        { input: "3 1 1\n1 2 7", output: "-1 0 7" },
      ],
    },
  ];

  let addedCount = 0;

  if (isSupabaseLive()) {
    const admin = createAdminClient();

    for (const prob of problemsPayload) {
      // Upsert problem
      const { data: pData, error: pError } = await admin
        .from("coding_problems")
        .upsert(
          {
            title: prob.title,
            slug: prob.slug,
            category: prob.category,
            programming_language: prob.programming_language,
            problem_statement: prob.problem_statement,
            constraints: prob.constraints,
            input_format: prob.input_format,
            output_format: prob.output_format,
            sample_input: prob.sample_input,
            sample_output: prob.sample_output,
            time_limit_ms: 2000,
            memory_limit_mb: 256,
            marks_per_test_case: 2,
            total_marks: 10,
            is_active: true,
          },
          { onConflict: "slug" }
        )
        .select()
        .single();

      if (pData && !pError) {
        addedCount++;
        // Insert 5 hidden test cases
        for (let i = 0; i < prob.test_cases.length; i++) {
          const tc = prob.test_cases[i];
          await admin.from("hidden_test_cases").upsert(
            {
              problem_id: pData.id,
              test_case_order: i + 1,
              input_data: tc.input,
              expected_output: tc.output,
              marks: 2,
              is_active: true,
            },
            { onConflict: "problem_id,test_case_order" }
          );
        }
      }
    }

    return { count: addedCount };
  }

  // Local fallback
  const store = getLocalProblemsStore();
  const testCasesStore = getLocalTestCasesStore();

  for (const prob of problemsPayload) {
    const existingIndex = store.findIndex((p) => p.slug === prob.slug);
    const probId = existingIndex >= 0 ? store[existingIndex].id : `prob-${prob.slug}`;

    const record: CodingProblemRecord = {
      id: probId,
      competition_id: "comp-lnmcbm-2026",
      title: prob.title,
      slug: prob.slug,
      category: prob.category,
      programming_language: prob.programming_language,
      problem_statement: prob.problem_statement,
      constraints: prob.constraints,
      input_format: prob.input_format,
      output_format: prob.output_format,
      sample_input: prob.sample_input,
      sample_output: prob.sample_output,
      time_limit_ms: 2000,
      memory_limit_mb: 256,
      marks_per_test_case: 2,
      total_marks: 10,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      store[existingIndex] = record;
    } else {
      store.push(record);
    }
    addedCount++;

    // Insert 5 test cases
    for (let i = 0; i < prob.test_cases.length; i++) {
      const tc = prob.test_cases[i];
      const tcRecord: HiddenTestCase = {
        id: `tc-${probId}-${i + 1}`,
        problem_id: probId,
        test_case_order: i + 1,
        input_data: tc.input,
        expected_output: tc.output,
        marks: 2,
        is_active: true,
      };

      const existingTc = testCasesStore.findIndex(
        (t) => t.problem_id === probId && t.test_case_order === i + 1
      );
      if (existingTc >= 0) {
        testCasesStore[existingTc] = tcRecord;
      } else {
        testCasesStore.push(tcRecord);
      }
    }
  }

  return { count: addedCount };
}

/**
 * Retrieve a coding problem by ID (without hidden test cases).
 */
export async function getProblemById(problemId: string): Promise<CodingProblemRecord | null> {
  const problems = await getAllCodingProblems();
  return problems.find((p) => p.id === problemId || p.slug === problemId) || null;
}

/**
 * Retrieve a coding problem along with its 5 hidden evaluation test cases.
 * STRICT SECURITY MANDATE: FOR SERVER-SIDE EVALUATION ONLY. NEVER EXPOSE TO STUDENT.
 */
export async function getProblemWithHiddenTestCases(problemId: string): Promise<{
  problem: CodingProblemRecord;
  testCases: HiddenTestCase[];
} | null> {
  const problem = await getProblemById(problemId);
  if (!problem) return null;

  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data: tcData, error: tcErr } = await admin
      .from("hidden_test_cases")
      .select("*")
      .eq("problem_id", problem.id)
      .eq("is_active", true)
      .order("test_case_order", { ascending: true });

    if (tcErr || !tcData) {
      console.error("Failed to query hidden test cases:", tcErr);
      return null;
    }

    return {
      problem,
      testCases: tcData as HiddenTestCase[],
    };
  }

  const testCasesStore = getLocalTestCasesStore();
  const matchingTestCases = testCasesStore
    .filter((tc) => tc.problem_id === problem.id && tc.is_active)
    .sort((a, b) => a.test_case_order - b.test_case_order);

  return {
    problem,
    testCases: matchingTestCases,
  };
}

