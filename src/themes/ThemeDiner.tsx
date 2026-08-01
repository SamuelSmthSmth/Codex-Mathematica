"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useProgress, type SelfGrade } from "@/context/ProgressContext";
import { useWorkspaceLogic } from "@/hooks/useWorkspaceLogic";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Utensils,
  Check,
  RotateCcw,
  Minus,
  Coffee,
  Ticket,
  BookOpen,
  ShoppingBag,
  Archive,
} from "lucide-react";
import { VOLUMES, type Volume, type Chapter, type Fragment } from "@/data/codex-data";
import { AppArea } from "@/components/ThemeRoot";
import LibraryView from "@/components/LibraryView";
import ShopLayout from "@/components/ShopLayout";

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────

type AppView =
  | { screen: "shelf" }
  | { screen: "chapters"; volume: Volume }
  | { screen: "split-ledger"; volume: Volume; chapterIndex: number; initialSpreadIndex: number };

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
// Diner Background (Checkered Tablecloth)
// ─────────────────────────────────────────────────────────────────────────────

function DinerBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center py-10 px-4 relative overflow-hidden"
      style={{
        background: "#fff", // base white
        backgroundImage: `
          repeating-linear-gradient(45deg, #cc2929 25%, transparent 25%, transparent 75%, #cc2929 75%, #cc2929),
          repeating-linear-gradient(45deg, #cc2929 25%, #fff 25%, #fff 75%, #cc2929 75%, #cc2929)
        `, // Red and white classic checkered pattern
        backgroundPosition: "0 0, 40px 40px",
        backgroundSize: "80px 80px",
      }}
    >
      {/* Grimy / moody vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/80 pointer-events-none mix-blend-overlay" />
      {/* Warm diner lighting glow */}
      <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-yellow-400/10 rounded-full blur-[120px] pointer-events-none" />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 1 — Menu Shelf
// ─────────────────────────────────────────────────────────────────────────────

function DinerMenuShelf({ onSelect }: { onSelect: (v: Volume) => void }) {
  return (
    <DinerBackground>
      <header className="z-10 text-center mb-16 mt-8 p-6 bg-black/60 backdrop-blur-md rounded-xl border-y-4 border-red-500 shadow-2xl">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Coffee className="w-8 h-8 text-red-400 animate-pulse" />
          <p className="text-red-400 tracking-[0.4em] uppercase font-bold text-sm drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]">
            {"OPEN 24 HOURS"}
          </p>
          <Coffee className="w-8 h-8 text-red-400 animate-pulse" />
        </div>
        <h1
          className="text-white font-black italic tracking-tighter"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", textShadow: "0 0 20px rgba(220,38,38,0.8), 2px 2px 0px #b91c1c" }}
        >
          THE DINER
        </h1>
      </header>

      <div className="z-10 flex flex-wrap justify-center gap-12 px-4 max-w-6xl">
        {VOLUMES.map((vol) => (
          <DinerMenu key={vol.id} volume={vol} onSelect={onSelect} />
        ))}
      </div>
    </DinerBackground>
  );
}

