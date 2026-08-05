"use client";

import { X, User, LogOut, Sun, Moon, BookOpen, Clock, EyeOff, Eye, Download, Flame, FileText } from "lucide-react";
import { useProfileLogic } from "@/hooks/useProfileLogic";
import { useEffect, useState } from "react";
import WipeProgressWidget from "./WipeProgressWidget";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanelScribble({ isOpen, onClose }: ProfilePanelProps) {
  const {
    scholar, isGuestMode, signOut, isLightMode, toggleTheme, isFocusMode, setIsFocusMode, activeThemeName, conqueredCount, isGeneratingPdf, handleExport, handleExportPdf, handleBurn, getProviderLabel, avatarUrl, wipeConfirmStep, setWipeConfirmStep, wipeInput, setWipeInput, handleWipeClick, handleWipeConfirm
  } = useProfileLogic(isOpen);

  // We want to force Caveat font
  const CAVEAT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`;

  if (!scholar && !isGuestMode) return null;

  return (
    <>
      <style>{CAVEAT_IMPORT}</style>
      
      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* ── Slide-out Panel ── */}
      <div
        className={`fixed right-0 md:right-8 top-0 md:top-8 h-full md:h-[calc(100vh-4rem)] w-full md:w-[450px] z-50 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
          isOpen ? "translate-x-0" : "translate-x-[120%]"
        }`}
      >
        <div 
          className="relative w-full h-full bg-[#faf9f0] flex flex-col p-6 md:p-10 border-[4px] border-stone-800"
          style={{ 
            borderRadius: "4px 12px 6px 8px", 
            boxShadow: "-8px 8px 0 rgba(0,0,0,0.8)",
            fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif"
          }}
        >
          
          {/* Lined paper pattern inside the panel */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(184,212,232,0.5)_2px,transparent_2px)] pointer-events-none" style={{ backgroundSize: "100% 2rem", marginTop: "3.5rem" }} />
          
          {/* Red margin line */}
          <div className="absolute top-0 bottom-0 left-12 w-[3px] bg-[#e88080]/60 pointer-events-none" />

          {/* Close button (drawn as an X) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 font-black text-4xl text-stone-800 hover:text-red-500 hover:scale-110 transition-transform focus:outline-none"
            style={{ fontFamily: "'Caveat', cursive", transform: "rotate(5deg)" }}
          >
            X
          </button>

          <div className="flex-1 overflow-y-auto relative z-10 pl-10 pr-2 pt-4 pb-20 scrollbar-hide">
            
            {/* Header */}
            <div className="mb-8 mt-2 relative">
              <h2 
                className="font-bold text-5xl text-stone-800"
                style={{ fontFamily: "'Caveat', cursive", transform: "rotate(-2deg)", textDecoration: "underline #e88080 3px" }}
              >
                My Profile
              </h2>
              
              <div className="flex items-center gap-6 mt-6">
                <div 
                  className="w-24 h-24 bg-white border-[3px] border-stone-800 p-1 flex items-center justify-center relative shadow-[4px_4px_0_rgba(0,0,0,0.8)]"
                  style={{ borderRadius: "5px 3px 8px 2px", transform: "rotate(3deg)" }}
                >
                  <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-red-400 border-2 border-stone-800 shadow-sm" />
                   {avatarUrl ? (
                     <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover filter contrast-125 saturate-50" />
                   ) : (
                     <User size={40} className="text-stone-800" strokeWidth={2.5} />
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-4xl text-stone-800" style={{ fontFamily: "'Caveat', cursive", color: "#4338ca" }}>
                    {scholar?.displayName || "Guest"}
                  </h3>
                  <div className="font-bold text-xl text-stone-600 bg-yellow-200 px-2 py-0.5 inline-block border-2 border-stone-800" style={{ fontFamily: "'Caveat', cursive", transform: "rotate(-1deg)" }}>
                    ID: {getProviderLabel()}
                  </div>
                </div>
              </div>
            </div>

            {/* Scribbled Sections */}
            <div className="flex flex-col gap-8 font-bold text-stone-800 text-xl" style={{ fontFamily: "'Caveat', cursive" }}>
              
              {/* Settings Section */}
              <div className="relative p-4 bg-[#c8f0d8] border-[3px] border-stone-800 shadow-[4px_4px_0_rgba(0,0,0,0.8)]" style={{ borderRadius: "2px 8px 3px 6px", transform: "rotate(1deg)" }}>
                <h3 className="text-3xl text-stone-800 underline decoration-stone-800 decoration-2 mb-4">
                  Settings
                </h3>
                
                <div className="flex flex-col gap-4">
                  <button onClick={toggleTheme} className="flex items-center justify-between w-full hover:scale-105 transition-transform text-left border-[3px] border-transparent hover:border-stone-800 p-2 rounded-lg">
                    <span className="flex items-center gap-3 text-2xl">
                      {isLightMode ? <Sun size={24} className="text-stone-800" strokeWidth={2.5} /> : <Moon size={24} className="text-stone-800" strokeWidth={2.5} />}
                      Lighting
                    </span>
                    <span className="text-2xl underline decoration-wavy decoration-yellow-400">
                      {activeThemeName}
                    </span>
                  </button>

                  <button onClick={() => setIsFocusMode(!isFocusMode)} className="flex items-center justify-between w-full hover:scale-105 transition-transform text-left border-[3px] border-transparent hover:border-stone-800 p-2 rounded-lg">
                    <span className="flex items-center gap-3 text-2xl">
                      {isFocusMode ? <Eye size={24} className="text-stone-800" strokeWidth={2.5} /> : <EyeOff size={24} className="text-stone-800" strokeWidth={2.5} />}
                      Focus Mode
                    </span>
                    <span className="text-2xl text-red-600">
                      {isFocusMode ? "ON!" : "off"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Data Section */}
              {!isGuestMode && (
                <div className="relative p-4 bg-[#fff9c4] border-[3px] border-stone-800 shadow-[4px_4px_0_rgba(0,0,0,0.8)]" style={{ borderRadius: "6px 2px 8px 4px", transform: "rotate(-1deg)" }}>
                  <h3 className="text-3xl text-stone-800 underline decoration-stone-800 decoration-2 mb-4">
                    Homework Export
                  </h3>
                  
                  <div className="flex flex-col gap-4 text-2xl">
                    <button onClick={handleExport} className="flex items-center gap-3 hover:scale-105 transition-transform text-left border-[3px] border-transparent hover:border-stone-800 p-2 rounded-lg w-full">
                      <Download size={24} strokeWidth={2.5} className="text-blue-600" />
                      Save JSON backup
                    </button>

                    <button onClick={handleExportPdf} disabled={isGeneratingPdf} className="flex items-center gap-3 hover:scale-105 transition-transform text-left border-[3px] border-transparent hover:border-stone-800 p-2 rounded-lg w-full disabled:opacity-50">
                      <FileText size={24} strokeWidth={2.5} className="text-green-600" />
                      {isGeneratingPdf ? "Printing PDF..." : "Export to PDF"}
                    </button>
                  </div>
                </div>
              )}

              {/* Stats Section */}
              <div className="relative p-4">
                <h3 className="text-3xl text-stone-800 mb-2">
                  My Grades
                </h3>
                
                <div className="flex flex-col gap-2 text-2xl">
                  <div className="flex items-center gap-3">
                    <BookOpen size={24} strokeWidth={2.5} className="text-stone-800" /> 
                    Problems Solved: 
                    <span className="bg-[#ffc0cb] px-3 py-1 border-[3px] border-stone-800 transform rotate-3 shadow-[2px_2px_0_rgba(0,0,0,0.8)] ml-2 text-3xl">
                      {conqueredCount !== null ? conqueredCount : "..."}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer / Actions */}
            <div className="mt-12 space-y-4">
              {!isGuestMode && (
                <button
                  onClick={handleBurn}
                  className="w-full flex items-center justify-center gap-3 py-3 text-2xl transition-all border-[3px] border-stone-800 bg-red-100 text-red-600 hover:bg-red-200"
                  style={{ fontFamily: "'Caveat', cursive", borderRadius: "3px 6px 4px 8px", boxShadow: "4px 4px 0 rgba(0,0,0,0.8)", transform: "rotate(-1deg)" }}
                >
                  <Flame size={24} strokeWidth={2.5} /> burn notebook (reset)
                </button>
              )}
              
              <WipeProgressWidget 
                wipeConfirmStep={wipeConfirmStep}
                setWipeConfirmStep={setWipeConfirmStep}
                wipeInput={wipeInput}
                setWipeInput={setWipeInput}
                handleWipeClick={handleWipeClick}
                handleWipeConfirm={handleWipeConfirm}
                isLightMode={true}
              />
              
              <button
                onClick={() => {
                  onClose();
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-3 py-3 text-2xl transition-all bg-stone-800 text-white border-[3px] border-stone-800 hover:bg-stone-700"
                style={{ fontFamily: "'Caveat', cursive", borderRadius: "8px 2px 6px 3px", boxShadow: "4px 4px 0 rgba(0,0,0,0.8)", transform: "rotate(1deg)" }}
              >
                <LogOut size={24} strokeWidth={2.5} /> Log Out
              </button>
            </div>
            
            {/* Some scribbles */}
            <div className="absolute top-20 right-10 text-4xl text-blue-400 opacity-60 transform rotate-12 pointer-events-none select-none" style={{ fontFamily: "'Caveat', cursive" }}>
              #1 student!
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
