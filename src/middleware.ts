import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

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
  // 1. ADMIN ROUTES PROTECTION (/admin and /admin/*)
  // ----------------------------------------------------------------------------
  if (pathname.startsWith("/admin")) {
    const bootstrapCookie = request.cookies.get("lnmcbm_admin_session");
    if (bootstrapCookie?.value) {
      const parsed = parseJsonCookie(bootstrapCookie.value);
      if (parsed && parsed.role === "admin") {
        return NextResponse.next();
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
        return response;
      }
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
  matcher: ["/admin/:path*", "/student/:path*", "/exam/:path*"],
};
