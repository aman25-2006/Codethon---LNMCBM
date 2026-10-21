import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { getRegistrationRequests } from "@/lib/services/registration-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/registrations
 * Admin-protected retrieval of student registration requests.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    const data = await getRegistrationRequests({ status, search });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/registrations error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to retrieve registrations.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

