"use client";

/**
 * src/components/LibraryArticle.tsx
 *
 * Full-screen article view for a single Technique.
 * Shows: title, category badge, body markdown with KaTeX math,
 * and an embedded micro-problem with a click-to-reveal answer.
 *
 * Phase 2 will add theme-specific reveal animations.
 */

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { Technique } from "@/data/techniques";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function MathRenderer({ children, className }: { children: string; className?: string }) {
  const processed = children.replace(/\$\$([\s\S]*?)\$\$/g, (_m, inner: string) =>
    `\n$$\n${inner.trim()}\n$$\n`
  );
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>
        {processed}
      </ReactMarkdown>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LibraryArticle
// ─────────────────────────────────────────────────────────────────────────────

interface LibraryArticleProps {
  technique: Technique;
  onBack: () => void;
}

export default function LibraryArticle({ technique, onBack }: LibraryArticleProps) {
  const { isLightMode } = useTheme();
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const bg = isLightMode ? "#fcfaf7" : "#0a0a0a";
  const textMuted = isLightMode ? "#78716c" : "#9ca3af";
  const border = isLightMode ? "#e5e7eb" : "rgba(255,255,255,0.1)";
  const accentColor = isLightMode ? "rgba(200,146,42,0.9)" : "#ffffff";

  return (
    <div
      className="min-h-screen codex-view px-4 pt-16 pb-20"
      style={{ background: bg }}
    >
      <div className="max-w-2xl mx-auto">

        {/* Back button */}
        <nav className="mb-10">
          <button
            id="library-article-back"
            onClick={onBack}
            className="group flex items-center gap-2 transition-colors duration-200"
            style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", letterSpacing: "0.12em", color: textMuted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = isLightMode ? "#292524" : "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={1.8} />
            Back to Library
          </button>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <span
            className="inline-block px-2 py-0.5 mb-4 rounded-sm uppercase tracking-widest"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "0.58rem",
              color: isLightMode ? accentColor : "#9ca3af",
              background: isLightMode ? "rgba(200,146,42,0.08)" : "rgba(255,255,255,0.1)",
              border: isLightMode ? `1px solid rgba(200,146,42,0.2)` : `1px solid rgba(255,255,255,0.2)`,
            }}
          >
            {technique.category}
          </span>

          <h1
            className="font-light mb-3"
            style={{
              fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              letterSpacing: "0.04em",
              color: isLightMode ? "#1c1917" : "#ffffff",
            }}
          >
            {technique.name}
          </h1>

          <p
            className="italic"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "0.95rem",
              color: textMuted,
            }}
          >
            {technique.tagline}
          </p>

          <div
            className="mt-6"
            style={{ height: "1px", background: `linear-gradient(to right, ${accentColor}40, transparent)` }}
          />
        </header>

        {/* Body */}
        <main>
          <MathRenderer
            className={`article-prose ${isLightMode ? "article-prose-light" : "article-prose-dark"}`}
          >
            {technique.body_md}
          </MathRenderer>
        </main>

        {/* Micro-problem */}
        {technique.micro_problem && (
          <section
            className="mt-14 p-6 rounded-sm"
            style={{
              background: isLightMode ? "rgba(200,146,42,0.04)" : "rgba(200,146,42,0.05)",
              border: `1px solid ${border}`,
            }}
          >
            <p
              className="uppercase tracking-widest mb-5"
              style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: accentColor }}
            >
              Sanity Check
            </p>

            <MathRenderer
              className={`article-prose ${isLightMode ? "article-prose-light" : "article-prose-dark"} mb-6`}
            >
              {technique.micro_problem.question_latex}
            </MathRenderer>

            {/* Reveal button */}
            {!answerRevealed ? (
              <button
                id={`micro-reveal-${technique.id}`}
                onClick={() => setAnswerRevealed(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-sm transition-all duration-200"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.1em",
                  color: accentColor,
                  background: "transparent",
                  border: `1px solid rgba(200,146,42,0.3)`,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,146,42,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Eye size={14} strokeWidth={1.6} />
                Reveal Answer
              </button>
            ) : (
              <div className="space-y-3">
                <div
                  className="p-4 rounded-sm"
                  style={{
                    background: isLightMode ? "#f9f5ee" : "#0d0a07",
                    border: `1px solid rgba(200,146,42,0.2)`,
                  }}
                >
                  <MathRenderer
                    className={`article-prose ${isLightMode ? "article-prose-light" : "article-prose-dark"}`}
                  >
                    {`$${technique.micro_problem.answer_latex}$`}
                  </MathRenderer>
                </div>

                <button
                  id={`micro-hide-${technique.id}`}
                  onClick={() => setAnswerRevealed(false)}
                  className="flex items-center gap-2 text-xs transition-colors duration-200"
                  style={{ fontFamily: "Georgia, serif", color: textMuted }}
                >
                  <EyeOff size={12} strokeWidth={1.6} />
                  Hide
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Article prose styles */}
      <style>{`
        .article-prose h2 {
          font-family: var(--font-playfair), 'Palatino Linotype', Palatino, serif;
          font-size: 1.35rem;
          font-weight: 400;
          margin-top: 2em;
          margin-bottom: 0.6em;
          letter-spacing: 0.03em;
        }
        .article-prose h3 {
          font-family: var(--font-playfair), 'Palatino Linotype', Palatino, serif;
          font-size: 1.1rem;
          font-weight: 400;
          margin-top: 1.6em;
          margin-bottom: 0.5em;
        }
        .article-prose p {
          font-family: Georgia, serif;
          font-size: 0.97rem;
          line-height: 1.85;
          margin-bottom: 1em;
        }
        .article-prose strong { font-weight: 600; }
        .article-prose .katex { font-size: 1.05em; }
        .article-prose .katex-display { margin: 1.2em 0; }
        .article-prose ul, .article-prose ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .article-prose li {
          font-family: Georgia, serif;
          font-size: 0.95rem;
          line-height: 1.8;
          margin-bottom: 0.3em;
        }
        .article-prose-dark h2, .article-prose-dark h3 { color: rgba(235,225,195,0.88); }
        .article-prose-dark p, .article-prose-dark li { color: rgba(200,185,160,0.8); }
        .article-prose-dark strong { color: rgba(240,230,205,0.95); }
        .article-prose-light h2, .article-prose-light h3 { color: #1c1917; }
        .article-prose-light p, .article-prose-light li { color: #44403c; }
      `}</style>
    </div>
  );
}
