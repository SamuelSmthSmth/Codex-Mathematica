"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  BookOpen,
  Feather,
  Flame,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react";
import integrals from "@/data/integrals.json";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Integral {
  id: number;
  problem_latex: string;
  solution_latex: string;
  problem_raw: string;
  solution_raw: string;
  ratio: string;
  difficulty: string;
  xp: number;
}

// ─── Difficulty badge colours ───────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<string, string> = {
  Novice: "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50",
  Apprentice: "bg-amber-900/60 text-amber-300 border border-amber-700/50",
  Scholar: "bg-blue-900/60 text-blue-300 border border-blue-700/50",
  Arcanist: "bg-purple-900/60 text-purple-300 border border-purple-700/50",
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function CandleFlicker() {
  return (
    <div className="flex items-end gap-1 opacity-70">
      <div className="w-0.5 h-4 bg-gradient-to-t from-amber-600 to-amber-300 rounded-full animate-pulse" />
      <div
        className="w-0.5 h-5 bg-gradient-to-t from-amber-600 to-yellow-200 rounded-full animate-pulse"
        style={{ animationDelay: "0.3s" }}
      />
      <div
        className="w-0.5 h-3 bg-gradient-to-t from-amber-600 to-amber-300 rounded-full animate-pulse"
        style={{ animationDelay: "0.6s" }}
      />
    </div>
  );
}

