"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  Clock,
  User,
  CheckCircle2,
  HelpCircle,
  LogOut,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExamTerminationScreenProps {
  student?: {
    full_name?: string;
    roll_number?: string;
    participant_id?: string;
    course?: string;
  } | null;
  terminationReason?: string | null;
  terminatedAt?: string;
}

export function ExamTerminationScreen({
  student,
  terminationReason,
  terminatedAt,
}: ExamTerminationScreenProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const formattedTime = React.useMemo(() => {
    try {
      const d = terminatedAt ? new Date(terminatedAt) : new Date();
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
        " on " +
        d.toLocaleDateString();
    } catch {
      return "Current Session";
    }
  }, [terminatedAt]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/student-logout", { method: "POST" });
      router.replace("/login/student");
    } catch {
      router.replace("/login/student");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      {/* College Identity Header */}
      <div className="w-full max-w-2xl bg-slate-800/90 border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
          <div className="w-14 h-14 rounded-2xl bg-white p-2 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
            <Image
              src="/images/college-logo.png"
              alt="LNMCBM Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Lalit Narayan Mishra College of Business Management
            </h1>
            <p className="text-xs text-slate-400">
              Department of Computer Applications • Academic Integrity Board
            </p>
          </div>
        </div>

        {/* Termination Alert Banner */}
        <div className="p-4 bg-red-950/80 border-2 border-red-600 rounded-xl space-y-2">
          <div className="flex items-center gap-2.5 text-red-400 font-extrabold text-base sm:text-lg">
            <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 animate-pulse" />
            <span>EXAMINATION ACCESS TERMINATED</span>
          </div>
          <p className="text-xs text-red-200 leading-relaxed">
            Your examination attempt has been locked automatically by the proctoring enforcement engine.
            The maximum permissible violation threshold (3/3 strikes) was exceeded.
          </p>
        </div>

        {/* Incident Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">
              Candidate Details
            </span>
            <p className="font-bold text-white text-sm">
              {student?.full_name || "Enrolled Student"}
            </p>
            <p className="text-slate-300 font-mono">
              Roll No: <span className="text-blue-400">{student?.roll_number || "N/A"}</span>
            </p>
            <p className="text-slate-400 font-mono">
              ID: {student?.participant_id || "N/A"} • Course: {student?.course || "BCA"}
            </p>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-1">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">
              Recorded Incident Reason
            </span>
            <p className="font-semibold text-rose-300 leading-snug">
              {terminationReason || "Exceeded maximum permissible fullscreen exit violations (3/3)."}
            </p>
            <p className="text-slate-400 text-[11px] flex items-center gap-1 pt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Timestamp: {formattedTime}
            </p>
          </div>
        </div>

        {/* Work Preservation Confirmation */}
        <div className="bg-emerald-950/40 border border-emerald-600/40 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Data Preservation Guarantee</span>
          </div>
          <p className="text-xs text-emerald-200 leading-relaxed">
            All question choices, code drafts, and finalized submissions recorded prior to this termination
            have been safely committed to the central database. Answers were not erased and will be retained
            for post-assessment review.
          </p>
        </div>

        {/* Technical Exception Appeal Instructions */}
        <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-xl space-y-2 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Invigilator Appeal &amp; Technical Exception Protocol:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>
              If this termination was triggered by an operating system notification, display power loss, or
              system crash, <strong>remain seated at your terminal</strong>.
            </li>
            <li>
              Immediately raise your hand and inform the hall proctor / invigilator.
            </li>
            <li>
              The invigilator can review the timeline on the invigilator console and grant an authorized
              technical exception to restore your session.
            </li>
          </ul>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.replace("/student/dashboard")}
            className="w-full sm:w-auto text-xs bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-600"
          >
            Return to Student Dashboard
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full sm:w-auto text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            {loggingOut ? "Signing Out..." : "Sign Out & End Session"}
          </Button>
        </div>
      </div>
    </div>
  );
}
