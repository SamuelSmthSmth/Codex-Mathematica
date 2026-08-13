"use client";

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface MathRendererProps {
  value: string;
  className?: string;
  display?: boolean;
}

function withDelimiters(value: string, display: boolean) {
  const trimmed = value.trim();
  if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) return value;
  if (trimmed.startsWith("$") && trimmed.endsWith("$")) return value;
  return display ? `$$${value}$$` : `$${value}$`;
}

/** Render a trusted LaTeX string through the app's existing KaTeX pipeline. */
export default function MathRenderer({ value, className, display = true }: MathRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {withDelimiters(value, display)}
      </ReactMarkdown>
    </div>
  );
}

/** Render Markdown that may contain inline or display math. */
export function MarkdownMath({ value, className }: Omit<MathRendererProps, "display">) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>
        {value}
      </ReactMarkdown>
    </div>
  );
}
