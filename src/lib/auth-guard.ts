import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifySignedAdminToken } from "@/lib/auth/admin-session";
import { sanitizeSupabaseUrl } from "@/lib/supabase/admin";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin";
}

/**
 * Reusable server-side helper to verify that the incoming request
 * is authenticated as an authorized administrator.
 */
export async function verifyAdmin(): Promise<
  | { authenticated: true; user: AdminUser }
  | { authenticated: false; error: string; status: number }
> {
  try {
    const cookieStore = cookies();
    const bootstrapCookie = cookieStore.get("lnmcbm_admin_session");

    if (bootstrapCookie?.value) {
      // 1. Verify cryptographically signed token
      const verified = await verifySignedAdminToken(bootstrapCookie.value);
      if (verified && verified.role === "admin") {
        return {
          authenticated: true,
          user: {
            id: verified.id,
            email: verified.email,
            name: verified.name,
            role: "admin",
          },
        };
      }

      // 2. Legacy fallback check only for master bootstrap email
      try {
        let legacy: any = null;
        try {
          legacy = JSON.parse(bootstrapCookie.value);
        } catch {
          legacy = JSON.parse(decodeURIComponent(bootstrapCookie.value));
        }
        const masterEmail = (process.env.ADMIN_INITIAL_EMAIL || "admin@lnmcbm.ac.in").toLowerCase();
        if (legacy && legacy.role === "admin" && legacy.email?.toLowerCase() === masterEmail) {
          return {
            authenticated: true,
            user: {
              id: legacy.id || "bootstrap-admin-uuid",
              email: legacy.email,
              name: legacy.name || "System Exam Controller",
              role: "admin",
            },
          };
        }
      } catch {
        // invalid
      }
    }

    const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (supabaseUrl && !supabaseUrl.includes("your-project-id")) {
      const supabase = createServerSupabaseClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          authenticated: false,
          error: "Unauthorized: Please sign in to access administrator features.",
          status: 401,
        };
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile || profile.role !== "admin") {
        return {
          authenticated: false,
          error: "Forbidden: Administrator privileges required.",
          status: 403,
        };
      }

      return {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email || "",
          name: profile.full_name || "Administrator",
          role: "admin",
        },
      };
    }

    return {
      authenticated: false,
      error: "Unauthorized: No active administrator session found.",
      status: 401,
    };
  } catch (error) {
    console.error("verifyAdmin authorization error:", error);
    return {
      authenticated: false,
      error: "Internal server error occurred while verifying privileges.",
      status: 500,
    };
  }
}

export interface StudentUser {
  id: string;
  roll_number: string;
  full_name: string;
  course: string;
  participant_id: string;
}

/**
 * Reusable server-side helper to verify that the incoming request
 * is authenticated as an authorized student candidate.
 */
export async function verifyStudent(): Promise<
  | { authenticated: true; student: StudentUser }
  | { authenticated: false; error: string; status: number }
> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("lnmcbm_student_session");

    if (sessionCookie?.value) {
      let parsed: any = null;
      try {
        parsed = JSON.parse(sessionCookie.value);
      } catch {
        try {
          parsed = JSON.parse(decodeURIComponent(sessionCookie.value));
        } catch {
          // ignore
        }
      }

      if (parsed && parsed.id && parsed.roll_number) {
        return {
          authenticated: true,
          student: {
            id: parsed.id,
            roll_number: parsed.roll_number,
            full_name: parsed.full_name || "Candidate",
            course: parsed.course || "General",
            participant_id: parsed.participant_id || "LNMC-COD-0000",
          },
        };
      }
    }

    const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (supabaseUrl && !supabaseUrl.includes("your-project-id")) {
      const supabase = createServerSupabaseClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          authenticated: false,
          error: "Unauthorized: Please sign in with your candidate credentials.",
          status: 401,
        };
      }

      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id, roll_number, full_name, course, participant_id")
        .eq("auth_user_id", user.id)
        .single();

      if (studentError || !student) {
        return {
          authenticated: false,
          error: "Forbidden: Candidate profile not found.",
          status: 403,
        };
      }

      return {
        authenticated: true,
        student,
      };
    }

    return {
      authenticated: false,
      error: "Unauthorized: No active candidate session found.",
      status: 401,
    };
  } catch (error) {
    console.error("verifyStudent authorization error:", error);
    return {
      authenticated: false,
      error: "Internal server error occurred while verifying candidate privileges.",
      status: 500,
    };
  }
}

