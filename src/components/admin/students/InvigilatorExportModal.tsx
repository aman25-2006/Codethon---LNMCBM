"use client";

import * as React from "react";
import { X, ShieldAlert, FileSpreadsheet, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvigilatorExportModalProps {
  isOpen: boolean;
  totalStudents: number;
  onClose: () => void;
}

export function InvigilatorExportModal({
  isOpen,
  totalStudents,
  onClose,
}: InvigilatorExportModalProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/students/credentials/export", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate invigilator export.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `lnmcbm_invigilator_credentials_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invigilator-export-title"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <h3 id="invigilator-export-title" className="text-base font-bold text-slate-900">
                Export Invigilator Roster (With Credentials)
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                This process generates temporary 8-character passwords for active candidates and produces a confidential CSV file for offline exam room check-in.
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={isExporting}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 space-y-1">
            <div className="font-bold">CRITICAL SECURITY MANDATE:</div>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-rose-700">
              <li>Do NOT email this file or upload it to public cloud storage.</li>
              <li>Load strictly onto authorized laboratory invigilator devices.</li>
              <li>Permanently delete or shred this document after the competition ends.</li>
            </ul>
          </div>

          {error && (
            <p className="mt-3 text-xs text-rose-600 font-semibold">{error}</p>
          )}
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isExporting}
            className="text-xs font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="text-xs font-semibold"
          >
            {isExporting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            I Understand, Export Confidential CSV
          </Button>
        </div>
      </div>
    </div>
  );
}

