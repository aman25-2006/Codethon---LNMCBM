"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import Monaco Editor with SSR disabled
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-400">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <span>Loading Monaco Code Editor...</span>
      </div>
    </div>
  ),
});

interface MonacoCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string;
}

export function MonacoCodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = "100%",
}: MonacoCodeEditorProps) {
  // Normalize language for Monaco Editor
  const monacoLanguage = React.useMemo(() => {
    const norm = (language || "").trim().toLowerCase();
    switch (norm) {
      case "c":
        return "c";
      case "c++":
      case "cpp":
        return "cpp";
      case "java":
        return "java";
      case "python":
      case "python 3":
        return "python";
      case "javascript":
      case "web development":
        return "javascript";
      default:
        return "plaintext";
    }
  }, [language]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <Editor
        height={height}
        language={monacoLanguage}
        value={value}
        onChange={(val) => onChange(val || "")}
        theme="vs-dark"
        options={{
          readOnly,
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: monacoLanguage === "javascript" ? 2 : 4,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
          renderLineHighlight: "all",
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}

