// @ts-nocheck
"use client";

/**
 * src/components/ShopLayout.tsx
 *
 * The Storefront — single scrollable page, no tabs.
 * Categories rendered as headed sections: Themes first, Archives below.
 * Credit wallet shown in the header.
 */

import { useTheme } from "@/context/ThemeContext";
import { type ShopItem } from "@/data/shop-items";
import { Coins, Lock, Check, Sparkles } from "lucide-react";
import { useShopLogic } from "@/hooks/useShopLogic";

// ─────────────────────────────────────────────────────────────────────────────
// Rank badge helper
// ─────────────────────────────────────────────────────────────────────────────

const RANK_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "RANK I — PRESTIGE",  color: "color-mix(in srgb, var(--codex-accent) 100%, transparent)" },
  2: { label: "RANK II — STANDARD", color: "rgba(120,180,200,0.85)" },
  3: { label: "RANK III — GRIND",   color: "rgba(160,155,150,0.7)" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Item Card
// ─────────────────────────────────────────────────────────────────────────────

function ShopItemCard({ item }: { item: ShopItem }) {
  const { isLightMode } = useTheme();
  const { handleBuy, handleEquip, isItemOwned, isItemLocked, isItemEquipped, credits } = useShopLogic();

  const isOwned    = isItemOwned(item.id);
  const canAfford  = credits >= item.price;
  const isLocked   = isItemLocked(item.id, item.achievementLocked);
  const isEquipped = isItemEquipped(item.category, item.id);
  const rank       = item.rank;

  return (
    <article
      className="group flex flex-col rounded overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: isLightMode ? "#ffffff" : "#13100d",
        border: isEquipped
          ? "1px solid color-mix(in srgb, var(--codex-accent) 60%, transparent)"
          : isLightMode ? "1px solid #e5e7eb" : "1px solid color-mix(in srgb, var(--codex-accent) 12%, transparent)",
        boxShadow: isEquipped
          ? "0 0 20px color-mix(in srgb, var(--codex-accent) 12%, transparent), 0 4px 16px rgba(0,0,0,0.1)"
          : isLightMode
          ? "0 2px 8px rgba(0,0,0,0.05)"
          : "0 4px 16px rgba(0,0,0,0.4)",
        opacity: isLocked ? 0.65 : 1,
      }}
    >
      {/* Preview area */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: "100px",
          background: isLightMode ? "#f5f0e8" : "color-mix(in srgb, var(--codex-accent) 4%, transparent)",
          borderBottom: "1px solid color-mix(in srgb, var(--codex-accent) 8%, transparent)",
        }}
      >
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
          />
        ) : (
          <Sparkles size={28} strokeWidth={1} style={{ color: "color-mix(in srgb, var(--codex-accent) 30%, transparent)" }} />
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
              background: "rgba(0,0,0,0.55)",
              border: `1px solid ${RANK_LABELS[rank].color}40`,
            }}
          >
            {RANK_LABELS[rank].label}
          </span>
        )}

        {/* Lock */}
        {isLocked && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)" }}
          >
            <Lock size={22} strokeWidth={1.5} style={{ color: "color-mix(in srgb, var(--codex-accent) 60%, transparent)" }} />
          </div>
        )}

        {/* Equipped badge */}
        {isEquipped && (
          <span
            className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-sm"
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.48rem",
              letterSpacing: "0.08em",
              color: "rgba(110,200,80,0.95)",
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(80,180,50,0.4)",
            }}
          >
            <Check size={9} strokeWidth={2.5} /> EQUIPPED
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.9rem",
            color: isLightMode ? "#1c1917" : "rgba(220,205,175,0.92)",
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
          {isLocked ? item.unlockRequirement : item.description}
        </p>

        {/* Price + Action */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <span
            className="flex items-center gap-1"
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.82rem",
              color: item.price === 0 ? "rgba(110,200,80,0.8)" : "color-mix(in srgb, var(--codex-accent) 85%, transparent)",
            }}
          >
            <Coins size={12} strokeWidth={1.6} />
            {item.price === 0 ? "Free" : item.price.toLocaleString()}
          </span>

          {isOwned ? (
            item.category === "themes" && !isEquipped ? (
              <button
                id={`equip-${item.id}`}
                onClick={() => handleEquip(item)}
                className="px-3 py-1 rounded-sm uppercase tracking-widest transition-all duration-200"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.55rem",
                  letterSpacing: "0.12em",
                  color: "color-mix(in srgb, var(--codex-accent) 90%, transparent)",
                  background: "color-mix(in srgb, var(--codex-accent) 8%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--codex-accent) 25%, transparent)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--codex-accent) 15%, transparent)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--codex-accent) 8%, transparent)")}
              >
                Equip
              </button>
            ) : (
              <span
                className="px-3 py-1"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.55rem",
                  letterSpacing: "0.12em",
                  color: "rgba(110,200,80,0.85)",
                }}
              >
                Owned
              </span>
            )
          ) : (
            <button
              id={`buy-${item.id}`}
              onClick={() => handleBuy(item)}
              disabled={isLocked || !canAfford}
              className="px-3 py-1 rounded-sm uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "0.55rem",
                letterSpacing: "0.12em",
                color: "color-mix(in srgb, var(--codex-accent) 90%, transparent)",
                background: "color-mix(in srgb, var(--codex-accent) 8%, transparent)",
                border: "1px solid color-mix(in srgb, var(--codex-accent) 25%, transparent)",
              }}
              onMouseEnter={(e) => { if (!isLocked && canAfford) e.currentTarget.style.background = "color-mix(in srgb, var(--codex-accent) 18%, transparent)"; }}
              onMouseLeave={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--codex-accent) 8%, transparent)")}
            >
              {isLocked ? "Locked" : !canAfford ? "Need Credits" : "Buy"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section heading
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeading({ label, count, isLightMode }: { label: string; count: number; isLightMode: boolean }) {
  return (
    <div className="sticky top-0 z-20 flex items-baseline gap-3 mb-6 mt-12 first:mt-0 py-3 backdrop-blur-md" style={{ background: isLightMode ? "rgba(252,250,247,0.85)" : "rgba(10,7,6,0.85)" }}>
      <h2
        style={{
          fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
          fontSize: "1.5rem",
          fontWeight: 400,
          letterSpacing: "0.08em",
          color: isLightMode ? "#1c1917" : "rgba(225,210,180,0.9)",
        }}
      >
        {label}
      </h2>
      <span
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: "0.62rem",
          color: "color-mix(in srgb, var(--codex-accent) 60%, transparent)",
          letterSpacing: "0.15em",
        }}
      >
        {count} items
      </span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, color-mix(in srgb, var(--codex-accent) 30%, transparent), transparent)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ShopLayout — single scrollable page
