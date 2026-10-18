import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { preloadOfficialCodingProblems } from "@/lib/services/coding-problems-service";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/coding-problems/seed
 * Preload the official Phase 2 coding curriculum across all categories and DSA language tracks.
 */
export async function POST() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const result = await preloadOfficialCodingProblems();

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "SEED_CODING_PROBLEMS",
      targetResource: "coding_problems:curriculum-seed",
      details: { seededCount: result.count },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Successfully seeded ${result.count} official coding problems across all tracks.`,
    });
  } catch (error: unknown) {
    console.error("POST /api/admin/coding-problems/seed error:", error);
    const message = error instanceof Error ? error.message : "Failed to seed coding problems.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

