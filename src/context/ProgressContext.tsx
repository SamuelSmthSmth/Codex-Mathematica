"use client";

/**
 * src/context/ProgressContext.tsx
 *
 * Offline-first, single save-file architecture (CrossCode-style).
 * One JSON blob ("CodexSave") is the source of truth for all progress.
 * It lives in localStorage under SAVE_KEY and is synced to Firestore
 * as a single document at users/{uid}/saveFile.
 *
 * Schema:
 *   credits           – total accumulated credits
 *   ownedItems        – array of purchased shop item IDs
 *   equippedItems     – map of category → equipped item ID
 *   solvedPerVolume   – map of volume ID → total solved count (for achievements)
 *   grimoire          – map of fragmentId → { grade, volume, chapter }
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
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

export interface GrimoireEntry {
  grade: SelfGrade;
  volume: string;
  chapter: number;
  savedAt: string; // ISO timestamp
}

export interface CodexSave {
  version: 1;
  savedAt: string;
  credits: number;
  ownedItems: string[];
  equippedItems: Record<string, string>;
  solvedPerVolume: Record<string, number>;
  grimoire: Record<string, GrimoireEntry>; // key = String(fragmentId)
  hasSeenTour?: boolean; // Added in v1
}

export interface ProgressContextValue {
  // ── Economy ──────────────────────────────────────────────────────────────
  credits: number;
  addCredits: (grade: SelfGrade) => void;

  // ── Shop ─────────────────────────────────────────────────────────────────
  ownedItems: Set<string>;
  buyItem: (itemId: string, price: number) => boolean;
  equippedItems: Record<string, string>;
  equipItem: (category: string, itemId: string) => void;

  // ── Achievements ─────────────────────────────────────────────────────────
  solvedPerVolume: Record<string, number>;
  recordSolve: (volumeId: string) => void;
  isAchievementUnlocked: (achievementItemId: string) => boolean;

  // ── Grimoire (local fragment grades) ─────────────────────────────────────
  grimoire: Record<string, GrimoireEntry>;
  saveGrimoireEntry: (
    fragmentId: number,
    grade: SelfGrade,
    volume: string,
    chapter: number
  ) => void;
  getGrimoireGrade: (fragmentId: number) => SelfGrade | null;

  // ── Save file management ──────────────────────────────────────────────────
  exportSave: () => string;
  importSave: (json: string) => boolean;

  // ── Tour ──────────────────────────────────────────────────────────────────
  hasSeenTour: boolean;
  markTourSeen: () => void;
  
  // ── Wipe ──────────────────────────────────────────────────────────────────
  wipeProgress: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Save key + helpers
// ─────────────────────────────────────────────────────────────────────────────

const SAVE_KEY = "codex_save_v1";

function buildDefaultSave(): CodexSave {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    credits: 0,
    ownedItems: ["theme-default"],
    equippedItems: {},
    solvedPerVolume: {},
    grimoire: {},
    hasSeenTour: false,
  };
}

function loadSave(): CodexSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return buildDefaultSave();
    const parsed = JSON.parse(raw) as Partial<CodexSave>;
    // Migrate from old multi-key schema if needed
    if (!parsed.version) {
      const migrated = buildDefaultSave();
      try {
        const oldCredits = localStorage.getItem("codex_credits");
        if (oldCredits) migrated.credits = Number(oldCredits);
        const oldOwned = localStorage.getItem("codex_owned_items");
        if (oldOwned) migrated.ownedItems = JSON.parse(oldOwned);
        const oldEquipped = localStorage.getItem("codex_equipped_items");
        if (oldEquipped) migrated.equippedItems = JSON.parse(oldEquipped);
        const oldSolved = localStorage.getItem("codex_solved_per_volume");
        if (oldSolved) migrated.solvedPerVolume = JSON.parse(oldSolved);
      } catch { /* ignore migration errors */ }
      return migrated;
    }
    const merged = { ...buildDefaultSave(), ...parsed };
    // Always ensure theme-default is owned (retroactive migration)
    if (!merged.ownedItems.includes("theme-default")) {
      merged.ownedItems = ["theme-default", ...merged.ownedItems];
    }
    return merged;
  } catch {
    return buildDefaultSave();
  }
}

