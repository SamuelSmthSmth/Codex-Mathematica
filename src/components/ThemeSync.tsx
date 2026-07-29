"use client";

/**
 * Syncs the equipped Store theme into ThemeContext.
 * Lives inside both ProgressProvider and ThemeProvider.
 */

import { useEffect } from "react";
import { useProgress } from "@/context/ProgressContext";
import { useTheme } from "@/context/ThemeContext";
import { themeIdFromShopItem } from "@/themes/registry";

export default function ThemeSync() {
  const { equippedItems } = useProgress();
  const { setActiveThemeId } = useTheme();

  useEffect(() => {
    setActiveThemeId(themeIdFromShopItem(equippedItems.themes));
  }, [equippedItems.themes, setActiveThemeId]);

  return null;
}
