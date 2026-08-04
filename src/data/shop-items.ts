// ─────────────────────────────────────────────────────────────────────────────
// src/data/shop-items.ts
// ─────────────────────────────────────────────────────────────────────────────

export type ShopCategory = "themes" | "archives";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: number;
  achievementLocked?: boolean;
  unlockRequirement?: string;
  rank?: 1 | 2 | 3;
  thumbnailUrl?: string;
}

export interface CategoryMeta {
  id: ShopCategory;
  label: string;
  icon: string;
}

export const SHOP_CATEGORIES: CategoryMeta[] = [
  { id: "themes",   label: "Global Themes", icon: "🎨" },
  { id: "archives", label: "The Archives",  icon: "📦" },
];

export const SHOP_ITEMS: ShopItem[] = [
  // ── Themes ────────────────────────────────────────────────────────────────
  {
    id: "theme-student-mixtape",
    name: "Student Mixtape",
    description: "Transform the Archive into a 2010s student desk with CD cases and neon accents.",
    category: "themes",
    price: 2500,
    thumbnailUrl: "/thumbnails/theme_mixtape.png",
  },
  {
    id: "theme-diner",
    name: "The Diner",
    description: "A late-night diner aesthetic. Problems served on plates; answers print on waiter receipts.",
    category: "themes",
    price: 2500,
    thumbnailUrl: "/thumbnails/theme_diner.png",
  },
  {
    id: "theme-windows-xp",
    name: "Windows XP",
    description: "Relive the golden age of computing. Volumes become desktop icons; the workspace is Notepad.exe.",
    category: "themes",
    price: 2000,
    thumbnailUrl: "/thumbnails/theme_windows_xp.png",
  },
  {
    id: "theme-modern-desktop",
    name: "Modern Desktop",
    description: "A sleek, dark-mode modern OS experience. A terminal interface for solving problems.",
    category: "themes",
    price: 3500,
    thumbnailUrl: "/thumbnails/theme_modern_desktop.png",
  },
  {
    id: "theme-plain-crimson",
    name: "Plain — Deep Crimson",
    description: "A minimalist theme with a deep crimson accent. Zero distractions.",
    category: "themes",
    price: 500,
  },
  {
    id: "theme-scribble",
    name: "Notebook Scribbles",
    description: "Handwritten student notebook aesthetic. Lined paper and sticky notes.",
    category: "themes",
    price: 2000,
    thumbnailUrl: "/thumbnails/theme_scribble.png",
  },
  {
    id: "theme-plain-neon",
    name: "Plain — Neon Green",
    description: "A minimalist dark theme with a neon green accent. Hacker mode.",
    category: "themes",
    price: 500,
  },

  // ── Archives (Expansion Packs) ────────────────────────────────────────────
  {
    id: "archive-gamma-rank3-vol1",
    name: "Gamma Extended — Vol. I",
    description: "200 algorithmically generated integral questions. Perfect for raw practice.",
    category: "archives",
    price: 1000,
    rank: 3,
  },
  {
    id: "archive-gamma-rank2-vol1",
    name: "Gamma Curated — Vol. I",
    description: "75 hand-picked integral questions sourced from past university exams.",
    category: "archives",
    price: 3000,
    rank: 2,
  },
  {
    id: "archive-alpha-rank2-vol1",
    name: "Alpha Curated — Vol. I",
    description: "60 curated limits questions, including tricky L'Hôpital edge cases.",
    category: "archives",
    price: 3000,
    rank: 2,
  },
  {
    id: "archive-gamma-rank1-putnam",
    name: "Putnam Integrals",
    description: "30 Putnam-level integration problems. For the truly courageous.",
    category: "archives",
    price: 8000,
    rank: 1,
  },
  {
    id: "archive-gamma-rank1-step",
    name: "STEP Integration Masterclass",
    description: "25 STEP II/III-style integration challenges. Hand-crafted by examiners.",
    category: "archives",
    price: 8000,
    rank: 1,
  },
];
