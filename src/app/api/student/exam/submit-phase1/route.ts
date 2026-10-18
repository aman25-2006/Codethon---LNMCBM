import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { submitPhase1Exam } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/exam/submit-phase1
 *
 * Concludes Phase 1 examination, calculates trusted score on the server,
 * and advances the candidate state to Phase 2.
 *
 * CRITICAL SECURITY GUARANTEE:
 * 1. Score is kept completely hidden from the student.
 * 2. Zero correct options or explanations are returned in the payload.
 */
export async function POST() {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const result = await submitPhase1Exam(auth.student.id);

    return NextResponse.json({
      success: true,
      phase: result.phase,
      completed: result.completed,
      nextPhase: result.nextPhase,
      message: "Phase 1 assessment completed and answers securely locked. Proceed to Phase 2.",
    });
  } catch (error: unknown) {
    console.error("POST /api/student/exam/submit-phase1 error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit Phase 1 exam.";
    const status = message.includes("TERMINATED") || message.includes("terminated") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

