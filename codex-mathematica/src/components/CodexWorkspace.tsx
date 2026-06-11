"use client";

import { useState, useCallback, useId } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  Feather,
  PenLine,
  ScrollText,
  Send,
} from "lucide-react";
import { VOLUMES, type Volume, type Chapter, type Fragment } from "@/data/codex-data";

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const toRoman = (n: number) => ROMAN[n] ?? String(n + 1);

/** Lighten a #rrggbb hex colour by `amt` per channel. */
function lightenHex(hex: string, amt: number): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${clamp(r + amt)},${clamp(g + amt)},${clamp(b + amt)})`;
}

/** Zero-pad a number to 3 digits: 7 → "007" */
const pad3 = (n: number) => String(n).padStart(3, "0");

// ─────────────────────────────────────────────────────────────────────────────
// App-level state discriminated union
// ─────────────────────────────────────────────────────────────────────────────

type AppView =
  | { screen: "shelf" }
  | { screen: "chapters"; volume: Volume }
  | { screen: "ledger"; volume: Volume; chapterIndex: number }
  | { screen: "workspace"; volume: Volume; chapterIndex: number; fragment: Fragment };

// ─────────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────────

function GoldRule({ color = "#c8922a" }: { color?: string }) {
  return (
    <div
      className="w-full opacity-40"
      style={{
        height: "1px",
        background: `linear-gradient(to right, transparent, ${color}cc, ${color}, ${color}cc, transparent)`,
      }}
      aria-hidden="true"
    />
  );
}

function MathRenderer({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared dark background
// ─────────────────────────────────────────────────────────────────────────────

function SceneBackground({
  volume,
  children,
}: {
  volume?: Volume;
  children: React.ReactNode;
}) {
  return (
    <div
      className="codex-view min-h-screen flex flex-col items-center py-10 px-4 relative"
      style={{
        background: volume
          ? `radial-gradient(ellipse 80% 50% at 38% 12%, ${volume.leather}c0 0%, #090604 55%, #050302 100%)`
          : "radial-gradient(ellipse 100% 70% at 50% 0%, #1c1008 0%, #0a0604 55%, #050302 100%)",
      }}
    >
      {/* Vertical wood-grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0px, transparent 9px, rgba(180,120,60,0.5) 9px, rgba(180,120,60,0.5) 10px)",
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 1 — Library Shelf
// ─────────────────────────────────────────────────────────────────────────────

export function LibraryShelf({ onSelect }: { onSelect: (v: Volume) => void }) {
  return (
    <SceneBackground>
      {/* Chandelier warmth from top */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-64"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(180,110,20,0.18) 0%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <header className="z-10 text-center mb-20 select-none mt-8">
        <p
          className="text-amber-700/50 mb-4 tracking-[0.55em] uppercase"
          style={{ fontSize: "0.62rem", fontFamily: "Georgia, serif" }}
        >
          The Grand Archive
        </p>
        <h1
          className="text-amber-100/85 font-light"
          style={{
            fontFamily:
              "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "0.08em",
          }}
        >
          Codex Mathematica
        </h1>
        <div className="mt-5 mx-auto" style={{ maxWidth: "220px" }}>
          <GoldRule />
        </div>
        <p
          className="mt-5 text-stone-500/70 italic"
          style={{ fontFamily: "Georgia, serif", fontSize: "0.83rem" }}
        >
          Select a volume to begin your study
        </p>
      </header>

      {/* Shelf */}
      <div
        className="z-10 flex items-end gap-3 sm:gap-6 lg:gap-10 px-2"
        role="list"
        aria-label="Available volumes"
      >
        {VOLUMES.map((vol) => (
          <BookSpine key={vol.id} volume={vol} onSelect={onSelect} />
        ))}
      </div>

      {/* Shelf plank */}
      <div
        className="pointer-events-none absolute bottom-0 inset-x-0"
        style={{
          height: "56px",
          background:
            "linear-gradient(to top, #0d0803 0%, #18100a 60%, transparent 100%)",
          boxShadow: "0 -6px 40px rgba(0,0,0,0.8)",
        }}
        aria-hidden="true"
      />
    </SceneBackground>
  );
}

