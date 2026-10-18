import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { savePhase2Draft } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/exam/phase2/save-draft
 *
 * Debounced autosave for candidate code buffer.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.problem_id || body.source_code === undefined) {
      return NextResponse.json(
        { error: "problem_id and source_code are required." },
        { status: 400 }
      );
    }

    const { problem_id, source_code, language } = body;

    const result = await savePhase2Draft(
      auth.student.id,
      problem_id,
      source_code,
      language
    );

    return NextResponse.json({
      success: true,
      savedAt: result.savedAt,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Draft save failed.";
    const status = msg.includes("TERMINATED") || msg.includes("terminated") ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

