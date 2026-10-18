import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const bootstrapCookie = cookieStore.get("lnmcbm_admin_session");
    let isAdmin = false;

    if (bootstrapCookie?.value) {
      try {
        const parsed = JSON.parse(bootstrapCookie.value);
        if (parsed.role === "admin") {
          isAdmin = true;
        }
      } catch {
        // ignore
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes("your-project-id");

    if (isSupabaseConfigured) {
      const supabase = createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          isAdmin = true;
        }
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required." },
        { status: 401 }
      );
    }

    // Default zero metrics structure
    const defaultStats = {
      totalStudents: 0,
      activeStudents: 0,
      notStarted: 0,
      phase1InProgress: 0,
      phase2InProgress: 0,
      completedAttempts: 0,
      terminatedAttempts: 0,
      monitoringAlerts: 0,
      pendingEvaluations: 0,
      pendingPublication: 0,
      mcqQuestionsCount: 0,
      codingProblemsCount: 0,
      recentActivity: [] as Array<{
        id: string;
        action: string;
        actor_email: string;
        target_resource: string;
        created_at: string;
      }>,
      isDatabaseConnected: isSupabaseConfigured,
    };

    if (!isSupabaseConfigured) {
      return NextResponse.json({
        ...defaultStats,
        message: "Supabase database not connected. Displaying zeroed empty state.",
      });
    }

    // Query real Supabase database counts using admin client for comprehensive stats
    const admin = createAdminClient();

    const [
      studentsRes,
      activeStudentsRes,
      sessionsRes,
      alertsRes,
      evalsRes,
      resultsRes,
      mcqRes,
      codingRes,
      auditRes,
    ] = await Promise.all([
      admin.from("students").select("id", { count: "exact", head: true }),
      admin.from("students").select("id", { count: "exact", head: true }).eq("is_active", true),
      admin.from("exam_sessions").select("status, is_terminated"),
      admin.from("monitoring_events").select("id", { count: "exact", head: true }),
      admin.from("submission_evaluations").select("id", { count: "exact", head: true }).eq("evaluation_status", "pending"),
      admin.from("final_results").select("id", { count: "exact", head: true }).eq("is_published", false).eq("is_finalized", true),
      admin.from("mcq_questions").select("id", { count: "exact", head: true }).eq("is_active", true),
      admin.from("coding_problems").select("id", { count: "exact", head: true }).eq("is_active", true),
      admin.from("audit_logs").select("id, action, actor_email, target_resource, created_at").order("created_at", { ascending: false }).limit(6),
    ]);

    const sessions = sessionsRes.data || [];
    let notStarted = 0;
    let phase1InProgress = 0;
    let phase2InProgress = 0;
    let completedAttempts = 0;
    let terminatedAttempts = 0;

    for (const session of sessions) {
      if (session.is_terminated) {
        terminatedAttempts++;
      } else if (session.status === "not_started") {
        notStarted++;
      } else if (session.status === "phase1_in_progress") {
        phase1InProgress++;
      } else if (session.status === "phase2_in_progress") {
        phase2InProgress++;
      } else if (session.status === "phase2_completed" || session.status === "completed") {
        completedAttempts++;
      }
    }

    return NextResponse.json({
      totalStudents: studentsRes.count || 0,
      activeStudents: activeStudentsRes.count || 0,
      notStarted,
      phase1InProgress,
      phase2InProgress,
      completedAttempts,
      terminatedAttempts,
      monitoringAlerts: alertsRes.count || 0,
      pendingEvaluations: evalsRes.count || 0,
      pendingPublication: resultsRes.count || 0,
      mcqQuestionsCount: mcqRes.count || 0,
      codingProblemsCount: codingRes.count || 0,
      recentActivity: auditRes.data || [],
      isDatabaseConnected: true,
    });
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch operational statistics." },
      { status: 500 }
    );
  }
}

