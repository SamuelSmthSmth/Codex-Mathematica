"use client";

/**
 * src/components/ShopLayout.tsx
 *
 * The Storefront — single scrollable page, no tabs.
 * Categories rendered as headed sections: Themes first, Archives below.
 * Credit wallet shown in the header.
 */

import { useTheme } from "@/context/ThemeContext";
import { useProgress } from "@/context/ProgressContext";
import {
  SHOP_ITEMS,
  SHOP_CATEGORIES,
  type ShopItem,
} from "@/data/shop-items";
import { Coins, Lock, Check, Sparkles } from "lucide-react";

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
  const { credits, buyItem, ownedItems, equipItem, equippedItems, isAchievementUnlocked } = useProgress();

  const isOwned    = ownedItems.has(item.id);
  const canAfford  = credits >= item.price;
  const isLocked   = !!item.achievementLocked && !isAchievementUnlocked(item.id);
  const isEquipped = equippedItems[item.category] === item.id;
  const rank       = item.rank;

  const handleBuy = () => {
    if (isOwned || isLocked) return;
    const bought = buyItem(item.id, item.price);
    if (bought && item.category === "themes") {
      equipItem(item.category, item.id);
    }
  };

  const handleEquip = () => {
    equipItem(item.category, item.id);
  };

  return (
    <article
      className="group flex flex-col rounded overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: isLightMode ? "#ffffff" : "#13100d",
        border: isEquipped
          ? "1px solid rgba(200,146,42,0.6)"
          : isLightMode ? "1px solid #e5e7eb" : "1px solid rgba(200,146,42,0.12)",
        boxShadow: isEquipped
          ? "0 0 20px rgba(200,146,42,0.12), 0 4px 16px rgba(0,0,0,0.1)"
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
          background: isLightMode ? "#f5f0e8" : "rgba(200,146,42,0.04)",
          borderBottom: "1px solid rgba(200,146,42,0.08)",
        }}
      >
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
          />
        ) : (
          <Sparkles size={28} strokeWidth={1} style={{ color: "rgba(200,146,42,0.3)" }} />
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
            <Lock size={22} strokeWidth={1.5} style={{ color: "rgba(200,146,42,0.6)" }} />
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
              color: item.price === 0 ? "rgba(110,200,80,0.8)" : "rgba(200,146,42,0.85)",
            }}
          >
            <Coins size={12} strokeWidth={1.6} />
            {item.price === 0 ? "Free" : item.price.toLocaleString()}
          </span>

          {isOwned ? (
            item.category === "themes" && !isEquipped ? (
              <button
                id={`equip-${item.id}`}
                onClick={handleEquip}
                className="px-3 py-1 rounded-sm uppercase tracking-widest transition-all duration-200"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.55rem",
                  letterSpacing: "0.12em",
                  color: "rgba(200,146,42,0.9)",
                  background: "rgba(200,146,42,0.08)",
                  border: "1px solid rgba(200,146,42,0.25)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,146,42,0.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(200,146,42,0.08)")}
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
              onClick={handleBuy}
              disabled={isLocked || !canAfford}
              className="px-3 py-1 rounded-sm uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "0.55rem",
                letterSpacing: "0.12em",
                color: "rgba(200,146,42,0.9)",
                background: "rgba(200,146,42,0.08)",
                border: "1px solid rgba(200,146,42,0.25)",
              }}
              onMouseEnter={(e) => { if (!isLocked && canAfford) e.currentTarget.style.background = "rgba(200,146,42,0.18)"; }}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(200,146,42,0.08)")}
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
          color: "rgba(200,146,42,0.6)",
          letterSpacing: "0.15em",
        }}
      >
        {count} items
      </span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, rgba(200,146,42,0.3), transparent)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ShopLayout — single scrollable page
// ─────────────────────────────────────────────────────────────────────────────

export default function ShopLayout() {
  const { isLightMode } = useTheme();
  const { credits } = useProgress();

  const bg = isLightMode ? "#fcfaf7" : "#0a0706";
  const headerBg = isLightMode ? "#f5f0e8" : "#0d0a07";
  const borderColor = isLightMode ? "#e5e7eb" : "rgba(200,146,42,0.12)";

  return (
    <div className="h-full flex flex-col" style={{ background: bg }}>
      {/* ── Header ── */}
      <header
        className="px-8 py-5 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor, background: headerBg }}
      >
        <div>
          <p
            className="uppercase tracking-[0.4em] mb-1"
            style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", color: "rgba(200,146,42,0.5)" }}
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
                color: "rgba(200,146,42,0.6)",
                textTransform: "uppercase",
              }}
            >
              Available Balance
            </span>
            <div
              className="flex items-center gap-2 mt-0.5 px-3 py-1 rounded"
              style={{
                background: "linear-gradient(90deg, rgba(200,146,42,0.1), rgba(200,146,42,0.05))",
                border: "1px solid rgba(200,146,42,0.3)",
                boxShadow: "0 0 10px rgba(200,146,42,0.1)"
              }}
            >
              <Coins size={14} className="text-amber-500 drop-shadow-[0_0_2px_rgba(200,146,42,0.8)]" />
              <span
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: "rgba(200,146,42,1)",
                }}
              >
                {credits.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 overflow-y-auto px-8 py-6 pb-24" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(200,146,42,0.2) transparent" }}>
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {SHOP_CATEGORIES.map((cat) => {
            const items = SHOP_ITEMS.filter((i) => i.category === cat.id);
            if (items.length === 0) return null;

            return (
              <section key={cat.id}>
                <SectionHeading label={cat.label} count={items.length} isLightMode={isLightMode} />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {items.map((item) => (
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