function BookSpine({
  volume,
  onSelect,
}: {
  volume: Volume;
  onSelect: (v: Volume) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div role="listitem">
      <button
        id={`vol-${volume.id}`}
        onClick={() => onSelect(volume)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label={`Open volume ${volume.name}: ${volume.subtitle}`}
        className="relative block focus:outline-none"
        style={{
          transform: hovered
            ? "translateY(-24px) rotate(-1.5deg)"
            : "translateY(0) rotate(0deg)",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Body */}
        <div
          style={{
            width: "clamp(70px, 12vw, 116px)",
            height: "clamp(185px, 32vw, 285px)",
            background: `linear-gradient(160deg,
              ${lightenHex(volume.leather, 18)} 0%,
              ${volume.leather} 35%,
              ${lightenHex(volume.leather, 8)} 60%,
              ${lightenHex(volume.leather, -8)} 100%)`,
            borderRadius: "2px 5px 5px 2px",
            position: "relative",
            boxShadow: hovered
              ? `5px 16px 60px rgba(0,0,0,0.95), 0 0 35px ${volume.accent}28,
                 inset -4px 0 10px rgba(0,0,0,0.55), inset 3px 0 7px rgba(255,255,255,0.05)`
              : `3px 10px 35px rgba(0,0,0,0.85),
                 inset -3px 0 8px rgba(0,0,0,0.45), inset 2px 0 5px rgba(255,255,255,0.03)`,
            transition: "box-shadow 0.4s ease",
          }}
        >
          {/* Spine shadow */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "14px",
              borderRadius: "2px 0 0 2px",
              background:
                "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.1))",
              borderRight: `1px solid ${volume.accent}18`,
            }}
          />
          {/* Top & bottom rules */}
          {[18, "bottom", 18].map((pos, idx) =>
            idx < 2 ? (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  [idx === 0 ? "top" : "bottom"]: `${pos}px`,
                  left: "18px",
                  right: "10px",
                  height: "1px",
                  background: `linear-gradient(to right, ${volume.accent}90, ${volume.accent}20)`,
                }}
              />
            ) : null
          )}
          {/* Greek symbol */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "translateY(-10px)",
              fontFamily:
                "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
              fontSize: "clamp(2rem, 5vw, 3.8rem)",
              color: volume.accent,
              opacity: hovered ? 1 : 0.75,
              textShadow: `0 0 24px ${volume.accent}55`,
              transition: "opacity 0.4s ease",
            }}
            aria-hidden="true"
          >
            {volume.symbol}
          </div>
          {/* Name */}
          <div
            style={{
              position: "absolute",
              bottom: "26px",
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "clamp(0.48rem, 1vw, 0.66rem)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: volume.bookText,
              opacity: 0.65,
            }}
          >
            {volume.name}
          </div>
          {/* Chapter count */}
          <div
            style={{
              position: "absolute",
              top: "27px",
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: "Georgia, serif",
              fontSize: "clamp(0.44rem, 0.85vw, 0.58rem)",
              letterSpacing: "0.12em",
              color: volume.accent,
              opacity: 0.6,
            }}
          >
            {volume.chapters.length} chapters
          </div>
          {/* Hover glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "2px 5px 5px 2px",
              background: `radial-gradient(ellipse at 50% 30%, ${volume.accent}14 0%, transparent 70%)`,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.4s ease",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />
        </div>
        {/* Shadow */}
        <div
          style={{
            marginTop: "3px",
            width: "100%",
            height: "10px",
            background: "rgba(0,0,0,0.55)",
            borderRadius: "50%",
            filter: "blur(5px)",
            transform: hovered ? "scaleX(0.8)" : "scaleX(1)",
            transition: "transform 0.4s ease",
          }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 2 — Table of Contents (Chapters)
// ─────────────────────────────────────────────────────────────────────────────

function ChapterView({
  volume,
  onSelectChapter,
  onClose,
}: {
  volume: Volume;
  onSelectChapter: (idx: number) => void;
  onClose: () => void;
}) {
  return (
    <SceneBackground volume={volume}>
      {/* Back */}
      <nav className="w-full max-w-xl z-10 mb-10">
        <BackButton onClick={onClose} label="Return to the Archive" />
      </nav>

      {/* Volume heading */}
      <header className="w-full max-w-xl z-10 text-center mb-12">
        <div
          className="mb-5 leading-none select-none"
          style={{
            fontFamily:
              "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
            fontSize: "clamp(3.5rem, 11vw, 5.5rem)",
            color: volume.accent,
            textShadow: `0 0 50px ${volume.accent}40`,
          }}
          aria-hidden="true"
        >
          {volume.symbol}
        </div>
        <h2
          className="font-light text-amber-100/80"
          style={{
            fontFamily:
              "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
            fontSize: "clamp(1.4rem, 4vw, 2rem)",
            letterSpacing: "0.1em",
          }}
        >
          {volume.name}
        </h2>
        <p
          className="mt-2 text-stone-500/70 italic"
          style={{ fontFamily: "Georgia, serif", fontSize: "0.82rem" }}
        >
          {volume.subtitle}
        </p>
        <div className="mt-7 mx-auto" style={{ maxWidth: "280px" }}>
          <GoldRule color={volume.accent} />
        </div>
      </header>

      {/* Chapter rows (table-of-contents style) */}
      <main
        className="w-full max-w-xl z-10"
        aria-label={`Chapters in ${volume.name}`}
      >
        <p
          className="mb-3 pl-1 text-stone-600/50 uppercase tracking-[0.35em]"
          style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem" }}
        >
          Table of Contents
        </p>

        <div style={{ borderTop: `1px solid ${volume.accent}20` }}>
          {volume.chapters.map((chapter, idx) => (
            <ChapterRow
              key={idx}
              chapter={chapter}
              index={idx}
              volume={volume}
              onSelect={() => onSelectChapter(idx)}
            />
          ))}
        </div>
      </main>
    </SceneBackground>
  );
}

function ChapterRow({
  chapter,
  index,
  volume,
  onSelect,
}: {
  chapter: Chapter;
  index: number;
  volume: Volume;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      id={`ch-${volume.id}-${index}`}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="w-full text-left focus:outline-none"
      style={{
        display: "block",
        borderBottom: `1px solid ${volume.accent}18`,
        background: hovered
          ? `linear-gradient(to right, ${volume.leather}70, ${volume.leather}25, transparent)`
          : "transparent",
        transition: "background 0.25s ease",
      }}
    >
      <div className="flex items-center gap-0 px-2 py-5">
        {/* Roman numeral */}
        <span
          className="flex-shrink-0 w-16 text-center"
          style={{
            fontFamily:
              "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
            fontSize: "1.6rem",
            color: volume.accent,
            opacity: hovered ? 1 : 0.7,
            transition: "opacity 0.25s ease",
          }}
        >
          {toRoman(index)}
        </span>

        {/* Vertical rule */}
        <div
          className="flex-shrink-0 mr-5"
          style={{ width: "1px", height: "40px", background: `${volume.accent}25` }}
        />

        {/* Chapter info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-stone-300/85 font-light"
            style={{
              fontFamily:
                "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
              fontSize: "0.95rem",
              letterSpacing: "0.03em",
            }}
          >
            Chapter {toRoman(index)}
          </p>
          <p
            className="mt-0.5 text-stone-500/65 italic truncate"
            style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem" }}
          >
            {chapter.theme}
          </p>
        </div>

        {/* Fragment count */}
        <span
          className="flex-shrink-0 mx-6 tabular-nums"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.68rem",
            color: volume.accent,
            opacity: 0.55,
            letterSpacing: "0.1em",
          }}
        >
          {chapter.fragments.length}&thinsp;fragments
        </span>

        {/* Chevron */}
        <ChevronRight
          className="flex-shrink-0 w-3.5 h-3.5 transition-all duration-200"
          strokeWidth={1.8}
          style={{
            color: volume.accent,
            opacity: hovered ? 0.8 : 0.22,
            transform: hovered ? "translateX(3px)" : "translateX(0)",
          }}
        />
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 3 — Fragment Ledger (list of 50)
// ─────────────────────────────────────────────────────────────────────────────

function FragmentLedger({
  volume,
  chapterIndex,
  onSelectFragment,
  onBack,
}: {
  volume: Volume;
  chapterIndex: number;
  onSelectFragment: (frag: Fragment) => void;
  onBack: () => void;
}) {
  const chapter = volume.chapters[chapterIndex];

  return (
    <SceneBackground volume={volume}>
      {/* Nav */}
      <nav className="w-full max-w-2xl z-10 flex items-center justify-between mb-10">
        <BackButton onClick={onBack} label="Back to Chapters" />
        <Breadcrumb
          parts={[volume.name, `Chapter ${toRoman(chapterIndex)}`]}
          accent={volume.accent}
        />
      </nav>

      {/* Ledger header */}
      <header className="w-full max-w-2xl z-10 mb-6">
        <div className="flex items-baseline gap-4 mb-3">
          <span
            style={{
              fontFamily:
                "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
              fontSize: "2rem",
              color: volume.accent,
              opacity: 0.8,
              lineHeight: 1,
            }}
          >
            {toRoman(chapterIndex)}
          </span>
          <div>
            <h2
              className="text-amber-100/75 font-light"
              style={{
                fontFamily:
                  "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
                fontSize: "1.15rem",
                letterSpacing: "0.05em",
              }}
            >
              Chapter {toRoman(chapterIndex)}
            </h2>
            <p
              className="text-stone-500/60 italic"
              style={{ fontFamily: "Georgia, serif", fontSize: "0.73rem" }}
            >
              {chapter.theme}
            </p>
          </div>
        </div>
        <GoldRule color={volume.accent} />
      </header>

      {/* Fragment list */}
      <main className="w-full max-w-2xl z-10 flex flex-col">
        <p
          className="mb-2 pl-1 text-stone-600/45 uppercase tracking-[0.35em]"
          style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem" }}
        >
          {chapter.fragments.length} Fragments — Select to open workspace
        </p>

        {/* Scrollable ledger */}
        <div
          className="overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 300px)",
            borderTop: `1px solid ${volume.accent}20`,
            scrollbarWidth: "thin",
            scrollbarColor: `${volume.accent}40 transparent`,
          }}
          role="list"
          aria-label={`Fragments in Chapter ${toRoman(chapterIndex)}`}
        >
          {chapter.fragments.map((frag) => (
            <LedgerRow
              key={frag.id}
              fragment={frag}
              volume={volume}
              onSelect={() => onSelectFragment(frag)}
            />
          ))}
        </div>
      </main>
    </SceneBackground>
  );
}

