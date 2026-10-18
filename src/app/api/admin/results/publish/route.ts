import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { publishResults } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/results/publish
 * Toggles publication state of all finalized results.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    if (typeof body.publish !== "boolean") {
      return NextResponse.json(
        { error: "Invalid payload: 'publish' boolean is required." },
        { status: 400 }
      );
    }

    const res = await publishResults(body.publish);

    return NextResponse.json({
      message: body.publish
        ? `Official results successfully published for ${res.count} candidates.`
        : `Official results unpublished. Access restricted to administrators.`,
      ...res,
    });
  } catch (error: unknown) {
    console.error("POST /api/admin/results/publish error:", error);
    const message = error instanceof Error ? error.message : "Failed to toggle result publication.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

