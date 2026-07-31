"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkBreaks from "remark-breaks";
import rehypeKatex from "rehype-katex";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useProgress, type SelfGrade } from "@/context/ProgressContext";
import { useWorkspaceLogic } from "@/hooks/useWorkspaceLogic";
import {
  ArrowLeft,
  ChevronRight,
  Disc3,
  CheckCheck,
  RotateCcw,
  Minus,
  Play,
  Pause
} from "lucide-react";
import { VOLUMES, type Volume, type Chapter, type Fragment } from "@/data/codex-data";

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────

const pad3 = (n: number) => String(n).padStart(3, "0");

type AppView =
  | { screen: "shelf" }
  | { screen: "chapters"; volume: Volume }
  | { screen: "split-ledger"; volume: Volume; chapterIndex: number; fragment: Fragment | null };

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
      className="min-h-screen flex flex-col items-center py-10 px-4 relative overflow-hidden"
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
          // THE MIXTAPE VAULT //
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
          
          {volume.chapters.map((chapter, idx) => (
            <button
              key={idx}
              onClick={() => onSelectChapter(idx)}
              className="w-full text-left relative z-10 hover:bg-yellow-100/50 transition-colors h-[56px] flex items-center px-4 group"
            >
              <div className="w-12 text-right pr-4 font-mono font-bold text-stone-400 group-hover:text-stone-600">
                {idx + 1}.
              </div>
              <div className="flex-1 font-sans text-stone-700 font-semibold truncate group-hover:text-stone-900">
                {chapter.theme}
              </div>
              <div className="font-mono text-xs text-stone-400 pr-4">
                [{chapter.fragments.length} trks]
              </div>
            </button>
          ))}
        </div>
      </main>
    </MixtapeBackground>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 3 — Workspace
// ─────────────────────────────────────────────────────────────────────────────

const GRADE_OPTIONS: { grade: SelfGrade; label: string; icon: React.ReactNode; style: React.CSSProperties }[] = [
  { grade: "correct", label: "A+", icon: <CheckCheck size={16} strokeWidth={2.5} />, style: { background: "#4ade80", color: "#14532d", border: "2px solid #22c55e" } },
  { grade: "close", label: "B-", icon: <Minus size={16} strokeWidth={2.5} />, style: { background: "#facc15", color: "#713f12", border: "2px solid #eab308" } },
  { grade: "wrong", label: "F", icon: <RotateCcw size={16} strokeWidth={2.5} />, style: { background: "#f87171", color: "#7f1d1d", border: "2px solid #ef4444" } },
];

