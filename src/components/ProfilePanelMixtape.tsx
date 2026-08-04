"use client";

import { useProfileLogic } from "@/hooks/useProfileLogic";
import { User, LogOut, FileText, Monitor, Flame } from "lucide-react";

export default function ProfilePanelMixtape({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const {
    scholar, isGuestMode, signOut, isLightMode, toggleTheme, isFocusMode, setIsFocusMode, conqueredCount, isGeneratingPdf, editedName, setEditedName, handleExportPdf, handleBurn, handleUpdateName, getProviderLabel, avatarUrl
  } = useProfileLogic(isOpen);

  if (!isOpen || (!scholar && !isGuestMode)) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-300">
        
        {/* Cassette Tape Container */}
        <div className="w-[500px] h-[320px] bg-stone-900 rounded-xl border-4 border-stone-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative p-4 flex flex-col items-center justify-between">
          
          {/* Cassette Tape Top Screws */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-stone-800 shadow-inner flex items-center justify-center">
            <div className="w-2 h-0.5 bg-stone-900 rotate-45" />
          </div>
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-stone-800 shadow-inner flex items-center justify-center">
            <div className="w-2 h-0.5 bg-stone-900 -rotate-45" />
          </div>
          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-stone-800 shadow-inner flex items-center justify-center">
            <div className="w-2 h-0.5 bg-stone-900 rotate-12" />
          </div>
          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-stone-800 shadow-inner flex items-center justify-center">
            <div className="w-2 h-0.5 bg-stone-900 -rotate-12" />
          </div>

          {/* Masking Tape Label (Main Content) */}
          <div className="w-full h-full bg-[#e8e4d8] rounded-md shadow-inner relative p-4 font-mono text-stone-800 overflow-hidden"
               style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 23px, rgba(0,0,0,0.1) 24px)" }}>
            
            <div className="flex justify-between items-start mb-4 border-b-2 border-stone-400 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-stone-300 border-2 border-stone-400 shadow-inner rotate-3 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-2xl text-stone-500 opacity-50">{(scholar?.displayName || "G")[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-widest text-sm text-stone-600">A-SIDE // SCHOLAR</span>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleUpdateName}
                    disabled={isGuestMode}
                    className="bg-transparent font-black text-xl w-48 outline-none border-none placeholder-stone-400 uppercase text-blue-900"
                  />
                  <span className="text-[0.65rem] font-bold text-stone-500 uppercase">{getProviderLabel()}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="font-bold text-[0.65rem] tracking-widest uppercase text-stone-500">Proofs</span>
                <span className="font-black text-3xl text-red-600">{conqueredCount ?? 0}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 px-2">
              <div className="flex flex-col gap-2">
                <span className="font-bold text-[0.65rem] tracking-widest text-stone-500 uppercase">Tracklist Settings</span>
                <button 
                  onClick={toggleTheme}
                  className="text-left font-bold text-sm uppercase hover:text-blue-700 transition-colors flex justify-between"
                >
                  <span>Night Mode</span>
                  <span>[{!isLightMode ? "X" : " "}]</span>
                </button>
                <button 
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className="text-left font-bold text-sm uppercase hover:text-blue-700 transition-colors flex justify-between"
                >
                  <span>Focus Play</span>
                  <span>[{isFocusMode ? "X" : " "}]</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold text-[0.65rem] tracking-widest text-stone-500 uppercase">System</span>
                <button 
                  onClick={handleExportPdf}
                  disabled={isGeneratingPdf}
                  className="text-left font-bold text-sm uppercase hover:text-blue-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Print Grimoire
                </button>
                <button 
                  onClick={handleBurn}
                  className="text-left font-bold text-sm uppercase text-red-600 hover:text-red-800 transition-colors flex items-center gap-2"
                >
                  <Flame className="w-4 h-4" /> Erase Tape
                </button>
                <button 
                  onClick={signOut}
                  className="text-left font-bold text-sm uppercase mt-2 pt-2 border-t-2 border-dashed border-stone-400 hover:text-red-600 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Eject (Log Out)
                </button>
              </div>
            </div>

            {/* Cassette Center Window (Cutout) */}
            <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[240px] h-[60px] bg-stone-900 rounded-t-xl border-4 border-b-0 border-stone-800 flex justify-between px-6 items-center shadow-[inset_0_5px_10px_rgba(0,0,0,0.8)]">
              {/* Spools */}
              <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-stone-700 relative flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-stone-900" />
                <div className="absolute w-full h-0.5 bg-stone-900" />
                <div className="absolute h-full w-0.5 bg-stone-900" />
              </div>
              <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-stone-700 relative flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-stone-900" />
                <div className="absolute w-full h-0.5 bg-stone-900 rotate-45" />
                <div className="absolute h-full w-0.5 bg-stone-900 rotate-45" />
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    </>
  );
}
