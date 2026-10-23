import { createClient } from "@supabase/supabase-js";

/**
 * Sanitizes Supabase project URLs.
 * Automatically trims whitespace, strips accidental quotes, removes accidental
 * trailing paths like /rest/v1 or /auth/v1 copied from the Data API panel,
 * and strips any trailing slashes.
 */
export function sanitizeSupabaseUrl(rawUrl: string | undefined): string {
  if (!rawUrl) return "";
  let clean = rawUrl.trim().replace(/^["']|["']$/g, "");
  // Strip accidental /rest/v1 or /auth/v1 endpoints copied from Supabase Data API settings
  clean = clean.replace(/\/rest\/v1\/?$/i, "");
  clean = clean.replace(/\/auth\/v1\/?$/i, "");
  // Strip any trailing slashes
  clean = clean.replace(/\/+$/, "");
  return clean;
}

/**
 * Sanitized retrieval of Supabase environment configuration.
 * Automatically trims whitespace and strips accidental quotes added in environment consoles.
 */
export function getSanitizedSupabaseEnv() {
  const url = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/^["']|["']$/g, "") || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/^["']|["']$/g, "") || "";

  const isUrlPlaceholder =
    !url ||
    url.includes("your-project-id") ||
    url.includes("placeholder") ||
    !url.startsWith("http");

  const isAnonPlaceholder =
    !anonKey ||
    anonKey.includes("your-anon-key") ||
    anonKey.includes("placeholder");

  const isServicePlaceholder =
    !serviceRoleKey ||
    serviceRoleKey.includes("your-supabase-service-role-key") ||
    serviceRoleKey.includes("placeholder");

  const isConfigured = !isUrlPlaceholder && !isServicePlaceholder;

  return {
    url,
    anonKey,
    serviceRoleKey,
    isUrlPlaceholder,
    isAnonPlaceholder,
    isServicePlaceholder,
    isConfigured,
  };
}

/**
 * Global helper determining whether permanent Supabase PostgreSQL is active.
 */
export function isSupabaseLive(): boolean {
  return getSanitizedSupabaseEnv().isConfigured;
}

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

  const { url, serviceRoleKey, isConfigured } = getSanitizedSupabaseEnv();

  if (!isConfigured) {
    console.warn(
      "Supabase Admin Client: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is unconfigured. Operating in fallback mode."
    );
  }

  return createClient(
    url || "https://placeholder-project.supabase.co",
    serviceRoleKey || "placeholder-service-role-key",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

