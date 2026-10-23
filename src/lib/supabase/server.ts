import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { sanitizeSupabaseUrl } from "./admin";

/**
 * Creates an SSR-compatible Supabase client for Server Components, Server Actions,
 * and Route Handlers with secure cookie persistence.
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/^["']|["']$/g, "").trim();

  return createServerClient(
    supabaseUrl || "https://placeholder-project.supabase.co",
    supabaseAnonKey || "placeholder-anon-key",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Can be called from Server Component where cookies cannot be set directly
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Can be called from Server Component where cookies cannot be removed directly
          }
        },
      },
    }
  );
}

