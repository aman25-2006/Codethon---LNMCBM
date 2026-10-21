"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Award,
  Download,
  CheckCircle2,
  Search,
  Printer,
  Share2,
  RefreshCw,
  Eye,
  Filter,
  AlertTriangle,
  Lock,
  Globe,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OfficialScorecard } from "@/components/scorecard/OfficialScorecard";
import { AdminResultItemDTO } from "@/types";

export default function AdminResultsPage() {
  const [results, setResults] = useState<AdminResultItemDTO[]>([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    finalizedCount: 0,
    publishedCount: 0,
    highestScore: 0,
    averageScore: 0,
    isPublished: false,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals & previews
  const [selectedResult, setSelectedResult] = useState<AdminResultItemDTO | null>(null);
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);
  const [showConfirmFinalize, setShowConfirmFinalize] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (courseFilter && courseFilter !== "ALL") params.append("course", courseFilter);
      if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/results?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setResults(data.results);
        setSummary(data.summary);
      } else {
        setNotification({ type: "error", text: data.error || "Failed to load results." });
      }
    } catch {
      setNotification({ type: "error", text: "Network error fetching results." });
    } finally {
      setLoading(false);
    }
  }, [search, courseFilter, statusFilter]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleFinalizeAll = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/results/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: "success", text: data.message });
        setShowConfirmFinalize(false);
        fetchResults();
      } else {
        setNotification({ type: "error", text: data.error || "Finalization failed." });
      }
    } catch {
      setNotification({ type: "error", text: "Network error finalizing results." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    setActionLoading(true);
    try {
      const newPublishState = !summary.isPublished;
      const res = await fetch("/api/admin/results/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: newPublishState }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: "success", text: data.message });
        setShowConfirmPublish(false);
        fetchResults();
      } else {
        setNotification({ type: "error", text: data.error || "Failed to update publication." });
      }
    } catch {
      setNotification({ type: "error", text: "Network error updating publication." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = "/api/admin/results/export";
  };

  const handlePrintMeritList = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between no-print print:hidden ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs no-print print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Final Results & Merit List
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official 100-Mark Tabulation: Phase 1 (80M) + Coding Q1 (10M) + Coding Q2 (10M).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={fetchResults}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold text-slate-700 bg-white"
            onClick={handleExportCsv}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold text-slate-700 bg-white"
            onClick={handlePrintMeritList}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            Print Merit List
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100/50"
            onClick={() => setShowConfirmFinalize(true)}
          >
            <Award className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
            Finalize All Eligible
          </Button>
          <Button
            size="sm"
            variant={summary.isPublished ? "outline" : "primary"}
            className={`text-xs font-bold ${
              summary.isPublished
                ? "text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100"
                : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
            }`}
            onClick={() => setShowConfirmPublish(true)}
          >
            {summary.isPublished ? (
              <>
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                Unpublish Results
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Publish Results Now
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print print:hidden">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Students</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{summary.totalStudents}</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Finalized</span>
          <span className="text-xl font-black text-blue-700 mt-1 block">
            {summary.finalizedCount} <span className="text-xs text-slate-400 font-normal">/ {summary.totalStudents}</span>
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Publication State</span>
          <div className="mt-1">
            <Badge variant={summary.isPublished ? "success" : "warning"}>
              {summary.isPublished ? "Published" : "Unpublished"}
            </Badge>
          </div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Highest Score</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">
            {summary.highestScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Average Score</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {summary.averageScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Scorecards Available</span>
          <span className="text-xl font-black text-purple-700 mt-1 block">
            {summary.isPublished ? summary.finalizedCount : 0}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs no-print print:hidden">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by candidate name, roll number, or participant ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="ALL">All Courses</option>
              <option value="BCA">BCA</option>
              <option value="MCA">MCA</option>
              <option value="BBA">BBA</option>
              <option value="MBA">MBA</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="finalized">Finalized</option>
              <option value="pending">Pending</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Results Table */}
      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="no-print print:hidden">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Official Merit Standing & Mark Sheet
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Ranks calculated via deterministic tie-breaking (Total Score &rarr; Phase 1 &rarr; Coding &rarr; Timestamp).
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Showing {results.length} Candidate Records
            </span>
          </div>
        </CardHeader>

        {/* Print-Only Header */}
        <div className="hidden print:block p-6 text-center border-b-2 border-black">
          <h1 className="text-lg font-black uppercase">
            Lalit Narayan Mishra College of Business Management
          </h1>
          <h2 className="text-sm font-bold uppercase mt-1">
            Codethon 2026: Official Master Merit List
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Published: {new Date().toLocaleDateString("en-IN")} • Certified Examination Record
          </p>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Compiling marks and ranks...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No records match criteria</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search query or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 print:bg-white print:border-black">
                  <tr>
                    <th className="py-3 px-3.5 text-center">Rank</th>
                    <th className="py-3 px-3.5">Candidate Details</th>
                    <th className="py-3 px-3.5 text-center">Course</th>
                    <th className="py-3 px-3.5 text-center font-mono">Phase 1 (80M)</th>
                    <th className="py-3 px-3.5 text-center font-mono">Code Q1 (10M)</th>
                    <th className="py-3 px-3.5 text-center font-mono">Code Q2 (10M)</th>
                    <th className="py-3 px-3.5 text-center font-mono">Total (100M)</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-center">Publication</th>
                    <th className="py-3 px-3.5 text-right no-print print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {results.map((r, idx) => {
                    const isTop3 = r.rank && r.rank <= 3;
                    return (
                      <tr
                        key={r.id || idx}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isTop3 ? "bg-amber-50/20" : ""
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-3.5 text-center">
                          {r.rank ? (
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                                r.rank === 1
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : r.rank === 2
                                  ? "bg-slate-200 text-slate-800 border border-slate-300"
                                  : r.rank === 3
                                  ? "bg-amber-50 text-amber-900 border border-amber-200"
                                  : "text-slate-600 font-bold font-mono"
                              }`}
                            >
                              {r.rank}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">-</span>
                          )}
                        </td>

                        {/* Candidate */}
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-slate-900">{r.student_name}</div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                            <span>{r.roll_number}</span>
                            <span>•</span>
                            <span className="text-blue-600 font-bold">{r.participant_id}</span>
                          </div>
                        </td>

                        {/* Course */}
                        <td className="py-3 px-3.5 text-center font-semibold text-slate-700">
                          {r.course}
                        </td>

                        {/* Phase 1 */}
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-800">
                          {r.phase1_score}
                        </td>

                        {/* Code Q1 */}
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-800">
                          {r.coding_q1_score}
                        </td>

                        {/* Code Q2 */}
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-800">
                          {r.coding_q2_score}
                        </td>

                        {/* Total Score */}
                        <td className="py-3 px-3.5 text-center font-mono font-black text-sm text-blue-900 print:text-black">
                          {r.total_score}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3.5 text-center">
                          {r.is_terminated ? (
                            <Badge variant="danger">Terminated</Badge>
                          ) : r.attempt_status === "phase2_completed" ? (
                            <Badge variant="success">Completed</Badge>
                          ) : r.attempt_status === "phase1_completed" ? (
                            <Badge variant="warning">Phase 1</Badge>
                          ) : (
                            <Badge variant="secondary">In Progress</Badge>
                          )}
                        </td>

                        {/* Publication Badge */}
                        <td className="py-3 px-3.5 text-center">
                          {r.is_published ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Published
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400">
                              Unpublished
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right no-print print:hidden">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-2.5"
                            onClick={() => setSelectedResult(r)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Scorecard
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scorecard Preview Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:max-h-none print:m-0 print:p-0 print:overflow-visible">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 no-print print:hidden">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold text-slate-800">
                  Certified Scorecard Preview: {selectedResult.student_name} ({selectedResult.roll_number})
                </h3>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 print:p-0 print:overflow-visible">
              <OfficialScorecard
                scorecard={{
                  student_name: selectedResult.student_name,
                  roll_number: selectedResult.roll_number,
                  course: selectedResult.course,
                  participant_id: selectedResult.participant_id,
                  phase1_score: selectedResult.phase1_score,
                  coding_q1_score: selectedResult.coding_q1_score,
                  coding_q2_score: selectedResult.coding_q2_score,
                  total_score: selectedResult.total_score,
                  rank: selectedResult.rank,
                  is_published: selectedResult.is_published,
                  verification_id: selectedResult.verification_id,
                  finalized_at: selectedResult.finalized_at,
                }}
                showPrintButton={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Finalize Modal */}
      {showConfirmFinalize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Finalize All Eligible Attempts?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will calculate and freeze scores for all candidates who completed Phase 2 or were officially concluded/terminated. Ranks will be recalculated deterministically.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmFinalize(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleFinalizeAll}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Confirm & Finalize"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Publish / Unpublish Modal */}
      {showConfirmPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                summary.isPublished ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {summary.isPublished ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {summary.isPublished ? "Unpublish Official Results?" : "Publish Official Results?"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {summary.isPublished
                  ? "Unpublishing will immediately revoke student access to scorecards and merit ranks. Only administrators will be able to view scores."
                  : "Publishing will immediately grant students access to their official scorecards and merit standing in the student portal, and activate the public verification registry."}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmPublish(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant={summary.isPublished ? "outline" : "primary"}
                className={
                  summary.isPublished
                    ? "text-amber-700 border-amber-300"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }
                size="sm"
                onClick={handleTogglePublish}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Updating..."
                  : summary.isPublished
                  ? "Confirm Unpublish"
                  : "Confirm & Publish"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
