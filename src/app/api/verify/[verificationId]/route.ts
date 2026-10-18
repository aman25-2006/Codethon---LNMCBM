import { NextRequest, NextResponse } from "next/server";
import { getPublicVerificationScorecard } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/verify/[verificationId]
 * Public endpoint to verify scorecard authenticity by unique verification ID.
 * Returns only certified, sanitized public data (no private contact or credentials).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { verificationId: string } }
) {
  try {
    const verificationId = params.verificationId;
    if (!verificationId) {
      return NextResponse.json(
        { is_valid: false, message: "Verification identifier is required." },
        { status: 400 }
      );
    }

    const verification = await getPublicVerificationScorecard(verificationId);

    if (!verification.is_valid) {
      return NextResponse.json(verification, { status: 404 });
    }

    return NextResponse.json(verification, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/verify/[verificationId] error:", error);
    const message = error instanceof Error ? error.message : "Verification lookup failed.";
    return NextResponse.json({ is_valid: false, message }, { status: 500 });
  }
}

