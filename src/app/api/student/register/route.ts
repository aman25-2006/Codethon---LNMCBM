import { NextRequest, NextResponse } from "next/server";
import { submitRegistrationRequest } from "@/lib/services/registration-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/register
 * Public registration endpoint for prospective participants.
 * All fields are mandatory. File size limit is 2 MB.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid registration payload. Please fill out all fields." },
        { status: 400 }
      );
    }

    const {
      full_name,
      roll_number,
      email,
      department,
      semester,
      mobile,
      id_card_data,
      id_card_mime,
    } = body;

    const result = await submitRegistrationRequest({
      full_name,
      roll_number,
      email,
      department,
      semester,
      mobile,
      id_card_data,
      id_card_mime,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      id: result.id,
      student: result.student,
      emailDispatched: result.emailDispatched,
    });
  } catch (error: unknown) {
    console.error("POST /api/student/register error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to submit registration request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

