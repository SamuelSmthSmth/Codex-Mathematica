"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isLightMode, setIsLightMode] = useState(false);
  const [isFocusMode, setIsFocusModeState] = useState(false);
  const [printData, setPrintData] = useState<PrintData | null>(null);

  useEffect(() => {
    // Optionally persist in localStorage here
    const savedTheme = localStorage.getItem("codex_theme");
    if (savedTheme === "light") setIsLightMode(true);

    const savedFocus = localStorage.getItem("codex_focus_mode");
    if (savedFocus === "true") setIsFocusModeState(true);
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

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add("theme-light");
    } else {
      document.documentElement.classList.remove("theme-light");
    }
  }, [isLightMode]);

  return (
    <ThemeContext.Provider value={{ isLightMode, toggleTheme, isFocusMode, setIsFocusMode, printData, setPrintData }}>
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
