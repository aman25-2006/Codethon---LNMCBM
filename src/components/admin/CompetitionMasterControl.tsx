"use client";

import * as React from "react";
import {
  Play,
  Square,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Radio,
  Lock,
  Unlock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CompetitionMasterControlProps {
  onStatusChange?: (newStatus: string) => void;
  compact?: boolean;
}

export function CompetitionMasterControl({ onStatusChange, compact }: CompetitionMasterControlProps) {
  const [status, setStatus] = React.useState<string>("draft");
  const [isTestLive, setIsTestLive] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [toggling, setToggling] = React.useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState<"start" | "stop" | null>(null);
  const [actionMessage, setActionMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStatus = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/competition/toggle?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setIsTestLive(data.isTestLive);
      }
    } catch (err) {
      console.error("Failed to fetch competition status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStatus();
    // Poll every 6 seconds to keep multi-tab admin sessions synchronized
    const interval = setInterval(fetchStatus, 6000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleToggle = async (targetAction: "start" | "stop") => {
    setToggling(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/admin/competition/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: targetAction }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${targetAction} examination.`);
      }

      setStatus(data.status);
      setIsTestLive(data.isTestLive);
      setShowConfirmModal(null);
      setActionMessage({ type: "success", text: data.message });

      if (onStatusChange) {
        onStatusChange(data.status);
      }

      setTimeout(() => setActionMessage(null), 8000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed.";
      setActionMessage({ type: "error", text: msg });
    } finally {
      setToggling(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {loading ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Checking...</span>
          </div>
        ) : isTestLive ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              LIVE
            </span>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setShowConfirmModal("stop")}
              disabled={toggling}
              className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> Stop Test
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-600 text-xs font-semibold">
              <Lock className="w-3 h-3 text-slate-500" />
              STOPPED
            </span>
            <Button
              size="sm"
              onClick={() => setShowConfirmModal("start")}
              disabled={toggling}
              className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Start Test
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-sm ${
          isTestLive
            ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-300"
            : "bg-gradient-to-r from-slate-50 via-amber-50/30 to-slate-50 border-slate-300"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Description */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Master Examination Gate
              </span>
              {loading ? (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Verifying...
                </Badge>
              ) : isTestLive ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 text-xs px-2.5 py-0.5 animate-pulse">
                  <Radio className="w-3.5 h-3.5" /> TEST IS LIVE (IN PROGRESS)
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-400 bg-amber-100 text-amber-900 font-bold gap-1 text-xs px-2.5 py-0.5">
                  <Lock className="w-3.5 h-3.5 text-amber-700" /> TEST IS STOPPED / LOCKED
                </Badge>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              {isTestLive ? (
                <span className="text-emerald-900">Examination is Currently Live &amp; Active</span>
              ) : (
                <span className="text-slate-800">Student Portal Entry is Locked</span>
              )}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {isTestLive
                ? "Students can currently access the exam and submit answers. When you click 'Stop Test', all student tests will instantly close and submit their answers automatically."
                : "No student can give the test before you start it. Candidates visiting their dashboard see that the test has not yet commenced. Click 'Start Test' below when you are ready to begin."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {isTestLive ? (
              <Button
                size="lg"
                onClick={() => setShowConfirmModal("stop")}
                disabled={toggling}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-md hover:shadow-lg transition-all gap-2 text-sm px-6 h-12"
              >
                <Square className="w-4 h-4 fill-current" />
                STOP TEST (CLOSE ALL TESTS)
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => setShowConfirmModal("start")}
                disabled={toggling}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md hover:shadow-lg transition-all gap-2 text-sm px-6 h-12"
              >
                <Play className="w-4 h-4 fill-current" />
                START TEST NOW
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={fetchStatus}
              disabled={loading || toggling}
              title="Refresh status"
              className="h-12 w-12 rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Action Message Alert */}
        {actionMessage && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 font-medium border ${
              actionMessage.type === "success"
                ? "bg-emerald-100/80 border-emerald-300 text-emerald-950"
                : "bg-rose-100/80 border-rose-300 text-rose-950"
            }`}
          >
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {showConfirmModal === "start" ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Play className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Commence Examination Now?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Starting the test will immediately unlock the student portal across the entire college. All registered and approved candidates will be permitted to start Phase 1.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <p className="font-semibold">✓ Students will be notified live on their screens.</p>
                  <p>✓ Timers will start as students enter Phase 1.</p>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmModal(null)}
                    disabled={toggling}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleToggle("start")}
                    disabled={toggling}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                  >
                    {toggling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    Confirm &amp; Start Test
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Square className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Stop Examination &amp; Close All Tests?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Are you sure you want to <strong>STOP</strong> the examination? This action will immediately:
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
                  <p className="font-semibold text-rose-950">🛑 Immediately terminate all active student tests.</p>
                  <p>✓ Automatically save, evaluate, and record every candidate&apos;s answers and code drafts.</p>
                  <p>✓ Lock the portal so no candidate can submit further answers or start new attempts.</p>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmModal(null)}
                    disabled={toggling}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleToggle("stop")}
                    disabled={toggling}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5"
                  >
                    {toggling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5 fill-current" />}
                    Yes, Stop &amp; Close All Tests
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