// ─────────────────────────────────────────────────────────────────────────────

export default function ShopLayoutDefault() {
  const { isLightMode } = useTheme();
  const {
    credits,
    shopItems,
    shopCategories,
    categories,
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    filteredItems,
    inventoryItems,
    unlocks,
    isAchievementUnlocked,
    handleBuy,
    handlePurchase,
    handleEquip,
    isItemOwned,
    isItemLocked,
    isItemEquipped,
    SHOP_ITEMS,
    SHOP_CATEGORIES,
    ownedItems,
    equippedItems,
    buyItem,
    equipItem,
    itemsInCategory,
    items,
    selectedCategory,
    setSelectedCategory,
    itemsByCategory,
} = useShopLogic();

  const bg = isLightMode ? "#fcfaf7" : "#0a0706";
  const headerBg = isLightMode ? "#f5f0e8" : "#0d0a07";
  const borderColor = isLightMode ? "#e5e7eb" : "color-mix(in srgb, var(--codex-accent) 12%, transparent)";

  return (
    <div className="h-full overflow-y-auto flex flex-col" style={{ background: bg }}>
      {/* ── Header ── */}
      <header
        className="px-8 py-5 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor, background: headerBg }}
      >
        <div>
          <p
            className="uppercase tracking-[0.4em] mb-1"
            style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", color: "color-mix(in srgb, var(--codex-accent) 50%, transparent)" }}
          >
            The Grand Archive
          </p>
          <h1
            className="font-light"
            style={{
              fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
              fontSize: "1.55rem",
              letterSpacing: "0.06em",
              color: isLightMode ? "#1c1917" : "rgba(235,220,185,0.9)",
            }}
          >
            The Store
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                color: "color-mix(in srgb, var(--codex-accent) 60%, transparent)",
                textTransform: "uppercase",
              }}
            >
              Available Balance
            </span>
            <div
              className="flex items-center gap-2 mt-0.5 px-3 py-1 rounded"
              style={{
                background: "linear-gradient(90deg, color-mix(in srgb, var(--codex-accent) 10%, transparent), color-mix(in srgb, var(--codex-accent) 5%, transparent))",
                border: "1px solid color-mix(in srgb, var(--codex-accent) 30%, transparent)",
                boxShadow: "0 0 10px color-mix(in srgb, var(--codex-accent) 10%, transparent)"
              }}
            >
              <Coins size={14} className="text-amber-500 drop-shadow-[0_0_2px_color-mix(in srgb, var(--codex-accent) 80%, transparent)]" />
              <span
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: "color-mix(in srgb, var(--codex-accent) 100%, transparent)",
                }}
              >
                {credits.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 overflow-y-auto px-8 py-6 pb-24" style={{ scrollbarWidth: "thin", scrollbarColor: "color-mix(in srgb, var(--codex-accent) 20%, transparent) transparent" }}>
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {shopCategories.map((category) => {
            const itemsInCategory = shopItems.filter((i) => i.category === category.id);
            if (itemsInCategory.length === 0) return null;

            return (
              <section key={category.id} id={`tour-shop-${category.id}`}>
                <SectionHeading label={category.label} count={itemsInCategory.length} isLightMode={isLightMode} />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {itemsInCategory.map((item) => (
                    <ShopItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
