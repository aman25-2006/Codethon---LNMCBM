import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { getAuditLogs } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/audit-logs
 * Retrieves immutable administrative audit trail records with filtering and pagination.
 */
export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const action = searchParams.get("action") || "";
    const outcome = searchParams.get("outcome") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { logs, total } = await getAuditLogs({
      search,
      action,
      outcome,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      logs,
      total,
      limit,
      offset,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/audit-logs error:", error);
    const message = error instanceof Error ? error.message : "Failed to retrieve audit trail.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

