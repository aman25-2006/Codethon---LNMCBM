"use client";

import * as React from "react";
import { X, Eye, ShieldCheck, BookOpen, Code2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MCQQuestionRecord } from "@/lib/services/questions-service";

interface QuestionPreviewModalProps {
  isOpen: boolean;
  question: MCQQuestionRecord | null;
  onClose: () => void;
}

export function QuestionPreviewModal({
  isOpen,
  question,
  onClose,
}: QuestionPreviewModalProps) {
  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Question Preview</h3>
              <p className="text-[11px] text-slate-500">
                Candidate examination preview and authoritative server answer key.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-semibold text-slate-700 bg-slate-50">
              {question.category}
            </Badge>
            <Badge variant="secondary" className="font-semibold">
              {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
            </Badge>
            <Badge variant={question.is_active ? "success" : "warning"}>
              {question.is_active ? "Active" : "Disabled"}
            </Badge>
          </div>

          {/* Student Screen Emulation Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/30 p-5 space-y-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Candidate Screen Presentation</span>
            </div>

            {/* Case Study Passage */}
            {question.case_study_passage && (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-lg space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  Background Case Study Passage
                </div>
                <p className="text-xs text-amber-900 whitespace-pre-line leading-relaxed">
                  {question.case_study_passage}
                </p>
              </div>
            )}

            {/* Question Text */}
            <div className="text-sm font-semibold text-slate-900 leading-snug">
              {question.question_text}
            </div>

            {/* Code Snippet */}
            {question.code_snippet && (
              <div className="rounded-lg bg-slate-900 p-3.5 border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mb-2">
                  <Code2 className="w-3.5 h-3.5" /> Code Reference
                </div>
                <pre className="font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                  {question.code_snippet}
                </pre>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-2 pt-2">
              {question.options.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    {opt.option_key}
                  </div>
                  <div className="text-xs text-slate-800 font-medium">{opt.option_text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Authoritative Answer Key Section */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Authoritative Server Answer Key (Admin Access Only)
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Correct Option:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-xs shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Option {question.correct_option_key}
              </span>
              <span className="text-xs font-medium text-emerald-950">
                — {question.options.find((o) => o.option_key === question.correct_option_key)?.option_text}
              </span>
            </div>

            {question.explanation && (
              <div className="pt-2 border-t border-emerald-200/60">
                <span className="text-[11px] font-bold text-emerald-900 block mb-0.5">
                  Explanation / Scoring Justification:
                </span>
                <p className="text-xs text-emerald-800 leading-relaxed">{question.explanation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}

