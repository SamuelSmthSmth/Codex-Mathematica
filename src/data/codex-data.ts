// ─────────────────────────────────────────────────────────────────────────────
// Codex Mathematica — Data Module
// All fragment problem banks, chapter definitions, and volume manifest.
// ─────────────────────────────────────────────────────────────────────────────

import alphaData from "./alpha.json";
import deltaData from "./delta.json";
import sigmaData from "./sigma.json";
import gammaData from "./gamma.json";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Fragment {
  id: number;
  original_id: string; // The ID from july_dataset (e.g. "INT_0320")
  problem_latex: string;
  solution_latex: string;
  problem_raw: string; // For the ledger display, we might want to just render latex directly in the future, but raw helps for search
  solution_raw: string;
  difficulty_rank: number;
  difficulty: string;
  exploit_type: string;
}

export interface Chapter {
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

// ── Internal helpers ──────────────────────────────────────────────────────────

// Extract the fragments from a JSON chapter and ensure it's strongly typed
function parseChapter(jsonChapter: any): Chapter {
  return {
    theme: jsonChapter.theme || "Nameless Chapter",
    fragments: jsonChapter.fragments as Fragment[],
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
    chapters: alphaData.chapters.map((ch: any) => parseChapter(ch)),
  },
  {
    id: "delta",
    symbol: "Δ",
    name: "Delta",
    subtitle: "The Volume of Derivatives",
    leather: "#0b1e0e",
    accent: "#4aaa6c",
    bookText: "#a8e6c0",
    chapters: deltaData.chapters.map((ch: any) => parseChapter(ch)),
  },
  {
    id: "sigma",
    symbol: "Σ",
    name: "Sigma",
    subtitle: "The Volume of Series",
    leather: "#101628",
    accent: "#5b85d9",
    bookText: "#b3c9f2",
    chapters: sigmaData.chapters.map((ch: any) => parseChapter(ch)),
  },
  {
    id: "gamma",
    symbol: "Γ",
    name: "Gamma",
    subtitle: "The Volume of Integrals",
    leather: "#260e2a",
    accent: "#b15fcc",
    bookText: "#e2b8f0",
    chapters: gammaData.chapters.map((ch: any) => parseChapter(ch)),
  },
];
