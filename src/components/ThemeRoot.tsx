"use client";

import { useTheme } from "@/context/ThemeContext";
import ThemeDefault from "@/themes/ThemeDefault";
import ThemeMixtape from "@/themes/ThemeMixtape";
import ThemeDiner from "@/themes/ThemeDiner";
import ThemeWindowsXP from "@/themes/ThemeWindowsXP";

export type AppArea = "archive" | "library" | "shop";

export interface ThemeProps {
  activeArea: AppArea;
  onSelectArea: (area: AppArea) => void;
}

export default function ThemeRoot({ activeArea, onSelectArea }: ThemeProps) {
  const { activeTheme } = useTheme();

  switch (activeTheme) {
    case "theme-student-mixtape":
      return <ThemeMixtape activeArea={activeArea} onSelectArea={onSelectArea} />;
    case "theme-diner":
      return <ThemeDiner activeArea={activeArea} onSelectArea={onSelectArea} />;
    case "theme-windows-xp":
      return <ThemeWindowsXP activeArea={activeArea} onSelectArea={onSelectArea} />;
    default:
      return <ThemeDefault activeArea={activeArea} onSelectArea={onSelectArea} />;
  }
}
