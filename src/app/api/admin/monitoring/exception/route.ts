import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { grantTechnicalException } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/monitoring/exception
 * Grants an administrative recovery exception for a candidate and unblocks access.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.sessionId || !body.reason) {
      return NextResponse.json(
        { error: "sessionId and an explicit justification reason are required." },
        { status: 400 }
      );
    }

    const { sessionId, reason } = body;

    const result = await grantTechnicalException(
      { id: auth.user.id, email: auth.user.email },
      sessionId,
      reason
    );

    return NextResponse.json({
      success: true,
      message: result.message,
      session: result.session,
    });
  } catch (error: unknown) {
    console.error("POST /api/admin/monitoring/exception error:", error);
    const message = error instanceof Error ? error.message : "Failed to grant technical exception.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

