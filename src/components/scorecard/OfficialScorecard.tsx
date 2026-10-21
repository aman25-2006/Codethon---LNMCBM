"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Award, CheckCircle2, Loader2, Mail, Printer, QrCode, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OfficialScorecardProps {
  scorecard: {
    student_name: string;
    roll_number: string;
    course: string;
    participant_id: string;
    college_name?: string;
    competition_name?: string;
    phase1_score: number;
    coding_q1_score: number;
    coding_q2_score: number;
    total_score: number;
    rank?: number | null;
    is_published?: boolean;
    verification_id: string;
    finalized_at?: string | null;
  };
  showPrintButton?: boolean;
  showEmailButton?: boolean;
}

export function OfficialScorecard({
  scorecard,
  showPrintButton = true,
  showEmailButton = false,
}: OfficialScorecardProps) {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await fetch("/api/student/scorecard/email", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setEmailStatus({
          success: false,
          message: data.error || "Failed to dispatch email.",
        });
      } else {
        setEmailStatus({
          success: true,
          message: data.message || "Official scorecard sent to your email!",
        });
      }
    } catch {
      setEmailStatus({
        success: false,
        message: "Network error sending email.",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };
  const p1Pct = ((scorecard.phase1_score / 80) * 100).toFixed(1);
  const q1Pct = ((scorecard.coding_q1_score / 10) * 100).toFixed(1);
  const q2Pct = ((scorecard.coding_q2_score / 10) * 100).toFixed(1);
  const totalPct = ((scorecard.total_score / 100) * 100).toFixed(1);

  const formattedDate = scorecard.finalized_at
    ? new Date(scorecard.finalized_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Verified System Record";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Print and Email Triggers (Hidden during print) */}
      {(showPrintButton || showEmailButton) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 no-print print:hidden">
          {emailStatus ? (
            <div
              className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                emailStatus.success
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {emailStatus.success ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : null}
              <span>{emailStatus.message}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {showEmailButton && (
              <Button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                variant="outline"
                className="text-xs font-semibold bg-white text-blue-700 border-blue-300 hover:bg-blue-50 shadow-xs flex items-center gap-1.5"
              >
                {isSendingEmail ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                )}
                {isSendingEmail ? "Dispatching Email..." : "Email My Scorecard"}
              </Button>
            )}

            {showPrintButton && (
              <Button
                onClick={handlePrint}
                variant="outline"
                className="text-xs font-semibold bg-white text-slate-800 border-slate-300 hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                Print Official Scorecard
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Scorecard Container */}
      <div
        id="official-scorecard-document"
        className="scorecard-container bg-white text-slate-900 border-2 border-slate-800 rounded-xl p-6 sm:p-8 max-w-3xl mx-auto shadow-md relative overflow-hidden print:p-6 print:border-2 print:border-black print:shadow-none print:max-w-none print:w-full print:rounded-none"
      >
        {/* Watermark / Subtle Seal background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none print:hidden">
          <Image
            src="/images/college-logo.png"
            alt="Watermark"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>

        {/* Institutional Header */}
        <div className="border-b-2 border-slate-800 pb-5 text-center relative">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 relative">
              <Image
                src="/images/college-logo.png"
                alt="LNMCBM Logo"
                width={80}
                height={80}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
                {scorecard.college_name || "Lalit Narayan Mishra College of Business Management"}
              </h1>
              <p className="text-[11px] font-semibold text-slate-600 tracking-wide">
                Bhagwanpur Chowk, Muzaffarpur, Bihar - 842001
              </p>
              <div className="mt-1 inline-block bg-blue-50 border border-blue-200 text-blue-900 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase print:border print:border-black print:bg-white print:text-black">
                {scorecard.competition_name || "Codethon 2026: Annual Inter-Departmental Coding Championship"}
              </div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-0.5 inline-block">
              OFFICIAL EXAMINATION SCORECARD & MERIT RECORD
            </span>
          </div>
        </div>

        {/* Candidate Information Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs print:bg-white print:border-slate-400">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Candidate Name</span>
            <strong className="text-slate-900 font-bold text-xs sm:text-sm block truncate mt-0.5">
              {scorecard.student_name}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Roll Number</span>
            <strong className="text-slate-900 font-mono font-bold text-xs sm:text-sm block mt-0.5">
              {scorecard.roll_number}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Participant ID</span>
            <strong className="text-blue-700 font-mono font-bold text-xs sm:text-sm block mt-0.5 print:text-black">
              {scorecard.participant_id}
            </strong>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Academic Program</span>
            <strong className="text-slate-900 font-bold text-xs sm:text-sm block mt-0.5">
              {scorecard.course}
            </strong>
          </div>
        </div>

        {/* Merit Standing Highlight Banner */}
        <div className="mt-5 p-3.5 bg-blue-900 text-white rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs print:bg-white print:text-black print:border-2 print:border-black">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-amber-300 print:text-black print:bg-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider block print:text-slate-600">
                Official Standing
              </span>
              <span className="text-sm font-extrabold tracking-tight">
                {scorecard.rank !== null && scorecard.rank !== undefined
                  ? `State Merit Rank: #${scorecard.rank}`
                  : "Final Evaluation Confirmed"}
              </span>
            </div>
          </div>

          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-blue-800 pt-2 sm:pt-0 sm:pl-4 print:border-black">
            <span className="text-[10px] uppercase font-bold text-blue-200 block print:text-slate-600">
              Aggregate Total
            </span>
            <span className="text-lg font-black font-mono text-amber-300 print:text-black">
              {scorecard.total_score} <span className="text-xs text-blue-100 font-normal print:text-slate-600">/ 100</span>
            </span>
          </div>
        </div>

        {/* Detailed Mark Distribution Table */}
        <div className="mt-5 overflow-hidden border border-slate-300 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3">Examination Component</th>
                <th className="py-2.5 px-3 text-center">Max Marks</th>
                <th className="py-2.5 px-3 text-center">Marks Awarded</th>
                <th className="py-2.5 px-3 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              <tr>
                <td className="py-2.5 px-3">
                  <div className="font-bold text-slate-900">Phase 1: Objective Assessment</div>
                  <div className="text-[10px] text-slate-500">
                    40 Curriculum Multiple Choice Questions across 4 Categories
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center font-mono">80</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                  {scorecard.phase1_score}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-600">{p1Pct}%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">
                  <div className="font-bold text-slate-900">Phase 2: Coding Problem 1</div>
                  <div className="text-[10px] text-slate-500">
                    Algorithmic & Track Challenge (5 Isolated Test Cases)
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center font-mono">10</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                  {scorecard.coding_q1_score}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-600">{q1Pct}%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3">
                  <div className="font-bold text-slate-900">Phase 2: Coding Problem 2</div>
                  <div className="text-[10px] text-slate-500">
                    Algorithmic & Track Challenge (5 Isolated Test Cases)
                  </div>
                </td>
                <td className="py-2.5 px-3 text-center font-mono">10</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                  {scorecard.coding_q2_score}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-600">{q2Pct}%</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-800">
              <tr>
                <td className="py-3 px-3 uppercase tracking-wide">
                  Final Aggregate Score (100% Verified)
                </td>
                <td className="py-3 px-3 text-center font-mono">100</td>
                <td className="py-3 px-3 text-center font-mono text-sm font-extrabold text-blue-900 print:text-black">
                  {scorecard.total_score}
                </td>
                <td className="py-3 px-3 text-right font-mono font-extrabold">{totalPct}%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Verification and Security Banner */}
        <div className="mt-5 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:bg-white print:border-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Verification Identifier</span>
              <span className="font-mono font-bold text-slate-900 tracking-wider">
                {scorecard.verification_id}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Certified Date</span>
            <span className="text-slate-700 font-semibold">{formattedDate}</span>
          </div>
        </div>

        {/* Signatures & Seal Section */}
        <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-[11px] text-slate-600">
          <div>
            <div className="h-9 flex items-end justify-center font-serif italic text-slate-500 text-xs">
              System Verified
            </div>
            <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
              Evaluation Engine
            </div>
          </div>
          <div>
            <div className="h-9 flex items-end justify-center font-serif italic text-slate-500 text-xs">
              Prof. In-Charge
            </div>
            <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
              Chief Invigilator
            </div>
          </div>
          <div>
            <div className="h-9 flex items-end justify-center font-serif italic text-slate-500 text-xs">
              LNMCBM Exam Cell
            </div>
            <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
              Controller of Examinations
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="mt-5 pt-3 border-t border-slate-200 text-center text-[9px] text-slate-400">
          This scorecard is electronically generated by the LNMCBM Codethon Examination System. Authentic records can be verified at the official portal using Verification ID {scorecard.verification_id}.
        </div>
      </div>
    </div>
  );
}