function DinerMenu({ volume, onSelect }: { volume: Volume; onSelect: (v: Volume) => void }) {
  const [hovered, setHovered] = useState(false);
  const { solvedPerVolume } = useProgress();
  const solved = solvedPerVolume[volume.id] || 0;
  
  // Calculate total fragments
  let total = 0;
  volume.chapters.forEach((ch) => {
    total += ch.fragments.length;
  });
  const pct = total === 0 ? 0 : Math.round((solved / total) * 100);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(volume)}
      className="relative text-left focus:outline-none focus:ring-4 focus:ring-red-500 rounded-lg group perspective-1000"
    >
      {/* Menu Book Cover */}
      <div 
        className="relative w-56 h-80 bg-stone-900 border-4 border-red-800 rounded-lg shadow-[10px_10px_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-6 transition-all duration-300 ease-out"
        style={{
          transform: hovered ? "rotateY(-15deg) translateY(-10px)" : "rotateY(0deg) translateY(0)",
        }}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-20 pointer-events-none" />
        
        {/* Menu Binding details */}
        <div className="absolute left-2 top-0 bottom-0 w-2 bg-black/40 border-r border-red-900/50" />

        <div className="relative z-10 w-full h-full border-2 border-dashed border-red-600/30 rounded flex flex-col items-center justify-center gap-4 bg-stone-950/40 p-4">
          <Utensils className="w-12 h-12 text-red-500 mb-2 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
          <h2 className="text-2xl font-black text-white text-center uppercase font-serif tracking-widest leading-tight">
            {volume.name}
          </h2>
          <div className="w-12 h-1 bg-red-600/80 my-2" />
          
          <div className="mt-auto w-full">
             <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden mb-2 border border-stone-700">
               <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${pct}%` }} />
             </div>
             <p className="text-center text-xs font-mono text-stone-400 font-bold tracking-widest">{pct}% CONSUMED</p>
          </div>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 2 — Course List (Chapters)
// ─────────────────────────────────────────────────────────────────────────────

function DinerCourseList({ volume, onBack, onSelectChapter }: { volume: Volume; onBack: () => void; onSelectChapter: (chIndex: number, fragIndex: number) => void }) {
  const { getGrimoireGrade } = useProgress();

  return (
    <DinerBackground>
      <div className="w-full max-w-4xl z-10 my-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-900 font-bold bg-white/90 backdrop-blur-sm px-4 py-2 rounded shadow mb-6 hover:bg-red-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          BACK TO TABLE
        </button>

        {/* The Open Menu */}
        <div className="bg-orange-50 border-8 border-red-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-8 md:p-12 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="text-center mb-12 border-b-2 border-stone-800 pb-8">
              <h1 className="text-4xl md:text-5xl font-serif font-black text-stone-900 uppercase tracking-widest mb-4">
                {volume.name}
              </h1>
              <p className="text-stone-600 font-mono tracking-[0.2em] uppercase text-sm">Main Courses</p>
            </div>

            <div className="space-y-12">
              {volume.chapters.map((chapter, cIdx) => (
                <div key={`chapter-${cIdx}`} className="relative">
                  <h3 className="text-2xl font-serif font-bold text-red-800 mb-6 flex items-end">
                    <span>{chapter.theme}</span>
                    <div className="flex-1 border-b-2 border-dotted border-stone-400 mx-4 mb-2"></div>
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {chapter.fragments.map((frag, fIdx) => {
                      const grade = getGrimoireGrade(frag.id);
                      let borderClass = "border-stone-300";
                      let bgClass = "bg-white";
                      if (grade === "correct") { borderClass = "border-green-500"; bgClass = "bg-green-50"; }
                      else if (grade === "close") { borderClass = "border-yellow-500"; bgClass = "bg-yellow-50"; }
                      else if (grade === "wrong") { borderClass = "border-red-500"; bgClass = "bg-red-50"; }

                      return (
                        <button
                          key={frag.id}
                          onClick={() => onSelectChapter(cIdx, fIdx)}
                          className={`flex flex-col items-center p-3 rounded border-2 ${borderClass} ${bgClass} shadow-sm hover:-translate-y-1 hover:shadow-md transition-all`}
                        >
                          <span className="font-mono text-sm text-stone-500 mb-1">Item #{fIdx + 1}</span>
                          {grade === "correct" && <Check className="w-5 h-5 text-green-600" />}
                          {grade === "close" && <RotateCcw className="w-5 h-5 text-yellow-600" />}
                          {grade === "wrong" && <Minus className="w-5 h-5 text-red-600" />}
                          {!grade && <span className="text-stone-400 font-serif">Order</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DinerBackground>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 3 — Diner Spread (Plate + Receipt)
// ─────────────────────────────────────────────────────────────────────────────

function DinerSpread({ volume, chapterIndex, initialSpreadIndex, onBack }: { volume: Volume; chapterIndex: number; initialSpreadIndex: number; onBack: () => void }) {
  const chapter = volume.chapters[chapterIndex];
  
  // Flatten fragments to easily do next/prev across chapter boundary
  const allFragments = useMemo(() => {
    return volume.chapters.flatMap((c, cIdx) => c.fragments.map((f) => ({ ...f, chapterId: cIdx })));
  }, [volume]);

  // Find flattened index
  const startIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i < chapterIndex; i++) {
      count += volume.chapters[i].fragments.length;
    }
    return count + initialSpreadIndex;
  }, [volume, chapterIndex, initialSpreadIndex]);

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const fragment = allFragments[currentIndex];
  const { gradePhase, setGradePhase, handleGrade } = useWorkspaceLogic({ fragment, volume, chapterIndex });

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === allFragments.length - 1;

  const handleNext = () => { if (!isLast) { setCurrentIndex(i => i + 1); setGradePhase("problem"); } };
  const handlePrev = () => { if (!isFirst) { setCurrentIndex(i => i - 1); setGradePhase("problem"); } };

  return (
    <DinerBackground>
      <div className="w-full h-screen flex flex-col z-10 px-4 md:px-8 max-w-[1400px]">
        {/* Top bar */}
        <div className="flex justify-between items-center py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-stone-900 font-bold bg-white/90 backdrop-blur-sm px-4 py-2 rounded shadow hover:bg-red-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            BACK TO MENU
          </button>

          <div className="bg-stone-900 text-red-400 font-mono px-4 py-2 rounded border border-red-900/50 shadow-[inset_0_2px_10px_rgba(0,0,0,1)]">
            ORDER: #{fragment.id}
          </div>
        </div>

        {/* Table layout (Left: Plate, Right: Receipt) */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-16 pb-8 min-h-0">
          
          {/* LEFT PAN (The Plate) */}
          <div className="flex-1 flex items-center justify-center relative min-h-0">
            {/* Nav Prev */}
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="absolute left-0 z-20 p-4 bg-white/80 rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:scale-110 transition-all"
            >
              <ChevronLeft className="w-8 h-8 text-stone-800" />
            </button>

            {/* Ceramic Plate */}
            <div className="w-full max-w-lg aspect-square bg-[#f4f1ea] rounded-full shadow-[20px_20px_40px_rgba(0,0,0,0.5),-10px_-10px_20px_rgba(255,255,255,0.1)_inset] border-4 border-stone-200 relative flex flex-col items-center justify-center p-12">
               <div className="relative z-10 w-[300px] h-[300px] rounded-full border-4 border-stone-200/50 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_5px_15px_rgba(0,0,0,0.2)] bg-stone-100 flex items-center justify-center p-8 transition-transform duration-500 hover:scale-[1.02]">
                  {/* Plate inner rim */}
                  <div className="absolute inset-2 rounded-full border border-stone-300/30"></div>
                  <div className="absolute inset-4 rounded-full border border-red-900/10"></div>
                  
                  <MathRenderer className="relative z-20 text-stone-900 math-lg [&_.katex]:text-4xl max-w-full overflow-hidden flex items-center justify-center">
                    {`$$${fragment.problem_latex}$$`}
                  </MathRenderer>
                </div>
            </div>
          </div>

          {/* RIGHT PAN (The Receipt Printer) */}
          <div className="flex-1 flex items-center justify-center relative min-h-0">
             {/* Nav Next */}
             <button
              onClick={handleNext}
              disabled={isLast}
              className="absolute right-0 z-20 p-4 bg-white/80 rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:scale-110 transition-all"
            >
              <ChevronRight className="w-8 h-8 text-stone-800" />
            </button>

            <div className="w-full max-w-md h-[80vh] max-h-[800px] relative flex flex-col items-center justify-start pt-4">
              
              {/* Receipt Printer Machine Top */}
              <div className="absolute top-0 w-[110%] h-12 bg-stone-800 rounded shadow-xl z-20 flex items-center justify-center border-b border-stone-950">
                 <div className="w-3/4 h-2 bg-stone-950 rounded-full" />
                 <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              </div>

              {/* The Receipt Paper */}
              <div className="relative z-10 w-full bg-[#fdfbe9] flex-1 mt-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col" style={{ filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.4))" }}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] opacity-30 pointer-events-none" />
                <div className="absolute left-12 top-0 bottom-0 w-px bg-red-200" />

                {/* Jagged bottom edge (CSS zig-zag) */}
                <div className="absolute -bottom-3 left-0 right-0 h-4 bg-repeat-x" style={{ 
                  backgroundImage: "linear-gradient(-45deg, transparent 75%, #fdfbe9 75%), linear-gradient(45deg, transparent 75%, #fdfbe9 75%)",
                  backgroundSize: "16px 16px"
                }} />

                <div className="p-8 pt-12 flex-1 flex flex-col relative z-10">
                  <div className="text-center border-b-2 border-stone-300 border-dashed pb-4 mb-6">
                    <h2 className="font-mono text-xl font-bold text-stone-800 uppercase tracking-widest">GUEST CHECK</h2>
                    <p className="font-mono text-sm text-stone-500 mt-1">Table 4 • 2 Guests</p>
                  </div>

                  {gradePhase === "problem" && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <Ticket className="w-16 h-16 text-stone-300 mb-6" />
                      <p className="text-stone-500 font-mono mb-8">Waiting on kitchen...</p>
                      <button
                        onClick={() => setGradePhase("revealed")}
                        className="bg-red-600 text-white font-bold font-mono px-8 py-4 rounded shadow-[4px_4px_0_#991b1b] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#991b1b] active:translate-y-[4px] active:shadow-none transition-all"
                      >
                        PRINT TICKET (REVEAL)
                      </button>
                    </div>
                  )}

                  {(gradePhase === "revealed" || gradePhase === "graded") && (
                    <div className="flex-1 flex flex-col animate-in slide-in-from-top-8 duration-500 ease-out">
                      <div className="flex-1 flex items-center justify-center font-serif text-stone-900 border-b-2 border-stone-300 border-dashed pb-6 mb-6">
                         <MathRenderer className="math-lg [&_.katex]:text-5xl w-full text-center overflow-auto py-2">{`$$${fragment.solution_latex}$$`}</MathRenderer>
                      </div>

                      {gradePhase === "revealed" && (
                        <div className="mt-auto">
                          <p className="font-mono text-sm font-bold text-stone-500 text-center mb-4 uppercase">Pay the Bill:</p>
                          <div className="flex flex-col gap-3">
                            <button onClick={() => handleGrade("correct")} className="w-full font-mono font-bold text-lg py-3 bg-green-100 text-green-800 border-2 border-green-300 border-dashed rounded hover:bg-green-200">EXACT CHANGE (CORRECT)</button>
                            <button onClick={() => handleGrade("close")} className="w-full font-mono font-bold text-lg py-3 bg-yellow-100 text-yellow-800 border-2 border-yellow-300 border-dashed rounded hover:bg-yellow-200">KEEP THE CHANGE (CLOSE)</button>
                            <button onClick={() => handleGrade("wrong")} className="w-full font-mono font-bold text-lg py-3 bg-red-100 text-red-800 border-2 border-red-300 border-dashed rounded hover:bg-red-200">DINE & DASH (WRONG)</button>
                          </div>
                        </div>
                      )}

                      {gradePhase === "graded" && (
                        <div className="mt-auto flex items-center justify-center p-8 relative">
                          <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in spin-in-12 duration-300">
                             <div className="border-4 border-red-600 rounded-lg px-6 py-2 rotate-[-15deg]">
                               <span className="text-red-600 font-black text-4xl tracking-widest opacity-80 uppercase">PAID</span>
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </DinerBackground>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Diner Nav
// ─────────────────────────────────────────────────────────────────────────────
function DinerNav({ activeArea, onSelectArea }: { activeArea: AppArea, onSelectArea: (a: AppArea) => void }) {
  return (
    <div className="absolute top-4 right-8 z-50 flex gap-4">
      <button 
        onClick={() => onSelectArea("archive")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-mono uppercase tracking-widest transition-all ${
          activeArea === "archive" ? "bg-red-600 border-red-800 text-white shadow-[0_0_15px_rgba(220,38,38,0.8)]" : "bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800"
        }`}
      >
        <Archive size={16} /> Menu
      </button>
      <button 
        onClick={() => onSelectArea("library")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-mono uppercase tracking-widest transition-all ${
          activeArea === "library" ? "bg-red-600 border-red-800 text-white shadow-[0_0_15px_rgba(220,38,38,0.8)]" : "bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800"
        }`}
      >
        <BookOpen size={16} /> Jukebox
      </button>
      <button 
        onClick={() => onSelectArea("shop")}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-mono uppercase tracking-widest transition-all ${
          activeArea === "shop" ? "bg-red-600 border-red-800 text-white shadow-[0_0_15px_rgba(220,38,38,0.8)]" : "bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800"
        }`}
      >
        <ShoppingBag size={16} /> Register
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component exported for the theme engine
// ─────────────────────────────────────────────────────────────────────────────

