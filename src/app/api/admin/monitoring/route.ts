import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { getAllMonitoringSessions } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/monitoring
 * Returns all active and historic candidate exam sessions with real-time proctoring metrics.
 */
export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const data = await getAllMonitoringSessions();

    return NextResponse.json({
      success: true,
      sessions: data.sessions,
      summary: data.summary,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/monitoring error:", error);
    const message = error instanceof Error ? error.message : "Failed to load monitoring data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

