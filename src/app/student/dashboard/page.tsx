"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  HelpCircle,
  Monitor,
  ArrowRight,
  BookOpen,
  Wifi,
  Loader2,
  Lock,
  Layers,
  ChevronRight,
  LogOut,
  Award,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const COMPETITION_TRACKS = [
  {
    id: "C",
    name: "Track A: C Programming",
    subtitle: "C11 • Pointers • Memory",
    desc: "40 C MCQs in Phase 1 + 2 C Coding Problems in Phase 2",
    badge: "Core Track",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
  },
  {
    id: "C++",
    name: "Track B: C++ Programming",
    subtitle: "C++17 • Classes • OOP",
    desc: "40 C++ MCQs in Phase 1 + 2 C++ OOP Challenges in Phase 2",
    badge: "OOP Track",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
  },
  {
    id: "Java",
    name: "Track C: Java Programming",
    subtitle: "OpenJDK 21 • Core Java",
    desc: "40 Java MCQs in Phase 1 + 2 Java Challenges in Phase 2",
    badge: "Core Java",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    id: "Python",
    name: "Track D: Python Programming",
    subtitle: "Python 3.11+ • Procedural Logic",
    desc: "40 Python MCQs in Phase 1 + 2 Python Procedural Problems in Phase 2",
    badge: "Python Logic",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    id: "Web Development",
    name: "Track E: Web Development",
    subtitle: "HTML5 • CSS3 • Vanilla JS",
    desc: "40 Web Dev MCQs in Phase 1 + 2 UI/DOM Component Challenges in Phase 2",
    badge: "Frontend Track",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
  },
  {
    id: "DSA",
    name: "Track F: Algorithms (DSA)",
    subtitle: "Two-Pointers • Binary Search",
    desc: "40 DSA MCQs in Phase 1 + 2 DSA Problems (in C, C++, or Java)",
    badge: "Core Challenge",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },
];

