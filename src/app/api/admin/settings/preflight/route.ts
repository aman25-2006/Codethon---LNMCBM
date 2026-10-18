import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { checkCompetitionPreflight } from "@/lib/services/settings-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/settings/preflight
 * Evaluates the 8-point competition readiness checklist prior to marking ready or starting.
 */
export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const preflight = await checkCompetitionPreflight();

    return NextResponse.json({
      success: true,
      ...preflight,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/settings/preflight error:", error);
    const message = error instanceof Error ? error.message : "Failed to run preflight verification.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

