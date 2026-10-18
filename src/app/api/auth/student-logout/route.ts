import { NextResponse } from "next/server";
import { logAuditEvent } from "@/lib/audit";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("lnmcbm_student_session");
    let rollNumber = "Unknown";

    if (sessionCookie?.value) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sessionCookie.value));
        rollNumber = parsed.roll_number || rollNumber;
      } catch {
        // ignore
      }
    }

    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    await logAuditEvent({
      actorEmail: rollNumber,
      action: "STUDENT_LOGOUT",
      targetResource: "/login/student",
      ipAddress,
    });

    const response = NextResponse.json({ success: true, message: "Logged out successfully." });

    response.cookies.set("lnmcbm_student_session", "", {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production" &&
        (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https"),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: unknown) {
    console.error("Student logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}

