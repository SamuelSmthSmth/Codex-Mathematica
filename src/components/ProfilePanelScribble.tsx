"use client";

import { useProfileLogic } from "@/hooks/useProfileLogic";
import { User, LogOut, Check, FileText, Monitor, Flame, Settings } from "lucide-react";

export default function ProfilePanelScribble({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const {
    scholar, isGuestMode, signOut, isLightMode, toggleTheme, isFocusMode, setIsFocusMode, conqueredCount, isGeneratingPdf, editedName, setEditedName, handleExportPdf, handleBurn, handleUpdateName, getProviderLabel, avatarUrl
  } = useProfileLogic(isOpen);

  if (!isOpen || (!scholar && !isGuestMode)) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Sticky Note Container */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in zoom-in duration-300 transform rotate-2 hover:rotate-0 transition-transform"
      >
        <div 
          className="w-[400px] min-h-[450px] bg-[#fff9c4] p-8 shadow-[5px_5px_15px_rgba(0,0,0,0.3)] relative flex flex-col gap-6"
          style={{ 
            fontFamily: "'Caveat', cursive",
            borderRadius: "2px 8px 3px 6px"
          }}
        >
          {/* Push Pin */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 shadow-md border border-red-700">
            <div className="w-2 h-2 rounded-full bg-white/50 absolute top-1 left-1" />
          </div>

          <div className="text-center border-b-2 border-stone-800/30 pb-4">
             <h2 className="text-4xl font-bold text-stone-800 tracking-wider">My Profile</h2>
          </div>

          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-stone-800 shrink-0 bg-white flex items-center justify-center">
               {avatarUrl ? (
                 <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-3xl text-stone-800 font-bold">{(scholar?.displayName || "G")[0]?.toUpperCase()}</span>
               )}
             </div>
             <div className="flex flex-col flex-1">
               <span className="text-xl text-stone-600">Name:</span>
               <input
                 type="text"
                 value={editedName}
                 onChange={(e) => setEditedName(e.target.value)}
                 onBlur={handleUpdateName}
                 disabled={isGuestMode}
                 className="bg-transparent text-2xl font-bold text-stone-800 border-b-2 border-stone-800 border-dashed outline-none"
               />
               <span className="text-sm text-stone-500 mt-1">({getProviderLabel()})</span>
             </div>
          </div>

          <div className="flex items-center justify-between mt-2">
             <span className="text-2xl text-stone-700">Proofs Solved:</span>
             <span className="text-4xl font-bold text-blue-600 mr-4 underline decoration-wavy decoration-blue-400">{conqueredCount ?? 0}</span>
          </div>

          <div className="flex flex-col gap-3 mt-4">
             <span className="text-xl font-bold text-stone-800 border-b-2 border-stone-800/20 pb-1">Actions</span>
             
             <button 
               onClick={handleExportPdf}
               disabled={isGeneratingPdf}
               className="text-left text-2xl text-blue-700 hover:text-blue-900 transition-colors flex items-center gap-2 group"
             >
               <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" /> Print my work!
             </button>
             
             <button 
               onClick={toggleTheme}
               className="text-left text-2xl text-stone-700 hover:text-black transition-colors flex items-center gap-2 group"
             >
               <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" /> Dark Mode: {!isLightMode ? "On" : "Off"}
             </button>
             
             <button 
               onClick={() => setIsFocusMode(!isFocusMode)}
               className="text-left text-2xl text-stone-700 hover:text-black transition-colors flex items-center gap-2 group"
             >
               <Monitor className="w-5 h-5 group-hover:scale-110 transition-transform" /> Focus Mode: {isFocusMode ? "On" : "Off"}
             </button>
          </div>

          <div className="mt-auto pt-6 flex justify-between">
             <button 
               onClick={handleBurn}
               className="text-xl text-red-600 hover:text-red-800 font-bold underline decoration-wavy"
             >
               Start Over?
             </button>
             <button 
               onClick={signOut}
               className="text-2xl text-stone-800 hover:text-black font-bold flex items-center gap-1 border-2 border-stone-800 rounded px-2 hover:bg-stone-800 hover:text-white transition-colors"
             >
               Log Out
             </button>
          </div>

        </div>
      </div>
    </>
  );
}
