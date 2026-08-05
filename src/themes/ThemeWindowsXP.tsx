import React, { useState, useEffect, useMemo } from "react";
import { VOLUMES, type Volume } from "@/data/codex-data";
import { useProgress } from "@/context/ProgressContext";
import { useWorkspaceLogic } from "../hooks/useWorkspaceLogic";
import { ChevronLeft, X, Minus, Square, Folder, FileText, Monitor, Trash2, Book, Calculator, Globe, PaintBucket, BookOpen, ShoppingBag, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useTheme } from "../context/ThemeContext";
import { AppArea, ThemeProps } from "@/components/ThemeRoot";
import LibraryViewWindowsXP from "@/components/LibraryViewWindowsXP";
import ShopLayoutWindowsXP from "@/components/ShopLayoutWindowsXP";
import ProfilePanelWindowsXP from "@/components/ProfilePanelWindowsXP";

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

function useDraggable() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on left click
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startOffset = offset;
    
    const handlePointerMove = (moveEvent: PointerEvent) => {
      setOffset({
        x: startOffset.x + (moveEvent.clientX - startX),
        y: startOffset.y + (moveEvent.clientY - startY)
      });
    };
    
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };
  
  return { offset, handlePointerDown };
}

function XPWindow({ title, icon: Icon, onClose, children, style, className = "", onPointerDown }: { title: string, icon: React.ElementType, onClose: () => void, children?: React.ReactNode, style?: React.CSSProperties, className?: string, onPointerDown?: () => void }) {
  const { offset, handlePointerDown } = useDraggable();

  return (
    <div 
      onPointerDownCapture={onPointerDown}
      className={`absolute bg-[#ece9d8] border-[3px] border-[#0053e5] rounded-t-lg flex flex-col shadow-[2px_2px_10px_rgba(0,0,0,0.5)] ${className}`}
      style={{
        ...style,
        transform: style?.transform 
          ? `${style.transform} translate(${offset.x}px, ${offset.y}px)` 
          : `translate(${offset.x}px, ${offset.y}px)`
      }}
    >
      {/* Title Bar */}
      <div 
        onPointerDown={handlePointerDown}
        className="h-8 bg-[linear-gradient(to_bottom,#0058e6_0%,#3a93ff_8%,#288eff_40%,#127dff_88%,#036bba_100%)] flex items-center justify-between px-1 flex-shrink-0 cursor-move"
      >
        <div className="flex items-center gap-1 overflow-hidden ml-1 pointer-events-none">
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


export default function ThemeWindowsXP({ activeArea, onSelectArea, onOpenProfile, isProfileOpen, onCloseProfile }: ThemeProps) {
  const [explorerVolume, setExplorerVolume] = useState<Volume | null>(null);
  const [notepadContext, setNotepadContext] = useState<{ volume: Volume, chapterIndex: number } | null>(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  
  // Calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcNewNum, setCalcNewNum] = useState(true);

  // Window Management
  const [windowOrder, setWindowOrder] = useState<string[]>([]);
  const bringToFront = (id: string) => {
    setWindowOrder(prev => {
      const next = prev.filter(x => x !== id);
      return [...next, id];
    });
  };
  const getZIndex = (id: string) => windowOrder.indexOf(id) + 10;

  const { setIsLightMode } = useTheme();
  const { ownedItems } = useProgress();
  const baseVolumes = ["alpha", "delta", "sigma", "gamma"];
  const visibleVolumes = VOLUMES.filter(v => baseVolumes.includes(v.id) || ownedItems.has(v.id));

  useEffect(() => { if (activeArea === 'library') bringToFront('library'); }, [activeArea]); // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => { if (activeArea === 'shop') bringToFront('shop'); }, [activeArea]); // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => { if (explorerVolume) bringToFront('explorer'); }, [explorerVolume]); // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => { if (notepadContext) bringToFront('notepad'); }, [notepadContext]); // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => { if (isCalcOpen) bringToFront('calculator'); }, [isCalcOpen]); // eslint-disable-line react-hooks/set-state-in-effect

  // Derived open windows list for taskbar
  const openWindows = useMemo(() => {
    const wins = [];
    if (activeArea === 'library') wins.push({ id: 'library', title: 'C:\\My Documents\\Library', icon: Folder });
    if (activeArea === 'shop') wins.push({ id: 'shop', title: 'Storefront - Internet Explorer', icon: Globe });
    if (explorerVolume) wins.push({ id: 'explorer', title: `C:\\Codex\\${explorerVolume.name}`, icon: Folder });
    if (notepadContext) wins.push({ id: 'notepad', title: `Notepad`, icon: FileText });
    if (isCalcOpen) wins.push({ id: 'calculator', title: 'Calculator', icon: Calculator });
    return wins;
  }, [activeArea, explorerVolume, notepadContext, isCalcOpen]);

  const handleCalcButton = (btn: string) => {
    if (btn === 'C') {
      setCalcDisplay('0'); setCalcOp(null); setCalcPrev(null); setCalcNewNum(true);
    } else if (['+', '-', '*', '/'].includes(btn)) {
      if (calcOp && !calcNewNum) {
        const prev = calcPrev ?? 0;
        const curr = parseFloat(calcDisplay);
        let res = 0;
        if (calcOp === '+') res = prev + curr;
        if (calcOp === '-') res = prev - curr;
        if (calcOp === '*') res = prev * curr;
        if (calcOp === '/') res = prev / curr;
        setCalcDisplay(String(res));
        setCalcPrev(res);
      } else {
        setCalcPrev(parseFloat(calcDisplay));
      }
      setCalcOp(btn);
      setCalcNewNum(true);
    } else if (btn === '=') {
      if (calcOp && calcPrev !== null) {
        const prev = calcPrev;
        const curr = parseFloat(calcDisplay);
        let res = 0;
        if (calcOp === '+') res = prev + curr;
        if (calcOp === '-') res = prev - curr;
        if (calcOp === '*') res = prev * curr;
        if (calcOp === '/') res = prev / curr;
        setCalcDisplay(String(res));
        setCalcPrev(res);
        setCalcOp(null);
        setCalcNewNum(true);
      }
    } else {
      if (calcNewNum) {
        setCalcDisplay(btn === '.' ? '0.' : btn);
        setCalcNewNum(false);
      } else {
        setCalcDisplay(calcDisplay === '0' && btn !== '.' ? btn : calcDisplay + btn);
      }
    }
  };

  // Always force light mode in Windows XP to show the wallpaper properly
  useEffect(() => {
    setIsLightMode(true);
  }, [setIsLightMode]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black font-sans select-none">
      {/* Bliss Background */}
      <div className="absolute inset-0 bg-[url('/bliss.png')] bg-cover bg-center" />
      
      {/* Desktop Icons */}
      <div id="tour-volume-shelf" className="absolute inset-0 p-4 flex flex-col gap-6 items-start flex-wrap content-start">
        <DesktopIcon icon={Monitor} label="My Computer" color="text-blue-200" fill="fill-blue-500" onClick={() => onSelectArea("archive")} />
        <DesktopIcon icon={Folder} label="My Documents" color="text-yellow-200" fill="fill-yellow-500" onClick={() => onSelectArea("archive")} />
        <DesktopIcon icon={Globe} label="Internet Explorer" color="text-blue-400" fill="fill-blue-600" onClick={() => onSelectArea("library")} />
        <DesktopIcon icon={Trash2} label="Recycle Bin" color="text-stone-300" fill="fill-stone-100" />
        <DesktopIcon icon={Calculator} label="Calculator" color="text-stone-400" fill="fill-stone-300" onClick={() => setIsCalcOpen(true)} />
        <DesktopIcon icon={PaintBucket} label="Paint" color="text-pink-400" fill="fill-pink-500" />
        <DesktopIcon icon={BookOpen} label="My Library" color="text-green-300" fill="fill-green-600" onClick={() => onSelectArea("library")} />
        <DesktopIcon icon={ShoppingBag} label="Store" color="text-purple-300" fill="fill-purple-600" onClick={() => onSelectArea("shop")} />
        <DesktopIcon icon={User} label="Profile" color="text-stone-200" fill="fill-blue-400" onClick={onOpenProfile} />
        
        {visibleVolumes.map((vol, i) => (
          <DesktopIcon 
            key={i} 
            icon={Book} 
            label={vol.name} 
            color="text-yellow-200" 
            fill="fill-yellow-500"
            onClick={() => setExplorerVolume(vol)}
          />
        ))}
      </div>

      {/* Library Window */}
      {activeArea === "library" && (
        <XPWindow 
          title="C:\My Documents\Library" 
          icon={Folder} 
          onClose={() => onSelectArea("archive")}
          onPointerDown={() => bringToFront('library')}
          style={{ top: "5%", left: "5%", width: "90%", height: "85%", zIndex: getZIndex('library') }}
        >
          <div className="h-10 bg-[#ece9d8] border-b border-stone-300 flex items-center px-2 gap-2 text-sm">
            <span className="text-stone-500">File</span>
            <span className="text-stone-500">Edit</span>
            <span className="text-stone-500">View</span>
            <span className="text-stone-500">Favorites</span>
            <span className="text-stone-500">Tools</span>
            <span className="text-stone-500">Help</span>
          </div>
          <div className="h-10 bg-[#ece9d8] border-b border-stone-300 flex items-center px-2 gap-4 border-t-white border-t">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-stone-600 text-sm">Address</span>
              <div className="flex-1 bg-white border border-stone-400 h-6 flex items-center px-2 text-sm">
                C:\\\\My Documents\\\\Library
              </div>
            </div>
          </div>
          <div className="h-[calc(100%-5rem)] bg-white overflow-hidden relative">
            <LibraryViewWindowsXP />
          </div>
        </XPWindow>
      )}

      {/* Shop Window */}
      {activeArea === "shop" && (
        <XPWindow 
          title="Storefront - Internet Explorer" 
          icon={Globe} 
          onClose={() => onSelectArea("archive")}
          onPointerDown={() => bringToFront('shop')}
          style={{ top: "10%", left: "10%", width: "80%", height: "80%", zIndex: getZIndex('shop') }}
        >
          <div className="h-10 bg-[#ece9d8] border-b border-stone-300 flex items-center px-2 gap-2 text-sm">
            <span className="text-stone-500">File</span>
            <span className="text-stone-500">Edit</span>
            <span className="text-stone-500">View</span>
            <span className="text-stone-500">Favorites</span>
            <span className="text-stone-500">Tools</span>
            <span className="text-stone-500">Help</span>
          </div>
          <div className="h-10 bg-[#ece9d8] border-b border-stone-300 flex items-center px-2 gap-4 border-t-white border-t">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-stone-600 text-sm">Address</span>
              <div className="flex-1 bg-white border border-stone-400 h-6 flex items-center px-2 text-sm">
                http://localhost/store
              </div>
            </div>
          </div>
          <div className="h-[calc(100%-5rem)] bg-white overflow-hidden relative">
            <ShopLayoutWindowsXP />
          </div>
        </XPWindow>
      )}

      {/* File Explorer (Chapters) */}
      {explorerVolume && (
        <XPWindow 
          title={`C:\\Codex\\${explorerVolume.name}`} 
          icon={Folder} 
          onClose={() => setExplorerVolume(null)}
          onPointerDown={() => bringToFront('explorer')}
          style={{ top: "10%", left: "10%", width: "600px", height: "400px", zIndex: getZIndex('explorer') }}
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
            <button onClick={() => setExplorerVolume(null)} className="flex items-center gap-1 hover:brightness-90 opacity-50">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"><ChevronLeft className="w-4 h-4 text-white" /></div>
              Back
            </button>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-stone-600 text-sm">Address</span>
              <div className="flex-1 bg-white border border-stone-400 h-6 flex items-center px-2 text-sm text-black">
                C:\Codex\{explorerVolume.name}
              </div>
            </div>
          </div>
          
          {/* Folder Content */}
          <div className="flex flex-wrap p-4 gap-6 bg-white h-[calc(100%-5rem)] overflow-y-auto items-start content-start">
            {explorerVolume.chapters.map((chap, cIdx) => {
              if (chap.packId && !ownedItems.has(chap.packId)) return null;
              return (
              <div 
                key={cIdx} 
                className="flex flex-col items-center gap-1 w-24 cursor-pointer hover:bg-blue-100 p-2 rounded border border-transparent hover:border-blue-200 relative"
                onDoubleClick={() => setNotepadContext({ volume: explorerVolume, chapterIndex: cIdx })}
              >
                <Folder className="w-12 h-12 text-yellow-400 fill-yellow-200" />
                <span className="text-black text-xs text-center line-clamp-2">{chap.theme}</span>
                {chap.packId && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[0.45rem] px-1 py-0.5 rounded shadow">EXP</span>
                )}
              </div>
            )})}
          </div>
        </XPWindow>
      )}

      {notepadContext && (
        <XPWorkspace 
          volume={notepadContext.volume} 
          chapterIndex={notepadContext.chapterIndex} 
          onClose={() => setNotepadContext(null)} 
          onPointerDown={() => bringToFront('notepad')}
          style={{ zIndex: getZIndex('notepad') }}
        />
      )}

      {/* Calculator Window */}
      {isCalcOpen && (
        <XPWindow
          title="Calculator"
          icon={Calculator}
          onClose={() => setIsCalcOpen(false)}
          onPointerDown={() => bringToFront('calculator')}
          style={{ top: "20%", left: "20%", width: "250px", height: "auto", zIndex: getZIndex('calculator') }}
        >
          <div className="p-2 bg-[#ece9d8] flex flex-col gap-2">
            <div className="bg-white border-2 border-stone-400 border-t-stone-500 border-l-stone-500 text-right p-1 text-black font-sans text-xl h-8 flex items-center justify-end overflow-hidden">
              {calcDisplay}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(btn => (
                <button key={btn} onClick={() => handleCalcButton(btn)} className="bg-[#d4d0c8] border-2 border-white border-b-stone-500 border-r-stone-500 active:border-t-stone-500 active:border-l-stone-500 active:border-b-white active:border-r-white w-full h-8 text-black font-bold flex items-center justify-center shadow-sm">
                  {btn}
                </button>
              ))}
              <button onClick={() => handleCalcButton('C')} className="col-span-4 bg-[#d4d0c8] border-2 border-white border-b-stone-500 border-r-stone-500 active:border-t-stone-500 active:border-l-stone-500 active:border-b-white active:border-r-white h-8 text-red-700 font-bold flex items-center justify-center shadow-sm mt-1">
                C
              </button>
            </div>
          </div>
        </XPWindow>
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
              <div className="p-2 hover:bg-blue-100 flex items-center gap-2 cursor-pointer rounded" onClick={() => { onSelectArea('library'); setIsStartMenuOpen(false); }}><Globe className="w-8 h-8 text-blue-500" /><span className="text-sm font-bold text-black">Internet Explorer</span></div>
              <div className="p-2 hover:bg-blue-100 flex items-center gap-2 cursor-pointer rounded" onClick={() => { onSelectArea('archive'); setIsStartMenuOpen(false); }}><Folder className="w-8 h-8 text-yellow-500" /><span className="text-sm font-bold text-black">My Documents</span></div>
              <div className="p-2 hover:bg-blue-100 flex items-center gap-2 cursor-pointer rounded" onClick={() => { onSelectArea('shop'); setIsStartMenuOpen(false); }}><ShoppingBag className="w-8 h-8 text-purple-500" /><span className="text-sm font-bold text-black">Store</span></div>
              <div className="p-2 hover:bg-blue-100 flex items-center gap-2 cursor-pointer rounded" onClick={() => { onOpenProfile?.(); setIsStartMenuOpen(false); }}><User className="w-8 h-8 text-blue-400" /><span className="text-sm font-bold text-black">User Profile</span></div>
            </div>
            <div className="w-1/3 bg-[#d3e5fa] p-2 flex flex-col gap-2 border-l border-white shadow-inner">
               <div className="text-xs font-bold text-[#00136b] hover:underline cursor-pointer" onClick={() => { onSelectArea('archive'); setIsStartMenuOpen(false); }}>My Computer</div>
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
        <div className="flex-1 flex items-center h-full px-2 gap-1 overflow-x-auto">
          {openWindows.map(win => (
            <button 
              key={win.id}
              onClick={() => bringToFront(win.id)}
              className={`h-[30px] min-w-[120px] max-w-[160px] px-2 flex items-center gap-1 rounded-sm border-2 ${
                windowOrder[windowOrder.length - 1] === win.id 
                  ? 'bg-[#d4d0c8] border-t-stone-500 border-l-stone-500 border-b-white border-r-white active:bg-[#d4d0c8]' 
                  : 'bg-[#ece9d8] border-t-white border-l-white border-b-stone-500 border-r-stone-500 hover:bg-[#f0ede1]'
              } text-black`}
            >
              <win.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs truncate">{win.title}</span>
            </button>
          ))}
        </div>
        <div className="h-full px-4 flex items-center bg-[#0d87e1] border-l border-blue-400 shadow-[inset_1px_0_0_rgba(255,255,255,0.2)]">
          <span className="text-white text-xs">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <ProfilePanelWindowsXP isOpen={isProfileOpen} onClose={onCloseProfile} />
    </div>
  );
}

// Workspace Component that runs inside Notepad
function XPWorkspace({ volume, chapterIndex, onClose, onPointerDown, style }: { volume: Volume, chapterIndex: number, onClose: () => void, onPointerDown?: () => void, style?: React.CSSProperties }) {
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

  const [userAnswer, setUserAnswer] = useState("");
  useEffect(() => {
    if (gradePhase === "problem") {
      setUserAnswer("");
    }
  }, [gradePhase]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === allFragments.length - 1;

  const handleNext = () => { if (!isLast) { setCurrentIndex(i => i + 1); setGradePhase("problem"); } };
  const handlePrev = () => { if (!isFirst) { setCurrentIndex(i => i - 1); setGradePhase("problem"); } };

  return (
    <XPWindow 
      title={`Notepad - ${fragment.id}.txt`} 
      icon={FileText} 
      onClose={onClose}
      onPointerDown={onPointerDown}
      style={{ top: "5%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "600px", ...style }}
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
          <div className="math-lg text-black [&_.katex]:text-black [&_.katex]:text-2xl mb-8">
            <MathRenderer>{`$$${fragment.problem_latex}$$`}</MathRenderer>
          </div>

          <div className="mt-auto border-t border-dashed border-stone-300 pt-4">
            {gradePhase === "problem" && (
              <div className="flex flex-col gap-2">
                {fragment.answer_type === "hybrid" ? (
                  <form onSubmit={(e) => { e.preventDefault(); setGradePhase("revealed"); }} className="flex flex-col gap-2 w-full">
                    <span className="text-stone-400">{"// Input required:"}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">{">"}</span>
                      <input 
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder={fragment.answer_hint || "Type here"}
                        className="flex-1 bg-transparent border-none outline-none font-mono"
                        autoFocus
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!userAnswer.trim()}
                      className="self-start bg-[#ece9d8] border-2 border-t-white border-l-white border-b-stone-500 border-r-stone-500 px-4 py-1 active:border-t-stone-500 active:border-l-stone-500 active:border-b-white active:border-r-white disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Check Answer.exe
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="text-stone-400">{"// Awaiting solution generation..."}</span>
                    <button 
                      onClick={() => setGradePhase("revealed")}
                      className="self-start bg-[#ece9d8] border-2 border-t-white border-l-white border-b-stone-500 border-r-stone-500 px-4 py-1 active:border-t-stone-500 active:border-l-stone-500 active:border-b-white active:border-r-white"
                    >
                      Generate Solution.exe
                    </button>
                  </>
                )}
              </div>
            )}

            {(gradePhase === "revealed" || gradePhase === "graded") && (
              <div className="flex flex-col animate-in fade-in duration-300">
                {fragment.answer_type === "hybrid" && (
                  <div className="mb-4">
                     <span className="text-stone-400">{"// User Input:"}</span>
                     <div className="text-stone-900 font-bold">{userAnswer}</div>
                  </div>
                )}
                <span className="text-stone-400 mb-4">{"// Solution Generated:"}</span>
                <div className="math-lg [&_.katex]:text-blue-800 [&_.katex]:text-2xl text-blue-800 mb-4 flex items-center">
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
function DesktopIcon({ icon: Icon, label, color, fill, onClick }: { icon: React.ElementType, label: string, color: string, fill: string, onClick?: () => void }) {
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
