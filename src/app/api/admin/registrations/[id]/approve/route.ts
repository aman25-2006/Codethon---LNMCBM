import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { approveRegistrationRequest } from "@/lib/services/registration-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/registrations/[id]/approve
 * Approves a registration request, generates candidate credentials,
 * and immediately sends the login credentials email to the student.
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

    const result = await approveRegistrationRequest(id);

    return NextResponse.json({
      ...result,
      message: `Registration approved successfully! Login credentials have been generated and emailed to ${result.student.email}.`,
    });
  } catch (error: unknown) {
    console.error("POST /api/admin/registrations/[id]/approve error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to approve registration.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

