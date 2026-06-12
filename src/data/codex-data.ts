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
  problem_latex: string;
  solution_latex: string;
  problem_raw: string;
  solution_raw: string;
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
function parseChapter(jsonChapter: any, theme: string): Chapter {
  return {
    theme,
    fragments: jsonChapter.fragments as Fragment[],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// Volume manifest
// ═════════════════════════════════════════════════════════════════════════════

const ALPHA_THEMES = [
  "Algebraic & Rational Limits",
  "Trigonometric Limits",
  "Indeterminate Forms & L'Hôpital",
];

const DELTA_THEMES = [
  "Fundamental Rules",
  "Product, Quotient & Chain Rules",
  "Higher Order & Implicit Differentiation",
];

const SIGMA_THEMES = [
  "Finite Series & Closed Forms",
  "Infinite Series & Convergence",
  "Power Series & Taylor Expansions",
];

const GAMMA_THEMES = [
  "Basic Antiderivatives",
  "Integration Techniques",
  "Definite Forms & Special Integrals",
];

export const VOLUMES: Volume[] = [
  {
    id: "alpha",
    symbol: "α",
    name: "Alpha",
    subtitle: "The Volume of Limits",
    leather: "#2d1008",
    accent: "#c8922a",
    bookText: "#f4d260",
    chapters: alphaData.chapters.map((ch: any, i: number) =>
      parseChapter(ch, ALPHA_THEMES[i] || "Nameless Chapter")
    ),
  },
  {
    id: "delta",
    symbol: "Δ",
    name: "Delta",
    subtitle: "The Volume of Derivatives",
    leather: "#0b1e0e",
    accent: "#4aaa6c",
    bookText: "#a8e6c0",
    chapters: deltaData.chapters.map((ch: any, i: number) =>
      parseChapter(ch, DELTA_THEMES[i] || "Nameless Chapter")
    ),
  },
  {
    id: "sigma",
    symbol: "Σ",
    name: "Sigma",
    subtitle: "The Volume of Summations",
    leather: "#0e0e26",
    accent: "#7a6ad8",
    bookText: "#c8c0f8",
    chapters: sigmaData.chapters.map((ch: any, i: number) =>
      parseChapter(ch, SIGMA_THEMES[i] || "Nameless Chapter")
    ),
  },
  {
    id: "gamma",
    symbol: "Γ",
    name: "Gamma",
    subtitle: "The Volume of Integrals",
    leather: "#18082a",
    accent: "#9a6ac8",
    bookText: "#d8b8f8",
    chapters: gammaData.chapters.map((ch: any, i: number) =>
      parseChapter(ch, GAMMA_THEMES[i] || "Nameless Chapter")
    ),
  },
];
