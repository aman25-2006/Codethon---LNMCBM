"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Users, 
  HelpCircle, 
  Code2, 
  Activity, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  UploadCloud, 
  Settings,
  ArrowRight,
  RefreshCw,
  Database,
  ShieldCheck,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatabasePersistenceModal } from "@/components/admin/DatabasePersistenceModal";
import { CompetitionMasterControl } from "@/components/admin/CompetitionMasterControl";

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  notStarted: number;
  phase1InProgress: number;
  phase2InProgress: number;
  completedAttempts: number;
  terminatedAttempts: number;
  monitoringAlerts: number;
  pendingEvaluations: number;
  pendingPublication: number;
  mcqQuestionsCount: number;
  codingProblemsCount: number;
  recentActivity: Array<{
    id: string;
    action: string;
    actor_email: string;
    target_resource: string;
    created_at: string;
  }>;
  isDatabaseConnected: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isDbHelpOpen, setIsDbHelpOpen] = React.useState(false);

  const fetchStats = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard-stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard metrics:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Competition Operations Center
            </h1>
            <Badge variant="default">Session 2026</Badge>
            {stats?.isDatabaseConnected ? (
              <Badge variant="success" className="hidden sm:inline-flex items-center gap-1">
                <Database className="w-3 h-3" /> Live Database
              </Badge>
            ) : (
              <button
                onClick={() => setIsDbHelpOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
              >
                <AlertTriangle className="w-3 h-3 text-amber-700" /> In-Memory Mode (Warning)
              </button>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry, candidate lifecycle states, question bank health, and proctoring events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Telemetry
          </Button>
          <Link href="/admin/students">
            <Button size="sm" variant="outline" className="text-xs">
              <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
              Upload Student CSV
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button size="sm" variant="secondary" className="text-xs">
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              Configure Rules
            </Button>
          </Link>
        </div>
      </div>

      {/* Master Examination Start/Stop Controller */}
      <CompetitionMasterControl onStatusChange={handleRefresh} />

      {/* Ephemeral In-Memory Warning Banner */}
      {!isLoading && stats && !stats.isDatabaseConnected && (
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50/95 p-4 sm:p-5 shadow-xs text-slate-900 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-extrabold text-amber-950">
                    Ephemeral In-Memory Mode Active
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    Data Wipes When Server Sleeps (1–2 Mins)
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  Supabase database environment variables are missing on Vercel. Candidate rosters, passwords, and exam responses are stored in server RAM and will be deleted whenever the server sleeps. Link your Supabase database in Vercel to preserve data permanently (for 1+ months).
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsDbHelpOpen(true)}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
              size="sm"
            >
              <Database className="w-3.5 h-3.5 mr-1.5" />
              Fix Database Persistence
            </Button>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered */}
        <Card className="hover:border-blue-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Registered
            </CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-slate-900">
                {stats?.totalStudents ?? 0}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Active: <strong className="text-slate-700">{stats?.activeStudents ?? 0}</strong> candidates
            </p>
          </CardContent>
        </Card>

        {/* Phase 1 In Progress */}
        <Card className="hover:border-indigo-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Phase 1 (MCQ)
            </CardTitle>
            <Clock className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-indigo-600">
                {stats?.phase1InProgress ?? 0}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">45-minute active countdown</p>
          </CardContent>
        </Card>

        {/* Phase 2 In Progress */}
        <Card className="hover:border-emerald-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Phase 2 (Coding)
            </CardTitle>
            <Code2 className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-emerald-600">
                {stats?.phase2InProgress ?? 0}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">30-minute programming track</p>
          </CardContent>
        </Card>

        {/* Monitoring Warnings */}
        <Card className="hover:border-amber-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monitoring Alerts
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-amber-600">
                {stats?.monitoringAlerts ?? 0}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Fullscreen & blur events</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500">Not Started</span>
          <p className="text-lg font-bold text-slate-900">{stats?.notStarted ?? 0}</p>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500">Completed Attempts</span>
          <p className="text-lg font-bold text-emerald-700">{stats?.completedAttempts ?? 0}</p>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500">Terminated Attempts</span>
          <p className="text-lg font-bold text-rose-700">{stats?.terminatedAttempts ?? 0}</p>
        </div>
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500">Pending Publication</span>
          <p className="text-lg font-bold text-amber-700">{stats?.pendingPublication ?? 0}</p>
        </div>
      </div>

      {/* Main Operational Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Readiness Checklist & Empty State Handling */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                Examination Readiness Status
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Live verification of questions, coding challenges, and student registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Question Bank Item */}
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Phase 1: MCQ Question Bank ({stats?.mcqQuestionsCount ?? 0} / 40 Questions)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Fundamentals (10), Technical (10), Logic (10), Case Study (10)
                    </p>
                  </div>
                </div>
                <Link href="/admin/questions">
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Configure
                  </Button>
                </Link>
              </div>

              {/* Coding Problems Item */}
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Phase 2: Coding Challenges ({stats?.codingProblemsCount ?? 0} Problems Active)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Evaluated across 5 hidden test cases (2M each = 10M per problem)
                    </p>
                  </div>
                </div>
                <Link href="/admin/coding-problems">
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Configure
                  </Button>
                </Link>
              </div>

              {/* Student Upload Item & Empty state callout */}
              <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Candidate Roster ({stats?.totalStudents ?? 0} Students Registered)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      CSV Import with automatic 8-character password generation
                    </p>
                  </div>
                </div>
                <Link href="/admin/students">
                  <Button size="sm" variant={stats?.totalStudents === 0 ? "primary" : "outline"} className="text-xs h-7">
                    {stats?.totalStudents === 0 ? "Upload Roster" : "Manage"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Actionable notice when database has 0 students */}
          {stats && stats.totalStudents === 0 && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-700" />
                  No Candidates Enrolled Yet
                </h4>
                <p className="text-xs text-blue-800">
                  Ready to enroll students? Download the CSV template and upload your candidates with one click.
                </p>
              </div>
              <Link href="/admin/students" className="flex-shrink-0">
                <Button size="sm" className="text-xs bg-blue-700 hover:bg-blue-800 text-white shadow-xs">
                  Go to Student CSV Upload <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Live Audit Trail & Telemetry Feed */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Security & Activity Audit
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Real-time log of administrative logins, rules, and events
                </CardDescription>
              </div>
              <Activity className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivity.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          {log.action.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate block">
                          {log.actor_email} • {log.target_resource}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3 my-auto">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">No activity recorded yet</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Privileged administrator operations, logins, CSV imports, and exam terminations will stream here.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center text-xs">
                <span className="text-slate-500 text-[11px]">Append-only audit integrity</span>
                <Link href="/admin/audit-logs" className="text-blue-700 font-semibold hover:underline">
                  View Full Audit Log →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Database Persistence Diagnostic Modal */}
      <DatabasePersistenceModal
        isOpen={isDbHelpOpen}
        onClose={() => setIsDbHelpOpen(false)}
        isLiveDatabase={stats?.isDatabaseConnected}
        onRefreshStatus={fetchStats}
      />
    </div>
  );
}
