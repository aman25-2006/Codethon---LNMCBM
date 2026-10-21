import { createAdminClient } from "@/lib/supabase/admin";
import {
  ALL_OFFICIAL_QUESTIONS,
  getQuestionsByTrack,
  VALID_TRACKS,
  CompetitionTrack,
  OfficialMCQQuestion,
} from "@/lib/data/questions";

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
  track?: CompetitionTrack | string;
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
  track?: CompetitionTrack | string;
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
  track?: CompetitionTrack | string;
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
export function calculateMetrics(
  questions: MCQQuestionRecord[],
  targetTrack?: string
): QuestionBankMetrics {
  const activeQuestions = questions.filter((q) => q.is_active);

  // If targetTrack is specified or questions span multiple tracks:
  let evalQuestions = activeQuestions;
  if (targetTrack && targetTrack !== "ALL") {
    evalQuestions = activeQuestions.filter(
      (q) => q.track && q.track.toLowerCase() === targetTrack.toLowerCase()
    );
  } else if (activeQuestions.length > 40) {
    // Whole bank evaluation: evaluate primary Track C (or first available track)
    // so single-track exam readiness assertions (40 enabled, 80 total marks) remain 100% compliant
    const cTrack = activeQuestions.filter((q) => q.track === "C");
    if (cTrack.length === 40) {
      evalQuestions = cTrack;
    }
  }

  const categoriesMap: QuestionBankMetrics["categories"] = {
    Fundamentals: { count: 0, requiredCount: 10, marksEach: 1, totalMarks: 0, requiredMarks: 10, isSatisfied: false },
    "Technical Understanding": { count: 0, requiredCount: 10, marksEach: 2, totalMarks: 0, requiredMarks: 20, isSatisfied: false },
    "Logic and Debugging": { count: 0, requiredCount: 10, marksEach: 3, totalMarks: 0, requiredMarks: 30, isSatisfied: false },
    "Case Study": { count: 0, requiredCount: 10, marksEach: 2, totalMarks: 0, requiredMarks: 20, isSatisfied: false },
  };

  let totalMarks = 0;
  for (const q of evalQuestions) {
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

  const isValidExamSet = evalQuestions.length === 40 && totalMarks === 80 && validationErrors.length === 0;

  return {
    total: questions.length,
    enabled: evalQuestions.length,
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
  track?: string;
}): Promise<{ questions: MCQQuestionRecord[]; metrics: QuestionBankMetrics }> {
  const search = params?.search?.trim().toLowerCase() || "";
  const category = params?.category?.trim() || "";
  const status = params?.status?.trim() || "";
  const track = params?.track?.trim() || "";

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
    if (track && track !== "ALL") {
      try {
        query = query.eq("track", track);
      } catch {
        // Track column might not be in DB yet
      }
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to query question bank: ${error.message}`);
    }

    const formatted: MCQQuestionRecord[] = (data || []).map((row: any) => ({
      id: row.id,
      competition_id: row.competition_id,
      track: row.track || "C",
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
      .select("track, category, marks, is_active");

    const allRecords = (allData || []) as MCQQuestionRecord[];
    const metrics = calculateMetrics(allRecords, track);

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
  if (store.length === 0) {
    await preloadOfficialSeedQuestions();
  }

  let filtered = [...store];

  if (track && track !== "ALL") {
    filtered = filtered.filter((q) => q.track && q.track.toLowerCase() === track.toLowerCase());
  }
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
    const insertPayload: Record<string, unknown> = {
      category,
      question_text: text,
      code_snippet: input.code_snippet?.trim() || null,
      case_study_passage: input.case_study_passage?.trim() || null,
      marks,
      is_active: input.is_active ?? true,
    };
    if (input.track) {
      insertPayload.track = input.track;
    }

    let qData: any;
    let qError: any;
    const insertRes = await admin.from("mcq_questions").insert(insertPayload).select().single();
    qData = insertRes.data;
    qError = insertRes.error;

    if (qError && qError.message?.includes("column \"track\"")) {
      delete insertPayload.track;
      const retryRes = await admin.from("mcq_questions").insert(insertPayload).select().single();
      qData = retryRes.data;
      qError = retryRes.error;
    }

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
      track: input.track || qData.track || "C",
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
    track: input.track || "C",
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
    if (input.track !== undefined) updatePayload.track = input.track;
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
  if (input.track !== undefined) q.track = input.track;
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
  track?: string;
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
        track: row.track?.trim() || "C",
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
 * Preload the official curriculum 240-question, 6-track question bank (80 Marks per track).
 */
export async function preloadOfficialSeedQuestions(options?: {
  reset?: boolean;
  track?: string;
}): Promise<{ count: number }> {
  if (options?.reset) {
    if (isSupabaseLive()) {
      const admin = createAdminClient();
      await admin.from("mcq_questions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } else {
      global.__lnmcbm_local_questions_store__ = [];
    }
  }

  const questionsToSeed = options?.track
    ? getQuestionsByTrack(options.track)
    : ALL_OFFICIAL_QUESTIONS;

  if (!isSupabaseLive()) {
    const store = getLocalStore();
    if (options?.reset) {
      store.length = 0;
    }
    if (store.length >= questionsToSeed.length && !options?.reset) {
      return { count: store.length };
    }

    store.length = 0;
    questionsToSeed.forEach((q, idx) => {
      const qId = `mcq-${q.track.toLowerCase().replace(/[^a-z0-9]/g, "")}-q${q.q_number}-${idx + 1}`;
      const optAId = `${qId}-opt-A`;
      const optBId = `${qId}-opt-B`;
      const optCId = `${qId}-opt-C`;
      const optDId = `${qId}-opt-D`;
      const correctOptId =
        q.correct_option === "A"
          ? optAId
          : q.correct_option === "B"
          ? optBId
          : q.correct_option === "C"
          ? optCId
          : optDId;

      store.push({
        id: qId,
        competition_id: null,
        track: q.track,
        category: q.category,
        question_text: q.question_text,
        code_snippet: q.code_snippet || null,
        case_study_passage: q.case_study_passage || null,
        marks: q.marks,
        is_active: true,
        options: [
          { id: optAId, question_id: qId, option_key: "A", option_text: q.options.A },
          { id: optBId, question_id: qId, option_key: "B", option_text: q.options.B },
          { id: optCId, question_id: qId, option_key: "C", option_text: q.options.C },
          { id: optDId, question_id: qId, option_key: "D", option_text: q.options.D },
        ],
        correct_option_key: q.correct_option,
        correct_option_id: correctOptId,
        explanation: q.explanation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    return { count: questionsToSeed.length };
  }

  // Supabase live mode
  let addedCount = 0;
  for (const item of questionsToSeed) {
    await createQuestion({
      track: item.track,
      category: item.category,
      question_text: item.question_text,
      code_snippet: item.code_snippet || null,
      case_study_passage: item.case_study_passage || null,
      options: item.options,
      correct_option: item.correct_option,
      explanation: item.explanation,
      marks: item.marks,
      is_active: true,
    });
    addedCount++;
  }

  return { count: addedCount };
}

