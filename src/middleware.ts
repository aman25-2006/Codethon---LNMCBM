import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { verifySignedAdminToken } from "@/lib/auth/admin-session";
import { sanitizeSupabaseUrl } from "@/lib/supabase/admin";

function parseJsonCookie(value?: string) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return null;
    }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ----------------------------------------------------------------------------
  // 1. ADMIN ROUTES & ADMIN API PROTECTION (/admin, /admin/*, /api/admin/*)
  // Strictly gates all administrator consoles, dashboards, and management APIs.
  // ----------------------------------------------------------------------------
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/")
  ) {
    const isApiRoute = pathname.startsWith("/api/admin/");

    // Check A: Cryptographically signed admin session cookie
    const bootstrapCookie = request.cookies.get("lnmcbm_admin_session");
    if (bootstrapCookie?.value) {
      const verified = await verifySignedAdminToken(bootstrapCookie.value);
      if (verified && verified.role === "admin") {
        if (pathname === "/admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
        return NextResponse.next();
      }

      // Legacy fallback check only for master initial email
      const legacy = parseJsonCookie(bootstrapCookie.value);
      const masterEmail = (process.env.ADMIN_INITIAL_EMAIL || "admin@lnmcbm.ac.in").toLowerCase();
      if (legacy && legacy.role === "admin" && legacy.email?.toLowerCase() === masterEmail) {
        if (pathname === "/admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
        return NextResponse.next();
      }
    }

    // Check B: Supabase Auth Session (strictly requiring role === 'admin')
    const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/^["']|["']$/g, "").trim();

    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-project-id")) {
      let response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Enforce role === 'admin' strictly! Students must NEVER pass this check!
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role === "admin") {
          if (pathname === "/admin") {
            return NextResponse.redirect(new URL("/admin/dashboard", request.url));
          }
          return response;
        }
      }
    }

    // Access Denied: Block immediately at server level
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required." },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login/admin", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ----------------------------------------------------------------------------
  // 2. STUDENT EXAMINATION & DESK ROUTES (/student/* and /exam/*)
  // ----------------------------------------------------------------------------
  if (pathname.startsWith("/student") || pathname.startsWith("/exam")) {
    const studentCookie = request.cookies.get("lnmcbm_student_session");
    if (studentCookie?.value) {
      const parsed = parseJsonCookie(studentCookie.value);
      if (parsed && parsed.id && parsed.roll_number) {
        return NextResponse.next();
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("your-project-id")) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return NextResponse.next();
      }
    }

    const studentLoginUrl = new URL("/login/student", request.url);
    studentLoginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(studentLoginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
    "/student/:path*",
    "/exam/:path*",
  ],
};
