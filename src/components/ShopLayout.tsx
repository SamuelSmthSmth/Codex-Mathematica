"use client";

/**
 * src/components/ShopLayout.tsx
 *
 * The Storefront. Per PLAN §5:
 *   - Left sidebar: category navigation (Guardian Tales style)
 *   - Main area: item grid (Keymash style) with name, preview, price, Buy button
 *   - Top toggle: "Browse" vs "My Collection" (Inventory) tabs
 *   - Credit wallet visible ONLY here
 */

import { useState } from "react";
import { Coins, Lock } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useProgress } from "@/context/ProgressContext";
import {
  SHOP_ITEMS,
  SHOP_CATEGORIES,
  type ShopCategory,
  type ShopItem,
} from "@/data/shop-items";
import Inventory from "./Inventory";

// ─────────────────────────────────────────────────────────────────────────────
// Rank badge helper
// ─────────────────────────────────────────────────────────────────────────────

const RANK_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "RANK I — PRESTIGE",  color: "rgba(200,146,42,1)" },
  2: { label: "RANK II — STANDARD", color: "rgba(120,180,200,0.85)" },
  3: { label: "RANK III — GRIND",   color: "rgba(160,155,150,0.7)" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Item Card
// ─────────────────────────────────────────────────────────────────────────────

function ShopItemCard({ item }: { item: ShopItem }) {
  const { isLightMode } = useTheme();
  const { credits, buyItem, ownedItems, isAchievementUnlocked } = useProgress();

  const isOwned = ownedItems.has(item.id);
  const canAfford = credits >= item.price;
  // Achievement-locked items become unlockable once their predicate is satisfied
  const isLocked = !!item.achievementLocked && !isAchievementUnlocked(item.id);
  const rank = item.rank;

  const handleBuy = () => {
    if (isOwned || isLocked) return;
    buyItem(item.id, item.price);
  };

  return (
    <article
      className="flex flex-col rounded-sm overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        background: isLightMode ? "#ffffff" : "#13100d",
        border: isLightMode ? "1px solid #e5e7eb" : "1px solid rgba(200,146,42,0.12)",
        boxShadow: isLightMode ? "0 2px 8px rgba(0,0,0,0.04)" : "0 4px 16px rgba(0,0,0,0.5)",
        opacity: isLocked ? 0.65 : 1,
      }}
    >
      {/* Preview area */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: "90px",
          background: isLightMode ? "#f5f0e8" : "rgba(200,146,42,0.04)",
          borderBottom: "1px solid rgba(200,146,42,0.08)",
        }}
      >
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-300" />
        ) : (
          <span style={{ fontSize: "2rem" }}>
            {SHOP_CATEGORIES.find((c) => c.id === item.category)?.icon}
          </span>
        )}

        {/* Rank badge */}
        {rank && (
          <span
            className="absolute top-2 left-2 px-1.5 py-0.5 rounded-sm"
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.48rem",
              letterSpacing: "0.1em",
              color: RANK_LABELS[rank].color,
              background: "rgba(0,0,0,0.5)",
              border: `1px solid ${RANK_LABELS[rank].color}40`,
            }}
          >
            {RANK_LABELS[rank].label}
          </span>
        )}

        {/* Lock icon */}
        {isLocked && (
          <div
            className="absolute top-2 right-2"
            title={item.unlockRequirement}
          >
            <Lock size={12} strokeWidth={1.5} style={{ color: "rgba(200,146,42,0.6)" }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.88rem",
            color: isLightMode ? "#1c1917" : "rgba(220,205,175,0.9)",
          }}
        >
          {item.name}
        </p>

        <p
          className="italic flex-1"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.72rem",
            color: isLightMode ? "#78716c" : "rgba(160,148,125,0.65)",
            lineHeight: "1.5",
          }}
        >
          {item.achievementLocked
            ? item.unlockRequirement
            : item.description}
        </p>

        {/* Price + Buy */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <span
            className="flex items-center gap-1"
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.8rem",
              color: "rgba(200,146,42,0.85)",
            }}
          >
            <Coins size={12} strokeWidth={1.6} />
            {item.price.toLocaleString()}
          </span>

          <button
            id={`buy-${item.id}`}
            onClick={handleBuy}
            disabled={isOwned || isLocked || !canAfford}
            className="px-3 py-1 rounded-sm uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "0.55rem",
              letterSpacing: "0.12em",
              color: isOwned ? "rgba(110,200,80,0.9)" : "rgba(200,146,42,0.9)",
              background: isOwned ? "rgba(80,180,50,0.08)" : "rgba(200,146,42,0.08)",
              border: isOwned
                ? "1px solid rgba(80,180,50,0.3)"
                : "1px solid rgba(200,146,42,0.25)",
            }}
          >
            {isOwned ? "Owned" : isLocked ? "Locked" : !canAfford ? "Can't Afford" : "Buy"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ShopLayout
// ─────────────────────────────────────────────────────────────────────────────

type ShopTab = "browse" | "collection";

export default function ShopLayout() {
  const { isLightMode } = useTheme();
  const { credits } = useProgress();
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("themes");
  const [activeTab, setActiveTab] = useState<ShopTab>("browse");

  const itemsInCategory = SHOP_ITEMS.filter(
    (item) => item.category === activeCategory
  );

  const bg = isLightMode ? "#fcfaf7" : "#0a0706";
  const sidebarBg = isLightMode ? "#f5f0e8" : "#0d0a07";
  const borderColor = isLightMode ? "#e5e7eb" : "rgba(200,146,42,0.12)";

  return (
    <div
      className="min-h-screen flex flex-col codex-view pt-16"
      style={{ background: bg }}
    >
      {/* ── Header ── */}
      <header
        className="px-6 py-5 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor, background: sidebarBg }}
      >
        <div>
          <p
            className="uppercase tracking-[0.4em] mb-1"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "0.58rem",
              color: "rgba(200,146,42,0.5)",
            }}
          >
            The Grand Archive
          </p>
          <h1
            className="font-light"
            style={{
              fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
              fontSize: "1.5rem",
              letterSpacing: "0.06em",
              color: isLightMode ? "#1c1917" : "rgba(235,220,185,0.9)",
            }}
          >
            The Store
          </h1>
        </div>

        {/* Wallet — visible ONLY inside the Store per PLAN §5 */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-sm"
          style={{
            background: "rgba(200,146,42,0.08)",
            border: "1px solid rgba(200,146,42,0.2)",
          }}
        >
          <Coins size={15} strokeWidth={1.5} style={{ color: "rgba(200,146,42,0.8)" }} />
          <span
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "1rem",
              color: "rgba(200,146,42,0.9)",
            }}
          >
            {credits.toLocaleString()}
          </span>
          <span
            className="uppercase tracking-widest"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "0.55rem",
              color: "rgba(200,146,42,0.55)",
            }}
          >
            Credits
          </span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside
          className="flex-shrink-0 border-r flex flex-col"
          style={{ width: "180px", borderColor, background: sidebarBg }}
        >
          {/* Browse / Collection toggle */}
          <div
            className="flex border-b"
            style={{ borderColor }}
          >
            {(["browse", "collection"] as ShopTab[]).map((tab) => (
              <button
                key={tab}
                id={`shop-tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-3 uppercase tracking-widest transition-colors duration-200"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.52rem",
                  color:
                    activeTab === tab
                      ? "rgba(200,146,42,0.9)"
                      : isLightMode
                      ? "#a8a29e"
                      : "rgba(120,110,90,0.6)",
                  background:
                    activeTab === tab
                      ? "rgba(200,146,42,0.06)"
                      : "transparent",
                  borderBottom:
                    activeTab === tab
                      ? "2px solid rgba(200,146,42,0.6)"
                      : "2px solid transparent",
                }}
              >
                {tab === "browse" ? "Browse" : "Collection"}
              </button>
            ))}
          </div>

          {/* Category list */}
          <nav className="flex-1 py-2" aria-label="Shop categories">
            {SHOP_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`shop-cat-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-150"
                  style={{
                    background: isActive ? "rgba(200,146,42,0.1)" : "transparent",
                    borderLeft: isActive
                      ? "2px solid rgba(200,146,42,0.7)"
                      : "2px solid transparent",
                    color: isActive
                      ? "rgba(200,146,42,0.9)"
                      : isLightMode
                      ? "#78716c"
                      : "rgba(168,155,130,0.65)",
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>{cat.icon}</span>
                  <span
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "0.75rem",
                    }}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "collection" ? (
            <Inventory activeCategory={activeCategory} />
          ) : (
            <>
              <p
                className="mb-6 uppercase tracking-[0.3em]"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.58rem",
                  color: "rgba(200,146,42,0.5)",
                }}
              >
                {SHOP_CATEGORIES.find((c) => c.id === activeCategory)?.label} —{" "}
                {itemsInCategory.length} items
              </p>

              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}
              >
                {itemsInCategory.map((item) => (
                  <ShopItemCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
