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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentRecord, StudentMetrics } from "@/lib/services/students-service";
import { AddStudentModal } from "@/components/admin/students/AddStudentModal";
import { EditStudentModal } from "@/components/admin/students/EditStudentModal";
import { StudentDetailsModal } from "@/components/admin/students/StudentDetailsModal";
import { ImportCsvModal } from "@/components/admin/students/ImportCsvModal";
import { ConfirmDialog } from "@/components/admin/students/ConfirmDialog";
import { CredentialsModal } from "@/components/admin/students/CredentialsModal";
import { EmailLogsModal } from "@/components/admin/students/EmailLogsModal";
import { InvigilatorExportModal } from "@/components/admin/students/InvigilatorExportModal";

const COURSES = ["ALL", "BCA", "MCA", "BBA", "MBA", "B.Com", "M.Com", "Other"];
const STATUS_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  { label: "Active Eligible", value: "active" },
  { label: "Inactive Suspended", value: "inactive" },
  { label: "Pending Auth Setup", value: "pending_auth" },
];

export default function AdminStudentsPage() {
  const [students, setStudents] = React.useState<StudentRecord[]>([]);
  const [metrics, setMetrics] = React.useState<StudentMetrics>({
    total: 0,
    active: 0,
    inactive: 0,
    pendingAuth: 0,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState("ALL");

  // Modals
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

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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
      if (!res.ok) throw new Error("Failed to delete student record.");
      await fetchStudents();
      setConfirmDeleteStudent(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Export filtered students as CSV
  const handleExportCSV = () => {
    if (students.length === 0) {
      alert("No student records available to export.");
      return;
    }

    const headers = [
      "Participant ID",
      "Full Name",
      "Roll Number",
      "Course",
      "Email",
      "Mobile",
      "Status",
      "Auth Setup",
      "Enrolled At",
    ];

    const csvRows = students.map((s) => [
      `"${s.participant_id}"`,
      `"${s.full_name.replace(/"/g, '""')}"`,
      `"${s.roll_number}"`,
      `"${s.course}"`,
      `"${s.email}"`,
      `"${s.mobile || ""}"`,
      `"${s.is_active ? "Active" : "Suspended"}"`,
      `"${s.auth_user_id ? "Configured" : "Pending"}"`,
      `"${new Date(s.created_at).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `lnmcbm_candidate_roster_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = searchQuery !== "" || selectedCourse !== "ALL" || selectedStatus !== "ALL";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
              Exam Administration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Student Management & Candidate Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enroll students manually, bulk-import via CSV, filter, edit records, and export roster data.
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
            Issue Credentials & Email ({metrics.pendingAuth})
          </Button>

          <a
            href="/api/admin/students/template"
            download="lnmcbm_student_import_template.csv"
            className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            CSV Template
          </a>

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

            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCourse("ALL");
                  setSelectedStatus("ALL");
                }}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 h-8"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error && (
            <div className="m-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <Button size="sm" variant="outline" onClick={fetchStudents} className="text-xs">
                Retry
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">
                Loading candidate directory...
              </p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {hasActiveFilters ? "No matching candidates found" : "No candidates enrolled yet"}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "Try adjusting your search query, department, or participation status filters."
                  : "Upload a CSV file containing student records or register candidates individually to build your competition roster."}
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                {hasActiveFilters ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCourse("ALL");
                      setSelectedStatus("ALL");
                    }}
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setIsImportOpen(true)}
                      className="text-xs"
                    >
                      <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                      Import CSV Roster
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddOpen(true)}
                      className="text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add First Student
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Participant ID</th>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Email & Contact</th>
                    <th className="py-3 px-4">Exam Status</th>
                    <th className="py-3 px-4">Auth Account</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {student.participant_id}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block truncate max-w-[160px]">
                          {student.full_name}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Enrolled: {new Date(student.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {student.roll_number}
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] py-0 font-medium bg-slate-50">
                          {student.course}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-700 block truncate max-w-[180px]">
                          {student.email}
                        </span>
                        {student.mobile ? (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {student.mobile}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block italic">
                            No mobile
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {student.is_active ? (
                          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {student.auth_user_id ? (
                          <button
                            onClick={() => {
                              setCredentialsTargetStudent(student);
                              setIsCredentialsOpen(true);
                            }}
                            className="inline-flex items-center text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
                            title="Click to rotate credentials or resend email"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Configured ↺
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setCredentialsTargetStudent(student);
                              setIsCredentialsOpen(true);
                            }}
                            className="inline-flex items-center text-[11px] text-amber-700 hover:text-amber-800 font-semibold bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200"
                            title="Generate credentials for this candidate"
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-1 text-amber-600" />
                            Issue Pass
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setCredentialsTargetStudent(student);
                              setIsCredentialsOpen(true);
                            }}
                            title="Issue / Reissue Credentials & Send Email"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedStudentForView(student)}
                            title="View Full Profile"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedStudentForEdit(student)}
                            title="Edit Record"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setConfirmToggleStudent(student)}
                            title={student.is_active ? "Suspend Participation" : "Re-activate Candidate"}
                            className={`p-1.5 rounded-md transition-colors ${
                              student.is_active
                                ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {student.is_active ? (
                              <ShieldAlert className="w-3.5 h-3.5" />
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => setConfirmDeleteStudent(student)}
                            title="Remove Candidate"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modals & Dialogs */}
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
    </div>
  );
}
