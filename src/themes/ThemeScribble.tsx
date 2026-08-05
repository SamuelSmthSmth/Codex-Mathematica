"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import { useTheme } from "@/context/ThemeContext";
import { useWorkspaceLogic } from "@/hooks/useWorkspaceLogic";
import { VOLUMES, type Volume, type Chapter, type Fragment } from "@/data/codex-data";
import { AppArea, ThemeProps } from "@/components/ThemeRoot";
import LibraryView from "@/components/LibraryViewScribble";
import ShopLayout from "@/components/ShopLayoutScribble";
import { useProgress, type SelfGrade } from "@/context/ProgressContext";
import { ArrowLeft, ChevronLeft, ChevronRight, Play, CheckCheck, Minus, RotateCcw, ShoppingBag, Archive, BookOpen } from "lucide-react";

const CAVEAT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`;

// Utility
const pad3 = (n: number) => String(n).padStart(3, "0");

type AppView =
  | { screen: "shelf" }
  | { screen: "chapters"; volume: Volume }
  | { screen: "reader"; volume: Volume; chapterIndex: number; fragmentIndex: number };

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

function ScribbleBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center pt-24 pb-10 px-4 relative overflow-x-hidden overflow-y-auto"
      style={{
        backgroundColor: "#faf9f0", // cream
        backgroundImage: `linear-gradient(rgba(184, 212, 232, 0.5) 2px, transparent 2px)`,
        backgroundSize: "100% 2rem",
        fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif" // Patrick Hand feel
      }}
    >
      <style>{CAVEAT_IMPORT}</style>
      <div className="absolute top-0 bottom-0 left-8 md:left-16 w-[3px] bg-[#e88080]/60 z-0 pointer-events-none" />
      <div className="relative z-10 w-full flex-1 min-h-0 flex flex-col max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  );
}

function ScribbleNav({ activeArea, onSelectArea }: { activeArea: AppArea, onSelectArea: (a: AppArea) => void }) {
  const btnClass = (area: AppArea) => `
    px-4 py-2 md:px-6 md:py-2 flex items-center gap-2 transform transition-transform hover:-translate-y-1 focus:outline-none
    font-bold text-lg md:text-2xl cursor-pointer text-stone-800
  `;
  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2 md:gap-4" style={{ fontFamily: "'Caveat', cursive" }}>
      <button onClick={() => onSelectArea("shop")} className={btnClass("shop") + (activeArea === "shop" ? " scale-110" : "")} style={{ backgroundColor: "#ffc0cb", border: "3px solid #333", borderRadius: "2px 8px 3px 6px", boxShadow: "3px 3px 0 #333", transform: activeArea === "shop" ? "rotate(-2deg)" : "rotate(1deg)" }}>
        <ShoppingBag size={20} /> Store
      </button>
      <button onClick={() => onSelectArea("archive")} className={btnClass("archive") + (activeArea === "archive" ? " scale-110" : "")} style={{ backgroundColor: "#fff9c4", border: "3px solid #333", borderRadius: "5px 2px 6px 3px", boxShadow: "3px 3px 0 #333", transform: activeArea === "archive" ? "rotate(2deg)" : "rotate(-1deg)" }}>
        <Archive size={20} /> Archive
      </button>
      <button onClick={() => onSelectArea("library")} className={btnClass("library") + (activeArea === "library" ? " scale-110" : "")} style={{ backgroundColor: "#c8f0d8", border: "3px solid #333", borderRadius: "3px 7px 2px 5px", boxShadow: "3px 3px 0 #333", transform: activeArea === "library" ? "rotate(-2deg)" : "rotate(1deg)" }}>
        <BookOpen size={20} /> Library
      </button>
    </div>
  );
}

function ScribbleShelf({ onSelect }: { onSelect: (v: Volume) => void }) {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-5xl md:text-7xl font-bold mb-16 text-stone-800 text-center" style={{ fontFamily: "'Caveat', cursive", transform: "rotate(-2deg)" }}>
        My Notebooks
      </h1>
      <div className="flex flex-wrap justify-center gap-8 md:gap-12 pl-8 md:pl-16">
        {VOLUMES.map(vol => (
          <button
            key={vol.id}
            onClick={() => onSelect(vol)}
            className="relative w-48 h-64 bg-[#fff9c4] border-[3px] border-stone-800 flex flex-col items-center justify-center p-4 transition-transform hover:scale-105 focus:outline-none"
            style={{
              borderRadius: "4px 12px 6px 8px",
              boxShadow: "6px 6px 0px rgba(0,0,0,0.8)",
              transform: `rotate(${Math.random() * 6 - 3}deg)`
            }}
          >
            <div 
              className="absolute -top-6 right-4 w-16 h-8 border-[3px] border-b-0 border-stone-800"
              style={{ backgroundColor: vol.accent, borderRadius: "8px 8px 0 0" }}
            />
            <div className="text-7xl font-bold mb-4 opacity-80" style={{ fontFamily: "'Caveat', cursive", color: vol.accent }}>
              {vol.symbol}
            </div>
            <div className="text-3xl font-bold text-stone-800 text-center" style={{ fontFamily: "'Caveat', cursive" }}>
              {vol.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ScribbleChapters({ volume, onSelectChapter, onClose }: { volume: Volume, onSelectChapter: (idx: number) => void, onClose: () => void }) {
  const { ownedItems } = useProgress();
  return (
    <div className="flex flex-col items-center w-full pl-8 md:pl-16">
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <button onClick={onClose} className="flex items-center gap-2 text-stone-800 font-bold text-3xl hover:text-[#e88080] transition-colors focus:outline-none" style={{ fontFamily: "'Caveat', cursive" }}>
          <ArrowLeft /> back
        </button>
        <h2 className="text-5xl md:text-6xl font-bold text-stone-800" style={{ fontFamily: "'Caveat', cursive", textDecoration: `underline ${volume.accent} 4px` }}>
          {volume.name} Chapters
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl p-8 rounded-lg bg-[#e8dcce] border-[4px] border-[#a08264] shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
        {volume.chapters.map((chapter, idx) => {
          if (chapter.packId && !ownedItems.has(chapter.packId)) return null;
          const isYellow = idx % 3 === 0;
          const isPink = idx % 3 === 1;
          const bg = isYellow ? "#fff9c4" : isPink ? "#ffc0cb" : "#c8f0d8";
          return (
            <button
              key={idx}
              onClick={() => onSelectChapter(idx)}
              className="relative p-4 border-[3px] border-stone-800 transition-transform hover:scale-105 active:scale-95 text-left flex flex-col justify-between min-h-[140px] focus:outline-none"
              style={{
                backgroundColor: bg,
                borderRadius: "2px 8px 3px 6px",
                boxShadow: "4px 4px 0 rgba(0,0,0,0.8)",
                transform: `rotate(${Math.random() * 8 - 4}deg)`
              }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 border-2 border-stone-800 shadow-md" />
              <div className="text-2xl font-bold text-stone-800 leading-tight" style={{ fontFamily: "'Caveat', cursive" }}>
                Ch {idx + 1}: {chapter.theme}
                {chapter.packId && (
                  <span className="ml-2 px-1 py-0.5 text-sm bg-red-400 text-white rounded transform -rotate-2 inline-block">EXPANSION</span>
                )}
              </div>
              <div className="text-stone-700 font-bold text-xl self-end mt-4" style={{ fontFamily: "'Caveat', cursive" }}>
                {chapter.fragments.length} problems
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const GRADE_OPTIONS: { grade: SelfGrade; label: string; icon: React.ReactNode; bg: string }[] = [
  { grade: "correct", label: "A+", icon: <CheckCheck size={20} strokeWidth={3} />, bg: "#c8f0d8" },
  { grade: "close", label: "B-", icon: <Minus size={20} strokeWidth={3} />, bg: "#fff9c4" },
  { grade: "wrong", label: "F", icon: <RotateCcw size={20} strokeWidth={3} />, bg: "#ffc0cb" },
];

function ScribbleReader({ volume, chapterIndex, fragmentIndex, onBack, onComplete }: { volume: Volume, chapterIndex: number, fragmentIndex: number, onBack: () => void, onComplete: () => void }) {
  const chapter = volume.chapters[chapterIndex];
  const fragment = chapter.fragments[fragmentIndex];
  const { gradePhase, setGradePhase, chosenGrade, handleGrade, handleRetry } = useWorkspaceLogic({ volume, chapterIndex, fragment });
  const [animKey, setAnimKey] = useState(0);

  const goNext = () => {
    if (fragmentIndex < chapter.fragments.length - 1) {
      onComplete(); // we'll intercept in parent
    } else {
      onBack();
    }
  };

  const goPrev = () => {
    if (fragmentIndex > 0) {
      // handled in parent
    } else {
      onBack();
    }
  };

  useEffect(() => {
    setAnimKey(prev => prev + 1);
  }, [fragmentIndex]);

  return (
    <div className="flex flex-col w-full max-w-3xl pl-8 md:pl-16 mx-auto relative z-10" key={animKey}>
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-stone-800 font-bold text-3xl hover:text-[#e88080] transition-colors focus:outline-none" style={{ fontFamily: "'Caveat', cursive" }}>
          <ArrowLeft /> back
        </button>
        <h2 className="text-4xl font-bold text-stone-800" style={{ fontFamily: "'Caveat', cursive" }}>
          Problem {pad3(fragment.id)}
        </h2>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div 
          className="bg-white/80 p-6 md:p-10 mb-8 border-[3px] border-stone-800"
          style={{ 
            borderRadius: "2px 8px 3px 6px", 
            boxShadow: "5px 5px 0 rgba(0,0,0,0.8)",
            transform: "rotate(1deg)"
          }}
        >
          <div className="text-2xl text-stone-800 mb-2 font-bold" style={{ fontFamily: "'Caveat', cursive", color: "#e88080" }}>Q:</div>
          <MathRenderer className="text-xl md:text-2xl text-stone-900 font-bold overflow-x-auto [&_.katex]:font-bold [&_.katex]:text-stone-900">
            {`$$${fragment.problem_latex}$$`}
          </MathRenderer>
        </div>

        {gradePhase === "problem" && (
          <div className="flex justify-center my-12">
            <button
              onClick={() => setGradePhase("revealed")}
              className="flex items-center gap-2 bg-[#ffc0cb] text-stone-900 font-bold text-3xl px-8 py-3 transition-transform hover:scale-105 active:scale-95 border-[3px] border-stone-800"
              style={{ fontFamily: "'Caveat', cursive", borderRadius: "5px 2px 6px 3px", boxShadow: "4px 4px 0 rgba(0,0,0,0.8)", transform: "rotate(-2deg)" }}
            >
              <Play size={24} fill="currentColor" /> show answer
            </button>
          </div>
        )}

        {(gradePhase === "revealed" || gradePhase === "graded") && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 mt-12">
            <div 
              className="bg-[#c8f0d8]/80 p-6 md:p-10 mb-8 border-[3px] border-stone-800"
              style={{ 
                borderRadius: "6px 3px 8px 2px", 
                boxShadow: "5px 5px 0 rgba(0,0,0,0.8)",
                transform: "rotate(-1deg)"
              }}
            >
              <div className="text-2xl text-stone-800 mb-2 font-bold" style={{ fontFamily: "'Caveat', cursive", color: "#e88080" }}>A:</div>
              <MathRenderer className="text-xl md:text-2xl text-stone-900 font-bold overflow-x-auto [&_.katex]:font-bold [&_.katex]:text-stone-900">
                {`$$${fragment.solution_latex}$$`}
              </MathRenderer>
            </div>

            {gradePhase === "revealed" && (
              <div className="flex flex-col items-center gap-4 mt-8 p-6 bg-[#fff9c4] border-[3px] border-stone-800" style={{ borderRadius: "2px 8px 3px 6px", boxShadow: "4px 4px 0 rgba(0,0,0,0.8)", transform: "rotate(1deg)" }}>
                <p className="text-3xl font-bold text-stone-800" style={{ fontFamily: "'Caveat', cursive" }}>Grade yourself:</p>
                <div className="flex gap-4">
                  {GRADE_OPTIONS.map(({ grade, label, bg }) => (
                    <button
                      key={grade}
                      onClick={() => handleGrade(grade)}
                      className="font-bold text-4xl w-16 h-16 rounded-full border-[3px] border-stone-800 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                      style={{ backgroundColor: bg, fontFamily: "'Caveat', cursive", boxShadow: "3px 3px 0 rgba(0,0,0,0.8)" }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gradePhase === "graded" && chosenGrade && (
              <div className="flex flex-col items-center gap-6 mt-8">
                <div 
                  className="font-bold text-6xl transform -rotate-12 border-[4px] border-stone-800 rounded-full w-24 h-24 flex items-center justify-center"
                  style={{ 
                    backgroundColor: GRADE_OPTIONS.find(g => g.grade === chosenGrade)?.bg,
                    fontFamily: "'Caveat', cursive",
                    color: "rgba(0,0,0,0.8)",
                    boxShadow: "5px 5px 0 rgba(0,0,0,0.8)"
                  }}
                >
                  {GRADE_OPTIONS.find(g => g.grade === chosenGrade)?.label}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 bg-white text-stone-800 font-bold text-2xl px-6 py-2 border-[3px] border-stone-800 transition-transform hover:scale-105 active:scale-95"
                    style={{ fontFamily: "'Caveat', cursive", borderRadius: "5px 2px 6px 3px", boxShadow: "3px 3px 0 rgba(0,0,0,0.8)", transform: "rotate(-1deg)" }}
                  >
                    <RotateCcw size={20} /> retry
                  </button>
                  <button
                    onClick={goNext}
                    className="flex items-center gap-2 bg-[#fff9c4] text-stone-800 font-bold text-2xl px-6 py-2 border-[3px] border-stone-800 transition-transform hover:scale-105 active:scale-95"
                    style={{ fontFamily: "'Caveat', cursive", borderRadius: "2px 5px 3px 6px", boxShadow: "3px 3px 0 rgba(0,0,0,0.8)", transform: "rotate(2deg)" }}
                  >
                    next <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ThemeScribble({ activeArea, onSelectArea, onOpenProfile, isProfileOpen, onCloseProfile }: ThemeProps) {
  const [view, setView] = useState<AppView>({ screen: "shelf" });
  const { setIsLightMode } = useTheme();

  useEffect(() => {
    setIsLightMode(true);
  }, [setIsLightMode]);

  let content = null;

  if (activeArea === "library") {
    content = (
      <div className="w-full flex-1 min-h-0 flex flex-col p-4 md:p-8 max-w-6xl mx-auto pl-8 md:pl-16 relative">
        <div className="bg-white rounded-lg overflow-hidden flex-1 min-h-0 flex flex-col relative border-[4px] border-stone-800" style={{ borderRadius: "4px 12px 6px 8px", boxShadow: "8px 8px 0 rgba(0,0,0,0.8)" }}>
          <LibraryView />
        </div>
      </div>
    );
  } else if (activeArea === "shop") {
    content = (
      <div className="w-full flex-1 min-h-0 flex flex-col p-4 md:p-8 max-w-6xl mx-auto pl-8 md:pl-16 relative">
        <div className="bg-white rounded-lg overflow-hidden flex-1 min-h-0 flex flex-col relative border-[4px] border-stone-800" style={{ borderRadius: "4px 12px 6px 8px", boxShadow: "8px 8px 0 rgba(0,0,0,0.8)" }}>
          <ShopLayout />
        </div>
      </div>
    );
  } else {
    if (view.screen === "shelf") {
      content = <ScribbleShelf onSelect={(v) => setView({ screen: "chapters", volume: v })} />;
    } else if (view.screen === "chapters") {
      content = <ScribbleChapters volume={view.volume} onSelectChapter={(idx) => setView({ screen: "reader", volume: view.volume, chapterIndex: idx, fragmentIndex: 0 })} onClose={() => setView({ screen: "shelf" })} />;
    } else {
      content = (
        <ScribbleReader
          volume={view.volume}
          chapterIndex={view.chapterIndex}
          fragmentIndex={view.fragmentIndex}
          onBack={() => setView({ screen: "chapters", volume: view.volume })}
          onComplete={() => {
            const nextIdx = view.fragmentIndex + 1;
            const cap = view.volume.chapters[view.chapterIndex].fragments.length;
            if (nextIdx < cap) {
              setView({ ...view, fragmentIndex: nextIdx });
            } else {
              setView({ screen: "chapters", volume: view.volume });
            }
          }}
        />
      );
    }
  }

  return (
    <ScribbleBackground>
      <ScribbleNav activeArea={activeArea} onSelectArea={onSelectArea} />
      <div key={`${activeArea}-${view.screen}`} className="animate-in fade-in zoom-in-95 duration-500 w-full flex-1 min-h-0 flex flex-col">
        {content}
      </div>
    </ScribbleBackground>
  );
}
