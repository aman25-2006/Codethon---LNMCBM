import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/system/database-status
 * Diagnostics endpoint reporting whether Supabase PostgreSQL is connected,
 * configured in environment variables, and whether required tables are present.
 */
export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const isUrlConfigured = Boolean(url && !url.includes("your-project-id") && !url.includes("placeholder"));
    const isAnonKeyConfigured = Boolean(anonKey && !anonKey.includes("your-anon-key") && !anonKey.includes("placeholder"));
    const isServiceKeyConfigured = Boolean(
      serviceRoleKey &&
      !serviceRoleKey.includes("your-supabase-service-role-key") &&
      !serviceRoleKey.includes("placeholder")
    );

    if (!isUrlConfigured || !isServiceKeyConfigured) {
      return NextResponse.json({
        isLiveConnected: false,
        mode: "memory",
        message:
          "Supabase environment variables are missing or set to placeholders on Vercel. Data is being stored in temporary server RAM and resets every 1–2 minutes when the server sleeps.",
        envStatus: {
          NEXT_PUBLIC_SUPABASE_URL: isUrlConfigured,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: isAnonKeyConfigured,
          SUPABASE_SERVICE_ROLE_KEY: isServiceKeyConfigured,
        },
      });
    }

    // Perform live table accessibility checks
    try {
      const admin = createAdminClient();
      const [studentsCheck, regCheck, mcqCheck, settingsCheck] = await Promise.allSettled([
        admin.from("students").select("id").limit(1),
        admin.from("student_registrations").select("id").limit(1),
        admin.from("mcq_questions").select("id").limit(1),
        admin.from("competition_settings").select("id").limit(1),
      ]);

      const tables = {
        students: studentsCheck.status === "fulfilled" && !studentsCheck.value.error,
        student_registrations: regCheck.status === "fulfilled" && !regCheck.value.error,
        mcq_questions: mcqCheck.status === "fulfilled" && !mcqCheck.value.error,
        competition_settings: settingsCheck.status === "fulfilled" && !settingsCheck.value.error,
      };

      const allReady = Object.values(tables).every(Boolean);

      return NextResponse.json({
        isLiveConnected: allReady,
        mode: allReady ? "supabase" : "tables_missing",
        envStatus: {
          NEXT_PUBLIC_SUPABASE_URL: isUrlConfigured,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: isAnonKeyConfigured,
          SUPABASE_SERVICE_ROLE_KEY: isServiceKeyConfigured,
        },
        tables,
        message: allReady
          ? "Supabase PostgreSQL is fully connected and operational. All student details, credentials, and scores are permanently stored."
          : "Supabase connection succeeded, but one or more tables are missing. Please execute the COMPLETE_SUPABASE_DATABASE_SETUP.sql script in your Supabase SQL Editor.",
      });
    } catch (err: unknown) {
      return NextResponse.json({
        isLiveConnected: false,
        mode: "connection_error",
        error: err instanceof Error ? err.message : "Failed to connect to Supabase database",
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to evaluate database health.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

