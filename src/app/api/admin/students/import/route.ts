import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { bulkImportStudents, RawCSVRow } from "@/lib/services/students-service";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/students/import
 * Bulk import validated student records.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const rows = (body?.rows || []) as RawCSVRow[];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No records submitted for import." },
        { status: 400 }
      );
    }

    if (rows.length > 500) {
      return NextResponse.json(
        { error: "Exceeded batch import maximum limit (500 rows per upload)." },
        { status: 400 }
      );
    }

    const summary = await bulkImportStudents(rows);

    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "STUDENTS_BULK_IMPORTED",
      targetResource: "/admin/students/import",
      details: {
        totalRows: summary.totalRows,
        imported: summary.importedCount,
        skipped: summary.skippedCount,
        failed: summary.failedCount,
      },
      ipAddress,
    });

    return NextResponse.json({ success: true, summary });
  } catch (error: unknown) {
    console.error("Bulk student import error:", error);
    const message = error instanceof Error ? error.message : "Failed to execute bulk import.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

