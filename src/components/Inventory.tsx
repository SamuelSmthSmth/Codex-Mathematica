"use client";

/**
 * src/components/Inventory.tsx
 *
 * "My Collection" tab inside the Shop.
 * Shows all items the user currently owns, with an "Equip" button per item.
 * Phase 3 will render actual previews.
 */

import { Check, Package } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useProgress } from "@/context/ProgressContext";
import { SHOP_ITEMS, SHOP_CATEGORIES } from "@/data/shop-items";
import type { ShopCategory } from "@/data/shop-items";

interface InventoryProps {
  activeCategory: ShopCategory;
}

export default function Inventory({ activeCategory }: InventoryProps) {
  const { isLightMode } = useTheme();
  const { ownedItems, equippedItems, equipItem } = useProgress();

  const ownedInCategory = SHOP_ITEMS.filter(
    (item) => item.category === activeCategory && ownedItems.has(item.id)
  );

  const categoryLabel = SHOP_CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "Items";

  if (ownedInCategory.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center"
        style={{ minHeight: "300px" }}
      >
        <Package
          size={32}
          strokeWidth={1}
          style={{ color: "color-mix(in srgb, var(--codex-accent) 25%, transparent)", marginBottom: "1rem" }}
        />
        <p
          className="italic"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.88rem",
            color: isLightMode ? "#a8a29e" : "rgba(168,150,120,0.55)",
          }}
        >
          No {categoryLabel} in your collection yet.
        </p>
        <p
          className="mt-1"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.75rem",
            color: isLightMode ? "#c7c3be" : "rgba(120,110,90,0.5)",
          }}
        >
          Visit the Browse tab to spend your Credits.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
    >
      {ownedInCategory.map((item) => {
        const isEquipped = equippedItems[item.category] === item.id;

        return (
          <article
            key={item.id}
            className="flex flex-col justify-between rounded-sm overflow-hidden"
            style={{
              background: isLightMode ? "#ffffff" : "#12100d",
              border: isEquipped
                ? "1px solid color-mix(in srgb, var(--codex-accent) 50%, transparent)"
                : isLightMode
                ? "1px solid #e5e7eb"
                : "1px solid color-mix(in srgb, var(--codex-accent) 12%, transparent)",
              boxShadow: isEquipped
                ? "0 0 12px color-mix(in srgb, var(--codex-accent) 15%, transparent)"
                : "none",
            }}
          >
            {/* Preview placeholder */}
            <div
              className="w-full flex items-center justify-center overflow-hidden relative"
              style={{
                height: "80px",
                background: isLightMode ? "#f5f0e8" : "color-mix(in srgb, var(--codex-accent) 4%, transparent)",
                borderBottom: "1px solid color-mix(in srgb, var(--codex-accent) 8%, transparent)",
              }}
            >
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-300" />
              ) : (
                <span style={{ fontSize: "1.8rem" }}>
                  {SHOP_CATEGORIES.find((c) => c.id === item.category)?.icon}
                </span>
              )}
            </div>

            <div className="p-3">
              <p
                className="mb-1"
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.85rem",
                  color: isLightMode ? "#1c1917" : "rgba(220,205,175,0.9)",
                }}
              >
                {item.name}
              </p>

              {isEquipped ? (
                <div className="flex items-center gap-1.5 mt-2">
                  <Check size={12} strokeWidth={2} style={{ color: "rgba(110,200,80,0.9)" }} />
                  <span
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "0.65rem",
                      color: "rgba(110,200,80,0.8)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Equipped
                  </span>
                </div>
              ) : (
                <button
                  id={`equip-${item.id}`}
                  onClick={() => equipItem(item.category, item.id)}
                  className="mt-2 w-full py-1.5 rounded-sm transition-all duration-200 uppercase tracking-widest"
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "0.58rem",
                    color: "color-mix(in srgb, var(--codex-accent) 85%, transparent)",
                    background: "color-mix(in srgb, var(--codex-accent) 8%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--codex-accent) 20%, transparent)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "color-mix(in srgb, var(--codex-accent) 15%, transparent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "color-mix(in srgb, var(--codex-accent) 8%, transparent)")
                  }
                >
                  Equip
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
