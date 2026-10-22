"use client";

import * as React from "react";
import {
  Users,
  UploadCloud,
  Download,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  RotateCcw,
  CheckCircle,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  Mail,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FileImage,
  X,
  ExternalLink,
  Database,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentRecord, StudentMetrics } from "@/lib/services/students-service";
import { StudentRegistrationRecord, RegistrationMetrics } from "@/lib/services/registration-service";
import { AddStudentModal } from "@/components/admin/students/AddStudentModal";
import { EditStudentModal } from "@/components/admin/students/EditStudentModal";
import { StudentDetailsModal } from "@/components/admin/students/StudentDetailsModal";
import { ImportCsvModal } from "@/components/admin/students/ImportCsvModal";
import { ConfirmDialog } from "@/components/admin/students/ConfirmDialog";
import { CredentialsModal } from "@/components/admin/students/CredentialsModal";
import { EmailLogsModal } from "@/components/admin/students/EmailLogsModal";
import { InvigilatorExportModal } from "@/components/admin/students/InvigilatorExportModal";
import { DatabasePersistenceModal } from "@/components/admin/DatabasePersistenceModal";

const COURSES = ["ALL", "BCA", "MCA", "BBA", "MBA", "B.Com", "M.Com", "Other"];
const STATUS_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Active Eligible", value: "active" },
  { label: "Inactive Suspended", value: "inactive" },
  { label: "Pending Auth Setup", value: "pending_auth" },
];

