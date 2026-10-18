import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { startPhase2 } from "@/lib/services/exam-service";
import { CodingCategory } from "@/lib/services/coding-problems-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/exam/phase2/start
 * Locks the candidate's chosen category/language and initializes the 30-minute Phase 2 timer.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const category = body.category as CodingCategory;
    const language = body.language as string | undefined;

    if (!category) {
      return NextResponse.json(
        { error: "A valid coding category must be designated." },
        { status: 400 }
      );
    }

    const phase2State = await startPhase2(auth.student.id, category, language);

    return NextResponse.json({
      success: true,
      student: auth.student,
      ...phase2State,
    });
  } catch (error: unknown) {
    console.error("POST /api/student/exam/phase2/start error:", error);
    const message = error instanceof Error ? error.message : "Failed to start Phase 2.";
    const status = message.includes("TERMINATED") || message.includes("terminated") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

