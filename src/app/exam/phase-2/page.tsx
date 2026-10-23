"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Code2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Loader2,
  AlertCircle,
  HelpCircle,
  Laptop,
  Lock,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  Play,
  Send,
  RotateCcw,
  Terminal,
  Eye,
  Check,
  X,
  AlertTriangle,
  Copy,
  Square,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MonacoCodeEditor } from "@/components/exam/MonacoCodeEditor";
import { formatInlineCode } from "@/components/exam/QuestionCodeBox";
import { ExamTerminationScreen } from "@/components/exam/ExamTerminationScreen";
import { ExamWarningModal } from "@/components/exam/ExamWarningModal";
import { ExamPreFlightNoticeModal } from "@/components/exam/ExamPreFlightNoticeModal";
import {
  CategoryTrackConfig,
  CodingCategory,
  DSALanguage,
  StudentSafeCodingProblem,
} from "@/lib/services/coding-problems-service";
import { SampleRunResponse } from "@/lib/services/code-execution-service";
import { ProblemWorkstate } from "@/lib/services/exam-service";

export default function Phase2ExamWorkspacePage() {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [starting, setStarting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Candidate and Session State
  const [student, setStudent] = React.useState<{
    id: string;
    full_name: string;
    roll_number: string;
    participant_id: string;
  } | null>(null);

  const [categories, setCategories] = React.useState<CategoryTrackConfig[]>([]);
  const [sessionStatus, setSessionStatus] = React.useState<string>("not_started");

  // Track Selection State
  const [selectedCategory, setSelectedCategory] = React.useState<CodingCategory>("Python");
  const [selectedDsaLanguage, setSelectedDsaLanguage] = React.useState<DSALanguage>("C++");
  const [phase1Track, setPhase1Track] = React.useState<string | null>(null);
  const [phase1Language, setPhase1Language] = React.useState<string | null>(null);
  const [confirmedReady, setConfirmedReady] = React.useState(false);

  // Active / Locked Phase 2 State
  const [isLocked, setIsLocked] = React.useState(false);
  const [lockedCategory, setLockedCategory] = React.useState<string>("");
  const [lockedLanguage, setLockedLanguage] = React.useState<string>("");
  const [assignedProblems, setAssignedProblems] = React.useState<StudentSafeCodingProblem[]>([]);
  const [remainingSeconds, setRemainingSeconds] = React.useState<number>(30 * 60);

  // Live Coding Workspace State
  const [activeProblemIndex, setActiveProblemIndex] = React.useState<number>(0);
  const [workstates, setWorkstates] = React.useState<Record<string, ProblemWorkstate>>({});
  const [runResults, setRunResults] = React.useState<Record<string, SampleRunResponse | null>>({});
  const [isRunning, setIsRunning] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [autosaveStatus, setAutosaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [activeBottomTab, setActiveBottomTab] = React.useState<"console" | "sample" | "preview">("sample");
  const [copiedSample, setCopiedSample] = React.useState(false);

  // Fullscreen & Proctoring State
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [warningModalOpen, setWarningModalOpen] = React.useState(false);
  const [warningMessage, setWarningMessage] = React.useState("");
  const [warningsCount, setWarningsCount] = React.useState(0);
  const [isTerminated, setIsTerminated] = React.useState(false);
  const [terminationReason, setTerminationReason] = React.useState<string | null>(null);
  const [showPreFlightNotice, setShowPreFlightNotice] = React.useState(false);
  const [isExamStoppedByAdmin, setIsExamStoppedByAdmin] = React.useState(false);

  const activeProblem = assignedProblems[activeProblemIndex] || null;
  const activeWorkstate = activeProblem ? workstates[activeProblem.id] : null;
  const activeRunResult = activeProblem ? runResults[activeProblem.id] : null;

  // Load session status and category readiness configurations
  const loadPhase2Data = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Check student profile & active exam session
      const sessionRes = await fetch("/api/student/exam/session");
      if (!sessionRes.ok) {
        router.replace("/login/student");
        return;
      }
      const sessionData = await sessionRes.json();
      setStudent(sessionData.student);

      const session = sessionData.session;
      if (!session || session.status === "not_started") {
        router.replace("/student/dashboard");
        return;
      }

      if (session.is_terminated || session.status === "terminated") {
        setIsTerminated(true);
        setTerminationReason(session.termination_reason || "Examination access terminated.");
        setLoading(false);
        return;
      }

      if (session.status === "phase1_in_progress") {
        router.replace("/exam/phase-1");
        return;
      }

      setSessionStatus(session.status);
      setWarningsCount(session.fullscreen_warnings_count || 0);

      // Pre-populate with candidate's track from Phase 1 or prior selection
      if (session.phase2_category) {
        setPhase1Track(session.phase2_category);
        setSelectedCategory(session.phase2_category as CodingCategory);
      }
      if (session.phase2_language) {
        setPhase1Language(session.phase2_language);
        if (
          session.phase2_language === "C" ||
          session.phase2_language === "C++" ||
          session.phase2_language === "Java"
        ) {
          setSelectedDsaLanguage(session.phase2_language as DSALanguage);
        }
      }

      // 2. Fetch category configurations
      const catRes = await fetch("/api/student/exam/phase2/categories");
      if (!catRes.ok) throw new Error("Failed to load category configurations.");
      const catData = await catRes.json();
      setCategories(catData.categories || []);

      // 3. Check if Phase 2 is in progress or completed
      if (
        session.status === "phase2_in_progress" ||
        session.status === "phase2_completed"
      ) {
        setIsLocked(true);
        setLockedCategory(session.phase2_category || "Unknown");
        setLockedLanguage(session.phase2_language || "Default");

        if (session.status === "phase2_in_progress" && !document.fullscreenElement) {
          setShowPreFlightNotice(true);
        }

        // Fetch assigned problems and candidate workstates
        const p2SessionRes = await fetch("/api/student/exam/phase2/session");
        if (p2SessionRes.ok) {
          const p2Data = await p2SessionRes.json();
          setAssignedProblems(p2Data.problems || []);
          if (p2Data.workstates) {
            setWorkstates(p2Data.workstates);
          }
          if (p2Data.remainingSeconds !== undefined) {
            setRemainingSeconds(p2Data.remainingSeconds);
          }
        }
      }
    } catch (err: unknown) {
      console.error("Phase 2 load error:", err);
      setError(err instanceof Error ? err.message : "Error verifying Phase 2 readiness.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    loadPhase2Data();
  }, [loadPhase2Data]);

  // Real-time synchronization: listen for admin stopping the test from operations center
  React.useEffect(() => {
    if (sessionStatus === "phase2_completed" || isTerminated || isExamStoppedByAdmin) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/student/competition-status");
        if (res.ok) {
          const data = await res.json();
          if (data.status && data.status !== "in_progress") {
            setIsExamStoppedByAdmin(true);
            setTimeout(() => {
              router.push("/student/scorecard");
            }, 3500);
          }
        }
      } catch {
        // network jitter, ignore
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionStatus, isTerminated, isExamStoppedByAdmin, router]);

  // Phase 2 Live Timer Loop
  React.useEffect(() => {
    if (!isLocked || sessionStatus !== "phase2_in_progress") return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSessionStatus("phase2_completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, sessionStatus]);

  // Handle Starting Phase 2
  const handleStartPhase2 = async () => {
    if (!confirmedReady) return;

    try {
      setStarting(true);
      setError(null);

      const payload: { category: CodingCategory; language?: string } = {
        category: selectedCategory,
      };

      if (selectedCategory === "DSA") {
        payload.language = selectedDsaLanguage;
      }

      const res = await fetch("/api/student/exam/phase2/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start Phase 2.");
      }

      setIsLocked(true);
      setSessionStatus("phase2_in_progress");
      setLockedCategory(data.category);
      setLockedLanguage(data.language);
      setAssignedProblems(data.problems || []);
      setRemainingSeconds(data.remainingSeconds || 30 * 60);

      if (data.workstates) {
        setWorkstates(data.workstates);
      }

      if (!document.fullscreenElement) {
        setShowPreFlightNotice(true);
      }
    } catch (err: unknown) {
      console.error("Phase 2 start error:", err);
      setError(err instanceof Error ? err.message : "Failed to initiate coding phase.");
    } finally {
      setStarting(false);
    }
  };

  const recordViolation = React.useCallback(
    async (type: "fullscreen_exit" | "tab_switch" | "window_blur", message: string) => {
      try {
        const res = await fetch("/api/student/exam/violation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventType: type, metadata: { reason: message } }),
        });
        const data = await res.json();
        if (data.isTerminated) {
          setIsTerminated(true);
          setTerminationReason(data.terminationReason || "Exceeded maximum permissible violations (3/3).");
          setWarningModalOpen(false);
          setShowPreFlightNotice(false);
          return;
        }
        if (data.warningsCount !== undefined) {
          setWarningsCount(data.warningsCount);
        }
        if (!data.deduplicated && !data.isTerminated) {
          setWarningMessage(message);
          setWarningModalOpen(true);
        }
      } catch {
        // Ignore network errors on violation logging
      }
    },
    []
  );

  // Fullscreen & Proctoring Listeners for Phase 2
  React.useEffect(() => {
    if (loading || !isLocked || sessionStatus !== "phase2_in_progress" || isTerminated) return;

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active && !isTerminated) {
        recordViolation("fullscreen_exit", "Candidate exited browser fullscreen mode.");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isTerminated) {
        recordViolation("tab_switch", "Candidate navigated away from examination tab.");
      }
    };

    const handleBlur = () => {
      if (!isTerminated) {
        recordViolation("window_blur", "Browser window lost focus.");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [loading, isLocked, sessionStatus, isTerminated, recordViolation]);

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
      setWarningModalOpen(false);
      setShowPreFlightNotice(false);
      await fetch("/api/student/exam/violation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "warning_acknowledged",
          metadata: { action: "fullscreen_reentered", timestamp: new Date().toISOString() },
        }),
      }).catch(() => {});
    } catch {
      setWarningModalOpen(false);
      setShowPreFlightNotice(false);
    }
  };

  // Debounced Autosave for Code Buffer
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCodeChange = (newCode: string) => {
    if (!activeProblem) return;

    // Update local state immediately
    setWorkstates((prev) => ({
      ...prev,
      [activeProblem.id]: {
        ...(prev[activeProblem.id] || {
          problem_id: activeProblem.id,
          language: lockedLanguage,
          is_submitted: false,
          status: "draft",
        }),
        source_code: newCode,
      },
    }));

    setAutosaveStatus("saving");

    // Debounce save request by 1200ms
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/student/exam/phase2/save-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problem_id: activeProblem.id,
            source_code: newCode,
            language: lockedLanguage,
          }),
        });
        if (res.ok) {
          setAutosaveStatus("saved");
        } else {
          setAutosaveStatus("error");
        }
      } catch {
        setAutosaveStatus("error");
      }
    }, 1200);
  };

  // Handle Run Sample Test
  const handleRunSample = async () => {
    if (!activeProblem || isRunning) return;

    const currentCode = activeWorkstate?.source_code || "";
    if (!currentCode.trim()) {
      setError("Please write some code before executing.");
      return;
    }

    try {
      setIsRunning(true);
      setError(null);
      setActiveBottomTab("sample");

      const res = await fetch("/api/student/exam/phase2/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: activeProblem.id,
          source_code: currentCode,
          language: lockedLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to execute code.");
      }

      setRunResults((prev) => ({
        ...prev,
        [activeProblem.id]: data,
      }));
    } catch (err: unknown) {
      console.error("Run error:", err);
      setError(err instanceof Error ? err.message : "Failed to run test.");
    } finally {
      setIsRunning(false);
    }
  };

  // Handle Submit Final Solution for Problem
  const handleConfirmSubmit = async () => {
    if (!activeProblem || isSubmitting) return;

    const currentCode = activeWorkstate?.source_code || "";
    if (!currentCode.trim()) {
      setError("Cannot submit an empty solution.");
      setShowSubmitModal(false);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch("/api/student/exam/phase2/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_id: activeProblem.id,
          source_code: currentCode,
          language: lockedLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit solution.");
      }

      // Mark problem as submitted locally
      setWorkstates((prev) => ({
        ...prev,
        [activeProblem.id]: {
          ...prev[activeProblem.id],
          is_submitted: true,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        },
      }));

      setShowSubmitModal(false);

      if (data.is_all_problems_submitted) {
        setSessionStatus("phase2_completed");
      }
    } catch (err: unknown) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  if (isTerminated) {
    return (
      <ExamTerminationScreen
        student={student}
        terminationReason={terminationReason}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <span className="text-sm font-semibold tracking-wide">
          Loading Phase 2 Examination Workspace...
        </span>
      </div>
    );
  }

  const isTimerExpired = remainingSeconds <= 0;
  const isSelectedCategoryConfigured = categories.find((c) => c.category === selectedCategory)?.isConfigured ?? false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ============================================================== */}
      {/* TOP EXAMINATION APP BAR */}
      {/* ============================================================== */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
        {/* College & Competition Branding */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/college-logo.png"
            alt="LNMCBM Logo"
            width={28}
            height={28}
            className="rounded object-contain"
            priority
          />
          <div className="hidden sm:block">
            <h1 className="text-xs font-extrabold uppercase tracking-wider text-white">
              LNMCBM CODETHON 2026
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Phase 2: Live Programming Evaluation
            </p>
          </div>
        </div>

        {/* Middle: Track and Problem Nav Tabs (If Locked/Active) */}
        {isLocked && assignedProblems.length > 0 && (
          <div className="flex items-center gap-2">
            {assignedProblems.map((prob, idx) => {
              const ws = workstates[prob.id];
              const isSubmitted = ws?.is_submitted;
              const isActive = idx === activeProblemIndex;

              return (
                <button
                  key={prob.id}
                  onClick={() => setActiveProblemIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Problem #{idx + 1}</span>
                  {isSubmitted ? (
                    <Badge variant="success" className="h-4 px-1 text-[9px] bg-emerald-600/90">
                      ✓ Submitted
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-slate-700">
                      10M
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Right Controls: Timer & Candidate Badge */}
        <div className="flex items-center gap-3">
          {isLocked && (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-colors ${
                remainingSeconds < 300
                  ? "bg-red-950/80 border-red-700 text-red-400 animate-pulse"
                  : "bg-slate-950 border-slate-700 text-emerald-400"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(remainingSeconds)}</span>
            </div>
          )}

          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-200">{student?.full_name}</span>
            <span className="text-[10px] font-mono text-slate-400">Roll: {student?.roll_number}</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/student/dashboard")}
            className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800 h-8"
          >
            Dashboard
          </Button>
        </div>
      </header>

      {/* Global Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-950 border-b border-red-800 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN A: PRE-START CATEGORY & LANGUAGE SELECTION              */}
      {/* ============================================================== */}
      {!isLocked && (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Header Title */}
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-950 border border-blue-800 text-blue-300 text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Phase 2 Selection Window
            </div>
            <h2 className="text-2xl font-extrabold text-white">Choose Your Phase 2 Coding Track</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Select the language or domain you wish to be evaluated in for Phase 2. Once confirmed, you will be assigned 2 domain-specific programming challenges with 30 minutes to complete.
            </p>
          </div>

          {phase1Track && (
            <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Phase 1 Track Selected:</span>
                    <Badge variant="default" className="bg-blue-600 text-white font-mono text-[11px]">
                      {phase1Track}
                      {phase1Track === "DSA" && phase1Language ? ` (${phase1Language})` : ""}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Your coding track is pre-selected to match your Phase 1 track. You may keep this or switch tracks below before clicking Start.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.category;
              const isConfigured = cat.isConfigured;

              return (
                <div
                  key={cat.category}
                  onClick={() => isConfigured && setSelectedCategory(cat.category)}
                  className={`p-5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? "bg-slate-900 border-blue-500 ring-2 ring-blue-500/30 shadow-xl"
                      : isConfigured
                      ? "bg-slate-900/60 border-slate-800 hover:border-slate-700 cursor-pointer"
                      : "bg-slate-950 border-slate-800/40 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-white">{cat.name}</span>
                    {isConfigured ? (
                      <Badge variant="success" className="text-[10px] bg-emerald-600/20 text-emerald-300 border-emerald-700">
                        Ready (2 Probs)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-amber-800 text-amber-400">
                        Pending Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{cat.description}</p>
                </div>
              );
            })}
          </div>

          {/* DSA Language Sub-selector */}
          {selectedCategory === "DSA" && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Select Your DSA Implementation Language
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {(["C", "C++", "Java"] as DSALanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedDsaLanguage(lang)}
                    className={`p-3 rounded-lg border text-center font-bold text-xs transition-all ${
                      selectedDsaLanguage === lang
                        ? "bg-blue-600 text-white border-blue-500 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation & Start */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedReady}
                onChange={(e) => setConfirmedReady(e.target.checked)}
                disabled={!isSelectedCategoryConfigured}
                className="w-4 h-4 text-blue-600 rounded border-slate-700 bg-slate-950 mt-0.5"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                I confirm my choice of <strong className="text-white">{selectedCategory} {selectedCategory === "DSA" ? `(${selectedDsaLanguage})` : ""}</strong>.
                I understand this selection is permanent and the 30-minute exam timer will start immediately.
              </span>
            </label>

            <div className="flex justify-end">
              <Button
                variant="primary"
                disabled={!confirmedReady || !isSelectedCategoryConfigured || starting}
                onClick={handleStartPhase2}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-2.5"
              >
                {starting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting 30-Min Test...
                  </>
                ) : (
                  <>
                    Start Coding Test (30 Minutes)
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCREEN B: ACTIVE LIVE CODING WORKSPACE (TWO-PANEL RESIZABLE)    */}
      {/* ============================================================== */}
      {isLocked && activeProblem && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* ------------------------------------------------------------ */}
          {/* LEFT PANEL: PROBLEM SPECIFICATIONS & TABS                    */}
          {/* ------------------------------------------------------------ */}
          <div className="w-full md:w-[45%] lg:w-[40%] border-r border-slate-800 bg-slate-950 flex flex-col overflow-hidden shrink-0">
            {/* Problem Header Info */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                  Problem {activeProblemIndex + 1} of 2
                </span>
                <Badge variant="secondary" className="bg-slate-800 text-slate-200 text-[10px] font-bold">
                  10 Marks (5 Tests × 2M)
                </Badge>
              </div>
              <h2 className="text-base font-bold text-white">{activeProblem.title}</h2>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
                <span>Time: {activeProblem.time_limit_ms}ms</span>
                <span>•</span>
                <span>Memory: {activeProblem.memory_limit_mb}MB</span>
                <span>•</span>
                <span className="text-slate-300">Lang: {lockedLanguage}</span>
              </div>
            </div>

            {/* Problem Body Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300 leading-relaxed">
              {/* Problem Statement */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Problem Description
                </h4>
                <div className="whitespace-pre-line text-slate-200">
                  {formatInlineCode(activeProblem.problem_statement)}
                </div>
              </div>

              {/* Input & Output Format */}
              <div className="grid grid-cols-1 gap-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <div>
                  <strong className="text-slate-200 block text-[11px] font-semibold mb-1">
                    Input Format:
                  </strong>
                  <p className="text-slate-400">{activeProblem.input_format}</p>
                </div>
                <div>
                  <strong className="text-slate-200 block text-[11px] font-semibold mb-1">
                    Output Format:
                  </strong>
                  <p className="text-slate-400">{activeProblem.output_format}</p>
                </div>
              </div>

              {/* Constraints */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Constraints
                </h4>
                <pre className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300">
                  {activeProblem.constraints}
                </pre>
              </div>

              {/* Sample Test Case */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Sample Test Case
                  </h4>
                  <button
                    onClick={() => copyToClipboard(activeProblem.sample_input)}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedSample ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Input</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                      Sample Input:
                    </span>
                    <pre className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto">
                      {activeProblem.sample_input}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">
                      Sample Output:
                    </span>
                    <pre className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto">
                      {activeProblem.sample_output}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT PANEL: MONACO EDITOR, CONTROLS, & OUTPUT CONSOLE       */}
          {/* ------------------------------------------------------------ */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {/* Editor Action Bar */}
            <div className="h-10 border-b border-slate-800 bg-slate-900/80 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-300">
                  {lockedLanguage}
                </span>

                {/* Autosave Status */}
                <div className="text-[11px] flex items-center gap-1 text-slate-400 font-mono">
                  {autosaveStatus === "saving" && (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                      <span>Saving draft...</span>
                    </>
                  )}
                  {autosaveStatus === "saved" && (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-slate-400">Draft saved</span>
                    </>
                  )}
                </div>
              </div>

              {/* Run & Submit Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isRunning || isSubmitting || activeWorkstate?.is_submitted || isTimerExpired}
                  onClick={handleRunSample}
                  className="h-7 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-blue-400" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-400 fill-emerald-400" />
                      Run Sample
                    </>
                  )}
                </Button>

                {activeWorkstate?.is_submitted ? (
                  <Badge variant="success" className="h-7 px-3 bg-emerald-600/90 text-xs font-bold">
                    ✓ Final Solution Submitted
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isSubmitting || isTimerExpired}
                    onClick={() => setShowSubmitModal(true)}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Submit Final
                  </Button>
                )}
              </div>
            </div>

            {/* Monaco Code Editor Container */}
            <div className="flex-1 overflow-hidden relative">
              <MonacoCodeEditor
                value={activeWorkstate?.source_code || ""}
                onChange={handleCodeChange}
                language={lockedLanguage}
                readOnly={activeWorkstate?.is_submitted || isTimerExpired}
              />

              {/* Locked Submission Overlay Banner */}
              {activeWorkstate?.is_submitted && (
                <div className="absolute top-2 right-4 bg-emerald-950/90 border border-emerald-700 text-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2 z-10">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Submission Accepted &amp; Locked for Evaluation</span>
                </div>
              )}
            </div>

            {/* Bottom Console / Execution Result Drawer */}
            <div className="h-48 border-t border-slate-800 bg-slate-900 flex flex-col shrink-0">
              {/* Drawer Tabs */}
              <div className="h-8 border-b border-slate-800 bg-slate-950/80 px-3 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveBottomTab("sample")}
                    className={`px-3 py-1 rounded-t text-xs font-bold transition-colors ${
                      activeBottomTab === "sample"
                        ? "bg-slate-900 text-blue-400 border-t border-l border-r border-slate-800"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Sample Test Output
                  </button>
                  <button
                    onClick={() => setActiveBottomTab("console")}
                    className={`px-3 py-1 rounded-t text-xs font-bold transition-colors ${
                      activeBottomTab === "console"
                        ? "bg-slate-900 text-blue-400 border-t border-l border-r border-slate-800"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Execution Log
                  </button>
                  {lockedCategory === "Web Development" && (
                    <button
                      onClick={() => setActiveBottomTab("preview")}
                      className={`px-3 py-1 rounded-t text-xs font-bold transition-colors ${
                        activeBottomTab === "preview"
                          ? "bg-slate-900 text-blue-400 border-t border-l border-r border-slate-800"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Web Sandbox Preview
                    </button>
                  )}
                </div>

                {activeRunResult && (
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-slate-400">
                      Time: <strong className="text-slate-200">{activeRunResult.execution_time_ms}ms</strong>
                    </span>
                    <span className="text-slate-400">
                      Memory: <strong className="text-slate-200">{(activeRunResult.memory_kb / 1024).toFixed(1)}MB</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">
                {activeBottomTab === "sample" && (
                  <div>
                    {!activeRunResult ? (
                      <div className="h-full flex items-center justify-center text-slate-500 py-6">
                        Click &quot;Run Sample&quot; to test your code against the public sample input.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Status Header */}
                        <div className="flex items-center gap-2">
                          {activeRunResult.sample_matches ? (
                            <Badge variant="success" className="bg-emerald-600/20 text-emerald-300 border-emerald-700">
                              ✓ Sample Test Passed
                            </Badge>
                          ) : activeRunResult.status === "compilation_error" ? (
                            <Badge variant="danger">Compilation Error</Badge>
                          ) : activeRunResult.status === "runtime_error" ? (
                            <Badge variant="danger">Runtime Error</Badge>
                          ) : activeRunResult.status === "time_limit_exceeded" ? (
                            <Badge variant="danger">Time Limit Exceeded</Badge>
                          ) : (
                            <Badge variant="danger">Wrong Answer (Sample Mismatch)</Badge>
                          )}
                        </div>

                        {/* Error output if any */}
                        {activeRunResult.stderr && (
                          <pre className="p-2.5 bg-red-950/40 border border-red-900 rounded text-red-300 overflow-x-auto text-[11px]">
                            {activeRunResult.stderr}
                          </pre>
                        )}

                        {/* Expected vs Actual */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Your Output:</span>
                            <pre className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-200 overflow-x-auto text-[11px]">
                              {activeRunResult.stdout || "(Empty Output)"}
                            </pre>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Expected Sample Output:</span>
                            <pre className="p-2 bg-slate-950 rounded border border-slate-800 text-slate-200 overflow-x-auto text-[11px]">
                              {activeRunResult.sample_expected}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeBottomTab === "console" && (
                  <div>
                    <pre className="text-slate-300 whitespace-pre-wrap">
                      {activeRunResult?.compile_output || activeRunResult?.stderr || activeRunResult?.stdout || "No execution logs available."}
                    </pre>
                  </div>
                )}

                {activeBottomTab === "preview" && lockedCategory === "Web Development" && (
                  <div className="h-full w-full bg-white rounded overflow-hidden">
                    <iframe
                      title="Web Sandbox Preview"
                      sandbox="allow-scripts"
                      srcDoc={activeWorkstate?.source_code || "<p>No HTML to preview.</p>"}
                      className="w-full h-full border-0"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FINAL SUBMISSION CONFIRMATION MODAL                            */}
      {/* ============================================================== */}
      {showSubmitModal && activeProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-700 flex items-center justify-center text-blue-400 shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Confirm Submission for Problem #{activeProblemIndex + 1}
                </h3>
                <p className="text-xs text-slate-400">{activeProblem.title}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                Your solution will be evaluated on the server against <strong className="text-white">5 hidden test cases</strong> (2 marks each, carrying 10 marks total).
              </p>
              <p className="text-amber-300 font-medium">
                ⚠️ Once accepted, your code for this problem will be permanently locked and cannot be edited.
              </p>
              <p className="text-slate-400">
                You can still continue writing and testing code for your other problem while time remains.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmitModal(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Evaluating 5 Hidden Tests...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Lock &amp; Submit Solution
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PRE-FLIGHT NOTICE MODAL */}
      <ExamPreFlightNoticeModal
        isOpen={showPreFlightNotice && !isTerminated && !loading}
        phaseNumber={2}
        phaseName="Coding Assessment (2 Problems)"
        durationMinutes={30}
        onConfirmAndEnterFullscreen={requestFullscreen}
      />

      {/* FULLSCREEN / INTEGRITY WARNING MODAL */}
      <ExamWarningModal
        isOpen={warningModalOpen && !isTerminated && !loading}
        warningsCount={warningsCount}
        maxWarnings={3}
        reason={warningMessage}
        onReenterFullscreen={requestFullscreen}
      />

      {/* ADMIN EMERGENCY/OFFICIAL STOP OVERLAY */}
      {isExamStoppedByAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Square className="w-8 h-8 fill-current" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">
                Examination Concluded by Controller
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                The administrator has officially stopped the examination. All of your coding solutions have been recorded and submitted automatically.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Redirecting to candidate scorecard...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
