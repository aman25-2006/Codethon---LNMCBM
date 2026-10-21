import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { rejectRegistrationRequest } from "@/lib/services/registration-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/registrations/[id]/reject
 * Rejects a candidate registration request.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Registration ID is required." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = body?.reason;

    const result = await rejectRegistrationRequest(id, reason);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: unknown) {
    console.error("POST /api/admin/registrations/[id]/reject error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to reject registration.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

