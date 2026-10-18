"use client";

import * as React from "react";
import Image from "next/image";
import {
  Settings,
  Save,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Lock,
  RefreshCw,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Mail,
  Phone,
  HelpCircle,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type {
  CompetitionSettingsDTO,
  PreflightChecklistResult,
  CodingCategory,
} from "@/types";

const ALL_CODING_CATEGORIES: CodingCategory[] = [
  "C",
  "C++",
  "Java",
  "Python",
  "Web Development",
  "DSA",
];

const STATUS_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  draft: {
    label: "Draft",
    color: "bg-slate-100 text-slate-800 border-slate-300",
    desc: "Competition setup in progress. Public registration and candidate entry closed.",
  },
  registration_open: {
    label: "Registration Open",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    desc: "Candidate roster enrollment active. Students may be registered or imported.",
  },
  registration_closed: {
    label: "Registration Closed",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    desc: "Registration locked. Roster finalized for preflight validation.",
  },
  ready: {
    label: "Ready for Start",
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    desc: "All 8 preflight checks passed. Invigilators primed. Ready to launch.",
  },
  in_progress: {
    label: "In Progress (Live)",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    desc: "Examination live. Candidates actively attempting Phase 1 and Phase 2.",
  },
  evaluation_pending: {
    label: "Evaluation Pending",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    desc: "Examination concluded. Automated test evaluations or invigilator review pending.",
  },
  completed: {
    label: "Completed",
    color: "bg-slate-800 text-white border-slate-900",
    desc: "All scores finalized. Results ready for administrator review and publication.",
  },
  results_published: {
    label: "Results Published",
    color: "bg-teal-100 text-teal-800 border-teal-300",
    desc: "Official scorecards and state merit ranks visible to students and public verification.",
  },
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [transitioning, setTransitioning] = React.useState(false);
  const [checkingPreflight, setCheckingPreflight] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Core Settings State
  const [settings, setSettings] = React.useState<CompetitionSettingsDTO | null>(null);
  const [activeExams, setActiveExams] = React.useState<number>(0);
  const [preflight, setPreflight] = React.useState<PreflightChecklistResult | null>(null);

  // Form Fields
  const [competitionName, setCompetitionName] = React.useState("");
  const [collegeName, setCollegeName] = React.useState("");
  const [collegeLogoUrl, setCollegeLogoUrl] = React.useState("/images/college-logo.png");
  const [competitionDate, setCompetitionDate] = React.useState("");
  const [phase1Duration, setPhase1Duration] = React.useState(45);
  const [phase2Duration, setPhase2Duration] = React.useState(30);
  const [warningThreshold, setWarningThreshold] = React.useState(3);
  const [categories, setCategories] = React.useState<CodingCategory[]>([]);
  const [instructions, setInstructions] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");

  // Transition Confirmation Modal State
  const [pendingTargetStatus, setPendingTargetStatus] = React.useState<string | null>(null);
  const [transitionJustification, setTransitionJustification] = React.useState("");
  const [forceOverride, setForceOverride] = React.useState(false);

  // Fetch settings & preflight
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);

      const [settingsRes, preflightRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/settings/preflight"),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        const s = data.settings as CompetitionSettingsDTO;
        setSettings(s);
        setActiveExams(data.activeExams || 0);

        setCompetitionName(s.competition_name || "");
        setCollegeName(s.college_name || "");
        setCollegeLogoUrl(s.college_logo_url || "/images/college-logo.png");
        setCompetitionDate(s.competition_date || "");
        setPhase1Duration(s.phase1_duration_minutes || 45);
        setPhase2Duration(s.phase2_duration_minutes || 30);
        setWarningThreshold(s.fullscreen_warning_threshold || 3);
        setCategories(s.eligible_coding_categories || []);
        setInstructions(s.participant_instructions || "");
        setContactEmail(s.contact_email || "");
        setContactPhone(s.contact_phone || "");
      }

      if (preflightRes.ok) {
        const pf = await preflightRes.json();
        setPreflight(pf);
      }
    } catch (err: unknown) {
      console.error("Failed to load settings:", err);
      setMessage({ type: "error", text: "Failed to load competition configuration." });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh Preflight only
  const handleRefreshPreflight = async () => {
    try {
      setCheckingPreflight(true);
      const res = await fetch("/api/admin/settings/preflight");
      if (res.ok) {
        const pf = await res.json();
        setPreflight(pf);
        setMessage({ type: "success", text: "Preflight checklist refreshed successfully." });
      }
    } catch (err: unknown) {
      setMessage({ type: "error", text: "Failed to refresh preflight checks." });
    } finally {
      setCheckingPreflight(false);
    }
  };

  // Toggle category
  const toggleCategory = (cat: CodingCategory) => {
    if (categories.includes(cat)) {
      if (categories.length === 1) {
        setMessage({ type: "error", text: "At least one coding track must remain enabled." });
        return;
      }
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        competition_name: competitionName,
        college_name: collegeName,
        college_logo_url: collegeLogoUrl,
        competition_date: competitionDate,
        phase1_duration_minutes: Number(phase1Duration),
        phase2_duration_minutes: Number(phase2Duration),
        fullscreen_warning_threshold: Number(warningThreshold),
        eligible_coding_categories: categories,
        participant_instructions: instructions,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings.");
      }

      setSettings(data.settings);
      setMessage({ type: "success", text: "Competition parameters saved successfully." });
      handleRefreshPreflight();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving configuration.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  // State Transition Execution
  const handleExecuteTransition = async () => {
    if (!pendingTargetStatus) return;
    try {
      setTransitioning(true);
      setMessage(null);

      const res = await fetch("/api/admin/settings/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_status: pendingTargetStatus,
          justification: transitionJustification,
          force: forceOverride,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to execute state transition.");
      }

      setSettings(data.settings);
      setMessage({ type: "success", text: data.message || "State transitioned successfully." });
      setPendingTargetStatus(null);
      setTransitionJustification("");
      setForceOverride(false);
      handleRefreshPreflight();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to transition state.";
      setMessage({ type: "error", text: msg });
    } finally {
      setTransitioning(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-900 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading competition settings...</p>
        </div>
      </div>
    );
  }

  const currentStatus = settings?.status || "draft";
  const statusInfo = STATUS_LABELS[currentStatus] || STATUS_LABELS.draft;

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Competition Control Center & Settings
            </h1>
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-bold">
              Phase L
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Authoritative lifecycle transitions, preflight validation checklist, exam duration timers, and proctoring policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefreshPreflight}
            disabled={checkingPreflight}
            className="text-xs h-9 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${checkingPreflight ? "animate-spin" : ""}`} />
            Run Preflight
          </Button>
        </div>
      </div>

      {/* Notification Toast Banner */}
      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium transition-all ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{message.text}</div>
          <button
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Exam Safety Warning Banner */}
      {activeExams > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-2">
              <span>Active Exam Safety Guard Engaged</span>
              <Badge className="bg-amber-600 text-white hover:bg-amber-700 text-xs">
                {activeExams} Active Candidate(s)
              </Badge>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Examination timers, fullscreen strike thresholds, and coding categories are currently locked. Modifying these settings during live student attempts is blocked to prevent deadline desynchronization or question bank corruption.
            </p>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 1. COMPETITION LIFECYCLE & STATE TRANSITIONS                          */}
      {/* --------------------------------------------------------------------- */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="bg-slate-50/60 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-900" />
                Competition Lifecycle State
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Regulated state-machine preventing arbitrary or destructive workflow jumps.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Current Status:
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}
              >
                {currentStatus === "in_progress" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {statusInfo.label}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <strong>State Policy:</strong> {statusInfo.desc}
          </p>

          {/* Transition Action Buttons */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Permitted State Transitions:
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {currentStatus === "draft" && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-blue-900 hover:bg-blue-800 text-white text-xs"
                    onClick={() => setPendingTargetStatus("registration_open")}
                  >
                    Open Registration
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setPendingTargetStatus("registration_closed")}
                  >
                    Close Registration
                  </Button>
                </>
              )}

              {currentStatus === "registration_open" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold"
                  onClick={() => setPendingTargetStatus("registration_closed")}
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
                  Close Registration
                </Button>
              )}

              {currentStatus === "registration_closed" && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold"
                    onClick={() => setPendingTargetStatus("ready")}
                    disabled={preflight ? !preflight.canMarkReady : false}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                    Mark Competition Ready
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setPendingTargetStatus("registration_open")}
                  >
                    Re-open Registration
                  </Button>
                </>
              )}

              {currentStatus === "ready" && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm"
                    onClick={() => setPendingTargetStatus("in_progress")}
                    disabled={preflight ? !preflight.canStart : false}
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-white" />
                    Start Competition Now
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setPendingTargetStatus("registration_closed")}
                  >
                    Revert to Registration Closed
                  </Button>
                </>
              )}

              {currentStatus === "in_progress" && (
                <Button
                  type="button"
                  size="sm"
                  className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold"
                  onClick={() => setPendingTargetStatus("completed")}
                >
                  <Pause className="w-3.5 h-3.5 mr-1.5 fill-white" />
                  Conclude Competition
                </Button>
              )}

              {currentStatus === "evaluation_pending" && (
                <Button
                  type="button"
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                  onClick={() => setPendingTargetStatus("completed")}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Mark Evaluation Complete
                </Button>
              )}

              {currentStatus === "completed" && (
                <Button
                  type="button"
                  size="sm"
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm"
                  onClick={() => setPendingTargetStatus("results_published")}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Publish Official Results
                </Button>
              )}

              {currentStatus === "results_published" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-rose-300 text-rose-800 hover:bg-rose-50 text-xs font-medium"
                  onClick={() => setPendingTargetStatus("completed")}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                  Unpublish / Retract Results
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* 2. PREFLIGHT READINESS CHECKLIST                                      */}
      {/* --------------------------------------------------------------------- */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="bg-slate-50/60 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Preflight Examination Checklist
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Automated pre-launch gatekeeper verifying student rosters, 80M MCQ balance, coding tracks, and test suites.
              </CardDescription>
            </div>

            {preflight && (
              <Badge
                variant="outline"
                className={`text-xs px-2.5 py-1 font-bold ${
                  preflight.canStart
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-amber-50 text-amber-800 border-amber-300"
                }`}
              >
                {preflight.summary.passedCount} of {preflight.summary.totalRequired} Checks Passed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {preflight ? (
            <div className="divide-y divide-slate-100">
              {preflight.checks.map((c) => (
                <div key={c.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{c.label}</span>
                      {c.required && (
                        <span className="text-[10px] font-semibold text-rose-600 uppercase">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{c.details}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {c.currentValue !== undefined && (
                      <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {String(c.currentValue)}
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      {c.passed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-4 text-center">
              Preflight checklist not yet loaded.
            </div>
          )}
        </CardContent>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* 3. COMPETITION CONFIGURATION FORM                                     */}
      {/* --------------------------------------------------------------------- */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section A: Institutional Identity & Logo */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2Icon className="w-4 h-4 text-blue-900" />
              Institution Identity & Seal
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              The official seal is rendered with fixed aspect ratios across login cards, student examination desk, and merit scorecards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="bg-white rounded-full p-2 border-2 border-blue-900/20 shadow-xs shrink-0 w-16 h-16 flex items-center justify-center">
                <Image
                  src={collegeLogoUrl || "/images/college-logo.png"}
                  alt="Official Seal"
                  width={48}
                  height={48}
                  className="object-contain max-h-12 w-auto"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900">LNMCBM Seal Active</h4>
                <p className="text-xs text-slate-500">
                  Logo Asset: <code className="text-blue-900 font-mono text-[11px]">{collegeLogoUrl}</code>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Competition Title"
                value={competitionName}
                onChange={(e) => setCompetitionName(e.target.value)}
                required
              />
              <Input
                label="Institution Name"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Competition Date"
                type="date"
                value={competitionDate}
                onChange={(e) => setCompetitionDate(e.target.value)}
                required
              />
              <Input
                label="Helpdesk Email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
              <Input
                label="Helpline Phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section B: Examination Durations & Proctoring */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-900" />
              Examination Timers & Integrity Policy
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Authoritative countdown clocks. Active student sessions lock their snapshot deadline at attempt start.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Phase 1 Duration (Minutes)"
                  type="number"
                  min={5}
                  max={180}
                  value={phase1Duration}
                  onChange={(e) => setPhase1Duration(Number(e.target.value))}
                  disabled={activeExams > 0}
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Default: 45 min (40 MCQs / 80 Marks)</p>
              </div>

              <div>
                <Input
                  label="Phase 2 Duration (Minutes)"
                  type="number"
                  min={5}
                  max={180}
                  value={phase2Duration}
                  onChange={(e) => setPhase2Duration(Number(e.target.value))}
                  disabled={activeExams > 0}
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Default: 30 min (2 Coding Problems / 20 Marks)</p>
              </div>

              <div>
                <Input
                  label="Fullscreen Strike Threshold"
                  type="number"
                  min={1}
                  max={10}
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(Number(e.target.value))}
                  disabled={activeExams > 0}
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Maximum warnings before auto-termination (Default: 3)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section C: Eligible Coding Categories */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-900" />
              Eligible Phase 2 Coding Tracks
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Select which programming language pathways candidates can choose for Phase 2.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_CODING_CATEGORIES.map((cat) => {
                const isSelected = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    disabled={activeExams > 0}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-blue-900 bg-blue-50/60 text-blue-950 font-bold shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-medium"
                    } ${activeExams > 0 ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <span className="text-xs">{cat}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section D: Participant Instructions */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-900" />
              Candidate Examination Guidelines
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Rules and notices presented to students on their portal dashboard before launch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
              className="w-full text-xs font-mono p-3 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              placeholder="Enter student examination instructions..."
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-10 px-6 shadow-sm"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                Saving Configuration...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-2" />
                Save Competition Settings
              </>
            )}
          </Button>
        </div>
      </form>

      {/* --------------------------------------------------------------------- */}
      {/* TRANSITION CONFIRMATION MODAL                                         */}
      {/* --------------------------------------------------------------------- */}
      {pendingTargetStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-blue-900" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Confirm State Transition
                </h3>
                <p className="text-xs text-slate-500">
                  Target State:{" "}
                  <strong className="text-blue-900 font-bold">
                    {STATUS_LABELS[pendingTargetStatus]?.label || pendingTargetStatus}
                  </strong>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
              <div className="font-bold text-slate-900">Impact Analysis:</div>
              {pendingTargetStatus === "in_progress" && (
                <p>
                  Starting the competition unlocks examination desks for all active enrolled candidates, enables countdown clocks, and engages automated proctoring monitoring.
                </p>
              )}
              {pendingTargetStatus === "completed" && (
                <p>
                  Concluding the competition finalizes all active student attempts, locks code editor submissions, and advances results to the final merit computation stage.
                </p>
              )}
              {pendingTargetStatus === "results_published" && (
                <p>
                  Publishing results grants candidates immediate access to their certified scorecards, numerical scores, and state merit rankings.
                </p>
              )}
              {pendingTargetStatus === "ready" && (
                <p>
                  Marking ready validates that all 8 curriculum and student preconditions are satisfied and closes registration.
                </p>
              )}
              {pendingTargetStatus === "registration_open" && (
                <p>
                  Opening registration allows administrators to enroll candidates and bulk-import CSV rosters.
                </p>
              )}
              {pendingTargetStatus === "registration_closed" && (
                <p>
                  Closing registration freezes student enrollment rosters for examination preparation.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Administrative Justification / Audit Note (Optional):
              </label>
              <textarea
                value={transitionJustification}
                onChange={(e) => setTransitionJustification(e.target.value)}
                rows={2}
                placeholder="Reason for triggering this consequential lifecycle transition..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-9"
                onClick={() => setPendingTargetStatus(null)}
                disabled={transitioning}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-blue-900 hover:bg-blue-800 text-white text-xs h-9 font-bold px-4"
                onClick={handleExecuteTransition}
                disabled={transitioning}
              >
                {transitioning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Executing...
                  </>
                ) : (
                  "Confirm & Transition"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Building2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
