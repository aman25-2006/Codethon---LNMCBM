import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { startOrResumePhase1, getStudentSession } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/exam/change-track
 * Allows a student to select or switch their competition language track
 * before final submission of Phase 1.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const track = body?.track;
    const language = body?.language;

    if (!track) {
      return NextResponse.json({ error: "Track is required." }, { status: 400 });
    }

    const session = await getStudentSession(auth.student.id);
    if (session && session.status === "phase1_completed") {
      return NextResponse.json(
        { error: "Phase 1 is already completed. Track cannot be changed." },
        { status: 400 }
      );
    }

    const examState = await startOrResumePhase1(auth.student.id, track, language);

    return NextResponse.json({
      success: true,
      ...examState,
    });
  } catch (error: unknown) {
    console.error("POST /api/student/exam/change-track error:", error);
    const message = error instanceof Error ? error.message : "Failed to change track.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

