"use client";

import * as React from "react";
import {
  FileText,
  Shield,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  X,
  User,
  Activity,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuditLogEntry } from "@/types";

const ACTION_COLORS: Record<string, string> = {
  STATE_TRANSITION: "bg-blue-100 text-blue-800 border-blue-200",
  SETTINGS_UPDATED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  STUDENT_CREATED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  STUDENT_IMPORTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  STUDENT_DELETED: "bg-rose-100 text-rose-800 border-rose-200",
  STUDENT_SUSPENDED: "bg-amber-100 text-amber-800 border-amber-200",
  STUDENT_REACTIVATED: "bg-teal-100 text-teal-800 border-teal-200",
  CREDENTIALS_ISSUED: "bg-blue-100 text-blue-800 border-blue-200",
  CREDENTIALS_RESET: "bg-amber-100 text-amber-800 border-amber-200",
  RESULTS_FINALIZED: "bg-purple-100 text-purple-800 border-purple-200",
  RESULTS_PUBLISHED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  RESULTS_UNPUBLISHED: "bg-rose-100 text-rose-800 border-rose-200",
  TECHNICAL_EXCEPTION_GRANTED: "bg-teal-100 text-teal-800 border-teal-200",
  EMERGENCY_COMPETITION_HALT: "bg-rose-100 text-rose-800 border-rose-200 font-black",
  EMERGENCY_SETTINGS_OVERRIDE: "bg-rose-100 text-rose-800 border-rose-200 font-bold",
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("");
  const [outcomeFilter, setOutcomeFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const limit = 25;

  // Detail Modal
  const [selectedLog, setSelectedLog] = React.useState<AuditLogEntry | null>(null);

  const fetchLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (actionFilter) params.set("action", actionFilter);
      if (outcomeFilter) params.set("outcome", outcomeFilter);
      params.set("limit", String(limit));
      params.set("offset", String((page - 1) * limit));

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load audit logs.");
      }

      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, outcomeFilter, page]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle Export CSV
  const handleExportCsv = () => {
    window.location.href = "/api/admin/audit-logs/export";
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Security & Administration Audit Trail
            </h1>
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-bold">
              Append-Only Ledger
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Cryptographically scrubbed record of state transitions, credential lifecycles, setting modifications, and invigilator actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleExportCsv}
            className="bg-blue-900 hover:bg-blue-800 text-white text-xs h-9 font-bold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Audit CSV
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by administrator email, action, resource, or details..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
              >
                <option value="">All Action Types</option>
                <option value="STATE_TRANSITION">STATE_TRANSITION</option>
                <option value="SETTINGS_UPDATED">SETTINGS_UPDATED</option>
                <option value="STUDENT_CREATED">STUDENT_CREATED</option>
                <option value="STUDENT_IMPORTED">STUDENT_IMPORTED</option>
                <option value="STUDENT_DELETED">STUDENT_DELETED</option>
                <option value="STUDENT_SUSPENDED">STUDENT_SUSPENDED</option>
                <option value="STUDENT_REACTIVATED">STUDENT_REACTIVATED</option>
                <option value="CREDENTIALS_ISSUED">CREDENTIALS_ISSUED</option>
                <option value="CREDENTIALS_RESET">CREDENTIALS_RESET</option>
                <option value="RESULTS_FINALIZED">RESULTS_FINALIZED</option>
                <option value="RESULTS_PUBLISHED">RESULTS_PUBLISHED</option>
                <option value="RESULTS_UNPUBLISHED">RESULTS_UNPUBLISHED</option>
                <option value="TECHNICAL_EXCEPTION_GRANTED">TECHNICAL_EXCEPTION_GRANTED</option>
                <option value="EMERGENCY_COMPETITION_HALT">EMERGENCY_COMPETITION_HALT</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={outcomeFilter}
                onChange={(e) => {
                  setOutcomeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
              >
                <option value="">All Outcomes</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/60 border-b border-slate-200 py-3.5 px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-blue-900" />
              Recorded System Events ({total})
            </CardTitle>
            <span className="text-[11px] text-slate-500 font-medium">
              Page {page} of {totalPages}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-800 text-xs font-medium border-b border-rose-200">
              {error}
            </div>
          )}

          {loading && logs.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 text-blue-900 animate-spin" />
              <span>Retrieving audit records...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No audit events match your filters</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try resetting search parameters or action categories.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Outcome</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const actionClass = ACTION_COLORS[log.action] || "bg-slate-100 text-slate-800 border-slate-200";
                    const isSuccess = (log.outcome || "success") === "success";

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : "N/A"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {log.actorEmail}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${actionClass}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-mono text-[11px] max-w-xs truncate">
                          {log.targetResource}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isSuccess ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Failure
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {log.ipAddress || "Internal"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-900 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50/50">
              <span className="text-xs text-slate-500">
                Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} entries
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="text-xs h-8"
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="text-xs h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail JSON Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-900" />
                  Audit Record Inspection
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedLog.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
              <div>
                <span className="text-slate-500 block">Actor:</span>
                <span className="font-bold text-slate-800">{selectedLog.actorEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Action:</span>
                <span className="font-bold text-blue-900">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Target:</span>
                <span className="font-bold text-slate-800">{selectedLog.targetResource}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Timestamp:</span>
                <span className="font-bold text-slate-800">
                  {selectedLog.created_at ? new Date(selectedLog.created_at).toISOString() : "N/A"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Audit Payload (Scrubbed JSON):</label>
              <pre className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-64 border border-slate-800">
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-9"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