export default function StudentDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [starting, setStarting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Candidate Profile
  const [student, setStudent] = React.useState<{
    id: string;
    full_name: string;
    roll_number: string;
    participant_id: string;
    course: string;
  } | null>(null);

  // Session & Phase Lifecycle State
  const [sessionStatus, setSessionStatus] = React.useState<
    "not_started" | "phase1_in_progress" | "phase1_completed" | "phase2_in_progress" | "phase2_completed" | "terminated"
  >("not_started");
  const [remainingSeconds, setRemainingSeconds] = React.useState<number>(45 * 60);

  // Pre-Exam Instructions Modal
  const [showInstructionsModal, setShowInstructionsModal] = React.useState(false);
  const [rulesAcknowledged, setRulesAcknowledged] = React.useState(false);

  // Language Track Selection
  const [selectedTrack, setSelectedTrack] = React.useState<string>("C");
  const [selectedDsaLang, setSelectedDsaLang] = React.useState<"C" | "C++" | "Java">("C++");
  const [activeTrack, setActiveTrack] = React.useState<string | null>(null);
  const [activeLang, setActiveLang] = React.useState<string | null>(null);

  // Fetch candidate profile and current exam status
  const loadDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get student profile
      const meRes = await fetch("/api/student/me");
      if (!meRes.ok) {
        router.replace("/login/student");
        return;
      }
      const meData = await meRes.json();
      setStudent(meData.student);

      // 2. Get active exam session if exists
      const sessionRes = await fetch("/api/student/exam/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.session) {
          setSessionStatus(sessionData.session.status);
          if (sessionData.session.phase2_category) {
            setActiveTrack(sessionData.session.phase2_category);
            setSelectedTrack(sessionData.session.phase2_category);
          }
          if (sessionData.session.phase2_language) {
            setActiveLang(sessionData.session.phase2_language);
            setSelectedDsaLang(sessionData.session.phase2_language as any);
          }
          if (sessionData.remainingSeconds !== undefined) {
            setRemainingSeconds(sessionData.remainingSeconds);
          }
        } else {
          setSessionStatus("not_started");
        }
      }
    } catch (err: unknown) {
      console.error("Dashboard load error:", err);
      setError(err instanceof Error ? err.message : "Failed to load candidate portal.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle starting / resuming Phase 1 with chosen language track
  const handleLaunchPhase1 = async () => {
    try {
      setStarting(true);
      setError(null);

      const targetLanguage =
        selectedTrack === "DSA"
          ? selectedDsaLang
          : selectedTrack === "Web Development"
          ? "JavaScript"
          : selectedTrack;

      const res = await fetch("/api/student/exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: selectedTrack,
          language: targetLanguage,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to start examination.");
      }

      setShowInstructionsModal(false);
      router.push("/exam/phase-1");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error initializing session.");
    } finally {
      setStarting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/student-logout", { method: "POST" });
      router.replace("/login/student");
    } catch {
      router.replace("/login/student");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold text-slate-600">
          Loading Candidate Dashboard & Exam Status...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* College Identity & Candidate Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 shadow-xs">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {student?.full_name || "Candidate"}
              </h1>
              <Badge variant="success" className="text-[10px]">
                Enrolled & Verified
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-mono">
              Roll No: <strong className="text-slate-900 font-bold">{student?.roll_number}</strong> • Participant ID: <strong className="text-blue-700">{student?.participant_id}</strong>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Course: <strong className="text-slate-700">{student?.course}</strong> • Institution: Lalit Narayan Mishra College of Business Management
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-left sm:text-right">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Competition Status
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 sm:justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Codethon 2026 Live
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleLogout}
            className="text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 border-slate-200"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Logout
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Two-Phase Assessment Timeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PHASE 1 CARD */}
        <Card
          className={`border-2 transition-all ${
            sessionStatus === "phase1_in_progress"
              ? "border-amber-400 bg-amber-50/20 shadow-md"
              : sessionStatus === "phase1_completed"
              ? "border-emerald-500 bg-emerald-50/20"
              : "border-blue-200 bg-white"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Assessment Step 1
                </span>
                <CardTitle className="text-lg font-bold text-slate-900 mt-0.5">
                  Phase 1: MCQ Examination
                </CardTitle>
              </div>
              <Badge
                variant={
                  sessionStatus === "phase1_completed"
                    ? "success"
                    : sessionStatus === "phase1_in_progress"
                    ? "warning"
                    : "default"
                }
              >
                {sessionStatus === "phase1_completed"
                  ? "Completed & Submitted"
                  : sessionStatus === "phase1_in_progress"
                  ? "In Progress"
                  : "Ready to Start"}
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-600 mt-1">
              40 Multiple Choice Questions across 4 technical domains • Maximum Score: 80 Marks.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Duration</span>
                <strong className="text-slate-900 font-semibold flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> 45 Minutes
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Total Questions</span>
                <strong className="text-slate-900 font-semibold flex items-center gap-1 mt-0.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" /> 40 MCQs (80 M)
                </strong>
              </div>
            </div>

            {/* Status-specific action buttons */}
            {sessionStatus === "not_started" && (
              <Button
                variant="primary"
                className="w-full text-xs font-bold py-2.5 shadow-sm bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowInstructionsModal(true)}
              >
                Select Language Track &amp; Start Phase 1
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}

            {sessionStatus === "phase1_in_progress" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2 bg-amber-100/70 border border-amber-200 rounded-lg text-amber-900 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                    Timer is running!
                  </span>
                  <span className="font-mono font-bold">
                    {Math.floor(remainingSeconds / 60)}m {remainingSeconds % 60}s left
                  </span>
                </div>

                {activeTrack && (
                  <div className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                    <span>
                      Active Track: <strong>{activeTrack}</strong> {activeLang ? `(${activeLang})` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowInstructionsModal(true)}
                      className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                    >
                      Change Track
                    </button>
                  </div>
                )}

                <Button
                  variant="primary"
                  className="w-full text-xs font-bold py-2.5 bg-amber-600 hover:bg-amber-700 border-amber-600 text-white"
                  onClick={() => router.push("/exam/phase-1")}
                >
                  Resume Phase 1 Examination Now
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            )}

            {sessionStatus === "phase1_completed" && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Phase 1 Successfully Completed
                </div>
                <p className="text-[11px] text-emerald-700">
                  Your answers have been securely submitted and graded server-side. Per competition regulations, individual scores remain confidential until final tabulation.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PHASE 2 CARD */}
        <Card
          className={`border-2 transition-all ${
            sessionStatus === "phase1_completed"
              ? "border-blue-400 bg-blue-50/20 shadow-md"
              : "border-slate-200 bg-slate-50/60 opacity-90"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Assessment Step 2
                </span>
                <CardTitle className="text-lg font-bold text-slate-900 mt-0.5">
                  Phase 2: Coding Challenges
                </CardTitle>
              </div>
              <Badge variant={sessionStatus === "phase1_completed" ? "default" : "secondary"}>
                {sessionStatus === "phase1_completed" ? "Unlocked" : "Locked"}
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-600 mt-1">
              Two live programming challenges in your chosen language/domain • Maximum Score: 20 Marks.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Duration</span>
                <strong className="text-slate-900 font-semibold flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> 30 Minutes
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Challenges</span>
                <strong className="text-slate-900 font-semibold flex items-center gap-1 mt-0.5">
                  <FileCode className="w-3.5 h-3.5 text-slate-500" /> 2 Coding Problems
                </strong>
              </div>
            </div>

            {sessionStatus === "phase1_completed" ? (
              <Button
                variant="primary"
                className="w-full text-xs font-bold py-2.5 bg-blue-700 hover:bg-blue-800"
                onClick={() => router.push("/exam/phase-2")}
              >
                Proceed to Phase 2 Domain Selection
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : sessionStatus === "phase2_completed" ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Phase 2 Coding Challenge Completed
                </div>
                <p className="text-[11px] text-emerald-700">
                  Your code submissions have been recorded and evaluated against official test suites.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg text-xs text-slate-500">
                <Lock className="w-4 h-4 shrink-0 text-slate-400" />
                <span>
                  Phase 2 automatically unlocks upon submitting Phase 1.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FINAL SCORECARD & MERIT STANDING SECTION */}
      {(sessionStatus === "phase2_completed" || sessionStatus === "terminated") && (
        <Card className="border-2 border-blue-500 bg-linear-to-r from-blue-50/50 to-indigo-50/50 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-700" />
                <CardTitle className="text-base font-bold text-slate-900">
                  Official Examination Scorecard & Merit Standing
                </CardTitle>
              </div>
              <Badge variant="default">Evaluation Completed</Badge>
            </div>
            <CardDescription className="text-xs text-slate-600 mt-1">
              Your Phase 1 (80 Marks) and Phase 2 (20 Marks) assessments have concluded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-800 block">
                  Candidate Verification Record
                </span>
                <span className="text-slate-500 text-[11px]">
                  Click below to view or print your certified scorecard and verify merit standing.
                </span>
              </div>
              <Link href="/student/scorecard" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto text-xs font-bold py-2 px-4 bg-blue-700 hover:bg-blue-800 shadow-xs flex items-center justify-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-300" />
                  View Official Scorecard
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Requirements & Lab Advice */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Monitor className="w-4 h-4 text-blue-600" />
          Examination Environment & Integrity Policy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block">Fullscreen Enforcement</strong>
              Exiting fullscreen will register an administrative proctoring warning.
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <Wifi className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block">Continuous Autosave</strong>
              Every selected option is debounced and persisted to the authoritative server.
            </div>
          </div>
          <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block">Zero Clock Drift</strong>
              Remaining time is calculated server-side; device clock changes do not grant extra time.
            </div>
          </div>
        </div>
      </div>

      {/* PRE-EXAM INSTRUCTIONS & CODE OF CONDUCT MODAL */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-full border shadow-xs">
                  <Image
                    src="/images/college-logo.png"
                    alt="LNMCBM Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Phase 1 Examination Instructions & Conduct Code
                  </h2>
                  <p className="text-xs text-slate-500">
                    Lalit Narayan Mishra College of Business Management • Codethon 2026
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs text-slate-700 leading-relaxed">
              {/* STEP 1: TRACK & LANGUAGE SELECTION */}
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">
                      Step 1: Choose Your Examination Track &amp; Language
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                    Mandatory
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Select your competition track. Your selection determines your <strong>40 Phase 1 MCQs</strong> and your <strong>Phase 2 Coding Challenges</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                  {COMPETITION_TRACKS.map((t) => {
                    const isSelected = selectedTrack === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTrack(t.id)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all relative ${
                          isSelected
                            ? "bg-blue-950 border-blue-400 ring-2 ring-blue-500/40 shadow-sm"
                            : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-white">{t.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${t.badgeColor}`}>
                            {t.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          {t.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-selector for DSA implementation language */}
                {selectedTrack === "DSA" && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 mt-2">
                    <span className="text-[11px] font-bold text-blue-400 block">
                      Choose Your DSA Implementation Language:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(["C", "C++", "Java"] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setSelectedDsaLang(lang)}
                          className={`p-2 rounded text-xs font-bold border transition-colors ${
                            selectedDsaLang === lang
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Distribution Breakdown */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                  Examination Structure (40 Questions / 80 Marks / 45 Minutes)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-slate-500 block">Fundamentals</span>
                    <strong className="text-slate-800">10 Qs • 10 Marks</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-slate-500 block">Technical</span>
                    <strong className="text-slate-800">10 Qs • 20 Marks</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-slate-500 block">Logic & Debugging</span>
                    <strong className="text-slate-800">10 Qs • 30 Marks</strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-slate-500 block">Case Study</span>
                    <strong className="text-slate-800">10 Qs • 20 Marks</strong>
                  </div>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-900">Important Competition Regulations:</h4>
                <ul className="space-y-2 list-disc list-inside text-slate-600">
                  <li>
                    <strong>Authoritative 45-Minute Timer:</strong> The countdown clock begins the moment you click &quot;Confirm &amp; Begin Exam&quot;. Refreshing the browser or losing internet connection does not pause or extend the timer.
                  </li>
                  <li>
                    <strong>Continuous Autosave:</strong> As you select answer choices, they are automatically recorded on the central evaluation server.
                  </li>
                  <li>
                    <strong>Fullscreen Requirement:</strong> The exam must be taken in Fullscreen Mode. Exiting fullscreen or navigating to other applications/tabs will increment a proctoring violation count.
                  </li>
                  <li>
                    <strong>Prohibited Behavior:</strong> Accessing search engines, AI assistants, communication tools, or external devices is strictly prohibited and results in immediate disqualification.
                  </li>
                  <li>
                    <strong>Automatic Submission:</strong> At the expiration of 45 minutes, your active answers will be locked and automatically evaluated.
                  </li>
                  <li>
                    <strong>Phase 2 Progression:</strong> Upon conclusion of Phase 1, you will immediately proceed to domain selection for Phase 2 (Coding Assessment).
                  </li>
                </ul>
              </div>

              {/* Acknowledgement Checkbox */}
              <div className="pt-3 border-t border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={rulesAcknowledged}
                    onChange={(e) => setRulesAcknowledged(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
                  />
                  <span className="text-xs font-semibold text-slate-900">
                    I confirm my selection of <strong className="text-blue-700">{COMPETITION_TRACKS.find(t => t.id === selectedTrack)?.name}</strong> {selectedTrack === "DSA" ? `(${selectedDsaLang})` : ""}. I have read, understood, and agree to strictly abide by all LNMCBM examination rules.
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/70">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInstructionsModal(false)}
                disabled={starting}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleLaunchPhase1}
                disabled={!rulesAcknowledged || starting}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                {starting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Starting Examination...
                  </>
                ) : (
                  <>
                    Confirm &amp; Begin {selectedTrack} Exam
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
