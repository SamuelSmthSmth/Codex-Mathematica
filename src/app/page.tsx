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
import CodexWorkspace from "@/components/CodexWorkspace";
import ScholarGate from "@/components/ScholarGate";
import ProfilePanel from "@/components/ProfilePanel";
import LibraryView from "@/components/LibraryView";
import ShopLayout from "@/components/ShopLayout";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type AppArea = "archive" | "library" | "shop";

interface DockItem {
  area: AppArea;
  label: string;
  Icon: React.ElementType;
}

const DOCK_ITEMS: DockItem[] = [
  { area: "archive", label: "Archive",  Icon: Archive   },
  { area: "library", label: "Library",  Icon: BookOpen  },
  { area: "shop",    label: "Store",    Icon: ShoppingBag },
];

// ─────────────────────────────────────────────────────────────────────────────
// Bottom Dock
// ─────────────────────────────────────────────────────────────────────────────

function BottomDock({
  active,
  onSelect,
}: {
  active: AppArea;
  onSelect: (area: AppArea) => void;
}) {
  const { isLightMode } = useTheme();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-0 px-2 py-2 pb-safe"
      style={{
        background: isLightMode
          ? "rgba(252,250,247,0.92)"
          : "rgba(10,7,5,0.88)",
        backdropFilter: "blur(12px)",
        borderTop: isLightMode
          ? "1px solid rgba(200,146,42,0.12)"
          : "1px solid rgba(200,146,42,0.1)",
      }}
      aria-label="Primary navigation"
    >
      {DOCK_ITEMS.map(({ area, label, Icon }) => {
        const isActive = active === area;
        return (
          <button
            key={area}
            id={`dock-${area}`}
            onClick={() => onSelect(area)}
            className="flex flex-col items-center gap-1 px-8 py-2 transition-all duration-200"
            style={{
              color: isActive
                ? "rgba(200,146,42,0.95)"
                : isLightMode
                ? "rgba(100,90,75,0.6)"
                : "rgba(130,118,98,0.5)",
            }}
            aria-label={`Go to ${label}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              size={isActive ? 19 : 17}
              strokeWidth={isActive ? 1.8 : 1.4}
              className="transition-all duration-200"
            />
            <span
              className="uppercase tracking-widest"
              style={{ fontFamily: "Georgia, serif", fontSize: "0.5rem" }}
            >
              {label}
            </span>
            {isActive && (
              <div
                className="absolute bottom-1 w-1 h-1 rounded-full"
                style={{ background: "rgba(200,146,42,0.8)" }}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Home
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { scholar, loading, isGuestMode } = useAuth();
  const [activeArea, setActiveArea]         = useState<AppArea>("archive");
  const [isShopOpen,    setIsShopOpen]      = useState(false);
  const [isProfileOpen, setIsProfileOpen]   = useState(false);

  const handleOpenShop = () => {
    setIsShopOpen(true);
    setActiveArea("shop");
  };

  const handleCloseShop = () => {
    setIsShopOpen(false);
    // Return to archive only if we were on the shop
    if (activeArea === "shop") setActiveArea("archive");
  };

  const handleSelectArea = (area: AppArea) => {
    setActiveArea(area);
    if (area === "shop") setIsShopOpen(true);
    else setIsShopOpen(false);
  };

  const avatarInitial = scholar?.displayName?.charAt(0).toUpperCase() ?? "?";

  return (
    <main className="relative h-screen overflow-hidden">

      {/* ── Top Navigation ── */}
      <TopNav
        isShopOpen={isShopOpen}
        isProfileOpen={isProfileOpen}
        onOpenShop={handleOpenShop}
        onCloseShop={handleCloseShop}
        onOpenProfile={() => setIsProfileOpen(true)}
        avatarUrl={scholar?.photoURL ?? null}
        avatarInitial={avatarInitial}
        activeArea={activeArea}
      />

      {/* ── Area Views ── */}
      <div className="h-full overflow-hidden pb-16">
        {/* Archive — always mounted so fonts pre-load */}
        <div className={activeArea === "archive" ? "h-full overflow-y-auto" : "hidden"}>
          <CodexWorkspace />
        </div>

        {/* Library */}
        {activeArea === "library" && (
          <div className="h-full overflow-y-auto">
            <LibraryView />
          </div>
        )}

        {/* Shop */}
        {activeArea === "shop" && (
          <div className="h-full overflow-y-auto">
            <ShopLayout />
          </div>
        )}
      </div>

      {/* ── Profile Panel ── */}
      <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* ── Auth Gate ── */}
      {!loading && !scholar && !isGuestMode && <ScholarGate />}

      {/* ── Bottom Dock ── */}
      <BottomDock active={activeArea} onSelect={handleSelectArea} />
    </main>
  );
}
