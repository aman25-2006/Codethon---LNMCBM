import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import {
  finalizeAllEligibleResults,
  finalizeStudentResult,
  recalculateRanks,
} from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/results/finalize
 * Finalizes results for all eligible candidates or a single candidate.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is allowed for finalize-all
    }

    if (body.studentId) {
      const result = await finalizeStudentResult(body.studentId, { force: true });
      await recalculateRanks();
      return NextResponse.json({
        success: true,
        message: `Candidate ${body.studentId} result successfully finalized.`,
        result,
      });
    }

    const summary = await finalizeAllEligibleResults();

    return NextResponse.json({
      success: true,
      message: `Successfully finalized ${summary.finalizedCount} of ${summary.totalEligible} eligible candidate attempts.`,
      ...summary,
    });
  } catch (error: unknown) {
    console.error("POST /api/admin/results/finalize error:", error);
    const message = error instanceof Error ? error.message : "Failed to finalize results.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

