import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { getAdminResultsList } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/results
 * Returns enriched list of all student attempts, scores, ranks, and publication status.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const course = searchParams.get("course") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const data = await getAdminResultsList({
      search,
      course,
      status,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/results error:", error);
    const message = error instanceof Error ? error.message : "Failed to load results.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

