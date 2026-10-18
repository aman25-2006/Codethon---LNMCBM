"use client";

import * as React from "react";
import {
  X,
  Mail,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmailDeliveryRecord } from "@/lib/services/credentials-service";

interface EmailLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailLogsModal({ isOpen, onClose }: EmailLogsModalProps) {
  const [logs, setLogs] = React.useState<EmailDeliveryRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLogs = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/students/email-logs");
      if (!res.ok) throw new Error("Failed to load email delivery logs.");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading logs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, fetchLogs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-logs-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 id="email-logs-title" className="text-sm font-bold text-slate-900">
                Email Delivery Telemetry & Audit Logs
              </h2>
              <p className="text-[11px] text-slate-500">
                Real-time tracking of candidate invitation and credential dispatch attempts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Provider Setup Guidance Alert */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>Transactional Email Configuration (Resend):</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              To deliver emails to student inboxes, configure <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">RESEND_API_KEY</code> and <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">RESEND_FROM_EMAIL</code> in your <code className="font-mono">.env.local</code> file. When unconfigured, attempts are recorded safely to the dev outbox without throwing runtime errors.
            </p>
          </div>

          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Loading delivery logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Mail className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700">No email delivery records found</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                No credential emails have been dispatched yet. Use the Issue Credentials button to initiate email distribution.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Candidate / Roll</th>
                    <th className="py-2.5 px-3">Recipient Email</th>
                    <th className="py-2.5 px-3">Delivery Status</th>
                    <th className="py-2.5 px-3">Provider Ref</th>
                    <th className="py-2.5 px-3 text-right">Attempt Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 block truncate max-w-[140px]">
                          {log.student_name || "Candidate"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {log.roll_number || "Roll N/A"}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-700 truncate max-w-[160px]">
                        {log.recipient_email}
                      </td>

                      <td className="py-2.5 px-3">
                        {log.delivery_status === "accepted" || log.delivery_status === "delivered" ? (
                          <Badge variant="success" className="text-[10px] py-0">
                            Accepted by Resend
                          </Badge>
                        ) : log.delivery_status === "provider_not_configured" ? (
                          <Badge variant="warning" className="text-[10px] py-0">
                            Dev Outbox (No API Key)
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px] py-0" title={log.error_details || undefined}>
                            Failed Delivery
                          </Badge>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 truncate max-w-[120px]">
                        {log.provider_message_id || "—"}
                      </td>

                      <td className="py-2.5 px-3 text-right text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-500">
            Total Records Tracked: <strong>{logs.length}</strong>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-medium"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

