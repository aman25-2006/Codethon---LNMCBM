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
import { MCQCategory, CATEGORY_SPECS, MCQImportSummary } from "@/lib/services/questions-service";

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedQuestionRow {
  rowNumber: number;
  category: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks?: number;
  explanation?: string;
  case_study_passage?: string;
  code_snippet?: string;
  isValid: boolean;
  errorReason?: string;
}

export function ImportQuestionsModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportQuestionsModalProps) {
  // Steps: 1: Select File, 2: Preview & Validation, 3: Completed Summary
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [file, setFile] = React.useState<File | null>(null);
  const [fileName, setFileName] = React.useState<string>("");
  const [parsing, setParsing] = React.useState<boolean>(false);
  const [importing, setImporting] = React.useState<boolean>(false);
  const [parseError, setParseError] = React.useState<string | null>(null);

  const [parsedRows, setParsedRows] = React.useState<ParsedQuestionRow[]>([]);
  const [filterMode, setFilterMode] = React.useState<"all" | "valid" | "invalid">("all");
  const [importSummary, setImportSummary] = React.useState<MCQImportSummary | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setStep(1);
    setFile(null);
    setFileName("");
    setParsing(false);
    setImporting(false);
    setParseError(null);
    setParsedRows([]);
    setFilterMode("all");
    setImportSummary(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      processFile(dropped);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setParseError("Please select a standard CSV (.csv) file.");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setParsing(true);
    setParseError(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        setParsing(false);
        if (!results.data || results.data.length === 0) {
          setParseError("The uploaded CSV file is empty or contains no readable records.");
          return;
        }

        const validCategories = Object.keys(CATEGORY_SPECS) as MCQCategory[];

        const rows: ParsedQuestionRow[] = results.data.map((raw: any, index: number) => {
          // Normalize keys case-insensitively
          const findKey = (prefix: string) => {
            const keys = Object.keys(raw);
            const found = keys.find(
              (k) =>
                k.trim().toLowerCase() === prefix.toLowerCase() ||
                k.trim().toLowerCase().replace(/[^a-z0-9]/g, "") === prefix.toLowerCase().replace(/[^a-z0-9]/g, "")
            );
            return found ? String(raw[found] || "").trim() : "";
          };

          const categoryRaw = findKey("category");
          const question = findKey("question") || findKey("question_text");
          const option_a = findKey("option_a") || findKey("optiona");
          const option_b = findKey("option_b") || findKey("optionb");
          const option_c = findKey("option_c") || findKey("optionc");
          const option_d = findKey("option_d") || findKey("optiond");
          const correct_option = (findKey("correct_option") || findKey("correctoption") || findKey("answer")).toUpperCase();
          const explanation = findKey("explanation");
          const case_study_passage = findKey("case_study_passage") || findKey("passage");
          const code_snippet = findKey("code_snippet") || findKey("code");

          // Validation
          let isValid = true;
          let errorReason = "";

          const matchedCategory = validCategories.find(
            (c) => c.toLowerCase() === categoryRaw.toLowerCase()
          );

          if (!question) {
            isValid = false;
            errorReason = "Question stem text is missing.";
          } else if (!matchedCategory) {
            isValid = false;
            errorReason = `Category '${categoryRaw}' invalid. Must be Fundamentals, Technical Understanding, Logic and Debugging, or Case Study.`;
          } else if (!option_a || !option_b || !option_c || !option_d) {
            isValid = false;
            errorReason = "All 4 options (A, B, C, D) are required.";
          } else if (!["A", "B", "C", "D"].includes(correct_option)) {
            isValid = false;
            errorReason = `Correct option '${correct_option}' invalid. Must be A, B, C, or D.`;
          } else if (matchedCategory === "Case Study" && !case_study_passage) {
            isValid = false;
            errorReason = "Case Study questions require an associated background passage.";
          }

          return {
            rowNumber: index + 1,
            category: matchedCategory || categoryRaw,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            marks: matchedCategory ? CATEGORY_SPECS[matchedCategory].marksEach : 1,
            explanation,
            case_study_passage,
            code_snippet,
            isValid,
            errorReason,
          };
        });

        setParsedRows(rows);
        setStep(2);
      },
      error: (err) => {
        setParsing(false);
        setParseError(`CSV Parsing failed: ${err.message}`);
      },
    });
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const displayedRows =
    filterMode === "valid"
      ? validRows
      : filterMode === "invalid"
      ? invalidRows
      : parsedRows;

  const handleExecuteImport = async () => {
    if (validRows.length === 0) return;

    setImporting(true);
    setParseError(null);

    try {
      const payload = validRows.map((r) => ({
        category: r.category,
        question: r.question,
        option_a: r.option_a,
        option_b: r.option_b,
        option_c: r.option_c,
        option_d: r.option_d,
        correct_option: r.correct_option,
        marks: r.marks,
        explanation: r.explanation,
        case_study_passage: r.case_study_passage,
        code_snippet: r.code_snippet,
      }));

      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Bulk import failed.");
      }

      setImportSummary(data.summary);
      setStep(3);
      onSuccess();
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : "Import execution error.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Bulk Import MCQ Questions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload competition question sets across all 4 categories via CSV.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper */}
        <div className="px-6 py-3 bg-slate-100/50 border-b border-slate-200/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 ${step === 1 ? "font-bold text-blue-600" : "text-slate-500"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                1
              </div>
              Select CSV
            </div>
            <div className={`flex items-center gap-2 ${step === 2 ? "font-bold text-blue-600" : "text-slate-500"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                2
              </div>
              Validation & Preview
            </div>
            <div className={`flex items-center gap-2 ${step === 3 ? "font-bold text-blue-600" : "text-slate-500"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                3
              </div>
              Completion
            </div>
          </div>

          <a
            href="/api/admin/questions/template"
            download="LNMCBM_MCQ_Question_Bank_Template.csv"
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium hover:underline text-xs"
          >
            <Download className="w-3.5 h-3.5" /> Download Official Template
          </a>
        </div>

        {/* Body based on step */}
        <div className="p-6">
          {/* STEP 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              {parseError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-10 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto text-blue-600 mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Click to browse or drag and drop your MCQ CSV
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Compatible with spreadsheets containing columns for Category, Question, 4 Options, and Correct Answer Key.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-[11px] font-mono bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                    .csv format
                  </span>
                  <span className="text-[11px] font-mono bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                    UTF-8 Encoded
                  </span>
                </div>
              </div>

              {parsing && (
                <div className="flex items-center justify-center gap-2 text-xs text-slate-600 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  Parsing and validating spreadsheet rows...
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Validation & Preview */}
          {step === 2 && (
            <div className="space-y-4">
              {parseError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">{fileName}</div>
                    <div className="text-[11px] text-slate-500">
                      Total: {parsedRows.length} | Valid: {validRows.length} | Flagged: {invalidRows.length}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterMode("all")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      filterMode === "all" ? "bg-slate-800 text-white" : "bg-white border text-slate-600"
                    }`}
                  >
                    All ({parsedRows.length})
                  </button>
                  <button
                    onClick={() => setFilterMode("valid")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      filterMode === "valid" ? "bg-emerald-600 text-white" : "bg-white border text-emerald-700"
                    }`}
                  >
                    Valid ({validRows.length})
                  </button>
                  <button
                    onClick={() => setFilterMode("invalid")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      filterMode === "invalid" ? "bg-red-600 text-white" : "bg-white border text-red-700"
                    }`}
                  >
                    Errors ({invalidRows.length})
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-lg max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5 w-12">#</th>
                      <th className="p-2.5 w-28">Category</th>
                      <th className="p-2.5">Question Stem</th>
                      <th className="p-2.5 w-16 text-center">Key</th>
                      <th className="p-2.5 w-14 text-center">Marks</th>
                      <th className="p-2.5 w-28">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedRows.map((row) => (
                      <tr key={row.rowNumber} className={row.isValid ? "hover:bg-slate-50/50" : "bg-red-50/30"}>
                        <td className="p-2.5 text-slate-500 font-mono">{row.rowNumber}</td>
                        <td className="p-2.5 font-medium text-slate-800">{row.category || "—"}</td>
                        <td className="p-2.5 text-slate-700 max-w-xs truncate" title={row.question}>
                          {row.question || "—"}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-800">
                          {row.correct_option || "—"}
                        </td>
                        <td className="p-2.5 text-center font-medium text-slate-600">
                          {row.marks || "—"}
                        </td>
                        <td className="p-2.5">
                          {row.isValid ? (
                            <Badge variant="success" className="text-[10px]">
                              Ready
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-red-600 font-medium block" title={row.errorReason}>
                              {row.errorReason}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: Finished */}
          {step === 3 && importSummary && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">MCQ Import Successful</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Enrolled {importSummary.importedCount} questions successfully into the question bank.
                {importSummary.failedCount > 0 && ` (${importSummary.failedCount} rows were skipped due to formatting errors).`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
          <div>
            {step === 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                disabled={importing}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Upload
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteImport}
                disabled={importing || validRows.length === 0}
              >
                {importing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Enrolling Questions...
                  </>
                ) : (
                  <>
                    Enroll {validRows.length} Valid Question(s)
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            )}

            {step === 3 && (
              <Button variant="primary" size="sm" onClick={handleClose}>
                Done & View Question Bank
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

