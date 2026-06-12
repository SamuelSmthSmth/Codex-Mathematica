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

function toRoman(index: number): string {
  let num = index + 1;
  const val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syb = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  let roman = "";
  let i = 0;
  while (num > 0) {
    while (num >= val[i]) {
      roman += syb[i];
      num -= val[i];
    }
    i++;
  }
  return roman;
}

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
  | { screen: "split-ledger"; volume: Volume; chapterIndex: number; fragment: Fragment | null };

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
// VIEW 3 & 4 — Split Ledger Workspace
// ─────────────────────────────────────────────────────────────────────────────

function SplitLedgerView({
  volume,
  chapterIndex,
  activeFragment,
  onSelectFragment,
  onBack,
}: {
  volume: Volume;
  chapterIndex: number;
  activeFragment: Fragment | null;
  onSelectFragment: (frag: Fragment) => void;
  onBack: () => void;
}) {
  const chapter = volume.chapters[chapterIndex];

  return (
    <SceneBackground volume={volume}>
      {/* Nav */}
      <nav className="w-full max-w-[85rem] z-10 flex items-center justify-between mb-8">
        <BackButton onClick={onBack} label="Back to Chapters" />
        <Breadcrumb
          parts={[volume.name, `Chapter ${toRoman(chapterIndex)}`]}
          accent={volume.accent}
        />
      </nav>

      {/* Split Grid container */}
      <div className="w-full max-w-[85rem] z-10 flex gap-10 flex-1 relative">
        
        {/* LEFT COLUMN (35%) */}
        <aside className="w-[35%] flex flex-col border-t pt-5" style={{ borderColor: `${volume.accent}30` }}>
          {/* Header */}
          <div className="mb-5 flex-shrink-0">
            <h2
              className="text-amber-100/80 font-light mb-1"
              style={{
                fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
                fontSize: "1.25rem",
                letterSpacing: "0.05em",
              }}
            >
              Chapter {toRoman(chapterIndex)}
            </h2>
            <p
              className="text-stone-500/70 italic mb-5"
              style={{ fontFamily: "Georgia, serif", fontSize: "0.8rem" }}
            >
              {chapter.theme}
            </p>
            <GoldRule color={volume.accent} />
          </div>

          <p
            className="mb-3 pl-1 text-stone-600/50 uppercase tracking-[0.35em] flex-shrink-0"
            style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem" }}
          >
            {chapter.fragments.length} Fragments
          </p>

          <div className="flex flex-col pr-3 pb-10">
            {chapter.fragments.map((frag) => (
              <LedgerRow
                key={frag.id}
                fragment={frag}
                volume={volume}
                isActive={activeFragment?.id === frag.id}
                onSelect={() => onSelectFragment(frag)}
              />
            ))}
          </div>
        </aside>

        {/* RIGHT COLUMN (65%) */}
        <main className="w-[65%] sticky top-24 h-[calc(100vh-8rem)] flex flex-col items-center justify-center pl-8 border-l border-stone-800/50">
          {activeFragment ? (
            <ParchmentDesk key={activeFragment.id} volume={volume} chapterIndex={chapterIndex} fragment={activeFragment} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-sm transition-all duration-700 w-full h-full max-h-[600px]" style={{ border: `1px dashed ${volume.accent}30`, background: `radial-gradient(ellipse at center, ${volume.accent}0a 0%, transparent 60%)` }}>
               <Feather strokeWidth={1} style={{ width: "24px", height: "24px", color: volume.accent, opacity: 0.4 }} className="mb-4" />
               <p
                 className="text-stone-500/60 italic text-center px-10"
                 style={{ fontFamily: "Georgia, serif", fontSize: "1rem" }}
               >
                 Select a mathematical fragment to unroll the parchment...
               </p>
            </div>
          )}
        </main>
      </div>
    </SceneBackground>
  );
}

