"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, AlertCircle, RefreshCw, ShieldAlert } from "lucide-react";
import { OfficialScorecard } from "@/components/scorecard/OfficialScorecard";
import { PublicScorecardDTO } from "@/types";
import { Button } from "@/components/ui/button";

export default function StudentScorecardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [scorecard, setScorecard] = useState<PublicScorecardDTO | null>(null);

  const fetchScorecard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/scorecard");
      const data = await res.json();

      if (!res.ok) {
        setError({
          code: data.error || "FETCH_FAILED",
          message: data.message || "Failed to load scorecard.",
        });
        setScorecard(null);
      } else if (data.success && data.scorecard) {
        setScorecard(data.scorecard);
      }
    } catch (err: unknown) {
      setError({
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Network error. Please check connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScorecard();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar (Hidden when printing) */}
        <div className="flex items-center justify-between no-print print:hidden">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Student Dashboard
          </Link>
          <span className="text-xs text-slate-400">
            Codethon 2026 • Certified Candidate Portal
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Retrieving Certified Scorecard</h3>
            <p className="text-xs text-slate-500 mt-1">Verifying encrypted cryptographic credentials...</p>
          </div>
        )}

        {/* Error / Unpublished State */}
        {!loading && error && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
            {error.code === "RESULTS_NOT_PUBLISHED" ? (
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Results Under Tabulation
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {error.message}
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 text-left">
                  <strong>Notice:</strong> Per official competition regulations, scorecards and merit ranks remain confidential until approved and published by the Examination Controller.
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={fetchScorecard}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Check Status Again
                  </Button>
                  <Link href="/student/dashboard">
                    <Button variant="primary" size="sm">
                      Return to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            ) : error.code === "RESULT_NOT_FINALIZED" ? (
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Attempt Awaiting Finalization
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {error.message}
                </p>
                <div className="pt-2">
                  <Link href="/student/dashboard">
                    <Button variant="primary" size="sm">
                      Return to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Unable to Load Scorecard</h2>
                <p className="text-xs text-slate-600">{error.message}</p>
                <Button variant="outline" size="sm" onClick={fetchScorecard}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Request
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Success / Scorecard Display */}
        {!loading && scorecard && (
          <OfficialScorecard
            scorecard={scorecard}
            showPrintButton={true}
            showEmailButton={true}
          />
        )}
      </div>
    </div>
  );
}

