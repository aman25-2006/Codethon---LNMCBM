import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { getAdminResultsList, generateResultsCsv } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/results/export
 * Downloads sanitized CSV of all results with formula injection escaping and UTF-8 BOM.
 */
export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { results } = await getAdminResultsList({ limit: 10000 });
    const csvData = generateResultsCsv(results);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `LNMCBM_Codethon_2026_Merit_List_${timestamp}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/results/export error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate CSV export.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

