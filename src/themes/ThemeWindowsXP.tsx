import React, { useState, useEffect, useMemo } from "react";
import { VOLUMES, Volume, Chapter } from "../data/codex-data";
import { useWorkspaceLogic } from "../hooks/useWorkspaceLogic";
import { ChevronLeft, ChevronRight, X, Minus, Square, Folder, FileText, Monitor, Trash2, Book, Calculator, Globe, PaintBucket } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useTheme } from "../context/ThemeContext";

// Simple MathRenderer wrapper
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

// XP Window Component
function XPWindow({ title, icon: Icon, onClose, children, style, className = "" }: any) {
  return (
    <div 
      className={`absolute bg-[#ece9d8] border-[3px] border-[#0053e5] rounded-t-lg flex flex-col shadow-[2px_2px_10px_rgba(0,0,0,0.5)] ${className}`}
      style={style}
    >
      {/* Title Bar */}
      <div className="h-8 bg-[linear-gradient(to_bottom,#0058e6_0%,#3a93ff_8%,#288eff_40%,#127dff_88%,#036bba_100%)] flex items-center justify-between px-1 flex-shrink-0">
        <div className="flex items-center gap-1 overflow-hidden ml-1">
          {Icon && <Icon className="w-4 h-4 text-white drop-shadow" />}
          <span className="text-white font-bold text-[13px] truncate drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)] font-sans">{title}</span>
        </div>
        <div className="flex items-center gap-[2px] mr-1">
          <button className="w-5 h-5 bg-[linear-gradient(135deg,#ffffff_0%,#dca85d_20%,#dca85d_100%)] border border-white rounded-[3px] flex items-center justify-center text-white hover:brightness-110 active:brightness-90 shadow-sm"><Minus className="w-3 h-3 text-stone-900" strokeWidth={3} /></button>
          <button className="w-5 h-5 bg-[linear-gradient(135deg,#ffffff_0%,#245edb_20%,#245edb_100%)] border border-white rounded-[3px] flex items-center justify-center text-white hover:brightness-110 active:brightness-90 shadow-sm"><Square className="w-3 h-3 text-stone-900" strokeWidth={3} /></button>
          <button onClick={onClose} className="w-5 h-5 bg-[linear-gradient(135deg,#ffffff_0%,#e35a49_20%,#e35a49_100%)] border border-white rounded-[3px] flex items-center justify-center text-white hover:brightness-110 active:brightness-90 shadow-sm"><X className="w-3 h-3 text-stone-900" strokeWidth={3} /></button>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto bg-white border-2 border-[#ece9d8] relative">
        {children}
      </div>
    </div>
  );
}

type AppView = 
  | { screen: "desktop" }
  | { screen: "explorer"; volume: Volume }
  | { screen: "notepad"; volume: Volume; chapterIndex: number };

export default function ThemeWindowsXP() {
  const [view, setView] = useState<AppView>({ screen: "desktop" });
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const { setIsLightMode } = useTheme();

  // Always force light mode in Windows XP to show the wallpaper properly
  useEffect(() => {
    setIsLightMode(true);
  }, [setIsLightMode]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black font-sans select-none">
      {/* Bliss Background */}
      <div className="absolute inset-0 bg-[url('/bliss.png')] bg-cover bg-center" />
      
      {/* Desktop Icons */}
      <div className="absolute inset-0 p-4 flex flex-col gap-6 items-start flex-wrap content-start">
        <DesktopIcon icon={Monitor} label="My Computer" color="text-blue-200" fill="fill-blue-500" />
        <DesktopIcon icon={Folder} label="My Documents" color="text-yellow-200" fill="fill-yellow-500" />
        <DesktopIcon icon={Globe} label="Internet Explorer" color="text-blue-400" fill="fill-blue-600" />
        <DesktopIcon icon={Trash2} label="Recycle Bin" color="text-stone-300" fill="fill-stone-100" />
        <DesktopIcon icon={Calculator} label="Calculator" color="text-stone-400" fill="fill-stone-300" />
        <DesktopIcon icon={PaintBucket} label="Paint" color="text-pink-400" fill="fill-pink-500" />
        
        {VOLUMES.map((vol, i) => (
          <DesktopIcon 
            key={i} 
            icon={Book} 
            label={vol.name} 
            color="text-yellow-200" 
            fill="fill-yellow-500"
            onClick={() => setView({ screen: "explorer", volume: vol })}
          />
        ))}
      </div>

      {/* File Explorer (Chapters) */}
      {view.screen === "explorer" && (
        <XPWindow 
          title={`C:\\Codex\\${view.volume.name}`} 
          icon={Folder} 
          onClose={() => setView({ screen: "desktop" })}
          style={{ top: "10%", left: "10%", width: "600px", height: "400px" }}
        >
          {/* File Explorer Toolbar */}
          <div className="h-10 bg-[#ece9d8] border-b border-stone-300 flex items-center px-2 gap-2 text-sm">
            <span className="text-stone-500">File</span>
            <span className="text-stone-500">Edit</span>
            <span className="text-stone-500">View</span>
            <span className="text-stone-500">Favorites</span>
            <span className="text-stone-500">Tools</span>
            <span className="text-stone-500">Help</span>
          </div>
          <div className="h-10 bg-[#ece9d8] border-b border-stone-300 flex items-center px-2 gap-4 border-t-white border-t">
            <button onClick={() => setView({ screen: "desktop" })} className="flex items-center gap-1 hover:brightness-90 opacity-50">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"><ChevronLeft className="w-4 h-4 text-white" /></div>
              Back
            </button>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-stone-600 text-sm">Address</span>
              <div className="flex-1 bg-white border border-stone-400 h-6 flex items-center px-2 text-sm">
                C:\Codex\{view.volume.name}
              </div>
            </div>
          </div>
          
          {/* Folder Content */}
          <div className="flex flex-wrap p-4 gap-6 bg-white h-full items-start content-start">
            {view.volume.chapters.map((chap, cIdx) => (
              <div 
                key={cIdx} 
                className="flex flex-col items-center gap-1 w-24 cursor-pointer hover:bg-blue-100 p-2 rounded border border-transparent hover:border-blue-200"
                onDoubleClick={() => setView({ screen: "notepad", volume: view.volume, chapterIndex: cIdx })}
              >
                <Folder className="w-12 h-12 text-yellow-400 fill-yellow-200" />
                <span className="text-xs text-center line-clamp-2">{chap.theme}</span>
              </div>
            ))}
          </div>
        </XPWindow>
      )}

      {/* Notepad (Workspace) */}
      {view.screen === "notepad" && (
        <XPWorkspace 
          volume={view.volume} 
          chapterIndex={view.chapterIndex} 
          onClose={() => setView({ screen: "explorer", volume: view.volume })} 
        />
      )}

      {/* Start Menu Overlay */}
      {isStartMenuOpen && (
        <div className="absolute bottom-[40px] left-0 w-80 h-96 bg-white border-2 border-[#0053e5] rounded-tr-lg shadow-2xl flex flex-col z-40 overflow-hidden">
          <div className="h-16 bg-[linear-gradient(to_bottom,#0058e6_0%,#3a93ff_20%,#127dff_80%,#036bba_100%)] flex items-center px-4">
            <div className="w-10 h-10 bg-white rounded-md border-2 border-white overflow-hidden shadow">
              <div className="w-full h-full bg-orange-400 flex items-center justify-center text-white font-bold text-xl">S</div>
            </div>
            <span className="text-white font-bold text-lg ml-3 drop-shadow">Sarah</span>
          </div>
          <div className="flex-1 flex">
            <div className="flex-1 bg-white flex flex-col p-2 gap-1 border-r border-stone-200">
              <div className="p-2 hover:bg-blue-100 flex items-center gap-2 cursor-pointer rounded"><Globe className="w-8 h-8 text-blue-500" /><span className="text-sm font-bold">Internet Explorer</span></div>
              <div className="p-2 hover:bg-blue-100 flex items-center gap-2 cursor-pointer rounded"><Folder className="w-8 h-8 text-yellow-500" /><span className="text-sm font-bold">My Documents</span></div>
              <div className="p-2 hover:bg-blue-100 flex items-center gap-2 cursor-pointer rounded"><PaintBucket className="w-8 h-8 text-pink-500" /><span className="text-sm font-bold">Paint</span></div>
            </div>
            <div className="w-1/3 bg-[#d3e5fa] p-2 flex flex-col gap-2 border-l border-white shadow-inner">
               <div className="text-xs font-bold text-[#00136b] hover:underline cursor-pointer">My Computer</div>
               <div className="text-xs font-bold text-[#00136b] hover:underline cursor-pointer">Control Panel</div>
               <div className="text-xs font-bold text-[#00136b] hover:underline cursor-pointer">Search</div>
               <div className="text-xs font-bold text-[#00136b] hover:underline cursor-pointer">Run...</div>
            </div>
          </div>
          <div className="h-12 bg-[linear-gradient(to_bottom,#0058e6_0%,#3a93ff_20%,#127dff_80%,#036bba_100%)] flex justify-end items-center px-4 gap-4">
             <div className="flex items-center gap-1 cursor-pointer hover:brightness-110"><div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-white"><X className="w-4 h-4"/></div><span className="text-white text-xs">Log Off</span></div>
             <div className="flex items-center gap-1 cursor-pointer hover:brightness-110"><div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white"><Square className="w-4 h-4"/></div><span className="text-white text-xs">Turn Off</span></div>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-[linear-gradient(to_bottom,#245edb_0%,#3f8cf3_9%,#245edb_18%,#245edb_92%,#333_100%)] flex items-center z-50">
        <button 
          onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
          className={`h-full px-6 flex items-center gap-2 rounded-r-xl shadow-[inset_-2px_0_3px_rgba(0,0,0,0.2)] transition-colors ${isStartMenuOpen ? 'bg-[linear-gradient(to_bottom,#2f7d3c_0%,#378239_10%,#246125_50%,#246125_100%)]' : 'bg-[linear-gradient(to_bottom,#43b156_0%,#4ea450_10%,#379039_50%,#379039_100%)] hover:brightness-110'}`}
        >
          <div className="flex gap-0.5 transform -skew-x-12">
            <div className="w-2 h-2 bg-red-500" />
            <div className="w-2 h-2 bg-green-500" />
            <div className="w-2 h-2 bg-blue-500" />
            <div className="w-2 h-2 bg-yellow-500" />
          </div>
          <span className="text-white font-bold text-lg italic drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)]">start</span>
        </button>
        <div className="flex-1" />
        <div className="h-full px-4 flex items-center bg-[#0d87e1] border-l border-blue-400 shadow-[inset_1px_0_0_rgba(255,255,255,0.2)]">
          <span className="text-white text-xs">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}

// Workspace Component that runs inside Notepad
function XPWorkspace({ volume, chapterIndex, onClose }: { volume: Volume, chapterIndex: number, onClose: () => void }) {
  const allFragments = useMemo(() => volume.chapters.flatMap(c => c.fragments), [volume]);
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

  const handleNext = () => { if (!isLast) { setCurrentIndex(i => i + 1); setGradePhase("problem"); } };
  const handlePrev = () => { if (!isFirst) { setCurrentIndex(i => i - 1); setGradePhase("problem"); } };

  return (
    <XPWindow 
      title={`Notepad - ${fragment.id}.txt`} 
      icon={FileText} 
      onClose={onClose}
      style={{ top: "5%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "600px" }}
      className="z-40"
    >
      <div className="h-full flex flex-col font-mono text-stone-900 bg-white">
        {/* Menu Bar */}
        <div className="bg-[#ece9d8] text-xs px-2 py-1 border-b border-stone-300 flex gap-4">
          <span>File</span>
          <span>Edit</span>
          <span>Format</span>
          <span>View</span>
          <span>Help</span>
        </div>

        {/* Text Area */}
        <div className="flex-1 p-4 overflow-auto flex flex-col">
          <p className="text-stone-400 mb-4">{"// Problem Statement"}</p>
          <div className="math-lg [&_.katex]:text-2xl mb-8">
            <MathRenderer>{`$$${fragment.problem_latex}$$`}</MathRenderer>
          </div>

          <div className="mt-auto border-t border-dashed border-stone-300 pt-4">
            {gradePhase === "problem" && (
              <div className="flex flex-col gap-2">
                <span className="text-stone-400">{"// Awaiting solution generation..."}</span>
                <button 
                  onClick={() => setGradePhase("revealed")}
                  className="self-start bg-[#ece9d8] border-2 border-t-white border-l-white border-b-stone-500 border-r-stone-500 px-4 py-1 active:border-t-stone-500 active:border-l-stone-500 active:border-b-white active:border-r-white"
                >
                  Generate Solution.exe
                </button>
              </div>
            )}

            {(gradePhase === "revealed" || gradePhase === "graded") && (
              <div className="flex flex-col animate-in fade-in duration-300">
                <span className="text-stone-400 mb-4">{"// Solution Generated:"}</span>
                <div className="math-lg [&_.katex]:text-2xl text-blue-800 mb-4 flex items-center">
                  <MathRenderer>{`$$${fragment.solution_latex}$$`}</MathRenderer>
                  <span className="inline-block w-2 h-6 bg-black ml-1 animate-pulse" /> {/* Blinking cursor */}
                </div>

                {gradePhase === "revealed" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleGrade("correct")} className="bg-green-100 border border-green-500 px-2 py-1 text-green-900 hover:bg-green-200">System.exit(SUCCESS)</button>
                    <button onClick={() => handleGrade("wrong")} className="bg-red-100 border border-red-500 px-2 py-1 text-red-900 hover:bg-red-200">throw new Error()</button>
                    <button onClick={() => handleGrade("close")} className="bg-stone-100 border border-stone-400 px-2 py-1 text-stone-700 hover:bg-stone-200">close()</button>
                  </div>
                )}
                {gradePhase === "graded" && (
                   <span className="text-green-600 font-bold">{"// Execution Completed."}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-[#ece9d8] text-xs px-2 py-1 border-t border-stone-300 flex justify-between text-stone-500">
          <div className="flex gap-4">
             <button onClick={handlePrev} disabled={isFirst} className="hover:text-black disabled:opacity-50">{"<"} Prev</button>
             <button onClick={handleNext} disabled={isLast} className="hover:text-black disabled:opacity-50">Next {">"}</button>
          </div>
          <span>Ln 1, Col 1</span>
        </div>
      </div>
    </XPWindow>
  );
}

// Desktop Icon Component
function DesktopIcon({ icon: Icon, label, color, fill, onClick }: { icon: any, label: string, color: string, fill: string, onClick?: () => void }) {
  return (
    <div 
      className="flex flex-col items-center gap-1 w-24 cursor-pointer group"
      onDoubleClick={onClick}
    >
      <div className="relative">
        <Icon className={`w-14 h-14 ${color} ${fill} drop-shadow-md`} />
      </div>
      <span className="text-white text-sm text-center drop-shadow-[1px_1px_2px_rgba(0,0,0,1)] line-clamp-2 px-1 group-hover:bg-blue-600 group-hover:bg-opacity-50 group-hover:rounded">{label}</span>
    </div>
  );
}
