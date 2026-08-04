"use client";

/**
 * src/app/page.tsx
 *
 * Root page — handles top-level area routing between:
 *   - "archive"  → CodexWorkspace (existing Archive / SplitLedgerView)
 *   - "library"  → LibraryView (Netflix-style Technique Library)
 *   - "shop"     → ShopLayout (The Store)
 *
 * TopNav provides the two icon buttons (shop bag left, avatar right).
 * A bottom dock gives named navigation between the three areas.
 *
 * ProfilePanel slides in from the right when the avatar is clicked.
 * ScholarGate overlays everything when the user is not signed in.
 */

import { useState } from "react";

import ScholarGate from "@/components/ScholarGate";
import ProfilePanel from "@/components/ProfilePanel";
import { useAuth } from "@/context/AuthContext";
import { AppArea } from "@/components/ThemeRoot";
import ThemeRoot from "@/components/ThemeRoot";

// ─────────────────────────────────────────────────────────────────────────────
// Home
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { scholar, loading, isGuestMode } = useAuth();
  const [activeArea, setActiveArea] = useState<AppArea>("archive");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSelectArea = (area: AppArea) => {
    setActiveArea(area);
  };

  return (
    <main className="relative h-screen overflow-hidden">
      {/* ── Theme Root ── */}
      <div className="h-full overflow-hidden perspective-[2000px]">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#fdfbe9]">
            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="mt-6 font-serif text-amber-800 tracking-widest uppercase text-sm animate-pulse">Loading Archive...</p>
          </div>
        ) : (
          <ThemeRoot activeArea={activeArea} onSelectArea={handleSelectArea} onOpenProfile={() => setIsProfileOpen(true)} />
        )}
      </div>

      {/* ── Profile Panel ── */}
      <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* ── Auth Gate ── */}
      {!loading && !scholar && !isGuestMode && <ScholarGate />}
    </main>
  );
}
