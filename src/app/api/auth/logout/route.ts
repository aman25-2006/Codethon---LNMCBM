import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const bootstrapCookie = cookieStore.get("lnmcbm_admin_session");
    let actorEmail = "admin@lnmcbm.ac.in";
    let actorId: string | undefined;

    if (bootstrapCookie?.value) {
      try {
        const parsed = JSON.parse(bootstrapCookie.value);
        actorEmail = parsed.email || actorEmail;
        actorId = parsed.id;
      } catch {
        // ignore parse error
      }
      cookieStore.delete("lnmcbm_admin_session");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes("your-project-id")) {
      const supabase = createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        actorEmail = user.email || actorEmail;
        actorId = user.id;
      }
      await supabase.auth.signOut();
    }

    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    await logAuditEvent({
      actorId,
      actorEmail,
      action: "ADMIN_LOGOUT",
      targetResource: "/api/auth/logout",
      ipAddress,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.delete("lnmcbm_admin_session");
    return response;
  } catch (error) {
    console.error("Logout exception:", error);
    const response = NextResponse.json({ success: true });
    response.cookies.delete("lnmcbm_admin_session");
    return response;
  }
}
