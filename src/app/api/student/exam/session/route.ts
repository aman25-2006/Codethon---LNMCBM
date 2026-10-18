import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { getStudentSession, getFullStudentExamState } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/student/exam/session
 * Retrieves the candidate's active exam session state and saved answers.
 */
export async function GET() {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const session = await getStudentSession(auth.student.id);

    if (!session) {
      return NextResponse.json({
        success: true,
        session: null,
        status: "not_started",
        student: auth.student,
      });
    }

    const state = await getFullStudentExamState(auth.student.id, session);

    return NextResponse.json({
      success: true,
      student: auth.student,
      ...state,
    });
  } catch (error: unknown) {
    console.error("GET /api/student/exam/session error:", error);
    const message = error instanceof Error ? error.message : "Failed to load exam session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

