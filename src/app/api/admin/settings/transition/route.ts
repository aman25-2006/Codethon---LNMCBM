import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { transitionCompetitionStatus } from "@/lib/services/settings-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/settings/transition
 * Executes a controlled state transition across the competition lifecycle with preflight verification.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { target_status, justification, force } = body;

    if (!target_status) {
      return NextResponse.json(
        { error: "Target competition status is required." },
        { status: 400 }
      );
    }

    const updated = await transitionCompetitionStatus(
      target_status,
      { id: auth.user.id, email: auth.user.email },
      { force, justification }
    );

    return NextResponse.json({
      success: true,
      settings: updated,
      message: `Competition state successfully transitioned to: ${target_status}.`,
    });
  } catch (error: unknown) {
    console.error("POST /api/admin/settings/transition error:", error);
    const message = error instanceof Error ? error.message : "Failed to transition competition state.";
    let status = 400;
    if (message.includes("PREFLIGHT_CHECK_FAILED")) status = 422;
    if (message.includes("INVALID_STATE_TRANSITION")) status = 400;
    return NextResponse.json({ error: message }, { status });
  }
}