export default function ThemeDiner({
  activeArea,
  onSelectArea,
}: {
  activeArea: AppArea;
  onSelectArea: (area: AppArea) => void;
}) {
  const [view, setView] = useState<AppView>({ screen: "shelf" });
  const { setIsLightMode } = useTheme();

  useEffect(() => {
    setIsLightMode(false);
  }, [setIsLightMode]);

  let content = null;

  if (activeArea === "library") {
    content = (
      <div className="w-full h-full p-8 max-w-6xl mx-auto">
        <div className="bg-[#fdfbe9] rounded-lg shadow-2xl overflow-hidden h-full border-4 border-stone-300">
          <LibraryView />
        </div>
      </div>
    );
  } else if (activeArea === "shop") {
    content = (
      <div className="w-full h-full p-8 max-w-6xl mx-auto">
        <div className="bg-[#fdfbe9] rounded-lg shadow-2xl overflow-hidden h-full border-4 border-stone-300">
          <ShopLayout />
        </div>
      </div>
    );
  } else {
    if (view.screen === "shelf") {
      content = <DinerMenuShelf onSelect={(vol) => setView({ screen: "chapters", volume: vol })} />;
    } else if (view.screen === "chapters") {
      content = (
        <DinerCourseList
          volume={view.volume}
          onBack={() => setView({ screen: "shelf" })}
          onSelectChapter={(chIndex, fragIndex) =>
            setView({ screen: "split-ledger", volume: view.volume, chapterIndex: chIndex, initialSpreadIndex: fragIndex })
          }
        />
      );
    } else {
      content = (
        <DinerSpread
          volume={view.volume}
          chapterIndex={view.chapterIndex}
          initialSpreadIndex={view.initialSpreadIndex}
          onBack={() => setView({ screen: "chapters", volume: view.volume })}
        />
      );
    }
  }

  return (
    <>
      <DinerNav activeArea={activeArea} onSelectArea={onSelectArea} />
      {content}
    </>
  );
}
