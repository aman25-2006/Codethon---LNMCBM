import { createAdminClient } from "@/lib/supabase/admin";

export type MCQCategory =
  | "Fundamentals"
  | "Technical Understanding"
  | "Logic and Debugging"
  | "Case Study";

export const CATEGORY_SPECS: Record<
  MCQCategory,
  { requiredCount: number; marksEach: number; requiredMarks: number }
> = {
  Fundamentals: { requiredCount: 10, marksEach: 1, requiredMarks: 10 },
  "Technical Understanding": { requiredCount: 10, marksEach: 2, requiredMarks: 20 },
  "Logic and Debugging": { requiredCount: 10, marksEach: 3, requiredMarks: 30 },
  "Case Study": { requiredCount: 10, marksEach: 2, requiredMarks: 20 },
};

export interface MCQOption {
  id: string;
  question_id: string;
  option_key: "A" | "B" | "C" | "D";
  option_text: string;
}

export interface MCQQuestionRecord {
  id: string;
  competition_id: string | null;
  category: MCQCategory;
  question_text: string;
  code_snippet: string | null;
  case_study_passage: string | null;
  marks: number;
  is_active: boolean;
  options: MCQOption[];
  correct_option_key?: "A" | "B" | "C" | "D";
  correct_option_id?: string;
  explanation?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentSafeQuestion {
  id: string;
  category: MCQCategory;
  question_text: string;
  code_snippet: string | null;
  case_study_passage: string | null;
  marks: number;
  options: Array<{
    id?: string;
    option_key: "A" | "B" | "C" | "D";
    option_text: string;
  }>;
}

export interface QuestionBankMetrics {
  total: number;
  enabled: number;
  disabled: number;
  totalMarks: number;
  isValidExamSet: boolean;
  categories: Record<
    MCQCategory,
    {
      count: number;
      requiredCount: number;
      marksEach: number;
      totalMarks: number;
      requiredMarks: number;
      isSatisfied: boolean;
    }
  >;
  validationErrors: string[];
}

export interface QuestionInput {
  category: MCQCategory;
  question_text: string;
  code_snippet?: string | null;
  case_study_passage?: string | null;
  marks?: number;
  is_active?: boolean;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: "A" | "B" | "C" | "D";
  explanation?: string | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __lnmcbm_local_questions_store__: MCQQuestionRecord[] | undefined;
}

function getLocalStore(): MCQQuestionRecord[] {
  if (!global.__lnmcbm_local_questions_store__) {
    global.__lnmcbm_local_questions_store__ = [];
  }
  return global.__lnmcbm_local_questions_store__;
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

/**
 * Calculates competition readiness metrics against the 40 Questions / 80 Marks rule.
 */
export function calculateMetrics(questions: MCQQuestionRecord[]): QuestionBankMetrics {
  const activeQuestions = questions.filter((q) => q.is_active);
  const categoriesMap: QuestionBankMetrics["categories"] = {
    Fundamentals: { count: 0, requiredCount: 10, marksEach: 1, totalMarks: 0, requiredMarks: 10, isSatisfied: false },
    "Technical Understanding": { count: 0, requiredCount: 10, marksEach: 2, totalMarks: 0, requiredMarks: 20, isSatisfied: false },
    "Logic and Debugging": { count: 0, requiredCount: 10, marksEach: 3, totalMarks: 0, requiredMarks: 30, isSatisfied: false },
    "Case Study": { count: 0, requiredCount: 10, marksEach: 2, totalMarks: 0, requiredMarks: 20, isSatisfied: false },
  };

  let totalMarks = 0;
  for (const q of activeQuestions) {
    if (categoriesMap[q.category]) {
      categoriesMap[q.category].count++;
      categoriesMap[q.category].totalMarks += q.marks;
    }
    totalMarks += q.marks;
  }

  const validationErrors: string[] = [];
  for (const cat of Object.keys(CATEGORY_SPECS) as MCQCategory[]) {
    const spec = CATEGORY_SPECS[cat];
    const data = categoriesMap[cat];
    data.isSatisfied = data.count === spec.requiredCount && data.totalMarks === spec.requiredMarks;
    if (data.count < spec.requiredCount) {
      validationErrors.push(`${cat}: Needs ${spec.requiredCount - data.count} more active question(s).`);
    } else if (data.count > spec.requiredCount) {
      validationErrors.push(`${cat}: Has ${data.count - spec.requiredCount} excess question(s) (only ${spec.requiredCount} required).`);
    }
    if (data.totalMarks !== spec.requiredMarks) {
      validationErrors.push(`${cat}: Currently carries ${data.totalMarks} marks (required: ${spec.requiredMarks} marks).`);
    }
  }

  const isValidExamSet = activeQuestions.length === 40 && totalMarks === 80 && validationErrors.length === 0;

  return {
    total: questions.length,
    enabled: activeQuestions.length,
    disabled: questions.length - activeQuestions.length,
    totalMarks,
    isValidExamSet,
    categories: categoriesMap,
    validationErrors,
  };
}

/**
 * Fetch question bank entries with optional filtering.
 */
export async function getQuestions(params?: {
  search?: string;
  category?: string;
  status?: string;
}): Promise<{ questions: MCQQuestionRecord[]; metrics: QuestionBankMetrics }> {
  const search = params?.search?.trim().toLowerCase() || "";
  const category = params?.category?.trim() || "";
  const status = params?.status?.trim() || "";

  if (isSupabaseLive()) {
    const admin = createAdminClient();

    // Query questions, options, and answer keys
    let query = admin
      .from("mcq_questions")
      .select("*, mcq_options(*), mcq_answer_keys(*)")
      .order("created_at", { ascending: false });

    if (category && category !== "ALL") {
      query = query.eq("category", category);
    }
    if (status === "active") {
      query = query.eq("is_active", true);
    } else if (status === "inactive") {
      query = query.eq("is_active", false);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to query question bank: ${error.message}`);
    }

    const formatted: MCQQuestionRecord[] = (data || []).map((row: any) => ({
      id: row.id,
      competition_id: row.competition_id,
      category: row.category,
      question_text: row.question_text,
      code_snippet: row.code_snippet,
      case_study_passage: row.case_study_passage,
      marks: row.marks,
      is_active: row.is_active,
      options: (row.mcq_options || []).sort((a: any, b: any) => a.option_key.localeCompare(b.option_key)),
      correct_option_key: row.mcq_answer_keys?.[0]?.correct_option_key || row.mcq_answer_keys?.correct_option_key,
      correct_option_id: row.mcq_answer_keys?.[0]?.correct_option_id || row.mcq_answer_keys?.correct_option_id,
      explanation: row.mcq_answer_keys?.[0]?.explanation || row.mcq_answer_keys?.explanation,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    // Fetch all for complete metrics
    const { data: allData } = await admin
      .from("mcq_questions")
      .select("category, marks, is_active");

    const allRecords = (allData || []) as MCQQuestionRecord[];
    const metrics = calculateMetrics(allRecords);

    let filtered = formatted;
    if (search) {
      filtered = filtered.filter(
        (q) =>
          q.question_text.toLowerCase().includes(search) ||
          (q.code_snippet && q.code_snippet.toLowerCase().includes(search)) ||
          q.options.some((o) => o.option_text.toLowerCase().includes(search))
      );
    }

    return { questions: filtered, metrics };
  }

  // Local fallback
  const store = getLocalStore();
  let filtered = [...store];

  if (category && category !== "ALL") {
    filtered = filtered.filter((q) => q.category.toLowerCase() === category.toLowerCase());
  }
  if (status === "active") {
    filtered = filtered.filter((q) => q.is_active);
  } else if (status === "inactive") {
    filtered = filtered.filter((q) => !q.is_active);
  }
  if (search) {
    filtered = filtered.filter(
      (q) =>
        q.question_text.toLowerCase().includes(search) ||
        (q.code_snippet && q.code_snippet.toLowerCase().includes(search)) ||
        q.options.some((o) => o.option_text.toLowerCase().includes(search))
    );
  }

  const metrics = calculateMetrics(store);
  return { questions: filtered, metrics };
}

/**
 * Retrieve a single question with options and answer key.
 */
export async function getQuestionById(id: string): Promise<MCQQuestionRecord | null> {
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("mcq_questions")
      .select("*, mcq_options(*), mcq_answer_keys(*)")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      competition_id: data.competition_id,
      category: data.category,
      question_text: data.question_text,
      code_snippet: data.code_snippet,
      case_study_passage: data.case_study_passage,
      marks: data.marks,
      is_active: data.is_active,
      options: (data.mcq_options || []).sort((a: any, b: any) => a.option_key.localeCompare(b.option_key)),
      correct_option_key: data.mcq_answer_keys?.[0]?.correct_option_key || data.mcq_answer_keys?.correct_option_key,
      correct_option_id: data.mcq_answer_keys?.[0]?.correct_option_id || data.mcq_answer_keys?.correct_option_id,
      explanation: data.mcq_answer_keys?.[0]?.explanation || data.mcq_answer_keys?.explanation,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  const store = getLocalStore();
  return store.find((q) => q.id === id) || null;
}

/**
 * Create a new question with 4 options and answer key.
 */
export async function createQuestion(input: QuestionInput): Promise<MCQQuestionRecord> {
  const text = (input.question_text || "").trim();
  const category = input.category;
  const optA = (input.options?.A || "").trim();
  const optB = (input.options?.B || "").trim();
  const optC = (input.options?.C || "").trim();
  const optD = (input.options?.D || "").trim();
  const correctOption = input.correct_option;

  if (!text) throw new Error("Question text cannot be empty.");
  if (!CATEGORY_SPECS[category]) throw new Error(`Invalid category: ${category}`);
  if (!optA || !optB || !optC || !optD) {
    throw new Error("All four options (A, B, C, and D) are required.");
  }
  if (!["A", "B", "C", "D"].includes(correctOption)) {
    throw new Error("A valid correct option (A, B, C, or D) must be designated.");
  }

  // Enforce standard marks matching competition rules
  const expectedMarks = CATEGORY_SPECS[category].marksEach;
  const marks = input.marks ?? expectedMarks;

  if (category === "Case Study" && !input.case_study_passage?.trim()) {
    throw new Error("Case study questions must include an associated passage.");
  }

  if (isSupabaseLive()) {
    const admin = createAdminClient();

    // 1. Insert question
    const { data: qData, error: qError } = await admin
      .from("mcq_questions")
      .insert({
        category,
        question_text: text,
        code_snippet: input.code_snippet?.trim() || null,
        case_study_passage: input.case_study_passage?.trim() || null,
        marks,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (qError || !qData) {
      throw new Error(`Failed to insert question: ${qError?.message}`);
    }

    const questionId = qData.id;

    // 2. Insert 4 options
    const optionsPayload = [
      { question_id: questionId, option_key: "A", option_text: optA },
      { question_id: questionId, option_key: "B", option_text: optB },
      { question_id: questionId, option_key: "C", option_text: optC },
      { question_id: questionId, option_key: "D", option_text: optD },
    ];

    const { data: optData, error: optError } = await admin
      .from("mcq_options")
      .insert(optionsPayload)
      .select();

    if (optError || !optData) {
      await admin.from("mcq_questions").delete().eq("id", questionId);
      throw new Error(`Failed to insert options: ${optError?.message}`);
    }

    const correctOptionObj = optData.find((o) => o.option_key === correctOption);
    if (!correctOptionObj) {
      throw new Error("Failed to map correct option key to inserted option ID.");
    }

    // 3. Insert answer key
    await admin.from("mcq_answer_keys").insert({
      question_id: questionId,
      correct_option_id: correctOptionObj.id,
      correct_option_key: correctOption,
      explanation: input.explanation?.trim() || null,
    });

    return {
      id: questionId,
      competition_id: qData.competition_id,
      category,
      question_text: text,
      code_snippet: qData.code_snippet,
      case_study_passage: qData.case_study_passage,
      marks,
      is_active: qData.is_active,
      options: optData as MCQOption[],
      correct_option_key: correctOption,
      correct_option_id: correctOptionObj.id,
      explanation: input.explanation?.trim() || null,
      created_at: qData.created_at,
      updated_at: qData.updated_at,
    };
  }

  // Local fallback
  const store = getLocalStore();
  const questionId = `local-mcq-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const optAId = `opt-A-${Date.now()}`;
  const optBId = `opt-B-${Date.now()}`;
  const optCId = `opt-C-${Date.now()}`;
  const optDId = `opt-D-${Date.now()}`;

  const options: MCQOption[] = [
    { id: optAId, question_id: questionId, option_key: "A", option_text: optA },
    { id: optBId, question_id: questionId, option_key: "B", option_text: optB },
    { id: optCId, question_id: questionId, option_key: "C", option_text: optC },
    { id: optDId, question_id: questionId, option_key: "D", option_text: optD },
  ];

  const correctOptionId =
    correctOption === "A" ? optAId : correctOption === "B" ? optBId : correctOption === "C" ? optCId : optDId;

  const newRecord: MCQQuestionRecord = {
    id: questionId,
    competition_id: null,
    category,
    question_text: text,
    code_snippet: input.code_snippet?.trim() || null,
    case_study_passage: input.case_study_passage?.trim() || null,
    marks,
    is_active: input.is_active ?? true,
    options,
    correct_option_key: correctOption,
    correct_option_id: correctOptionId,
    explanation: input.explanation?.trim() || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.unshift(newRecord);
  return newRecord;
}

/**
 * Update existing question.
 */
export async function updateQuestion(
  id: string,
  input: Partial<QuestionInput>
): Promise<MCQQuestionRecord> {
  if (isSupabaseLive()) {
    const admin = createAdminClient();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.question_text !== undefined) updatePayload.question_text = input.question_text.trim();
    if (input.category !== undefined) {
      if (!CATEGORY_SPECS[input.category]) throw new Error(`Invalid category: ${input.category}`);
      updatePayload.category = input.category;
      updatePayload.marks = CATEGORY_SPECS[input.category].marksEach;
    }
    if (input.code_snippet !== undefined) updatePayload.code_snippet = input.code_snippet?.trim() || null;
    if (input.case_study_passage !== undefined) updatePayload.case_study_passage = input.case_study_passage?.trim() || null;
    if (input.marks !== undefined) updatePayload.marks = input.marks;
    if (input.is_active !== undefined) updatePayload.is_active = input.is_active;

    await admin.from("mcq_questions").update(updatePayload).eq("id", id);

    // Update options if supplied
    if (input.options) {
      const keys = ["A", "B", "C", "D"] as const;
      for (const k of keys) {
        if (input.options[k]) {
          await admin
            .from("mcq_options")
            .update({ option_text: input.options[k].trim() })
            .eq("question_id", id)
            .eq("option_key", k);
        }
      }
    }

    // Update answer key if supplied
    if (input.correct_option || input.explanation !== undefined) {
      const { data: optData } = await admin
        .from("mcq_options")
        .select("id, option_key")
        .eq("question_id", id);

      const targetOpt = (optData || []).find((o) => o.option_key === input.correct_option);
      const answerPayload: Record<string, unknown> = {};
      if (input.correct_option && targetOpt) {
        answerPayload.correct_option_key = input.correct_option;
        answerPayload.correct_option_id = targetOpt.id;
      }
      if (input.explanation !== undefined) {
        answerPayload.explanation = input.explanation?.trim() || null;
      }

      await admin.from("mcq_answer_keys").upsert({
        question_id: id,
        ...answerPayload,
      });
    }

    const updated = await getQuestionById(id);
    if (!updated) throw new Error("Question record not found.");
    return updated;
  }

  // Local fallback
  const store = getLocalStore();
  const q = store.find((item) => item.id === id);
  if (!q) throw new Error("Question record not found.");

  if (input.question_text !== undefined) q.question_text = input.question_text.trim();
  if (input.category !== undefined) {
    if (!CATEGORY_SPECS[input.category]) throw new Error(`Invalid category: ${input.category}`);
    q.category = input.category;
    q.marks = CATEGORY_SPECS[input.category].marksEach;
  }
  if (input.code_snippet !== undefined) q.code_snippet = input.code_snippet?.trim() || null;
  if (input.case_study_passage !== undefined) q.case_study_passage = input.case_study_passage?.trim() || null;
  if (input.marks !== undefined) q.marks = input.marks;
  if (input.is_active !== undefined) q.is_active = input.is_active;

  if (input.options) {
    const keys = ["A", "B", "C", "D"] as const;
    keys.forEach((k) => {
      const opt = q.options.find((o) => o.option_key === k);
      if (opt && input.options && input.options[k]) {
        opt.option_text = input.options[k].trim();
      }
    });
  }

  if (input.correct_option) {
    q.correct_option_key = input.correct_option;
    const opt = q.options.find((o) => o.option_key === input.correct_option);
    if (opt) q.correct_option_id = opt.id;
  }

  if (input.explanation !== undefined) {
    q.explanation = input.explanation?.trim() || null;
  }

  q.updated_at = new Date().toISOString();
  return q;
}

/**
 * Delete a question.
 */
export async function deleteQuestion(id: string): Promise<boolean> {
  if (isSupabaseLive()) {
    const admin = createAdminClient();
    const { error } = await admin.from("mcq_questions").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete question: ${error.message}`);
    return true;
  }

  const store = getLocalStore();
  const index = store.findIndex((q) => q.id === id);
  if (index === -1) throw new Error("Question record not found.");
  store.splice(index, 1);
  return true;
}

/**
 * Bulk import CSV questions.
 */
export interface RawMCQCSVRow {
  question: string;
  category: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks?: string | number;
  explanation?: string;
  case_study_passage?: string;
  code_snippet?: string;
}

export interface MCQImportSummary {
  totalRows: number;
  importedCount: number;
  failedCount: number;
  details: Array<{
    rowNumber: number;
    question: string;
    category: string;
    status: "imported" | "failed";
    reason?: string;
  }>;
}

export async function bulkImportQuestions(rows: RawMCQCSVRow[]): Promise<MCQImportSummary> {
  if (!rows || rows.length === 0) {
    throw new Error("No MCQ questions supplied for import.");
  }

  const summary: MCQImportSummary = {
    totalRows: rows.length,
    importedCount: 0,
    failedCount: 0,
    details: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 1;
    const questionText = (row.question || "").trim();
    const categoryRaw = (row.category || "").trim();
    const optA = (row.option_a || "").trim();
    const optB = (row.option_b || "").trim();
    const optC = (row.option_c || "").trim();
    const optD = (row.option_d || "").trim();
    const correctOpt = (row.correct_option || "").trim().toUpperCase() as "A" | "B" | "C" | "D";

    // Validate category
    const validCategory = (Object.keys(CATEGORY_SPECS) as MCQCategory[]).find(
      (c) => c.toLowerCase() === categoryRaw.toLowerCase()
    );

    if (!questionText || !optA || !optB || !optC || !optD) {
      summary.failedCount++;
      summary.details.push({
        rowNumber,
        question: questionText || "Empty Question",
        category: categoryRaw || "N/A",
        status: "failed",
        reason: "Missing question text or one of the four options (A, B, C, D).",
      });
      continue;
    }

    if (!validCategory) {
      summary.failedCount++;
      summary.details.push({
        rowNumber,
        question: questionText,
        category: categoryRaw,
        status: "failed",
        reason: `Invalid category '${categoryRaw}'. Must be Fundamentals, Technical Understanding, Logic and Debugging, or Case Study.`,
      });
      continue;
    }

    if (!["A", "B", "C", "D"].includes(correctOpt)) {
      summary.failedCount++;
      summary.details.push({
        rowNumber,
        question: questionText,
        category: validCategory,
        status: "failed",
        reason: `Invalid CorrectOption '${correctOpt}'. Must be A, B, C, or D.`,
      });
      continue;
    }

    if (validCategory === "Case Study" && !row.case_study_passage?.trim()) {
      summary.failedCount++;
      summary.details.push({
        rowNumber,
        question: questionText,
        category: validCategory,
        status: "failed",
        reason: "Case study question requires an associated passage.",
      });
      continue;
    }

    try {
      await createQuestion({
        category: validCategory,
        question_text: questionText,
        code_snippet: row.code_snippet?.trim() || null,
        case_study_passage: row.case_study_passage?.trim() || null,
        options: { A: optA, B: optB, C: optC, D: optD },
        correct_option: correctOpt,
        explanation: row.explanation?.trim() || null,
        marks: CATEGORY_SPECS[validCategory].marksEach,
        is_active: true,
      });

      summary.importedCount++;
      summary.details.push({
        rowNumber,
        question: questionText.substring(0, 60) + (questionText.length > 60 ? "..." : ""),
        category: validCategory,
        status: "imported",
        reason: `Enrolled under ${validCategory} (${CATEGORY_SPECS[validCategory].marksEach} Marks)`,
      });
    } catch (err: unknown) {
      summary.failedCount++;
      summary.details.push({
        rowNumber,
        question: questionText,
        category: validCategory,
        status: "failed",
        reason: err instanceof Error ? err.message : "Creation error",
      });
    }
  }

  return summary;
}

/**
 * Preload the official curriculum 40-question, 80-mark seed set.
 */
export async function preloadOfficialSeedQuestions(options?: { reset?: boolean }): Promise<{ count: number }> {
  if (options?.reset) {
    if (isSupabaseLive()) {
      const admin = createAdminClient();
      await admin.from("mcq_questions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      global.__lnmcbm_local_questions_store__ = [];
    }
  }

  const store = getLocalStore();
  if (store.length >= 40 && !options?.reset) {
    return { count: store.length };
  }

  // 10 Fundamentals (1 mark each)
  const fundamentalsQuestions = [
    { q: "What is the best-case time complexity of standard Binary Search on a sorted array of size N?", a: "O(1)", b: "O(log N)", c: "O(N)", d: "O(N log N)", cOpt: "A" as const, exp: "Best case occurs when the target is at the middle element on the very first comparison." },
    { q: "Which of the following data structures operates on the Last-In-First-Out (LIFO) access principle?", a: "Queue", b: "Stack", c: "Array", d: "Linked List", cOpt: "B" as const, exp: "Stack operations (push/pop) follow strict LIFO ordering." },
    { q: "What is the default initial capacity of an ArrayList in Java?", a: "8", b: "10", c: "16", d: "32", cOpt: "B" as const, exp: "In Oracle OpenJDK, default capacity for ArrayList is 10." },
    { q: "In Python, which of the following data types is inherently immutable?", a: "List", b: "Dictionary", c: "Set", d: "Tuple", cOpt: "D" as const, exp: "Tuples cannot be modified in-place after instantiation." },
    { q: "What is the worst-case space complexity of standard Depth First Search (DFS) on a binary tree with N nodes?", a: "O(1)", b: "O(log N)", c: "O(N)", d: "O(N^2)", cOpt: "C" as const, exp: "A skewed tree produces a call stack depth of O(N)." },
    { q: "Which memory segment stores dynamically allocated variables (e.g. malloc/new)?", a: "Stack", b: "Data Segment", c: "Heap", d: "Code Segment", cOpt: "C" as const, exp: "Dynamic memory allocation occurs on the heap." },
    { q: "Which normal form guarantees the elimination of all transitive functional dependencies?", a: "1NF", b: "2NF", c: "3NF", d: "BCNF", cOpt: "C" as const, exp: "3NF eliminates transitive dependencies X -> Y -> Z where Z is non-prime." },
    { q: "In TCP/IP, at which OSI model layer does the Address Resolution Protocol (ARP) operate?", a: "Network Layer", b: "Data Link Layer", c: "Transport Layer", d: "Session Layer", cOpt: "B" as const, exp: "ARP resolves IP addresses to physical MAC addresses on the data link layer." },
    { q: "Which scheduling algorithm can potentially lead to indefinite process starvation?", a: "Round Robin", b: "FCFS", c: "Shortest Job First (SJF)", d: "First-In-First-Out", cOpt: "C" as const, exp: "Long processes can starve if shorter jobs continually arrive." },
    { q: "What is the worst-case time complexity of QuickSort when using the first element as pivot on an already sorted array?", a: "O(N)", b: "O(N log N)", c: "O(N^2)", d: "O(2^N)", cOpt: "C" as const, exp: "Unbalanced partitions lead to O(N^2) recursive depth." },
  ];

  // 10 Technical Understanding (2 marks each)
  const technicalQuestions = [
    { q: "In Java memory management, how does the G1 Garbage Collector differ from the Parallel GC?", a: "It uses a single stop-the-world thread", b: "It divides the heap into equal-sized virtual regions", c: "It does not collect the Young generation", d: "It eliminates mark-and-sweep completely", cOpt: "B" as const, exp: "G1 segments the heap into distinct 1MB to 32MB regions." },
    { q: "What is the primary trade-off of using a B+ Tree over a Binary Search Tree for database indexing?", a: "Higher CPU overhead per node comparison", b: "Shallower tree depth reducing disk I/O operations", c: "Lower range-query scan performance", d: "Inability to maintain balance under deletions", cOpt: "B" as const, exp: "High branching factor keeps tree depth small, minimizing disk reads." },
    { q: "In PostgreSQL, what is the effect of an EXPLAIN ANALYZE statement on a query containing UPDATE?", a: "It prints estimated costs without executing", b: "It executes the query and commits the modification", c: "It runs the query in an automated rollback transaction", d: "It converts the statement into a SELECT", cOpt: "B" as const, exp: "EXPLAIN ANALYZE actually executes the query against the database." },
    { q: "Which statement accurately describes the ABA problem in lock-free concurrent programming?", a: "Deadlock caused by circular wait between two threads", b: "A memory location changes from A to B and back to A, misleading CAS checks", c: "Cache coherency invalidation storm across multi-core CPUs", d: "Priority inversion in preemptive kernel scheduling", cOpt: "B" as const, exp: "Compare-And-Swap succeeds despite intermediate modifications." },
    { q: "In Python asyncio, what is the key difference between asyncio.gather() and asyncio.wait()?", a: "gather preserves insertion order of results while wait returns finished sets", b: "wait cannot handle exceptions", c: "gather spawns separate OS threads for each coroutine", d: "wait executes coroutines synchronously", cOpt: "A" as const, exp: "gather aggregates results in caller order; wait returns (done, pending) sets." },
    { q: "What is the purpose of the virtual method table (vtable) in C++?", a: "To enable compile-time template instantiation", b: "To resolve dynamic dispatch for virtual functions at runtime", c: "To manage stack frame allocation for inline functions", d: "To prevent multiple inheritance ambiguity", cOpt: "B" as const, exp: "vtable pointers allow indirect function dispatch at runtime." },
    { q: "Under HTTP/2, how does header compression (HPACK) optimize network transmission?", a: "By running gzip on all HTTP request bodies", b: "By maintaining static and dynamic index tables across headers", c: "By removing all cookie headers automatically", d: "By encrypting headers with TLS before TCP framing", cOpt: "B" as const, exp: "HPACK replaces repetitive headers with concise integer indices." },
    { q: "In distributed systems, which property does the Raft consensus algorithm enforce via Leader Election?", a: "Byzantine fault tolerance under arbitrary malicious messages", b: "At most one leader can be elected in a given election term", c: "Unlimited parallel leaders in the same partition", d: "Zero-latency write replication", cOpt: "B" as const, exp: "Raft term monotonicity guarantees election safety." },
    { q: "What is the time complexity of building a Binary Heap from an unordered array of size N using Floyd's algorithm?", a: "O(1)", b: "O(log N)", c: "O(N)", d: "O(N log N)", cOpt: "C" as const, exp: "Sum of heights summation converges to O(N)." },
    { q: "In Docker containerization, how do cgroups differ from Linux namespaces?", a: "Namespaces control resource limits; cgroups control isolation", b: "cgroups enforce resource throttling (CPU/RAM); namespaces isolate views (PID/Net)", c: "cgroups provide root filesystem pivot", d: "Namespaces allocate block storage volumes", cOpt: "B" as const, exp: "cgroups meter/limit resources; namespaces isolate processes." },
  ];

  // 10 Logic and Debugging (3 marks each)
  const logicQuestions = [
    { q: "Identify the critical bug in the following C code snippet:\nint *create_array(int size) { int arr[size]; for(int i=0; i<size; i++) arr[i]=i; return arr; }", code: "int *create_array(int size) {\n  int arr[size];\n  for(int i=0; i<size; i++) arr[i]=i;\n  return arr;\n}", a: "Syntax error in for loop condition", b: "Returning a pointer to a stack-allocated local array (dangling pointer)", c: "Integer overflow in variable i", d: "Variable-length arrays are illegal in C99", cOpt: "B" as const, exp: "Local stack frame is destroyed on return, leaving a dangling pointer." },
    { q: "Consider a circular singly linked list with N nodes. What is the time complexity of deleting the node immediately following the tail pointer?", a: "O(1)", b: "O(N)", c: "O(log N)", d: "Undefined", cOpt: "A" as const, exp: "Tail->next points directly to the head; deletion is performed in O(1)." },
    { q: "What will the following Python code output?\ndef func(val, lst=[]):\n    lst.append(val)\n    return lst\nprint(func(1)); print(func(2))", code: "def func(val, lst=[]):\n    lst.append(val)\n    return lst\nprint(func(1))\nprint(func(2))", a: "[1] then [2]", b: "[1] then [1, 2]", c: "[1] then [2, 1]", d: "TypeError", cOpt: "B" as const, exp: "Default argument lists in Python are instantiated once at function definition time." },
    { q: "Given an array of integers [-2, 1, -3, 4, -1, 2, 1, -5, 4], what is the maximum subarray sum using Kadane's Algorithm?", a: "4", b: "5", c: "6", d: "7", cOpt: "C" as const, exp: "The contiguous subarray [4, -1, 2, 1] produces a sum of 6." },
    { q: "What is the return value of this bitwise operation in C: (x & (x - 1)) == 0 when x = 16?", code: "int x = 16;\nint result = (x & (x - 1)) == 0;", a: "0 (false)", b: "1 (true)", c: "15", d: "Compilation Error", cOpt: "B" as const, exp: "x & (x-1) clears the lowest set bit. For powers of 2, result is 0, so == 0 evaluates to 1." },
    { q: "In Java multithreading, why is double-checked locking broken without the 'volatile' keyword on the singleton instance?", a: "Threads cannot call synchronized blocks concurrently", b: "Instruction reordering can publish a partially constructed object reference", c: "Garbage collection purges unreferenced instances prematurely", d: "JVM throws NullPointerException on access", cOpt: "B" as const, exp: "Volatile enforces memory fences, preventing compiler/CPU reordering." },
    { q: "A binary search tree has preorder traversal: [40, 20, 10, 30, 60, 50, 70]. What is its postorder traversal?", a: "[10, 30, 20, 50, 70, 60, 40]", b: "[10, 20, 30, 40, 50, 60, 70]", c: "[70, 60, 50, 40, 30, 20, 10]", d: "[30, 10, 20, 70, 50, 60, 40]", cOpt: "A" as const, exp: "Left-Right-Root traversal yields 10, 30, 20, 50, 70, 60, 40." },
    { q: "What is the output of JavaScript: console.log(typeof NaN, NaN === NaN)?", a: "number, true", b: "number, false", c: "undefined, false", d: "NaN, false", cOpt: "B" as const, exp: "NaN has type 'number' according to IEEE-754, and is not equal to itself." },
    { q: "In a min-heap with 7 distinct elements, what is the minimum number of comparisons needed to find the maximum element?", a: "1", b: "3", c: "4", d: "6", cOpt: "B" as const, exp: "Max element must be in the leaves (nodes 4, 5, 6, 7). Among 4 leaves, 3 comparisons are needed." },
    { q: "Identify the outcome of this SQL query on a table with 10 rows where col contains 3 NULLs: SELECT COUNT(*), COUNT(col) FROM t;", a: "10, 10", b: "10, 7", c: "7, 7", d: "10, 0", cOpt: "B" as const, exp: "COUNT(*) counts total rows; COUNT(col) ignores NULL values." },
  ];

  // 10 Case Study Questions (2 marks each, sharing comprehensive architectural passages)
  const casePassage1 = "CASE STUDY 1: High-Concurrency Banking Transaction Processing System.\nA state-chartered cooperative bank in Bihar processes over 50,000 NEFT and RTGS fund transfer requests every minute during business hours. The backend service architecture utilizes PostgreSQL database clusters, microservices hosted on Kubernetes, Redis distributed caching, and Kafka event streaming. A database deadlock anomaly was recently detected during simultaneous balance debit and credit transactions between savings and current accounts.";

  const casePassage2 = "CASE STUDY 2: E-Commerce Flash Sale Inventory Architecture.\nAn Indian retail technology platform is conducting a Diwali flash sale offering 10,000 units of a high-demand laptop. During peak traffic, 300,000 concurrent shopping carts attempt checkout simultaneously. The engineering team deployed a token-bucket rate limiter, Redis distributed redlock for atomic stock decrement, and an optimistic concurrency control protocol with version numbers on the relational database inventory table.";

  const caseQuestions = [
    { p: casePassage1, q: "In Case Study 1, to eliminate transaction deadlocks during simultaneous mutual transfers between Account A and Account B, which concurrency design must be enforced?", a: "Increase PostgreSQL lock timeout indefinitely", b: "Enforce consistent acquisition order of account locks (e.g. acquire lower account_id first)", c: "Switch all transactions to Read Uncommitted isolation level", d: "Disable foreign key constraints during fund transfer", cOpt: "B" as const, exp: "Deterministic lock ordering completely prevents circular wait conditions." },
    { p: casePassage1, q: "Under high concurrency, how should the bank handle account balance verification before debiting to avoid race condition double-spending?", a: "Run client-side validation in the web browser", b: "Use SELECT ... FOR UPDATE or atomic UPDATE ... WHERE balance >= amount", c: "Rely solely on Redis cached balances without DB verification", d: "Insert debit logs asynchronously via background worker", cOpt: "B" as const, exp: "Pessimistic row locking or atomic conditional updates guarantee balance integrity." },
    { p: casePassage1, q: "If Kafka event streaming is utilized for dispatching SMS debit notifications, which delivery semantic guarantees that no student or customer receives duplicate debits on message retry?", a: "At-most-once delivery with auto-commit", b: "Idempotent consumers using unique transaction IDs", c: "Increasing Kafka partition retention time to 30 days", d: "Using round-robin consumer group assignment", cOpt: "B" as const, exp: "Idempotency prevents duplicate state changes even when messages are redelivered." },
    { p: casePassage1, q: "Which PostgreSQL transaction isolation level is mathematically immune to non-repeatable reads and phantom reads?", a: "Read Committed", b: "Repeatable Read / Serializable", c: "Read Uncommitted", d: "Snapshot Isolated with Dirty Reads", cOpt: "B" as const, exp: "Serializable isolation prevents phantom reads and serialization anomalies." },
    { p: casePassage1, q: "During a network partition between database replicas, what does the CAP theorem state regarding the banking system's availability and consistency?", a: "Both strict consistency and 100% availability can be maintained simultaneously", b: "The system must choose between consistency (rejecting inconsistent writes) or availability", c: "Partition tolerance can be disabled on demand", d: "Network partitions do not affect transactional ACID systems", cOpt: "B" as const, exp: "In the presence of a network partition (P), a distributed system must trade C or A." },
    { p: casePassage2, q: "In Case Study 2, why is Redis DECR preferred over a standard read-modify-write cycle for flash sale inventory decrement?", a: "Redis runs in multi-threaded kernel space", b: "Redis DECR executes as an atomic single-threaded operation preventing overselling", c: "Redis automatically rolls back relational DB transactions", d: "DECR disables all network round-trips", cOpt: "B" as const, exp: "Redis single-threaded command execution guarantees atomicity." },
    { p: casePassage2, q: "Under optimistic concurrency control, what occurs when 50 concurrent transactions attempt to update the same inventory row with version = 5?", a: "All 50 transactions succeed simultaneously", b: "Exactly 1 transaction succeeds; the remaining 49 detect a version mismatch and abort/retry", c: "Database hangs until manual admin intervention", d: "The row is split into 50 child rows", cOpt: "B" as const, exp: "Only the transaction matching the current version updates the row and increments version to 6." },
    { p: casePassage2, q: "What is the primary risk of using client-side rate limiting exclusively to protect flash sale checkout APIs?", a: "High CPU consumption on client browsers", b: "Malicious bots and scripts can easily bypass client-side checks and flood the origin server", c: "Increased database index fragmentation", d: "Incompatibility with modern mobile browsers", cOpt: "B" as const, exp: "Client-side limits provide zero protection against automated API scrapers." },
    { p: casePassage2, q: "When deploying a token-bucket rate limiter in front of the checkout endpoint, what happens when the bucket capacity is exhausted during a sudden burst?", a: "The server crashes with Out Of Memory error", b: "Excess requests are immediately dropped or returned HTTP 429 Too Many Requests", c: "All requests are queued indefinitely without response", d: "Client IP addresses are permanently blacklisted in DNS", cOpt: "B" as const, exp: "HTTP 429 signals rate limiting when token availability drops below cost." },
    { p: casePassage2, q: "In the flash sale architecture, which database caching strategy ensures that cache eviction does not trigger a cache stampede / thundering herd on the primary database?", a: "No-cache directive on all queries", b: "Probabilistic early expiration (XFetch) or mutex locking during cache refill", c: "Clearing the entire Redis cache every 60 seconds", d: "Setting TTL to 0 on all hot inventory keys", cOpt: "B" as const, exp: "Mutex locks or early background warming prevents thousands of queries from hammering the DB simultaneously." },
  ];

  let addedCount = 0;
  for (const item of fundamentalsQuestions) {
    await createQuestion({
      category: "Fundamentals",
      question_text: item.q,
      options: { A: item.a, B: item.b, C: item.c, D: item.d },
      correct_option: item.cOpt,
      explanation: item.exp,
      marks: 1,
      is_active: true,
    });
    addedCount++;
  }

  for (const item of technicalQuestions) {
    await createQuestion({
      category: "Technical Understanding",
      question_text: item.q,
      options: { A: item.a, B: item.b, C: item.c, D: item.d },
      correct_option: item.cOpt,
      explanation: item.exp,
      marks: 2,
      is_active: true,
    });
    addedCount++;
  }

  for (const item of logicQuestions) {
    await createQuestion({
      category: "Logic and Debugging",
      question_text: item.q,
      code_snippet: item.code || null,
      options: { A: item.a, B: item.b, C: item.c, D: item.d },
      correct_option: item.cOpt,
      explanation: item.exp,
      marks: 3,
      is_active: true,
    });
    addedCount++;
  }

  for (const item of caseQuestions) {
    await createQuestion({
      category: "Case Study",
      question_text: item.q,
      case_study_passage: item.p,
      options: { A: item.a, B: item.b, C: item.c, D: item.d },
      correct_option: item.cOpt,
      explanation: item.exp,
      marks: 2,
      is_active: true,
    });
    addedCount++;
  }

  return { count: addedCount };
}