export default function AdminStudentsPage() {
  const [activeTab, setActiveTab] = React.useState<"roster" | "registrations">("roster");

  // Roster State
  const [students, setStudents] = React.useState<StudentRecord[]>([]);
  const [metrics, setMetrics] = React.useState<StudentMetrics>({
    total: 0,
    active: 0,
    inactive: 0,
    pendingAuth: 0,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLiveDatabase, setIsLiveDatabase] = React.useState<boolean | null>(null);
  const [isDbHelpOpen, setIsDbHelpOpen] = React.useState(false);

  // Filters for Roster
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");

  // Registration Requests State
  const [registrations, setRegistrations] = React.useState<StudentRegistrationRecord[]>([]);
  const [regMetrics, setRegMetrics] = React.useState<RegistrationMetrics>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [isRegLoading, setIsRegLoading] = React.useState(false);
  const [regSearchQuery, setRegSearchQuery] = React.useState("");
  const [regStatusFilter, setRegStatusFilter] = React.useState("all");

  // Selected ID Card for Modal Preview
  const [selectedRegForIdPreview, setSelectedRegForIdPreview] =
    React.useState<StudentRegistrationRecord | null>(null);

  // Processing action state for specific registration ID
  const [processingRegId, setProcessingRegId] = React.useState<string | null>(null);
  const [regActionMessage, setRegActionMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modals for Roster
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = React.useState<StudentRecord | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = React.useState<StudentRecord | null>(null);

  // Credentials & Email Modals
  const [isCredentialsOpen, setIsCredentialsOpen] = React.useState(false);
  const [credentialsTargetStudent, setCredentialsTargetStudent] = React.useState<StudentRecord | null>(null);
  const [isEmailLogsOpen, setIsEmailLogsOpen] = React.useState(false);
  const [isInvigilatorExportOpen, setIsInvigilatorExportOpen] = React.useState(false);

  // Confirmation dialogs
  const [confirmToggleStudent, setConfirmToggleStudent] = React.useState<StudentRecord | null>(null);
  const [confirmDeleteStudent, setConfirmDeleteStudent] = React.useState<StudentRecord | null>(null);
  const [isActionLoading, setIsActionLoading] = React.useState(false);

  // Fetch students
  const fetchStudents = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (selectedCourse !== "ALL") params.set("course", selectedCourse);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load candidate roster.");
      }
      const data = await res.json();
      setStudents(data.students || []);
      if (typeof data.isLiveDatabase === "boolean") {
        setIsLiveDatabase(data.isLiveDatabase);
      }
      setMetrics(
        data.metrics || {
          total: 0,
          active: 0,
          inactive: 0,
          pendingAuth: 0,
        }
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading data");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCourse, selectedStatus]);

  // Fetch registration requests
  const fetchRegistrations = React.useCallback(async () => {
    setIsRegLoading(true);
    try {
      const params = new URLSearchParams();
      if (regStatusFilter !== "all") params.set("status", regStatusFilter);
      if (regSearchQuery.trim()) params.set("search", regSearchQuery.trim());

      const res = await fetch(`/api/admin/registrations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
        if (typeof data.isLiveDatabase === "boolean") {
          setIsLiveDatabase(data.isLiveDatabase);
        }
        if (data.metrics) {
          setRegMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error("Failed to load registrations:", err);
    } finally {
      setIsRegLoading(false);
    }
  }, [regStatusFilter, regSearchQuery]);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  React.useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Toggle active status
  const handleToggleStatus = async () => {
    if (!confirmToggleStudent) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${confirmToggleStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !confirmToggleStudent.is_active }),
      });
      if (!res.ok) throw new Error("Failed to update candidate status.");
      await fetchStudents();
      setConfirmToggleStudent(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete student
  const handleDelete = async () => {
    if (!confirmDeleteStudent) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${confirmDeleteStudent.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete candidate.");
      await fetchStudents();
      setConfirmDeleteStudent(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Approve Registration Request
  const handleApproveRegistration = async (registration: StudentRegistrationRecord) => {
    setProcessingRegId(registration.id);
    setRegActionMessage(null);
    try {
      const res = await fetch(`/api/admin/registrations/${registration.id}/approve`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to approve registration.");
      }

      setRegActionMessage({
        type: "success",
        text: `Registration for ${registration.full_name} (${registration.roll_number}) approved! Credentials have been sent to ${registration.email}.`,
      });

      // Refresh both registrations and students roster
      await fetchRegistrations();
      await fetchStudents();
      setSelectedRegForIdPreview(null);
    } catch (err: unknown) {
      setRegActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Approval failed.",
      });
    } finally {
      setProcessingRegId(null);
    }
  };

  // Handle Reject Registration Request
  const handleRejectRegistration = async (registration: StudentRegistrationRecord) => {
    const reason = window.prompt(
      `Enter reason for rejecting registration of ${registration.full_name}:`,
      "College ID Card photo is illegible or does not match entered roll number."
    );
    if (reason === null) return; // user cancelled

    setProcessingRegId(registration.id);
    setRegActionMessage(null);
    try {
      const res = await fetch(`/api/admin/registrations/${registration.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reject registration.");
      }

      setRegActionMessage({
        type: "success",
        text: `Registration for ${registration.full_name} has been marked as rejected.`,
      });

      await fetchRegistrations();
      setSelectedRegForIdPreview(null);
    } catch (err: unknown) {
      setRegActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Rejection failed.",
      });
    } finally {
      setProcessingRegId(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = [
      "Roll Number",
      "Full Name",
      "Email",
      "Department",
      "Mobile",
      "Participant ID",
      "Status",
      "Enrolled Date",
    ];
    const rows = students.map((s) => [
      `"${s.roll_number}"`,
      `"${s.full_name.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      `"${s.course}"`,
      `"${s.mobile || "N/A"}"`,
      `"${s.participant_id}"`,
      s.is_active ? "Active" : "Suspended",
      `"${new Date(s.created_at).toLocaleDateString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `lnmcbm_candidate_roster_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
              Exam Administration
            </span>
            {isLiveDatabase === true && (
              <Badge variant="success" className="text-[10px] font-semibold gap-1">
                <Database className="w-3 h-3" /> Supabase Live (Persistent)
              </Badge>
            )}
            {isLiveDatabase === false && (
              <button
                onClick={() => setIsDbHelpOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
                title="Click to see why details disappear and how to connect database"
              >
                <AlertTriangle className="w-3 h-3 text-amber-700" /> In-Memory Mode (Warning)
              </button>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Student Management &amp; Candidate Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage enrolled students, review self-registration requests, approve ID credentials, and export records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEmailLogsOpen(true)}
            className="text-xs font-semibold shadow-xs"
          >
            <Mail className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Email Logs
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsInvigilatorExportOpen(true)}
            className="text-xs font-semibold border-amber-200 text-amber-800 bg-amber-50/50 hover:bg-amber-100 shadow-xs"
            disabled={students.length === 0}
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            Invigilator Passwords CSV
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCredentialsTargetStudent(null);
              setIsCredentialsOpen(true);
            }}
            className="text-xs font-semibold border-emerald-200 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100 shadow-xs"
            disabled={students.length === 0}
          >
            <KeyRound className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Issue Credentials &amp; Email ({metrics.pendingAuth})
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs font-semibold shadow-xs"
            disabled={students.length === 0}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Export Roster ({students.length})
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsImportOpen(true)}
            className="text-xs font-semibold border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Import CSV
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            className="text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Student
          </Button>
        </div>
      </div>

      {/* High-visibility Warning Banner if Running on Temporary RAM */}
      {!isLoading && isLiveDatabase === false && (
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50/95 p-4 sm:p-5 shadow-xs text-slate-900 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-extrabold text-amber-950">
                    Ephemeral Storage Mode: Supabase PostgreSQL Not Connected
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    Data Wipes On Server Sleep (1–2 Mins)
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  The portal is currently saving students and credentials in <strong>temporary server RAM</strong>. On Vercel, server RAM resets automatically after 1–2 minutes of idle time. To keep candidate data, passwords, and exam scores permanently (for 1+ months), connect your Supabase database keys in Vercel.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsDbHelpOpen(true)}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
              size="sm"
            >
              <Database className="w-3.5 h-3.5 mr-1.5" />
              Fix Database Persistence
            </Button>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === "roster"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Enrolled Candidates</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === "roster" ? "bg-blue-800 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("registrations")}
          className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === "registrations"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Registration Requests</span>
          {regMetrics.pending > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
              {regMetrics.pending} PENDING
            </span>
          ) : (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "registrations" ? "bg-blue-800 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {regMetrics.total}
            </span>
          )}
        </button>
      </div>

      {/* Feedback Alert for Registration Action */}
      {regActionMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            regActionMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {regActionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{regActionMessage.text}</span>
          </div>
          <button
            onClick={() => setRegActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ENROLLED CANDIDATE ROSTER */}
      {/* ========================================================================= */}
      {activeTab === "roster" && (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-xs">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Enrolled
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.total}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-xs">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Active Eligible
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.active}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-xs">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                    Suspended / Inactive
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.inactive}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-xs">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    Pending Auth Setup
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.pendingAuth}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Directory Card */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Candidate Roster
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Showing {students.length} of {metrics.total} registered participants.
                </CardDescription>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] sm:min-w-[240px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, roll, email..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c === "ALL" ? "All Departments" : c}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-xs">Loading candidate roster...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-rose-600 text-xs">
                  <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-700">No candidates found.</p>
                  <p className="text-slate-400 mt-1">Enroll students manually or import via CSV.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">Participant ID</th>
                        <th className="py-3 px-4">Department / Program</th>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{student.full_name}</div>
                            <div className="font-mono text-[11px] text-slate-500">
                              {student.roll_number}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {student.participant_id}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">{student.course}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            {student.email}
                          </td>
                          <td className="py-3 px-4">
                            {student.is_active ? (
                              <Badge variant="success" className="text-[10px]">
                                Active Eligible
                              </Badge>
                            ) : (
                              <Badge variant="danger" className="text-[10px]">
                                Suspended
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setCredentialsTargetStudent(student);
                                  setIsCredentialsOpen(true);
                                }}
                                className="h-7 px-2 text-[11px] text-emerald-700 hover:bg-emerald-50"
                                title="Issue / Reset Credentials"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedStudentForView(student)}
                                className="h-7 px-2 text-[11px]"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedStudentForEdit(student)}
                                className="h-7 px-2 text-[11px]"
                                title="Edit Record"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmToggleStudent(student)}
                                className={`h-7 px-2 text-[11px] ${
                                  student.is_active
                                    ? "text-amber-600 hover:bg-amber-50"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                                title={student.is_active ? "Suspend Student" : "Activate Student"}
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmDeleteStudent(student)}
                                className="h-7 px-2 text-[11px] text-rose-600 hover:bg-rose-50"
                                title="Delete Candidate"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CANDIDATE SELF-REGISTRATION REQUESTS & ID VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === "registrations" && (
        <>
          {/* Registration Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-xs">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Submissions
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{regMetrics.total}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-xs bg-amber-50/20">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    Pending Verification
                  </p>
                  <h3 className="text-2xl font-extrabold text-amber-700 mt-1">
                    {regMetrics.pending}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 shadow-xs bg-emerald-50/20">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Approved &amp; Emailed
                  </p>
                  <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">
                    {regMetrics.approved}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-rose-200 shadow-xs bg-rose-50/20">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                    Rejected
                  </p>
                  <h3 className="text-2xl font-extrabold text-rose-700 mt-1">
                    {regMetrics.rejected}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Requests Table */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Candidate Self-Registrations &amp; ID Proofs
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Review submitted college ID photos and approve login credentials for candidates.
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] sm:min-w-[240px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regSearchQuery}
                    onChange={(e) => setRegSearchQuery(e.target.value)}
                    placeholder="Search candidate, roll, email..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={regStatusFilter}
                  onChange={(e) => setRegStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Only ({regMetrics.pending})</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isRegLoading ? (
                <div className="p-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-xs">Loading registration requests...</p>
                </div>
              ) : registrations.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-700">No registration requests found.</p>
                  <p className="text-slate-400 mt-1">
                    When prospective students register via the public portal, their submissions appear here for review.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Candidate Name &amp; Roll</th>
                        <th className="py-3 px-4">Department &amp; Semester</th>
                        <th className="py-3 px-4">Contact Info</th>
                        <th className="py-3 px-4 text-center">College ID Proof</th>
                        <th className="py-3 px-4">Submission Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Approval Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{reg.full_name}</div>
                            <div className="font-mono text-[11px] text-blue-700 font-bold">
                              {reg.roll_number}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-slate-800 font-semibold">{reg.department}</div>
                            <div className="text-[11px] text-slate-500">{reg.semester}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-mono text-[11px] text-slate-700">{reg.email}</div>
                            <div className="font-mono text-[11px] text-slate-500">{reg.mobile}</div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedRegForIdPreview(reg)}
                              className="group inline-flex flex-col items-center gap-1 p-1 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:shadow-xs transition-all"
                            >
                              <div className="w-12 h-10 rounded bg-slate-100 overflow-hidden relative border border-slate-200">
                                <img
                                  src={reg.id_card_data}
                                  alt="ID Thumbnail"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <span className="text-[10px] text-blue-600 font-semibold group-hover:underline">
                                Inspect ID
                              </span>
                            </button>
                          </td>

                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {new Date(reg.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>

                          <td className="py-3 px-4">
                            {reg.status === "pending" ? (
                              <Badge variant="warning" className="text-[10px]">
                                Pending Review
                              </Badge>
                            ) : reg.status === "approved" ? (
                              <Badge variant="success" className="text-[10px]">
                                Approved &amp; Sent
                              </Badge>
                            ) : (
                              <Badge variant="danger" className="text-[10px]">
                                Rejected
                              </Badge>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            {reg.status === "pending" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="primary"
                                  disabled={processingRegId === reg.id}
                                  onClick={() => handleApproveRegistration(reg)}
                                  className="h-8 px-3 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs"
                                >
                                  {processingRegId === reg.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  )}
                                  <span>Approve &amp; Send Credentials</span>
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={processingRegId === reg.id}
                                  onClick={() => handleRejectRegistration(reg)}
                                  className="h-8 px-2.5 text-[11px] text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : reg.status === "approved" ? (
                              <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-700 font-semibold">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Credentials Dispatched
                              </div>
                            ) : (
                              <div className="text-[11px] text-rose-600 font-medium">
                                {reg.rejection_reason || "Rejected"}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ========================================================================= */}
      {/* ID CARD FULL PREVIEW MODAL */}
      {/* ========================================================================= */}
      {selectedRegForIdPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">
                  College ID Card Proof: {selectedRegForIdPreview.full_name} ({selectedRegForIdPreview.roll_number})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRegForIdPreview(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Candidate Info Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Name</span>
                  <strong className="text-slate-900 truncate block">
                    {selectedRegForIdPreview.full_name}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Roll No</span>
                  <strong className="font-mono text-blue-700 block">
                    {selectedRegForIdPreview.roll_number}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Department</span>
                  <strong className="text-slate-800 block truncate">
                    {selectedRegForIdPreview.department}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Semester</span>
                  <strong className="text-slate-800 block">
                    {selectedRegForIdPreview.semester}
                  </strong>
                </div>
              </div>

              {/* ID Photo Display */}
              <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[460px] p-2">
                <img
                  src={selectedRegForIdPreview.id_card_data}
                  alt="Student ID Card"
                  className="max-h-[440px] max-w-full object-contain rounded"
                />
              </div>

              <div className="text-[11px] text-slate-500 text-center">
                Candidate Email: <strong className="text-slate-800">{selectedRegForIdPreview.email}</strong> &bull; Mobile: <strong className="text-slate-800">{selectedRegForIdPreview.mobile}</strong>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRegForIdPreview(null)}
                className="text-xs"
              >
                Close Preview
              </Button>

              {selectedRegForIdPreview.status === "pending" && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={processingRegId === selectedRegForIdPreview.id}
                    onClick={() => handleRejectRegistration(selectedRegForIdPreview)}
                    className="text-xs text-rose-600 hover:bg-rose-50"
                  >
                    Reject ID Proof
                  </Button>

                  <Button
                    size="sm"
                    variant="primary"
                    disabled={processingRegId === selectedRegForIdPreview.id}
                    onClick={() => handleApproveRegistration(selectedRegForIdPreview)}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                  >
                    {processingRegId === selectedRegForIdPreview.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    Approve &amp; Send Login Credentials
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals & Dialogs for Roster */}
      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchStudents}
      />

      <ImportCsvModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={fetchStudents}
      />

      <EditStudentModal
        isOpen={Boolean(selectedStudentForEdit)}
        student={selectedStudentForEdit}
        onClose={() => setSelectedStudentForEdit(null)}
        onSuccess={fetchStudents}
      />

      <StudentDetailsModal
        isOpen={Boolean(selectedStudentForView)}
        student={selectedStudentForView}
        onClose={() => setSelectedStudentForView(null)}
        onEdit={(st) => setSelectedStudentForEdit(st)}
      />

      {/* Confirmation: Toggle Active / Inactive */}
      <ConfirmDialog
        isOpen={Boolean(confirmToggleStudent)}
        title={
          confirmToggleStudent?.is_active
            ? "Suspend Candidate Participation?"
            : "Re-activate Candidate?"
        }
        description={
          confirmToggleStudent?.is_active
            ? `Suspending ${confirmToggleStudent.full_name} (Roll: ${confirmToggleStudent.roll_number}) will immediately block them from starting or continuing competition phases.`
            : `Re-activating ${confirmToggleStudent?.full_name} will restore their eligibility to participate in the competition.`
        }
        confirmLabel={confirmToggleStudent?.is_active ? "Suspend Candidate" : "Re-activate"}
        variant={confirmToggleStudent?.is_active ? "warning" : "default"}
        isLoading={isActionLoading}
        onConfirm={handleToggleStatus}
        onClose={() => setConfirmToggleStudent(null)}
      />

      {/* Confirmation: Delete Student */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteStudent)}
        title="Remove Candidate Record?"
        description={`Are you sure you want to delete ${confirmDeleteStudent?.full_name} (Roll: ${confirmDeleteStudent?.roll_number})? This action cannot be undone.`}
        confirmLabel="Delete Candidate"
        variant="danger"
        isLoading={isActionLoading}
        onConfirm={handleDelete}
        onClose={() => setConfirmDeleteStudent(null)}
      />

      {/* Credentials & Email Dispatch Modal */}
      <CredentialsModal
        isOpen={isCredentialsOpen}
        student={credentialsTargetStudent}
        pendingCount={metrics.pendingAuth}
        onClose={() => {
          setIsCredentialsOpen(false);
          setCredentialsTargetStudent(null);
        }}
        onSuccess={fetchStudents}
      />

      {/* Email Delivery Logs Modal */}
      <EmailLogsModal
        isOpen={isEmailLogsOpen}
        onClose={() => setIsEmailLogsOpen(false)}
      />

      {/* Confidential Invigilator Passwords Export Modal */}
      <InvigilatorExportModal
        isOpen={isInvigilatorExportOpen}
        totalStudents={metrics.total}
        onClose={() => setIsInvigilatorExportOpen(false)}
      />

      {/* Database Persistence & Setup Diagnostic Modal */}
      <DatabasePersistenceModal
        isOpen={isDbHelpOpen}
        onClose={() => setIsDbHelpOpen(false)}
        isLiveDatabase={isLiveDatabase}
        onRefreshStatus={() => {
          fetchStudents();
          fetchRegistrations();
        }}
      />
    </div>
  );
}
