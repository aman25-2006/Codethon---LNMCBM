import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { getStudentScorecard } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/student/scorecard
 * Retrieves the candidate's own published scorecard.
 * Strictly blocks access if results have not yet been published by the admin.
 */
export async function GET() {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const scorecard = await getStudentScorecard(auth.student.id);

    return NextResponse.json({
      success: true,
      scorecard,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load scorecard.";

    if (message.includes("RESULTS_NOT_PUBLISHED")) {
      return NextResponse.json(
        {
          error: "RESULTS_NOT_PUBLISHED",
          message:
            "Official competition results and scorecards have not been published yet. Please check back after official announcement by the Examination Controller.",
        },
        { status: 403 }
      );
    }

    if (message.includes("RESULT_NOT_FINALIZED")) {
      return NextResponse.json(
        {
          error: "RESULT_NOT_FINALIZED",
          message:
            "Your examination attempt is still being compiled or evaluated. Scorecard will be available upon result publication.",
        },
        { status: 404 }
      );
    }

    console.error("GET /api/student/scorecard error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

