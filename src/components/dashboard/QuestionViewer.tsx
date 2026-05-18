"use client";

import { cn } from "@/lib/utils";

interface QuestionViewerProps {
  data: string;
  className?: string;
}

export const QuestionViewer: React.FC<QuestionViewerProps> = ({ data, className }) => {
  const htmlString = data ? data.replace(/\n/g, "<br>") : "";

  return (
    <div
      className={cn(
        "prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none leading-relaxed ",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: htmlString }}
    />
  );
};
