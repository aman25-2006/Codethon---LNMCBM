import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("lnmcbm_student_session");

    if (sessionCookie?.value) {
      let parsed: any = null;
      try {
        parsed = JSON.parse(sessionCookie.value);
      } catch {
        try {
          parsed = JSON.parse(decodeURIComponent(sessionCookie.value));
        } catch {
          // ignore
        }
      }

      if (parsed && parsed.id && parsed.roll_number) {
        return NextResponse.json({
          authenticated: true,
          student: {
            id: parsed.id,
            roll_number: parsed.roll_number,
            full_name: parsed.full_name,
            course: parsed.course,
            participant_id: parsed.participant_id,
          },
        });
      }
    }

    // Supabase auth fallback
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes("your-project-id")) {
      const supabase = createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: student } = await supabase
          .from("students")
          .select("id, roll_number, full_name, course, participant_id")
          .eq("auth_user_id", user.id)
          .single();

        if (student) {
          return NextResponse.json({
            authenticated: true,
            student,
          });
        }
      }
    }

    return NextResponse.json(
      { authenticated: false, error: "No active candidate session found." },
      { status: 401 }
    );
  } catch (error: unknown) {
    console.error("GET /api/student/me error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

