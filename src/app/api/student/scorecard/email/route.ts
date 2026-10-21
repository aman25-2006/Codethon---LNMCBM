import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { sendScorecardEmailForStudent } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/scorecard/email
 * Transmits the authenticated student's finalized scorecard to their registered email.
 */
export async function POST() {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const dispatch = await sendScorecardEmailForStudent(auth.student.id);

    if (!dispatch.success) {
      return NextResponse.json(
        {
          error: dispatch.error || "Failed to dispatch scorecard email.",
          message: dispatch.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: dispatch.message,
      messageId: dispatch.messageId,
    });
  } catch (error: unknown) {
    console.error("POST /api/student/scorecard/email error:", error);
    const msg = error instanceof Error ? error.message : "Failed to dispatch scorecard email.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

