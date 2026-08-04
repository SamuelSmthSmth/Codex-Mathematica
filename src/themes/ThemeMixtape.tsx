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
  Disc3,
  CheckCheck,
  RotateCcw,
  Minus,
  Play,
  Pause,
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

const pad3 = (n: number) => String(n).padStart(3, "0");

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
// Mixtape Background (Light Wood Desk)
// ─────────────────────────────────────────────────────────────────────────────

function MixtapeBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-full flex flex-col items-center py-10 px-4 relative overflow-x-hidden overflow-y-auto"
      style={{
        background: "#e8dcce", // light wood base
        backgroundImage: `
          repeating-linear-gradient(90deg, transparent 0px, transparent 40px, rgba(160,130,100,0.1) 40px, rgba(160,130,100,0.1) 42px),
          repeating-linear-gradient(0deg, transparent 0px, transparent 120px, rgba(140,110,80,0.05) 120px, rgba(140,110,80,0.05) 122px)
        `, // faux wood planks
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-black/10 mix-blend-overlay pointer-events-none" />
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 1 — Library Shelf (CD Cases)
// ─────────────────────────────────────────────────────────────────────────────

function CDShelf({ onSelect }: { onSelect: (v: Volume) => void }) {
  return (
    <MixtapeBackground>
      <header className="z-10 text-center mb-16 mt-8">
        <p className="text-pink-500 mb-2 tracking-[0.3em] uppercase font-bold text-xs font-mono drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
          {"// THE MIXTAPE VAULT //"}
        </p>
        <h1
          className="text-stone-800 font-black italic tracking-tighter"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", textShadow: "2px 2px 0 #fff" }}
        >
          STUDENT MIXTAPES
        </h1>
      </header>

      <div className="z-10 flex flex-wrap justify-center gap-10 px-4 max-w-5xl">
        {VOLUMES.map((vol) => (
          <CDCase key={vol.id} volume={vol} onSelect={onSelect} />
        ))}
      </div>
    </MixtapeBackground>
  );
}

function CDCase({ volume, onSelect }: { volume: Volume; onSelect: (v: Volume) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onSelect(volume)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative focus:outline-none transition-transform duration-300"
      style={{ transform: hovered ? "scale(1.05) rotate(-2deg)" : "scale(1) rotate(0)" }}
    >
      {/* CD Jewel Case */}
      <div className="w-[180px] h-[180px] rounded bg-white shadow-xl relative border border-stone-200 overflow-hidden flex flex-col justify-between p-4">
        {/* Plastic glare */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />
        
        {/* Hinge side */}
        <div className="absolute top-0 bottom-0 left-0 w-6 bg-stone-100 border-r border-stone-300 shadow-[inset_2px_0_4px_rgba(0,0,0,0.1)] flex items-center justify-center">
          <span className="text-[10px] font-bold tracking-widest text-stone-400 -rotate-90 whitespace-nowrap">
            {volume.name.toUpperCase()}
          </span>
        </div>

        {/* Cover Art */}
        <div className="ml-6 flex flex-col items-center justify-center h-full">
          <div
            className="text-6xl mb-2 font-serif font-bold opacity-80"
            style={{ color: volume.accent }}
          >
            {volume.symbol}
          </div>
          <div className="font-sans font-bold text-stone-800 uppercase text-xs tracking-wider text-center">
            Vol. {volume.name}
          </div>
        </div>
      </div>
      {/* Drop shadow underneath */}
      <div className="absolute -bottom-2 left-4 right-4 h-4 bg-black/20 blur-md rounded-full -z-10" />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 2 — Tracks (Chapters)
// ─────────────────────────────────────────────────────────────────────────────

function TracklistView({ volume, onSelectChapter, onClose }: { volume: Volume; onSelectChapter: (idx: number) => void; onClose: () => void }) {
  const { ownedItems } = useProgress();
  return (
    <MixtapeBackground>
      <nav className="w-full max-w-2xl z-10 mb-8 flex justify-between items-center">
        <button onClick={onClose} className="font-mono text-sm text-pink-600 hover:text-pink-500 hover:-translate-x-1 transition-all flex items-center gap-2 font-bold">
          <ArrowLeft size={16} /> BACK TO CRATE
        </button>
      </nav>

      {/* Notebook Paper Container */}
      <main className="w-full max-w-2xl bg-white shadow-2xl rounded-sm overflow-hidden border border-stone-200 z-10 relative">
        {/* Red margin line */}
        <div className="absolute top-0 bottom-0 left-12 w-px bg-red-400/60" />
        
        {/* Header */}
        <div className="pt-8 pb-6 px-16 border-b-2 border-blue-200/50 relative">
          {/* Lined paper rules */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_27px,#60a5fa_28px)] bg-[length:100%_28px] opacity-30 pointer-events-none" />
          <h2 className="font-sans font-black text-3xl text-stone-800 uppercase relative z-10" style={{ textDecoration: `underline ${volume.accent} 4px` }}>
            {volume.name} Tracklist
          </h2>
          <p className="font-mono text-stone-500 text-sm mt-2 relative z-10">{volume.subtitle}</p>
        </div>

        {/* Tracks */}
        <div className="relative pb-10">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_27px,#60a5fa_28px)] bg-[length:100%_28px] opacity-30 pointer-events-none" />
          
          {volume.chapters.map((chapter, idx) => {
            if (chapter.packId && !ownedItems.has(chapter.packId)) return null;
            return (
              <button
                key={idx}
                onClick={() => onSelectChapter(idx)}
                className="w-full text-left relative z-10 hover:bg-yellow-100/50 transition-colors h-[56px] flex items-center px-4 group"
              >
                <div className="w-12 text-right pr-4 font-mono font-bold text-stone-400 group-hover:text-stone-600 flex flex-col items-end">
                  <span>{idx + 1}.</span>
                </div>
                <div className="flex-1 font-sans text-stone-700 font-semibold truncate group-hover:text-stone-900 flex items-center gap-2">
                  {chapter.theme}
                  {chapter.packId && (
                    <span className="px-1.5 py-0.5 rounded text-[0.55rem] font-bold tracking-widest bg-fuchsia-500/20 text-fuchsia-700 border border-fuchsia-500/30">
                      EXPANSION
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs text-stone-400 pr-4">
                  [{chapter.fragments.length} trks]
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </MixtapeBackground>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 3 — Workspace (BinderReader)
// ─────────────────────────────────────────────────────────────────────────────

const GRADE_OPTIONS: { grade: SelfGrade; label: string; icon: React.ReactNode; style: React.CSSProperties }[] = [
  { grade: "correct", label: "A+", icon: <CheckCheck size={16} strokeWidth={2.5} />, style: { background: "#4ade80", color: "#14532d", border: "2px solid #22c55e" } },
  { grade: "close", label: "B-", icon: <Minus size={16} strokeWidth={2.5} />, style: { background: "#facc15", color: "#713f12", border: "2px solid #eab308" } },
  { grade: "wrong", label: "F", icon: <RotateCcw size={16} strokeWidth={2.5} />, style: { background: "#f87171", color: "#7f1d1d", border: "2px solid #ef4444" } },
];

function NotebookPage({ volume, chapterIndex, fragment, isLeftPage }: { volume: Volume; chapterIndex: number; fragment: Fragment; isLeftPage: boolean; }) {
  const { gradePhase, setGradePhase, chosenGrade, handleGrade, handleRetry } = useWorkspaceLogic({ volume, chapterIndex, fragment });

  const radius = isLeftPage ? "8px 0px 0px 8px" : "0px 8px 8px 0px";
  
  return (
    <article className="w-full h-full relative flex flex-col overflow-hidden transition-all duration-500 bg-white" style={{ borderRadius: radius, boxShadow: isLeftPage ? "inset -10px 0 20px rgba(0,0,0,0.05)" : "inset 10px 0 20px rgba(0,0,0,0.05)" }}>
      {/* Notebook Paper Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_27px,#60a5fa_28px)] bg-[length:100%_28px] opacity-30 z-0 pointer-events-none" />
      <div className={`absolute top-0 bottom-0 ${isLeftPage ? 'right-12' : 'left-12'} w-px bg-red-400/60 z-0 pointer-events-none`} />

      <div className="relative z-10 flex-1 overflow-y-auto px-10 md:px-14 py-12" style={{ scrollbarWidth: "none" }}>
        
        <h3 className="font-mono font-bold text-stone-800 text-lg mb-6 underline decoration-pink-500 decoration-2 underline-offset-4">
          Track {pad3(fragment.id)}
        </h3>

        {/* Problem */}
        <div className="bg-stone-50/80 p-6 rounded border border-stone-200 shadow-inner mb-8">
          <MathRenderer className="text-stone-800 [&_.katex]:text-stone-800 [&_.katex]:text-4xl [&_.katex-display]:my-2 overflow-x-auto overflow-y-hidden">
            {`$$${fragment.problem_latex}$$`}
          </MathRenderer>
        </div>

        {/* Controls */}
        {gradePhase === "problem" && (
          <button
            onClick={() => setGradePhase("revealed")}
            className="flex items-center gap-2 bg-stone-800 text-white font-mono font-bold px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_4px_0_#444] hover:shadow-[0_2px_0_#444] hover:translate-y-[2px]"
          >
            <Play size={16} fill="white" />
            PLAY SOLUTION
          </button>
        )}

        {/* Revealed */}
        {(gradePhase === "revealed" || gradePhase === "graded") && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <h4 className="font-mono font-bold text-pink-600 text-sm mb-4">{"/// SOLUTION"}</h4>
            
            {/* LED Screen aesthetic for answer */}
            <div className="bg-stone-900 border-4 border-stone-700 p-6 rounded-lg shadow-inner mb-8 font-mono relative overflow-hidden">
               {/* LED scanline */}
               <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none" />
               <MathRenderer className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] relative z-10 [&_.katex]:text-white [&_.katex]:text-3xl [&_.katex-display]:my-2 overflow-x-auto overflow-y-hidden">
                 {`$$${fragment.solution_latex}$$`}
               </MathRenderer>
            </div>

            {/* Grading */}
            {gradePhase === "revealed" && (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded shadow-sm">
                <p className="font-mono font-bold text-stone-700 mb-4">TEACHER&apos;S GRADE:</p>
                <div className="flex gap-4">
                  {GRADE_OPTIONS.map(({ grade, label, style }) => (
                    <button
                      key={grade}
                      onClick={() => handleGrade(grade)}
                      className="font-black text-xl w-14 h-14 rounded-full flex items-center justify-center transform transition-transform hover:scale-110 active:scale-90"
                      style={{ ...style, fontFamily: "Marker Felt, Comic Sans MS, sans-serif" }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Graded Result */}
            {gradePhase === "graded" && chosenGrade && (
              <div className="flex items-center gap-6 mt-4">
                <div 
                  className="font-black text-4xl transform -rotate-12 border-4 p-2 rounded-full w-20 h-20 flex items-center justify-center opacity-80"
                  style={{ 
                    color: GRADE_OPTIONS.find(g => g.grade === chosenGrade)?.style.color,
                    borderColor: GRADE_OPTIONS.find(g => g.grade === chosenGrade)?.style.color,
                    fontFamily: "Marker Felt, Comic Sans MS, sans-serif"
                  }}
                >
                  {GRADE_OPTIONS.find(g => g.grade === chosenGrade)?.label}
                </div>
                <div>
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 bg-stone-200 text-stone-600 font-mono font-bold px-4 py-2 rounded hover:bg-stone-300 transition-colors"
                  >
                    <RotateCcw size={14} /> REPLAY TRACK
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function BinderReader({ volume, chapterIndex, initialSpreadIndex, onBack, onComplete }: { volume: Volume; chapterIndex: number; initialSpreadIndex: number; onBack: () => void; onComplete: () => void; }) {
  const chapter = volume.chapters[chapterIndex];
  const numSpreads = Math.ceil(chapter.fragments.length / 2);
  const [currentIndex, setCurrentIndex] = useState(initialSpreadIndex);
  
  // Flat flip animation state
  const [animState, setAnimState] = useState<{ type: 'next' | 'prev', fromIndex: number, toIndex: number } | null>(null);

  const handleNext = () => {
    if (animState) return;
    if (currentIndex < numSpreads - 1) {
      setAnimState({ type: 'next', fromIndex: currentIndex, toIndex: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => setAnimState(null), 350);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (animState) return;
    if (currentIndex > 0) {
      setAnimState({ type: 'prev', fromIndex: currentIndex, toIndex: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
      setTimeout(() => setAnimState(null), 350);
    } else {
      onBack();
    }
  };

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
      staticLeftFrag = oldLeftFrag;
      staticRightFrag = currentRightFrag;
      flipper = (
        <div className="absolute inset-0 origin-left flex transition-transform duration-[350ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
             style={{ transform: "rotateY(-90deg) scaleX(0)" }}
             ref={el => {
               if (el) {
                 requestAnimationFrame(() => {
                   el.style.transform = "rotateY(-180deg) scaleX(1)";
                 });
               }
             }}
        >
          {/* Flipper front (shows old right frag swinging over) */}
          <div className="absolute inset-0 backface-hidden flex">
            {oldRightFrag ? <NotebookPage volume={volume} chapterIndex={chapterIndex} fragment={oldRightFrag} isLeftPage={false} /> : <div className="w-full h-full bg-white rounded-r-lg shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] border-l border-stone-200" />}
          </div>
          {/* Flipper back (shows new left frag swinging in) */}
          <div className="absolute inset-0 backface-hidden flex" style={{ transform: "rotateY(180deg)" }}>
            {currentLeftFrag ? <NotebookPage volume={volume} chapterIndex={chapterIndex} fragment={currentLeftFrag} isLeftPage={true} /> : <div className="w-full h-full bg-white rounded-l-lg shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)] border-r border-stone-200" />}
          </div>
        </div>
      );
    } else {
      staticLeftFrag = currentLeftFrag;
      staticRightFrag = oldRightFrag;
      flipper = (
        <div className="absolute inset-0 origin-right flex transition-transform duration-[350ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
             style={{ transform: "rotateY(90deg) scaleX(0)", left: "-100%" }}
             ref={el => {
               if (el) {
                 requestAnimationFrame(() => {
                   el.style.transform = "rotateY(180deg) scaleX(1)";
                 });
               }
             }}
        >
          <div className="absolute inset-0 backface-hidden flex">
            {oldLeftFrag ? <NotebookPage volume={volume} chapterIndex={chapterIndex} fragment={oldLeftFrag} isLeftPage={true} /> : <div className="w-full h-full bg-white rounded-l-lg shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)] border-r border-stone-200" />}
          </div>
          <div className="absolute inset-0 backface-hidden flex" style={{ transform: "rotateY(180deg)" }}>
            {currentRightFrag ? <NotebookPage volume={volume} chapterIndex={chapterIndex} fragment={currentRightFrag} isLeftPage={false} /> : <div className="w-full h-full bg-white rounded-r-lg shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] border-l border-stone-200" />}
          </div>
        </div>
      );
    }
  }

  // Draw spiral rings in CSS
  const binderRings = Array.from({ length: 24 }).map((_, i) => (
    <div key={i} className="w-10 h-3 rounded-full bg-gradient-to-b from-gray-300 via-gray-100 to-gray-400 shadow-md border border-gray-400 absolute left-1/2 -translate-x-1/2 z-30" style={{ top: `${4 + i * 4}%` }} />
  ));

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center min-h-0 h-full py-4 perspective-[2000px]">
      
      {/* Top CD Player */}
      <div className="mb-6 flex flex-col items-center z-10 drop-shadow-xl">
        <div className="w-40 h-40 bg-stone-800 rounded-full border-4 border-stone-900 shadow-2xl relative flex items-center justify-center overflow-hidden">
           {/* Center pin */}
           <div className="absolute w-6 h-6 bg-stone-900 rounded-full border-2 border-stone-700 z-20" />
           {/* Spinning disc */}
           <div className={`absolute inset-1 rounded-full bg-gradient-to-tr from-stone-400 via-white to-stone-400 z-10 flex items-center justify-center ${animState ? '' : 'animate-[spin_4s_linear_infinite]'}`} style={{ backgroundImage: 'conic-gradient(from 0deg, #d6d3d1, #f5f5f4, #d6d3d1, #a8a29e, #d6d3d1)' }}>
              <div className="w-12 h-12 rounded-full bg-transparent border-4 border-white/40" />
              <div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_center,transparent,transparent_2px,rgba(0,0,0,0.03)_3px)]" />
           </div>
        </div>
        <div className="bg-stone-900 text-pink-500 font-mono text-xs px-4 py-1 mt-[-10px] z-20 rounded-full border border-stone-700 shadow-lg flex items-center gap-2">
          {animState ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="animate-pulse" />}
          TRACK {pad3(currentLeftFrag?.id || currentRightFrag?.id || 0)}
        </div>
      </div>

      <div className="relative w-full flex-1 flex transition-transform duration-500 ease-out preserve-3d" style={{ opacity: 1 }}>
        
        {/* Nav Arrows */}
        <button
          onClick={handlePrev}
          disabled={!!animState && animState.type !== 'prev'}
          className={`absolute left-0 -ml-16 md:-ml-20 top-1/2 -translate-y-1/2 z-40 bg-stone-800 text-white p-4 rounded-full shadow-lg border-2 border-stone-700 hover:bg-stone-700 active:scale-95 transition-all ${currentIndex === 0 ? "opacity-50 hover:bg-stone-800" : ""}`}
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>

        <button
          onClick={handleNext}
          disabled={!!animState && animState.type !== 'next'}
          className={`absolute right-0 -mr-16 md:-mr-20 top-1/2 -translate-y-1/2 z-40 bg-stone-800 text-white p-4 rounded-full shadow-lg border-2 border-stone-700 hover:bg-stone-700 active:scale-95 transition-all ${(currentIndex === numSpreads - 1 && !animState) ? "bg-pink-600 border-pink-500 hover:bg-pink-500" : ""}`}
        >
          {(currentIndex === numSpreads - 1 && !animState) ? <CheckCheck size={24} strokeWidth={3} /> : <ChevronRight size={24} strokeWidth={3} />}
        </button>

        {/* Notebook Spread */}
        <div className="w-full flex shadow-2xl relative bg-stone-300 rounded-lg p-1 border border-stone-400">
           {/* Center shadow/crease */}
           <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-transparent via-black/20 to-transparent z-20 pointer-events-none" />
           {/* Binder Rings */}
           {binderRings}

           {/* Left Page Container */}
           <div className="flex-1 relative z-10 perspective-[2000px]">
             {staticLeftFrag ? (
                <NotebookPage volume={volume} chapterIndex={chapterIndex} fragment={staticLeftFrag} isLeftPage={true} />
             ) : (
                <div className="w-full h-full bg-white rounded-l-lg shadow-[inset_-10px_0_20px_rgba(0,0,0,0.05)] border-r border-stone-200" />
             )}
           </div>

           {/* Right Page Container */}
           <div className="flex-1 relative z-10 perspective-[2000px]">
             {staticRightFrag ? (
                <NotebookPage volume={volume} chapterIndex={chapterIndex} fragment={staticRightFrag} isLeftPage={false} />
             ) : (
                <div className="w-full h-full bg-white rounded-r-lg shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)] border-l border-stone-200" />
             )}
             
             {/* Flipper overlays right page */}
             {flipper && (
                <div className="absolute inset-0 z-30 pointer-events-none">
                  {flipper}
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mixtape Nav
// ─────────────────────────────────────────────────────────────────────────────
function MixtapeNav({ activeArea, onSelectArea }: { activeArea: AppArea, onSelectArea: (a: AppArea) => void }) {
  return (
    <div className="absolute top-4 right-8 z-50 flex gap-4">
      <button 
        onClick={() => onSelectArea("shop")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-sans font-bold uppercase tracking-wider transition-all shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[4px_8px_0_rgba(0,0,0,1)] ${
          activeArea === "shop" ? "bg-fuchsia-500 border-black text-white" : "bg-white border-black text-black hover:bg-stone-100"
        }`}
      >
        <ShoppingBag size={16} /> Mall
      </button>
      <button 
        onClick={() => onSelectArea("archive")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-sans font-bold uppercase tracking-wider transition-all shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[4px_8px_0_rgba(0,0,0,1)] ${
          activeArea === "archive" ? "bg-fuchsia-500 border-black text-white" : "bg-white border-black text-black hover:bg-stone-100"
        }`}
      >
        <Archive size={16} /> Homework
      </button>
      <button 
        onClick={() => onSelectArea("library")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-sans font-bold uppercase tracking-wider transition-all shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[4px_8px_0_rgba(0,0,0,1)] ${
          activeArea === "library" ? "bg-fuchsia-500 border-black text-white" : "bg-white border-black text-black hover:bg-stone-100"
        }`}
      >
        <BookOpen size={16} /> Library
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export default function ThemeMixtape({
  activeArea,
  onSelectArea,
}: {
  activeArea: AppArea;
  onSelectArea: (area: AppArea) => void;
}) {
  const [view, setView] = useState<AppView>({ screen: "shelf" });
  const { setIsLightMode } = useTheme();

  useEffect(() => {
    setIsLightMode(true);
  }, [setIsLightMode]);

  let content = null;

  if (activeArea === "library") {
    content = (
      <div className="w-full h-full p-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden h-full border-4 border-fuchsia-500">
          <LibraryView />
        </div>
      </div>
    );
  } else if (activeArea === "shop") {
    content = (
      <div className="w-full h-full p-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden h-full border-4 border-fuchsia-500">
          <ShopLayout />
        </div>
      </div>
    );
  } else {
    if (view.screen === "shelf") {
      content = <CDShelf onSelect={(v) => setView({ screen: "chapters", volume: v })} />;
    } else if (view.screen === "chapters") {
      content = <TracklistView volume={view.volume} onSelectChapter={(idx) => setView({ screen: "split-ledger", volume: view.volume, chapterIndex: idx, initialSpreadIndex: 0 })} onClose={() => setView({ screen: "shelf" })} />;
    } else {
      content = (
        <MixtapeBackground>
          <BinderReader
            volume={view.volume}
            chapterIndex={view.chapterIndex}
            initialSpreadIndex={view.initialSpreadIndex}
            onBack={() => setView({ screen: "chapters", volume: view.volume })}
            onComplete={() => setView({ screen: "chapters", volume: view.volume })}
          />
        </MixtapeBackground>
      );
    }
  }

  // The outer background for the library/shop should also be the mixtape background
  if (activeArea !== "archive") {
    return (
      <MixtapeBackground>
        <MixtapeNav activeArea={activeArea} onSelectArea={onSelectArea} />
        <div key={`${activeArea}-${view.screen}`} className="animate-in fade-in slide-in-from-left-4 duration-500 h-[calc(100%-4rem)] w-full">
          {content}
        </div>
      </MixtapeBackground>
    );
  }

  // For archive, some views like CDShelf have their own background wrapper (or they render full screen)
  return (
    <>
      <MixtapeNav activeArea={activeArea} onSelectArea={onSelectArea} />
      <div key={`${activeArea}-${view.screen}`} className="animate-in fade-in slide-in-from-left-4 duration-500 h-[calc(100%-4rem)] w-full">
        {content}
      </div>
    </>
  );
}
