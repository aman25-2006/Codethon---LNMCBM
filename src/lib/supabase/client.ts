import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in browser client components.
 * Uses public variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Never exposes service-role keys.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project-id")) {
    // Provide a non-throwing stub/client during local design and development
    // to prevent application crash before remote Supabase credentials are input.
    console.warn(
      "Supabase browser client: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is unconfigured. Operating in fallback mock mode."
    );
  }

  return createBrowserClient(
    supabaseUrl || "https://placeholder-project.supabase.co",
    supabaseAnonKey || "placeholder-anon-key"
  );
}