function MixtapeWorkspace({ volume, chapterIndex, activeFragment, onSelectFragment, onBack }: { volume: Volume; chapterIndex: number; activeFragment: Fragment | null; onSelectFragment: (frag: Fragment) => void; onBack: () => void }) {
  const chapter = volume.chapters[chapterIndex];
  const [conqueredIds, setConqueredIds] = useState<Set<number>>(new Set());
  const [cachedChapterData, setCachedChapterData] = useState<Record<string, any>>({});
  const { isGuestMode } = useAuth();

  const fetchGrimoire = () => {
    if (isGuestMode) return;
    const user = auth.currentUser;
    if (!user) return;
    const grimoireRef = collection(db, "users", user.uid, "grimoire");
    const q = query(grimoireRef, where("volume", "==", volume.id), where("chapter", "==", chapterIndex));
    getDocs(q).then((snap) => {
      const ids = new Set<number>();
      const cache: Record<string, any> = {};
      snap.forEach((d) => {
        const data = d.data();
        ids.add(data.fragment_id as number);
        cache[data.fragment_id] = data;
      });
      setConqueredIds(ids);
      setCachedChapterData(cache);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchGrimoire();
    const handleUpdate = () => fetchGrimoire();
    window.addEventListener("grimoire-updated", handleUpdate);
    return () => window.removeEventListener("grimoire-updated", handleUpdate);
  }, [volume.id, chapterIndex, isGuestMode]);

  return (
    <MixtapeBackground>
      <nav className="w-full max-w-5xl z-10 mb-6 flex justify-between items-center">
        <button onClick={onBack} className="font-mono text-sm text-pink-600 hover:text-pink-500 hover:-translate-x-1 transition-all flex items-center gap-2 font-bold">
          <ArrowLeft size={16} /> BACK TO SETLIST
        </button>
      </nav>

      <div className="w-full max-w-5xl flex gap-6 flex-col md:flex-row z-10 h-[calc(100vh-8rem)]">
        
        {/* LEFT COLUMN: Sidebar Setlist */}
        <aside className="w-full md:w-[30%] bg-white rounded shadow border border-stone-200 overflow-hidden flex flex-col">
          <div className="bg-stone-800 text-white p-4 flex items-center gap-3">
            <Disc3 className="animate-[spin_4s_linear_infinite]" size={24} color="#ec4899" />
            <div>
              <div className="font-mono text-xs text-pink-400">NOW PLAYING</div>
              <div className="font-bold text-sm truncate">{chapter.theme}</div>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {chapter.fragments.map((frag, idx) => {
              const isActive = activeFragment?.id === frag.id;
              const isConquered = conqueredIds.has(frag.id);
              return (
                <button
                  key={frag.id}
                  onClick={() => onSelectFragment(frag)}
                  className={`w-full text-left px-4 py-3 border-b border-stone-100 flex items-center gap-3 transition-colors ${isActive ? "bg-pink-50" : "hover:bg-stone-50"}`}
                >
                  <div className={`font-mono text-xs font-bold w-6 text-right ${isActive ? "text-pink-500" : "text-stone-400"}`}>
                    {idx + 1}.
                  </div>
                  <div className={`flex-1 font-mono text-xs truncate ${isActive ? "text-stone-900 font-bold" : "text-stone-500"}`}>
                    {frag.problem_latex}
                  </div>
                  {isConquered && <CheckCheck size={14} className="text-green-500" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT COLUMN: Active Track (Notebook Paper) */}
        <main className="flex-1 bg-white shadow-xl rounded border border-stone-200 relative overflow-y-auto">
          {activeFragment ? (
            <NotebookDesk 
              volume={volume} 
              chapterIndex={chapterIndex} 
              fragment={activeFragment}
              cachedData={cachedChapterData[activeFragment.id]}
              onCacheUpdate={(fragId, data) => setCachedChapterData(prev => ({ ...prev, [fragId]: data }))}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-stone-400 font-mono text-sm bg-stone-50">
              [ SELECT A TRACK TO PLAY ]
            </div>
          )}
        </main>
      </div>
    </MixtapeBackground>
  );
}

function NotebookDesk({ volume, chapterIndex, fragment, cachedData, onCacheUpdate }: { volume: Volume; chapterIndex: number; fragment: Fragment; cachedData?: any; onCacheUpdate: (fragId: number, data: any) => void; }) {
  const { gradePhase, setGradePhase, chosenGrade, isAlreadyConquered, handleGrade, handleRetry } = useWorkspaceLogic({ volume, chapterIndex, fragment, cachedData, onCacheUpdate });

  return (
    <div className="relative min-h-full pb-10">
      {/* Notebook styling */}
      <div className="absolute top-0 bottom-0 left-12 w-px bg-red-400/60 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(transparent_27px,#60a5fa_28px)] bg-[length:100%_28px] opacity-30 z-0 pointer-events-none" />
      
      <div className="relative z-10 px-16 pt-10">
        <h3 className="font-mono font-bold text-stone-800 text-lg mb-6 underline decoration-pink-500 decoration-2 underline-offset-4">
          Track {pad3(fragment.id)}
        </h3>

        {/* Problem */}
        <div className="bg-stone-50/80 p-6 rounded border border-stone-200 shadow-inner mb-8">
          <MathRenderer className="[&_.katex]:text-xl text-stone-800">{`$$${fragment.problem_latex}$$`}</MathRenderer>
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
            <h4 className="font-mono font-bold text-pink-600 text-sm mb-4">/// SOLUTION</h4>
            
            {/* LED Screen aesthetic for answer */}
            <div className="bg-stone-900 border-4 border-stone-700 p-6 rounded-lg shadow-inner mb-8 font-mono">
              <MathRenderer className="[&_.katex]:text-2xl text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">{`$$${fragment.solution_latex}$$`}</MathRenderer>
            </div>

            {/* Grading */}
            {gradePhase === "revealed" && (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded shadow-sm">
                <p className="font-mono font-bold text-stone-700 mb-4">TEACHER'S GRADE:</p>
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────

export default function ThemeMixtape() {
  const [view, setView] = useState<AppView>({ screen: "shelf" });

  if (view.screen === "shelf") return <CDShelf onSelect={(v) => setView({ screen: "chapters", volume: v })} />;
  if (view.screen === "chapters") return <TracklistView volume={view.volume} onSelectChapter={(idx) => setView({ screen: "split-ledger", volume: view.volume, chapterIndex: idx, fragment: null })} onClose={() => setView({ screen: "shelf" })} />;
  return (
    <MixtapeWorkspace
      volume={view.volume}
      chapterIndex={view.chapterIndex}
      activeFragment={view.fragment}
      onSelectFragment={(frag) => setView({ screen: "split-ledger", volume: view.volume, chapterIndex: view.chapterIndex, fragment: frag })}
      onBack={() => setView({ screen: "chapters", volume: view.volume })}
    />
  );
}
