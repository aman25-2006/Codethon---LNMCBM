import { NextResponse } from "next/server";
import { getCompetitionSettings } from "@/lib/services/settings-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * GET /api/student/competition-status
 * Lightweight public/student endpoint reporting whether the competition is LIVE (in_progress).
 * Used by candidate dashboards and exam runners for real-time start/stop synchronization.
 */
export async function GET() {
  try {
    const settings = await getCompetitionSettings();
    const isTestLive = settings.status === "in_progress";

    return NextResponse.json(
      {
        success: true,
        status: settings.status,
        isTestLive,
        competitionName: settings.competition_name,
        collegeName: settings.college_name,
        competitionDate: settings.competition_date,
        phase1DurationMinutes: settings.phase1_duration_minutes,
        phase2DurationMinutes: settings.phase2_duration_minutes,
        serverTime: new Date().toISOString(),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("GET /api/student/competition-status error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "draft",
        isTestLive: false,
        error: "Failed to query competition status.",
      },
      {
        status: 500,
        headers: NO_CACHE_HEADERS,
      }
    );
  }
}

