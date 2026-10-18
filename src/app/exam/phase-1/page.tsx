"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  CheckCircle2,
  Layers,
  Code2,
  BookOpen,
  Maximize2,
  Loader2,
  Check,
  RotateCcw,
  Send,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentSafeQuestion } from "@/lib/services/questions-service";
import { SavedCandidateAnswer } from "@/lib/services/exam-service";
import { ExamTerminationScreen } from "@/components/exam/ExamTerminationScreen";
import { ExamWarningModal } from "@/components/exam/ExamWarningModal";
import { ExamPreFlightNoticeModal } from "@/components/exam/ExamPreFlightNoticeModal";

export default function Phase1ExaminationPage() {
  const router = useRouter();

  // Core Exam State
  const [loading, setLoading] = React.useState(true);
  const [examError, setExamError] = React.useState<string | null>(null);
  const [studentInfo, setStudentInfo] = React.useState<{
    id: string;
    roll_number: string;
    participant_id: string;
    full_name?: string;
    course?: string;
  } | null>(null);

  const [questions, setQuestions] = React.useState<StudentSafeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  // Answers Map: { [question_id]: SavedCandidateAnswer }
  const [answers, setAnswers] = React.useState<Record<string, SavedCandidateAnswer>>({});

  // Autosave status: "saved" | "saving" | "error"
  const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving" | "error">("saved");

  // Timer State (Server-Authoritative countdown)
  const [remainingSeconds, setRemainingSeconds] = React.useState<number>(45 * 60);
  const [timerExpired, setTimerExpired] = React.useState(false);

  // Fullscreen & Integrity Monitoring
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [warningModalOpen, setWarningModalOpen] = React.useState(false);
  const [warningMessage, setWarningMessage] = React.useState("");
  const [warningsCount, setWarningsCount] = React.useState(0);
  const [isTerminated, setIsTerminated] = React.useState(false);
  const [terminationReason, setTerminationReason] = React.useState<string | null>(null);
  const [showPreFlightNotice, setShowPreFlightNotice] = React.useState(false);

  // Submission Dialog & Phase 2 Transition Modal
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [phase1Completed, setPhase1Completed] = React.useState(false);

  // Mobile Question Palette Drawer
  const [mobilePaletteOpen, setMobilePaletteOpen] = React.useState(false);

  // Initialize or resume examination
  const initExam = React.useCallback(async () => {
    try {
      setLoading(true);
      setExamError(null);

      // Start or resume session
      const res = await fetch("/api/student/exam/start", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        if (data.is_terminated || data.error?.includes("TERMINATED") || data.error?.includes("terminated")) {
          setIsTerminated(true);
          setTerminationReason(data.error || "Examination access terminated.");
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Failed to initialize examination.");
      }

      if (data.session?.is_terminated || data.session?.status === "terminated") {
        setIsTerminated(true);
        setTerminationReason(data.session.termination_reason || "Examination access terminated.");
        setLoading(false);
        return;
      }

      setStudentInfo(data.student);
      setQuestions(data.questions || []);
      setAnswers(data.answers || {});
      setRemainingSeconds(data.remainingSeconds);
      setWarningsCount(data.session?.fullscreen_warnings_count || 0);

      // Check if fullscreen is already active; if not, open pre-flight notice modal
      if (!document.fullscreenElement) {
        setShowPreFlightNotice(true);
      }

      // If already submitted/completed, move straight to transition view
      if (data.session.status === "phase1_completed") {
        setPhase1Completed(true);
      }
    } catch (err: unknown) {
      console.error("Exam init error:", err);
      setExamError(err instanceof Error ? err.message : "Unable to load examination.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    initExam();
  }, [initExam]);

  // Server-Authoritative Timer Loop
  React.useEffect(() => {
    if (loading || phase1Completed || timerExpired || isTerminated) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimerExpired(true);
          handleAutoSubmitOnExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, phase1Completed, timerExpired, isTerminated]);

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

  // Fullscreen & Proctoring Listeners
  React.useEffect(() => {
    if (loading || phase1Completed || isTerminated) return;

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active && !phase1Completed && !loading && !isTerminated) {
        recordViolation("fullscreen_exit", "Candidate exited browser fullscreen mode.");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !phase1Completed && !loading && !isTerminated) {
        recordViolation("tab_switch", "Candidate navigated away from examination tab.");
      }
    };

    const handleBlur = () => {
      if (!phase1Completed && !loading && !isTerminated) {
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
  }, [phase1Completed, loading, isTerminated, recordViolation]);

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

  // Current Question Pointer
  const currentQuestion: StudentSafeQuestion | undefined = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  // Handle Option Selection with debounced autosave
  const handleSelectOption = async (optionKey: "A" | "B" | "C" | "D", optionId: string) => {
    if (!currentQuestion) return;

    const updatedAnswer: SavedCandidateAnswer = {
      question_id: currentQuestion.id,
      selected_option_id: optionId,
      selected_option_key: optionKey,
      is_marked_for_review: currentAnswer?.is_marked_for_review ?? false,
      saved_at: new Date().toISOString(),
    };

    // Optimistic state update
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: updatedAnswer,
    }));

    // Trigger save
    await saveAnswerToServer(updatedAnswer);
  };

  // Toggle Mark for Review
  const handleToggleMarkForReview = async () => {
    if (!currentQuestion) return;

    const newMarked = !(currentAnswer?.is_marked_for_review ?? false);
    const updatedAnswer: SavedCandidateAnswer = {
      question_id: currentQuestion.id,
      selected_option_id: currentAnswer?.selected_option_id || null,
      selected_option_key: currentAnswer?.selected_option_key || null,
      is_marked_for_review: newMarked,
      saved_at: new Date().toISOString(),
    };

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: updatedAnswer,
    }));

    await saveAnswerToServer(updatedAnswer);
  };

  // Clear Selection
  const handleClearSelection = async () => {
    if (!currentQuestion) return;

    const updatedAnswer: SavedCandidateAnswer = {
      question_id: currentQuestion.id,
      selected_option_id: null,
      selected_option_key: null,
      is_marked_for_review: currentAnswer?.is_marked_for_review ?? false,
      saved_at: new Date().toISOString(),
    };

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: updatedAnswer,
    }));

    await saveAnswerToServer(updatedAnswer);
  };

  // Server persistence helper
  const saveAnswerToServer = async (ans: SavedCandidateAnswer) => {
    try {
      setSaveStatus("saving");
      const res = await fetch("/api/student/exam/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: ans.question_id,
          selected_option_id: ans.selected_option_id,
          selected_option_key: ans.selected_option_key,
          is_marked_for_review: ans.is_marked_for_review,
          question_order_index: currentIndex,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.includes("EXAM_EXPIRED")) {
          setTimerExpired(true);
          handleAutoSubmitOnExpiry();
          return;
        }
        throw new Error(data.error);
      }

      setSaveStatus("saved");
    } catch (err) {
      console.error("Autosave failed:", err);
      setSaveStatus("error");
    }
  };

  // Final Submit Handler
  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/student/exam/submit-phase1", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setShowSubmitConfirmModal(false);
      setPhase1Completed(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error submitting examination");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit on timer expiry
  const handleAutoSubmitOnExpiry = async () => {
    try {
      await fetch("/api/student/exam/submit-phase1", { method: "POST" });
      setPhase1Completed(true);
    } catch {
      setPhase1Completed(true);
    }
  };

  // Format timer into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Summary counts for palette
  let answeredCount = 0;
  let markedCount = 0;

  questions.forEach((q) => {
    const a = answers[q.id];
    if (a?.selected_option_key || a?.selected_option_id) answeredCount++;
    if (a?.is_marked_for_review) markedCount++;
  });

  const unansweredCount = questions.length - answeredCount;

  if (isTerminated) {
    return (
      <ExamTerminationScreen
        student={studentInfo}
        terminationReason={terminationReason}
      />
    );
  }

  // Render Loading or Critical Error View
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-xs font-semibold text-slate-400">
          Initializing Proctored Examination Session...
        </p>
      </div>
    );
  }

  if (examError) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-950 border border-red-800 text-red-500 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Examination Access Notice</h2>
        <p className="text-xs text-slate-400 max-w-md mb-6">{examError}</p>
        <Button variant="primary" size="sm" onClick={() => router.push("/student/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Render Phase 1 Completed Transition Screen
  if (phase1Completed) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">
              Phase 1 Examination Submitted
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              All 40 questions have been locked and evaluated securely on the college server. Per competition policy, scores remain confidential until final adjudication.
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-left space-y-2">
            <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span>Next Step: Phase 2 Assessment</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Phase 2 consists of <strong>two live coding problems</strong> (20 Marks total) within your chosen domain (C, C++, Java, Python, Web Development, or DSA).
            </p>
            <div className="p-2.5 bg-blue-950/40 border border-blue-900/50 rounded text-[11px] text-blue-300">
              <strong>Notice:</strong> The Phase 2 (30-minute) timer does <em>not</em> start now. It starts only after you select your coding domain and click &quot;Start Coding Test&quot;.
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold text-sm"
            onClick={() => router.push("/student/dashboard")}
          >
            Continue to Candidate Dashboard &amp; Phase 2
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* PROCTORED TOP BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full p-1 w-8 h-8 flex-shrink-0 flex items-center justify-center shadow-xs">
            <Image
              src="/images/college-logo.png"
              alt="LNMCBM Logo"
              width={26}
              height={26}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                LNMCBM Codethon 2026
              </h1>
              <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono">
                • Roll: <strong className="text-slate-200">{studentInfo?.roll_number}</strong>
              </span>
            </div>
            <p className="text-[10px] text-blue-400">
              Phase 1: Technical &amp; MCQ Assessment
            </p>
          </div>
        </div>

        {/* Server Authoritative Timer & Status Badges */}
        <div className="flex items-center gap-3">
          {/* Autosave Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-[11px] border border-slate-700">
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                <span className="text-blue-300">Saving...</span>
              </>
            ) : saveStatus === "error" ? (
              <>
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span className="text-amber-300">Network Error (Retrying)</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">All Saved</span>
              </>
            )}
          </div>

          {/* Authoritative Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold border shadow-inner ${
              remainingSeconds < 300
                ? "bg-red-950/80 border-red-700 text-red-400 animate-pulse"
                : "bg-slate-950 border-slate-700 text-emerald-400"
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          {/* Fullscreen Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={requestFullscreen}
            className="text-xs text-slate-300 hover:text-white hover:bg-slate-800 h-8 px-2"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>

          {/* Mobile Palette Drawer Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMobilePaletteOpen(true)}
            className="lg:hidden text-xs h-8 px-2 border-slate-700 text-slate-300"
          >
            Palette ({answeredCount}/40)
          </Button>

          {/* Submit Button */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowSubmitConfirmModal(true)}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-3"
          >
            Submit Phase 1
          </Button>
        </div>
      </header>

      {/* MAIN EXAM WORK AREA */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* QUESTION PANEL (Columns 1-8) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-lg min-h-[580px]">
          {currentQuestion ? (
            <div className="space-y-4">
              {/* Question Header & Category Badge */}
              <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">
                    {currentQuestion.category}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-bold text-[11px] bg-slate-800 text-slate-200">
                    {currentQuestion.marks} {currentQuestion.marks === 1 ? "Mark" : "Marks"}
                  </Badge>
                </div>
              </div>

              {/* Case Study Background Passage (if applicable) */}
              {currentQuestion.case_study_passage && (
                <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" /> Background Case Study Passage
                  </div>
                  <p className="text-xs text-amber-200 leading-relaxed whitespace-pre-line">
                    {currentQuestion.case_study_passage}
                  </p>
                </div>
              )}

              {/* Question Text */}
              <div className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed pt-1">
                {currentQuestion.question_text}
              </div>

              {/* Code Snippet (if applicable) */}
              {currentQuestion.code_snippet && (
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs overflow-x-auto shadow-inner">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-2">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" /> Reference Code Snippet
                  </div>
                  <pre className="text-emerald-400 whitespace-pre-wrap">
                    {currentQuestion.code_snippet}
                  </pre>
                </div>
              )}

              {/* Four Selectable Answer Options */}
              <div className="space-y-3 pt-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected =
                    currentAnswer?.selected_option_key === opt.option_key ||
                    Boolean(opt.id && currentAnswer?.selected_option_id === opt.id);

                  return (
                    <label
                      key={opt.option_key}
                      onClick={() => handleSelectOption(opt.option_key, opt.id || opt.option_key)}
                      className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-950/50 shadow-xs ring-1 ring-blue-500"
                          : "border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "border border-slate-700 bg-slate-800 text-slate-300"
                        }`}
                      >
                        {opt.option_key}
                      </div>

                      <div className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed pt-0.5">
                        {opt.option_text}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-slate-500">
              No question selected.
            </div>
          )}

          {/* NAVIGATION FOOTER */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleMarkForReview}
                className={`text-xs ${
                  currentAnswer?.is_marked_for_review
                    ? "text-purple-300 bg-purple-950/60 border border-purple-800"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5 mr-1.5" />
                {currentAnswer?.is_marked_for_review ? "Marked for Review" : "Mark for Review"}
              </Button>

              {currentAnswer?.selected_option_key && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-xs text-slate-500 hover:text-red-400 hover:bg-slate-800"
                >
                  <RotateCcw className="w-3 h-3 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* DESKTOP QUESTION PALETTE (Columns 9-12) */}
        <div className="hidden lg:block lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Question Palette
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select any question number to navigate directly.
            </p>
          </div>

          {/* Palette Status Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700 inline-block" />
              <span>Unanswered ({unansweredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
              <span>Marked for Review ({markedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-blue-500 inline-block" />
              <span>Current Question</span>
            </div>
          </div>

          {/* 40 Question Numbers Grid */}
          <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto p-1">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isAnswered = Boolean(ans?.selected_option_key || ans?.selected_option_id);
              const isMarked = Boolean(ans?.is_marked_for_review);
              const isCurrent = idx === currentIndex;

              let btnClass = "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700";

              if (isAnswered && isMarked) {
                btnClass = "bg-purple-700 border-purple-500 text-white font-bold ring-1 ring-purple-400";
              } else if (isAnswered) {
                btnClass = "bg-emerald-600 border-emerald-500 text-white font-bold";
              } else if (isMarked) {
                btnClass = "bg-purple-600 border-purple-500 text-white font-bold";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg border text-xs font-mono font-bold transition-all relative ${btnClass} ${
                    isCurrent ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900" : ""
                  }`}
                  title={`Question ${idx + 1}: ${isAnswered ? "Answered" : "Unanswered"}${isMarked ? ", Marked for Review" : ""}`}
                >
                  {idx + 1}
                  {isMarked && isAnswered && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Submit Block */}
          <div className="pt-3 border-t border-slate-800">
            <Button
              variant="primary"
              className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white py-2.5"
              onClick={() => setShowSubmitConfirmModal(true)}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> Finish &amp; Submit Phase 1
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE PALETTE DRAWER */}
      {mobilePaletteOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-xs lg:hidden">
          <div className="bg-slate-900 border-t border-slate-800 p-5 rounded-t-2xl max-h-[70vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase text-slate-300">Question Palette</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setMobilePaletteOpen(false)}
                className="text-xs text-slate-400"
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isAnswered = Boolean(ans?.selected_option_key || ans?.selected_option_id);
                const isMarked = Boolean(ans?.is_marked_for_review);
                const isCurrent = idx === currentIndex;

                let btnClass = "bg-slate-800 border-slate-700 text-slate-300";
                if (isAnswered && isMarked) btnClass = "bg-purple-700 text-white font-bold";
                else if (isAnswered) btnClass = "bg-emerald-600 text-white font-bold";
                else if (isMarked) btnClass = "bg-purple-600 text-white font-bold";

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setMobilePaletteOpen(false);
                    }}
                    className={`h-9 rounded-lg border text-xs font-mono font-bold ${btnClass} ${
                      isCurrent ? "ring-2 ring-blue-400" : ""
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Submit Phase 1 Assessment?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Please review your answer summary before final submission.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="p-2 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
                <span className="text-[10px] text-emerald-400 block font-semibold">Answered</span>
                <strong className="text-base text-white">{answeredCount}</strong>
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-semibold">Unanswered</span>
                <strong className="text-base text-white">{unansweredCount}</strong>
              </div>
              <div className="p-2 bg-purple-950/40 border border-purple-800/40 rounded-lg">
                <span className="text-[10px] text-purple-400 block font-semibold">Review</span>
                <strong className="text-base text-white">{markedCount}</strong>
              </div>
            </div>

            <p className="text-[11px] text-amber-400 bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-lg text-left">
              <strong>Important:</strong> Once confirmed, your responses will be locked and cannot be edited. You will immediately proceed to Phase 2.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmitConfirmModal(false)}
                disabled={submitting}
                className="text-xs border-slate-700 text-slate-300"
              >
                Resume Exam
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 font-bold text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PRE-FLIGHT NOTICE MODAL */}
      <ExamPreFlightNoticeModal
        isOpen={showPreFlightNotice && !isTerminated && !loading}
        phaseNumber={1}
        phaseName="40 MCQs Assessment"
        durationMinutes={45}
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
    </div>
  );
}
