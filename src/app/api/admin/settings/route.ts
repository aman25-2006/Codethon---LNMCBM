import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import {
  getCompetitionSettings,
  updateCompetitionSettings,
  getActiveExamsCount,
} from "@/lib/services/settings-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/settings
 * Retrieves global competition settings, active exam counts, and operational parameters.
 */
export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const settings = await getCompetitionSettings();
    const activeExams = await getActiveExamsCount();

    return NextResponse.json({
      success: true,
      settings,
      activeExams,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/settings error:", error);
    const message = error instanceof Error ? error.message : "Failed to load competition settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/settings
 * Updates global competition parameters with strict range validation and active exam protection.
 */
export async function PUT(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const updates = body.updates || body;
    const { forceEmergencyBypass, justification } = body;

    const updated = await updateCompetitionSettings(
      updates,
      { id: auth.user.id, email: auth.user.email },
      { forceEmergencyBypass, justification }
    );

    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Competition settings saved successfully.",
    });
  } catch (error: unknown) {
    console.error("PUT /api/admin/settings error:", error);
    const message = error instanceof Error ? error.message : "Failed to update competition settings.";
    const status = message.includes("ACTIVE_EXAM_PROTECTION") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

