"use client";

import { useProfileLogic } from "@/hooks/useProfileLogic";
import { User, LogOut, Check, FileText, Monitor, PaintBucket, Clock, Flame, BookOpen } from "lucide-react";
import { XPWindow } from "@/themes/ThemeWindowsXP";
import { SHOP_ITEMS } from "@/data/shop-items";

export default function ProfilePanelWindowsXP({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const {
    scholar, isGuestMode, signOut, isLightMode, toggleTheme, isFocusMode, setIsFocusMode, activeThemeName, activeThemeId, activeBanner, equippedItems, equipItem, isSavingName, nameSaved, conqueredCount, isGeneratingPdf, editedName, setEditedName, handleExport, handleExportPdf, handleBurn, handleUpdateName, getProviderLabel, avatarUrl
  } = useProfileLogic(isOpen);

  if (!isOpen || (!scholar && !isGuestMode)) return null;

  return (
    <XPWindow
      title="User Accounts"
      icon={User}
      onClose={onClose}
      style={{ top: "15%", left: "30%", width: "400px", height: "auto", zIndex: 100 }}
    >
      <div className="bg-white flex flex-col h-full font-sans text-black select-text">
        {/* Header */}
        <div className="h-16 bg-[linear-gradient(to_bottom,#0058e6_0%,#3a93ff_20%,#127dff_80%,#036bba_100%)] flex items-center px-4 shrink-0">
          <div className="w-10 h-10 bg-white rounded-md border-2 border-white overflow-hidden shadow mr-4 flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-orange-400 flex items-center justify-center text-white font-bold text-xl">
                {(scholar?.displayName || "G")[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleUpdateName}
              className="bg-transparent text-white font-bold text-lg outline-none w-full border-b border-transparent focus:border-white/50"
              disabled={isGuestMode}
            />
            <div className="text-blue-100 text-xs">{getProviderLabel()}</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#ece9d8]">
          
          <div className="bg-white border border-stone-300 p-3 shadow-sm">
            <h3 className="font-bold text-[#00136b] mb-2 border-b border-stone-200 pb-1 flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Academic Record
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-blue-600">{conqueredCount ?? 0}</span>
                <span className="text-stone-500">Proofs</span>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <button 
                  onClick={handleExportPdf}
                  disabled={isGeneratingPdf}
                  className="bg-[#d4d0c8] border-2 border-white border-b-stone-500 border-r-stone-500 active:border-t-stone-500 active:border-l-stone-500 active:border-b-white active:border-r-white px-2 py-1 flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4 text-blue-600" /> Print Grimoire
                </button>
                <button 
                  onClick={handleBurn}
                  className="bg-[#d4d0c8] border-2 border-white border-b-stone-500 border-r-stone-500 active:border-t-stone-500 active:border-l-stone-500 active:border-b-white active:border-r-white px-2 py-1 flex items-center gap-2 text-sm text-red-600"
                >
                  <Flame className="w-4 h-4" /> Format Disk
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-300 p-3 shadow-sm">
            <h3 className="font-bold text-[#00136b] mb-2 border-b border-stone-200 pb-1 flex items-center gap-1">
              <Monitor className="w-4 h-4" /> Display Properties
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!isLightMode} onChange={toggleTheme} className="w-4 h-4" />
                High Contrast Theme (Dark Mode)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isFocusMode} onChange={(e) => setIsFocusMode(e.target.checked)} className="w-4 h-4" />
                Zen Mode (Hide Desktop Icons)
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-2">
            <button 
              onClick={signOut}
              className="bg-[#d4d0c8] border-2 border-white border-b-stone-500 border-r-stone-500 active:border-t-stone-500 active:border-l-stone-500 active:border-b-white active:border-r-white px-4 py-1 flex items-center gap-2 font-bold shadow"
            >
              <LogOut className="w-4 h-4 text-red-600" /> Log Off
            </button>
            <button 
              onClick={onClose}
              className="bg-[#d4d0c8] border-2 border-white border-b-stone-500 border-r-stone-500 active:border-t-stone-500 active:border-l-stone-500 active:border-b-white active:border-r-white px-4 py-1 flex items-center gap-2 font-bold shadow"
            >
              OK
            </button>
          </div>

        </div>
      </div>
    </XPWindow>
  );
}
