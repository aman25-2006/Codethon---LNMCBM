"use client";

import * as React from "react";
import Papa from "papaparse";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EMAIL_REGEX, ImportSummary } from "@/lib/services/students-service";

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedRow {
  rowNumber: number;
  name: string;
  roll_number: string;
  course: string;
  email: string;
  mobile: string;
  isValid: boolean;
  errorReason?: string;
}

export function ImportCsvModal({ isOpen, onClose, onSuccess }: ImportCsvModalProps) {
  // Steps: 1: Select File, 2: Preview & Validation, 3: Completed Summary
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);
  const [file, setFile] = React.useState<File | null>(null);
  const [isParsing, setIsParsing] = React.useState(false);
  const [parseError, setParseError] = React.useState<string | null>(null);

  // Parsed and validated rows
  const [rows, setRows] = React.useState<ParsedRow[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [importSummary, setImportSummary] = React.useState<ImportSummary | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFile(null);
      setIsParsing(false);
      setParseError(null);
      setRows([]);
      setIsSubmitting(false);
      setImportSummary(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // STEP A -> STEP B: File Processing
  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".csv") && selectedFile.type !== "text/csv") {
      setParseError("Please select a valid .csv file.");
      return;
    }

    setFile(selectedFile);
    setParseError(null);
    setIsParsing(true);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header: string) => header.trim().toLowerCase(),
      complete: (results) => {
        setIsParsing(false);
        const headers = results.meta.fields || [];

        // Validate presence of required headers
        const hasName = headers.some((h) => h === "name" || h === "full name" || h === "student name");
        const hasRoll = headers.some((h) => h === "roll number" || h === "roll_number" || h === "rollno" || h === "roll");
        const hasCourse = headers.some((h) => h === "course" || h === "department");
        const hasEmail = headers.some((h) => h === "email" || h === "email address");

        if (!hasName || !hasRoll || !hasCourse || !hasEmail) {
          const missing: string[] = [];
          if (!hasName) missing.push("Name");
          if (!hasRoll) missing.push("Roll Number");
          if (!hasCourse) missing.push("Course");
          if (!hasEmail) missing.push("Email");

          setParseError(
            `Missing mandatory CSV column(s): ${missing.join(", ")}. Please ensure the first row contains: Name, Roll Number, Course, Email, Mobile.`
          );
          return;
        }

        // Standardize rows and validate each
        const seenRolls = new Set<string>();
        const seenEmails = new Set<string>();

        const parsedRows: ParsedRow[] = results.data.map((row: any, index: number) => {
          const rowNumber = index + 1;
          const name = (row["name"] || row["full name"] || row["student name"] || "").trim();
          const roll_number = (row["roll number"] || row["roll_number"] || row["rollno"] || row["roll"] || "").trim();
          const course = (row["course"] || row["department"] || "").trim();
          const email = (row["email"] || row["email address"] || "").trim().toLowerCase();
          const mobile = (row["mobile"] || row["phone"] || row["mobile number"] || "").trim();

          // Validation
          if (!name || !roll_number || !course || !email) {
            const missingFields = [];
            if (!name) missingFields.push("Name");
            if (!roll_number) missingFields.push("Roll Number");
            if (!course) missingFields.push("Course");
            if (!email) missingFields.push("Email");

            return {
              rowNumber,
              name,
              roll_number,
              course,
              email,
              mobile,
              isValid: false,
              errorReason: `Missing field: ${missingFields.join(", ")}`,
            };
          }

          if (!EMAIL_REGEX.test(email)) {
            return {
              rowNumber,
              name,
              roll_number,
              course,
              email,
              mobile,
              isValid: false,
              errorReason: `Invalid email format: ${email}`,
            };
          }

          const rollUpper = roll_number.toUpperCase();
          if (seenRolls.has(rollUpper)) {
            return {
              rowNumber,
              name,
              roll_number,
              course,
              email,
              mobile,
              isValid: false,
              errorReason: `Duplicate Roll Number in file: ${roll_number}`,
            };
          }

          if (seenEmails.has(email)) {
            return {
              rowNumber,
              name,
              roll_number,
              course,
              email,
              mobile,
              isValid: false,
              errorReason: `Duplicate Email in file: ${email}`,
            };
          }

          seenRolls.add(rollUpper);
          seenEmails.add(email);

          return {
            rowNumber,
            name,
            roll_number,
            course,
            email,
            mobile,
            isValid: true,
          };
        });

        if (parsedRows.length === 0) {
          setParseError("The uploaded CSV file contains no data rows.");
          return;
        }

        setRows(parsedRows);
        setCurrentStep(2);
      },
      error: (error) => {
        setIsParsing(false);
        setParseError(`CSV Parsing Error: ${error.message}`);
      },
    });
  };

  // STEP D: Confirm and Commit Import
  const handleConfirmImport = async () => {
    const validRows = rows.filter((r) => r.isValid).map((r) => ({
      name: r.name,
      roll_number: r.roll_number,
      course: r.course,
      email: r.email,
      mobile: r.mobile || null,
    }));

    if (validRows.length === 0) {
      setParseError("No valid rows available to import.");
      return;
    }

    setIsSubmitting(true);
    setParseError(null);

    try {
      const res = await fetch("/api/admin/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Bulk import failed on server.");
      }

      setImportSummary(data.summary);
      setCurrentStep(3);
      onSuccess();
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : "Failed to commit import.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations for Step 2 Preview
  const totalRowsCount = rows.length;
  const validRowsCount = rows.filter((r) => r.isValid).length;
  const invalidRowsCount = rows.filter((r) => !r.isValid).length;
  const duplicateRollsCount = rows.filter((r) => r.errorReason?.includes("Duplicate Roll")).length;
  const invalidEmailsCount = rows.filter((r) => r.errorReason?.includes("Invalid email")).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-import-title"
      >
        {/* Header with Step Tracker */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div>
            <h2 id="csv-import-title" className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              Bulk Student Import (CSV)
            </h2>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span className={`font-semibold ${currentStep === 1 ? "text-blue-600" : "text-slate-400"}`}>
                1. Select File
              </span>
              <span>›</span>
              <span className={`font-semibold ${currentStep === 2 ? "text-blue-600" : "text-slate-400"}`}>
                2. Validate & Preview
              </span>
              <span>›</span>
              <span className={`font-semibold ${currentStep === 3 ? "text-blue-600" : "text-slate-400"}`}>
                3. Final Summary
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {parseError && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{parseError}</div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STEP 1: Select CSV File                                           */}
          {/* ------------------------------------------------------------------ */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  {file ? file.name : "Drag and drop your student CSV file here"}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Supports standard UTF-8 CSV with approximately 100 student records.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
                  <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                  Browse Local Files
                </div>
              </div>

              {isParsing && (
                <div className="flex items-center justify-center gap-2 p-4 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Parsing and validating spreadsheet data...
                </div>
              )}

              {/* CSV Format Helper Box */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">Required CSV Column Structure</h4>
                  <a
                    href="/api/admin/students/template"
                    download="lnmcbm_student_import_template.csv"
                    className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download Sample Template
                  </a>
                </div>
                <div className="font-mono text-[11px] bg-slate-900 text-slate-100 p-2.5 rounded overflow-x-auto">
                  Name,Roll Number,Course,Email,Mobile
                  <br />
                  Rahul Kumar,230145,BCA,rahul.kumar@example.com,9876543210
                </div>
                <p className="text-[11px] text-slate-500">
                  • <strong>Mobile</strong> is optional and can be left blank.
                  <br />• <strong>Roll Number</strong> and <strong>Email</strong> must be unique per candidate.
                </p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STEP 2: Preview & Validation                                      */}
          {/* ------------------------------------------------------------------ */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Telemetry Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Rows</span>
                  <span className="text-lg font-bold text-slate-900">{totalRowsCount}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Valid to Import</span>
                  <span className="text-lg font-bold text-emerald-800">{validRowsCount}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Duplicates Found</span>
                  <span className="text-lg font-bold text-amber-800">{duplicateRollsCount}</span>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Invalid / Rejected</span>
                  <span className="text-lg font-bold text-rose-800">{invalidRowsCount}</span>
                </div>
              </div>

              {invalidRowsCount > 0 && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>{invalidRowsCount} row(s)</strong> have validation errors and will be rejected. Valid rows can still be imported safely.
                  </span>
                </div>
              )}

              {/* Records Preview Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-2 px-3 w-12 text-center">#</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Roll No</th>
                        <th className="py-2 px-3">Course</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={row.isValid ? "hover:bg-slate-50/80" : "bg-rose-50/50 hover:bg-rose-50"}
                        >
                          <td className="py-2 px-3 text-center font-mono text-slate-400">
                            {row.rowNumber}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-900 truncate max-w-[120px]">
                            {row.name || <span className="text-slate-400 italic">Empty</span>}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                            {row.roll_number || <span className="text-slate-400 italic">Empty</span>}
                          </td>
                          <td className="py-2 px-3 text-slate-600">{row.course}</td>
                          <td className="py-2 px-3 text-slate-600 truncate max-w-[150px]">
                            {row.email}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {row.isValid ? (
                              <Badge variant="success" className="text-[10px] py-0">
                                Ready
                              </Badge>
                            ) : (
                              <Badge variant="danger" className="text-[10px] py-0" title={row.errorReason}>
                                {row.errorReason}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* STEP 3: Final Import Summary                                      */}
          {/* ------------------------------------------------------------------ */}
          {currentStep === 3 && importSummary && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Bulk Import Processed Successfully
                </h3>
                <p className="text-xs text-slate-500">
                  Candidate records have been processed and enrolled into the competition.
                </p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total In Batch</span>
                  <span className="text-lg font-bold text-slate-900">{importSummary.totalRows}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Imported</span>
                  <span className="text-lg font-bold text-emerald-800">{importSummary.importedCount}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Skipped (Existed)</span>
                  <span className="text-lg font-bold text-amber-800">{importSummary.skippedCount}</span>
                </div>
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Failed</span>
                  <span className="text-lg font-bold text-rose-800">{importSummary.failedCount}</span>
                </div>
              </div>

              {/* Detailed Row Outcomes */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="py-2 px-3 w-12 text-center">Row</th>
                        <th className="py-2 px-3">Roll No</th>
                        <th className="py-2 px-3">Candidate</th>
                        <th className="py-2 px-3">Outcome</th>
                        <th className="py-2 px-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importSummary.details.map((detail, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-center font-mono text-slate-400">
                            {detail.rowNumber}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                            {detail.roll_number}
                          </td>
                          <td className="py-2 px-3 text-slate-800 font-medium">{detail.name}</td>
                          <td className="py-2 px-3">
                            {detail.status === "imported" && (
                              <Badge variant="success" className="text-[10px] py-0">
                                Imported
                              </Badge>
                            )}
                            {detail.status === "skipped" && (
                              <Badge variant="warning" className="text-[10px] py-0">
                                Skipped
                              </Badge>
                            )}
                            {detail.status === "failed" && (
                              <Badge variant="danger" className="text-[10px] py-0">
                                Failed
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3 text-[11px] text-slate-500">
                            {detail.reason || "Processed"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          {currentStep === 1 && (
            <div className="flex items-center justify-end w-full gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentStep(1);
                  setFile(null);
                  setRows([]);
                }}
                disabled={isSubmitting}
                className="text-xs font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Choose Another File
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Cancel Import
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmImport}
                  disabled={isSubmitting || validRowsCount === 0}
                  className="text-xs font-semibold"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  Confirm & Import ({validRowsCount} Students)
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <div className="flex items-center justify-end w-full gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onSuccess();
                }}
                className="text-xs font-semibold"
              >
                Done & View Candidate Roster
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
