import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { startOrResumePhase1 } from "@/lib/services/exam-service";
import { getStudentById } from "@/lib/services/students-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/exam/start
 * Initializes or resumes the candidate's Phase 1 examination attempt.
 * Establishes the authoritative 45-minute countdown clock.
 */
export async function POST() {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Verify candidate account is active
    const student = await getStudentById(auth.student.id);
    if (student && !student.is_active) {
      return NextResponse.json(
        { error: "Your participation is suspended. Contact the exam invigilator." },
        { status: 403 }
      );
    }

    const examState = await startOrResumePhase1(auth.student.id);

    return NextResponse.json({
      success: true,
      student: auth.student,
      ...examState,
    });
  } catch (error: unknown) {
    console.error("POST /api/student/exam/start error:", error);
    const message = error instanceof Error ? error.message : "Failed to start examination.";
    const status = message.includes("TERMINATED") || message.includes("terminated") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

