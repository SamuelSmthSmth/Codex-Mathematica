"use client";

import { X, User, LogOut, Sun, Moon, BookOpen, Clock, EyeOff, Eye, Download, Flame, FileText } from "lucide-react";
import { useProfileLogic } from "@/hooks/useProfileLogic";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanelDiner({ isOpen, onClose }: ProfilePanelProps) {
  const {
    scholar, isGuestMode, signOut, isLightMode, toggleTheme, isFocusMode, setIsFocusMode, activeThemeName, conqueredCount, isGeneratingPdf, handleExport, handleExportPdf, handleBurn, getProviderLabel, avatarUrl
  } = useProfileLogic(isOpen);

  if (!scholar && !isGuestMode) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* ── Slide-out Panel ── */}
      <div
        className={`fixed right-0 md:right-8 top-0 md:top-8 h-full md:h-[calc(100vh-4rem)] w-full md:w-96 z-50 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
          isOpen ? "translate-x-0" : "translate-x-[120%]"
        }`}
      >
        <div className="relative w-full h-full bg-[#fdfbe9] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:rounded-b-none border-l-2 border-stone-200">
          {/* Paper texture overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] opacity-30 pointer-events-none" />
          
          {/* Jagged top edge (if floating) or simple border */}
          <div className="hidden md:block absolute -top-3 left-0 right-0 h-4 bg-repeat-x" style={{ 
            backgroundImage: "linear-gradient(135deg, transparent 75%, #fdfbe9 75%), linear-gradient(-135deg, transparent 75%, #fdfbe9 75%)",
            backgroundSize: "16px 16px"
          }} />

          {/* Jagged bottom edge */}
          <div className="absolute -bottom-3 left-0 right-0 h-4 bg-repeat-x z-10" style={{ 
            backgroundImage: "linear-gradient(-45deg, transparent 75%, #fdfbe9 75%), linear-gradient(45deg, transparent 75%, #fdfbe9 75%)",
            backgroundSize: "16px 16px"
          }} />

          {/* Red line down the left side */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-red-200/80 z-0" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-stone-400 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 pt-12 relative z-10 pb-20">
            
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-stone-300 border-dashed pb-6">
              <h2 className="font-mono text-2xl font-black text-stone-800 uppercase tracking-[0.2em] mb-2">GUEST CHECK</h2>
              <p className="font-mono text-xs text-stone-500 uppercase tracking-widest font-bold">Table {conqueredCount || 1} • {getProviderLabel()}</p>
              
              <div className="mt-6 flex justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-stone-200 shadow-inner overflow-hidden flex items-center justify-center bg-stone-100 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden border border-stone-300">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover filter sepia-[0.3]" />
                    ) : (
                      <User size={32} className="text-stone-400 m-auto mt-3" strokeWidth={1.5} />
                    )}
                  </div>
                </div>
              </div>
              <p className="font-mono text-xl font-bold text-stone-800 mt-4 underline decoration-stone-300 underline-offset-4">
                {scholar?.displayName || "Guest"}
              </p>
            </div>

            {/* Line Items */}
            <div className="flex flex-col gap-6">
              
              {/* Settings Section */}
              <div>
                <p className="font-mono text-xs font-bold text-red-400 tracking-widest uppercase mb-3 px-2">Table Settings</p>
                <div className="flex flex-col gap-1">
                  
                  {/* Theme Toggle */}
                  <button onClick={toggleTheme} className="group flex items-center justify-between w-full p-2 hover:bg-red-50 rounded transition-colors text-left font-mono">
                    <span className="flex items-center gap-3 text-stone-700 font-bold text-sm">
                      {isLightMode ? <Sun size={16} className="text-red-500" /> : <Moon size={16} className="text-stone-400" />}
                      Lighting
                    </span>
                    <span className="text-stone-500 text-xs tracking-widest border-b border-dotted border-stone-400 group-hover:border-red-400">
                      {activeThemeName.toUpperCase()}
                    </span>
                  </button>

                  {/* Focus Mode */}
                  <button onClick={() => setIsFocusMode(!isFocusMode)} className="group flex items-center justify-between w-full p-2 hover:bg-red-50 rounded transition-colors text-left font-mono">
                    <span className="flex items-center gap-3 text-stone-700 font-bold text-sm">
                      {isFocusMode ? <Eye size={16} className="text-red-500" /> : <EyeOff size={16} className="text-stone-400" />}
                      Focus Mode
                    </span>
                    <span className="text-stone-500 text-xs tracking-widest border-b border-dotted border-stone-400 group-hover:border-red-400">
                      {isFocusMode ? "ON" : "OFF"}
                    </span>
                  </button>
                  
                </div>
              </div>

              {/* Data Section */}
              {!isGuestMode && (
                <div>
                  <p className="font-mono text-xs font-bold text-red-400 tracking-widest uppercase mb-3 px-2 mt-4">Order History</p>
                  <div className="flex flex-col gap-1">
                    
                    <button onClick={handleExport} className="group flex items-center justify-between w-full p-2 hover:bg-red-50 rounded transition-colors text-left font-mono">
                      <span className="flex items-center gap-3 text-stone-700 font-bold text-sm">
                        <Download size={16} className="text-stone-400 group-hover:text-red-500 transition-colors" />
                        Takeout Receipt (JSON)
                      </span>
                    </button>

                    <button onClick={handleExportPdf} disabled={isGeneratingPdf} className="group flex items-center justify-between w-full p-2 hover:bg-red-50 rounded transition-colors text-left font-mono disabled:opacity-50 disabled:cursor-wait">
                      <span className="flex items-center gap-3 text-stone-700 font-bold text-sm">
                        <FileText size={16} className="text-stone-400 group-hover:text-red-500 transition-colors" />
                        {isGeneratingPdf ? "Printing..." : "Formal Menu (PDF)"}
                      </span>
                    </button>

                  </div>
                </div>
              )}

              {/* Stats Section */}
              <div>
                <p className="font-mono text-xs font-bold text-red-400 tracking-widest uppercase mb-3 px-2 mt-4">Totals</p>
                <div className="flex justify-between items-end p-2 px-3 border-t-2 border-b-2 border-stone-800 border-double py-3">
                  <span className="font-mono text-stone-600 font-bold text-sm flex items-center gap-2">
                    <BookOpen size={14} /> Plates Cleared
                  </span>
                  <span className="font-mono text-xl font-black text-stone-900">
                    {conqueredCount !== null ? conqueredCount : "..."}
                  </span>
                </div>
                <div className="flex justify-between items-end p-2 px-3">
                  <span className="font-mono text-stone-600 font-bold text-sm flex items-center gap-2">
                    <Clock size={14} /> Time Sat
                  </span>
                  <span className="font-mono text-sm font-bold text-stone-500">
                    Since Arrival
                  </span>
                </div>
              </div>

            </div>

            {/* Footer / Danger Zone */}
            <div className="mt-12 pt-6 border-t border-stone-300 border-dashed">
              {!isGuestMode && (
                <button
                  onClick={handleBurn}
                  className="w-full flex items-center justify-center gap-2 py-4 mb-4 uppercase tracking-widest font-mono font-bold text-sm transition-all duration-200 border-2 border-dashed border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500"
                >
                  <Flame size={16} /> Cancel Order (Reset)
                </button>
              )}
              
              <button
                onClick={() => {
                  onClose();
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-2 py-4 uppercase tracking-widest font-mono font-bold text-sm transition-all duration-200 bg-stone-900 text-white shadow-[4px_4px_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0_rgba(0,0,0,0.2)] active:translate-y-[4px] active:shadow-none rounded"
              >
                <LogOut size={16} /> Pay & Leave
              </button>
            </div>
            
            <p className="font-mono text-xs text-center mt-8 text-stone-400 font-bold uppercase tracking-widest mb-4">
              Thank You! Call Again
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
