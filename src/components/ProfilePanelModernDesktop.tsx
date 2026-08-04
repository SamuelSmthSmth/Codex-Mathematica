"use client";

import { useProfileLogic } from "@/hooks/useProfileLogic";
import { User, LogOut, Check, FileText, Monitor, Flame, BookOpen, Settings, X, HardDrive } from "lucide-react";

export default function ProfilePanelModernDesktop({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const {
    scholar, isGuestMode, signOut, isLightMode, toggleTheme, isFocusMode, setIsFocusMode, conqueredCount, isGeneratingPdf, editedName, setEditedName, handleExportPdf, handleBurn, handleUpdateName, getProviderLabel, avatarUrl
  } = useProfileLogic(isOpen);

  if (!isOpen || (!scholar && !isGuestMode)) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center transition-opacity"
        onClick={onClose}
      >
        {/* Modal Window */}
        <div 
          className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl w-[600px] h-[400px] flex overflow-hidden text-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar */}
          <div className="w-1/3 bg-black/40 border-r border-white/10 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center border border-white/20">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-slate-300">{(scholar?.displayName || "G")[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm truncate w-24">{scholar?.displayName || "Guest"}</span>
                <span className="text-[0.65rem] text-slate-400">{getProviderLabel()}</span>
              </div>
            </div>

            <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium">
              <User className="w-4 h-4" /> Account
            </button>
            
            <div className="mt-auto">
              <button 
                onClick={signOut}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-sm font-medium transition-colors w-full"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8 flex flex-col relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
            
            <h2 className="text-xl font-light mb-6">Account Settings</h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Display Name</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleUpdateName}
                  disabled={isGuestMode}
                  className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Grimoire Progress</label>
                <div className="bg-black/30 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-light">{conqueredCount ?? 0}</span>
                    <span className="text-xs text-slate-400">Proofs Captured</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleExportPdf}
                      disabled={isGeneratingPdf}
                      className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5" /> Export PDF
                    </button>
                    <button 
                      onClick={handleBurn}
                      className="px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition-colors flex items-center gap-2"
                    >
                      <Flame className="w-3.5 h-3.5" /> Erase Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
