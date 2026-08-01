"use client";

import { useTheme } from "@/context/ThemeContext";
import ThemeDefault from "@/themes/ThemeDefault";
import ThemeMixtape from "@/themes/ThemeMixtape";

import ThemeDiner from "@/themes/ThemeDiner";
import ThemeWindowsXP from "@/themes/ThemeWindowsXP";

export default function CodexWorkspace() {
  const { activeTheme } = useTheme();

  // Route based on active theme
  switch (activeTheme) {
    case "theme-student-mixtape":
      return <ThemeMixtape />;
    case "theme-diner":
      return <ThemeDiner />;
    case "theme-windows-xp":
      return <ThemeWindowsXP />;
    // Other themes will go here as they are developed
    default:
      return <ThemeDefault />;
  }
}
