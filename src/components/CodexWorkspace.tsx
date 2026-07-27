"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useProgress, type SelfGrade } from "@/context/ProgressContext";
import {
  ArrowLeft,
  ChevronRight,
  Feather,
  CheckCheck,
  RotateCcw,
  BookMarked,
  Minus,
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
  const [cachedChapterData, setCachedChapterData] = useState<Record<string, any>>({});
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
        const cache: Record<string, any> = {};
        snap.forEach((d) => {
          const data = d.data();
          ids.add(data.fragment_id as number);
          cache[data.fragment_id] = data;
        });
        setConqueredIds(ids);
        setCachedChapterData(cache);
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
            <ParchmentDesk 
              key={activeFragment.id} 
              volume={volume} 
              chapterIndex={chapterIndex} 
              fragment={activeFragment}
              cachedData={cachedChapterData[activeFragment.id]}
              onCacheUpdate={(fragId, data) => setCachedChapterData(prev => ({ ...prev, [fragId]: data }))}
            />
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

// ─────────────────────────────────────────────────────────────────────────────
// Self-Grade Workspace (replaces old ParchmentDesk / LaTeX-input model)
// Flow per PLAN §2:
//   "problem"  → problem displayed, "Reveal Answer" button shown
//   "revealed" → answer shown (animation stub), grade buttons shown
//   "graded"   → grade recorded, credits awarded, next/retry offered
// ─────────────────────────────────────────────────────────────────────────────

type GradePhase = "problem" | "revealed" | "graded";

const GRADE_OPTIONS: { grade: SelfGrade; label: string; icon: React.ReactNode; style: object }[] = [
  {
    grade: "correct",
    label: "Correct",
    icon: <CheckCheck size={14} strokeWidth={2.2} />,
    style: {
      color: "rgba(130,200,100,0.9)",
      background: "rgba(80,180,50,0.08)",
      border: "1px solid rgba(80,180,50,0.3)",
    },
  },
  {
    grade: "close",
    label: "Close",
    icon: <Minus size={14} strokeWidth={2.2} />,
    style: {
      color: "rgba(200,170,80,0.9)",
      background: "rgba(200,150,40,0.08)",
      border: "1px solid rgba(200,150,40,0.3)",
    },
  },
  {
    grade: "wrong",
    label: "Incorrect",
    icon: <RotateCcw size={14} strokeWidth={2} />,
    style: {
      color: "rgba(200,100,80,0.85)",
      background: "rgba(180,70,50,0.06)",
      border: "1px solid rgba(180,70,50,0.25)",
    },
  },
];

const CREDIT_MAP: Record<SelfGrade, number> = {
  correct: 100,
  close: 50,
  wrong: 0,
};

function ParchmentDesk({
  volume,
  chapterIndex,
  fragment,
  cachedData,
  onCacheUpdate,
}: {
  volume: Volume;
  chapterIndex: number;
  fragment: Fragment;
  cachedData?: any;
  onCacheUpdate: (fragId: number, data: any) => void;
}) {
  type InkwellPhase = "drafting" | "committed" | "conquered"; // kept for TS compat below

  const [gradePhase, setGradePhase] = useState<GradePhase>("problem");
  const [chosenGrade, setChosenGrade] = useState<SelfGrade | null>(null);
  const [isAlreadyConquered, setIsAlreadyConquered] = useState(false);
  const archiveRef = useRef<HTMLDivElement>(null);
  const { isGuestMode, scholar } = useAuth();
  const { isLightMode } = useTheme();
  const { addCredits } = useProgress();

  // ── Hydration: check if already conquered ──────────────────────────────────
  useEffect(() => {
    setGradePhase("problem");
    setChosenGrade(null);
    setIsAlreadyConquered(false);

    if (cachedData) {
      setIsAlreadyConquered(true);
      setChosenGrade((cachedData.grade as SelfGrade) ?? "correct");
      setGradePhase("graded");
      return;
    }

    if (isGuestMode || !scholar) return;

    let isMounted = true;
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, "users", scholar.uid, "grimoire", String(fragment.id));
        const snap = await getDoc(docRef);
        if (!isMounted) return;
        if (snap.exists()) {
          const data = snap.data();
          onCacheUpdate(fragment.id, data);
          setIsAlreadyConquered(true);
          setChosenGrade((data.grade as SelfGrade) ?? "correct");
          setGradePhase("graded");
        }
      } catch {
        // silently ignore
      }
    };
    fetchDoc();
    return () => { isMounted = false; };
  }, [fragment.id, isGuestMode, scholar]);

  // ── Scroll answer into view when revealed ─────────────────────────────────
  useEffect(() => {
    if (gradePhase === "revealed" && archiveRef.current) {
      setTimeout(() => archiveRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 200);
    }
  }, [gradePhase]);

  // ── Grade handler ─────────────────────────────────────────────────────────
  const handleGrade = useCallback(async (grade: SelfGrade) => {
    setChosenGrade(grade);
    setGradePhase("graded");
    addCredits(grade);

    if (isGuestMode || !auth.currentUser) return;
    try {
      const docRef = doc(db, "users", auth.currentUser.uid, "grimoire", String(fragment.id));
      await setDoc(docRef, {
        fragment_id: fragment.id,
        volume:      volume.id,
        chapter:     chapterIndex,
        grade,
        sealed_at:   serverTimestamp(),
      }, { merge: true });
      onCacheUpdate(fragment.id, { grade, fragment_id: fragment.id, volume: volume.id, chapter: chapterIndex });
      window.dispatchEvent(new Event("grimoire-updated"));
    } catch {
      // silently ignore
    }
  }, [isGuestMode, fragment.id, volume.id, chapterIndex, addCredits]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setGradePhase("problem");
    setChosenGrade(null);
    setIsAlreadyConquered(false);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

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

        <div className="relative px-8 py-10 md:px-12 md:py-12 z-10">
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

          {/* ── PROBLEM ── */}
          <section className="mt-8 mb-8" aria-label="Mathematical problem">
            <p
              className="math-box-label uppercase tracking-widest mb-5 text-stone-500"
              style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem" }}
            >
              Problem
            </p>
            <div
              className={`math-box py-12 px-6 text-center border rounded-sm transition-colors duration-300 ${
                isLightMode ? "bg-white border-stone-200" : "bg-black/50 border-stone-800"
              }`}
            >
              <MathRenderer className="[&_.katex]:text-[2.2rem] [&_.katex-display]:my-0 text-stone-200">
                {`$$\n${fragment.problem_latex}\n$$`}
              </MathRenderer>
            </div>
          </section>

          {/* ── ANSWER SECTION ── */}
          <section aria-label="Answer reveal and grading">

            {/* Phase: problem — Reveal button */}
            {gradePhase === "problem" && (
              <div className="flex justify-center mt-2 mb-4">
                <button
                  id={`reveal-${fragment.id}`}
                  onClick={() => setGradePhase("revealed")}
                  className="group flex items-center gap-2.5 px-8 py-3 text-xs uppercase tracking-[0.22em] transition-all duration-200 active:scale-95"
                  style={{
                    fontFamily: "Georgia, serif",
                    background: isLightMode
                      ? "linear-gradient(135deg, #ffffff 0%, #f4f0ea 100%)"
                      : "linear-gradient(135deg, #1a1208 0%, #0f0c06 100%)",
                    border: isLightMode
                      ? "1px solid rgba(200,146,42,0.5)"
                      : "1px solid rgba(200,146,42,0.3)",
                    borderRadius: "2px",
                    color: isLightMode ? "#966812" : "rgba(200,146,42,0.9)",
                    boxShadow: isLightMode
                      ? "0 2px 5px rgba(0,0,0,0.05)"
                      : "0 0 20px rgba(200,146,42,0.08), inset 0 1px 0 rgba(255,220,100,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = isLightMode ? "#44403c" : "rgba(220,175,80,0.95)";
                    e.currentTarget.style.borderColor = "rgba(200,146,42,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isLightMode ? "#966812" : "rgba(200,146,42,0.9)";
                    e.currentTarget.style.borderColor = isLightMode ? "rgba(200,146,42,0.5)" : "rgba(200,146,42,0.3)";
                  }}
                  aria-label="Reveal the answer"
                >
                  <BookMarked size={14} strokeWidth={1.8} />
                  Reveal Answer
                </button>
              </div>
            )}

            {/* Phase: revealed or graded — show answer */}
            {(gradePhase === "revealed" || gradePhase === "graded") && (
              <div
                ref={archiveRef}
                className="overflow-hidden"
                style={{ animation: "inkwell-unfurl 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
              >
                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="flex-1 h-px"
                    style={{ background: "linear-gradient(to right, transparent, rgba(200,146,42,0.25))" }}
                    aria-hidden="true"
                  />
                  <p
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "0.58rem",
                      letterSpacing: "0.32em",
                      color: "rgba(200,146,42,0.6)",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    The Archive&apos;s Solution
                  </p>
                  <div
                    className="flex-1 h-px"
                    style={{ background: "linear-gradient(to left, transparent, rgba(200,146,42,0.25))" }}
                    aria-hidden="true"
                  />
                </div>

                {/* Answer box */}
                <div
                  className="px-6 py-8 text-center mb-6"
                  style={{
                    background: isLightMode
                      ? "linear-gradient(160deg, #ffffff 0%, #f4f0ea 100%)"
                      : "linear-gradient(160deg, #110e09 0%, #0c0a07 100%)",
                    border: isLightMode
                      ? "1px solid #d1d5db"
                      : "1px solid rgba(200,146,42,0.18)",
                    borderRadius: "2px",
                    boxShadow: isLightMode
                      ? "0 2px 5px rgba(0,0,0,0.05)"
                      : "0 0 40px rgba(200,146,42,0.04), inset 0 1px 0 rgba(200,146,42,0.06)",
                  }}
                >
                  <MathRenderer className="[&_.katex]:text-3xl text-amber-100/85 [&_.katex-display]:my-0">
                    {`$$${fragment.solution_latex}$$`}
                  </MathRenderer>
                  {fragment.solution_raw && (
                    <p
                      className="mt-3"
                      style={{
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: "0.68rem",
                        color: "rgba(150,130,90,0.45)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {fragment.solution_raw}
                    </p>
                  )}
                </div>

                {/* ── GRADING PROMPT ── */}
                {gradePhase === "revealed" && (
                  <div className="flex flex-col items-center gap-4">
                    <p
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "0.78rem",
                        color: isLightMode ? "#78716c" : "rgba(168,155,128,0.65)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Did you get this right?
                    </p>

                    <div className="flex items-center gap-3">
                      {GRADE_OPTIONS.map(({ grade, label, icon, style }) => (
                        <button
                          key={grade}
                          id={`grade-${grade}-${fragment.id}`}
                          onClick={() => handleGrade(grade)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-sm uppercase tracking-widest transition-all duration-150 active:scale-95"
                          style={{
                            fontFamily: "Georgia, serif",
                            fontSize: "0.62rem",
                            letterSpacing: "0.15em",
                            ...style,
                          }}
                          aria-label={`Grade as ${label}`}
                        >
                          {icon}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── GRADED result ── */}
                {gradePhase === "graded" && chosenGrade !== null && (
                  <div
                    className="flex flex-col items-center gap-4"
                    style={{ animation: "inkwell-unfurl 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}
                    role="status"
                  >
                    {/* Grade badge */}
                    <div
                      className="flex items-center gap-3 px-6 py-3 rounded-sm"
                      style={{
                        ...(GRADE_OPTIONS.find((g) => g.grade === chosenGrade)?.style ?? {}),
                      }}
                    >
                      {GRADE_OPTIONS.find((g) => g.grade === chosenGrade)?.icon}
                      <span
                        style={{
                          fontFamily: "Georgia, serif",
                          fontSize: "0.72rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                        }}
                      >
                        {chosenGrade === "correct" ? "Fragment Conquered" :
                         chosenGrade === "close"   ? "Partial Credit" :
                         "Needs More Work"}
                      </span>
                    </div>

                    {/* Credit award */}
                    {!isAlreadyConquered && CREDIT_MAP[chosenGrade] > 0 && (
                      <p
                        className="tracking-widest uppercase"
                        style={{
                          fontFamily: "'Courier New', monospace",
                          fontSize: "0.68rem",
                          color: "rgba(200,146,42,0.7)",
                        }}
                      >
                        +{CREDIT_MAP[chosenGrade].toLocaleString()} Credits
                      </p>
                    )}

                    {/* Retry / re-grade controls */}
                    <div className="flex items-center gap-3 mt-2">
                      {!isAlreadyConquered && (
                        <button
                          id={`regrade-${fragment.id}`}
                          onClick={() => setGradePhase("revealed")}
                          className="flex items-center gap-2 px-4 py-2 rounded-sm uppercase tracking-widest transition-all duration-150"
                          style={{
                            fontFamily: "Georgia, serif",
                            fontSize: "0.58rem",
                            color: isLightMode ? "#78716c" : "rgba(150,138,115,0.65)",
                            background: "transparent",
                            border: isLightMode ? "1px solid #e5e7eb" : "1px solid rgba(60,55,45,0.8)",
                          }}
                        >
                          Re-grade
                        </button>
                      )}
                      <button
                        id={`retry-${fragment.id}`}
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-4 py-2 rounded-sm uppercase tracking-widest transition-all duration-150"
                        style={{
                          fontFamily: "Georgia, serif",
                          fontSize: "0.58rem",
                          color: isLightMode ? "#78716c" : "rgba(150,138,115,0.65)",
                          background: "transparent",
                          border: isLightMode ? "1px solid #e5e7eb" : "1px solid rgba(60,55,45,0.8)",
                        }}
                      >
                        <RotateCcw size={11} strokeWidth={2} />
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
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
