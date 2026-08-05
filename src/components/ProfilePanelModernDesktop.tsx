"use client";

import { X, User, LogOut, Sun, Moon, BookOpen, Clock, EyeOff, Eye, Download, Flame, FileText, Settings, Activity, Shield } from "lucide-react";
import { useProfileLogic } from "@/hooks/useProfileLogic";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanelModernDesktop({ isOpen, onClose }: ProfilePanelProps) {
  const {
    scholar, isGuestMode, signOut, isLightMode, toggleTheme, isFocusMode, setIsFocusMode, activeThemeName, conqueredCount, isGeneratingPdf, handleExport, handleExportPdf, handleBurn, getProviderLabel, avatarUrl
  } = useProfileLogic(isOpen);

  if (!scholar && !isGuestMode) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* ── Slide-out Panel ── */}
      <div
        className={`fixed right-0 md:right-4 top-0 md:top-4 h-full md:h-[calc(100vh-2rem)] w-full md:w-96 z-[70] flex flex-col transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
        }`}
      >
        <div className="relative w-full h-full bg-[#1e1e1e]/80 backdrop-blur-3xl flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] md:rounded-2xl border border-white/10 overflow-hidden text-slate-200 font-sans">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-slate-400" />
              <span className="font-semibold text-sm tracking-wide">System Settings</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
            
            {/* User Profile Card */}
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/5 shadow-inner">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 bg-slate-800 shadow-md flex items-center justify-center flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-slate-400" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-lg font-semibold text-white truncate">
                  {scholar?.displayName || "Guest User"}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <Shield size={12} className={isGuestMode ? "text-orange-400" : "text-emerald-400"} />
                  <span className="truncate">{getProviderLabel()} Account</span>
                </div>
              </div>
            </div>

            {/* General Settings */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">Appearance</h3>
              <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden flex flex-col">
                <button onClick={toggleTheme} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                      {isLightMode ? <Sun size={16} /> : <Moon size={16} />}
                    </div>
                    <span className="text-sm font-medium">Appearance</span>
                  </div>
                  <span className="text-xs text-slate-400 bg-black/30 px-2 py-1 rounded">
                    {activeThemeName}
                  </span>
                </button>

                <button onClick={() => setIsFocusMode(!isFocusMode)} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                      {isFocusMode ? <Eye size={16} /> : <EyeOff size={16} />}
                    </div>
                    <span className="text-sm font-medium">Focus Mode</span>
                  </div>
                  <div className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" style={{ backgroundColor: isFocusMode ? '#6366f1' : '#3f3f46' }}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isFocusMode ? 'translate-x-4' : 'translate-x-1'}`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Activity / Stats */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">Activity Monitor</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Activity size={14} />
                    <span className="text-xs font-medium uppercase">Solved</span>
                  </div>
                  <span className="text-3xl font-light text-white">{conqueredCount !== null ? conqueredCount : "..."}</span>
                  <span className="text-[10px] text-slate-500 mt-1">total exercises</span>
                </div>
                <div className="bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col">
                  <div className="flex items-center gap-2 text-sky-400 mb-2">
                    <Clock size={14} />
                    <span className="text-xs font-medium uppercase">Uptime</span>
                  </div>
                  <span className="text-lg font-light text-white leading-tight">Since<br/>Session Start</span>
                </div>
              </div>
            </div>

            {/* Data Management */}
            {!isGuestMode && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">Data Management</h3>
                <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden flex flex-col">
                  <button onClick={handleExport} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                        <Download size={16} />
                      </div>
                      <span className="text-sm font-medium">Export JSON Backup</span>
                    </div>
                  </button>

                  <button onClick={handleExportPdf} disabled={isGeneratingPdf} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                        <FileText size={16} />
                      </div>
                      <span className="text-sm font-medium">{isGeneratingPdf ? "Generating PDF..." : "Export PDF Printout"}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className="mt-4 space-y-3 pb-8">
              {!isGuestMode && (
                <button
                  onClick={handleBurn}
                  className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors"
                >
                  <Flame size={16} /> Erase All User Data
                </button>
              )}
              
              <button
                onClick={() => {
                  onClose();
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors shadow-sm"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
