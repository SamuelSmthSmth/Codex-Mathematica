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
import { Archive, BookOpen, ShoppingBag } from "lucide-react";

import ScholarGate from "@/components/ScholarGate";
import ProfilePanel from "@/components/ProfilePanel";
import LibraryView from "@/components/LibraryView";
import ShopLayout from "@/components/ShopLayout";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

// ─────────────────────────────────────────────────────────────────────────────
// Types
import { AppArea } from "@/components/ThemeRoot";
import ThemeRoot from "@/components/ThemeRoot";

// ─────────────────────────────────────────────────────────────────────────────
// Home
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { scholar, loading, isGuestMode } = useAuth();
  const { activeTheme } = useTheme();
  const [activeArea, setActiveArea]         = useState<AppArea>("archive");
  const [animDir, setAnimDir]               = useState<"forward" | "backward">("forward");
  const [isShopOpen,    setIsShopOpen]      = useState(false);
  const [isProfileOpen, setIsProfileOpen]   = useState(false);

  const AREA_ORDER = { archive: 0, library: 1, shop: 2 };

  const handleOpenShop = () => {
    setIsShopOpen(true);
    setActiveArea("shop");
  };

  const handleCloseShop = () => {
    setIsShopOpen(false);
    // Return to archive only if we were on the shop
    if (activeArea === "shop") {
      setAnimDir("backward");
      setActiveArea("archive");
    }
  };

  const handleSelectArea = (area: AppArea) => {
    if (area !== activeArea) {
      setAnimDir(AREA_ORDER[area] > AREA_ORDER[activeArea] ? "forward" : "backward");
    }
    setActiveArea(area);
    if (area === "shop") setIsShopOpen(true);
    else setIsShopOpen(false);
  };

  const avatarInitial = scholar?.displayName?.charAt(0).toUpperCase() ?? "?";

  return (
    <main className="relative h-screen overflow-hidden">

      {/* ── Top Navigation ── */}
      <div className={activeTheme === "theme-default" ? "block" : "hidden"}>
        <TopNav
          isShopOpen={isShopOpen}
          isProfileOpen={isProfileOpen}
          onOpenShop={handleOpenShop}
          onCloseShop={handleCloseShop}
          onOpenProfile={() => setIsProfileOpen(true)}
          onCloseProfile={() => setIsProfileOpen(false)}
          avatarUrl={scholar?.photoURL ?? null}
          avatarInitial={avatarInitial}
          activeArea={activeArea}
        />
      </div>

      {/* ── Area Views ── */}
      {/* ── Theme Root (Renders Archive, Library, or Shop) ── */}
      <div className="h-full overflow-hidden perspective-[2000px]">
        <ThemeRoot activeArea={activeArea} onSelectArea={handleSelectArea} />
      </div>

      {/* ── Profile Panel ── */}
      <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* ── Auth Gate ── */}
      {/* ── Auth Gate ── */}
      {!loading && !scholar && !isGuestMode && <ScholarGate />}
    </main>
  );
}
