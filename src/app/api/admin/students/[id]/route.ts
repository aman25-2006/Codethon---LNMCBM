import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import {
  getStudentById,
  updateStudent,
  deleteStudent,
} from "@/lib/services/students-service";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/students/[id]
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const student = await getStudentById(params.id);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/students/[id]
 * Update permitted candidate fields.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const updated = await updateStudent(params.id, body);

    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "STUDENT_UPDATED",
      targetResource: `/admin/students/${params.id}`,
      details: {
        updatedFields: Object.keys(body),
        participantId: updated.participant_id,
        rollNumber: updated.roll_number,
      },
      ipAddress,
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update student.";
    const status = message.includes("already in use") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * PATCH /api/admin/students/[id]
 * Toggle active/inactive status.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    if (typeof body.is_active !== "boolean") {
      return NextResponse.json(
        { error: "Field 'is_active' (boolean) is required." },
        { status: 400 }
      );
    }

    const updated = await updateStudent(params.id, { is_active: body.is_active });

    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "STUDENT_STATUS_TOGGLED",
      targetResource: `/admin/students/${params.id}`,
      details: {
        isActive: body.is_active,
        participantId: updated.participant_id,
        rollNumber: updated.roll_number,
      },
      ipAddress,
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle student status.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/students/[id]
 * Remove student record.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const existing = await getStudentById(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    await deleteStudent(params.id);

    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "STUDENT_DELETED",
      targetResource: `/admin/students/${params.id}`,
      details: {
        participantId: existing.participant_id,
        rollNumber: existing.roll_number,
        name: existing.full_name,
      },
      ipAddress,
    });

    return NextResponse.json({ success: true, message: "Student deleted successfully." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete student.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

