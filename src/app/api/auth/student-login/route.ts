import { NextResponse } from "next/server";
import { authenticateStudent } from "@/lib/services/credentials-service";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/student-login
 * Student examination authentication via Roll Number and Temporary Password.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roll_number, password } = body;

    if (!roll_number || typeof roll_number !== "string" || !roll_number.trim()) {
      return NextResponse.json(
        { error: "Please enter your assigned College Roll Number." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      return NextResponse.json(
        { error: "Please enter your assigned temporary password." },
        { status: 400 }
      );
    }

    const cleanRoll = roll_number.trim();
    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    const authResult = await authenticateStudent(cleanRoll, password.trim());

    if (!authResult.success || !authResult.student) {
      await logAuditEvent({
        actorEmail: cleanRoll,
        action: "STUDENT_LOGIN_FAILED",
        targetResource: "/login/student",
        details: { rollNumber: cleanRoll, reason: authResult.error },
        ipAddress,
      });

      const statusCode = authResult.error?.includes("Suspended") ? 403 : 401;
      return NextResponse.json(
        { error: authResult.error || "Invalid Roll Number or Password." },
        { status: statusCode }
      );
    }

    const student = authResult.student;

    // Attach student session cookie
    const response = NextResponse.json({
      success: true,
      student: {
        id: student.id,
        roll_number: student.roll_number,
        full_name: student.full_name,
        course: student.course,
        participant_id: student.participant_id,
      },
    });

    response.cookies.set(
      "lnmcbm_student_session",
      JSON.stringify({
        id: student.id,
        auth_user_id: student.auth_user_id,
        roll_number: student.roll_number,
        full_name: student.full_name,
        course: student.course,
        participant_id: student.participant_id,
        issuedAt: Date.now(),
      }),
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production" &&
          (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https"),
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
      }
    );

    await logAuditEvent({
      actorId: student.id,
      actorEmail: student.email,
      action: "STUDENT_LOGIN_SUCCESS",
      targetResource: "/login/student",
      details: {
        participantId: student.participant_id,
        rollNumber: student.roll_number,
      },
      ipAddress,
    });

    return response;
  } catch (error: unknown) {
    console.error("Student login API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please consult the lab invigilator." },
      { status: 500 }
    );
  }
}

