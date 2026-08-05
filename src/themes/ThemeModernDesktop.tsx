"use client";

import React, { useState, useEffect, useMemo } from "react";
import { VOLUMES, type Volume } from "@/data/codex-data";
import { useProgress } from "@/context/ProgressContext";
import { useWorkspaceLogic } from "@/hooks/useWorkspaceLogic";
import { X, Minus, Square, Folder, Terminal, Globe, ShoppingBag, BookOpen, User, Wifi, Battery, ChevronRight, ChevronLeft, Check, CircleX } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useTheme } from "@/context/ThemeContext";
import { AppArea, ThemeProps } from "@/components/ThemeRoot";
import LibraryViewModernDesktop from "@/components/LibraryViewModernDesktop";
import ShopLayoutModernDesktop from "@/components/ShopLayoutModernDesktop";

function MathRenderer({ children, className }: { children: string; className?: string }) {
  const processedText = children.replace(/\$\$([\s\S]*?)\$\$/g, (_match, inner: string) => {
    return `\n$$\n${inner.trim()}\n$$\n`;
  });
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {processedText}
      </ReactMarkdown>
    </div>
  );
}

function ModernWindow({
  id,
  title,
  icon: Icon,
  onClose,
  onPointerDown,
  style,
  children,
}: {
  id: string;
  title: string;
  icon?: React.ElementType;
  onClose: () => void;
  onPointerDown?: () => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute flex flex-col rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#1e1e1e]/90 backdrop-blur-xl transition-transform animate-in fade-in zoom-in-95 duration-200"
      style={style}
      onPointerDown={onPointerDown}
    >
      {/* Title Bar */}
      <div className="h-10 bg-[#2a2a2a]/80 flex items-center px-4 relative flex-shrink-0 cursor-default">
        <div className="flex gap-2 absolute left-4">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center group">
            <X className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100" />
          </button>
          <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center group">
            <Minus className="w-2 h-2 text-yellow-900 opacity-0 group-hover:opacity-100" />
          </button>
          <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center group">
            <Square className="w-2 h-2 text-green-900 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center gap-2 pointer-events-none text-slate-300 text-sm font-medium">
          {Icon && <Icon className="w-4 h-4" />}
          <span>{title}</span>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto bg-[#1a1a1a] relative">
        {children}
      </div>
    </div>
  );
}

function TerminalWorkspace({
  volume,
  chapterIndex,
  onClose,
  onPointerDown,
  style,
}: {
  volume: Volume;
  chapterIndex: number;
  onClose: () => void;
  onPointerDown?: () => void;
  style?: React.CSSProperties;
}) {
  const allFragments = useMemo(() => volume.chapters.flatMap((c) => c.fragments), [volume]);
  const startIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i < chapterIndex; i++) {
      count += volume.chapters[i].fragments.length;
    }
    return count;
  }, [volume, chapterIndex]);

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const fragment = allFragments[currentIndex];
  const { gradePhase, setGradePhase, handleGrade } = useWorkspaceLogic({ fragment, volume, chapterIndex });

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === allFragments.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      setGradePhase("problem");
    }
  };
  const handlePrev = () => {
    if (!isFirst) {
      setCurrentIndex((i) => i - 1);
      setGradePhase("problem");
    }
  };

  return (
    <ModernWindow
      id="terminal"
      title={`bash - ${volume.id} - chapter_${chapterIndex + 1}`}
      icon={Terminal}
      onClose={onClose}
      onPointerDown={onPointerDown}
      style={{ top: "10%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "600px", ...style }}
    >
      <div className="h-full flex flex-col font-mono text-slate-300 p-4">
        <div className="flex-1 overflow-auto flex flex-col gap-4">
          <div>
            <span className="text-emerald-400">samuel@codex</span>
            <span className="text-slate-400">:</span>
            <span className="text-blue-400">~/problems</span>
            <span className="text-slate-400">$ </span>
            <span className="text-slate-200">cat problem_{fragment.id}.tex</span>
          </div>
          
          <div className="math-lg [&_.katex]:text-white [&_.katex]:text-xl text-white mb-4 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
            <MathRenderer>{`$$${fragment.problem_latex}$$`}</MathRenderer>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800">
            {gradePhase === "problem" && (
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-emerald-400">samuel@codex</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-blue-400">~/problems</span>
                  <span className="text-slate-400">$ </span>
                  <span className="animate-pulse">_</span>
                </div>
                <button
                  onClick={() => setGradePhase("revealed")}
                  className="self-start mt-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 transition-colors flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4" /> ./solve.sh
                </button>
              </div>
            )}

            {(gradePhase === "revealed" || gradePhase === "graded") && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                <div>
                  <span className="text-emerald-400">samuel@codex</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-blue-400">~/problems</span>
                  <span className="text-slate-400">$ </span>
                  <span className="text-slate-200">./solve.sh</span>
                </div>
                
                <div className="math-lg [&_.katex]:text-white [&_.katex]:text-xl text-white bg-blue-900/10 p-4 rounded-lg border border-blue-900/30">
                  <MathRenderer>{`$$${fragment.solution_latex}$$`}</MathRenderer>
                </div>

                {gradePhase === "revealed" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGrade("correct")}
                      className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-700 px-3 py-1.5 rounded text-emerald-400 hover:bg-emerald-900/50 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Pass
                    </button>
                    <button
                      onClick={() => handleGrade("wrong")}
                      className="flex items-center gap-2 bg-red-900/30 border border-red-700 px-3 py-1.5 rounded text-red-400 hover:bg-red-900/50 transition-colors"
                    >
                      <CircleX className="w-4 h-4" /> Fail
                    </button>
                  </div>
                )}
                
                {gradePhase === "graded" && (
                  <div className="text-slate-500 italic">
                    [Process completed]
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="flex items-center gap-1 hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors px-2 py-1 bg-slate-800/50 rounded"
            >
              <ChevronLeft className="w-3 h-3" /> Prev
            </button>
            <button
              onClick={handleNext}
              disabled={isLast}
              className="flex items-center gap-1 hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors px-2 py-1 bg-slate-800/50 rounded"
            >
              Next <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <span>UTF-8</span>
        </div>
      </div>
    </ModernWindow>
  );
}

export default function ThemeModernDesktop({ activeArea, onSelectArea, onOpenProfile, isProfileOpen, onCloseProfile }: ThemeProps) {
  const { setIsLightMode } = useTheme();
  useEffect(() => {
    setIsLightMode(false);
  }, [setIsLightMode]);

  const [explorerVolume, setExplorerVolume] = useState<Volume | null>(null);
  const [terminalContext, setTerminalContext] = useState<{ volume: Volume; chapterIndex: number } | null>(null);

  const [windowOrder, setWindowOrder] = useState<string[]>([]);
  const bringToFront = (id: string) => {
    setWindowOrder((prev) => {
      const next = prev.filter((x) => x !== id);
      return [...next, id];
    });
  };
  const getZIndex = (id: string) => windowOrder.indexOf(id) + 10;

  const { ownedItems } = useProgress();
  const baseVolumes = ["alpha", "delta", "sigma", "gamma"];
  const visibleVolumes = VOLUMES.filter((v) => baseVolumes.includes(v.id) || ownedItems.has(v.id));

  useEffect(() => {
    if (activeArea === "library") bringToFront("library");
  }, [activeArea]);
  useEffect(() => {
    if (activeArea === "shop") bringToFront("shop");
  }, [activeArea]);
  useEffect(() => {
    if (explorerVolume) bringToFront("explorer");
  }, [explorerVolume]);
  useEffect(() => {
    if (terminalContext) bringToFront("terminal");
  }, [terminalContext]);

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full overflow-hidden bg-black select-none relative font-sans text-slate-200">
      <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: "url('/images/modern_desktop_wallpaper.png')" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-950/90 pointer-events-none" />
      
      {/* Top Menu Bar */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-50 text-xs">
        <div className="flex gap-4 items-center">
          <span className="font-bold text-white">Codex</span>
          <span className="hidden sm:inline hover:text-white cursor-pointer transition-colors">File</span>
          <span className="hidden sm:inline hover:text-white cursor-pointer transition-colors">Edit</span>
          <span className="hidden sm:inline hover:text-white cursor-pointer transition-colors">View</span>
          <span className="hidden sm:inline hover:text-white cursor-pointer transition-colors">Window</span>
          <span className="hidden sm:inline hover:text-white cursor-pointer transition-colors">Help</span>
        </div>
        <div className="flex gap-4 items-center">
          <Wifi className="w-3 h-3" />
          <Battery className="w-4 h-4" />
          <span>
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Desktop Background Area */}
      <div className="absolute inset-0 pt-7 pb-20 overflow-hidden" onClick={() => {}}>
        
        {/* Explorer Window */}
        {explorerVolume && (
          <ModernWindow
            id="explorer"
            title={`Finder - ${explorerVolume.name}`}
            icon={Folder}
            onClose={() => setExplorerVolume(null)}
            onPointerDown={() => bringToFront("explorer")}
            style={{ top: "15%", left: "15%", width: "60%", height: "60%", zIndex: getZIndex("explorer") }}
          >
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {explorerVolume.chapters.map((chapter, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                  onClick={() => {
                    setTerminalContext({ volume: explorerVolume, chapterIndex: idx });
                  }}
                >
                  <div className="w-16 h-16 bg-blue-900/20 border border-blue-500/30 rounded-xl flex items-center justify-center group-hover:bg-blue-600/30 group-hover:scale-105 transition-all">
                    <Terminal className="w-8 h-8 text-blue-400" />
                  </div>
                  <span className="text-xs text-center line-clamp-2 px-1 group-hover:text-white group-hover:bg-blue-600/50 rounded transition-colors">
                    {chapter.theme}
                  </span>
                </div>
              ))}
            </div>
          </ModernWindow>
        )}

        {/* Terminal Workspace */}
        {terminalContext && (
          <TerminalWorkspace
            volume={terminalContext.volume}
            chapterIndex={terminalContext.chapterIndex}
            onClose={() => setTerminalContext(null)}
            onPointerDown={() => bringToFront("terminal")}
            style={{ zIndex: getZIndex("terminal") }}
          />
        )}

        {/* Library Window */}
        {activeArea === "library" && (
          <ModernWindow
            id="library"
            title="Safari - Technique Library"
            icon={BookOpen}
            onClose={() => onSelectArea("archive")}
            onPointerDown={() => bringToFront("library")}
            style={{ top: "10%", left: "10%", width: "80%", height: "80%", zIndex: getZIndex("library") }}
          >
            <div className="h-full overflow-auto bg-[#111111] relative">
              <LibraryViewModernDesktop />
            </div>
          </ModernWindow>
        )}

        {/* Shop Window */}
        {activeArea === "shop" && (
          <ModernWindow
            id="shop"
            title="App Store"
            icon={ShoppingBag}
            onClose={() => onSelectArea("archive")}
            onPointerDown={() => bringToFront("shop")}
            style={{ top: "10%", left: "10%", width: "80%", height: "80%", zIndex: getZIndex("shop") }}
          >
            <div className="h-full overflow-auto bg-[#111111] relative">
              <ShopLayoutModernDesktop />
            </div>
          </ModernWindow>
        )}
      </div>

      {/* Dock */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex gap-2 items-end z-50 shadow-2xl">
        {visibleVolumes.map((vol) => (
          <button
            key={vol.id}
            onClick={() => {
              onSelectArea("archive");
              setExplorerVolume(vol);
            }}
            className="group relative flex flex-col items-center justify-end h-12 w-12 hover:w-16 hover:h-16 hover:-translate-y-2 transition-all duration-200"
          >
            <div className="absolute -top-8 px-2 py-1 bg-black/70 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
              {vol.name}
            </div>
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center border border-white/20">
              <Folder className="w-1/2 h-1/2 text-white" />
            </div>
          </button>
        ))}
        
        <div className="w-px h-10 bg-white/20 mx-2 self-center" />

        <button
          onClick={() => onSelectArea("library")}
          className="group relative flex flex-col items-center justify-end h-12 w-12 hover:w-16 hover:h-16 hover:-translate-y-2 transition-all duration-200"
        >
          <div className="absolute -top-8 px-2 py-1 bg-black/70 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
            Library
          </div>
          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl shadow-lg flex items-center justify-center border border-white/20">
            <BookOpen className="w-1/2 h-1/2 text-white" />
          </div>
          {activeArea === "library" && <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full shadow-[0_0_4px_white]" />}
        </button>

        <button
          onClick={() => onSelectArea("shop")}
          className="group relative flex flex-col items-center justify-end h-12 w-12 hover:w-16 hover:h-16 hover:-translate-y-2 transition-all duration-200"
        >
          <div className="absolute -top-8 px-2 py-1 bg-black/70 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
            App Store
          </div>
          <div className="w-full h-full bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg flex items-center justify-center border border-white/20">
            <ShoppingBag className="w-1/2 h-1/2 text-white" />
          </div>
          {activeArea === "shop" && <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full shadow-[0_0_4px_white]" />}
        </button>

        {onOpenProfile && (
          <>
            <div className="w-px h-10 bg-white/20 mx-2 self-center" />
            <button
              onClick={onOpenProfile}
              className="group relative flex flex-col items-center justify-end h-12 w-12 hover:w-16 hover:h-16 hover:-translate-y-2 transition-all duration-200"
            >
              <div className="absolute -top-8 px-2 py-1 bg-black/70 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                System Preferences
              </div>
              <div className="w-full h-full bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl shadow-lg flex items-center justify-center border border-white/20">
                <User className="w-1/2 h-1/2 text-white" />
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
