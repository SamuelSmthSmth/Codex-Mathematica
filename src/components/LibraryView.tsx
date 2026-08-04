"use client";

/**
 * src/components/LibraryView.tsx
 *
 * The Technique Library home page.
 * Layout (per PLAN §3):
 *   1. Hero banner — "Technique of the Day" (daily deterministic pick)
 *   2. N rows of LibraryCarousel
 *
 * Clicking a card navigates to LibraryArticle (managed via internal state).
 */

import { useState, useMemo } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { TECHNIQUE_ROWS } from "@/data/techniques";
import type { Technique } from "@/data/techniques";
import LibraryCarousel from "./LibraryCarousel";
import LibraryArticle from "./LibraryArticle";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getTechniqueOfTheDay(): Technique {
  const allTechniques = TECHNIQUE_ROWS.flatMap((row) => row.techniques);
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return allTechniques[dayOfYear % allTechniques.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero Banner
// ─────────────────────────────────────────────────────────────────────────────

function HeroBanner({
  technique,
  onRead,
}: {
  technique: Technique;
  onRead: () => void;
}) {
  const { isLightMode } = useTheme();

  return (
    <section
      className="relative w-full rounded-sm overflow-hidden mb-12 px-8 py-10 flex flex-col justify-end"
      style={{
        minHeight: "200px",
        background: isLightMode
          ? "linear-gradient(135deg, #fdf7ee 0%, #f5e8d0 100%)"
          : "linear-gradient(135deg, #1f2937 0%, #111827 60%, #030712 100%)",
        border: isLightMode
          ? "1px solid #e5e7eb"
          : "1px solid #374151",
        boxShadow: isLightMode
          ? "0 4px 20px rgba(0,0,0,0.05)"
          : "0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
      aria-label="Technique of the Day"
    >
      {/* Ambient glow */}
      {!isLightMode && (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 20% 50%, color-mix(in srgb, var(--codex-accent) 12%, transparent) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles
            size={13}
            strokeWidth={1.5}
            style={{ color: "color-mix(in srgb, var(--codex-accent) 80%, transparent)" }}
          />
          <span
            className="uppercase tracking-[0.35em]"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "0.58rem",
              color: "color-mix(in srgb, var(--codex-accent) 70%, transparent)",
            }}
          >
            Technique of the Day
          </span>
        </div>

        <h2
          className="font-light mb-2"
          style={{
            fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
            fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
            letterSpacing: "0.05em",
            color: isLightMode ? "#1c1917" : "#ffffff",
          }}
        >
          {technique.name}
        </h2>

        <p
          className="italic mb-6"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.88rem",
            color: isLightMode ? "#78716c" : "#9ca3af",
          }}
        >
          {technique.tagline}
        </p>

        <button
          id="hero-read-btn"
          onClick={onRead}
          className="flex items-center gap-2 px-5 py-2.5 rounded-sm transition-all duration-200"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.78rem",
            letterSpacing: "0.12em",
            color: isLightMode ? "#9a3412" : "#9ca3af",
            background: isLightMode ? "rgba(234,88,12,0.08)" : "rgba(255,255,255,0.1)",
            border: isLightMode ? "1px solid rgba(234,88,12,0.2)" : "1px solid rgba(255,255,255,0.2)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = isLightMode ? "rgba(234,88,12,0.12)" : "rgba(255,255,255,0.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = isLightMode ? "rgba(234,88,12,0.08)" : "rgba(255,255,255,0.1)")}
        >
          <BookOpen size={14} strokeWidth={1.8} />
          Read Now
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LibraryView
// ─────────────────────────────────────────────────────────────────────────────

export default function LibraryView() {
  const { isLightMode } = useTheme();
  const [activeTechnique, setActiveTechnique] = useState<Technique | null>(null);

  const todaysTechnique = useMemo(() => getTechniqueOfTheDay(), []);

  const bg = isLightMode
    ? "#fcfaf7"
    : "radial-gradient(ellipse 100% 60% at 50% 0%, #1f2937 0%, #111827 55%, #030712 100%)";

  // ── Article view ──
  if (activeTechnique) {
    return (
      <LibraryArticle
        technique={activeTechnique}
        onBack={() => setActiveTechnique(null)}
      />
    );
  }

  // ── Library home ──
  return (
    <div
      className="min-h-screen codex-view py-16 px-4"
      style={{
        background: isLightMode ? bg : undefined,
        backgroundImage: isLightMode ? undefined : bg,
      }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Page header */}
        <header className="text-center mb-14">
          <p
            className="uppercase tracking-[0.5em] mb-3"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "0.6rem",
              color: isLightMode ? "color-mix(in srgb, var(--codex-accent) 50%, transparent)" : "#9ca3af",
            }}
          >
            The Grand Archive
          </p>
          <h1
            className="font-light"
            style={{
              fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              letterSpacing: "0.07em",
              color: isLightMode ? "#1c1917" : "#ffffff",
            }}
          >
            Technique Library
          </h1>
          <p
            className="mt-3 italic"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "0.85rem",
              color: isLightMode ? "#78716c" : "#9ca3af",
            }}
          >
            Master the tools of the mathematician's craft.
          </p>
        </header>

        {/* Hero */}
        <HeroBanner
          technique={todaysTechnique}
          onRead={() => setActiveTechnique(todaysTechnique)}
        />

        {/* Carousel rows */}
        {TECHNIQUE_ROWS.map((row) => (
          <LibraryCarousel
            key={row.id}
            title={row.title}
            techniques={row.techniques}
            onSelect={setActiveTechnique}
          />
        ))}
      </div>
    </div>
  );
}
