import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/audit";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Validate Input
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Please enter your administrator email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      return NextResponse.json(
        { error: "Please enter your administrator password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project-id");

    // --------------------------------------------------------------------------
    // CASE A: Supabase Remote Project Not Yet Configured
    // Support safe bootstrap credentials from local environment variables
    // --------------------------------------------------------------------------
    if (!isSupabaseConfigured) {
      const bootstrapEmail = (process.env.ADMIN_INITIAL_EMAIL || "admin@lnmcbm.ac.in").toLowerCase();
      const bootstrapPassword = process.env.ADMIN_INITIAL_PASSWORD || "AdminLNMCBM2026!";

      if (cleanEmail === bootstrapEmail && password === bootstrapPassword) {
        const response = NextResponse.json({
          success: true,
          user: {
            id: "bootstrap-admin-uuid",
            email: cleanEmail,
            name: "System Exam Controller (Bootstrap)",
            role: "admin",
          },
        });

        response.cookies.set("lnmcbm_admin_session", JSON.stringify({
          id: "bootstrap-admin-uuid",
          email: cleanEmail,
          role: "admin",
          name: "System Exam Controller (Bootstrap)",
          issuedAt: Date.now(),
        }), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" && (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https"),
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 8, // 8 hours
        });

        await logAuditEvent({
          actorEmail: cleanEmail,
          action: "ADMIN_LOGIN_SUCCESS_BOOTSTRAP",
          targetResource: "/login/admin",
          details: { mode: "local_bootstrap" },
          ipAddress,
        });

        return response;
      }

      await logAuditEvent({
        actorEmail: cleanEmail,
        action: "ADMIN_LOGIN_FAILED_BOOTSTRAP",
        targetResource: "/login/admin",
        details: { mode: "local_bootstrap", reason: "Invalid credentials" },
        ipAddress,
      });

      return NextResponse.json(
        {
          error:
            "Invalid credentials. Please verify your administrator email and password. (Check ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD in your .env.local file)",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------------------------------
    // CASE B: Live Remote Supabase Authentication
    // --------------------------------------------------------------------------
    const supabase = createServerSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError || !authData?.user) {
      await logAuditEvent({
        actorEmail: cleanEmail,
        action: "ADMIN_LOGIN_FAILED",
        targetResource: "/login/admin",
        details: { error: authError?.message || "Unknown auth error" },
        ipAddress,
      });

      return NextResponse.json(
        { error: "Invalid administrator credentials. Please check your email and password." },
        { status: 401 }
      );
    }

    // Check user role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Administrator profile not found in database. Contact system administrator." },
        { status: 403 }
      );
    }

    // Verify role is strictly 'admin'
    if (profile.role !== "admin") {
      // Ordinary student account trying to access admin console: reject & sign out immediately
      await supabase.auth.signOut();

      await logAuditEvent({
        actorId: authData.user.id,
        actorEmail: cleanEmail,
        action: "UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT",
        targetResource: "/login/admin",
        details: { detectedRole: profile.role },
        ipAddress,
      });

      return NextResponse.json(
        {
          error:
            "Access Denied: This account has Student privileges and is not authorized to access the administrator console.",
          isStudent: true,
        },
        { status: 403 }
      );
    }

    // Successful Admin Login
    await logAuditEvent({
      actorId: authData.user.id,
      actorEmail: cleanEmail,
      action: "ADMIN_LOGIN_SUCCESS",
      targetResource: "/login/admin",
      ipAddress,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: profile.full_name,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login API exception:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during authentication." },
      { status: 500 }
    );
  }
}
