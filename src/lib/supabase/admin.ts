import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Admin Service-Role Supabase Client.
 * 
 * SECURITY MANDATE:
 * - Strictly executed on the server side (API Route Handlers / Server Actions).
 * - NEVER exposed or imported into Client Components ("use client").
 * - Used exclusively for account creation, admin bootstrap, test case grading, and audit logs.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "SECURITY CRITICAL: createAdminClient() cannot be invoked in a browser environment. Service-role credentials must remain strictly server-side."
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/^["']|["']$/g, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/^["']|["']$/g, "");

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes("your-supabase-service-role-key")) {
    console.warn(
      "Supabase Admin Client: SUPABASE_SERVICE_ROLE_KEY is unconfigured. Operating in fallback mode."
    );
  }

  return createClient(
    supabaseUrl || "https://placeholder-project.supabase.co",
    serviceRoleKey || "placeholder-service-role-key",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

