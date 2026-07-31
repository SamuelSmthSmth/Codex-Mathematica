"use client";

import { useTheme } from "@/context/ThemeContext";
import ThemeDefault from "@/themes/ThemeDefault";
import ThemeMixtape from "@/themes/ThemeMixtape";

export default function CodexWorkspace() {
  const { activeTheme } = useTheme();

  // Route based on active theme
  switch (activeTheme) {
    case "theme-student-mixtape":
      return <ThemeMixtape />;
    // Other themes will go here as they are developed
    default:
      return <ThemeDefault />;
  }
}
