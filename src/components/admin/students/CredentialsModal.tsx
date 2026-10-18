"use client";

import * as React from "react";
import {
  X,
  KeyRound,
  Mail,
  Send,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudentRecord } from "@/lib/services/students-service";
import { CredentialIssueResult } from "@/lib/services/credentials-service";

interface CredentialsModalProps {
  isOpen: boolean;
  student: StudentRecord | null; // If null, bulk mode
  pendingCount?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function CredentialsModal({
  isOpen,
  student,
  pendingCount = 0,
  onClose,
  onSuccess,
}: CredentialsModalProps) {
  const [sendEmail, setSendEmail] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [singleResult, setSingleResult] = React.useState<CredentialIssueResult | null>(null);
  const [copied, setCopied] = React.useState(false);

  const isBulk = !student;

  React.useEffect(() => {
    if (isOpen) {
      setSendEmail(true);
      setIsSubmitting(false);
      setErrorMessage(null);
      setSingleResult(null);
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleIssue = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = isBulk
        ? { sendEmail }
        : { studentId: student?.id, sendEmail };

      const res = await fetch("/api/admin/students/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to issue candidate credentials.");
      }

      if (!isBulk && data.result) {
        setSingleResult(data.result);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = (pwd: string) => {
    navigator.clipboard.writeText(pwd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credentials-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 id="credentials-modal-title" className="text-sm font-bold text-slate-900">
                {isBulk
                  ? "Bulk Issue Credentials & Dispatch Emails"
                  : `Issue Credentials: ${student?.full_name}`}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                {isBulk
                  ? `Targeting ${pendingCount} candidate accounts`
                  : `Roll: ${student?.roll_number} • ${student?.participant_id}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (singleResult) onSuccess();
              onClose();
            }}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Result view for single candidate */}
          {singleResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-emerald-900">
                  Credentials Generated Successfully
                </h4>
                <p className="text-xs text-emerald-700">
                  {singleResult.emailStatus === "accepted" || singleResult.emailStatus === "delivered"
                    ? `Invitation email dispatched to ${singleResult.email}`
                    : singleResult.emailStatus === "provider_not_configured"
                    ? "Resend API key unconfigured (logged to dev outbox)"
                    : "Email dispatch pending or skipped"}
                </p>
              </div>

              {/* Password Display Box */}
              <div className="p-4 bg-slate-900 text-white rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Candidate Roll Number:</span>
                  <span className="font-mono text-white font-semibold">{singleResult.roll_number}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Temporary Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400 text-base tracking-wider bg-slate-800 px-2 py-0.5 rounded">
                      {singleResult.temporaryPassword}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPassword(singleResult.temporaryPassword || "")}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      title="Copy temporary password"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Security Rule:</strong> Plaintext passwords are not stored in database tables. If the candidate forgets their credentials, use the Reissue Credentials action.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {isBulk
                  ? `This operation will generate cryptographically secure 8-character temporary passwords for all ${pendingCount} active candidates missing authentication credentials, configure their student roles, and optionally dispatch login instructions via email.`
                  : `Generate a new 8-character temporary password for ${student?.full_name} (${student?.roll_number}) and update their authentication account.`}
              </p>

              {/* Email Send Toggle */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Send Credential Email
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Dispatches login portal link, Roll Number, and temporary password.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-[11px] text-blue-800 space-y-1">
                <div className="font-semibold">Security & Formatting Safeguards:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-blue-700">
                  <li>Passwords are exactly 8 characters long with letters and digits.</li>
                  <li>Visually ambiguous characters (0, O, 1, I, l) are strictly excluded.</li>
                  <li>Plaintext passwords are never saved to PostgreSQL tables.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          {singleResult ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="text-xs font-semibold"
            >
              Done & Return to Roster
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-xs font-medium"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleIssue}
                disabled={isSubmitting}
                className="text-xs font-semibold"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                {isSubmitting ? "Generating Credentials..." : "Generate & Issue Credentials"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

