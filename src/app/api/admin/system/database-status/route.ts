import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-guard";
import { createAdminClient, getSanitizedSupabaseEnv } from "@/lib/supabase/admin";

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

    const {
      url,
      anonKey,
      serviceRoleKey,
      isUrlPlaceholder,
      isAnonPlaceholder,
      isServicePlaceholder,
      isConfigured,
    } = getSanitizedSupabaseEnv();

    const maskUrl = (raw: string) => {
      if (!raw) return { set: false, preview: "(Not Configured / Missing)" };
      try {
        const u = new URL(raw);
        return { set: true, preview: `${u.protocol}//${u.hostname}` };
      } catch {
        return { set: true, preview: raw.slice(0, 20) + "..." };
      }
    };

    const maskKey = (raw: string) => {
      if (!raw) return { set: false, preview: "(Not Configured / Missing)", length: 0 };
      const len = raw.length;
      if (raw.includes("placeholder") || raw.includes("your-")) {
        return { set: false, preview: `Contains placeholder ("${raw.slice(0, 24)}...")`, length: len };
      }
      return {
        set: true,
        preview: `${raw.slice(0, 10)}...${raw.slice(-6)} (${len} chars)`,
        length: len,
      };
    };

    const envDiagnostics = {
      NEXT_PUBLIC_SUPABASE_URL: {
        configured: !isUrlPlaceholder,
        ...maskUrl(url),
        isPlaceholder: isUrlPlaceholder,
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        configured: !isAnonPlaceholder,
        ...maskKey(anonKey),
        isPlaceholder: isAnonPlaceholder,
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        configured: !isServicePlaceholder,
        ...maskKey(serviceRoleKey),
        isPlaceholder: isServicePlaceholder,
      },
    };

    if (!isConfigured) {
      const missingKeys: string[] = [];
      if (isUrlPlaceholder) missingKeys.push("NEXT_PUBLIC_SUPABASE_URL");
      if (isServicePlaceholder) missingKeys.push("SUPABASE_SERVICE_ROLE_KEY");
      if (isAnonPlaceholder) missingKeys.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

      return NextResponse.json({
        isLiveConnected: false,
        mode: "memory",
        message: `Supabase environment variables are missing or set to placeholders on Vercel: [${missingKeys.join(", ")}]. Data is currently stored in temporary server RAM and resets every 1–2 minutes when the serverless function sleeps.`,
        missingKeys,
        envDiagnostics,
      });
    }

    // Attempt live connection & table checks
    try {
      const admin = createAdminClient();
      const [studentsCheck, regCheck, mcqCheck, settingsCheck] = await Promise.allSettled([
        admin.from("students").select("id").limit(1),
        admin.from("student_registrations").select("id").limit(1),
        admin.from("mcq_questions").select("id").limit(1),
        admin.from("competition_settings").select("id").limit(1),
      ]);

      const formatSettled = (check: PromiseSettledResult<{ data: unknown; error: { message?: string } | null }>) => {
        if (check.status === "rejected") {
          const err = check.reason as { message?: string } | undefined;
          return { ready: false, error: String(err?.message || check.reason) };
        }
        if (check.value.error) {
          return { ready: false, error: check.value.error.message || JSON.stringify(check.value.error) };
        }
        return { ready: true, error: null };
      };

      const tableStatus = {
        students: formatSettled(studentsCheck),
        student_registrations: formatSettled(regCheck),
        mcq_questions: formatSettled(mcqCheck),
        competition_settings: formatSettled(settingsCheck),
      };

      const allReady = Object.values(tableStatus).every((t) => t.ready);
      const tables = Object.fromEntries(Object.entries(tableStatus).map(([k, v]) => [k, v.ready]));
      const tableErrors = Object.fromEntries(
        Object.entries(tableStatus)
          .filter(([, v]) => Boolean(v.error))
          .map(([k, v]) => [k, v.error])
      );

      return NextResponse.json({
        isLiveConnected: allReady,
        mode: allReady ? "supabase" : "tables_missing_or_error",
        envDiagnostics,
        tables,
        tableErrors: Object.keys(tableErrors).length > 0 ? tableErrors : undefined,
        message: allReady
          ? "Supabase PostgreSQL is fully connected and operational! All student details, credentials, and scores are permanently stored."
          : "Supabase database is reachable, but encountered errors querying tables. Please verify COMPLETE_SUPABASE_DATABASE_SETUP.sql was executed on this database.",
      });
    } catch (err: unknown) {
      return NextResponse.json({
        isLiveConnected: false,
        mode: "connection_error",
        envDiagnostics,
        error: err instanceof Error ? err.message : "Failed to connect to Supabase database",
        message: "Network or authorization error connecting to Supabase with provided credentials.",
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to evaluate database health.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