function LedgerRow({
  fragment,
  volume,
  onSelect,
}: {
  fragment: Fragment;
  volume: Volume;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div role="listitem">
      <button
        id={`frag-${volume.id}-${fragment.id}`}
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="w-full text-left focus:outline-none"
        style={{
          display: "block",
          borderBottom: `1px solid ${volume.accent}14`,
          background: hovered
            ? `linear-gradient(to right, ${volume.leather}55, ${volume.leather}18, transparent)`
            : "transparent",
          transition: "background 0.2s ease",
        }}
      >
        <div className="flex items-center gap-4 px-2 py-2.5">
          {/* Padded ID */}
          <span
            className="flex-shrink-0 tabular-nums"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "0.68rem",
              color: volume.accent,
              opacity: 0.7,
              width: "2.2rem",
              textAlign: "right",
            }}
          >
            {pad3(fragment.id)}
          </span>

          {/* Vertical separator */}
          <div
            className="flex-shrink-0"
            style={{ width: "1px", height: "22px", background: "rgba(255,255,255,0.07)" }}
          />

          {/* Problem raw preview */}
          <span
            className="flex-1 min-w-0 truncate"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "0.73rem",
              color: hovered ? "rgba(220,200,160,0.9)" : "rgba(180,160,120,0.65)",
              transition: "color 0.2s ease",
            }}
          >
            {fragment.problem_raw}
          </span>

          {/* Chevron */}
          <ChevronRight
            className="flex-shrink-0 w-3 h-3 transition-all duration-200"
            strokeWidth={2}
            style={{
              color: volume.accent,
              opacity: hovered ? 0.75 : 0.18,
              transform: hovered ? "translateX(2px)" : "translateX(0)",
            }}
          />
        </div>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 4 — Parchment Workspace
