import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { getPhase2ExamState } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/student/exam/phase2/session
 * Retrieves the candidate's active Phase 2 session state, locked category, and assigned problems.
 */
export async function GET() {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const state = await getPhase2ExamState(auth.student.id);

    return NextResponse.json({
      success: true,
      student: auth.student,
      ...state,
    });
  } catch (error: unknown) {
    console.error("GET /api/student/exam/phase2/session error:", error);
    const message = error instanceof Error ? error.message : "Failed to load Phase 2 session.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

