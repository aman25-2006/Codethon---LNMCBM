"use client";

import * as React from "react";
import { Code2, Copy, Check, Terminal } from "lucide-react";

export interface CodeBoxProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

/**
 * High-visibility, syntax-styled Code Box for question code snippets.
 * Displays terminal-style title bar with language tag, copy button, and line numbers.
 */
export function CodeBox({
  code,
  language = "Code",
  showLineNumbers = true,
  className = "",
}: CodeBoxProps) {
  const [copied, setCopied] = React.useState(false);

  const cleanCode = React.useMemo(() => {
    return (code || "").trim();
  }, [code]);

  const lines = React.useMemo(() => {
    return cleanCode.split("\n");
  }, [cleanCode]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!cleanCode) return null;

  return (
    <div
      className={`rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md ${className}`}
    >
      {/* Code Box Terminal Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800/80 select-none">
        <div className="flex items-center gap-2">
          {/* Mac-style Window Dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>{language}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="p-3.5 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
        {showLineNumbers && lines.length > 1 ? (
          <table className="border-collapse w-full text-left">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="pr-3.5 text-right select-none text-slate-600 font-mono text-[11px] w-6 align-top">
                    {idx + 1}
                  </td>
                  <td className="text-emerald-300 font-mono whitespace-pre font-medium pl-1">
                    {line || " "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="text-emerald-300 font-mono whitespace-pre font-medium m-0">
            {cleanCode}
          </pre>
        )}
      </div>
    </div>
  );
}

/**
 * Formats inline code wrapped in backticks `code` as dark code chips.
 */
export function formatInlineCode(text: string): React.ReactNode {
  if (!text) return text;

  // Split by markdown backticks `code`
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      const codeSnippet = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] sm:text-xs border border-slate-700 font-semibold select-all"
        >
          {codeSnippet}
        </code>
      );
    }
    return part;
  });
}

/**
 * Intelligent Question Renderer:
 * - Detects code blocks in question text or code_snippet
 * - Renders code in dedicated CodeBox instead of plain text
 * - Renders inline code tokens in styled code chips
 */
export function QuestionRenderer({
  questionText,
  codeSnippet,
  track,
}: {
  questionText: string;
  codeSnippet?: string | null;
  track?: string;
}) {
  // Determine language label
  const languageLabel = React.useMemo(() => {
    if (!track) return "Code Snippet";
    const lower = track.toLowerCase();
    if (lower.includes("py")) return "Python Code";
    if (lower.includes("java")) return "Java Code";
    if (lower.includes("c++") || lower.includes("cpp")) return "C++ Code";
    if (lower === "c") return "C Code";
    if (lower.includes("web") || lower.includes("js")) return "JavaScript / CSS";
    if (lower.includes("dsa")) return "Algorithm Code";
    return `${track} Code`;
  }, [track]);

  // Check if questionText has markdown code fence ```...```
  const parsedFences = React.useMemo(() => {
    if (!questionText.includes("```")) return null;
    const fenceRegex = /```([a-zA-Z]*)\n?([\s\S]*?)```/g;
    const parts: Array<{ type: "text" | "code"; content: string; lang?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = fenceRegex.exec(questionText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: questionText.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: "code",
        content: match[2].trim(),
        lang: match[1] || languageLabel,
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < questionText.length) {
      parts.push({
        type: "text",
        content: questionText.substring(lastIndex),
      });
    }

    return parts;
  }, [questionText, languageLabel]);

  // If questionText contains markdown code fences
  if (parsedFences && parsedFences.length > 0) {
    return (
      <div className="space-y-3.5">
        {parsedFences.map((p, idx) => {
          if (p.type === "code") {
            return (
              <CodeBox
                key={idx}
                code={p.content}
                language={p.lang || languageLabel}
              />
            );
          }
          return (
            <div
              key={idx}
              className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed whitespace-pre-line"
            >
              {formatInlineCode(p.content.trim())}
            </div>
          );
        })}

        {codeSnippet && (
          <CodeBox code={codeSnippet} language={languageLabel} />
        )}
      </div>
    );
  }

  // Standard case: clean question text + separate code snippet
  return (
    <div className="space-y-3.5">
      {/* Question Text */}
      <div className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed whitespace-pre-line">
        {formatInlineCode(questionText)}
      </div>

      {/* Code Snippet in Code Box */}
      {codeSnippet && (
        <CodeBox code={codeSnippet} language={languageLabel} />
      )}
    </div>
  );
}

/**
 * Formats option text:
 * If option is a code snippet (contains keywords, operators, brackets, or assignments),
 * styles it in an authentic monospace code badge.
 */
export function OptionTextRenderer({ text }: { text: string }) {
  const isLikelyCode = React.useMemo(() => {
    if (!text) return false;
    const t = text.trim();
    // Indicators that this option is a code expression
    return (
      t.includes(";") ||
      t.includes("()") ||
      t.includes("[]") ||
      t.includes("def ") ||
      t.includes("int ") ||
      t.includes("for ") ||
      t.includes("while ") ||
      t.includes("if ") ||
      t.includes("return ") ||
      t.includes("==") ||
      t.includes("!=") ||
      t.includes("->") ||
      t.includes("::") ||
      t.includes("print(") ||
      t.includes("printf(") ||
      t.includes("System.out") ||
      t.includes("len(") ||
      t.includes("range(") ||
      t.includes("sum(") ||
      t.includes("max(") ||
      t.includes("min(") ||
      t.includes("set(") ||
      t.includes("dict(") ||
      (t.includes(" = ") && !t.includes("is equal to")) ||
      (t.startsWith("{") && t.endsWith("}")) ||
      (t.startsWith("[") && t.endsWith("]")) ||
      (t.startsWith("`") && t.endsWith("`"))
    );
  }, [text]);

  if (isLikelyCode) {
    const clean = text.replace(/^`|`$/g, "");
    return (
      <code className="font-mono text-emerald-300 text-xs sm:text-[13px] bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800/90 inline-block font-semibold tracking-wide">
        {clean}
      </code>
    );
  }

  return <span>{formatInlineCode(text)}</span>;
}

