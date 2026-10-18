"use client";

import * as React from "react";
import {
  HelpCircle,
  Plus,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  Search,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  Loader2,
  Code2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MCQQuestionRecord,
  QuestionBankMetrics,
  MCQCategory,
} from "@/lib/services/questions-service";
import { AddQuestionModal } from "@/components/admin/questions/AddQuestionModal";
import { EditQuestionModal } from "@/components/admin/questions/EditQuestionModal";
import { QuestionPreviewModal } from "@/components/admin/questions/QuestionPreviewModal";
import { ImportQuestionsModal } from "@/components/admin/questions/ImportQuestionsModal";
import { ConfirmDialog } from "@/components/admin/students/ConfirmDialog";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = React.useState<MCQQuestionRecord[]>([]);
  const [metrics, setMetrics] = React.useState<QuestionBankMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [seeding, setSeeding] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  // Filters
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Modals state
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<MCQQuestionRecord | null>(null);
  const [previewingQuestion, setPreviewingQuestion] = React.useState<MCQQuestionRecord | null>(null);
  const [deletingQuestion, setDeletingQuestion] = React.useState<MCQQuestionRecord | null>(null);
  const [deletingLoading, setDeletingLoading] = React.useState(false);

  const fetchQuestions = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load questions");
      const data = await res.json();
      setQuestions(data.questions || []);
      setMetrics(data.metrics || null);
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  React.useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // One-click preload official curriculum
  const handleSeedCurriculum = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/admin/questions/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seed curriculum.");
      await fetchQuestions();
    } catch (err) {
      console.error("Error seeding questions:", err);
      alert(err instanceof Error ? err.message : "Error seeding questions");
    } finally {
      setSeeding(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = async (question: MCQQuestionRecord) => {
    try {
      setTogglingId(question.id);
      const res = await fetch(`/api/admin/questions/${question.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !question.is_active }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchQuestions();
    } catch (err) {
      console.error("Error toggling question status:", err);
    } finally {
      setTogglingId(null);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deletingQuestion) return;
    try {
      setDeletingLoading(true);
      const res = await fetch(`/api/admin/questions/${deletingQuestion.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete question");
      setDeletingQuestion(null);
      await fetchQuestions();
    } catch (err) {
      console.error("Error deleting question:", err);
      alert(err instanceof Error ? err.message : "Error deleting question");
    } finally {
      setDeletingLoading(false);
    }
  };

  // Categories list for target cards
  const categoriesList: Array<{
    name: MCQCategory;
    count: number;
    required: number;
    marksEach: number;
    currentMarks: number;
    totalMarks: number;
    isSatisfied: boolean;
  }> = [
    {
      name: "Fundamentals",
      count: metrics?.categories?.["Fundamentals"]?.count ?? 0,
      required: 10,
      marksEach: 1,
      currentMarks: metrics?.categories?.["Fundamentals"]?.totalMarks ?? 0,
      totalMarks: 10,
      isSatisfied: metrics?.categories?.["Fundamentals"]?.isSatisfied ?? false,
    },
    {
      name: "Technical Understanding",
      count: metrics?.categories?.["Technical Understanding"]?.count ?? 0,
      required: 10,
      marksEach: 2,
      currentMarks: metrics?.categories?.["Technical Understanding"]?.totalMarks ?? 0,
      totalMarks: 20,
      isSatisfied: metrics?.categories?.["Technical Understanding"]?.isSatisfied ?? false,
    },
    {
      name: "Logic and Debugging",
      count: metrics?.categories?.["Logic and Debugging"]?.count ?? 0,
      required: 10,
      marksEach: 3,
      currentMarks: metrics?.categories?.["Logic and Debugging"]?.totalMarks ?? 0,
      totalMarks: 30,
      isSatisfied: metrics?.categories?.["Logic and Debugging"]?.isSatisfied ?? false,
    },
    {
      name: "Case Study",
      count: metrics?.categories?.["Case Study"]?.count ?? 0,
      required: 10,
      marksEach: 2,
      currentMarks: metrics?.categories?.["Case Study"]?.totalMarks ?? 0,
      totalMarks: 20,
      isSatisfied: metrics?.categories?.["Case Study"]?.isSatisfied ?? false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Phase 1: MCQ Question Bank
            </h1>
            {metrics?.isValidExamSet && (
              <Badge variant="success" className="gap-1 py-1 px-2.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Exam Ready (40 Qs / 80 Marks)
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Exactly 40 Questions carrying 80 marks required across 4 categories. Questions and options are deterministically randomized per attempt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a href="/api/admin/questions/template" download="LNMCBM_MCQ_Question_Bank_Template.csv">
            <Button size="sm" variant="outline" className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Template
            </Button>
          </a>

          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 border-purple-200"
            onClick={handleSeedCurriculum}
            disabled={seeding}
          >
            {seeding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                Preload 40Q Curriculum
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => setIsImportOpen(true)}
          >
            <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
            Upload MCQ CSV
          </Button>

          <Button
            size="sm"
            variant="primary"
            className="text-xs"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Question
          </Button>
        </div>
      </div>

      {/* Target Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoriesList.map((cat) => {
          const percent = Math.min(100, Math.round((cat.count / cat.required) * 100));
          return (
            <Card key={cat.name} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xs font-bold text-slate-700 leading-snug">
                    {cat.name}
                  </CardTitle>
                  <Badge variant={cat.isSatisfied ? "success" : cat.count > cat.required ? "warning" : "default"}>
                    {cat.count}/{cat.required}
                  </Badge>
                </div>
                <CardDescription className="text-[11px] text-slate-500">
                  {cat.marksEach} Mark(s) each • Target: {cat.totalMarks} Marks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-900">
                  {cat.currentMarks} / {cat.totalMarks} Marks
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      cat.isSatisfied
                        ? "bg-emerald-600"
                        : cat.count > cat.required
                        ? "bg-amber-500"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5">
                  <span>{percent}% completed</span>
                  {cat.isSatisfied ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Met
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">
                      {cat.count < cat.required ? `Need ${cat.required - cat.count} more` : `Excess: ${cat.count - cat.required}`}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Readiness Assessment Banner */}
      {metrics && (
        <div>
          {metrics.isValidExamSet ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-emerald-950 text-sm">
                  Competition Question Bank Ready for Phase 1
                </div>
                <p className="text-emerald-800 text-xs mt-0.5">
                  Exactly 40 questions carrying 80 marks are active across all 4 categories (Fundamentals: 10, Technical: 10, Logic: 10, Case Study: 10).
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-amber-950 text-sm">
                  Question Bank Pending Full Alignment ({metrics.enabled}/40 Active Qs, {metrics.totalMarks}/80 Marks)
                </div>
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-amber-800 text-xs">
                  {metrics.validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 bg-white border-amber-300 text-amber-900 text-xs hover:bg-amber-100"
                onClick={handleSeedCurriculum}
                disabled={seeding}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Auto-Align Curriculum
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                All Question Bank Entries
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Total questions: {metrics?.total ?? questions.length} (Active: {metrics?.enabled ?? 0}, Disabled: {metrics?.disabled ?? 0})
              </CardDescription>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={fetchQuestions}
              disabled={loading}
              className="text-xs self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-slate-100 mt-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search questions, snippets, or options..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Categories</option>
                <option value="Fundamentals">Fundamentals</option>
                <option value="Technical Understanding">Technical Understanding</option>
                <option value="Logic and Debugging">Logic and Debugging</option>
                <option value="Case Study">Case Study</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Disabled Only</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading question bank...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-blue-600">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No questions found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No questions match your current search or filters. You can add a new question, upload via CSV, or preload the official curriculum.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <Button size="sm" variant="primary" onClick={handleSeedCurriculum} disabled={seeding}>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Preload Official 40 Questions
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsAddOpen(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Question
                </Button>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3 w-32">Category</th>
                    <th className="py-3 px-3">Question Stem & Elements</th>
                    <th className="py-3 px-3 w-28 text-center">Correct Key</th>
                    <th className="py-3 px-3 w-16 text-center">Marks</th>
                    <th className="py-3 px-3 w-24 text-center">Status</th>
                    <th className="py-3 px-3 w-28 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {questions.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-[10px] whitespace-nowrap font-medium">
                          {q.category}
                        </Badge>
                      </td>

                      <td className="py-3 px-3 max-w-md">
                        <div className="font-medium text-slate-900 leading-snug line-clamp-2">
                          {q.question_text}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {q.code_snippet && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded">
                              <Code2 className="w-3 h-3" /> Code Snippet
                            </span>
                          )}
                          {q.case_study_passage && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-sans bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                              <BookOpen className="w-3 h-3 text-amber-600" /> Case Study
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded font-bold text-xs bg-emerald-100 text-emerald-800">
                          {q.correct_option_key || "—"}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {q.marks}M
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(q)}
                          disabled={togglingId === q.id}
                          className="cursor-pointer"
                          title="Click to toggle active status"
                        >
                          {togglingId === q.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400 mx-auto" />
                          ) : (
                            <Badge
                              variant={q.is_active ? "success" : "warning"}
                              className="text-[10px] cursor-pointer hover:opacity-80"
                            >
                              {q.is_active ? "Active" : "Disabled"}
                            </Badge>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => setPreviewingQuestion(q)}
                            title="Preview Question"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            onClick={() => setEditingQuestion(q)}
                            title="Edit Question"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeletingQuestion(q)}
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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

      {/* Modals */}
      <AddQuestionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchQuestions}
      />

      <EditQuestionModal
        isOpen={Boolean(editingQuestion)}
        question={editingQuestion}
        onClose={() => setEditingQuestion(null)}
        onSuccess={fetchQuestions}
      />

      <QuestionPreviewModal
        isOpen={Boolean(previewingQuestion)}
        question={previewingQuestion}
        onClose={() => setPreviewingQuestion(null)}
      />

      <ImportQuestionsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={fetchQuestions}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingQuestion)}
        title="Delete Question"
        description={`Are you sure you want to delete this question? "${deletingQuestion?.question_text.substring(0, 80)}..." This action cannot be undone.`}
        confirmLabel="Delete Question"
        variant="danger"
        isLoading={deletingLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingQuestion(null)}
      />
    </div>
  );
}
