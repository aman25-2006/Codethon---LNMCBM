import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { getSessionMonitoringTimeline } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/monitoring/[sessionId]/events
 * Retrieves chronological integrity incident timeline for an individual candidate attempt.
 */
export async function GET(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { sessionId } = params;
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }

    const events = await getSessionMonitoringTimeline(sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      events,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/monitoring/[sessionId]/events error:", error);
    const message = error instanceof Error ? error.message : "Failed to load timeline events.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

