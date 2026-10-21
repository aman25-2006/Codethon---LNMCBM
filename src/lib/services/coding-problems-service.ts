/**
 * LNMCBM College Coding Competition Portal
 * Phase H: Coding Problems & Category Management Service
 *
 * Responsibilities:
 * 1. Category and Language track specifications (C, C++, Java, Python, Web Development, DSA).
 * 2. DSA language selection path isolation (C, C++, Java).
 * 3. Configuration readiness verification (Exactly 2 problems per track, 10 marks each = 20 marks total).
 * 4. Preload official curriculum across all 6 categories (CODTHON 2026 Phase 2 Coding Test Suite).
 * 5. Student-safe problem retrieval (Hidden test cases strictly isolated).
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  OFFICIAL_PHASE2_CODING_PROBLEMS,
  OfficialCodingProblemDefinition,
} from "@/lib/data/coding-problems/official-phase2-problems";

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

function seedLocalMemoryStore(forceReset: boolean = false) {
  if (
    global.__lnmcbm_local_coding_problems__ &&
    global.__lnmcbm_local_coding_problems__.length > 0 &&
    !forceReset
  ) {
    return;
  }

  const store: CodingProblemRecord[] = [];
  const testCasesStore: HiddenTestCase[] = [];

  for (const prob of OFFICIAL_PHASE2_CODING_PROBLEMS) {
    const probId = `prob-${prob.slug}`;
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
      time_limit_ms: prob.time_limit_ms,
      memory_limit_mb: prob.memory_limit_mb,
      marks_per_test_case: prob.marks_per_test_case,
      total_marks: prob.total_marks,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.push(record);

    for (const tc of prob.test_cases) {
      testCasesStore.push({
        id: `tc-${probId}-${tc.order}`,
        problem_id: probId,
        test_case_order: tc.order,
        input_data: tc.input,
        expected_output: tc.output,
        marks: 2,
        is_active: true,
      });
    }
  }

  global.__lnmcbm_local_coding_problems__ = store;
  global.__lnmcbm_local_hidden_test_cases__ = testCasesStore;
}

function getLocalProblemsStore(): CodingProblemRecord[] {
  if (!global.__lnmcbm_local_coding_problems__ || global.__lnmcbm_local_coding_problems__.length === 0) {
    seedLocalMemoryStore();
  }
  return global.__lnmcbm_local_coding_problems__!;
}

function getLocalTestCasesStore(): HiddenTestCase[] {
  if (!global.__lnmcbm_local_hidden_test_cases__ || global.__lnmcbm_local_hidden_test_cases__.length === 0) {
    seedLocalMemoryStore();
  }
  return global.__lnmcbm_local_hidden_test_cases__!;
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
  C: {
    name: "C (C11)",
    description: "Foundational programming fundamentals, memory management, pointers, and arrays in C",
    languages: ["C"],
    requiresLang: false,
  },
  "C++": {
    name: "C++ (OOP Track)",
    description: "Object-oriented programming, class design, encapsulation, and systems logic in C++",
    languages: ["C++"],
    requiresLang: false,
  },
  Java: {
    name: "Java (Core Java)",
    description: "Core Java programming logic, array manipulations, robust parsing, and exception guards",
    languages: ["Java"],
    requiresLang: false,
  },
  Python: {
    name: "Python 3 (Logic Track)",
    description: "Procedural logic, data types, lists, dictionaries, and string slicing in Python (pure procedural)",
    languages: ["Python"],
    requiresLang: false,
  },
  "Web Development": {
    name: "Web Development (Frontend)",
    description: "HTML5 semantic structure, modern CSS box-model styling, and responsive DOM event handling",
    languages: ["JavaScript"],
    requiresLang: false,
  },
  DSA: {
    name: "Data Structures & Algorithms (DSA)",
    description: "Two-pointer techniques, modified binary search, and optimal algorithmic problem-solving",
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
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("coding_problems")
        .select("*, hidden_test_cases(count)")
        .order("created_at", { ascending: true });

      if (!error && data && data.length >= 10) {
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
    } catch (err) {
      console.warn("Supabase fetch coding problems error, using local fallback:", err);
    }
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
  let addedCount = 0;

  if (isSupabaseLive()) {
    try {
      const admin = createAdminClient();

      for (const prob of OFFICIAL_PHASE2_CODING_PROBLEMS) {
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
              time_limit_ms: prob.time_limit_ms,
              memory_limit_mb: prob.memory_limit_mb,
              marks_per_test_case: prob.marks_per_test_case,
              total_marks: prob.total_marks,
              is_active: true,
            },
            { onConflict: "slug" }
          )
          .select()
          .single();

        if (pData && !pError) {
          addedCount++;
          // Insert 5 hidden test cases
          for (const tc of prob.test_cases) {
            await admin.from("hidden_test_cases").upsert(
              {
                problem_id: pData.id,
                test_case_order: tc.order,
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

      if (addedCount > 0) {
        return { count: addedCount };
      }
    } catch (err) {
      console.warn("Supabase preload failed, falling back to local memory store:", err);
    }
  }

  // Local fallback
  seedLocalMemoryStore(true);
  return { count: OFFICIAL_PHASE2_CODING_PROBLEMS.length };
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
    try {
      const admin = createAdminClient();
      const { data: tcData, error: tcErr } = await admin
        .from("hidden_test_cases")
        .select("*")
        .eq("problem_id", problem.id)
        .eq("is_active", true)
        .order("test_case_order", { ascending: true });

      if (!tcErr && tcData && tcData.length > 0) {
        return {
          problem,
          testCases: tcData as HiddenTestCase[],
        };
      }
    } catch (err) {
      console.warn("Supabase fetch hidden test cases error, using local fallback:", err);
    }
  }

  const testCasesStore = getLocalTestCasesStore();
  const matchingTestCases = testCasesStore
    .filter(
      (tc) =>
        (tc.problem_id === problem.id || tc.problem_id === `prob-${problem.slug}`) &&
        tc.is_active
    )
    .sort((a, b) => a.test_case_order - b.test_case_order);

  return {
    problem,
    testCases: matchingTestCases,
  };
}
