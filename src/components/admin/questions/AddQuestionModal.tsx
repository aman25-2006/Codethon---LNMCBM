"use client";

import * as React from "react";
import { X, Plus, AlertCircle, Loader2, Code2, BookOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MCQCategory, CATEGORY_SPECS } from "@/lib/services/questions-service";

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultCategory?: MCQCategory;
}

export function AddQuestionModal({
  isOpen,
  onClose,
  onSuccess,
  defaultCategory = "Fundamentals",
}: AddQuestionModalProps) {
  const [category, setCategory] = React.useState<MCQCategory>(defaultCategory);
  const [questionText, setQuestionText] = React.useState("");
  const [codeSnippet, setCodeSnippet] = React.useState("");
  const [caseStudyPassage, setCaseStudyPassage] = React.useState("");
  const [marks, setMarks] = React.useState(CATEGORY_SPECS[defaultCategory].marksEach);
  const [optionA, setOptionA] = React.useState("");
  const [optionB, setOptionB] = React.useState("");
  const [optionC, setOptionC] = React.useState("");
  const [optionD, setOptionD] = React.useState("");
  const [correctOption, setCorrectOption] = React.useState<"A" | "B" | "C" | "D">("A");
  const [explanation, setExplanation] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Update default marks when category changes
  React.useEffect(() => {
    if (CATEGORY_SPECS[category]) {
      setMarks(CATEGORY_SPECS[category].marksEach);
    }
  }, [category]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!questionText.trim()) {
      setError("Please provide question text.");
      return;
    }
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError("All 4 options (A, B, C, and D) must have text.");
      return;
    }
    if (category === "Case Study" && !caseStudyPassage.trim()) {
      setError("Case Study questions require an associated background passage.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          question_text: questionText.trim(),
          code_snippet: codeSnippet.trim() || null,
          case_study_passage: caseStudyPassage.trim() || null,
          marks: Number(marks),
          is_active: isActive,
          options: {
            A: optionA.trim(),
            B: optionB.trim(),
            C: optionC.trim(),
            D: optionD.trim(),
          },
          correct_option: correctOption,
          explanation: explanation.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create question.");
      }

      // Reset and close
      setQuestionText("");
      setCodeSnippet("");
      setCaseStudyPassage("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setExplanation("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add Question to Bank</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify options, correct answer key, and marks allocation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category & Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MCQCategory)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Fundamentals">Fundamentals (1 Mark each, 10Q = 10M)</option>
                <option value="Technical Understanding">Technical Understanding (2 Marks each, 10Q = 20M)</option>
                <option value="Logic and Debugging">Logic and Debugging (3 Marks each, 10Q = 30M)</option>
                <option value="Case Study">Case Study (2 Marks each, 10Q = 20M)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Marks *</label>
              <input
                type="number"
                min={1}
                max={10}
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Case Study Passage (Conditional) */}
          {category === "Case Study" && (
            <div className="space-y-1.5 p-3.5 bg-amber-50/60 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                Case Study Passage *
              </div>
              <p className="text-[11px] text-amber-700">
                This comprehensive background passage will be presented to candidates alongside this question.
              </p>
              <textarea
                rows={4}
                value={caseStudyPassage}
                onChange={(e) => setCaseStudyPassage(e.target.value)}
                placeholder="Paste the case study architecture or narrative scenario..."
                className="w-full p-2.5 rounded-md border border-amber-300 bg-white text-xs font-sans focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          )}

          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Question Text *</label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. What is the time complexity of searching an element in a balanced binary search tree?"
              className="w-full p-3 rounded-lg border border-slate-300 text-xs font-sans focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Code Snippet (Optional / Recommended for Logic & Debugging) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-slate-500" />
                Code Snippet <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              {category === "Logic and Debugging" && (
                <span className="text-[10px] text-blue-600 font-medium">Recommended for Logic/Debugging</span>
              )}
            </div>
            <textarea
              rows={3}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="int main() { ... }"
              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs bg-slate-900 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Four Options */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 block">
              Options & Designate Correct Answer *
            </label>

            {(["A", "B", "C", "D"] as const).map((key) => {
              const val = key === "A" ? optionA : key === "B" ? optionB : key === "C" ? optionC : optionD;
              const setVal = key === "A" ? setOptionA : key === "B" ? setOptionB : key === "C" ? setOptionC : setOptionD;
              const isCorrect = correctOption === key;

              return (
                <div
                  key={key}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-50/40"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setCorrectOption(key)}
                    className={`mt-1 flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold transition-all shrink-0 ${
                      isCorrect
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                        : "border-slate-300 text-slate-600 hover:border-slate-400"
                    }`}
                    title={`Click to mark Option ${key} as correct answer`}
                  >
                    {isCorrect ? <Check className="w-3.5 h-3.5" /> : key}
                  </button>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                      placeholder={`Option ${key} text...`}
                      className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {isCorrect && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded shrink-0">
                      Correct Key
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Explanation / Rationale <span className="text-slate-400 font-normal">(Server-only, hidden from candidates)</span>
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Why this answer is correct (stored safely server-side for admin audit & post-exam scoring)..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-sans focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Active status */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-slate-700 cursor-pointer">
              Enable this question for competition examination
            </label>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Create Question
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

