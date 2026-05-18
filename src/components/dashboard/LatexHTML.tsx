"use client";

import { cn } from "@/lib/utils";
import QuestionViewer from "./QuestionViewer";

interface LatexHtmlProps {
  data: string;
  className?: string;
}

export default function LatexHtml({ data, className }: LatexHtmlProps) {
  return <QuestionViewer data={data} className={cn(className)} />;
}
