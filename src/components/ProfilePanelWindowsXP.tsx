"use client";

import { X, User, LogOut, Sun, Moon, BookOpen, Clock, EyeOff, Eye, Download, Flame, FileText, Minus, Square } from "lucide-react";
import { useProfileLogic } from "@/hooks/useProfileLogic";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanelWindowsXP({ isOpen, onClose }: ProfilePanelProps) {
  const {
    scholar, isGuestMode, signOut, isLightMode, toggleTheme, isFocusMode, setIsFocusMode, activeThemeName, conqueredCount, isGeneratingPdf, handleExport, handleExportPdf, handleBurn, getProviderLabel, avatarUrl
  } = useProfileLogic(isOpen);

  if (!scholar && !isGuestMode) return null;
  if (!isOpen) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[60] bg-black/20"
        onClick={onClose}
      />

      {/* ── Centered XP Window ── */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
        <div className="w-[450px] max-w-[90vw] max-h-[90vh] bg-[#ece9d8] border-[3px] border-[#0053e5] rounded-t-lg flex flex-col shadow-[2px_2px_10px_rgba(0,0,0,0.5)] pointer-events-auto">
          
          {/* Title Bar */}
          <div className="h-8 bg-[linear-gradient(to_bottom,#0058e6_0%,#3a93ff_8%,#288eff_40%,#127dff_88%,#036bba_100%)] flex items-center justify-between px-1 flex-shrink-0">
            <div className="flex items-center gap-1 overflow-hidden ml-1 pointer-events-none">
              <User className="w-4 h-4 text-white drop-shadow" />
              <span className="text-white font-bold text-[13px] truncate drop-shadow-[1px_1px_1px_rgba(0,0,0,0.8)] font-sans">
                User Accounts
              </span>
            </div>
            <div className="flex items-center gap-[2px] mr-1">
              <button className="w-5 h-5 bg-[linear-gradient(135deg,#ffffff_0%,#dca85d_20%,#dca85d_100%)] border border-white rounded-[3px] flex items-center justify-center text-white hover:brightness-110 active:brightness-90 shadow-sm">
                <Minus className="w-3 h-3 text-stone-900" strokeWidth={3} />
              </button>
              <button className="w-5 h-5 bg-[linear-gradient(135deg,#ffffff_0%,#245edb_20%,#245edb_100%)] border border-white rounded-[3px] flex items-center justify-center text-white hover:brightness-110 active:brightness-90 shadow-sm">
                <Square className="w-3 h-3 text-stone-900" strokeWidth={3} />
              </button>
              <button onClick={onClose} className="w-5 h-5 bg-[linear-gradient(135deg,#ffffff_0%,#e35a49_20%,#e35a49_100%)] border border-white rounded-[3px] flex items-center justify-center text-white hover:brightness-110 active:brightness-90 shadow-sm">
                <X className="w-3 h-3 text-stone-900" strokeWidth={3} />
              </button>
            </div>
          </div>
          
          {/* Menu Bar */}
          <div className="h-6 bg-[#ece9d8] border-b border-stone-300 flex items-center px-2 gap-3 text-xs text-stone-600 font-sans">
            <span className="hover:text-black cursor-pointer">File</span>
            <span className="hover:text-black cursor-pointer">Edit</span>
            <span className="hover:text-black cursor-pointer">View</span>
            <span className="hover:text-black cursor-pointer">Help</span>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-white border-2 border-l-[#ece9d8] border-r-[#ece9d8] border-b-[#ece9d8] font-sans flex flex-col h-[500px]">
            
            {/* Header section similar to real XP User Accounts */}
            <div className="bg-[#567bd5] p-4 flex items-center gap-4 border-b-2 border-yellow-500">
               <div className="w-16 h-16 bg-white border-2 border-white rounded shadow-sm overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-orange-400 flex items-center justify-center text-white font-bold text-3xl">
                      {scholar?.displayName?.[0]?.toUpperCase() || "G"}
                    </div>
                  )}
               </div>
               <div className="text-white">
                 <h2 className="text-2xl font-bold">{scholar?.displayName || "Guest"}</h2>
                 <p className="text-sm opacity-90">{isGuestMode ? "Local Account" : `${getProviderLabel()} Account`}</p>
                 <p className="text-sm opacity-90">Computer administrator</p>
               </div>
            </div>

            <div className="p-6 flex flex-col gap-6 bg-[linear-gradient(to_bottom,#ffffff_0%,#f0f0f4_100%)] flex-1">
              
              <div>
                <h3 className="text-blue-800 font-bold text-lg mb-2 border-b border-blue-200 pb-1">Pick a task...</h3>
                <div className="flex flex-col gap-2 pl-4">
                  <button onClick={toggleTheme} className="flex items-center gap-2 text-blue-700 hover:text-blue-500 hover:underline text-sm text-left">
                    <span className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded">
                      {isLightMode ? <Sun size={14} className="text-blue-600" /> : <Moon size={14} className="text-blue-600" />}
                    </span>
                    Change the display theme ({activeThemeName})
                  </button>
                  <button onClick={() => setIsFocusMode(!isFocusMode)} className="flex items-center gap-2 text-blue-700 hover:text-blue-500 hover:underline text-sm text-left">
                    <span className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded">
                      {isFocusMode ? <Eye size={14} className="text-blue-600" /> : <EyeOff size={14} className="text-blue-600" />}
                    </span>
                    {isFocusMode ? "Turn off Focus Mode" : "Turn on Focus Mode"}
                  </button>
                </div>
              </div>

              {!isGuestMode && (
                <div>
                  <h3 className="text-blue-800 font-bold text-lg mb-2 border-b border-blue-200 pb-1">Related Tasks</h3>
                  <div className="flex flex-col gap-2 pl-4">
                    <button onClick={handleExport} className="flex items-center gap-2 text-blue-700 hover:text-blue-500 hover:underline text-sm text-left">
                      <span className="w-6 h-6 flex items-center justify-center bg-green-100 rounded">
                        <Download size={14} className="text-green-600" />
                      </span>
                      Export profile data to JSON
                    </button>
                    <button onClick={handleExportPdf} disabled={isGeneratingPdf} className="flex items-center gap-2 text-blue-700 hover:text-blue-500 hover:underline text-sm text-left disabled:opacity-50 disabled:no-underline">
                      <span className="w-6 h-6 flex items-center justify-center bg-purple-100 rounded">
                        <FileText size={14} className="text-purple-600" />
                      </span>
                      {isGeneratingPdf ? "Generating PDF..." : "Export report to PDF"}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-blue-800 font-bold text-lg mb-2 border-b border-blue-200 pb-1">Statistics</h3>
                <div className="flex flex-col gap-2 pl-4">
                  <div className="flex items-center gap-2 text-stone-700 text-sm">
                    <BookOpen size={14} className="text-stone-500" />
                    Exercises Completed: <span className="font-bold">{conqueredCount !== null ? conqueredCount : "..."}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700 text-sm">
                    <Clock size={14} className="text-stone-500" />
                    System Uptime: Current Session
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 flex flex-col gap-2">
                {!isGuestMode && (
                  <button onClick={handleBurn} className="w-full bg-[#ece9d8] border-2 border-t-white border-l-white border-b-stone-500 border-r-stone-500 py-1 active:border-t-stone-500 active:border-l-stone-500 active:border-b-white active:border-r-white text-sm flex items-center justify-center gap-2 text-red-700 font-bold">
                    <Flame size={14} /> Delete this account
                  </button>
                )}
                <button onClick={() => { onClose(); signOut(); }} className="w-full bg-[#ece9d8] border-2 border-t-white border-l-white border-b-stone-500 border-r-stone-500 py-1 active:border-t-stone-500 active:border-l-stone-500 active:border-b-white active:border-r-white text-sm flex items-center justify-center gap-2">
                  <LogOut size={14} /> Log Off
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
