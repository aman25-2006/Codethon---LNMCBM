import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const bootstrapCookie = cookieStore.get("lnmcbm_admin_session");

    // Check bootstrap cookie
    if (bootstrapCookie?.value) {
      try {
        const parsed = JSON.parse(bootstrapCookie.value);
        if (parsed.role === "admin") {
          return NextResponse.json({
            authenticated: true,
            user: {
              id: parsed.id,
              email: parsed.email,
              name: parsed.name,
              role: "admin",
            },
          });
        }
      } catch {
        // invalid cookie
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes("your-project-id")) {
      const supabase = createServerSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json({ authenticated: false, error: "Unauthorized" }, { status: 401 });
      }

      // Query profiles for role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        return NextResponse.json({ authenticated: false, error: "Forbidden: Admin privileges required" }, { status: 403 });
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: profile.full_name,
          role: "admin",
        },
      });
    }

    return NextResponse.json({ authenticated: false, error: "No active administrator session" }, { status: 401 });
  } catch (error) {
    console.error("Admin verification API error:", error);
    return NextResponse.json({ authenticated: false, error: "Internal server error" }, { status: 500 });
  }
}

