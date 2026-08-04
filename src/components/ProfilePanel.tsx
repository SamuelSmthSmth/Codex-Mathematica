"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { X, User, LogOut, Check, Sun, Moon, BookOpen, Clock, EyeOff, Eye, Download, Flame, FileText } from "lucide-react";
import { collection, getCountFromServer, getDocs, query, orderBy, writeBatch } from "firebase/firestore";
import { db, isConfigured } from "@/lib/firebase";
import { useProgress } from "@/context/ProgressContext";
import { SHOP_ITEMS } from "@/data/shop-items";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { scholar, isGuestMode, signOut, updateScholarName } = useAuth();
  const { isLightMode, toggleTheme, isFocusMode, setIsFocusMode, setPrintData, activeThemeName, activeThemeId } = useTheme();
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [conqueredCount, setConqueredCount] = useState<number | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [editedName, setEditedName] = useState("");
  const { equippedItems, equipItem } = useProgress();
  
  const activeBannerId = equippedItems["banners"];
  const activeBanner = SHOP_ITEMS.find((item) => item.id === activeBannerId);

  useEffect(() => {
    if (!isConfigured || !scholar || isGuestMode || !isOpen) return;

    getCountFromServer(collection(db, "users", scholar.uid, "grimoire"))
      .then(snap => setConqueredCount(snap.data().count))
      .catch(() => setConqueredCount(0));
  }, [scholar, isGuestMode, isOpen]);

  const handleExport = async () => {
    if (!scholar || !isConfigured) return;
    try {
      const q = query(
        collection(db, "users", scholar.uid, "grimoire"),
        orderBy("volume"),
        orderBy("chapter"),
        orderBy("fragment_id")
      );
      const snap = await getDocs(q);
      
      let markdownContent = `# Codex Mathematica Grimoire\n\nScholar: ${scholar.displayName || "Unknown"}\n\n---\n\n`;
      
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        markdownContent += `## Volume ${data.volume}, Chapter ${data.chapter}, Fragment ${data.fragment_id}\n\n`;
        markdownContent += `${data.proof_markdown}\n\n---\n\n`;
      });
      
      const blob = new Blob([markdownContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "My_Grimoire.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export grimoire", err);
    }
  };

  const handleExportPdf = async () => {
    if (!scholar || !isConfigured) return;
    setIsGeneratingPdf(true);
    try {
      const q = query(
        collection(db, "users", scholar.uid, "grimoire"),
        orderBy("volume"),
        orderBy("chapter"),
        orderBy("fragment_id")
      );
      const snap = await getDocs(q);
      
      const proofs: any[] = [];
      const mastery: Record<string, number> = {};
      
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const vol = data.volume as string;
        proofs.push({
          volume: vol,
          chapter: data.chapter as number,
          fragment_id: data.fragment_id as number,
          proof_markdown: data.proof_markdown as string,
        });
        
        mastery[vol] = (mastery[vol] || 0) + 1;
      });
      
      setPrintData({
        scholarName: scholar.displayName || "Unknown Scholar",
        proofs,
        mastery,
      });

      // Wait a tick for React to render the PrintableManuscript in the background
      setTimeout(() => {
        window.print();
        setIsGeneratingPdf(false);
      }, 500);
      
    } catch (err) {
      console.error("Failed to prepare PDF data", err);
      setIsGeneratingPdf(false);
    }
  };

  const handleBurn = async () => {
    if (!scholar || !isConfigured) return;
    const confirmed = window.confirm("Are you sure you want to burn your Grimoire? This will delete all saved proofs permanently.");
    if (!confirmed) return;

    try {
      const snap = await getDocs(collection(db, "users", scholar.uid, "grimoire"));
      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      
      setConqueredCount(0);
      window.dispatchEvent(new Event("grimoire-updated"));
    } catch (err) {
      console.error("Failed to burn grimoire", err);
    }
  };

  useEffect(() => {
    setEditedName(scholar?.displayName ?? (isGuestMode ? "Guest Scholar" : ""));
  }, [scholar?.displayName, isGuestMode, isOpen]);

  if (!scholar && !isGuestMode) return null;

  const handleUpdateName = async () => {
    if (!scholar || isGuestMode || !editedName.trim() || editedName === scholar.displayName) return;
    setIsSavingName(true);
    try {
      await updateScholarName(editedName);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch {
      // Ignored for now
    } finally {
      setIsSavingName(false);
    }
  };

  const getProviderLabel = () => {
    if (isGuestMode) return "Guest Account";
    if (!scholar) return "";
    const provider = scholar.providerData[0]?.providerId;
    if (provider === "google.com") return "Google Scholar";
    if (provider === "github.com") return "GitHub Scholar";
    return "Archive Scholar (Email)";
  };

  const avatarUrl = scholar?.photoURL;

  return (
    <>
      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* ── Slide-out Panel ── */}
      <div
        className={`fixed right-0 top-0 h-full w-80 z-50 flex flex-col border-l transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${isLightMode ? "bg-[#fcfaf7] text-stone-900 border-stone-200" : "bg-[#0f0d0b] text-stone-300 border-stone-800"}`}
        style={{
          boxShadow: isOpen ? (isLightMode ? "-5px 0 25px rgba(0,0,0,0.05)" : "-10px 0 40px rgba(0,0,0,0.8)") : "none",
        }}
      >
        {activeBanner?.thumbnailUrl && (
          <div 
            className="w-full h-32 bg-cover bg-center border-b border-stone-800"
            style={{ backgroundImage: `url(${activeBanner.thumbnailUrl})` }}
          />
        )}
        <div className="p-7 flex-1 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-10">
          <h2
            className="text-amber-100/80 uppercase tracking-[0.2em]"
            style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem" }}
          >
            Scholar Profile
          </h2>
          <button
            onClick={onClose}
            className={`transition-colors ${isLightMode ? "text-stone-400 hover:text-stone-700" : "text-stone-500 hover:text-amber-200"}`}
            aria-label="Close Profile"
          >
            <X size={18} />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-4"
            style={{
              background: isLightMode ? "linear-gradient(145deg, #ffffff 0%, #f4f0ea 100%)" : "linear-gradient(145deg, #1d1610 0%, #0a0806 100%)",
              border: isLightMode ? "1px solid #d1d5db" : "1px solid rgba(200,146,42,0.2)",
              boxShadow: isLightMode ? "inset 0 2px 5px rgba(0,0,0,0.05), 0 2px 10px rgba(0,0,0,0.03)" : "inset 0 2px 10px rgba(0,0,0,0.8), 0 4px 20px rgba(200,146,42,0.08)",
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover opacity-85" />
            ) : (
              <User size={40} className="text-amber-600/50" strokeWidth={1} />
            )}
          </div>
          <p
            className="uppercase tracking-[0.15em] text-stone-500/80"
            style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem" }}
          >
            {getProviderLabel()}
          </p>
        </div>

        {/* Settings */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="scholar-name"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: "rgba(200,146,42,0.5)",
                textTransform: "uppercase",
              }}
            >
              Scholar Name
            </label>
            <div className="flex gap-2">
              <input
                id="scholar-name"
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                disabled={isGuestMode || isSavingName}
                className="flex-1 focus:outline-none"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.9rem",
                  background: isLightMode ? "#ffffff" : "#0a0806",
                  border: isLightMode ? "1px solid #d1d5db" : "1px solid rgba(200,146,42,0.2)",
                  borderRadius: "2px",
                  color: isLightMode ? "#44403c" : "rgba(220,205,170,0.9)",
                  padding: "8px 12px",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(200,146,42,0.5)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(200,146,42,0.2)"; }}
              />
              {!isGuestMode && (
                <button
                  onClick={handleUpdateName}
                  disabled={isSavingName || editedName.trim() === scholar?.displayName}
                  className="px-3 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: nameSaved ? "rgba(40,140,60,0.15)" : "rgba(200,146,42,0.1)",
                    border: `1px solid ${nameSaved ? "rgba(60,180,80,0.4)" : "rgba(200,146,42,0.3)"}`,
                    color: nameSaved ? "#6ebc50" : "rgba(200,146,42,0.9)",
                    borderRadius: "2px",
                  }}
                  title="Save Name"
                >
                  {nameSaved ? <Check size={16} /> : <span style={{ fontFamily: "Georgia", fontSize: "0.7rem", letterSpacing: "0.1em" }}>SAVE</span>}
                </button>
              )}
            </div>
            {isGuestMode && (
              <p className="text-stone-600/60 italic mt-1" style={{ fontSize: "0.65rem", fontFamily: "Georgia, serif" }}>
                Guests cannot change their name. Progress will be lost upon departure.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: "rgba(200,146,42,0.5)",
                textTransform: "uppercase",
              }}
            >
              Environment
            </label>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full text-left py-2 px-3 transition-colors duration-200 hover:bg-stone-900/50"
              style={{
                border: "1px solid rgba(200,146,42,0.15)",
                borderRadius: "2px",
                background: "transparent",
              }}
            >
              {isLightMode ? (
                <>
                  <Sun size={16} className="text-amber-500" />
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "rgba(220,205,170,0.9)" }}>
                    Theme: Sunlit Scriptorium
                  </span>
                </>
              ) : (
                <>
                  <Moon size={16} className="text-stone-400" />
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "rgba(220,205,170,0.9)" }}>
                    Theme: Candlelit Dark
                  </span>
                </>
              )}
            </button>
          </div>

          {activeThemeId === "default" && (
            <div className="flex flex-col gap-2">
              <label
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  color: "rgba(200,146,42,0.5)",
                  textTransform: "uppercase",
                }}
              >
                Customise Accent
              </label>
              <div className="flex gap-3 mt-1">
                {[
                  { id: "palette-amber", color: "#c8922a", name: "Amber" },
                  { id: "palette-crimson", color: "#9b1b30", name: "Crimson" },
                  { id: "palette-glacier", color: "#6b8eb3", name: "Glacier" },
                  { id: "palette-midnight", color: "#5e4b8a", name: "Midnight" },
                  { id: "palette-neon-green", color: "#39ff14", name: "Neon Green" },
                ].map((palette) => {
                  const isActive = (equippedItems["palettes"] || "palette-amber") === palette.id;
                  return (
                    <button
                      key={palette.id}
                      onClick={() => equipItem("palettes", palette.id)}
                      title={palette.name}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: palette.color,
                        border: isActive ? `2px solid ${isLightMode ? "#000" : "#fff"}` : "2px solid transparent",
                        boxShadow: isActive ? "0 0 10px rgba(0,0,0,0.5)" : "none",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: "rgba(200,146,42,0.5)",
                textTransform: "uppercase",
              }}
            >
              Active Theme
            </label>
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "0.85rem",
                color: isLightMode ? "#44403c" : "rgba(220,205,170,0.9)",
              }}
            >
              {activeThemeName}
            </p>
            <p
              className="italic"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "0.65rem",
                color: isLightMode ? "#a8a29e" : "rgba(160,148,125,0.65)",
              }}
            >
              Equip themes in the Store to change the Archive aesthetic.
            </p>
          </div>

          {/* Archive Statistics */}
          <div className="flex flex-col gap-2 mt-4">
            <label
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: "rgba(200,146,42,0.5)",
                textTransform: "uppercase",
              }}
            >
              Archive Statistics
            </label>
            <div 
              className={`p-4 rounded-sm border ${isLightMode ? "bg-stone-100/50 border-stone-200" : "bg-stone-900/30 border-stone-800"}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <BookOpen size={14} className={isLightMode ? "text-stone-500" : "text-amber-600/50"} />
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.8rem", color: isLightMode ? "#444" : "rgba(220,205,170,0.8)" }}>
                  Fragments Conquered: {isGuestMode ? "0 (Guest)" : (conqueredCount !== null ? conqueredCount : "...")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={14} className={isLightMode ? "text-stone-500" : "text-amber-600/50"} />
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.8rem", color: isLightMode ? "#444" : "rgba(220,205,170,0.8)" }}>
                  Join Date: Scholar of the First Order
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`flex items-center gap-3 w-full text-left py-2 px-3 transition-colors duration-200 ${isLightMode ? "hover:bg-stone-100" : "hover:bg-stone-900/50"}`}
              style={{
                border: isLightMode ? "1px solid #e5e7eb" : "1px solid rgba(200,146,42,0.15)",
                borderRadius: "2px",
                background: "transparent",
              }}
            >
              {isFocusMode ? (
                <Eye size={16} className={isLightMode ? "text-amber-600" : "text-amber-500"} />
              ) : (
                <EyeOff size={16} className={isLightMode ? "text-stone-400" : "text-stone-500"} />
              )}
              <span style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem", color: isLightMode ? "#1c1917" : "rgba(220,205,170,0.9)" }}>
                {isFocusMode ? "Focus Mode Active" : "Focus Mode (Hide Left Ledger)"}
              </span>
            </button>
          </div>

          {/* Data Management */}
          {!isGuestMode && (
            <div className="flex flex-col gap-2 mt-4">
              <label
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  color: "rgba(200,146,42,0.5)",
                  textTransform: "uppercase",
                }}
              >
                Data Management
              </label>
              
              <button
                onClick={handleExport}
                className={`flex items-center gap-3 w-full text-left py-2 px-3 transition-colors duration-200 ${isLightMode ? "hover:bg-stone-100 text-stone-700" : "hover:bg-stone-900/50 text-stone-300"}`}
                style={{
                  border: isLightMode ? "1px solid #e5e7eb" : "1px solid rgba(200,146,42,0.15)",
                  borderRadius: "2px",
                  background: "transparent",
                }}
              >
                <Download size={16} />
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem" }}>
                  Export Manuscript
                </span>
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isGeneratingPdf}
                className={`flex items-center gap-3 w-full text-left py-2 px-3 transition-colors duration-200 ${isLightMode ? "hover:bg-stone-100 text-stone-700" : "hover:bg-stone-900/50 text-stone-300"} disabled:opacity-50 disabled:cursor-wait`}
                style={{
                  border: isLightMode ? "1px solid #e5e7eb" : "1px solid rgba(200,146,42,0.15)",
                  borderRadius: "2px",
                  background: "transparent",
                }}
              >
                <FileText size={16} />
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem" }}>
                  {isGeneratingPdf ? "Typesetting Manuscript..." : "Export Formal PDF"}
                </span>
              </button>

              <button
                onClick={handleBurn}
                className="flex items-center gap-3 w-full text-left py-2 px-3 transition-colors duration-200 hover:bg-red-900/10 text-red-700 dark:text-red-500/80"
                style={{
                  border: isLightMode ? "1px solid #fecaca" : "1px solid rgba(180,50,50,0.2)",
                  borderRadius: "2px",
                  background: "transparent",
                }}
              >
                <Flame size={16} />
                <span style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem" }}>
                  Burn Grimoire (Reset Progress)
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Footer / Sign out */}
        <div className="pt-6 border-t border-stone-800">
          <button
            onClick={() => {
              onClose();
              signOut();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 uppercase tracking-[0.15em] transition-colors duration-200 hover:bg-red-950/20 hover:text-red-400"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "0.65rem",
              color: "rgba(160,140,110,0.7)",
              border: "1px solid rgba(160,140,110,0.15)",
              borderRadius: "2px",
            }}
          >
            <LogOut size={14} />
            Leave Library
          </button>
          </div>
        </div>
      </div>
    </>
  );
}
