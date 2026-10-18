import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { getQuestions, createQuestion } from "@/lib/services/questions-service";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/questions
 * Retrieve all questions with filtering and readiness metrics.
 */
export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const data = await getQuestions({ search, category, status });
    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    console.error("GET /api/admin/questions error:", error);
    const message = error instanceof Error ? error.message : "Failed to retrieve questions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/questions
 * Create a new MCQ question with 4 options and answer key.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const {
      category,
      question_text,
      code_snippet,
      case_study_passage,
      marks,
      is_active,
      options,
      correct_option,
      explanation,
    } = body;

    const question = await createQuestion({
      category,
      question_text,
      code_snippet,
      case_study_passage,
      marks,
      is_active,
      options,
      correct_option,
      explanation,
    });

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "CREATE_MCQ_QUESTION",
      targetResource: `question:${question.id}`,
      details: {
        category: question.category,
        marks: question.marks,
        question_text_preview: question.question_text.substring(0, 50),
      },
    });

    return NextResponse.json({ success: true, question }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/admin/questions error:", error);
    const message = error instanceof Error ? error.message : "Failed to create question.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
