import { NextResponse } from "next/server";
import { verifyStudent } from "@/lib/auth-guard";
import { saveCandidateAnswer } from "@/lib/services/exam-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/exam/save-answer
 * Debounced persistence of student MCQ choices and review flags.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyStudent();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const {
      question_id,
      selected_option_id,
      selected_option_key,
      is_marked_for_review,
      question_order_index,
    } = body;

    if (!question_id) {
      return NextResponse.json({ error: "question_id is required." }, { status: 400 });
    }

    const result = await saveCandidateAnswer(auth.student.id, {
      question_id,
      selected_option_id: selected_option_id || null,
      selected_option_key: selected_option_key || null,
      is_marked_for_review: Boolean(is_marked_for_review),
      question_order_index: typeof question_order_index === "number" ? question_order_index : 0,
    });

    return NextResponse.json({ ...result });
  } catch (error: unknown) {
    console.error("POST /api/student/exam/save-answer error:", error);
    const message = error instanceof Error ? error.message : "Failed to save answer.";
    const status = message.includes("EXAM_EXPIRED")
      ? 410
      : message.includes("TERMINATED") || message.includes("terminated")
      ? 403
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
