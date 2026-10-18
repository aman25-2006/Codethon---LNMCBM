"use client";

import * as React from "react";
import { AlertTriangle, ShieldAlert, Maximize2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ExamWarningModalProps {
  isOpen: boolean;
  warningsCount: number;
  maxWarnings?: number;
  reason?: string;
  onReenterFullscreen: () => void;
}

export function ExamWarningModal({
  isOpen,
  warningsCount,
  maxWarnings = 3,
  reason = "You have exited browser fullscreen mode.",
  onReenterFullscreen,
}: ExamWarningModalProps) {
  if (!isOpen) return null;

  const remaining = Math.max(0, maxWarnings - warningsCount);
  const isFinalWarning = remaining === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-amber-500 overflow-hidden space-y-4 p-6 sm:p-7">
        {/* Warning Icon & Header */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isFinalWarning ? "bg-red-100 text-red-600 animate-bounce" : "bg-amber-100 text-amber-600"
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {isFinalWarning ? "FINAL PROCTORING WARNING" : "PROCTORING VIOLATION RECORDED"}
              </h3>
              <Badge
                variant={isFinalWarning ? "danger" : "warning"}
                className="text-[10px] font-bold uppercase tracking-wider"
              >
                {warningsCount} of {maxWarnings}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Lalit Narayan Mishra College of Business Management • Integrity Telemetry
            </p>
          </div>
        </div>

        {/* Warning Details & Message */}
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900 leading-relaxed">
          <p className="font-semibold">{reason}</p>
          <p className="text-amber-800">
            {isFinalWarning ? (
              <strong className="text-red-700 font-bold block pt-1">
                ATTENTION: You have 1 final chance remaining. If you exit fullscreen again, your examination attempt will be immediately and permanently terminated.
              </strong>
            ) : (
              <span>
                Exiting browser fullscreen or switching tabs is strictly monitored. You have{" "}
                <strong>{remaining} strike(s) remaining</strong> before automatic termination.
              </span>
            )}
          </p>
        </div>

        {/* Timer Note */}
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            The examination countdown clock <strong>continues running</strong> while this warning is displayed.
          </span>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={onReenterFullscreen}
            className={`w-full sm:w-auto font-bold text-xs sm:text-sm px-6 py-2.5 shadow-md flex items-center justify-center gap-2 ${
              isFinalWarning
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-700 hover:bg-blue-800 text-white"
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            Re-enter Fullscreen &amp; Resume Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}