function LedgerRow({
  fragment,
  volume,
  isActive,
  onSelect,
}: {
  fragment: Fragment;
  volume: Volume;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isHighlighted = hovered || isActive;

  return (
    <div role="listitem">
      <button
        id={`frag-${volume.id}-${fragment.id}`}
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="w-full text-left focus:outline-none relative overflow-hidden"
        style={{
          display: "block",
          borderBottom: `1px solid ${volume.accent}14`,
          background: isHighlighted
            ? `linear-gradient(to right, ${volume.leather}85, ${volume.leather}20, transparent)`
            : "transparent",
          transition: "background 0.2s ease",
        }}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: volume.accent }} />
        )}
        <div className="flex items-center gap-4 px-3 py-3">
          {/* Padded ID */}
          <span
            className="flex-shrink-0 tabular-nums"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "0.7rem",
              color: volume.accent,
              opacity: isHighlighted ? 1 : 0.6,
              width: "2.2rem",
              textAlign: "right",
              transition: "opacity 0.2s ease",
            }}
          >
            {pad3(fragment.id)}
          </span>

          {/* Vertical separator */}
          <div
            className="flex-shrink-0"
            style={{ width: "1px", height: "22px", background: isActive ? `${volume.accent}50` : "rgba(255,255,255,0.07)", transition: "background 0.2s ease" }}
          />

          {/* Problem raw preview */}
          <span
            className="flex-1 min-w-0 truncate"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "0.75rem",
              color: isHighlighted ? "rgba(220,200,160,0.95)" : "rgba(180,160,120,0.65)",
              transition: "color 0.2s ease",
            }}
          >
            {fragment.problem_raw}
          </span>

          {/* Chevron */}
          <ChevronRight
            className="flex-shrink-0 w-3.5 h-3.5 transition-all duration-200"
            strokeWidth={isActive ? 2.5 : 2}
            style={{
              color: volume.accent,
              opacity: isHighlighted ? 0.9 : 0.18,
              transform: isHighlighted ? "translateX(2px)" : "translateX(0)",
            }}
          />
        </div>
      </button>
    </div>
  );
}

