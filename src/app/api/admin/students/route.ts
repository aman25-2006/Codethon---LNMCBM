import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { getStudents, createStudent } from "@/lib/services/students-service";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/students
 * Retrieve student roster and operational metrics.
 */
export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const course = searchParams.get("course") || "";
    const status = searchParams.get("status") || "";

    const data = await getStudents({ search, course, status });
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("GET /api/admin/students error:", error);
    const message = error instanceof Error ? error.message : "Failed to retrieve student directory.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/students
 * Register a single candidate manually.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { full_name, roll_number, course, email, mobile } = body;

    const student = await createStudent({
      full_name,
      roll_number,
      course,
      email,
      mobile,
    });

    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "STUDENT_CREATED",
      targetResource: `/admin/students/${student.id}`,
      details: {
        studentId: student.id,
        participantId: student.participant_id,
        rollNumber: student.roll_number,
        email: student.email,
        course: student.course,
      },
      ipAddress,
    });

    return NextResponse.json({ success: true, student }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/admin/students error:", error);
    const message = error instanceof Error ? error.message : "Failed to register candidate.";
    const status = message.includes("already registered") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

