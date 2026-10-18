"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, XCircle, ArrowLeft, RefreshCw, Award, Calendar } from "lucide-react";
import { VerificationResultDTO } from "@/types";
import { Button } from "@/components/ui/button";

export default function VerificationPage({ params }: { params: { verificationId: string } }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerificationResultDTO | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/verify/${encodeURIComponent(params.verificationId)}`);
        const result = await res.json();
        if (res.ok && result.is_valid) {
          setData(result);
        } else {
          setData(null);
          setErrorMsg(result.message || "Invalid or unpublished verification identifier.");
        }
      } catch (err: unknown) {
        setData(null);
        setErrorMsg("Failed to communicate with verification registry.");
      } finally {
        setLoading(false);
      }
    }

    if (params.verificationId) {
      verify();
    }
  }, [params.verificationId]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto relative">
            <Image
              src="/images/college-logo.png"
              alt="LNMCBM Logo"
              width={64}
              height={64}
              priority
              className="object-contain mx-auto"
            />
          </div>
          <h1 className="text-sm font-extrabold uppercase tracking-tight text-slate-900">
            Lalit Narayan Mishra College of Business Management
          </h1>
          <p className="text-xs text-slate-500">
            Official Examination & Credential Verification Registry
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">Verifying Credential</h3>
              <p className="text-xs text-slate-500">Validating signature in the LNMCBM examination ledger...</p>
            </div>
          ) : data && data.is_valid ? (
            <div>
              {/* Green Verified Header */}
              <div className="p-5 bg-emerald-600 text-white text-center space-y-1">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 mb-1">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-base font-extrabold tracking-wide uppercase">
                  Certified Authentic Scorecard
                </h2>
                <p className="text-xs text-emerald-100 font-mono">
                  Verification Code: {data.verification_id}
                </p>
              </div>

              {/* Verified Details */}
              <div className="p-6 space-y-4 text-xs">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Candidate (Masked)</span>
                    <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                      {data.student_name_masked}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Roll Number</span>
                    <strong className="text-slate-900 font-mono font-bold text-sm block mt-0.5">
                      {data.roll_number_masked}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Participant ID</span>
                    <strong className="text-blue-700 font-mono font-bold text-xs block mt-0.5">
                      {data.participant_id}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Course</span>
                    <strong className="text-slate-900 font-bold text-xs block mt-0.5">
                      {data.course}
                    </strong>
                  </div>
                </div>

                {/* Score Verification Box */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-blue-700 uppercase font-bold tracking-wider block">
                      Certified Final Score
                    </span>
                    <span className="text-lg font-black font-mono text-blue-900">
                      {data.total_score} <span className="text-xs text-blue-700 font-normal">/ {data.max_score || 100} Marks</span>
                    </span>
                  </div>
                  {data.rank && (
                    <div className="text-right">
                      <span className="text-[10px] text-blue-700 uppercase font-bold tracking-wider block">
                        State Merit Rank
                      </span>
                      <span className="text-sm font-extrabold text-blue-900 flex items-center gap-1 justify-end">
                        <Award className="w-4 h-4 text-amber-600" /> #{data.rank}
                      </span>
                    </div>
                  )}
                </div>

                {/* Timestamp & Issuer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {data.finalized_at
                        ? new Date(data.finalized_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Verified Record"}
                    </span>
                  </div>
                  <span className="text-slate-600 font-medium">LNMCBM Examination Cell</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-[10px] text-slate-500 leading-relaxed">
                  <strong>Privacy Notice:</strong> For student data protection, personal identifiers are partially masked in the public verification ledger.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Verification Failed</h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {errorMsg || "No certified published scorecard exists matching this verification code."}
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 text-left">
                <strong>Possible reasons:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 text-amber-700">
                  <li>The code was mistyped or truncated.</li>
                  <li>The examination results have not yet been published by the college administration.</li>
                  <li>The certificate was issued by an unauthorized party.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Return to Portal Home
          </Link>
        </div>
      </div>
    </div>
  );
}

