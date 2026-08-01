// ─────────────────────────────────────────────────────────────────────────────
// Codex Mathematica — Data Module
//
// Architecture: each chapter is an individual JSON file living at:
//   src/data/volumes/<volume-id>/chapter-NN.json
//
// To add a new chapter, just drop a new chapter-NN.json into the right folder.
// No code changes required — the volume manifest below handles the rest.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Fragment {
  id: number;
  /** Original dataset ID, e.g. "LIM_042" */
  original_id: string;
  problem_latex: string;
  solution_latex: string;
}

export interface Chapter {
  /** Display name shown in the Table of Contents */
  theme: string;
  fragments: Fragment[];
}

export interface Volume {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly subtitle: string;
  /** Hex colour for the book's leather grain */
  readonly leather: string;
  /** Hex colour for accent / gold elements */
  readonly accent: string;
  /** Text colour on book cover */
  readonly bookText: string;
  readonly chapters: Chapter[];
}

// ── Chapter imports ───────────────────────────────────────────────────────────
// Next.js / Webpack cannot do truly dynamic imports at build time, so we list
// every chapter file here. To add a new chapter simply:
//   1. Create the JSON in the right folder
//   2. Import it below and push it into the relevant array

// Alpha (Limits)
import alphaC01 from "./volumes/alpha/chapter-01.json";
import alphaC02 from "./volumes/alpha/chapter-02.json";

// Delta (Derivatives)
import deltaC01 from "./volumes/delta/chapter-01.json";

// Sigma (Series)
import sigmaC01 from "./volumes/sigma/chapter-01.json";

// Gamma (Integrals)
import gammaC01 from "./volumes/gamma/chapter-01.json";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseChapter(raw: any): Chapter {
  return {
    theme: raw.theme ?? "Nameless Chapter",
    fragments: (raw.fragments ?? []) as Fragment[],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Volume manifest
// ═════════════════════════════════════════════════════════════════════════════

export const VOLUMES: Volume[] = [
  {
    id: "alpha",
    symbol: "α",
    name: "Alpha",
    subtitle: "The Volume of Limits",
    leather: "#2d1008",
    accent: "#c8922a",
    bookText: "#f4d260",
    chapters: [alphaC01, alphaC02].map(parseChapter),
  },
  {
    id: "delta",
    symbol: "Δ",
    name: "Delta",
    subtitle: "The Volume of Derivatives",
    leather: "#0b1e0e",
    accent: "#4aaa6c",
    bookText: "#a8e6c0",
    chapters: [deltaC01].map(parseChapter),
  },
  {
    id: "sigma",
    symbol: "Σ",
    name: "Sigma",
    subtitle: "The Volume of Series",
    leather: "#101628",
    accent: "#5b85d9",
    bookText: "#b3c9f2",
    chapters: [sigmaC01].map(parseChapter),
  },
  {
    id: "gamma",
    symbol: "Γ",
    name: "Gamma",
    subtitle: "The Volume of Integrals",
    leather: "#251b2a",
    accent: "#986ec7",
    bookText: "#d1b3f0",
    chapters: [gammaC01].map(parseChapter),
  },
  {
    id: "archive-gamma-rank3-vol1",
    symbol: "Γ*",
    name: "Gamma Extended",
    subtitle: "Volume I",
    leather: "#34223d",
    accent: "#b683db",
    bookText: "#e2c5f5",
    chapters: [],
  },
  {
    id: "archive-gamma-rank2-vol1",
    symbol: "Γ†",
    name: "Gamma Curated",
    subtitle: "Volume I",
    leather: "#2c1c36",
    accent: "#8b5fc0",
    bookText: "#cca6ed",
    chapters: [],
  },
  {
    id: "archive-alpha-rank2-vol1",
    symbol: "α†",
    name: "Alpha Curated",
    subtitle: "Volume I",
    leather: "#3d1810",
    accent: "#e09f3e",
    bookText: "#f9d489",
    chapters: [],
  },
  {
    id: "archive-gamma-rank1-putnam",
    symbol: "P",
    name: "Putnam Integrals",
    subtitle: "The Final Challenge",
    leather: "#1c1421",
    accent: "#d4af37",
    bookText: "#f0e4b1",
    chapters: [],
  },
  {
    id: "archive-gamma-rank1-step",
    symbol: "S",
    name: "STEP Masterclass",
    subtitle: "Integration",
    leather: "#211d24",
    accent: "#cfc1d9",
    bookText: "#eee9f2",
    chapters: [],
  },
];
