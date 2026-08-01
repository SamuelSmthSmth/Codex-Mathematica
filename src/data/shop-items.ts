// ─────────────────────────────────────────────────────────────────────────────
// src/data/shop-items.ts
// Stub shop items for the Storefront.
// Real art assets and unlock logic will be wired in Phase 3.
// ─────────────────────────────────────────────────────────────────────────────

export type ShopCategory =
  | "themes"
  | "animations"
  | "palettes"
  | "banners"
  | "archives";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  /** Price in Credits. Always a multiple of 50 per PLAN §5. */
  price: number;
  /** If true, the item can only be purchased after a certain achievement. */
  achievementLocked?: boolean;
  /** Human-readable description of the unlock requirement. */
  unlockRequirement?: string;
  /** For "archives" category: the rank tier (1 = Prestige, 2 = Standard, 3 = Grind). */
  rank?: 1 | 2 | 3;
  /** Image URL for a thumbnail preview in the store */
  thumbnailUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar category metadata
// ─────────────────────────────────────────────────────────────────────────────

export interface CategoryMeta {
  id: ShopCategory;
  label: string;
  icon: string; // emoji for skeleton; Phase 2 will replace with proper icons
}

export const SHOP_CATEGORIES: CategoryMeta[] = [
  { id: "themes",     label: "Global Themes",     icon: "🎨" },
  { id: "animations", label: "Animations",         icon: "✨" },
  { id: "palettes",   label: "Palettes",           icon: "🎨" },
  { id: "banners",    label: "Banners",            icon: "🏷️" },
  { id: "archives",   label: "The Archives",       icon: "📦" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Stub items
// ─────────────────────────────────────────────────────────────────────────────

export const SHOP_ITEMS: ShopItem[] = [
  // ── Themes ────────────────────────────────────────────────────────────────
  {
    id: "theme-default",
    name: "The Default Theme",
    description: "The classic, elegant look of the Codex Mathematica.",
    category: "themes",
    price: 0,
    thumbnailUrl: "/thumbnails/theme_default.png",
  },
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
    id: "theme-plain-crimson",
    name: "Plain — Deep Crimson",
    description: "A minimalist theme with a deep crimson accent. Zero distractions.",
    category: "themes",
    price: 500,
  },
  {
    id: "theme-plain-neon",
    name: "Plain — Neon Green",
    description: "A minimalist dark theme with a neon green accent. Hacker mode.",
    category: "themes",
    price: 500,
  },

  // ── Animations ────────────────────────────────────────────────────────────
  {
    id: "anim-ink-flow",
    name: "Ink Flow Reveal",
    description: "Answers unseal with a left-to-right ink flowing animation.",
    category: "animations",
    price: 300,
  },
  {
    id: "anim-typewriter",
    name: "Typewriter Reveal",
    description: "Answers type out character-by-character with a blinking cursor.",
    category: "animations",
    price: 300,
  },
  {
    id: "anim-receipt",
    name: "Waiter's Receipt Print",
    description: "Answers unroll from the top like a kitchen receipt.",
    category: "animations",
    price: 350,
  },
  {
    id: "anim-cipher",
    name: "Cipher Scramble",
    description: "Characters scramble and lock into place, one by one.",
    category: "animations",
    price: 400,
  },

  // ── Palettes ──────────────────────────────────────────────────────────────
  {
    id: "palette-ember",
    name: "Ember",
    description: "A rich deep amber and rust colour palette.",
    category: "palettes",
    price: 150,
  },
  {
    id: "palette-glacier",
    name: "Glacier",
    description: "Ice-blue and silver tones.",
    category: "palettes",
    price: 150,
  },
  {
    id: "palette-midnight",
    name: "Midnight",
    description: "Deep navy and violet tones.",
    category: "palettes",
    price: 150,
  },

  // ── Banners ───────────────────────────────────────────────────────────────
  {
    id: "banner-limits-master",
    name: "Limits Master",
    description: "An exclusive banner for those who have conquered 100 Limits fragments.",
    category: "banners",
    price: 1000,
    achievementLocked: true,
    unlockRequirement: "Conquer 100 fragments in the Alpha (Limits) volume.",
  },
  {
    id: "banner-integrator",
    name: "The Integrator",
    description: "For those who have sealed 100 Integral proofs.",
    category: "banners",
    price: 1000,
    achievementLocked: true,
    unlockRequirement: "Conquer 100 fragments in the Gamma (Integrals) volume.",
  },
  {
    id: "banner-whale",
    name: "Whale",
    description: "Awarded to serious collectors. Unlocked after purchasing 5 items.",
    category: "banners",
    price: 200,
    achievementLocked: true,
    unlockRequirement: "Purchase any 5 items from the Store.",
  },
  {
    id: "banner-scholar",
    name: "Grand Scholar",
    description: "A prestigious banner for dedicated students.",
    category: "banners",
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
