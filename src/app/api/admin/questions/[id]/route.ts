import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { getQuestionById, updateQuestion, deleteQuestion } from "@/lib/services/questions-service";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/admin/questions/[id]
 * Retrieve a single question record with its options and answer key.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const question = await getQuestionById(id);
    if (!question) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, question });
  } catch (error: unknown) {
    console.error("GET /api/admin/questions/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to retrieve question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/questions/[id]
 * Update question fields, options, or answer key.
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await request.json();

    const updated = await updateQuestion(id, body);

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "UPDATE_MCQ_QUESTION",
      targetResource: `question:${id}`,
      details: {
        category: updated.category,
        is_active: updated.is_active,
        marks: updated.marks,
      },
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (error: unknown) {
    console.error("PUT /api/admin/questions/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to update question.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * PATCH /api/admin/questions/[id]
 * Quick toggle status or partial updates.
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  return PUT(request, { params });
}

/**
 * DELETE /api/admin/questions/[id]
 * Delete a question.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    await deleteQuestion(id);

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "DELETE_MCQ_QUESTION",
      targetResource: `question:${id}`,
      details: { id },
    });

    return NextResponse.json({ success: true, message: "Question successfully deleted." });
  } catch (error: unknown) {
    console.error("DELETE /api/admin/questions/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete question.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
