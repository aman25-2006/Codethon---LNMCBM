"use client";

import * as React from "react";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  X,
  RefreshCw,
  Server,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DatabasePersistenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLiveDatabase?: boolean | null;
  onRefreshStatus?: () => void;
}

export function DatabasePersistenceModal({
  isOpen,
  onClose,
  isLiveDatabase,
  onRefreshStatus,
}: DatabasePersistenceModalProps) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{
    isLiveConnected: boolean;
    mode: string;
    message: string;
    tables?: Record<string, boolean>;
    tableErrors?: Record<string, string>;
    envDiagnostics?: Record<
      string,
      {
        configured: boolean;
        preview: string;
        isPlaceholder: boolean;
        length?: number;
      }
    >;
    missingKeys?: string[];
  } | null>(null);

  const handleTestConnection = React.useCallback(async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/system/database-status");
      const data = await res.json();
      setTestResult(data);
      if (data.isLiveConnected && onRefreshStatus) {
        onRefreshStatus();
      }
    } catch {
      setTestResult({
        isLiveConnected: false,
        mode: "error",
        message: "Failed to connect to status endpoint.",
      });
    } finally {
      setTesting(false);
    }
  }, [onRefreshStatus]);

  React.useEffect(() => {
    if (isOpen) {
      handleTestConnection();
    }
  }, [isOpen, handleTestConnection]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const isConnected = testResult !== null ? testResult.isLiveConnected : Boolean(isLiveDatabase);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Permanent Database Configuration
                </h2>
                {testing ? (
                  <Badge variant="secondary" className="gap-1 text-xs animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Testing Connection...
                  </Badge>
                ) : isConnected ? (
                  <Badge variant="success" className="gap-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Supabase Connected
                  </Badge>
                ) : (
                  <Badge variant="danger" className="gap-1 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" /> In-Memory Mode
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure student records, credentials, and competition submissions are permanently retained.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Test Status Card */}
        {testResult && (
          <div
            className={`p-4 rounded-xl text-xs space-y-3 border ${
              testResult.isLiveConnected
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : "bg-amber-50 border-amber-300 text-amber-950"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-sm flex items-center gap-2">
                {testResult.isLiveConnected ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Supabase PostgreSQL Connected &amp; Persistent!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Database Status ({testResult.mode})</span>
                  </>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testing}
                className="h-7 text-xs font-semibold"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${testing ? "animate-spin" : ""}`} />
                Re-test
              </Button>
            </div>

            <p className="text-xs leading-relaxed">{testResult.message}</p>

            {/* Server Environment Variable Diagnostic Breakdown */}
            {testResult.envDiagnostics && (
              <div className="rounded-lg bg-white/90 border border-slate-200 p-3 space-y-2 mt-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-slate-500" />
                  Live Vercel Server Environment Status:
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {Object.entries(testResult.envDiagnostics).map(([key, info]) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 gap-1"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{key}</span>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                          Value: <code className="font-mono text-slate-700">{info.preview}</code>
                        </div>
                      </div>
                      <div>
                        {info.configured ? (
                          <Badge variant="success" className="text-[10px] py-0 px-2 font-semibold">
                            VALID ✓
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px] py-0 px-2 font-semibold">
                            {info.isPlaceholder ? "PLACEHOLDER ✗" : "MISSING ✗"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Table Accessibility Status */}
            {testResult.tables && (
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-bold text-slate-700">Verified Database Tables:</div>
                <div className="flex flex-wrap gap-2 font-mono text-[10px]">
                  {Object.entries(testResult.tables).map(([table, ready]) => (
                    <span
                      key={table}
                      className={`px-2 py-0.5 rounded border font-semibold ${
                        ready
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-rose-100 text-rose-800 border-rose-300"
                      }`}
                    >
                      {table}: {ready ? "READY ✓" : "MISSING ✗"}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Table Query Errors (if any) */}
            {testResult.tableErrors && Object.keys(testResult.tableErrors).length > 0 && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-1.5 mt-2">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Database Query Diagnostics:
                </div>
                {Object.entries(testResult.tableErrors).map(([table, err]) => (
                  <div key={table} className="font-mono text-[11px]">
                    <span className="font-bold">{table}:</span> {err}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Why this is needed notice */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Why Do Student Details Disappear After 1–2 Minutes?
          </div>
          <p className="leading-relaxed">
            The application is hosted on <strong>Vercel</strong>, which uses serverless cloud functions.
            When the portal has no incoming requests for ~1 minute, Vercel automatically shuts down the server container to save resources.
          </p>
          <p className="leading-relaxed">
            If your <strong>Supabase PostgreSQL database</strong> is not connected in Vercel, the portal saves students and credentials into temporary server RAM. When the container sleeps, that temporary RAM is wiped.
          </p>
          <p className="font-semibold text-amber-950">
            Once you link Supabase, your data is stored in enterprise PostgreSQL and will <u>never be deleted automatically</u>. It will stay preserved for months or years until you explicitly delete it.
          </p>
        </div>

        {/* 4 Step Setup Guide */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Steps To Permanent Persistence (Takes 3 Minutes):
          </h3>

          {/* Step 1 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                Create or Open Your Supabase Project
              </span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                Open Supabase <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-600">
              Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline">supabase.com</a>, log in or open your project named <strong>codethon---LNMCBM</strong>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                Run SQL Setup in Supabase (Creates All Permanent Tables)
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Already Completed
              </span>
            </div>
            <p className="text-xs text-slate-600">
              In your Supabase dashboard, click <strong>SQL Editor</strong> on the left, paste the content of{" "}
              <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono text-[11px]">supabase/COMPLETE_SUPABASE_DATABASE_SETUP.sql</code>, and click <strong>Run</strong>.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy("supabase/COMPLETE_SUPABASE_DATABASE_SETUP.sql", "sql_path")}
                className="h-7 text-xs"
              >
                {copiedKey === "sql_path" ? (
                  <>
                    <Check className="w-3 h-3 mr-1 text-emerald-600" />
                    Copied Path
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy SQL File Path
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
                Copy Real Keys from Supabase → Paste into Vercel
              </span>
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                Open Vercel <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-600">
              In Supabase, click <strong>Settings (⚙️ gear icon at bottom left) → API</strong>. In Vercel, go to <strong>Project Settings → Environment Variables</strong>:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">NEXT_PUBLIC_SUPABASE_URL</span>
                  <span className="block text-[11px] text-slate-400 font-sans">
                    Project URL from Supabase Settings → API (e.g. https://[your-ref].supabase.co)
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy("NEXT_PUBLIC_SUPABASE_URL", "url_key")}
                  className="h-7 text-xs"
                >
                  {copiedKey === "url_key" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  <span className="block text-[11px] text-slate-400 font-sans">
                    Client anon public key from Supabase Settings → API (starts with eyJhbGciOi...)
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon_key")}
                  className="h-7 text-xs"
                >
                  {copiedKey === "anon_key" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">SUPABASE_SERVICE_ROLE_KEY</span>
                  <span className="block text-[11px] text-slate-400 font-sans">
                    Private service_role secret key from Supabase Settings → API (starts with eyJhbGciOi...)
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy("SUPABASE_SERVICE_ROLE_KEY", "service_key")}
                  className="h-7 text-xs"
                >
                  {copiedKey === "service_key" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[11px] font-bold">4</span>
                Trigger a Clean Redeployment on Vercel
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                Required Step
              </span>
            </div>
            <p className="text-xs text-blue-950 leading-relaxed">
              <strong>Why this is essential:</strong> Vercel serverless cloud functions <u>do not</u> update automatically when you edit environment variables.
              They continue running the previous container until a new deployment is triggered.
            </p>
            <ol className="text-xs text-blue-900 list-decimal list-inside space-y-1 pl-1">
              <li>In Vercel, open your project and click the <strong>Deployments</strong> tab.</li>
              <li>On the latest deployment (top row), click the <strong>three dots (...)</strong> on the far right.</li>
              <li>Click <strong>Redeploy</strong>.</li>
              <li>Uncheck <em>&quot;Use existing Build Cache&quot;</em> and click <strong>Redeploy</strong>.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
