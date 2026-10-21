import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { preloadOfficialSeedQuestions, getQuestions } from "@/lib/services/questions-service";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/questions/seed
 * Seed the official 40-question, 80-mark LNMCBM curriculum into the database.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let reset = false;
    let trackParam: string | undefined = undefined;
    try {
      const url = new URL(request.url);
      trackParam = url.searchParams.get("track") || undefined;
      if (url.searchParams.get("reset") === "true") {
        reset = true;
      } else {
        const body = await request.json().catch(() => ({}));
        if (body?.reset) reset = true;
        if (body?.track) trackParam = body.track;
      }
    } catch {
      // no-op
    }

    const result = await preloadOfficialSeedQuestions({ reset, track: trackParam });
    const { metrics } = await getQuestions({ track: trackParam });

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "SEED_OFFICIAL_QUESTIONS",
      targetResource: "question_bank:curriculum-seed",
      details: {
        seededCount: result.count,
        totalMarks: metrics.totalMarks,
        isValidExamSet: metrics.isValidExamSet,
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      metrics,
      message: `Successfully seeded ${result.count} official curriculum questions (80 Marks).`,
    });
  } catch (error: unknown) {
    console.error("POST /api/admin/questions/seed error:", error);
    const message = error instanceof Error ? error.message : "Failed to seed official questions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
