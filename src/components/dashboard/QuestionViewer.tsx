"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { cn } from "@/lib/utils";
import type { Components } from "react-markdown";

interface QuestionViewerProps {
  data: string;
  className?: string;
}

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="text-[1.35rem] font-semibold tracking-tight">{children}</h1>,
  h2: ({ children }) => <h2 className="text-[1.18rem] font-semibold tracking-tight">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold tracking-tight">{children}</h3>,
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="leading-7 text-foreground/95">{children}</p>,
  ul: ({ children }) => <ul className="list-disc space-y-2 pl-6 leading-7">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6 leading-7">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[color:var(--brand)]/35 bg-slate-50/80 px-4 py-3 italic text-foreground/85">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-sky-700 underline underline-offset-4 transition-colors hover:text-sky-800"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[24rem] border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-100/90">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-slate-200 px-3 py-2 font-semibold text-slate-700">{children}</th>
  ),
  td: ({ children }) => <td className="border border-slate-200 px-3 py-2 align-top">{children}</td>,
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-slate-100">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    if (className?.includes("language-")) {
      return <code className={className}>{children}</code>;
    }

    return (
      <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.92em] text-slate-800">
        {children}
      </code>
    );
  },
  hr: () => <hr className="border-border/80" />,
};

export default function QuestionViewer({ data, className }: QuestionViewerProps) {
  if (!data.trim()) {
    return (
      <p className={cn("text-sm leading-7 text-muted-foreground", className)}>
        No response was generated.
      </p>
    );
  }

  return (
    <div className={cn("question-viewer grid gap-3 overflow-hidden break-words", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={markdownComponents}
      >
        {data}
      </ReactMarkdown>
    </div>
  );
}