function ParchmentDesk({
  volume,
  chapterIndex,
  fragment,
}: {
  volume: Volume;
  chapterIndex: number;
  fragment: Fragment;
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
    <div 
      className="w-full max-w-2xl h-fit max-h-full overflow-y-auto px-2 pb-6 animate-in fade-in duration-300"
      style={{ scrollbarWidth: "none" }}
    >
      <article
        className="relative flex flex-col h-fit rounded-xl overflow-hidden mt-2 mb-8 transition-all duration-500 ease-in-out"
        style={{
          background: "#12100e",
          border: "1px solid rgba(45,40,35,0.8)",
          boxShadow: [
            "0 20px 40px rgba(0,0,0,0.8)",
            "0 4px 16px rgba(0,0,0,0.6)",
            "inset 0 1px 0 rgba(255,255,255,0.02)",
          ].join(", "),
        }}
      >
        {/* Fractal noise */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.05] z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
          aria-hidden="true"
        />
        {/* Ruled lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, rgba(200,200,200,0.6) 31px, rgba(200,200,200,0.6) 32px)",
            backgroundPositionY: "68px",
          }}
          aria-hidden="true"
        />
        {/* Age stain top */}
        <div
          className="pointer-events-none absolute top-0 inset-x-0 h-24 z-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <div 
          className="relative px-8 py-10 md:px-12 md:py-12 z-10"
        >
          {/* Card header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p
                className="uppercase tracking-[0.35em] text-amber-200/70"
                style={{ fontFamily: "Georgia, serif", fontSize: "0.57rem" }}
              >
                {volume.subtitle}
              </p>
              <p
                className="mt-0.5 uppercase tracking-[0.22em] text-stone-300/50"
                style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem" }}
              >
                Chapter {toRoman(chapterIndex)} &middot; Fragment {pad3(fragment.id)}
              </p>
            </div>
            <Feather
              className="flex-shrink-0 mt-0.5 text-stone-600/50"
              strokeWidth={1.5}
              style={{ width: "15px", height: "15px" }}
            />
          </div>

          <GoldRule />

          {/* Problem */}
          <section className="mt-8 mb-8" aria-label="Mathematical problem">
            <p
              className="uppercase tracking-widest mb-5 text-stone-500"
              style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem" }}
            >
              Problem
            </p>
            <div
              className="py-12 px-6 text-center bg-[#0d0a08] border border-stone-800/80 rounded-sm"
            >
              <MathRenderer className="[&_.katex]:text-[2.2rem] [&_.katex-display]:my-0 text-stone-200">
                {`$$${fragment.problem_latex}$$`}
              </MathRenderer>
            </div>
          </section>

          {/* Solution input */}
          {!submitted ? (
            <section aria-label="Solution entry">
              <p
                className="uppercase tracking-widest mb-3 text-stone-500"
                style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem" }}
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
                  className="flex-1 min-w-0 px-5 py-3 focus:outline-none transition-colors bg-[#0d0a08] border border-stone-800/80 rounded-sm text-stone-300 placeholder-stone-600/70 italic"
                  style={{
                    fontFamily: "var(--font-im-fell), Georgia, serif",
                    fontSize: "1.1rem",
                  }}
                  aria-label="Solution input"
                />
                <button
                  id={`${uid}-submit`}
                  onClick={handleSubmit}
                  disabled={!answer.trim()}
                  className="flex items-center gap-2 flex-shrink-0 px-6 py-3 text-xs uppercase tracking-widest font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-[#0d0a08] border border-stone-800/80 text-stone-400 hover:text-stone-300 rounded-sm"
                  style={{
                    fontFamily: "Georgia, serif",
                  }}
                >
                  <Send className="w-3.5 h-3.5" strokeWidth={2} />
                  Commit
                </button>
              </div>
            </section>
          ) : (
            <div
              className="flex items-start gap-3 px-4 py-3 bg-[#0d0a08] border border-stone-800/80 rounded-sm"
              role="status"
            >
              <ScrollText
                className="flex-shrink-0 mt-0.5 text-stone-500/60"
                strokeWidth={1.5}
                style={{ width: "15px", height: "15px" }}
              />
              <div>
                <span
                  className="text-sm font-medium text-stone-300"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Solution committed —{" "}
                </span>
                <code
                  className="text-[0.8rem] text-stone-400"
                  style={{ fontFamily: "'Courier New', Courier, monospace" }}
                >
                  {answer}
                </code>
              </div>
            </div>
          )}

          {/* ── Ink & Quill Journal ── */}
          {submitted && (
            <section className="mt-10 mb-6" aria-label="Ink and Quill Journal">
              <div className="mb-6">
                <GoldRule />
              </div>

              {/* Journal heading */}
              <div className="flex items-center gap-2.5 mb-2">
                <Feather
                  strokeWidth={1.5}
                  className="text-stone-500/60"
                  style={{ width: "14px", height: "14px" }}
                />
                <p
                  className="uppercase tracking-[0.28em] text-amber-200/70"
                  style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem" }}
                >
                  Ink &amp; Quill Journal
                </p>
              </div>
              <p
                className="mb-6 italic leading-relaxed text-stone-400/80"
                style={{
                  fontFamily: "var(--font-im-fell), Georgia, serif",
                  fontSize: "0.85rem",
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
                  icon={<PenLine className="w-3.5 h-3.5" strokeWidth={2} />}
                  label="Write"
                />
                <ParchmentTab
                  id={`${uid}-tab-preview`}
                  active={journalTab === "preview"}
                  onClick={() => setJournalTab("preview")}
                  icon={<Eye className="w-3.5 h-3.5" strokeWidth={2} />}
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
                  rows={14}
                  className="w-full px-5 py-5 text-[0.9rem] leading-relaxed resize-y focus:outline-none transition-colors bg-[#0d0a08] border border-stone-800/80 text-stone-300 placeholder-stone-700"
                  style={{
                    fontFamily: "'Courier New', Courier, monospace",
                    borderTop: "none",
                    borderRadius: "0 2px 2px 2px",
                  }}
                  aria-label="Proof journal — write mode"
                />
              )}

              {/* Preview */}
              {journalTab === "preview" && (
                <div
                  className="w-full min-h-[350px] px-6 py-6 text-[0.95rem] leading-relaxed parchment-prose bg-[#0d0a08] border border-stone-800/80 text-stone-300"
                  style={{
                    fontFamily: "var(--font-im-fell), Georgia, serif",
                    borderTop: "none",
                    borderRadius: "0 2px 2px 2px",
                  }}
                  aria-live="polite"
                  aria-label="Proof journal — preview mode"
                >
                  {journalText.trim() ? (
                    <MathRenderer>{journalText}</MathRenderer>
                  ) : (
                    <p className="italic text-stone-600">
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
          className="pointer-events-none absolute bottom-0 inset-x-0 h-20 z-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
          }}
          aria-hidden="true"
        />
      </article>

      {/* Footer */}
      <footer className="flex-shrink-0 text-center pb-8 animate-in fade-in duration-700 delay-300">
        <p
          className="italic opacity-30 px-4 whitespace-normal break-words"
          style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", color: "#c8922a", letterSpacing: "0.05em" }}
        >
          &ldquo;{fragment.problem_raw}&rdquo;
        </p>
      </footer>
    </div>
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
        background: active ? "#0d0a08" : "transparent",
        color: active ? "#d6d3d1" : "rgba(168,162,158,0.5)", // text-stone-300 / text-stone-400
        borderTop: active ? "1px solid rgba(41,37,36,0.8)" : "1px solid transparent", // border-stone-800
        borderLeft: active ? "1px solid rgba(41,37,36,0.8)" : "1px solid transparent",
        borderRight: active ? "1px solid rgba(41,37,36,0.8)" : "1px solid transparent",
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
    setView({ screen: "split-ledger", volume, chapterIndex, fragment: null });
  }, []);

  const selectFragment = useCallback(
    (volume: Volume, chapterIndex: number, fragment: Fragment) => {
      setView({ screen: "split-ledger", volume, chapterIndex, fragment });
    },
    []
  );

  const goToShelf = useCallback(() => {
    setView({ screen: "shelf" });
  }, []);

  const goToChapters = useCallback((volume: Volume) => {
    setView({ screen: "chapters", volume });
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

  // split-ledger
  const { volume, chapterIndex, fragment } = view;
  return (
    <SplitLedgerView
      volume={volume}
      chapterIndex={chapterIndex}
      activeFragment={fragment}
      onSelectFragment={(frag) => selectFragment(volume, chapterIndex, frag)}
      onBack={() => goToChapters(volume)}
    />
  );
}
