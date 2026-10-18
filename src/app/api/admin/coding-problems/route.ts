import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { getAllCodingProblems, getCategoryConfigurations } from "@/lib/services/coding-problems-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/coding-problems
 * Returns all coding problems and category track configurations.
 */
export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const problems = await getAllCodingProblems();
    const categories = await getCategoryConfigurations();

    return NextResponse.json({
      success: true,
      problems,
      categories,
    });
  } catch (error: unknown) {
    console.error("GET /api/admin/coding-problems error:", error);
    const message = error instanceof Error ? error.message : "Failed to load coding problems.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

