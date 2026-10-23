import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import {
  getCompetitionSettings,
  updateCompetitionSettings,
} from "@/lib/services/settings-service";
import { stopAllActiveExams } from "@/lib/services/exam-service";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * GET /api/admin/competition/toggle
 * Returns current status of competition and whether it is actively LIVE.
 */
export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status, headers: NO_CACHE_HEADERS });
    }

    const settings = await getCompetitionSettings();
    return NextResponse.json(
      {
        success: true,
        status: settings.status,
        isTestLive: settings.status === "in_progress",
        settings,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch competition status.";
    return NextResponse.json({ error: message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

/**
 * POST /api/admin/competition/toggle
 * Starts or stops the examination live across the entire college.
 * Body: { action: "start" | "stop" }
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action !== "start" && action !== "stop") {
      return NextResponse.json(
        { error: "Invalid action. Expected 'start' or 'stop'." },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const current = await getCompetitionSettings();

    if (action === "start") {
      // 1. Commences examination: status -> in_progress
      const updated = await updateCompetitionSettings(
        {
          status: "in_progress",
          registration_status: "closed",
        },
        { id: auth.user.id, email: auth.user.email }
      );

      await logAuditEvent({
        actorId: auth.user.id,
        actorEmail: auth.user.email,
        action: "COMPETITION_STARTED_BY_ADMIN",
        targetResource: `competition_settings:${current.id}`,
        details: { previousStatus: current.status, newStatus: "in_progress" },
        ipAddress,
      });

      return NextResponse.json({
        success: true,
        action: "start",
        status: "in_progress",
        isTestLive: true,
        message: "Examination successfully STARTED! All registered students can now begin their tests.",
        settings: updated,
      });
    }

    if (action === "stop") {
      // 2. Concludes examination: status -> completed
      const updated = await updateCompetitionSettings(
        {
          status: "completed",
        },
        { id: auth.user.id, email: auth.user.email }
      );

      // Auto-submit and score all in-progress student exams so no student's work is lost
      const autoCloseResult = await stopAllActiveExams();

      await logAuditEvent({
        actorId: auth.user.id,
        actorEmail: auth.user.email,
        action: "COMPETITION_STOPPED_BY_ADMIN",
        targetResource: `competition_settings:${current.id}`,
        details: {
          previousStatus: current.status,
          newStatus: "completed",
          closedPhase1: autoCloseResult.closedPhase1,
          closedPhase2: autoCloseResult.closedPhase2,
        },
        ipAddress,
      });

      return NextResponse.json({
        success: true,
        action: "stop",
        status: "completed",
        isTestLive: false,
        closedExams: autoCloseResult,
        message: `Examination STOPPED! Auto-closed and recorded scores for ${autoCloseResult.closedPhase1} Phase 1 and ${autoCloseResult.closedPhase2} Phase 2 active student sessions. Students have been locked out from taking or submitting further tests.`,
        settings: updated,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("POST /api/admin/competition/toggle error:", error);
    const message = error instanceof Error ? error.message : "Failed to toggle competition status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

