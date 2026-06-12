"use client";

import { useState, useCallback, useId, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  ArrowLeft,
  ChevronRight,
  Feather,
  ScrollText,
  CheckCheck,
  RotateCcw,
  BookMarked,
  Flame,
  NotebookPen,
  Scroll,
  Unlock,
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
  // Preprocess text to ensure $$ blocks are surrounded by clean newlines
  const processedText = children.replace(/\$\$([\s\S]*?)\$\$/g, (_match, inner: string) => {
    return `\n$$\n${inner.trim()}\n$$\n`;
  });

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]}>
        {processedText}
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
  const { isLightMode } = useTheme();
  return (
    <div
      className={`codex-view min-h-screen flex flex-col items-center py-10 px-4 relative ${isLightMode ? "theme-light" : ""}`}
      style={{
        background: isLightMode
          ? "#fcfaf7"
          : volume
          ? `radial-gradient(ellipse 80% 50% at 38% 12%, ${volume.leather}c0 0%, #090604 55%, #050302 100%)`
          : "radial-gradient(ellipse 100% 70% at 50% 0%, #1c1008 0%, #0a0604 55%, #050302 100%)",
      }}
    >
      {/* Vertical wood-grain */}
      {!isLightMode && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 9px, rgba(180,120,60,0.5) 9px, rgba(180,120,60,0.5) 10px)",
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 1 — Library Shelf
// ─────────────────────────────────────────────────────────────────────────────

const SCHOLAR_QUOTES = [
  { text: "Truth is ever to be found in simplicity, and not in the multiplicity and confusion of things.", author: "Isaac Newton" },
  { text: "For since the fabric of the universe is most perfect and the work of a most wise Creator, nothing at all takes place in the universe in which some rule of maximum or minimum does not appear.", author: "Leonhard Euler" },
  { text: "If I have been able to see further, it was only because I stood on the shoulders of giants.", author: "Isaac Newton" },
  { text: "Nature uses as little as possible of anything.", author: "Johannes Kepler" },
  { text: "Mathematics is the queen of the sciences and number theory is the queen of mathematics.", author: "Carl Friedrich Gauss" },
  { text: "There is no branch of mathematics, however abstract, which may not some day be applied to phenomena of the real world.", author: "Nikolai Lobachevsky" },
  { text: "The universe cannot be read until we have learned the language and become familiar with the characters in which it is written. It is written in mathematical language.", author: "Galileo Galilei" },
  { text: "I must study politics and war that my sons may have liberty to study mathematics and philosophy.", author: "John Adams" },
  { text: "To those who do not know mathematics it is difficult to get across a real feeling as to the beauty, the deepest beauty, of nature.", author: "Richard Feynman" },
  { text: "What we know is a drop, what we don't know is an ocean.", author: "Isaac Newton" },
  { text: "My theories flourished, but I myself failed.", author: "Emmy Noether" },
  { text: "Give me a place to stand, and a lever long enough, and I will move the world.", author: "Archimedes" }
];

function getDailyQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return SCHOLAR_QUOTES[dayOfYear % SCHOLAR_QUOTES.length];
}