// ─────────────────────────────────────────────────────────────────────────────

function FragmentWorkspace({
  volume,
  chapterIndex,
  fragment,
  onBack,
}: {
  volume: Volume;
  chapterIndex: number;
  fragment: Fragment;
  onBack: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [journalTab, setJournalTab] = useState<"write" | "preview">("write");
  const uid = useId();

  const handleSubmit = useCallback(() => {
    if (answer.trim()) setSubmitted(true);
  }, [answer]);

  return (
    <SceneBackground volume={volume}>
      {/* Nav */}
      <nav className="w-full max-w-2xl z-10 flex items-center justify-between mb-10">
        <BackButton onClick={onBack} label="Back to Fragments" />
        <Breadcrumb
          parts={[volume.name, `Chapter ${toRoman(chapterIndex)}`, `Fragment ${pad3(fragment.id)}`]}
          accent={volume.accent}
        />
      </nav>

      {/* ══ Parchment Card ══ */}
      <main className="w-full max-w-2xl z-10">
        <article
          className="relative overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse 110% 80% at 50% -5%, #faf0d4 0%, #f0d898 40%, #e6c86a 72%, #d2a63e 100%)",
            borderRadius: "2px",
            boxShadow: [
              "0 0 0 1px rgba(180,140,60,0.28)",
              "0 16px 70px rgba(0,0,0,0.92)",
              "0 4px 16px rgba(0,0,0,0.75)",
              "inset 0 1px 0 rgba(255,240,180,0.5)",
            ].join(", "),
          }}
        >
          {/* Fractal noise */}
          <div
            className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.09]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
            aria-hidden="true"
          />
          {/* Ruled lines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, rgba(100,65,15,0.6) 31px, rgba(100,65,15,0.6) 32px)",
              backgroundPositionY: "68px",
            }}
            aria-hidden="true"
          />
          {/* Age stain top */}
          <div
            className="pointer-events-none absolute top-0 inset-x-0 h-24"
            style={{
              background: "linear-gradient(to bottom, rgba(90,50,10,0.22) 0%, transparent 100%)",
            }}
            aria-hidden="true"
          />

          <div className="relative px-8 py-10 md:px-12 md:py-12">

            {/* Card header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p
                  className="uppercase tracking-[0.35em] opacity-50"
                  style={{ fontFamily: "Georgia, serif", fontSize: "0.57rem", color: "#4a2808" }}
                >
                  {volume.subtitle}
                </p>
                <p
                  className="mt-0.5 uppercase tracking-[0.22em] opacity-40"
                  style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: "#5a3810" }}
                >
                  Chapter {toRoman(chapterIndex)} &middot; Fragment {pad3(fragment.id)}
                </p>
              </div>
              <Feather
                className="opacity-30 flex-shrink-0 mt-0.5"
                strokeWidth={1.5}
                style={{ width: "15px", height: "15px", color: "#6b3f10" }}
              />
            </div>

            <GoldRule />

            {/* Problem */}
            <section className="mt-8 mb-8" aria-label="Mathematical problem">
              <p
                className="uppercase tracking-[0.35em] mb-5 opacity-55"
                style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", color: "#4a2808" }}
              >
                Problem
              </p>
              <div
                className="py-6 px-4 text-center"
                style={{
                  background: "rgba(140,85,15,0.07)",
                  border: "1px solid rgba(100,65,15,0.2)",
                  borderRadius: "2px",
                  color: "#150c02",
                }}
              >
                <MathRenderer className="[&_.katex]:text-[1.55rem] [&_.katex-display]:my-0">
                  {`$$${fragment.problem_latex}$$`}
                </MathRenderer>
              </div>
            </section>

            {/* Solution input */}
            {!submitted ? (
              <section aria-label="Solution entry">
                <p
                  className="uppercase tracking-[0.35em] mb-3 opacity-55"
                  style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", color: "#4a2808" }}
                >
                  Your Solution
                </p>
                <div className="flex gap-3">
                  <input
                    id={`${uid}-solution`}
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Enter your answer…"
                    className="flex-1 min-w-0 px-4 py-2.5 text-sm focus:outline-none transition-colors"
                    style={{
                      fontFamily: "'Courier New', Courier, monospace",
                      background: "rgba(253,246,226,0.85)",
                      color: "#1a0e04",
                      border: "1px solid rgba(120,80,20,0.28)",
                      borderRadius: "2px",
                    }}
                    aria-label="Solution input"
                  />
                  <button
                    id={`${uid}-submit`}
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
                    className="flex items-center gap-2 flex-shrink-0 px-5 py-2.5 text-xs uppercase tracking-widest font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    style={{
                      fontFamily: "Georgia, serif",
                      background: "#1e1206",
                      color: "#f0d060",
                      border: "1px solid rgba(80,50,12,0.6)",
                      borderRadius: "2px",
                      boxShadow: "inset 0 1px 0 rgba(255,210,80,0.1)",
                    }}
                  >
                    <Send className="w-3 h-3" strokeWidth={2} />
                    Commit
                  </button>
                </div>
              </section>
            ) : (
              <div
                className="flex items-start gap-3 px-4 py-3"
                style={{
                  background: "rgba(30,50,18,0.12)",
                  border: "1px solid rgba(60,90,30,0.28)",
                  borderRadius: "2px",
                }}
                role="status"
              >
                <ScrollText
                  className="flex-shrink-0 mt-0.5 opacity-60"
                  strokeWidth={1.5}
                  style={{ width: "14px", height: "14px", color: "#2a4018" }}
                />
                <div>
                  <span
                    className="text-sm font-medium"
                    style={{ fontFamily: "Georgia, serif", color: "#243018" }}
                  >
                    Solution committed —{" "}
                  </span>
                  <code
                    className="text-sm"
                    style={{ fontFamily: "'Courier New', Courier, monospace", color: "#2e3a1a" }}
                  >
                    {answer}
                  </code>
                </div>
              </div>
            )}

            {/* ── Ink & Quill Journal (expands after submission) ── */}
            {submitted && (
              <section className="mt-10" aria-label="Ink and Quill Journal">
                <div className="mb-6">
                  <GoldRule />
                </div>

                {/* Journal heading */}
                <div className="flex items-center gap-2.5 mb-2">
                  <Feather
                    strokeWidth={1.5}
                    style={{ width: "13px", height: "13px", color: "#5c3a0e", opacity: 0.7 }}
                  />
                  <p
                    className="uppercase tracking-[0.28em] opacity-65"
                    style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: "#3e2408" }}
                  >
                    Ink &amp; Quill Journal
                  </p>
                </div>
                <p
                  className="mb-6 italic leading-relaxed opacity-70"
                  style={{
                    fontFamily: "var(--font-im-fell), Georgia, serif",
                    fontSize: "0.82rem",
                    color: "#5c3a10",
                  }}
                >
                  Record your full proof, working notes, and reflections. Markdown and LaTeX are supported.
                </p>

                {/* Tabs */}
                <div className="flex gap-1 mb-0">
                  <ParchmentTab
                    id={`${uid}-tab-write`}
                    active={journalTab === "write"}
                    onClick={() => setJournalTab("write")}
                    icon={<PenLine className="w-3 h-3" strokeWidth={2} />}
                    label="Write"
                  />
                  <ParchmentTab
                    id={`${uid}-tab-preview`}
                    active={journalTab === "preview"}
                    onClick={() => setJournalTab("preview")}
                    icon={<Eye className="w-3 h-3" strokeWidth={2} />}
                    label="Preview"
                  />
                </div>

                {/* Write */}
                {journalTab === "write" && (
                  <textarea
                    id={`${uid}-journal`}
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder={`## Proof\n\nLet $f(x) = \\\\sin(x)$…\n\n**Step 1:** …`}
                    rows={11}
                    className="w-full px-4 py-4 text-sm leading-7 resize-y focus:outline-none transition-colors"
                    style={{
                      fontFamily: "'Courier New', Courier, monospace",
                      background: "rgba(253,246,226,0.8)",
                      color: "#1a0e04",
                      border: "1px solid rgba(120,80,20,0.28)",
                      borderTop: "none",
                      borderRadius: "0 2px 2px 2px",
                    }}
                    aria-label="Proof journal — write mode"
                  />
                )}

                {/* Preview */}
                {journalTab === "preview" && (
                  <div
                    className="w-full min-h-[280px] px-5 py-5 text-sm leading-7 parchment-prose"
                    style={{
                      fontFamily: "var(--font-im-fell), Georgia, serif",
                      background: "rgba(253,246,226,0.8)",
                      border: "1px solid rgba(120,80,20,0.28)",
                      borderTop: "none",
                      borderRadius: "0 2px 2px 2px",
                    }}
                    aria-live="polite"
                    aria-label="Proof journal — preview mode"
                  >
                    {journalText.trim() ? (
                      <MathRenderer>{journalText}</MathRenderer>
                    ) : (
                      <p className="italic opacity-45" style={{ color: "#6b4018" }}>
                        Nothing to preview yet — switch to Write and begin your proof.
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Age stain bottom */}
          <div
            className="pointer-events-none absolute bottom-0 inset-x-0 h-20"
            style={{
              background: "linear-gradient(to top, rgba(80,45,8,0.28) 0%, transparent 100%)",
            }}
            aria-hidden="true"
          />
        </article>
      </main>

      {/* Footer */}
      <footer className="mt-10 z-10 text-center">
        <p
          className="italic opacity-25"
          style={{ fontFamily: "Georgia, serif", fontSize: "0.7rem", color: "#c8922a", letterSpacing: "0.05em" }}
        >
          &ldquo;{fragment.problem_raw}&rdquo;
        </p>
      </footer>
    </SceneBackground>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared micro-components
// ─────────────────────────────────────────────────────────────────────────────

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 transition-colors duration-200"
      style={{
        fontFamily: "Georgia, serif",
        fontSize: "0.78rem",
        letterSpacing: "0.12em",
        color: "rgba(150,130,90,0.55)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.color = "rgba(210,190,140,0.9)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "rgba(150,130,90,0.55)")
      }
    >
      <ArrowLeft
        className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200"
        strokeWidth={1.8}
      />
      {label}
    </button>
  );
}

function Breadcrumb({ parts, accent }: { parts: string[]; accent: string }) {
  return (
    <p
      className="text-right uppercase tracking-[0.3em] truncate max-w-[50%]"
      style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", color: accent, opacity: 0.55 }}
    >
      {parts.join(" / ")}
    </p>
  );
}

function ParchmentTab({
  id,
  active,
  onClick,
  icon,
  label,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      aria-pressed={active}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all"
      style={{
        fontFamily: "Georgia, serif",
        borderRadius: "2px 2px 0 0",
        background: active ? "rgba(253,246,226,0.8)" : "transparent",
        color: active ? "#1a0e04" : "rgba(90,55,16,0.5)",
        borderTop: active ? "1px solid rgba(120,80,20,0.28)" : "1px solid transparent",
        borderLeft: active ? "1px solid rgba(120,80,20,0.28)" : "1px solid transparent",
        borderRight: active ? "1px solid rgba(120,80,20,0.28)" : "1px solid transparent",
        borderBottom: "none",
        cursor: active ? "default" : "pointer",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — CodexWorkspace (state machine / router)
// ─────────────────────────────────────────────────────────────────────────────

export default function CodexWorkspace() {
  const [view, setView] = useState<AppView>({ screen: "shelf" });

  const openVolume = useCallback((volume: Volume) => {
    setView({ screen: "chapters", volume });
  }, []);

  const openChapter = useCallback((volume: Volume, chapterIndex: number) => {
    setView({ screen: "ledger", volume, chapterIndex });
  }, []);

  const openFragment = useCallback(
    (volume: Volume, chapterIndex: number, fragment: Fragment) => {
      setView({ screen: "workspace", volume, chapterIndex, fragment });
    },
    []
  );

  const goToShelf = useCallback(() => {
    setView({ screen: "shelf" });
  }, []);

  const goToChapters = useCallback((volume: Volume) => {
    setView({ screen: "chapters", volume });
  }, []);

  const goToLedger = useCallback((volume: Volume, chapterIndex: number) => {
    setView({ screen: "ledger", volume, chapterIndex });
  }, []);

  // ── Render ──
  if (view.screen === "shelf") {
    return <LibraryShelf onSelect={openVolume} />;
  }

  if (view.screen === "chapters") {
    return (
      <ChapterView
        volume={view.volume}
        onSelectChapter={(idx) => openChapter(view.volume, idx)}
        onClose={goToShelf}
      />
    );
  }

  if (view.screen === "ledger") {
    const { volume, chapterIndex } = view;
    return (
      <FragmentLedger
        volume={volume}
        chapterIndex={chapterIndex}
        onSelectFragment={(frag) => openFragment(volume, chapterIndex, frag)}
        onBack={() => goToChapters(volume)}
      />
    );
  }

  // workspace
  const { volume, chapterIndex, fragment } = view;
  return (
    <FragmentWorkspace
      volume={volume}
      chapterIndex={chapterIndex}
      fragment={fragment}
      onBack={() => goToLedger(volume, chapterIndex)}
    />
  );
}
