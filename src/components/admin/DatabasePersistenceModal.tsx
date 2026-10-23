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
    envStatus?: Record<string, boolean>;
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
            className={`p-4 rounded-xl text-xs space-y-2 border ${
              testResult.isLiveConnected
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : "bg-amber-50 border-amber-300 text-amber-950"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-sm flex items-center gap-2">
                {testResult.isLiveConnected ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Supabase PostgreSQL Connected &amp; Persistent!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
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
            {testResult.tables && (
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
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

        {/* 3 Step Setup Guide */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            3 Steps To Permanent Persistence (Takes 3 Minutes):
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
              Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline">supabase.com</a>, log in or create a free project named <strong>LNMCBM-Codethon</strong>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
                Run SQL Setup in Supabase (Creates All Permanent Tables)
              </span>
            </div>
            <p className="text-xs text-slate-600">
              In your Supabase dashboard, click <strong>SQL Editor</strong> on the left, click <strong>New Query</strong>, paste the content of <code className="px-1 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[11px]">supabase/COMPLETE_SUPABASE_DATABASE_SETUP.sql</code>, and click <strong>Run</strong>.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  handleCopy("supabase/COMPLETE_SUPABASE_DATABASE_SETUP.sql", "sql_path");
                }}
                className="text-xs font-semibold"
              >
                {copiedKey === "sql_path" ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    Copied Path!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
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
                Add These 3 Keys in Vercel Environment Variables
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
              In Vercel, go to <strong>Project Settings → Environment Variables</strong> and add these 3 variables (found in Supabase under <strong>Project Settings → API</strong>):
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800">NEXT_PUBLIC_SUPABASE_URL</span>
                  <span className="block text-[11px] text-slate-400 font-sans">Your Supabase Project URL (e.g. https://xyz.supabase.co)</span>
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
                  <span className="block text-[11px] text-slate-400 font-sans">Client anon public key (starts with eyJhbGciOi...)</span>
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
                  <span className="block text-[11px] text-slate-400 font-sans">Private service_role secret key (never expose to public)</span>
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
        </div>

        {/* Live Test Connection Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Check Live Database Connection
              </h4>
              <p className="text-xs text-slate-500">
                Verify if your deployed app can reach Supabase and query required tables.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing}
              className="text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${testing ? "animate-spin" : ""}`} />
              Test Connection
            </Button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs space-y-1.5 border ${
                testResult.isLiveConnected
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {testResult.isLiveConnected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Supabase PostgreSQL Connected &amp; Persistent!
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Database Not Fully Ready ({testResult.mode})
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">{testResult.message}</p>
              {testResult.tables && (
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                  {Object.entries(testResult.tables).map(([table, ready]) => (
                    <span
                      key={table}
                      className={`px-1.5 py-0.5 rounded border ${
                        ready
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-rose-100 text-rose-800 border-rose-300"
                      }`}
                    >
                      {table}: {ready ? "READY" : "MISSING"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
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

