import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient, isSupabaseLive } from "@/lib/supabase/admin";
import { logAuditEvent } from "@/lib/audit";

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
    const cleanPassword = password.trim();
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    const bootstrapEmail = (process.env.ADMIN_INITIAL_EMAIL || "admin@lnmcbm.ac.in").toLowerCase();
    const bootstrapPassword = process.env.ADMIN_INITIAL_PASSWORD || "AdminLNMCBM2026!";
    const isMasterBootstrap = cleanEmail === bootstrapEmail && cleanPassword === bootstrapPassword;

    // Helper to set both admin session cookie and JSON response
    const createSuccessResponse = (user: { id: string; email: string; name: string; role: string }) => {
      const response = NextResponse.json({
        success: true,
        user,
      });

      response.cookies.set(
        "lnmcbm_admin_session",
        JSON.stringify({
          id: user.id,
          email: user.email,
          role: "admin",
          name: user.name,
          issuedAt: Date.now(),
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" && (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https"),
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 8, // 8 hours
        }
      );

      return response;
    };

    // --------------------------------------------------------------------------
    // CASE A: Master Bootstrap Credentials
    // Instantly authenticates administrator and auto-seeds into Supabase Auth if needed
    // --------------------------------------------------------------------------
    if (isMasterBootstrap) {
      let adminUserId = "bootstrap-admin-uuid";

      if (isSupabaseLive()) {
        try {
          const adminClient = createAdminClient();

          // 1. Check if admin user exists in Supabase auth.users
          const { data: userList } = await adminClient.auth.admin.listUsers();
          const existingUser = userList?.users?.find(
            (u) => u.email?.toLowerCase() === cleanEmail
          );

          if (!existingUser) {
            // Auto-provision admin in Supabase Auth
            const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
              email: cleanEmail,
              password: cleanPassword,
              email_confirm: true,
              user_metadata: { full_name: "Master Exam Controller", role: "admin" },
            });

            if (!createError && newUser?.user) {
              adminUserId = newUser.user.id;
            }
          } else {
            adminUserId = existingUser.id;
            // Ensure password matches bootstrap credential
            await adminClient.auth.admin.updateUserById(adminUserId, {
              password: cleanPassword,
              email_confirm: true,
            });
          }

          // 2. Ensure admin profile exists in public.profiles table
          if (adminUserId && adminUserId !== "bootstrap-admin-uuid") {
            await adminClient.from("profiles").upsert(
              {
                id: adminUserId,
                email: cleanEmail,
                full_name: "Master Exam Controller",
                role: "admin",
              },
              { onConflict: "id" }
            );

            // 3. Establish Supabase Server Client session
            try {
              const supabase = createServerSupabaseClient();
              await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: cleanPassword,
              });
            } catch (authErr) {
              console.warn("Supabase SSR signIn warning:", authErr);
            }
          }
        } catch (dbErr) {
          console.warn("Failed to auto-sync bootstrap admin to Supabase Auth:", dbErr);
        }
      }

      await logAuditEvent({
        actorEmail: cleanEmail,
        action: "ADMIN_LOGIN_SUCCESS_BOOTSTRAP",
        targetResource: "/login/admin",
        details: { mode: isSupabaseLive() ? "supabase_master_bootstrap" : "local_bootstrap" },
        ipAddress,
      });

      return createSuccessResponse({
        id: adminUserId,
        email: cleanEmail,
        name: "Master Exam Controller",
        role: "admin",
      });
    }

    // --------------------------------------------------------------------------
    // CASE B: Standard Live Remote Supabase Authentication
    // --------------------------------------------------------------------------
    if (!isSupabaseLive()) {
      return NextResponse.json(
        { error: "Invalid administrator credentials. Please check your email and password." },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
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

    return createSuccessResponse({
      id: authData.user.id,
      email: authData.user.email || cleanEmail,
      name: profile.full_name || "Exam Controller",
      role: "admin",
    });
  } catch (error) {
    console.error("Admin login API exception:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during authentication." },
      { status: 500 }
    );
  }
}