function DifficultyBadge({ difficulty, xp }: { difficulty: string; xp: number }) {
  const style =
    DIFFICULTY_STYLES[difficulty] ??
    "bg-stone-800/60 text-stone-300 border border-stone-600/50";
  return (
    <div className="flex items-center gap-2">
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-widest uppercase ${style}`}>
        {difficulty}
      </span>
      <span className="flex items-center gap-1 text-xs text-amber-400/80 font-medium">
        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        {xp} XP
      </span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function FragmentViewer() {
  const fragment = integrals[0] as Integral;

  const [proof, setProof] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = useCallback(() => {
    // Naïve check: trim whitespace and compare raw strings
    const trimmed = proof.trim().replace(/\s+/g, "");
    const correct =
      trimmed === fragment.solution_raw.replace(/\s+/g, "") ||
      trimmed === fragment.solution_latex.replace(/\s+/g, "");
    setIsCorrect(correct);
    setSubmitted(true);
  }, [proof, fragment]);

  const handleReset = useCallback(() => {
    setProof("");
    setSubmitted(false);
    setIsCorrect(null);
    setActiveTab("write");
  }, []);

  return (
    // ── Outer scene: dark wood / library atmosphere ──────────────────────────
    <div
      className="
        min-h-screen w-full flex flex-col items-center justify-center
        bg-[#0e0b08] relative overflow-hidden
        py-12 px-4
      "
      style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% -10%, rgba(120, 80, 20, 0.25) 0%, transparent 70%),
          repeating-linear-gradient(
            90deg,
            rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px,
            transparent 1px, transparent 60px
          ),
          repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px,
            transparent 1px, transparent 60px
          )
        `,
      }}
    >
      {/* ── Ambient glow spots ─────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute top-[-8%] left-[20%] w-96 h-96 bg-amber-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[15%] w-80 h-80 bg-orange-950/25 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[-5%] w-64 h-64 bg-stone-800/30 rounded-full blur-[80px]" />
      </div>

      {/* ── Header bar ────────────────────────────────────────────────────── */}
      <header className="w-full max-w-2xl flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-amber-600/80" strokeWidth={1.5} />
          <span
            className="text-amber-200/60 text-sm tracking-[0.25em] uppercase font-light"
            style={{ fontFamily: "'Palatino Linotype', Palatino, serif" }}
          >
            Codex Mathematica
          </span>
        </div>
        <CandleFlicker />
      </header>

      {/* ── Parchment card ────────────────────────────────────────────────── */}
      <main
        className="
          relative w-full max-w-2xl z-10
          rounded-sm overflow-hidden
          shadow-[0_0_0_1px_rgba(180,140,80,0.25),0_8px_40px_rgba(0,0,0,0.8),0_2px_8px_rgba(0,0,0,0.6)]
        "
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 50% 0%, #f9efd2 0%, #f0d898 35%, #e8c96a 65%, #d4a843 100%)
          `,
        }}
      >
        {/* Parchment texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
          aria-hidden="true"
        />

        {/* Top vignette / age stain */}
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-32 opacity-30"
          style={{
            background:
              "linear-gradient(to bottom, rgba(120,80,20,0.4) 0%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        {/* Card content */}
        <div className="relative p-8 md:p-10">
          {/* ── Fragment header ─────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex flex-col gap-2">
              <p
                className="text-[#5c3d11]/60 text-xs tracking-[0.3em] uppercase"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Fragment #{String(fragment.id).padStart(3, "0")}
              </p>
              <DifficultyBadge
                difficulty={fragment.difficulty}
                xp={fragment.xp}
              />
            </div>
            <Feather
              className="w-5 h-5 text-[#7c5020]/40 mt-1 flex-shrink-0"
              strokeWidth={1.5}
            />
          </div>

          {/* ── Divider rule ────────────────────────────────────────────────── */}
          <div
            className="w-full h-px mb-6 opacity-50"
            style={{
              background:
                "linear-gradient(to right, transparent, #8b5c1e, #c8922a, #8b5c1e, transparent)",
            }}
          />

          {/* ── Problem statement ──────────────────────────────────────────── */}
          <section aria-label="Problem statement" className="mb-8">
            <p
              className="text-[#5c3d11]/70 text-xs tracking-[0.25em] uppercase mb-4 font-medium"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Solve the following integral
            </p>
            <div
              className="
                text-center py-5 px-4
                bg-[#c8922a]/10 rounded-[2px]
                border border-[#8b5c1e]/25
                text-[#2a1a05]
                [&_.katex]:text-2xl [&_.katex]:md:text-3xl
              "
            >
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {`$${fragment.problem_latex}$`}
              </ReactMarkdown>
            </div>
          </section>

          {/* ── Editor section ─────────────────────────────────────────────── */}
          <section aria-label="Proof editor">
            {/* Tab bar */}
            <div className="flex items-center gap-1 mb-3">
              <button
                id="tab-write"
                onClick={() => setActiveTab("write")}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs font-medium transition-all
                  ${
                    activeTab === "write"
                      ? "bg-[#2a1a05]/15 text-[#2a1a05] border border-b-0 border-[#8b5c1e]/30"
                      : "text-[#5c3d11]/60 hover:text-[#2a1a05]/80"
                  }
                `}
                style={{ fontFamily: "Georgia, serif" }}
                aria-pressed={activeTab === "write"}
              >
                <Edit3 className="w-3 h-3" />
                Write
              </button>
              <button
                id="tab-preview"
                onClick={() => setActiveTab("preview")}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs font-medium transition-all
                  ${
                    activeTab === "preview"
                      ? "bg-[#2a1a05]/15 text-[#2a1a05] border border-b-0 border-[#8b5c1e]/30"
                      : "text-[#5c3d11]/60 hover:text-[#2a1a05]/80"
                  }
                `}
                style={{ fontFamily: "Georgia, serif" }}
                aria-pressed={activeTab === "preview"}
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
            </div>

            {/* Write panel */}
            {activeTab === "write" && (
              <textarea
                id="proof-input"
                className="
                  w-full min-h-[160px] p-4
                  bg-[#fdf6e3]/80 text-[#2a1a05] placeholder-[#8b6530]/50
                  border border-[#8b5c1e]/30 rounded-[2px]
                  text-sm leading-relaxed resize-y
                  focus:outline-none focus:border-[#8b5c1e]/70 focus:bg-[#fdf6e3]
                  transition-colors
                "
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
                placeholder="Write your proof here… e.g. $e^{-x^2+x+1} + C$"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                aria-label="Proof input"
                disabled={submitted}
              />
            )}

            {/* Preview panel */}
            {activeTab === "preview" && (
              <div
                className="
                  w-full min-h-[160px] p-4
                  bg-[#fdf6e3]/80 text-[#2a1a05]
                  border border-[#8b5c1e]/30 rounded-[2px]
                  text-sm leading-relaxed
                  prose prose-sm max-w-none
                  [&_.katex]:text-base
                "
                aria-live="polite"
                aria-label="Proof preview"
              >
                {proof.trim() ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {proof}
                  </ReactMarkdown>
                ) : (
                  <span className="text-[#8b6530]/50 italic text-sm">
                    Nothing to preview yet — switch to Write and start your proof.
                  </span>
                )}
              </div>
            )}
          </section>

          {/* ── Feedback banner ────────────────────────────────────────────── */}
          {submitted && isCorrect !== null && (
            <div
              className={`
                mt-4 flex items-center gap-3 px-4 py-3 rounded-[2px] text-sm font-medium
                border transition-all
                ${
                  isCorrect
                    ? "bg-emerald-900/20 border-emerald-700/40 text-emerald-800"
                    : "bg-red-900/15 border-red-700/30 text-red-900"
                }
              `}
              role="alert"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>
                    <strong>Verified.</strong> The scroll accepts your proof. +{fragment.xp} XP awarded.
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
                  <span>
                    <strong>Incorrect.</strong> The parchment remains unconvinced. Revisit your reasoning.
                  </span>
                </>
              )}
            </div>
          )}

          {/* ── Divider ─────────────────────────────────────────────────────── */}
          <div
            className="w-full h-px mt-8 mb-6 opacity-40"
            style={{
              background:
                "linear-gradient(to right, transparent, #8b5c1e, #c8922a, #8b5c1e, transparent)",
            }}
          />

          {/* ── Action buttons ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3">
            <button
              id="btn-reset"
              onClick={handleReset}
              className="
                px-4 py-2 text-xs tracking-widest uppercase
                text-[#5c3d11]/60 border border-[#8b5c1e]/30
                rounded-[2px] hover:bg-[#8b5c1e]/10 hover:text-[#5c3d11]
                transition-all font-medium
              "
              style={{ fontFamily: "Georgia, serif" }}
            >
              Clear
            </button>

            <button
              id="btn-submit"
              onClick={handleSubmit}
              disabled={!proof.trim() || submitted}
              className="
                flex items-center gap-2
                px-6 py-2.5 text-sm tracking-widest uppercase font-semibold
                bg-[#2a1a05] text-[#f4d878]
                border border-[#5c3d11]/60
                rounded-[2px]
                hover:bg-[#3d2608] hover:border-[#c8922a]/60
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200
                shadow-[inset_0_1px_0_rgba(255,220,100,0.1)]
              "
              style={{ fontFamily: "Georgia, serif" }}
            >
              <Flame className="w-4 h-4" />
              Submit Proof
            </button>
          </div>
        </div>

        {/* Bottom age stain */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 opacity-20"
          style={{
            background:
              "linear-gradient(to top, rgba(100,60,10,0.5) 0%, transparent 100%)",
          }}
          aria-hidden="true"
        />
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mt-8 z-10 text-center">
        <p
          className="text-[#5c3d11]/30 text-xs tracking-[0.2em]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          "The integral is the soul of the function."
        </p>
      </footer>
    </div>
  );
}
