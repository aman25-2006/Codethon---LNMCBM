import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { getCategoryConfigurations } from "@/lib/services/coding-problems-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/student/exam/phase2/categories
 * Retrieves the 6 Phase 2 tracks and their live configuration / readiness statuses.
 */
export async function GET() {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const categories = await getCategoryConfigurations();

    return NextResponse.json({
      success: true,
      student: auth.student,
      categories,
    });
  } catch (error: unknown) {
    console.error("GET /api/student/exam/phase2/categories error:", error);
    const message = error instanceof Error ? error.message : "Failed to load Phase 2 categories.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

