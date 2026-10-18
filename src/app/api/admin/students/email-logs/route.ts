import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { getEmailDeliveryLogs } from "@/lib/services/credentials-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/students/email-logs
 * Retrieve email delivery logs for the admin monitoring dashboard.
 */
export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const logs = await getEmailDeliveryLogs();
    return NextResponse.json({ logs });
  } catch (error: unknown) {
    console.error("GET email-logs API error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch email logs.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

