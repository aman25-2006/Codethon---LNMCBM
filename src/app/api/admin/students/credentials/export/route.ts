import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { bulkIssueCredentials } from "@/lib/services/credentials-service";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/students/credentials/export
 * One-time secure credential export for exam invigilators.
 * Available strictly to authenticated administrators.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Generate/refresh temporary credentials for all active candidates (without sending emails)
    const { results } = await bulkIssueCredentials({ sendEmail: false });

    if (results.length === 0) {
      return NextResponse.json(
        { error: "No active candidate records found to export." },
        { status: 400 }
      );
    }

    const headers = [
      "Roll Number",
      "Full Name",
      "Course",
      "Participant ID",
      "Email Address",
      "Temporary Password",
    ];

    const rows = results.map((r) => [
      `"${r.roll_number}"`,
      `"${r.full_name.replace(/"/g, '""')}"`,
      `"Candidate"`,
      `"${r.participant_id}"`,
      `"${r.email}"`,
      `"${r.temporaryPassword || "N/A"}"`,
    ]);

    const csvContent =
      "# CONFIDENTIAL DOCUMENT — LNMCBM CODING COMPETITION INVIGILATOR ROSTER\r\n" +
      "# WARNING: Destroy or store securely after competition check-in.\r\n" +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "INVIGILATOR_CREDENTIALS_EXPORTED",
      targetResource: "/admin/students/credentials/export",
      details: {
        exportedCount: results.length,
      },
      ipAddress,
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="lnmcbm_invigilator_credentials_${
          new Date().toISOString().split("T")[0]
        }.csv"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: unknown) {
    console.error("Export invigilator credentials error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to export invigilator credentials.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

