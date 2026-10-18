import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { getDeterministicExamQuestions } from "@/lib/services/exam-randomizer";

export const dynamic = "force-dynamic";

/**
 * GET /api/student/exam/questions
 *
 * Student-facing examination questions API:
 * 1. Requires valid student authentication.
 * 2. Delivers deterministic, attempt-stable question & option randomization.
 * 3. STRICT SECURITY MANDATE: Strips all correct option keys, option IDs, and explanations.
 */
export async function GET(request: Request) {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    // Student can provide an attemptId or session seed; defaults to candidate ID
    const seed = searchParams.get("attemptId") || auth.student.id;

    const exam = await getDeterministicExamQuestions(seed, { shuffleOptions: true });

    // Extra runtime safety audit: Ensure NO answer key fields exist in student payload
    exam.questions.forEach((q) => {
      // @ts-expect-error Security check against runtime leaks
      delete q.correct_option_key;
      // @ts-expect-error Security check against runtime leaks
      delete q.correct_option_id;
      // @ts-expect-error Security check against runtime leaks
      delete q.explanation;
    });

    return NextResponse.json({
      success: true,
      student: {
        id: auth.student.id,
        roll_number: auth.student.roll_number,
        participant_id: auth.student.participant_id,
      },
      exam,
    });
  } catch (error: unknown) {
    console.error("GET /api/student/exam/questions error:", error);
    const message = error instanceof Error ? error.message : "Failed to load examination questions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

