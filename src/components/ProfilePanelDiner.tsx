"use client";

import { useProfileLogic } from "@/hooks/useProfileLogic";
import { User, LogOut, FileText, Monitor, Flame } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilePanelDiner({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const {
    scholar, isGuestMode, signOut, isLightMode, toggleTheme, isFocusMode, setIsFocusMode, conqueredCount, isGeneratingPdf, editedName, setEditedName, handleExportPdf, handleBurn, handleUpdateName, getProviderLabel, avatarUrl
  } = useProfileLogic(isOpen);

  const [time, setTime] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [isOpen]);

  if (!isOpen || (!scholar && !isGuestMode)) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in zoom-in-95 duration-200"
      >
        <div 
          className="w-80 bg-white shadow-2xl relative"
          style={{
            fontFamily: "'Courier New', Courier, monospace", // Receipt font
            filter: "drop-shadow(0 20px 13px rgb(0 0 0 / 0.5))"
          }}
        >
          {/* Jagged top edge */}
          <div 
            className="h-3 w-full absolute top-0 left-0 -translate-y-full"
            style={{
              background: "linear-gradient(45deg, transparent 33.333%, white 33.333%, white 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, white 33.333%, white 66.667%, transparent 66.667%)",
              backgroundSize: "8px 16px",
              backgroundPosition: "bottom"
            }}
          />

          <div className="p-6 pt-4 flex flex-col gap-4 text-black text-sm uppercase">
            <div className="text-center border-b-2 border-dashed border-stone-300 pb-4">
              <h2 className="text-2xl font-bold tracking-wider mb-1 text-red-600">THE DINER</h2>
              <p className="text-xs">GUEST CHECK</p>
              <p className="text-xs">Table 4 &nbsp;&nbsp;&nbsp; {time}</p>
            </div>

            <div className="flex flex-col gap-1 border-b-2 border-dashed border-stone-300 pb-4">
              <div className="flex justify-between font-bold mb-2">
                <span>Customer</span>
                <span>Type</span>
              </div>
              
              <div className="flex items-end justify-between gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleUpdateName}
                  disabled={isGuestMode}
                  className="bg-transparent text-sm w-full outline-none border-b border-black font-bold uppercase"
                />
                <span className="text-xs whitespace-nowrap">{getProviderLabel() === "Guest Account" ? "GUEST" : "MEMBER"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-b-2 border-dashed border-stone-300 pb-4">
              <div className="flex justify-between font-bold mb-1">
                <span>Order Summary</span>
                <span>Qty</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Proofs Conquered</span>
                <span className="font-bold text-lg">{conqueredCount ?? 0}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-b-2 border-dashed border-stone-300 pb-4">
              <span className="font-bold">Services</span>
              <button 
                onClick={handleExportPdf}
                disabled={isGeneratingPdf}
                className="flex justify-between hover:bg-stone-100 p-1 -mx-1"
              >
                <span>Print Receipt</span>
                <span>[PRNT]</span>
              </button>
              <button 
                onClick={handleBurn}
                className="flex justify-between hover:bg-red-50 text-red-600 p-1 -mx-1"
              >
                <span>Cancel Order (Burn)</span>
                <span>[VOID]</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 border-b-2 border-dashed border-stone-300 pb-4">
              <span className="font-bold">Atmosphere</span>
              <button 
                onClick={toggleTheme}
                className="flex justify-between hover:bg-stone-100 p-1 -mx-1"
              >
                <span>Dim Lights (Dark Mode)</span>
                <span>[{!isLightMode ? "ON" : "OFF"}]</span>
              </button>
              <button 
                onClick={() => setIsFocusMode(!isFocusMode)}
                className="flex justify-between hover:bg-stone-100 p-1 -mx-1"
              >
                <span>Quiet Booth (Focus)</span>
                <span>[{isFocusMode ? "ON" : "OFF"}]</span>
              </button>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <button 
                onClick={signOut}
                className="w-full text-center py-2 border-2 border-black font-bold hover:bg-black hover:text-white transition-colors"
              >
                PAY BILL & LEAVE
              </button>
              <p className="text-center text-xs italic lowercase">
                thank you, come again!
              </p>
            </div>

          </div>

          {/* Jagged bottom edge */}
          <div 
            className="h-3 w-full absolute bottom-0 left-0 translate-y-full"
            style={{
              background: "linear-gradient(-45deg, transparent 33.333%, white 33.333%, white 66.667%, transparent 66.667%), linear-gradient(45deg, transparent 33.333%, white 33.333%, white 66.667%, transparent 66.667%)",
              backgroundSize: "8px 16px",
              backgroundPosition: "top"
            }}
          />
        </div>
      </div>
    </>
  );
}
