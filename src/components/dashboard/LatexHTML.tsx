"use client";

import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

interface LatexHtmlProps {
  data: string;
  className?: string;
}

const LatexHtml: React.FC<LatexHtmlProps> = ({ data, className }) => {
  const content = data.replace(/\\n/g, "\n");

  return (
    <div
      className={cn(
        "prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none leading-relaxed",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default LatexHtml;
