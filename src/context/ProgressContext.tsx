"use client";

/**
 * src/context/ProgressContext.tsx
 *
 * Tracks the user's gamified progress:
 *   - credits       → large-number currency earned by grading fragments
 *   - addCredits()  → award credits after a self-grade event
 *   - ownedItems    → set of shop item IDs the user has purchased
 *   - buyItem()     → spend credits and add to owned set
 *   - equippedItems → map of category → equipped item ID
 *   - equipItem()   → equip an owned item
 *
 * All state is persisted to localStorage. Firebase sync comes in Phase 4.
 *
 * Credit awards (from PLAN §4):
 *   - "correct"  → 100 credits
 *   - "close"    → 50 credits  (partial credit)
 *   - "wrong"    → 0 credits
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SelfGrade = "correct" | "close" | "wrong";

export const CREDIT_AWARDS: Record<SelfGrade, number> = {
  correct: 100,
  close: 50,
  wrong: 0,
};

export interface ProgressContextValue {
  /** Current credit balance. */
  credits: number;
  /** Award credits for a self-grade result. */
  addCredits: (grade: SelfGrade) => void;
  /** IDs of items the user has purchased. */
  ownedItems: Set<string>;
  /** Buy a shop item (deducts credits). Returns false if insufficient funds. */
  buyItem: (itemId: string, price: number) => boolean;
  /** Map of shopCategory → equipped item ID. */
  equippedItems: Record<string, string>;
  /** Equip an owned item (must be in ownedItems). */
  equipItem: (category: string, itemId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// localStorage keys
// ─────────────────────────────────────────────────────────────────────────────

const LS_CREDITS   = "codex_credits";
const LS_OWNED     = "codex_owned_items";
const LS_EQUIPPED  = "codex_equipped_items";

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ProgressContext = createContext<ProgressContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState(0);
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set());
  const [equippedItems, setEquippedItems] = useState<Record<string, string>>({});

  // ── Hydrate from localStorage ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const savedCredits = localStorage.getItem(LS_CREDITS);
      if (savedCredits !== null) setCredits(Number(savedCredits));

      const savedOwned = localStorage.getItem(LS_OWNED);
      if (savedOwned) setOwnedItems(new Set(JSON.parse(savedOwned) as string[]));

      const savedEquipped = localStorage.getItem(LS_EQUIPPED);
      if (savedEquipped) setEquippedItems(JSON.parse(savedEquipped));
    } catch {
      // Silently ignore parse errors — start fresh
    }
  }, []);

  // ── Persist credits ───────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(LS_CREDITS, String(credits));
  }, [credits]);

  // ── Persist owned items ───────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(LS_OWNED, JSON.stringify([...ownedItems]));
  }, [ownedItems]);

  // ── Persist equipped items ────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(LS_EQUIPPED, JSON.stringify(equippedItems));
  }, [equippedItems]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const addCredits = useCallback((grade: SelfGrade) => {
    const amount = CREDIT_AWARDS[grade];
    if (amount > 0) {
      setCredits((prev) => prev + amount);
    }
  }, []);

  const buyItem = useCallback((itemId: string, price: number): boolean => {
    let success = false;
    setCredits((prev) => {
      if (prev < price) return prev;
      success = true;
      return prev - price;
    });
    if (success) {
      setOwnedItems((prev) => new Set([...prev, itemId]));
    }
    return success;
  }, []);

  const equipItem = useCallback((category: string, itemId: string) => {
    setEquippedItems((prev) => ({ ...prev, [category]: itemId }));
  }, []);

  return (
    <ProgressContext.Provider
      value={{ credits, addCredits, ownedItems, buyItem, equippedItems, equipItem }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be called inside <ProgressProvider>.");
  }
  return ctx;
}
