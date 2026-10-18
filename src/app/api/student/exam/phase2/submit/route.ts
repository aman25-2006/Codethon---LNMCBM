import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { submitPhase2Problem } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/exam/phase2/submit
 *
 * Final submission of a single Phase 2 coding problem:
 * 1. Evaluates against 5 hidden test cases on the server (2 marks each, total 10 marks).
 * 2. Enforces one submission per problem (locked permanently after acceptance).
 * 3. Enforces 30-minute exam deadline.
 * 4. STRICT CONFIDENTIALITY: Never returns awarded marks or hidden test data to candidate.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json().catch(() => null);
    const problem_id = body?.problem_id || body?.problemId;
    const source_code = body?.source_code || body?.sourceCode;
    const language = body?.language || body?.selected_language;

    if (!problem_id || !source_code) {
      return NextResponse.json(
        { error: "problem_id and source_code are required." },
        { status: 400 }
      );
    }

    const result = await submitPhase2Problem(
      auth.student.id,
      problem_id,
      source_code,
      language
    );

    return NextResponse.json({
      ...result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Problem submission failed.";
    const status = msg.includes("TERMINATED") || msg.includes("terminated") ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

