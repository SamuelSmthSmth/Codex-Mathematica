"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useProgress } from "./ProgressContext";
import {
  type ThemePackId,
  THEME_PACKS,
  ALL_THEME_ROOT_CLASSES,
} from "@/themes/registry";

export interface PrintData {
  scholarName: string;
  proofs: { volume: string; chapter: number; fragment_id: number; proof_markdown: string }[];
  mastery: Record<string, number>;
}

interface ThemeContextValue {
  isLightMode: boolean;
  toggleTheme: () => void;
  isFocusMode: boolean;
  setIsFocusMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  printData: PrintData | null;
  setPrintData: (data: PrintData | null) => void;
  /** Active cosmetic theme pack (from Store equip or default). */
  activeThemeId: ThemePackId;
  setActiveThemeId: (id: ThemePackId) => void;
  activeThemeName: string;
  activeTheme: string;
  activeAnimation: string | null;
  activePalette: string | null;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const LS_THEME_PACK = "codex_theme_pack";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isFocusMode, setIsFocusModeState] = useState(false);
  const [printData, setPrintData] = useState<PrintData | null>(null);
  const [activeThemeId, setActiveThemeIdState] = useState<ThemePackId>("default");

  const setActiveThemeId = useCallback((id: ThemePackId) => {
    setActiveThemeIdState(id);
    localStorage.setItem(LS_THEME_PACK, id);
  }, []);

  const { equippedItems } = useProgress();

  const activeTheme = equippedItems["themes"] || "theme-default";
  const activeAnimation = equippedItems["animations"] || null;
  const activePalette = equippedItems["palettes"] || null;

  useEffect(() => {
    const savedTheme = localStorage.getItem("codex_theme");
    if (savedTheme === "light") setIsLightMode(true);

    const savedFocus = localStorage.getItem("codex_focus_mode");
    if (savedFocus === "true") setIsFocusModeState(true);

    const savedPack = localStorage.getItem(LS_THEME_PACK) as ThemePackId | null;
    if (savedPack && THEME_PACKS[savedPack]) {
      setActiveThemeIdState(savedPack);
    }
  }, []);

  const toggleTheme = () => {
    setIsLightMode((prev) => {
      const next = !prev;
      localStorage.setItem("codex_theme", next ? "light" : "dark");
      return next;
    });
  };

  const setIsFocusMode = (val: boolean | ((prev: boolean) => boolean)) => {
    setIsFocusModeState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      localStorage.setItem("codex_focus_mode", String(next));
      return next;
    });
  };

  // Apply CSS classes / data attributes globally
  useEffect(() => {
    const root = document.documentElement;
    if (isLightMode) {
      root.classList.add("theme-light");
    } else {
      root.classList.remove("theme-light");
    }

    root.setAttribute("data-theme", activeTheme);
    if (activePalette) root.setAttribute("data-palette", activePalette);
    else root.removeAttribute("data-palette");
  }, [isLightMode, activeTheme, activePalette]);

  useEffect(() => {
    const root = document.documentElement;
    const pack = THEME_PACKS[activeThemeId];

    for (const cls of ALL_THEME_ROOT_CLASSES) {
      root.classList.remove(cls);
    }
    root.classList.add(pack.rootClass);
  }, [activeThemeId]);

  const activeThemeName = THEME_PACKS[activeThemeId].name;

  return (
    <ThemeContext.Provider
      value={{
        isLightMode,
        toggleTheme,
        isFocusMode,
        setIsFocusMode,
        printData,
        setPrintData,
        activeThemeId,
        setActiveThemeId,
        activeThemeName,
        activeTheme,
        activeAnimation,
        activePalette
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
