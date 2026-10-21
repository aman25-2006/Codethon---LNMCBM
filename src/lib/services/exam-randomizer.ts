/**
 * LNMCBM College Coding Competition Portal
 * Phase F & G: Deterministic Exam Randomizer Engine
 *
 * Guarantees:
 * 1. Per-attempt stable randomization: Same student/attempt seed produces the exact same question & option sequence across page reloads.
 * 2. Non-correlating sequences across students: Different student/attempt seeds produce distinct permutations.
 * 3. Security: All correct answer keys, correct option IDs, and explanations are strictly excluded.
 */

import { getQuestions, StudentSafeQuestion, MCQQuestionRecord } from "./questions-service";
import { getQuestionsByTrack } from "@/lib/data/questions";

/**
 * 32-bit FNV-1a hash algorithm to produce an integer seed from any string.
 */
export function hashStringToSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Fast, high-quality 32-bit PRNG (Mulberry32).
 */
export function createMulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic Fisher-Yates shuffle using provided PRNG.
 */
export function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export interface RandomizedExamPayload {
  seed: string;
  totalQuestions: number;
  totalMarks: number;
  questions: StudentSafeQuestion[];
  generatedAt: string;
}

/**
 * Builds a deterministic, attempt-stable, student-safe exam question set.
 *
 * @param attemptSeed - Unique identifier for the student or exam attempt (e.g., studentId, sessionId, or rollNumber).
 * @param options - Customization flags (e.g., shuffleOptions: boolean).
 */
export async function getDeterministicExamQuestions(
  attemptSeed: string,
  options?: { shuffleOptions?: boolean; track?: string }
): Promise<RandomizedExamPayload> {
  const shouldShuffleOptions = options?.shuffleOptions ?? true;
  const seedString = attemptSeed || "lnmcbm_default_seed";
  const targetTrack = options?.track;

  // Fetch only active questions from the question bank
  const { questions: rawQuestions } = await getQuestions({
    status: "active",
    track: targetTrack,
  });

  // Filter only active questions
  let activeQuestions = rawQuestions.filter((q) => q.is_active);

  if (targetTrack && targetTrack !== "ALL") {
    activeQuestions = activeQuestions.filter(
      (q) => q.track && q.track.toLowerCase() === targetTrack.toLowerCase()
    );
    if (activeQuestions.length < 40) {
      const fallbackList = getQuestionsByTrack(targetTrack);
      activeQuestions = fallbackList.map((q, idx) => {
        const qId = `mcq-${q.track.toLowerCase().replace(/[^a-z0-9]/g, "")}-q${q.q_number}-${idx + 1}`;
        return {
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
            { id: `${qId}-A`, question_id: qId, option_key: "A" as const, option_text: q.options.A },
            { id: `${qId}-B`, question_id: qId, option_key: "B" as const, option_text: q.options.B },
            { id: `${qId}-C`, question_id: qId, option_key: "C" as const, option_text: q.options.C },
            { id: `${qId}-D`, question_id: qId, option_key: "D" as const, option_text: q.options.D },
          ],
          correct_option_key: q.correct_option,
          explanation: q.explanation,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
    }
  } else {
    // Default to track C when no track is specified
    const cFallback = getQuestionsByTrack("C");
    activeQuestions = cFallback.map((q, idx) => {
      const qId = `mcq-${q.track.toLowerCase().replace(/[^a-z0-9]/g, "")}-q${q.q_number}-${idx + 1}`;
      return {
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
          { id: `${qId}-A`, question_id: qId, option_key: "A" as const, option_text: q.options.A },
          { id: `${qId}-B`, question_id: qId, option_key: "B" as const, option_text: q.options.B },
          { id: `${qId}-C`, question_id: qId, option_key: "C" as const, option_text: q.options.C },
          { id: `${qId}-D`, question_id: qId, option_key: "D" as const, option_text: q.options.D },
        ],
        correct_option_key: q.correct_option,
        explanation: q.explanation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
  }

  // Ensure exactly 40 questions per track
  if (activeQuestions.length > 40) {
    activeQuestions = activeQuestions.slice(0, 40);
  }

  // Group questions by category so we can either shuffle within categories or across the entire exam
  // Here we shuffle within the overall active pool deterministically
  const questionRng = createMulberry32(hashStringToSeed(`exam_questions_${seedString}`));
  const shuffledQuestions = shuffleArray(activeQuestions, questionRng);

  const studentSafeQuestions: StudentSafeQuestion[] = shuffledQuestions.map(
    (q: MCQQuestionRecord, index: number) => {
      // Deterministically shuffle options for this specific question
      let processedOptions: Array<{ id: string; option_key: "A" | "B" | "C" | "D"; option_text: string }> = [];

      if (shouldShuffleOptions && q.options && q.options.length > 0) {
        const optionRng = createMulberry32(
          hashStringToSeed(`exam_options_${seedString}_${q.id}_idx_${index}`)
        );
        const shuffledRawOptions = shuffleArray(q.options, optionRng);

        // Assign display keys A, B, C, D in order of their shuffled appearance
        const displayKeys: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
        processedOptions = shuffledRawOptions.map((opt, optIdx) => ({
          id: opt.id,
          option_key: displayKeys[optIdx] || opt.option_key,
          option_text: opt.option_text,
        }));
      } else {
        processedOptions = (q.options || []).map((opt) => ({
          id: opt.id,
          option_key: opt.option_key,
          option_text: opt.option_text,
        }));
      }

      // Security guarantee: Strictly exclude correct_option_key, correct_option_id, and explanation
      return {
        id: q.id,
        track: q.track,
        category: q.category,
        question_text: q.question_text,
        code_snippet: q.code_snippet || null,
        case_study_passage: q.case_study_passage || null,
        marks: q.marks,
        options: processedOptions,
      };
    }
  );

  const totalMarks = studentSafeQuestions.reduce((acc, q) => acc + q.marks, 0);

  return {
    seed: seedString,
    totalQuestions: studentSafeQuestions.length,
    totalMarks,
    questions: studentSafeQuestions,
    generatedAt: new Date().toISOString(),
  };
}

