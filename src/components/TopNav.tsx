"use client";

/**
 * src/components/TopNav.tsx
 *
 * Fixed top navigation bar with two icon buttons:
 *   - Left: Shopping Bag → opens Shop panel
 *   - Right: Avatar → opens Profile panel
 *
 * Per PLAN §7: the icon morphs to an X when the respective panel is open.
 * The nav sits at z-50 to overlay all content.
 */

import { ShoppingBag, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface TopNavProps {
  isShopOpen: boolean;
  isProfileOpen: boolean;
  onOpenShop: () => void;
  onCloseShop: () => void;
  onOpenProfile: () => void;
  onCloseProfile: () => void;
  avatarUrl?: string | null;
  avatarInitial?: string;
  /** The active app area — used to hide nav icons in the Archive workspace if desired */
  activeArea: "archive" | "library" | "shop";
}

export default function TopNav({
  isShopOpen,
  isProfileOpen,
  onOpenShop,
  onCloseShop,
  onOpenProfile,
  onCloseProfile,
  avatarUrl,
  avatarInitial = "?",
}: TopNavProps) {
  const { isLightMode } = useTheme();

  const btnBase =
    "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50";

  const btnStyle = isLightMode
    ? {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }
    : {
        background: "#161009",
        border: "1px solid rgba(200,146,42,0.25)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.04)",
      };

  return (
    <nav
      className="fixed top-5 left-0 right-0 z-50 flex items-center justify-between px-5 pointer-events-none"
      aria-label="Primary navigation"
    >
      {/* ── Shopping Bag ── */}
      <button
        id="nav-shop-btn"
        onClick={isShopOpen ? onCloseShop : onOpenShop}
        className={`${btnBase} pointer-events-auto hover:scale-105`}
        style={btnStyle}
        aria-label={isShopOpen ? "Close shop" : "Open shop"}
        aria-expanded={isShopOpen}
      >
        {isShopOpen ? (
          <X
            size={18}
            strokeWidth={1.8}
            style={{ color: isLightMode ? "#78716c" : "rgba(200,146,42,0.8)" }}
          />
        ) : (
          <ShoppingBag
            size={18}
            strokeWidth={1.6}
            style={{ color: isLightMode ? "#78716c" : "rgba(200,146,42,0.7)" }}
          />
        )}
      </button>

      {/* ── Avatar / Profile ── */}
      <button
        id="nav-profile-btn"
        onClick={isProfileOpen ? onCloseProfile : onOpenProfile}
        className={`${btnBase} pointer-events-auto hover:scale-105 overflow-hidden`}
        style={btnStyle}
        aria-label={isProfileOpen ? "Close profile" : "Open profile"}
        aria-expanded={isProfileOpen}
      >
        {isProfileOpen ? (
          <X
            size={18}
            strokeWidth={1.8}
            style={{ color: isLightMode ? "#78716c" : "rgba(200,146,42,0.8)" }}
          />
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover opacity-90"
          />
        ) : avatarInitial === "?" ? (
          <User
            size={18}
            strokeWidth={1.6}
            style={{ color: isLightMode ? "#78716c" : "rgba(200,146,42,0.8)" }}
          />
        ) : (
          <span
            style={{
              fontFamily: "var(--font-playfair), serif",
              fontSize: "1.15rem",
              color: isLightMode ? "#78716c" : "rgba(200,146,42,0.8)",
            }}
          >
            {avatarInitial}
          </span>
        )}
      </button>
    </nav>
  );
}
