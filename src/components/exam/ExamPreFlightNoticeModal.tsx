"use client";

import * as React from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Maximize2,
  AlertTriangle,
  Clock,
  Eye,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExamPreFlightNoticeModalProps {
  isOpen: boolean;
  phaseNumber: 1 | 2;
  phaseName: string;
  durationMinutes: number;
  onConfirmAndEnterFullscreen: () => void;
}

export function ExamPreFlightNoticeModal({
  isOpen,
  phaseNumber,
  phaseName,
  durationMinutes,
  onConfirmAndEnterFullscreen,
}: ExamPreFlightNoticeModalProps) {
  const [acknowledged, setAcknowledged] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center shadow-xs">
            <Image
              src="/images/college-logo.png"
              alt="LNMCBM Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Phase {phaseNumber}: {phaseName}
            </h2>
            <p className="text-xs text-slate-300">
              Lalit Narayan Mishra College of Business Management • Fullscreen Proctoring Agreement
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-700 leading-relaxed">
          {/* Key Metrics Banner */}
          <div className="grid grid-cols-3 gap-2 bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Assessment Mode</span>
              <strong className="text-blue-900 font-bold text-xs">Mandatory Fullscreen</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Violation Limit</span>
              <strong className="text-amber-800 font-bold text-xs">3 Exit Strikes Max</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Authoritative Clock</span>
              <strong className="text-emerald-800 font-bold text-xs">{durationMinutes} Minutes Fixed</strong>
            </div>
          </div>

          {/* Rules & Behavioral Guidelines */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Proctoring &amp; Examination Conduct Rules:
            </h4>
            <ul className="space-y-2 list-disc list-inside text-slate-600 pl-1">
              <li>
                <strong>Browser Fullscreen is Required:</strong> The examination portal operates strictly in full-screen mode to prevent accidental distraction.
              </li>
              <li>
                <strong>Automatic Incident Recording:</strong> Fullscreen exits, window blurs, and switching away from this browser tab are automatically timestamped and logged.
              </li>
              <li>
                <strong>3-Strike Violation Policy:</strong>
                <ul className="list-disc list-inside pl-4 pt-1 space-y-0.5 text-slate-700">
                  <li><strong>Strike 1:</strong> Warning 1 notification displayed.</li>
                  <li><strong>Strike 2:</strong> Final Warning notification displayed.</li>
                  <li><strong>Strike 3:</strong> <strong>Immediate and permanent exam termination.</strong></li>
                </ul>
              </li>
              <li>
                <strong>Server Countdown Continues:</strong> The server-authoritative timer does not stop or pause during fullscreen exits or warning dialogues.
              </li>
              <li>
                <strong>Invigilator Live Telemetry:</strong> Proctors have live monitoring dashboards reviewing candidate active statuses and incident logs in real time.
              </li>
            </ul>
          </div>

          {/* Technical Limitations Disclosure */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Technical Transparency Notice:
            </div>
            <p>
              Standard browser technologies cannot physically lock an operating system, disable hardware buttons,
              or detect secondary phones or external monitors. The college relies on server-side event telemetry,
              physical proctoring supervision, and the candidate&apos;s personal academic honor.
            </p>
          </div>

          {/* Checkbox Agreement */}
          <div className="pt-2 border-t border-slate-200">
            <label className="flex items-start gap-2.5 cursor-pointer p-3 bg-blue-50/50 hover:bg-blue-50 rounded-xl border border-blue-200/60 transition-colors">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5 shrink-0"
              />
              <span className="text-xs font-semibold text-slate-900 leading-snug">
                I have read and understood the fullscreen monitoring policy. I acknowledge that exceeding 3 fullscreen exits will permanently terminate my exam attempt.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={onConfirmAndEnterFullscreen}
            disabled={!acknowledged}
            className="w-full sm:w-auto font-bold text-xs sm:text-sm px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Maximize2 className="w-4 h-4" />
            Enter Fullscreen &amp; Begin Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}