export function LibraryShelf({ onSelect }: { onSelect: (v: Volume) => void }) {
  const { isLightMode } = useTheme();
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
        className="z-10 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8 lg:gap-10 px-2 pb-12 md:pb-0"
        role="list"
        aria-label="Available volumes"
      >
        {VOLUMES.map((vol) => (
          <BookSpine key={vol.id} volume={vol} onSelect={onSelect} />
        ))}
      </div>

      {/* Daily Scholar Quote */}
      <div className="z-10 mt-auto pt-16 pb-8 md:pb-12 text-center max-w-xl px-4">
        <p
          className={`italic ${isLightMode ? "text-stone-500" : "text-stone-500/70"}`}
          style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem", lineHeight: "1.6" }}
        >
          "{getDailyQuote().text}"
        </p>
        <p
          className={`mt-3 uppercase tracking-[0.2em] ${isLightMode ? "text-stone-400" : "text-stone-600"}`}
          style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem" }}
        >
          &mdash; {getDailyQuote().author}
        </p>
      </div>

      {/* Shelf plank */}
      {!isLightMode && (
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 z-0"
          style={{
            height: "56px",
            background:
              "linear-gradient(to top, #0d0803 0%, #18100a 60%, transparent 100%)",
            boxShadow: "0 -6px 40px rgba(0,0,0,0.8)",
          }}
          aria-hidden="true"
        />
      )}
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
  const { isLightMode } = useTheme();

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
          className="relative rounded-sm md:rounded-[2px_5px_5px_2px] w-[260px] h-[85px] md:w-[clamp(70px,12vw,116px)] md:h-[clamp(185px,32vw,285px)]"
          style={{
            background: isLightMode 
              ? `linear-gradient(160deg, #ffffff 0%, ${volume.leather}10 35%, #fcfaf7 100%)`
              : `linear-gradient(160deg,
              ${lightenHex(volume.leather, 18)} 0%,
              ${volume.leather} 35%,
              ${lightenHex(volume.leather, 8)} 60%,
              ${lightenHex(volume.leather, -8)} 100%)`,
            boxShadow: isLightMode
              ? hovered 
                ? `3px 8px 25px rgba(0,0,0,0.1), 0 0 15px ${volume.accent}15`
                : `1px 4px 15px rgba(0,0,0,0.05)`
              : hovered
              ? `5px 16px 60px rgba(0,0,0,0.95), 0 0 35px ${volume.accent}28,
                 inset -4px 0 10px rgba(0,0,0,0.55), inset 3px 0 7px rgba(255,255,255,0.05)`
              : `3px 10px 35px rgba(0,0,0,0.85),
                 inset -3px 0 8px rgba(0,0,0,0.45), inset 2px 0 5px rgba(255,255,255,0.03)`,
            transition: "box-shadow 0.4s ease",
          }}
        >
          {/* Spine shadow */}
          <div
            className="absolute top-0 bottom-0 left-0 w-3 md:w-[14px] rounded-l-sm md:rounded-l-[2px]"
            style={{
              background: isLightMode
                ? "linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.02))"
                : "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.1))",
              borderRight: `1px solid ${volume.accent}18`,
            }}
          />
          {/* Top & bottom rules */}
          {[18, "bottom", 18].map((pos, idx) =>
            idx < 2 ? (
              <div
                key={idx}
                className={`absolute left-[18px] right-[10px] h-px hidden md:block ${idx === 0 ? "top-[18px]" : "bottom-[18px]"}`}
                style={{
                  background: `linear-gradient(to right, ${volume.accent}90, ${volume.accent}20)`,
                }}
              />
            ) : null
          )}
          {/* Greek symbol */}
          <div
            className="absolute inset-0 flex items-center justify-center -translate-x-[40%] md:translate-x-0 md:-translate-y-[10px]"
            style={{
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
            className="absolute right-6 top-[22px] md:top-auto md:bottom-[26px] md:left-0 md:right-0 md:text-center text-right"
            style={{
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
            className="absolute right-6 bottom-[22px] md:bottom-auto md:top-[27px] md:left-0 md:right-0 md:text-center text-right"
            style={{
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
  const { isLightMode } = useTheme();

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
          ? isLightMode
            ? `linear-gradient(to right, ${volume.leather}15, ${volume.leather}05, transparent)`
            : `linear-gradient(to right, ${volume.leather}70, ${volume.leather}25, transparent)`
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
            CHAPTER {toRoman(index)}
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

  // ── Conquered IDs: fetch from Firestore when chapter opens ──
  const [conqueredIds, setConqueredIds] = useState<Set<number>>(new Set());
  const { isGuestMode } = useAuth();
  const { isFocusMode } = useTheme();

  const fetchGrimoire = () => {
    if (isGuestMode) return;
    const user = auth.currentUser;
    if (!user) return;

    const grimoireRef = collection(db, "users", user.uid, "grimoire");
    const q = query(
      grimoireRef,
      where("volume",  "==", volume.id),
      where("chapter", "==", chapterIndex),
    );

    getDocs(q)
      .then((snap) => {
        const ids = new Set<number>();
        snap.forEach((d) => ids.add(d.data().fragment_id as number));
        setConqueredIds(ids);
      })
      .catch(() => { /* silently ignore */ });
  };

  useEffect(() => {
    fetchGrimoire();
    
    // Listen for custom event to refetch when grimoire is burned
    const handleUpdate = () => fetchGrimoire();
    window.addEventListener("grimoire-updated", handleUpdate);
    return () => window.removeEventListener("grimoire-updated", handleUpdate);
  }, [volume.id, chapterIndex, isGuestMode]);

  return (
    <SceneBackground volume={volume}>
      {/* Nav */}
      <nav className="w-full max-w-[85rem] z-10 flex items-center justify-between mb-8">
        <BackButton onClick={onBack} label="Back to Chapters" />
        <Breadcrumb
          parts={[volume.name, `CHAPTER ${toRoman(chapterIndex)}`]}
          accent={volume.accent}
        />
      </nav>

      {/* Split Grid container */}
      <div className="w-full max-w-[85rem] z-10 flex flex-col md:flex-row gap-0 md:gap-10 flex-1 relative">
        
        {/* LEFT COLUMN */}
        {!isFocusMode && (
          <aside className="w-full md:w-[35%] flex flex-col border-t pt-5" style={{ borderColor: `${volume.accent}30` }}>
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
              CHAPTER {toRoman(chapterIndex)}
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
                isConquered={conqueredIds.has(frag.id)}
                onSelect={() => onSelectFragment(frag)}
              />
            ))}
          </div>
        </aside>
        )}

        {/* RIGHT COLUMN */}
        <main
          className={`
            fixed inset-0 z-50 bg-[#0a0806]/95 backdrop-blur-md flex flex-col pt-16 pb-4 px-4 overflow-y-auto
            md:static ${isFocusMode ? "md:w-full max-w-4xl mx-auto" : "md:w-[65%]"} md:z-auto md:bg-transparent md:backdrop-blur-none md:pt-0 md:pb-0 md:px-0 ${isFocusMode ? "md:pl-0" : "md:pl-8"}
            md:sticky md:top-24 md:h-[calc(100vh-8rem)] md:items-center md:justify-center ${!isFocusMode ? "md:border-l md:border-stone-800/50" : ""}
            transition-all duration-300 ease-in-out
            ${activeFragment ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 md:translate-y-0 md:opacity-100"}
          `}
        >
          {/* Mobile Back Button */}
          {activeFragment && (
            <button
              onClick={() => onSelectFragment(null as any)}
              className="md:hidden absolute top-4 left-4 text-stone-400 p-2 flex items-center gap-2 text-sm font-serif hover:text-amber-200 transition-colors"
            >
              <ArrowLeft size={16} /> Return to Ledger
            </button>
          )}

          {activeFragment ? (
            <ParchmentDesk key={activeFragment.id} volume={volume} chapterIndex={chapterIndex} fragment={activeFragment} />
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center rounded-sm transition-all duration-700 w-full h-full max-h-[600px]" style={{ border: `1px dashed ${volume.accent}30`, background: `radial-gradient(ellipse at center, ${volume.accent}0a 0%, transparent 60%)` }}>
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
  isConquered,
  onSelect,
}: {
  fragment: Fragment;
  volume: Volume;
  isActive: boolean;
  isConquered: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { isLightMode } = useTheme();
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
        className="w-full text-left focus:outline-none relative overflow-hidden transition-transform duration-150 ease-out hover:translate-x-1"
        style={{
          display: "block",
          borderBottom: `1px solid ${volume.accent}14`,
          background: isHighlighted
            ? isLightMode
              ? `linear-gradient(to right, ${volume.leather}15, ${volume.leather}05, transparent)`
              : `linear-gradient(to right, ${volume.leather}85, ${volume.leather}20, transparent)`
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
              color: isHighlighted ? (isLightMode ? "#78716c" : "rgba(220,200,160,0.95)") : (isLightMode ? "#a8a29e" : "rgba(180,160,120,0.65)"),
              transition: "color 0.2s ease",
            }}
          >
            {fragment.problem_raw}
          </span>

          {/* Conquered ink-drop badge */}
          {isConquered && (
            <span
              title="Fragment conquered"
              aria-label="Conquered"
              className="flex-shrink-0"
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                background: "rgba(110,200,80,0.75)",
                boxShadow: "0 0 6px rgba(110,200,80,0.55), 0 0 12px rgba(80,180,50,0.25)",
              }}
            />
          )}

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
  // ── Inkwell state machine ──
  // "drafting"   → user is typing their LaTeX answer
  // "committed"  → answer locked; archive solution revealed
  // "conquered"  → user declared proof sound; journal unlocked
  type InkwellPhase = "drafting" | "committed" | "conquered";

  const [phase, setPhase] = useState<InkwellPhase>("drafting");
  const [answer, setAnswer] = useState("");
  const [journalText, setJournalText] = useState("");
  const [sealStatus, setSealStatus] = useState<"idle" | "saving" | "sealed" | "error">("idle");
  const [isEditing, setIsEditing] = useState(false);
  const uid = useId();
  const archiveRef = useRef<HTMLDivElement>(null);
  const { isGuestMode, scholar } = useAuth();
  const { isLightMode } = useTheme();

  // ── Hydration ──
  useEffect(() => {
    if (isGuestMode || !scholar) return;
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, "users", scholar.uid, "grimoire", String(fragment.id));
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.proof_markdown) {
            setJournalText(data.proof_markdown);
            setPhase("conquered");
            setSealStatus("sealed");
          }
        }
      } catch (e) {
        // Silently ignore if fails to load
      }
    };
    fetchDoc();
  }, [fragment.id, isGuestMode, scholar]);

  // Scroll archive into view after commit; scroll journal into view after conquered
  const journalRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (phase === "committed" && archiveRef.current) {
      setTimeout(() => {
        archiveRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 350);
    }
    if (phase === "conquered" && journalRef.current) {
      setTimeout(() => {
        journalRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 400);
    }
  }, [phase]);

  const handleCommit = useCallback(() => {
    if (answer.trim()) setPhase("committed");
  }, [answer]);

  const handleConquered = useCallback(() => {
    setPhase("conquered");
  }, []);

  const handleSeal = useCallback(async () => {
    if (sealStatus === "saving" || sealStatus === "sealed") return;
    setSealStatus("saving");

    if (isGuestMode) {
      // Mock save for guests
      setTimeout(() => setSealStatus("sealed"), 800);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setSealStatus("idle");
      return;
    }
    
    try {
      const docRef = doc(db, "users", user.uid, "grimoire", String(fragment.id));
      await setDoc(docRef, {
        fragment_id: fragment.id,
        volume:      volume.id,
        chapter:     chapterIndex,
        proof_markdown: journalText,
        sealed_at:   serverTimestamp(),
      }, { merge: true });
      setSealStatus("sealed");
      setIsEditing(false);
      // Reset the success badge after 3 s so the button is reusable
      setTimeout(() => setSealStatus("idle"), 3000);
    } catch {
      setSealStatus("error");
      setTimeout(() => setSealStatus("idle"), 4000);
    }
  }, [sealStatus, isGuestMode, fragment.id, volume.id, chapterIndex, journalText]);
  const handleRetry = useCallback(() => {
    setAnswer("");
    setPhase("drafting");
  }, []);

  return (
    <div 
      className="w-full max-w-2xl h-fit max-h-full overflow-y-auto px-2 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out"
      style={{ scrollbarWidth: "none" }}
    >
      <article
        className="fragment-card relative flex flex-col h-fit rounded-xl overflow-hidden mt-2 mb-8 transition-all duration-500 ease-in-out"
        style={{
          background: isLightMode ? "#fcfaf7" : "#0c0a08",
          border: isLightMode ? "1px solid #e5e7eb" : "1px solid #292524",
          boxShadow: isLightMode 
            ? "0 4px 12px rgba(0,0,0,0.03)" 
            : "0 20px 40px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02)",
        }}
      >
        {/* Fractal noise */}
        <div
          className="fragment-card-noise pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.05] z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
          aria-hidden="true"
        />
        {/* Ruled lines */}
        <div
          className="fragment-card-rules pointer-events-none absolute inset-0 opacity-[0.03] z-0"
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
            background: isLightMode 
              ? "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, transparent 100%)" 
              : "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)",
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
              className="math-box-label uppercase tracking-widest mb-5 text-stone-500"
              style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem" }}
            >
              Problem
            </p>
            <div
              className={`py-12 px-6 text-center border rounded-sm transition-colors duration-300 ${isLightMode ? "bg-white border-stone-200" : "bg-black/50 border-stone-800"}`}
            >
              <MathRenderer className="[&_.katex]:text-[2.2rem] [&_.katex-display]:my-0 text-stone-200">
                {`$$\n${fragment.problem_latex}\n$$`}
              </MathRenderer>
            </div>
          </section>

          {/* ── Inkwell Solution Section ── */}
          <section aria-label="Solution entry">
            <p
              className="math-box-label uppercase tracking-widest mb-3 text-stone-500"
              style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem" }}
            >
              Your Solution
            </p>

            {/* ── DRAFTING: textarea + live preview ── */}
            {phase === "drafting" && (
              <>
                {/* Dark LaTeX textarea */}
                <div className="relative">
                  <textarea
                    id={`${uid}-solution`}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleCommit();
                    }}
                    placeholder={"\\frac{x^2}{2} + C"}
                    rows={3}
                    className={`w-full px-5 py-4 text-sm leading-relaxed resize-none focus:outline-none transition-all duration-200 ${isLightMode ? "text-stone-900" : "text-stone-300"}`}
                    style={{
                      fontFamily: "'Courier New', Courier, monospace",
                      background: isLightMode ? "#ffffff" : "rgba(0,0,0,0.5)",
                      border: isLightMode ? "1px solid #e5e7eb" : "1px solid #292524",
                      borderRadius: "2px 2px 0 0",
                      caretColor: "#c8922a",
                      boxShadow: isLightMode ? "none" : "inset 0 2px 8px rgba(0,0,0,0.6)",
                    }}
                    aria-label="LaTeX solution input"
                  />
                  {/* Cursor glow at bottom of textarea */}
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
                    style={{
                      background: answer.trim()
                        ? "linear-gradient(to right, transparent, rgba(200,146,42,0.55), transparent)"
                        : "linear-gradient(to right, transparent, rgba(80,70,55,0.3), transparent)",
                      transition: "background 0.4s ease",
                    }}
                    aria-hidden="true"
                  />
                </div>

                {/* Live preview — "wet ink" indentation */}
                <div
                  className="w-full px-5 py-4 transition-all duration-300"
                  style={{
                    background: isLightMode ? "#ffffff" : "linear-gradient(to bottom, #0e0b09, #0a0806)",
                    border: isLightMode ? "1px solid #e5e7eb" : "1px solid #292524",
                    borderTop: "none",
                    borderRadius: "0 0 2px 2px",
                    boxShadow: isLightMode ? "0 2px 5px rgba(0,0,0,0.03)" : "inset 0 4px 12px rgba(0,0,0,0.5), inset 0 1px 3px rgba(0,0,0,0.8)",
                    minHeight: "52px",
                  }}
                  aria-live="polite"
                  aria-label="Live LaTeX preview"
                >
                  {answer.trim() ? (
                    <MathRenderer className="[&_.katex]:text-[1.6rem] text-stone-200/90 [&_.katex-display]:my-0 text-center">
                      {`$$\n${answer}\n$$`}
                    </MathRenderer>
                  ) : (
                    <p
                      className="italic"
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "0.78rem",
                        color: "rgba(120,105,80,0.5)",
                      }}
                    >
                      Live preview will appear here as you write…
                    </p>
                  )}
                </div>

                {/* + C disclaimer */}
                <p
                  className="mt-2 italic tracking-wide"
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "0.68rem",
                    color: "rgba(100,88,70,0.55)",
                  }}
                >
                  * Constants of integration (+ C) are implied within the Archive.
                </p>

                {/* Commit button */}
                <div className="mt-4 flex justify-end">
                  <button
                    id={`${uid}-commit`}
                    onClick={handleCommit}
                    disabled={!answer.trim()}
                    className="group flex items-center gap-2.5 px-7 py-2.5 text-xs uppercase tracking-[0.22em] font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-transform duration-75 active:scale-95"
                    style={{
                      fontFamily: "Georgia, serif",
                      background: answer.trim()
                        ? isLightMode ? "linear-gradient(135deg, #ffffff 0%, #f4f0ea 100%)" : "linear-gradient(135deg, #1a1208 0%, #0f0c06 100%)"
                        : isLightMode ? "#f4f0ea" : "#0a0806",
                      border: answer.trim()
                        ? isLightMode ? "1px solid rgba(200,146,42,0.6)" : "1px solid rgba(200,146,42,0.35)"
                        : isLightMode ? "1px solid #e5e7eb" : "1px solid rgba(41,37,36,0.8)",
                      borderRadius: "2px",
                      color: answer.trim() ? (isLightMode ? "#966812" : "rgba(200,146,42,0.9)") : (isLightMode ? "rgba(120,110,90,0.5)" : "rgba(120,110,90,0.5)"),
                      boxShadow: answer.trim()
                        ? isLightMode ? "0 2px 5px rgba(0,0,0,0.05)" : "0 0 20px rgba(200,146,42,0.08), inset 0 1px 0 rgba(255,220,100,0.06)"
                        : "none",
                      transition: "all 0.3s ease",
                    }}
                    aria-label="Commit your solution"
                  >
                    <Flame
                      className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110"
                      strokeWidth={2}
                    />
                    Commit
                  </button>
                </div>
              </>
            )}

            {/* ── COMMITTED / VERIFIED: locked answer + archive reveal ── */}
            {(phase === "committed" || phase === "conquered") && (
              <>
                {/* Locked answer display */}
                <div
                  className={`flex items-start gap-3 px-5 py-4 rounded-sm transition-colors duration-300 ${isLightMode ? "bg-white border-stone-200" : "bg-black/50 border-stone-800"}`}
                  role="status"
                  style={{
                    borderWidth: "1px",
                    borderStyle: "solid",
                    boxShadow: isLightMode ? "0 2px 5px rgba(0,0,0,0.03)" : "inset 0 2px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  <ScrollText
                    className="flex-shrink-0 mt-0.5"
                    strokeWidth={1.5}
                    style={{ width: "14px", height: "14px", color: "rgba(200,146,42,0.5)", marginTop: "3px" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="mb-1.5"
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "0.6rem",
                        letterSpacing: "0.25em",
                        color: "rgba(200,146,42,0.5)",
                        textTransform: "uppercase",
                      }}
                    >
                      Committed Answer
                    </p>
                    <MathRenderer className="[&_.katex]:text-base text-stone-300 [&_.katex-display]:my-0">
                      {`$${answer}$`}
                    </MathRenderer>
                  </div>
                </div>

                {/* Archive solution reveal */}
                <div
                  ref={archiveRef}
                  className="mt-6 overflow-hidden"
                  style={{
                    animation: "inkwell-unfurl 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                  }}
                >
                  {/* Section label */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="flex-1 h-px"
                      style={{ background: "linear-gradient(to right, transparent, rgba(200,146,42,0.25))" }}
                      aria-hidden="true"
                    />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <BookMarked
                        strokeWidth={1.5}
                        style={{ width: "13px", height: "13px", color: "rgba(200,146,42,0.6)" }}
                      />
                      <p
                        style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", letterSpacing: "0.32em", color: "rgba(200,146,42,0.6)", textTransform: "uppercase" }}
                      >
                        The Archive&apos;s Solution
                      </p>
                    </div>
                    <div
                      className="flex-1 h-px"
                      style={{ background: "linear-gradient(to left, transparent, rgba(200,146,42,0.25))" }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Archive solution box */}
                  <div
                    className="px-6 py-6 text-center"
                    style={{
                      background: isLightMode ? "linear-gradient(160deg, #ffffff 0%, #f4f0ea 100%)" : "linear-gradient(160deg, #110e09 0%, #0c0a07 100%)",
                      border: isLightMode ? "1px solid #d1d5db" : "1px solid rgba(200,146,42,0.18)",
                      borderRadius: "2px",
                      boxShadow: isLightMode ? "0 2px 5px rgba(0,0,0,0.05)" : "0 0 40px rgba(200,146,42,0.04), inset 0 1px 0 rgba(200,146,42,0.06)",
                    }}
                  >
                    <MathRenderer className="[&_.katex]:text-2xl text-amber-100/85 [&_.katex-display]:my-0">
                      {`$$${fragment.solution_latex}$$`}
                    </MathRenderer>
                    {fragment.solution_raw && (
                      <p
                        className="mt-3"
                        style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "0.68rem", color: "rgba(150,130,90,0.45)", letterSpacing: "0.05em" }}
                      >
                        {fragment.solution_raw}
                      </p>
                    )}
                  </div>

                  {/* Verdict buttons — hidden once conquered */}
                  {phase === "committed" && (
                    <div className="mt-6 flex items-center gap-3 justify-center">
                      {/* Sound proof */}
                      <button
                        id={`${uid}-sound`}
                        onClick={handleConquered}
                        className="group flex items-center gap-2.5 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-200"
                        style={{
                          fontFamily: "Georgia, serif",
                          background: isLightMode ? "#f4f0ea" : "linear-gradient(135deg, #0f1a0d 0%, #0a1008 100%)",
                          border: isLightMode ? "1px solid #a3c293" : "1px solid rgba(110,180,80,0.3)",
                          borderRadius: "2px",
                          color: isLightMode ? "#2e5c20" : "rgba(130,200,100,0.85)",
                          boxShadow: isLightMode ? "0 2px 5px rgba(0,0,0,0.05)" : "0 0 20px rgba(100,180,60,0.06), inset 0 1px 0 rgba(150,220,100,0.05)",
                        }}
                        aria-label="My proof is sound"
                      >
                        <CheckCheck
                          className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110"
                          strokeWidth={2.5}
                        />
                        My Proof is Sound
                      </button>

                      {/* Retry */}
                      <button
                        id={`${uid}-retry`}
                        onClick={handleRetry}
                        className="group flex items-center gap-2.5 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-200"
                        style={{
                          fontFamily: "Georgia, serif",
                          background: isLightMode ? "#fcfaf7" : "#0a0806",
                          border: isLightMode ? "1px solid #d1d5db" : "1px solid rgba(41,37,36,0.9)",
                          borderRadius: "2px",
                          color: isLightMode ? "#78716c" : "rgba(150,140,120,0.6)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = isLightMode ? "#44403c" : "rgba(200,180,140,0.9)";
                          e.currentTarget.style.borderColor = isLightMode ? "#a8a29e" : "rgba(80,70,55,0.9)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = isLightMode ? "#78716c" : "rgba(150,140,120,0.6)";
                          e.currentTarget.style.borderColor = isLightMode ? "#d1d5db" : "rgba(41,37,36,0.9)";
                        }}
                        aria-label="I need to retry"
                      >
                        <RotateCcw
                          className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-rotate-180"
                          strokeWidth={2}
                        />
                        I Need to Retry
                      </button>
                    </div>
                  )}

                  {/* [CONQUERED] banner */}
                  {phase === "conquered" && (
                    <div
                      className="mt-6 flex items-center justify-center gap-3 px-6 py-3"
                      style={{
                        background: isLightMode ? "linear-gradient(135deg, #eef5eb 0%, #e2ecd8 100%)" : "linear-gradient(135deg, #0f1a0d 0%, #0a1008 100%)",
                        border: isLightMode ? "1px solid #a3c293" : "1px solid rgba(110,180,80,0.25)",
                        borderRadius: "2px",
                        boxShadow: "0 0 30px rgba(100,180,60,0.05)",
                        animation: "inkwell-unfurl 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                      }}
                      role="status"
                    >
                      <CheckCheck
                        strokeWidth={1.8}
                        style={{ width: "14px", height: "14px", color: isLightMode ? "#2e5c20" : "rgba(130,200,100,0.65)", flexShrink: 0 }}
                      />
                      <p
                        style={{
                          fontFamily: "Georgia, serif",
                          fontSize: "0.68rem",
                          letterSpacing: "0.22em",
                          textTransform: "uppercase",
                          color: isLightMode ? "#2e5c20" : "rgba(140,200,110,0.7)",
                        }}
                      >
                        Fragment {String(fragment.id).padStart(3, "0")} &mdash; Conquered
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {/* ── Ink & Quill Journal — revealed on [CONQUERED] ── */}
          {phase === "conquered" && (
            <section
              ref={journalRef}
              className="mt-8 mb-2 overflow-hidden"
              aria-label="Ink and Quill Journal"
              style={{
                animation: "inkwell-unfurl 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
              }}
            >
              {/* Divider */}
              <div className="mb-8 mt-2">
                <GoldRule />
              </div>

              {/* Journal heading */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <NotebookPen
                    strokeWidth={1.5}
                    style={{ width: "13px", height: "13px", color: "rgba(200,146,42,0.45)", flexShrink: 0 }}
                  />
                  <p
                    className="uppercase tracking-[0.32em]"
                    style={{ fontFamily: "Georgia, serif", fontSize: "0.57rem", color: "rgba(200,146,42,0.45)" }}
                  >
                    Ink &amp; Quill Journal
                  </p>
                </div>
                {sealStatus === "idle" && !isEditing && phase === "conquered" && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1 text-[0.6rem] uppercase tracking-widest transition-colors duration-200"
                    style={{
                      fontFamily: "Georgia, serif",
                      color: isLightMode ? "#966812" : "rgba(200,146,42,0.6)",
                      border: isLightMode ? "1px solid #d1d5db" : "1px solid rgba(200,146,42,0.3)",
                      borderRadius: "2px",
                      background: isLightMode ? "#fcfaf7" : "rgba(10,8,6,0.5)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = isLightMode ? "#44403c" : "rgba(220,175,80,0.95)";
                      e.currentTarget.style.borderColor = isLightMode ? "#78716c" : "rgba(200,146,42,0.55)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isLightMode ? "#966812" : "rgba(200,146,42,0.6)";
                      e.currentTarget.style.borderColor = isLightMode ? "#d1d5db" : "rgba(200,146,42,0.3)";
                    }}
                  >
                    <Unlock className="w-3 h-3" strokeWidth={2} />
                    Edit Proof
                  </button>
                )}
              </div>
              
              {(!isEditing && sealStatus === "idle" && phase === "conquered") ? null : (
                <>
                  <p
                    className="mb-5 italic leading-relaxed"
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "0.8rem",
                      color: "rgba(140,128,105,0.65)",
                    }}
                  >
                    Commit your full workings. Markdown and $\LaTeX$ are supported.
                  </p>

                  {/* Textarea — dark inkwell */}
                  <textarea
                    id={`${uid}-journal`}
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder={`## Proof\n\nLet $u = x^2$, so $du = 2x\\,dx$\n\n**Step 1:** ...`}
                    rows={10}
                    className="w-full px-5 py-5 text-[0.88rem] leading-relaxed resize-y focus:outline-none transition-colors"
                    style={{
                      fontFamily: "'Courier New', Courier, monospace",
                      background: isLightMode ? "#ffffff" : "#0a0806",
                      border: isLightMode ? "1px solid #d1d5db" : "1px solid rgba(41,37,36,0.9)",
                      borderRadius: "2px 2px 0 0",
                      color: isLightMode ? "#44403c" : "rgba(200,190,165,0.85)",
                      caretColor: "#c8922a",
                      boxShadow: isLightMode ? "0 2px 5px rgba(0,0,0,0.03)" : "inset 0 2px 8px rgba(0,0,0,0.55)",
                    }}
                    aria-label="Proof journal"
                  />
                </>
              )}

              {/* Live preview — parchment shadow well */}
              <div
                className="w-full px-6 py-5 leading-relaxed"
                style={{
                  background: isLightMode ? "#fdfbf7" : "#12100e",
                  border: isLightMode ? "1px solid #d1d5db" : "1px solid rgba(41,37,36,0.9)",
                  borderTop: (!isEditing && sealStatus === "idle") ? (isLightMode ? "1px solid #d1d5db" : "1px solid rgba(41,37,36,0.9)") : "none",
                  borderRadius: (!isEditing && sealStatus === "idle") ? "2px" : "0 0 2px 2px",
                  boxShadow: isLightMode ? "0 2px 5px rgba(0,0,0,0.03)" : "inset 0 4px 16px rgba(0,0,0,0.6), inset 0 1px 4px rgba(0,0,0,0.8)",
                  minHeight: "100px",
                  fontFamily: "Georgia, serif",
                }}
                aria-live="polite"
                aria-label="Journal live preview"
              >
                {journalText.trim() ? (
                  <MathRenderer
                    className="text-stone-300/85 text-[0.9rem] leading-relaxed [&_h1]:text-amber-200/70 [&_h2]:text-amber-200/60 [&_h3]:text-stone-400/80 [&_h1]:font-normal [&_h2]:font-normal [&_h1]:tracking-wide [&_h2]:tracking-wide [&_h1]:mt-0 [&_strong]:text-stone-300 [&_em]:text-stone-400/80 [&_code]:bg-stone-900/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-amber-300/70 [&_blockquote]:border-l [&_blockquote]:border-stone-700 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-stone-500 [&_.katex-display]:!block [&_.katex-display]:!text-center [&_.katex-display]:!my-6 [&_.katex-display]:!w-full"
                  >
                    {journalText}
                  </MathRenderer>
                ) : (
                  <p
                    className="italic"
                    style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "rgba(100,88,70,0.45)" }}
                  >
                    Your proof will render here as you write&hellip;
                  </p>
                )}
              </div>

              {/* Seal Grimoire */}
              {(!isEditing && sealStatus === "idle") ? null : (
                <div className="mt-8 flex flex-col items-center gap-3">
                <button
                  id={`${uid}-seal`}
                  onClick={handleSeal}
                  disabled={sealStatus === "saving"}
                  className="group relative flex items-center gap-3 px-10 py-3.5 text-xs uppercase tracking-[0.3em] font-semibold overflow-hidden disabled:cursor-not-allowed transition-transform duration-75 active:scale-95"
                  style={{
                    fontFamily: "Georgia, serif",
                    background:
                      sealStatus === "sealed"
                        ? isLightMode ? "linear-gradient(160deg, #eef5eb 0%, #e2ecd8 100%)" : "linear-gradient(160deg, #0d1a09 0%, #091008 100%)"
                        : sealStatus === "error"
                          ? isLightMode ? "#fef2f2" : "linear-gradient(160deg, #1a0c09 0%, #100807 100%)"
                          : isLightMode ? "linear-gradient(160deg, #ffffff 0%, #f4f0ea 100%)" : "linear-gradient(160deg, #1a1208 0%, #0f0c07 100%)",
                    border:
                      sealStatus === "sealed"
                        ? isLightMode ? "1px solid #a3c293" : "1px solid rgba(110,180,80,0.35)"
                        : sealStatus === "error"
                          ? isLightMode ? "1px solid #fecaca" : "1px solid rgba(180,70,50,0.35)"
                          : isLightMode ? "1px solid #d1d5db" : "1px solid rgba(200,146,42,0.3)",
                    borderRadius: "2px",
                    color:
                      sealStatus === "sealed"
                        ? isLightMode ? "#2e5c20" : "rgba(130,200,100,0.85)"
                        : sealStatus === "error"
                          ? isLightMode ? "#b91c1c" : "rgba(200,90,70,0.8)"
                          : isLightMode ? "#966812" : "rgba(200,146,42,0.75)",
                    boxShadow:
                      sealStatus === "sealed"
                        ? "0 2px 5px rgba(0,0,0,0.05)"
                        : sealStatus === "error"
                          ? "none"
                          : "0 0 30px rgba(200,146,42,0.06), inset 0 1px 0 rgba(255,220,100,0.05), inset 0 -1px 0 rgba(0,0,0,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (sealStatus !== "idle") return;
                    e.currentTarget.style.color = isLightMode ? "#44403c" : "rgba(220,175,80,0.95)";
                    e.currentTarget.style.borderColor = isLightMode ? "#78716c" : "rgba(200,146,42,0.55)";
                  }}
                  onMouseLeave={(e) => {
                    if (sealStatus !== "idle") return;
                    e.currentTarget.style.color = isLightMode ? "#966812" : "rgba(200,146,42,0.75)";
                    e.currentTarget.style.borderColor = isLightMode ? "#d1d5db" : "rgba(200,146,42,0.3)";
                  }}
                  aria-label={
                    sealStatus === "saving" ? "Inking Ledger…" :
                    sealStatus === "sealed" ? "Grimoire Sealed" :
                    sealStatus === "error"  ? "Save failed — try again" :
                    "Seal the grimoire"
                  }
                >
                  {/* Icon / spinner */}
                  {sealStatus === "saving" ? (
                    <span
                      className="inline-block w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
                      style={{
                        borderColor: isLightMode ? "#d1d5db" : "rgba(200,146,42,0.2)",
                        borderTopColor: isLightMode ? "#966812" : "rgba(200,146,42,0.6)",
                        animation: "spin 0.75s linear infinite",
                      }}
                      aria-hidden="true"
                    />
                  ) : sealStatus === "sealed" ? (
                    <CheckCheck className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                  ) : (
                    <Scroll
                      className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      strokeWidth={1.8}
                    />
                  )}

                  {/* Label */}
                  {sealStatus === "saving" && "Inking Ledger\u2026"}
                  {sealStatus === "sealed" && "Grimoire Sealed"}
                  {sealStatus === "error"  && "Ink Failed — Retry"}
                  {sealStatus === "idle"   && (isEditing ? "Update Grimoire" : "Seal Grimoire")}
                </button>

                {/* Error sub-text */}
                {sealStatus === "error" && (
                  <p
                    className="italic text-center"
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "0.7rem",
                      color: "rgba(180,80,60,0.7)",
                      animation: "inkwell-unfurl 0.3s ease forwards",
                    }}
                    role="alert"
                  >
                    The Archive could not receive your proof. Check your connection and try again.
                  </p>
                )}

                {/* Spin keyframe — scoped inline */}
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
              )}
            </section>
          )}
        </div>

        {/* Age stain bottom */}
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-20 z-0"
          style={{
            background: isLightMode 
              ? "linear-gradient(to top, rgba(255,255,255,0.8) 0%, transparent 100%)" 
              : "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
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
