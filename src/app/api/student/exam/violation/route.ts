import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { recordMonitoringEvent } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/exam/violation
 * Logs academic integrity incidents (fullscreen exits, tab switches, window blurs).
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const eventType = body.eventType || "fullscreen_exit";
    const metadata = body.metadata || {};

    const result = await recordMonitoringEvent(auth.student.id, eventType, metadata);

    return NextResponse.json({
      success: true,
      warningsCount: result.warningsCount,
      isTerminated: result.isTerminated,
      remainingStrikes: result.remainingStrikes,
      threshold: result.threshold,
      deduplicated: Boolean(result.deduplicated),
      terminationReason: result.terminationReason || null,
    });
  } catch (error: unknown) {
    console.error("POST /api/student/exam/violation error:", error);
    const message = error instanceof Error ? error.message : "Failed to record violation event.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

