import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { bulkImportQuestions, RawMCQCSVRow } from "@/lib/services/questions-service";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/questions/import
 * Ingest an array of parsed CSV rows into the question bank.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const rows = body.rows as RawMCQCSVRow[];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No question rows provided for bulk import." },
        { status: 400 }
      );
    }

    const summary = await bulkImportQuestions(rows);

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "BULK_IMPORT_MCQ_QUESTIONS",
      targetResource: "question_bank:bulk-import",
      details: {
        totalRows: summary.totalRows,
        importedCount: summary.importedCount,
        failedCount: summary.failedCount,
      },
    });

    return NextResponse.json({ success: true, summary });
  } catch (error: unknown) {
    console.error("POST /api/admin/questions/import error:", error);
    const message = error instanceof Error ? error.message : "Failed to import questions.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
