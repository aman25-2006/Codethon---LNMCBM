import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { runPhase2SampleTest } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/exam/phase2/run
 *
 * Runs candidate code against the problem's public sample input.
 * 1. Requires valid student authentication.
 * 2. Rate-limited to prevent abuse (minimum 1.5s interval).
 * 3. Enforces 30-minute exam deadline.
 * 4. Zero hidden test cases executed.
 * 5. Zero marks awarded.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.problem_id || body.source_code === undefined) {
      return NextResponse.json(
        { error: "problem_id and source_code are required." },
        { status: 400 }
      );
    }

    const { problem_id, source_code, language } = body;

    const result = await runPhase2SampleTest(
      auth.student.id,
      problem_id,
      source_code,
      language
    );

    return NextResponse.json({
      ...result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Code execution failed.";
    if (msg.includes("TERMINATED") || msg.includes("terminated")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    if (msg.includes("Rate limit exceeded")) {
      return NextResponse.json({ error: msg }, { status: 429 });
    }
    if (msg.includes("deadline has expired") || msg.includes("not currently in progress")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

