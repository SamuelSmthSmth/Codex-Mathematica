/**
 * Theme pack registry for Phase 2 Theme Engine.
 * Shop item IDs map to visual packs; unimplemented packs fall back to default styling.
 */

export type ThemePackId =
  | "default"
  | "theme-student-mixtape"
  | "theme-diner"
  | "theme-windows-xp"
  | "theme-modern-desktop"
  | "theme-plain-crimson"
  | "theme-plain-neon"
  | "theme-scribble";

export interface ThemePack {
  id: ThemePackId;
  name: string;
  /** CSS class applied to document.documentElement */
  rootClass: string;
  /** Whether a dedicated layout component exists (Phase 2+). */
  hasLayout: boolean;
}

export const THEME_PACKS: Record<ThemePackId, ThemePack> = {
  default: {
    id: "default",
    name: "The Grand Archive",
    rootClass: "theme-default",
    hasLayout: true,
  },
  "theme-student-mixtape": {
    id: "theme-student-mixtape",
    name: "Student Mixtape",
    rootClass: "theme-mixtape",
    hasLayout: false,
  },
  "theme-diner": {
    id: "theme-diner",
    name: "The Diner",
    rootClass: "theme-diner",
    hasLayout: false,
  },
  "theme-windows-xp": {
    id: "theme-windows-xp",
    name: "Windows XP",
    rootClass: "theme-windows-xp",
    hasLayout: false,
  },
  "theme-modern-desktop": {
    id: "theme-modern-desktop",
    name: "Modern Desktop",
    rootClass: "theme-modern-desktop",
    hasLayout: true,
  },
  "theme-plain-crimson": {
    id: "theme-plain-crimson",
    name: "Plain — Deep Crimson",
    rootClass: "theme-plain-crimson",
    hasLayout: false,
  },
  "theme-plain-neon": {
    id: "theme-plain-neon",
    name: "Plain — Neon Green",
    rootClass: "theme-plain-neon",
    hasLayout: false,
  },
  "theme-scribble": {
    id: "theme-scribble",
    name: "Notebook Scribbles",
    rootClass: "theme-scribble",
    hasLayout: false,
  },
};

const SHOP_ITEM_TO_THEME: Record<string, ThemePackId> = {
  "theme-student-mixtape": "theme-student-mixtape",
  "theme-diner": "theme-diner",
  "theme-windows-xp": "theme-windows-xp",
  "theme-modern-desktop": "theme-modern-desktop",
  "theme-plain-crimson": "theme-plain-crimson",
  "theme-plain-neon": "theme-plain-neon",
  "theme-scribble": "theme-scribble",
};

export function themeIdFromShopItem(shopItemId: string | undefined): ThemePackId {
  if (!shopItemId) return "default";
  return SHOP_ITEM_TO_THEME[shopItemId] ?? "default";
}

export const ALL_THEME_ROOT_CLASSES = Object.values(THEME_PACKS).map((t) => t.rootClass);