function persistSave(save: CodexSave) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...save, savedAt: new Date().toISOString() }));
  } catch { /* storage full or unavailable */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Achievement predicates
// ─────────────────────────────────────────────────────────────────────────────

type AchievementPredicate = (save: CodexSave) => boolean;

const ACHIEVEMENT_RULES: Record<string, AchievementPredicate> = {
  "banner-limits-master": (s) => (s.solvedPerVolume["alpha"] ?? 0) >= 100,
  "banner-integrator":    (s) => (s.solvedPerVolume["gamma"] ?? 0) >= 100,
  "banner-whale":         (s) => s.ownedItems.length >= 5,
};

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ProgressContext = createContext<ProgressContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<CodexSave>(buildDefaultSave);

  // Derived convenience state
  const ownedItems      = new Set(save.ownedItems);
  const equippedItems   = save.equippedItems;
  const credits         = save.credits;
  const solvedPerVolume = save.solvedPerVolume;
  const grimoire        = save.grimoire;

  // ── Hydrate ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const loaded = loadSave();
    setSave(loaded);
  }, []);

  // ── Persist on every change ───────────────────────────────────────────────
  // Use a ref to avoid persisting the initial default before hydration
  const isHydrated = useRef(false);
  useEffect(() => {
    if (!isHydrated.current) {
      isHydrated.current = true;
      return;
    }
    persistSave(save);
  }, [save]);

  // ── Updater helper ────────────────────────────────────────────────────────
  const updateSave = useCallback((updater: (prev: CodexSave) => CodexSave) => {
    setSave(updater);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const addCredits = useCallback((grade: SelfGrade) => {
    const amount = CREDIT_AWARDS[grade];
    if (amount > 0) {
      updateSave((prev) => ({ ...prev, credits: prev.credits + amount }));
    }
  }, [updateSave]);

  useEffect(() => {
    // @ts-ignore
    window.cheatCredits = (amount = 10000) => {
      updateSave((prev) => ({ ...prev, credits: prev.credits + amount }));
      console.log(`Added ${amount} credits!`);
    };
  }, [updateSave]);

  const buyItem = useCallback((itemId: string, price: number): boolean => {
    let success = false;
    updateSave((prev) => {
      if (prev.credits < price || prev.ownedItems.includes(itemId)) return prev;
      success = true;
      return {
        ...prev,
        credits: prev.credits - price,
        ownedItems: [...prev.ownedItems, itemId],
      };
    });
    return success;
  }, [updateSave]);

  const equipItem = useCallback((category: string, itemId: string) => {
    updateSave((prev) => ({
      ...prev,
      equippedItems: { ...prev.equippedItems, [category]: itemId },
    }));
  }, [updateSave]);

  const recordSolve = useCallback((volumeId: string) => {
    updateSave((prev) => ({
      ...prev,
      solvedPerVolume: {
        ...prev.solvedPerVolume,
        [volumeId]: (prev.solvedPerVolume[volumeId] ?? 0) + 1,
      },
    }));
  }, [updateSave]);

  const isAchievementUnlocked = useCallback(
    (achievementItemId: string): boolean => {
      const predicate = ACHIEVEMENT_RULES[achievementItemId];
      if (!predicate) return false;
      return predicate(save);
    },
    [save]
  );

  const saveGrimoireEntry = useCallback(
    (fragmentId: number, grade: SelfGrade, volume: string, chapter: number) => {
      const key = String(fragmentId);
      updateSave((prev) => ({
        ...prev,
        grimoire: {
          ...prev.grimoire,
          [key]: { grade, volume, chapter, savedAt: new Date().toISOString() },
        },
      }));
    },
    [updateSave]
  );

  const getGrimoireGrade = useCallback(
    (fragmentId: number): SelfGrade | null => {
      return grimoire[String(fragmentId)]?.grade ?? null;
    },
    [grimoire]
  );

  // ── Tour ──────────────────────────────────────────────────────────────────

  const markTourSeen = useCallback(() => {
    updateSave((prev) => ({ ...prev, hasSeenTour: true }));
  }, [updateSave]);

  const wipeProgress = useCallback(() => {
    setSave(buildDefaultSave());
    localStorage.removeItem(SAVE_KEY);
  }, []);

  // ── Save file I/O ─────────────────────────────────────────────────────────

  const exportSave = useCallback((): string => {
    return JSON.stringify({ ...save, savedAt: new Date().toISOString() }, null, 2);
  }, [save]);

  const importSave = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as Partial<CodexSave>;
      if (parsed.version !== 1) return false;
      const merged: CodexSave = {
        version: 1,
        savedAt: new Date().toISOString(),
        // Take the maximum credit balance (never lose progress)
        credits: Math.max(save.credits, parsed.credits ?? 0),
        // Union of owned items
        ownedItems: [...new Set([...save.ownedItems, ...(parsed.ownedItems ?? [])])],
        // Prefer imported equipped items
        equippedItems: { ...save.equippedItems, ...(parsed.equippedItems ?? {}) },
        // Take max solve counts per volume
        solvedPerVolume: { ...save.solvedPerVolume },
        // Union of grimoire entries (imported wins on conflicts)
        grimoire: { ...save.grimoire, ...(parsed.grimoire ?? {}) },
      };
      for (const [vol, count] of Object.entries(parsed.solvedPerVolume ?? {})) {
        merged.solvedPerVolume[vol] = Math.max(merged.solvedPerVolume[vol] ?? 0, count);
      }
      setSave(merged);
      return true;
    } catch {
      return false;
    }
  }, [save]);

  return (
    <ProgressContext.Provider
      value={{
        credits,
        addCredits,
        ownedItems,
        buyItem,
        equippedItems,
        equipItem,
        solvedPerVolume,
        recordSolve,
        isAchievementUnlocked,
        grimoire,
        saveGrimoireEntry,
        getGrimoireGrade,
        exportSave,
        importSave,
        hasSeenTour: save?.hasSeenTour ?? false,
        markTourSeen,
        wipeProgress,
      }}
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
