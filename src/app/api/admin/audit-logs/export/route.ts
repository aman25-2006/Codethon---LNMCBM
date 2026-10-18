import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { getAuditLogs, generateAuditLogsCsv } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/audit-logs/export
 * Downloads sanitized CSV of audit logs with formula injection protection and UTF-8 BOM.
 */
export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { logs } = await getAuditLogs({ limit: 10000 });
    const csvData = generateAuditLogsCsv(logs);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `LNMCBM_Security_Audit_Logs_${timestamp}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/audit-logs/export error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate audit log CSV export.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

