"use client";

/**
 * src/components/LibraryCarousel.tsx
 *
 * A single Netflix-style horizontally-scrolling row of technique cards.
 * Props:
 *   title      → Row heading (e.g. "The Dark Arts of Integration")
 *   techniques → Array of Technique objects to display as cards
 *   onSelect   → Called when the user clicks "Read" on a card
 */

import { useRef } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { Technique } from "@/data/techniques";

// ─────────────────────────────────────────────────────────────────────────────
// Technique Card
// ─────────────────────────────────────────────────────────────────────────────

function TechniqueCard({
  technique,
  onSelect,
}: {
  technique: Technique;
  onSelect: (t: Technique) => void;
}) {
  const { isLightMode } = useTheme();

  return (
    <article
      className="flex-shrink-0 flex flex-col justify-between rounded-sm overflow-hidden transition-transform duration-200 hover:-translate-y-1 cursor-pointer group"
      style={{
        width: "220px",
        minHeight: "160px",
        background: isLightMode
          ? "#ffffff"
          : "linear-gradient(160deg, #1f2937 0%, #111827 100%)",
        border: isLightMode
          ? "1px solid #e5e7eb"
          : "1px solid #374151",
        boxShadow: isLightMode
          ? "0 2px 8px rgba(0,0,0,0.05)"
          : "0 4px 20px rgba(0,0,0,0.8)",
      }}
      onClick={() => onSelect(technique)}
    >
      {/* Card body */}
      <div className="p-4 flex-1">
        <span
          className="inline-block mb-3 px-1.5 py-0.5 rounded-sm uppercase tracking-widest"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.52rem",
            color: isLightMode ? "color-mix(in srgb, var(--codex-accent) 80%, transparent)" : "#9ca3af",
            background: isLightMode ? "color-mix(in srgb, var(--codex-accent) 10%, transparent)" : "rgba(255,255,255,0.1)",
            border: isLightMode ? "1px solid color-mix(in srgb, var(--codex-accent) 15%, transparent)" : "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {technique.category}
        </span>

        <h3
          className="mb-2 font-light leading-snug"
          style={{
            fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
            fontSize: "1.05rem",
            letterSpacing: "0.02em",
            color: isLightMode ? "#1c1917" : "#ffffff",
          }}
        >
          {technique.name}
        </h3>

        <p
          className="italic"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.75rem",
            color: isLightMode ? "#78716c" : "#9ca3af",
            lineHeight: "1.5",
          }}
        >
          {technique.tagline}
        </p>
      </div>

      {/* Read button */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderTop: "1px solid color-mix(in srgb, var(--codex-accent) 10%, transparent)" }}
      >
        <BookOpen
          size={13}
          strokeWidth={1.6}
          style={{ color: "color-mix(in srgb, var(--codex-accent) 70%, transparent)" }}
        />
        <span
          className="uppercase tracking-widest group-hover:text-amber-400 transition-colors"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.58rem",
            color: "color-mix(in srgb, var(--codex-accent) 70%, transparent)",
          }}
        >
          Read
        </span>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LibraryCarousel
// ─────────────────────────────────────────────────────────────────────────────

interface LibraryCarouselProps {
  title: string;
  techniques: Technique[];
  onSelect: (t: Technique) => void;
}

export default function LibraryCarousel({ title, techniques, onSelect }: LibraryCarouselProps) {
  const { isLightMode } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -480 : 480, behavior: "smooth" });
  };

  return (
    <section className="mb-12" aria-label={title}>
      {/* Row heading */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2
          className="font-light"
          style={{
            fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
            fontSize: "1.1rem",
            letterSpacing: "0.04em",
            color: isLightMode ? "#1c1917" : "#ffffff",
          }}
        >
          {title}
        </h2>

        <div className="flex items-center gap-1">
          <button
            id={`carousel-left-${title.replace(/\s+/g, "-")}`}
            onClick={() => scroll("left")}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: "transparent",
              border: "1px solid color-mix(in srgb, var(--codex-accent) 20%, transparent)",
              color: "color-mix(in srgb, var(--codex-accent) 60%, transparent)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--codex-accent) 10%, transparent)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Scroll left"
          >
            <ChevronLeft size={14} strokeWidth={1.8} />
          </button>
          <button
            id={`carousel-right-${title.replace(/\s+/g, "-")}`}
            onClick={() => scroll("right")}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: "transparent",
              border: "1px solid color-mix(in srgb, var(--codex-accent) 20%, transparent)",
              color: "color-mix(in srgb, var(--codex-accent) 60%, transparent)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--codex-accent) 10%, transparent)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Scroll right"
          >
            <ChevronRight size={14} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Scroll track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
        role="list"
        aria-label={`${title} techniques`}
      >
        {techniques.map((t) => (
          <div key={t.id} role="listitem">
            <TechniqueCard technique={t} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </section>
  );
}
