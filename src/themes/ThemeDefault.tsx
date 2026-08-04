"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import { useTheme } from "@/context/ThemeContext";
import { useProgress, type SelfGrade } from "@/context/ProgressContext";
import { useWorkspaceLogic } from "@/hooks/useWorkspaceLogic";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Feather,
  CheckCheck,
  RotateCcw,
  BookMarked,
  Minus,
  Archive,
  BookOpen,
  ShoppingBag,
} from "lucide-react";
import { VOLUMES, type Volume, type Chapter, type Fragment } from "@/data/codex-data";
import LibraryView from "@/components/LibraryView";
import ShopLayout from "@/components/ShopLayout";
import { AppArea } from "@/components/ThemeRoot";

// ─────────────────────────────────────────────────────────────────────────────
// Bottom Dock
// ─────────────────────────────────────────────────────────────────────────────

interface DockItem {
  area: AppArea;
  label: string;
  Icon: React.ElementType;
}

const DOCK_ITEMS: DockItem[] = [
  { area: "shop",    label: "Store",   Icon: ShoppingBag },
  { area: "archive", label: "Archive", Icon: Archive      },
  { area: "library", label: "Library", Icon: BookOpen     },
];

function BottomDock({
  active,
  onSelect,
  onOpenProfile,
}: {
  active: AppArea;
  onSelect: (area: AppArea) => void;
  onOpenProfile?: () => void;
}) {
  const { isLightMode } = useTheme();
  const inactiveColor = isLightMode ? "rgba(100,90,75,0.6)" : "rgba(130,118,98,0.5)";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-0 px-2 py-2 pb-safe"
      style={{
        background: isLightMode
          ? "rgba(252,250,247,0.92)"
          : "rgba(10,7,5,0.88)",
        backdropFilter: "blur(12px)",
        borderTop: isLightMode
          ? "1px solid color-mix(in srgb, var(--codex-accent) 12%, transparent)"
          : "1px solid color-mix(in srgb, var(--codex-accent) 10%, transparent)",
      }}
      aria-label="Primary navigation"
    >
      {DOCK_ITEMS.map(({ area, label, Icon }) => {
        const isActive = active === area;
        return (
          <button
            key={area}
            id={`dock-${area}`}
            onClick={() => onSelect(area)}
            className="flex flex-col items-center gap-1 px-8 py-2 transition-all duration-200"
            style={{
              color: isActive
                ? "color-mix(in srgb, var(--codex-accent) 95%, transparent)"
                : inactiveColor,
            }}
            aria-label={`Go to ${label}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              size={isActive ? 19 : 17}
              strokeWidth={isActive ? 1.8 : 1.4}
              className="transition-all duration-200"
            />
            <span
              className="uppercase tracking-widest"
              style={{ fontFamily: "Georgia, serif", fontSize: "0.5rem" }}
            >
              {label}
            </span>
            {isActive && (
              <div
                className="absolute bottom-1 w-1 h-1 rounded-full"
                style={{ background: "color-mix(in srgb, var(--codex-accent) 80%, transparent)" }}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
      {/* Profile button */}
      {onOpenProfile && (
        <button
          id="dock-profile"
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-1 px-8 py-2 transition-all duration-200"
          style={{ color: inactiveColor }}
          aria-label="Open profile"
        >
          <Feather size={17} strokeWidth={1.4} className="transition-all duration-200" />
          <span className="uppercase tracking-widest" style={{ fontFamily: "Georgia, serif", fontSize: "0.5rem" }}>Profile</span>
        </button>
      )}
    </nav>
  );
}

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

function lightenHex(hex: string, amt: number): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${clamp(r + amt)},${clamp(g + amt)},${clamp(b + amt)})`;
}

const pad3 = (n: number) => String(n).padStart(3, "0");

// ─────────────────────────────────────────────────────────────────────────────
// App-level state discriminated union
// ─────────────────────────────────────────────────────────────────────────────

type AppView =
  | { screen: "shelf" }
  | { screen: "chapters"; volume: Volume }
  | { screen: "book-reader"; volume: Volume; chapterIndex: number; spreadIndex: number }
  | { screen: "chapter-end"; volume: Volume; chapterIndex: number };

// ─────────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────────

function GoldRule({ color = "var(--codex-accent)" }: { color?: string }) {
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

function MathRenderer({ children, className }: { children: string; className?: string }) {
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

function SceneBackground({ volume, children }: { volume?: Volume; children: React.ReactNode }) {
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
  const { ownedItems } = useProgress();
  const baseVolumes = ["alpha", "delta", "sigma", "gamma"];
  const visibleVolumes = VOLUMES.filter(v => baseVolumes.includes(v.id) || ownedItems.has(v.id));

  return (
    <SceneBackground>
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-64"
        style={{
          background: "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(180,110,20,0.18) 0%, transparent 80%)",
        }}
        aria-hidden="true"
      />
      <header className="z-10 text-center mb-20 select-none mt-8">
        <p className="text-amber-700/50 mb-4 tracking-[0.55em] uppercase" style={{ fontSize: "0.62rem", fontFamily: "Georgia, serif" }}>
          The Grand Archive
        </p>
        <h1
          className="text-amber-100/85 font-light"
          style={{
            fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "0.08em",
          }}
        >
          Codex Mathematica
        </h1>
        <div className="mt-5 mx-auto" style={{ maxWidth: "220px" }}>
          <GoldRule />
        </div>
        <p className="mt-5 text-stone-500/70 italic" style={{ fontFamily: "Georgia, serif", fontSize: "0.83rem" }}>
          Select a volume to begin your study
        </p>
      </header>
      <div className="z-10 flex flex-col md:flex-row items-center justify-center md:items-end flex-wrap gap-6 sm:gap-8 lg:gap-10 px-2 pb-12 md:pb-0" role="list">
        {visibleVolumes.map((vol) => (
          <BookSpine key={vol.id} volume={vol} onSelect={onSelect} />
        ))}
      </div>
      <div className="z-10 mt-auto pt-16 pb-8 md:pb-12 text-center max-w-xl px-4">
        <p className={`italic ${isLightMode ? "text-stone-500" : "text-stone-500/70"}`} style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem", lineHeight: "1.6" }}>
          "{getDailyQuote().text}"
        </p>
        <p className={`mt-3 uppercase tracking-[0.2em] ${isLightMode ? "text-stone-400" : "text-stone-600"}`} style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem" }}>
          &mdash; {getDailyQuote().author}
        </p>
      </div>
      {!isLightMode && (
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 z-0"
          style={{
            height: "56px",
            background: "linear-gradient(to top, #0d0803 0%, #18100a 60%, transparent 100%)",
            boxShadow: "0 -6px 40px rgba(0,0,0,0.8)",
          }}
          aria-hidden="true"
        />
      )}
    </SceneBackground>
  );
}

function BookSpine({ volume, onSelect }: { volume: Volume; onSelect: (v: Volume) => void }) {
  const [hovered, setHovered] = useState(false);
  const { isLightMode } = useTheme();
  return (
    <div role="listitem">
      <button
        onClick={() => onSelect(volume)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="relative block focus:outline-none"
        style={{
          transform: hovered ? "translateY(-24px) rotate(-1.5deg)" : "translateY(0) rotate(0deg)",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div
          className="relative rounded-sm md:rounded-[2px_5px_5px_2px] w-[260px] h-[85px] md:w-[clamp(70px,12vw,116px)] md:h-[clamp(185px,32vw,285px)]"
          style={{
            background: isLightMode 
              ? `linear-gradient(160deg, #ffffff 0%, ${volume.leather}10 35%, #fcfaf7 100%)`
              : `linear-gradient(160deg, ${lightenHex(volume.leather, 18)} 0%, ${volume.leather} 35%, ${lightenHex(volume.leather, 8)} 60%, ${lightenHex(volume.leather, -8)} 100%)`,
            boxShadow: isLightMode
              ? hovered ? `3px 8px 25px rgba(0,0,0,0.1), 0 0 15px ${volume.accent}15` : `1px 4px 15px rgba(0,0,0,0.05)`
              : hovered ? `5px 16px 60px rgba(0,0,0,0.95), 0 0 35px ${volume.accent}28, inset -4px 0 10px rgba(0,0,0,0.55), inset 3px 0 7px rgba(255,255,255,0.05)`
              : `3px 10px 35px rgba(0,0,0,0.85), inset -3px 0 8px rgba(0,0,0,0.45), inset 2px 0 5px rgba(255,255,255,0.03)`,
            transition: "box-shadow 0.4s ease",
          }}
        >
          <div
            className="absolute top-0 bottom-0 left-0 w-3 md:w-[14px] rounded-l-sm md:rounded-l-[2px]"
            style={{
              background: isLightMode ? "linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.02))" : "linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.1))",
              borderRight: `1px solid ${volume.accent}18`,
            }}
          />
          {[18, "bottom", 18].map((pos, idx) =>
            idx < 2 ? (
              <div
                key={idx}
                className={`absolute left-[18px] right-[10px] h-px hidden md:block ${idx === 0 ? "top-[18px]" : "bottom-[18px]"}`}
                style={{ background: `linear-gradient(to right, ${volume.accent}90, ${volume.accent}20)` }}
              />
            ) : null
          )}
          <div
            className="absolute inset-0 flex items-center justify-center -translate-x-[40%] md:translate-x-0 md:-translate-y-[10px]"
            style={{
              fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
              fontSize: "clamp(2rem, 5vw, 3.8rem)",
              color: volume.accent,
              opacity: hovered ? 1 : 0.75,
              textShadow: `0 0 24px ${volume.accent}55`,
              transition: "opacity 0.4s ease",
            }}
          >
            {volume.symbol}
          </div>
          <div
            className="absolute right-6 top-[22px] md:top-auto md:bottom-[26px] md:left-0 md:right-0 md:text-center text-right"
            style={{ fontFamily: "Georgia, serif", fontSize: "clamp(0.48rem, 1vw, 0.66rem)", letterSpacing: "0.28em", textTransform: "uppercase", color: volume.bookText, opacity: 0.65 }}
          >
            {volume.name}
          </div>
        </div>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 2 — Table of Contents (ChapterTOC)
// ─────────────────────────────────────────────────────────────────────────────

function ChapterTOC({ volume, onSelectChapter, onClose }: { volume: Volume; onSelectChapter: (idx: number) => void; onClose: () => void }) {
  const { isLightMode } = useTheme();
  const { ownedItems } = useProgress();
  return (
    <SceneBackground volume={volume}>
      <nav className="w-full max-w-2xl z-10 mb-6"><BackButton onClick={onClose} label="Return to the Archive" /></nav>
      <div className="w-full max-w-2xl z-10 flex-1 flex flex-col items-center">
        <div 
          className="w-full rounded-[2px_12px_12px_2px] relative overflow-hidden transition-all duration-700 p-10 md:p-16"
          style={{
            background: isLightMode 
              ? `linear-gradient(160deg, #ffffff 0%, ${volume.leather}10 35%, #fcfaf7 100%)`
              : `linear-gradient(160deg, ${volume.leather} 0%, #1a1614 100%)`,
            border: `1px solid ${volume.accent}40`,
            boxShadow: isLightMode ? "0 10px 40px rgba(0,0,0,0.08)" : "0 25px 60px rgba(0,0,0,0.9), inset 2px 0 10px rgba(255,255,255,0.05)",
          }}
        >
          <div className="absolute top-0 bottom-0 left-0 w-8" style={{ background: isLightMode ? "linear-gradient(to right, rgba(0,0,0,0.1), transparent)" : "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.1))", borderRight: `1px solid ${volume.accent}30` }} />
          
          <header className="relative z-10 text-center mb-16 mt-4">
            <div className="mb-4 leading-none select-none mx-auto flex justify-center" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "4.5rem", color: volume.accent, textShadow: `0 0 40px ${volume.accent}50` }}>
              {volume.symbol}
            </div>
            <div className="flex items-center justify-center gap-4 mb-5">
               <div className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${volume.accent})` }} />
               <p className="uppercase tracking-[0.25em]" style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: isLightMode ? "#78716c" : "rgba(220,200,160,0.7)" }}>Volume {volume.name}</p>
               <div className="w-12 h-px" style={{ background: `linear-gradient(to left, transparent, ${volume.accent})` }} />
            </div>
            <h2 className="font-light" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "2.8rem", letterSpacing: "0.05em", color: isLightMode ? "#292524" : "#f5ebd7" }}>
              {volume.subtitle}
            </h2>
            <div className="mt-8 mx-auto w-full max-w-[280px]"><GoldRule color={volume.accent} /></div>
          </header>
          
          <main className="relative z-10 max-w-lg mx-auto">
            <div className="flex flex-col gap-2">
              {volume.chapters.map((chapter, idx) => {
                if (chapter.packId && !ownedItems.has(chapter.packId)) return null;
                return (
                  <ChapterTOCRow key={idx} chapter={chapter} index={idx} volume={volume} onSelect={() => onSelectChapter(idx)} />
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </SceneBackground>
  );
}

function ChapterTOCRow({ chapter, index, volume, onSelect }: { chapter: Chapter; index: number; volume: Volume; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const { isLightMode } = useTheme();
  const { getGrimoireGrade } = useProgress();

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full text-left group focus:outline-none relative transition-all duration-300 rounded-md overflow-hidden cursor-pointer"
    >
      <div 
        className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${hovered ? 'opacity-100' : 'opacity-0'}`} 
        style={{ background: isLightMode ? `linear-gradient(90deg, transparent, ${volume.accent}15, transparent)` : `linear-gradient(90deg, transparent, ${volume.accent}20, transparent)` }} 
      />
      <div className="flex items-center justify-between py-4 px-6 relative z-10">
        <div className="flex flex-col">
           <div className="flex items-center gap-3">
             <p className="uppercase tracking-widest transition-colors duration-300" style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: hovered ? volume.accent : (isLightMode ? "#78716c" : "rgba(200,180,140,0.6)") }}>CHAPTER {toRoman(index)}</p>
             {chapter.packId && (
               <span className="px-1.5 py-0.5 rounded text-[0.55rem] font-bold tracking-widest bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                 EXPANSION
               </span>
             )}
           </div>
           <p className="mt-1 transition-all duration-300" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "1.25rem", color: hovered ? (isLightMode ? volume.accent : "#fff") : (isLightMode ? "#44403c" : "rgba(220,210,190,0.9)"), textShadow: hovered && !isLightMode ? `0 0 15px ${volume.accent}60` : 'none', transform: hovered ? 'translateX(4px)' : 'none' }}>{chapter.theme}</p>
        </div>
        <div className="flex flex-col items-end justify-center gap-2">
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
             {chapter.fragments.map(frag => {
               const grade = getGrimoireGrade(frag.id);
               const indicator = grade ? GRADE_INDICATOR[grade] : { bg: isLightMode ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)", shadow: "none" };
               return (
                 <div key={frag.id} style={{ width: "6px", height: "6px", borderRadius: "50%", background: indicator.bg, boxShadow: hovered ? indicator.shadow : 'none' }} />
               );
             })}
          </div>
          {(() => {
            const completedCount = chapter.fragments.filter(f => getGrimoireGrade(f.id)).length;
            const total = chapter.fragments.length;
            return completedCount > 0 ? (
              <span className="text-[0.65rem] font-mono tracking-widest" style={{ color: isLightMode ? "#a8a29e" : "#57534e" }}>
                {completedCount}/{total} COMPLETE
              </span>
            ) : null;
          })()}
        </div>
      </div>
      <div className="w-full h-px opacity-30 mt-1" style={{ background: hovered ? `linear-gradient(to right, transparent, ${volume.accent}, transparent)` : `linear-gradient(to right, ${volume.accent}40, transparent)` }} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 3 — Book Reader (2-Page Spread)
// ─────────────────────────────────────────────────────────────────────────────

const GRADE_INDICATOR: Record<SelfGrade, { bg: string; shadow: string }> = {
  correct: { bg: "rgba(110,200,80,0.8)",  shadow: "0 0 6px rgba(110,200,80,0.6), 0 0 14px rgba(80,180,50,0.3)" },
  close:   { bg: "rgba(200,160,50,0.75)", shadow: "0 0 6px rgba(200,150,40,0.55), 0 0 12px rgba(180,130,30,0.25)" },
  wrong:   { bg: "rgba(200,80,60,0.55)",  shadow: "0 0 6px rgba(180,60,40,0.4), 0 0 10px rgba(160,40,20,0.15)" },
};

function BookReader({ volume, chapterIndex, initialSpreadIndex, onBack, onComplete }: { volume: Volume; chapterIndex: number; initialSpreadIndex: number; onBack: () => void; onComplete: () => void; }) {
  const chapter = volume.chapters[chapterIndex];
  const numSpreads = Math.ceil(chapter.fragments.length / 2);
  const [currentIndex, setCurrentIndex] = useState(initialSpreadIndex);
  const [animState, setAnimState] = useState<{ type: 'next' | 'prev', fromIndex: number, toIndex: number } | null>(null);
  const { isLightMode } = useTheme();
  const { getGrimoireGrade } = useProgress();

  const handleNext = () => {
    if (animState) return;
    if (currentIndex < numSpreads - 1) {
      setAnimState({ type: 'next', fromIndex: currentIndex, toIndex: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => {
        setAnimState(null);
      }, 350);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (animState) return;
    if (currentIndex > 0) {
      setAnimState({ type: 'prev', fromIndex: currentIndex, toIndex: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
      setTimeout(() => {
        setAnimState(null);
      }, 350);
    } else {
      onBack();
    }
  };

  const handleJump = (index: number) => {
    if (animState || index === currentIndex) return;
    setCurrentIndex(index);
  }

  // Calculate fragments for static pages
  const currentLeftFrag = chapter.fragments[currentIndex * 2];
  const currentRightFrag = chapter.fragments[currentIndex * 2 + 1];

  let staticLeftFrag = currentLeftFrag;
  let staticRightFrag = currentRightFrag;
  let flipper = null;

  if (animState) {
    const isNext = animState.type === 'next';
    const oldLeftFrag = chapter.fragments[animState.fromIndex * 2];
    const oldRightFrag = chapter.fragments[animState.fromIndex * 2 + 1];
    
    if (isNext) {
      flipper = (
        <div className="absolute right-0 top-0 bottom-0 w-1/2 book-page-flipper right anim-flip-next z-20">
           <div className="book-page-face">
              {oldRightFrag ? <FragmentPage volume={volume} chapterIndex={chapterIndex} fragment={oldRightFrag} isLeftPage={false} /> : <BlankPage volume={volume} isLeftPage={false} />}
           </div>
           <div className="book-page-face back">
              {currentLeftFrag ? <FragmentPage volume={volume} chapterIndex={chapterIndex} fragment={currentLeftFrag} isLeftPage={true} /> : <BlankPage volume={volume} isLeftPage={true} />}
           </div>
        </div>
      );
    } else {
      flipper = (
        <div className="absolute left-0 top-0 bottom-0 w-1/2 book-page-flipper left anim-flip-prev z-20">
           <div className="book-page-face">
              {oldLeftFrag ? <FragmentPage volume={volume} chapterIndex={chapterIndex} fragment={oldLeftFrag} isLeftPage={true} /> : <BlankPage volume={volume} isLeftPage={true} />}
           </div>
           <div className="book-page-face back">
              {currentRightFrag ? <FragmentPage volume={volume} chapterIndex={chapterIndex} fragment={currentRightFrag} isLeftPage={false} /> : <BlankPage volume={volume} isLeftPage={false} />}
           </div>
        </div>
      );
    }
  }

  return (
    <SceneBackground volume={volume}>
      <nav className="w-full max-w-[1200px] z-10 flex items-center justify-between mb-4 px-8">
        <BackButton onClick={onBack} label="Back to Contents" />
        <p className="text-right uppercase tracking-[0.2em] truncate" style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem", color: volume.accent, opacity: 0.7 }}>
          Spread {currentIndex + 1} of {numSpreads}
        </p>
      </nav>

      <div className="w-full max-w-[1200px] flex-1 flex relative z-10 items-stretch justify-center py-4">
        {/* Large Outside Prev Arrow */}
        <button onClick={handlePrev} className="self-center p-4 mr-4 flex-shrink-0 text-stone-500 hover:text-amber-200 hover:-translate-x-1 transition-all focus:outline-none disabled:opacity-30 disabled:hover:translate-x-0 disabled:hover:text-stone-500" disabled={!!animState && currentIndex === 0}>
           <ChevronLeft size={48} strokeWidth={1} />
        </button>

        {/* The 3D Book Container */}
        <div className={`w-full flex-1 relative book-spine max-w-5xl ${animState ? 'is-flipping' : ''}`}>
           {/* Static Left Page */}
           <div className="absolute left-0 top-0 bottom-0 w-1/2 pr-[1px]">
              {staticLeftFrag ? <FragmentPage volume={volume} chapterIndex={chapterIndex} fragment={staticLeftFrag} isLeftPage={true} /> : <BlankPage volume={volume} isLeftPage={true} />}
           </div>
           
           {/* Static Right Page */}
           <div className="absolute right-0 top-0 bottom-0 w-1/2 pl-[1px]">
              {staticRightFrag ? <FragmentPage volume={volume} chapterIndex={chapterIndex} fragment={staticRightFrag} isLeftPage={false} /> : <BlankPage volume={volume} isLeftPage={false} />}
           </div>

           {flipper}
        </div>

        {/* Large Outside Next Arrow */}
        <button onClick={handleNext} className="self-center p-4 ml-4 flex-shrink-0 text-stone-500 hover:text-amber-200 hover:translate-x-1 transition-all focus:outline-none disabled:opacity-30 disabled:hover:translate-x-0 disabled:hover:text-stone-500" disabled={!!animState && currentIndex === numSpreads - 1}>
           <ChevronRight size={48} strokeWidth={1} />
        </button>
      </div>

      {/* Progress Dots Footer */}
      <div className="flex-shrink-0 flex items-center justify-center py-6 px-4 h-20 w-full z-10">
          <div className="flex flex-wrap items-center justify-center gap-6 max-w-[60%]">
             {Array.from({ length: numSpreads }).map((_, spreadIdx) => {
               const fragL = chapter.fragments[spreadIdx * 2];
               const fragR = chapter.fragments[spreadIdx * 2 + 1];
               const isActive = spreadIdx === currentIndex;
               return (
                 <div key={spreadIdx} className={`flex items-center gap-1.5 p-1.5 rounded-full cursor-pointer transition-all hover:scale-110 ${isActive ? 'bg-white/5' : ''}`} onClick={() => handleJump(spreadIdx)} style={{ border: isActive ? `1px solid ${volume.accent}40` : '1px solid transparent' }}>
                   {[fragL, fragR].map((frag, i) => {
                     if (!frag) return <div key={i} className="w-2 h-2" />; // placeholder
                     const grade = getGrimoireGrade(frag.id);
                     const indicator = grade ? GRADE_INDICATOR[grade] : { bg: isLightMode ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)", shadow: "none" };
                     return (
                       <div 
                         key={frag.id} 
                         style={{ 
                           width: "7px", height: "7px", borderRadius: "50%",
                           background: indicator.bg, 
                           boxShadow: indicator.shadow,
                           opacity: isActive ? 1 : 0.6
                         }} 
                       />
                     );
                   })}
                 </div>
               );
             })}
          </div>
      </div>
    </SceneBackground>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fragment Page & Blank Page
// ─────────────────────────────────────────────────────────────────────────────

const GRADE_OPTIONS: { grade: SelfGrade; label: string; icon: React.ReactNode; style: React.CSSProperties }[] = [
  { grade: "correct", label: "Correct", icon: <CheckCheck size={14} strokeWidth={2.2} />, style: { color: "rgba(130,200,100,0.9)", background: "rgba(80,180,50,0.08)", border: "1px solid rgba(80,180,50,0.3)" } },
  { grade: "close", label: "Close", icon: <Minus size={14} strokeWidth={2.2} />, style: { color: "rgba(200,170,80,0.9)", background: "rgba(200,150,40,0.08)", border: "1px solid rgba(200,150,40,0.3)" } },
  { grade: "wrong", label: "Incorrect", icon: <RotateCcw size={14} strokeWidth={2} />, style: { color: "rgba(200,100,80,0.85)", background: "rgba(180,70,50,0.06)", border: "1px solid rgba(180,70,50,0.25)" } },
];

const CREDIT_MAP: Record<SelfGrade, number> = { correct: 100, close: 50, wrong: 0 };

function BlankPage({ volume, isLeftPage }: { volume: Volume; isLeftPage: boolean }) {
  const { isLightMode } = useTheme();
  const radius = isLeftPage ? "12px 2px 2px 12px" : "2px 12px 12px 2px";
  const spineGradient = isLeftPage
    ? { right: 0, bg: isLightMode ? "linear-gradient(to left, rgba(0,0,0,0.05), transparent)" : "linear-gradient(to left, rgba(0,0,0,0.6), transparent)", border: `1px solid ${volume.accent}20` }
    : { left: 0, bg: isLightMode ? "linear-gradient(to right, rgba(0,0,0,0.05), transparent)" : "linear-gradient(to right, rgba(0,0,0,0.6), transparent)", border: `1px solid ${volume.accent}20` };

  return (
    <article className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden" style={{ borderRadius: radius, background: isLightMode ? "#fcfaf7" : "#0f0d0b", border: isLightMode ? "1px solid #e5e7eb" : "1px solid #292524", boxShadow: isLightMode ? "0 4px 12px rgba(0,0,0,0.03)" : "0 20px 40px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02)" }}>
       <div className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.05] z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat" }} aria-hidden="true" />
       <div className="pointer-events-none absolute top-0 bottom-0 w-8 z-10" style={{ [isLeftPage ? 'right' : 'left']: 0, background: spineGradient.bg, [isLeftPage ? 'borderRight' : 'borderLeft']: spineGradient.border }} />
       <div className="opacity-[0.03] select-none" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "14rem", color: volume.accent }}>
         {volume.symbol}
       </div>
    </article>
  )
}

function FragmentPage({ volume, chapterIndex, fragment, isLeftPage }: { volume: Volume; chapterIndex: number; fragment: Fragment; isLeftPage: boolean; }) {
  const { isLightMode, activeAnimation } = useTheme();
  
  const revealClass = (() => {
    switch (activeAnimation) {
      case "anim-typewriter": return "reveal-typewriter";
      case "anim-cipher":     return "reveal-cipher";
      case "anim-receipt":    return "reveal-receipt";
      case "anim-ink-flow":   return "reveal-ink-flow";
      default:                return "";
    }
  })();
  const revealStyle = revealClass ? {} : { animation: "inkwell-unfurl 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards" };

  const { gradePhase, setGradePhase, chosenGrade, isAlreadyConquered, handleGrade, handleRetry } = useWorkspaceLogic({ volume, chapterIndex, fragment });

  const radius = isLeftPage ? "12px 2px 2px 12px" : "2px 12px 12px 2px";
  const spineGradient = isLeftPage
    ? { right: 0, bg: isLightMode ? "linear-gradient(to left, rgba(0,0,0,0.05), transparent)" : "linear-gradient(to left, rgba(0,0,0,0.6), transparent)", border: `1px solid ${volume.accent}20` }
    : { left: 0, bg: isLightMode ? "linear-gradient(to right, rgba(0,0,0,0.05), transparent)" : "linear-gradient(to right, rgba(0,0,0,0.6), transparent)", border: `1px solid ${volume.accent}20` };

  return (
     <article className="w-full h-full relative flex flex-col overflow-hidden transition-all duration-500" style={{ borderRadius: radius, background: isLightMode ? "#fcfaf7" : "#0f0d0b", border: isLightMode ? "1px solid #e5e7eb" : "1px solid #292524", boxShadow: isLightMode ? "0 4px 12px rgba(0,0,0,0.03)" : "0 20px 40px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02)" }}>
       {/* Textures */}
       <div className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.05] z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat" }} aria-hidden="true" />
       
       {/* Binding Shadow */}
       <div className="pointer-events-none absolute top-0 bottom-0 w-10 z-10" style={{ [isLeftPage ? 'right' : 'left']: 0, background: spineGradient.bg, [isLeftPage ? 'borderRight' : 'borderLeft']: spineGradient.border }} />
       
       <div className="relative z-10 flex-1 overflow-y-auto px-10 md:px-14 py-12" style={{ scrollbarWidth: "none" }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-light" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "1.1rem", color: isLightMode ? "#292524" : "#e8d5a3" }}>
               <span style={{ color: volume.accent }}>{volume.chapters[chapterIndex].theme}</span>
             </h3>
             <span className="font-serif text-lg text-stone-700/40">&sect; {pad3(fragment.id)}</span>
          </div>
          <GoldRule />
          
          {/* Problem */}
          <section className="mt-10 mb-10 flex flex-col items-center" aria-label="Mathematical problem">
            <p className="uppercase tracking-[0.4em] mb-6 text-stone-500/80" style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem" }}>Problem</p>
            <div className={`w-full max-w-full py-12 px-6 text-center border rounded-sm transition-colors duration-300 ${isLightMode ? "bg-white border-stone-200" : "bg-black/30 border-stone-800/80"}`} style={{ boxShadow: isLightMode ? "0 4px 15px rgba(0,0,0,0.02)" : "inset 0 4px 20px rgba(0,0,0,0.2)" }}>
              <MathRenderer className={`[&_.katex]:text-4xl [&_.katex-display]:my-2 overflow-x-auto overflow-y-hidden ${isLightMode ? "[&_.katex]:text-stone-900 text-stone-900" : "[&_.katex]:text-stone-200 text-stone-200"}`}>{`$$
${fragment.problem_latex}
$$`}</MathRenderer>
            </div>
          </section>

          {/* Reveal & Answer */}
          <section className="flex flex-col items-center w-full max-w-full mx-auto" aria-label="Answer reveal and grading">
            {gradePhase === "problem" && (
              <div className="my-8">
                <button
                  onClick={() => setGradePhase("revealed")}
                  className="group flex items-center gap-2.5 px-8 py-3 text-xs uppercase tracking-[0.22em] transition-all duration-200 active:scale-95"
                  style={{ fontFamily: "Georgia, serif", background: isLightMode ? "linear-gradient(135deg, #ffffff 0%, #f4f0ea 100%)" : "linear-gradient(135deg, #1a1208 0%, #0f0c06 100%)", border: isLightMode ? "1px solid color-mix(in srgb, var(--codex-accent) 50%, transparent)" : "1px solid color-mix(in srgb, var(--codex-accent) 30%, transparent)", borderRadius: "2px", color: isLightMode ? "#966812" : "color-mix(in srgb, var(--codex-accent) 90%, transparent)", boxShadow: isLightMode ? "0 2px 5px rgba(0,0,0,0.05)" : "0 0 20px color-mix(in srgb, var(--codex-accent) 8%, transparent), inset 0 1px 0 rgba(255,220,100,0.06)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = isLightMode ? "#44403c" : "rgba(220,175,80,0.95)"; e.currentTarget.style.borderColor = "color-mix(in srgb, var(--codex-accent) 60%, transparent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = isLightMode ? "#966812" : "color-mix(in srgb, var(--codex-accent) 90%, transparent)"; e.currentTarget.style.borderColor = isLightMode ? "color-mix(in srgb, var(--codex-accent) 50%, transparent)" : "color-mix(in srgb, var(--codex-accent) 30%, transparent)"; }}
                >
                  <BookMarked size={14} strokeWidth={1.8} /> Reveal Answer
                </button>
              </div>
            )}

            {(gradePhase === "revealed" || gradePhase === "graded") && (
              <div className={`w-full overflow-hidden ${revealClass}`} style={revealStyle}>
                <div className="flex items-center gap-3 mb-6 mt-4">
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--codex-accent) 25%, transparent))" }} />
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "0.5rem", letterSpacing: "0.32em", color: "color-mix(in srgb, var(--codex-accent) 60%, transparent)", textTransform: "uppercase" }}>The Solution</p>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, color-mix(in srgb, var(--codex-accent) 25%, transparent))" }} />
                </div>
                <div className="w-full py-10 px-6 text-center mb-8" style={{ background: isLightMode ? "linear-gradient(160deg, #ffffff 0%, #f4f0ea 100%)" : "linear-gradient(160deg, #110e09 0%, #0c0a07 100%)", border: isLightMode ? "1px solid #d1d5db" : "1px solid color-mix(in srgb, var(--codex-accent) 18%, transparent)", borderRadius: "2px", boxShadow: isLightMode ? "0 2px 5px rgba(0,0,0,0.05)" : "0 0 40px color-mix(in srgb, var(--codex-accent) 4%, transparent), inset 0 1px 0 color-mix(in srgb, var(--codex-accent) 6%, transparent)" }}>
                  <MathRenderer className={`[&_.katex]:text-3xl [&_.katex-display]:my-2 overflow-x-auto overflow-y-hidden ${isLightMode ? "[&_.katex]:text-stone-900 text-stone-900" : "[&_.katex]:text-amber-100/85 text-amber-100/85"}`}>{`$$${fragment.solution_latex}$$`}</MathRenderer>
                </div>

                {gradePhase === "revealed" && (
                  <div className="flex flex-col items-center gap-5 pb-10">
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.68rem", color: isLightMode ? "#78716c" : "rgba(168,155,128,0.65)", letterSpacing: "0.05em" }}>Did you get this right?</p>
                    <div className="flex flex-col 2xl:flex-row items-center gap-3">
                      {GRADE_OPTIONS.map(({ grade, label, icon, style }) => (
                        <button key={grade} onClick={() => handleGrade(grade)} className="flex items-center gap-2 px-6 py-3 rounded-sm uppercase tracking-widest transition-all duration-150 hover:-translate-y-0.5 active:scale-95" style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", letterSpacing: "0.15em", ...style }}>
                          {icon}{label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {gradePhase === "graded" && chosenGrade !== null && (
                  <div className="flex flex-col items-center gap-4 pb-10" style={{ animation: "inkwell-unfurl 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}>
                    <div className="flex items-center gap-3 px-8 py-3 rounded-sm" style={{ ...(GRADE_OPTIONS.find((g) => g.grade === chosenGrade)?.style ?? {}) }}>
                      {GRADE_OPTIONS.find((g) => g.grade === chosenGrade)?.icon}
                      <span style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                        {chosenGrade === "correct" ? "Conquered" : chosenGrade === "close" ? "Partial" : "Needs Work"}
                      </span>
                    </div>
                    {!isAlreadyConquered && CREDIT_MAP[chosenGrade] > 0 && (
                      <p className="tracking-widest uppercase" style={{ fontFamily: "'Courier New', monospace", fontSize: "0.7rem", color: "color-mix(in srgb, var(--codex-accent) 80%, transparent)" }}>+{CREDIT_MAP[chosenGrade].toLocaleString()} Credits</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {!isAlreadyConquered && (
                        <button onClick={() => setGradePhase("revealed")} className="flex items-center gap-2 px-4 py-2 rounded-sm uppercase tracking-widest transition-all duration-150 hover:bg-white/5" style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem", color: isLightMode ? "#78716c" : "rgba(150,138,115,0.8)", background: "transparent", border: isLightMode ? "1px solid #e5e7eb" : "1px solid rgba(80,75,65,0.8)" }}>Re-grade</button>
                      )}
                      <button onClick={handleRetry} className="flex items-center gap-2 px-4 py-2 rounded-sm uppercase tracking-widest transition-all duration-150 hover:bg-white/5" style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem", color: isLightMode ? "#78716c" : "rgba(150,138,115,0.8)", background: "transparent", border: isLightMode ? "1px solid #e5e7eb" : "1px solid rgba(80,75,65,0.8)" }}>
                        <RotateCcw size={12} strokeWidth={2} />Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
       </div>
       <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24 z-10" style={{ background: isLightMode ? "linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 100%)" : "linear-gradient(to top, rgba(15,13,11,0.95) 0%, transparent 100%)" }} aria-hidden="true" />
     </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 4 — Chapter End Card
// ─────────────────────────────────────────────────────────────────────────────

function ChapterEndCard({ volume, chapterIndex, onNext, onBack }: { volume: Volume; chapterIndex: number; onNext: () => void; onBack: () => void; }) {
  const chapter = volume.chapters[chapterIndex];
  const { isLightMode } = useTheme();
  const { getGrimoireGrade } = useProgress();
  
  let correct = 0, close = 0, wrong = 0, unseen = 0;
  chapter.fragments.forEach(frag => {
     const g = getGrimoireGrade(frag.id);
     if (g === 'correct') correct++;
     else if (g === 'close') close++;
     else if (g === 'wrong') wrong++;
     else unseen++;
  });

  return (
    <SceneBackground volume={volume}>
      <nav className="w-full max-w-2xl z-10 mb-6"><BackButton onClick={onBack} label="Back to Contents" /></nav>
      <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center z-10">
         <div className="text-center mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 leading-none select-none mx-auto flex justify-center" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "5rem", color: volume.accent, textShadow: `0 0 50px ${volume.accent}60` }}>
              {volume.symbol}
            </div>
            <p className="uppercase tracking-[0.4em] mb-4 text-amber-200/60" style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem" }}>Chapter {toRoman(chapterIndex)} Completed</p>
            <h2 className="font-light mb-8" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "2.5rem", color: isLightMode ? "#292524" : "#f5ebd7" }}>
              {chapter.theme}
            </h2>
            <GoldRule color={volume.accent} />
         </div>

         <div className="w-full max-w-md rounded-sm p-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150" style={{ background: isLightMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.2)", border: isLightMode ? "1px solid #d1d5db" : "1px solid rgba(80,75,65,0.5)", backdropFilter: "blur(4px)" }}>
            <p className="text-center uppercase tracking-widest mb-6 text-xs font-serif" style={{ color: isLightMode ? "#78716c" : "#78716c" }}>Performance</p>
            
            <div className="w-full h-2 rounded-full overflow-hidden flex mb-6" style={{ background: isLightMode ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)" }}>
               {correct > 0 && <div style={{ width: `${(correct/chapter.fragments.length)*100}%`, background: "rgba(110,200,80,0.8)" }} />}
               {close > 0 && <div style={{ width: `${(close/chapter.fragments.length)*100}%`, background: "rgba(200,160,50,0.8)" }} />}
               {wrong > 0 && <div style={{ width: `${(wrong/chapter.fragments.length)*100}%`, background: "rgba(200,80,60,0.8)" }} />}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center font-serif text-sm">
               <div>
                  <p style={{ color: "rgba(110,200,80,0.9)" }} className="text-2xl mb-1">{correct}</p>
                  <p className="uppercase tracking-widest text-[0.55rem]" style={{ color: isLightMode ? "#a8a29e" : "#57534e" }}>Conquered</p>
               </div>
               <div>
                  <p style={{ color: "rgba(200,160,50,0.9)" }} className="text-2xl mb-1">{close}</p>
                  <p className="uppercase tracking-widest text-[0.55rem]" style={{ color: isLightMode ? "#a8a29e" : "#57534e" }}>Close</p>
               </div>
               <div>
                  <p style={{ color: "rgba(200,80,60,0.9)" }} className="text-2xl mb-1">{wrong}</p>
                  <p className="uppercase tracking-widest text-[0.55rem]" style={{ color: isLightMode ? "#a8a29e" : "#57534e" }}>Wrong</p>
               </div>
            </div>
         </div>

         <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700 delay-300">
            {chapterIndex < volume.chapters.length - 1 && (
               <button onClick={onNext} className="group uppercase tracking-widest text-xs font-serif flex items-center gap-2 px-8 py-4 rounded-sm transition-all duration-300 hover:scale-105" style={{ background: `${volume.accent}15`, border: `1px solid ${volume.accent}50`, color: volume.accent, boxShadow: `0 0 20px ${volume.accent}10, inset 0 0 10px ${volume.accent}05` }}>
                  Proceed to Chapter {toRoman(chapterIndex + 1)} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </button>
            )}
            {chapterIndex === volume.chapters.length - 1 && (
               <div className="uppercase tracking-[0.25em] text-sm font-serif" style={{ color: volume.accent }}>
                  Volume Complete
               </div>
            )}
         </div>
      </div>
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
      style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", letterSpacing: "0.12em", color: "rgba(150,130,90,0.55)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(210,190,140,0.9)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(150,130,90,0.55)")}
    >
      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={1.8} />
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export Theme Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ThemeDefault({
  activeArea,
  onSelectArea,
  onOpenProfile,
}: {
  activeArea: AppArea;
  onSelectArea: (area: AppArea) => void;
  onOpenProfile?: () => void;
}) {
  const [view, setView] = useState<AppView>({ screen: "shelf" });

  const openVolume = useCallback((volume: Volume) => {
    setView({ screen: "chapters", volume });
  }, []);

  const openChapter = useCallback((volume: Volume, chapterIndex: number) => {
    setView({ screen: "book-reader", volume, chapterIndex, spreadIndex: 0 });
  }, []);

  const goToShelf = useCallback(() => setView({ screen: "shelf" }), []);
  const goToChapters = useCallback((volume: Volume) => setView({ screen: "chapters", volume }), []);
  const goToChapterEnd = useCallback((volume: Volume, chapterIndex: number) => setView({ screen: "chapter-end", volume, chapterIndex }), []);

  let content = null;

  if (activeArea === "library") {
    content = <LibraryView />;
  } else if (activeArea === "shop") {
    content = <ShopLayout />;
  } else {
    // archive
    if (view.screen === "shelf") content = <LibraryShelf onSelect={openVolume} />;
    else if (view.screen === "chapters") content = <ChapterTOC volume={view.volume} onSelectChapter={(idx) => openChapter(view.volume, idx)} onClose={goToShelf} />;
    else if (view.screen === "book-reader") {
      content = (
        <BookReader 
          volume={view.volume} 
          chapterIndex={view.chapterIndex} 
          initialSpreadIndex={view.spreadIndex}
          onBack={() => goToChapters(view.volume)}
          onComplete={() => goToChapterEnd(view.volume, view.chapterIndex)}
        />
      );
    } else if (view.screen === "chapter-end") {
      content = (
        <ChapterEndCard 
          volume={view.volume} 
          chapterIndex={view.chapterIndex} 
          onBack={() => goToChapters(view.volume)}
          onNext={() => openChapter(view.volume, view.chapterIndex + 1)}
        />
      );
    }
  }

  return (
    <>
      <div className="h-full overflow-y-auto pb-16">
        <div key={`${activeArea}-${view.screen}`} className="animate-in fade-in zoom-in-95 duration-500 h-full">
          {content}
        </div>
      </div>
      <BottomDock active={activeArea} onSelect={onSelectArea} onOpenProfile={onOpenProfile} />
    </>
  );
}
