import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import {
  issueStudentCredentials,
  bulkIssueCredentials,
} from "@/lib/services/credentials-service";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/students/credentials
 * Issue or rotate credentials for one student or in bulk.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { studentId, studentIds, sendEmail = true } = body;

    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    // Single student issuance
    if (studentId && typeof studentId === "string") {
      const result = await issueStudentCredentials(studentId, { sendEmail });

      await logAuditEvent({
        actorId: auth.user.id,
        actorEmail: auth.user.email,
        action: "STUDENT_CREDENTIALS_ISSUED",
        targetResource: `/admin/students/${studentId}`,
        details: {
          studentId,
          rollNumber: result.roll_number,
          emailStatus: result.emailStatus,
        },
        ipAddress,
      });

      return NextResponse.json({ success: true, result });
    }

    // Bulk student issuance
    const bulkSummary = await bulkIssueCredentials({
      studentIds: Array.isArray(studentIds) ? studentIds : undefined,
      sendEmail,
    });

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "STUDENT_CREDENTIALS_BULK_ISSUED",
      targetResource: "/admin/students/credentials",
      details: {
        total: bulkSummary.total,
        created: bulkSummary.created,
        emailSent: bulkSummary.emailSent,
        emailFailed: bulkSummary.emailFailed,
      },
      ipAddress,
    });

    return NextResponse.json({ success: true, summary: bulkSummary });
  } catch (error: unknown) {
    console.error("Credentials issuance API error:", error);
    const message = error instanceof Error ? error.message : "Failed to issue student credentials.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

