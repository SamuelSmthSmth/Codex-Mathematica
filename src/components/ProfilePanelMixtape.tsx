"use client";

import { X, User, LogOut, Sun, Moon, BookOpen, Clock, EyeOff, Eye, Download, Flame, FileText } from "lucide-react";
import { useProfileLogic } from "@/hooks/useProfileLogic";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanelMixtape({ isOpen, onClose }: ProfilePanelProps) {
  const {
    scholar, isGuestMode, signOut, isLightMode, toggleTheme, isFocusMode, setIsFocusMode, activeThemeName, conqueredCount, isGeneratingPdf, handleExport, handleExportPdf, handleBurn, getProviderLabel, avatarUrl
  } = useProfileLogic(isOpen);

  if (!scholar && !isGuestMode) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* ── Slide-out Panel ── */}
      <div
        className={`fixed right-0 md:right-8 top-0 md:top-8 h-full md:h-[calc(100vh-4rem)] w-full md:w-96 z-50 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
          isOpen ? "translate-x-0" : "translate-x-[120%]"
        }`}
      >
        <div className="relative w-full h-full bg-white flex flex-col shadow-[10px_10px_0_rgba(0,0,0,1)] border-4 border-black">
          
          {/* Piece of scotch tape at top */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/50 backdrop-blur-sm border border-white/80 transform -rotate-2 z-20 shadow-sm" style={{ clipPath: "polygon(5% 0%, 95% 2%, 100% 100%, 0% 98%)" }} />

          {/* Lined paper pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_27px,#60a5fa_28px)] bg-[length:100%_28px] opacity-30 pointer-events-none" />
          
          {/* Red margin line */}
          <div className="absolute top-0 bottom-0 left-8 w-px bg-red-400/80 pointer-events-none" />

          {/* Close button (drawn as an X) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 font-black text-2xl text-stone-600 hover:text-fuchsia-600 hover:scale-110 transition-all font-sans"
            style={{ fontFamily: "'Comic Sans MS', 'Marker Felt', sans-serif" }}
          >
            X
          </button>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 pl-12 pt-10 relative z-10 pb-20">
            
            {/* Header / Polaroids */}
            <div className="mb-10 relative">
              <div className="inline-block relative transform -rotate-3 z-10">
                <div className="bg-white p-2 pb-8 border border-stone-200 shadow-md">
                   <div className="w-24 h-24 bg-stone-100 overflow-hidden relative border border-stone-200">
                     {avatarUrl ? (
                       <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover filter contrast-125 saturate-50" />
                     ) : (
                       <User size={40} className="absolute inset-0 m-auto text-stone-400" />
                     )}
                   </div>
                   <div className="absolute bottom-2 left-0 right-0 text-center font-bold text-stone-600 text-sm" style={{ fontFamily: "'Comic Sans MS', 'Marker Felt', sans-serif" }}>
                     Me
                   </div>
                </div>
                {/* Tape on polaroid */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/50 backdrop-blur-sm border border-white/80 rotate-3 z-20" />
              </div>

              <div className="absolute top-4 left-32">
                <h2 
                  className="font-black text-3xl text-fuchsia-600 uppercase"
                  style={{ fontFamily: "'Comic Sans MS', 'Marker Felt', sans-serif", textShadow: "2px 2px 0px rgba(0,0,0,1)" }}
                >
                  {scholar?.displayName || "Guest"}
                </h2>
                <p className="font-bold text-stone-600 text-sm mt-1 uppercase tracking-widest bg-yellow-200 inline-block px-1 transform rotate-1">
                  ID: {getProviderLabel()}
                </p>
              </div>
            </div>

            {/* Scribbled Sections */}
            <div className="flex flex-col gap-6 font-sans font-bold text-stone-700">
              
              {/* Settings Section */}
              <div className="relative">
                <h3 className="text-xl text-blue-600 uppercase mb-4 inline-block" style={{ fontFamily: "'Comic Sans MS', 'Marker Felt', sans-serif", borderBottom: "3px solid #3b82f6" }}>
                  Settings
                </h3>
                
                <div className="flex flex-col gap-3">
                  <button onClick={toggleTheme} className="group flex items-center justify-between w-full hover:translate-x-1 transition-transform text-left">
                    <span className="flex items-center gap-3">
                      {isLightMode ? <Sun size={18} className="text-stone-800" /> : <Moon size={18} className="text-stone-800" />}
                      Lighting
                    </span>
                    <span className="text-fuchsia-600 px-2 py-0.5 border-2 border-fuchsia-600 rounded-sm transform rotate-1 group-hover:rotate-0 transition-transform">
                      {activeThemeName}
                    </span>
                  </button>

                  <button onClick={() => setIsFocusMode(!isFocusMode)} className="group flex items-center justify-between w-full hover:translate-x-1 transition-transform text-left">
                    <span className="flex items-center gap-3">
                      {isFocusMode ? <Eye size={18} className="text-stone-800" /> : <EyeOff size={18} className="text-stone-800" />}
                      Focus Mode
                    </span>
                    <span className="text-stone-500 uppercase">
                      {isFocusMode ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Data Section */}
              {!isGuestMode && (
                <div className="relative mt-4">
                  <h3 className="text-xl text-green-600 uppercase mb-4 inline-block" style={{ fontFamily: "'Comic Sans MS', 'Marker Felt', sans-serif", borderBottom: "3px solid #22c55e" }}>
                    Export
                  </h3>
                  
                  <div className="flex flex-col gap-3">
                    <button onClick={handleExport} className="flex items-center gap-3 hover:text-green-600 hover:translate-x-1 transition-transform text-left">
                      <Download size={18} />
                      Download JSON Backup
                    </button>

                    <button onClick={handleExportPdf} disabled={isGeneratingPdf} className="flex items-center gap-3 hover:text-green-600 hover:translate-x-1 transition-transform text-left disabled:opacity-50 disabled:cursor-wait">
                      <FileText size={18} />
                      {isGeneratingPdf ? "Printing PDF..." : "Export PDF Printout"}
                    </button>
                  </div>
                </div>
              )}

              {/* Stats Section */}
              <div className="relative mt-4">
                <h3 className="text-xl text-orange-500 uppercase mb-4 inline-block" style={{ fontFamily: "'Comic Sans MS', 'Marker Felt', sans-serif", borderBottom: "3px solid #f97316" }}>
                  Stats
                </h3>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} /> HW Completed: 
                    <span className="bg-yellow-200 px-2 py-0.5 text-black border border-black transform -rotate-2 ml-2">
                      {conqueredCount !== null ? conqueredCount : "..."}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-stone-500 text-sm">
                    <Clock size={16} /> Enrolled: Since Day 1
                  </div>
                </div>
              </div>

            </div>

            {/* Footer / Actions */}
            <div className="mt-12 space-y-4">
              {!isGuestMode && (
                <button
                  onClick={handleBurn}
                  className="w-full flex items-center justify-center gap-2 py-3 uppercase tracking-wider font-bold transition-all border-4 border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded shadow-[4px_4px_0_rgba(239,68,68,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1"
                >
                  <Flame size={18} /> Burn Homework (Reset)
                </button>
              )}
              
              <button
                onClick={() => {
                  onClose();
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 uppercase tracking-wider font-bold transition-all bg-black text-white rounded shadow-[4px_4px_0_rgba(236,72,153,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 hover:bg-fuchsia-600"
              >
                <LogOut size={18} /> Ditch Class (Log Out)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
