"use client";

import * as React from "react";
import Image from "next/image";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Monitor,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Undo2,
  FileText,
  User,
  Radio,
  ExternalLink,
  ChevronRight,
  Layers,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonitoringSessionSummary, MonitoringTelemetrySummary, MonitoringEventRecord } from "@/lib/services/exam-service";

export default function AdminMonitoringPage() {
  const [sessions, setSessions] = React.useState<MonitoringSessionSummary[]>([]);
  const [summary, setSummary] = React.useState<MonitoringTelemetrySummary>({
    totalCandidates: 0,
    activeInProgress: 0,
    warnedCandidates: 0,
    terminatedCandidates: 0,
    cleanCandidates: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Auto-refresh poll state (every 5 seconds)
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = React.useState<Date>(new Date());

  // Filter & Search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "warned" | "terminated" | "clean">("all");
  const [phaseFilter, setPhaseFilter] = React.useState<"all" | "1" | "2">("all");

  // Timeline Inspection Modal
  const [timelineSession, setTimelineSession] = React.useState<MonitoringSessionSummary | null>(null);
  const [timelineEvents, setTimelineEvents] = React.useState<MonitoringEventRecord[]>([]);
  const [loadingTimeline, setLoadingTimeline] = React.useState(false);

  // Technical Exception Recovery Modal
  const [exceptionSession, setExceptionSession] = React.useState<MonitoringSessionSummary | null>(null);
  const [exceptionReason, setExceptionReason] = React.useState("");
  const [submittingException, setSubmittingException] = React.useState(false);
  const [exceptionError, setExceptionError] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const fetchMonitoringData = React.useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      setError(null);

      const res = await fetch("/api/admin/monitoring");
      if (!res.ok) {
        throw new Error("Failed to load monitoring stream.");
      }

      const data = await res.json();
      setSessions(data.sessions || []);
      if (data.summary) {
        setSummary(data.summary);
      }
      setLastRefreshedAt(new Date());
    } catch (err: unknown) {
      console.error("Monitoring fetch error:", err);
      setError(err instanceof Error ? err.message : "Error querying monitoring telemetry.");
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  // Real-time Polling Interval
  React.useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMonitoringData(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMonitoringData]);

  // Open Timeline Drawer
  const handleOpenTimeline = async (session: MonitoringSessionSummary) => {
    try {
      setTimelineSession(session);
      setLoadingTimeline(true);
      const res = await fetch(`/api/admin/monitoring/${session.sessionId}/events`);
      if (!res.ok) throw new Error("Failed to fetch event timeline.");
      const data = await res.json();
      setTimelineEvents(data.events || []);
    } catch (err) {
      console.error("Timeline error:", err);
      setTimelineEvents([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Submit Technical Exception
  const handleGrantException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionSession || !exceptionReason.trim()) return;

    try {
      setSubmittingException(true);
      setExceptionError(null);

      const res = await fetch("/api/admin/monitoring/exception", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: exceptionSession.sessionId,
          reason: exceptionReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to grant technical exception.");
      }

      setToastMessage(`Technical exception granted for ${exceptionSession.studentName}. Attempt unblocked.`);
      setTimeout(() => setToastMessage(null), 5000);

      setExceptionSession(null);
      setExceptionReason("");
      await fetchMonitoringData(true);
    } catch (err: unknown) {
      setExceptionError(err instanceof Error ? err.message : "Exception request failed.");
    } finally {
      setSubmittingException(false);
    }
  };

  // Filtered Sessions
  const filteredSessions = React.useMemo(() => {
    return sessions.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        s.studentName.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.participantId.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q);

      let matchesStatus = true;
      if (statusFilter === "active") {
        matchesStatus = (s.status === "phase1_in_progress" || s.status === "phase2_in_progress") && !s.isTerminated;
      } else if (statusFilter === "warned") {
        matchesStatus = s.warningsCount > 0 && !s.isTerminated;
      } else if (statusFilter === "terminated") {
        matchesStatus = s.isTerminated;
      } else if (statusFilter === "clean") {
        matchesStatus = s.warningsCount === 0 && !s.isTerminated;
      }

      let matchesPhase = true;
      if (phaseFilter === "1") {
        matchesPhase = s.currentPhase === 1;
      } else if (phaseFilter === "2") {
        matchesPhase = s.currentPhase === 2;
      }

      return matchesSearch && matchesStatus && matchesPhase;
    });
  }, [sessions, searchQuery, statusFilter, phaseFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Live Proctored Invigilator Console
            </h1>
            <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1 inline-block" />
              Live Telemetry
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time candidate proctoring: fullscreen enforcement, tab-switch telemetry, automatic 3-strike terminations, and authorized technical recovery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
            />
            <span>Auto-poll (5s)</span>
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMonitoringData(true)}
            disabled={refreshing}
            className="text-xs flex items-center gap-1.5 bg-white border-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardTitle className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Candidates
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-extrabold text-slate-900">{summary.totalCandidates}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Assigned exam sessions</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardTitle className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Active Online
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-extrabold text-blue-700">{summary.activeInProgress}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Currently taking test</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardTitle className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Clean (0 Strikes)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-extrabold text-emerald-700">{summary.cleanCandidates}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Zero violations</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardTitle className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Warned (1-2 Strikes)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-extrabold text-amber-600">{summary.warnedCandidates}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Active warnings issued</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs bg-red-50/30 border-red-200">
          <CardHeader className="pb-1.5 pt-4 px-4">
            <CardTitle className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Terminated (3 Strikes)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-extrabold text-rose-600">{summary.terminatedCandidates}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Exceeded violation cap</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, roll number, or participant ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Integrity Statuses</option>
              <option value="active">Active Online</option>
              <option value="clean">Clean (0 Warnings)</option>
              <option value="warned">Warned (1-2 Strikes)</option>
              <option value="terminated">Terminated (3 Strikes)</option>
            </select>
          </div>

          {/* Phase Filter */}
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Exam Phases</option>
            <option value="1">Phase 1 (40 MCQs)</option>
            <option value="2">Phase 2 (Coding)</option>
          </select>
        </div>
      </div>

      {/* Candidates Monitoring Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Candidate Proctoring Telemetry ({filteredSessions.length} Candidates)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Last synchronized: {lastRefreshedAt.toLocaleTimeString()}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-xs text-slate-500 font-semibold">Polling live proctoring telemetry...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No matching candidate sessions</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No exam sessions meet the specified filter criteria. Sessions will automatically appear here once candidates start.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Candidate &amp; Roll No</th>
                  <th className="py-3 px-3">Current Phase</th>
                  <th className="py-3 px-3">Warning Strikes</th>
                  <th className="py-3 px-3">Attempt Status</th>
                  <th className="py-3 px-3">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.map((s) => {
                  return (
                    <tr
                      key={s.sessionId}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        s.isTerminated ? "bg-red-50/20" : s.warningsCount > 0 ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* Candidate Identity */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{s.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>Roll: <strong className="text-slate-700">{s.rollNumber}</strong></span>
                          <span>•</span>
                          <span className="text-blue-700">ID: {s.participantId}</span>
                          <span>•</span>
                          <span>{s.course}</span>
                        </div>
                      </td>

                      {/* Current Phase */}
                      <td className="py-3.5 px-3">
                        {s.currentPhase === 1 ? (
                          <Badge variant="outline" className="text-[10px] font-semibold bg-blue-50 text-blue-700 border-blue-200">
                            Phase 1 (MCQ)
                          </Badge>
                        ) : (
                          <div className="space-y-0.5">
                            <Badge variant="outline" className="text-[10px] font-semibold bg-purple-50 text-purple-700 border-purple-200">
                              Phase 2 (Coding)
                            </Badge>
                            {s.phase2Category && (
                              <div className="text-[10px] text-slate-500">
                                {s.phase2Category} {s.phase2Language ? `(${s.phase2Language})` : ""}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Warning Strikes Badge */}
                      <td className="py-3.5 px-3">
                        {s.isTerminated ? (
                          <Badge variant="danger" className="text-[11px] font-bold px-2.5 py-0.5">
                            Terminated (3/3)
                          </Badge>
                        ) : s.warningsCount === 2 ? (
                          <Badge variant="warning" className="text-[11px] font-bold bg-amber-500 text-white border-none px-2.5 py-0.5">
                            Final Warning (2/3)
                          </Badge>
                        ) : s.warningsCount === 1 ? (
                          <Badge variant="warning" className="text-[11px] font-bold px-2.5 py-0.5">
                            Warning 1 (1/3)
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[11px] font-semibold px-2.5 py-0.5">
                            Clean (0/3)
                          </Badge>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {s.totalViolations} telemetry event(s)
                        </div>
                      </td>

                      {/* Attempt Status */}
                      <td className="py-3.5 px-3">
                        {s.status === "terminated" ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs">
                            <XCircle className="w-3.5 h-3.5" />
                            Terminated
                          </span>
                        ) : s.status === "phase1_in_progress" ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-xs">
                            <Activity className="w-3.5 h-3.5 animate-pulse" />
                            Phase 1 Active
                          </span>
                        ) : s.status === "phase1_completed" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Phase 1 Done
                          </span>
                        ) : s.status === "phase2_in_progress" ? (
                          <span className="inline-flex items-center gap-1 text-purple-600 font-semibold text-xs">
                            <Activity className="w-3.5 h-3.5 animate-pulse" />
                            Phase 2 Active
                          </span>
                        ) : s.status === "phase2_completed" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            All Completed
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Not Started</span>
                        )}
                      </td>

                      {/* Last Activity */}
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                        {s.lastActivityAt ? new Date(s.lastActivityAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenTimeline(s)}
                          className="text-[11px] h-7 px-2.5 font-medium border-slate-300"
                        >
                          <FileText className="w-3 h-3 mr-1 text-slate-500" />
                          Timeline
                        </Button>

                        {(s.isTerminated || s.warningsCount > 0) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setExceptionSession(s);
                              setExceptionReason("");
                              setExceptionError(null);
                            }}
                            className={`text-[11px] h-7 px-2.5 font-bold ${
                              s.isTerminated
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : "bg-slate-700 hover:bg-slate-800 text-white"
                            }`}
                          >
                            <Undo2 className="w-3 h-3 mr-1" />
                            {s.isTerminated ? "Grant Exception" : "Adjust"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* ============================================================== */}
      {/* TIMELINE INSPECTION MODAL */}
      {/* ============================================================== */}
      {timelineSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold tracking-tight">
                  Integrity Incident Timeline: {timelineSession.studentName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Roll No: {timelineSession.rollNumber} • Participant ID: {timelineSession.participantId} • Course: {timelineSession.course}
                </p>
              </div>

              <button
                onClick={() => setTimelineSession(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {loadingTimeline ? (
                <div className="py-12 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                  <span>Loading incident records...</span>
                </div>
              ) : timelineEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-slate-700">Clean Session Record</p>
                  <p className="text-slate-400 text-xs">No proctoring violations or integrity incidents have been recorded.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-4 py-2">
                  {timelineEvents.map((ev, index) => {
                    const isTerm = ev.event_type === "auto_terminated" || ev.event_type === "warning_threshold_exceeded";
                    const isException = ev.event_type === "technical_exception_granted";
                    const isAck = ev.event_type === "warning_acknowledged";
                    const isExit = ev.event_type === "fullscreen_exit";

                    return (
                      <div key={ev.id || index} className="relative pl-6">
                        <div
                          className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                            isTerm
                              ? "border-red-600 bg-red-600"
                              : isException
                              ? "border-emerald-600 bg-emerald-600"
                              : isExit
                              ? "border-amber-500 bg-amber-500"
                              : "border-slate-400 bg-slate-300"
                          }`}
                        />

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span
                              className={`font-bold uppercase tracking-wider ${
                                isTerm
                                  ? "text-red-700"
                                  : isException
                                  ? "text-emerald-700"
                                  : isExit
                                  ? "text-amber-800"
                                  : "text-slate-700"
                              }`}
                            >
                              {ev.event_type.replace(/_/g, " ")}
                            </span>
                            <span className="text-slate-400 font-mono">
                              {new Date(ev.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          </div>

                          {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                            <div className="text-[11px] text-slate-600 pt-1 font-mono bg-white p-2 rounded border border-slate-100 overflow-x-auto">
                              {JSON.stringify(ev.metadata)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Total logged records: <strong>{timelineEvents.length}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTimelineSession(null)}
                className="text-xs"
              >
                Close Timeline
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TECHNICAL EXCEPTION MODAL */}
      {/* ============================================================== */}
      {exceptionSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-amber-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-bold">Authorize Technical Exception</h3>
              </div>
              <button
                onClick={() => setExceptionSession(null)}
                className="w-7 h-7 rounded-lg bg-amber-700 text-amber-200 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGrantException} className="p-6 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1.5 text-amber-900 leading-relaxed">
                <p className="font-bold">Technical Exception Protocol:</p>
                <p>
                  Authorizing an exception will restore examination access for{" "}
                  <strong>{exceptionSession.studentName}</strong> (Roll: {exceptionSession.rollNumber}).
                  Original incident logs and violation records are permanently retained for audit compliance.
                </p>
              </div>

              {exceptionError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium">
                  {exceptionError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Documented Justification Reason <span className="text-red-500">*</span>:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Lab workstation display cable glitch; verified by proctor. Candidate allowed to resume Phase 1."
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
                <span className="text-[11px] text-slate-500">
                  This note will be permanently timestamped in the candidate incident audit log.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExceptionSession(null)}
                  disabled={submittingException}
                  className="text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submittingException || !exceptionReason.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  {submittingException ? "Authorizing Exception..." : "Authorize & Restore Candidate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
