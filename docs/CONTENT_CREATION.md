# Codex Mathematica: Content Creation Guide

This document is the exhaustive and precise technical guide for creating, extending, and registering content within **Codex Mathematica**. Content in the Codex is split across three main pillars:
1. **The Archive** (Volumes, Chapters, and Problems)
2. **The Library** (Techniques, Reference Articles, and Formulas)
3. **The Store** (Unlockable Themes and Expansion Packs)

---

## 1. The Archive (Problems & Volumes)

The Archive is the core of Codex Mathematica. It is structured hierarchically:
`Volume` -> `Chapter` -> `Fragment` (Problem/Solution)

### A. Creating a Chapter (Fragments)
Chapters are defined by standalone JSON files. Each file contains an array of `Fragment` objects.

**Location:** `src/data/volumes/<volume-id>/chapter-NN.json` (or subdirectories like `/curated/`, `/putnam/`).

**Schema Reference:**
```json
[
  {
    "id": 10001,
    "original_id": "INT2_001",
    "problem_latex": "\\int x e^x \\, dx",
    "solution_latex": "(x - 1)e^x + C",
    "answer_type": "hybrid",
    "answer_hint": "(x-1)e^x + C"
  }
]
```

**Field Breakdown:**
- `id` (Number, Required): A unique numerical identifier for the fragment. Crucial for progress tracking. Ensure no collisions across all JSON files.
- `original_id` (String, Required): A human-readable identifier mapping back to the dataset source (e.g., `LIM_042`).
- `problem_latex` (String, Required): The problem statement in LaTeX format. Note: Ensure single backslashes in standard LaTeX are escaped with a double backslash (`\\`) in JSON.
- `solution_latex` (String, Required): The solution in LaTeX format.
- `answer_type` (String, Optional): Sets the interaction mode. Currently supports `"hybrid"` (renders a user input box before the solution is revealed). If omitted, defaults to the standard self-grading flashcard system.
- `answer_hint` (String, Optional): The placeholder text shown in the input box when `answer_type` is `"hybrid"`.

### B. Registering a Chapter to a Volume
Once the JSON file is created, it must be registered in the codebase so the router and Archive UI can render it.

**Location:** `src/data/codex-data.ts`

**Steps:**
1. Import the JSON at the top of the file:
   ```typescript
   import gammaC02 from "./volumes/gamma/chapter-02.json";
   ```
2. Locate the corresponding `Volume` object in the `VOLUMES` array.
3. Append a new `Chapter` object to its `chapters` array:
   ```typescript
   {
     theme: "Techniques of Integration", // The title shown in the Table of Contents
     fragments: gammaC02,                // The imported JSON array
     packId: "gamma-expansion-pack"      // Optional: The ID of a shop item. If present, the user must buy this item to unlock the chapter.
   }
   ```

---

## 2. The Library (Techniques & Articles)

The Library contains reference materials, theoretical explanations, and quick checks.

**Location:** `src/data/techniques.ts`

### A. Creating an Article
Articles are grouped into `TechniqueRow` objects. To add an article, append a `Technique` object to the `techniques` array of an existing row, or create a new row entirely.

**Schema Reference:**
```typescript
{
  id: "kings-property",
  name: "King's Property",
  tagline: "Flip the limits, keep the integrand.",
  category: "Integration",
  body_md: `## King's Property
  
  For any continuous function $f(x)$:
  $$\\int_{a}^{b} f(x)dx = \\int_{a}^{b} f(a + b - x)dx$$
  
  This is extremely useful when dealing with symmetric bounds.
  `,
  micro_problem: {
    question_latex: "\\int_{0}^{\\pi/2} \\frac{\\sin x}{\\sin x + \\cos x} dx",
    answer_latex: "\\frac{\\pi}{4}"
  }
}
```

**Field Breakdown:**
- `id` (String, Required): A unique URL-safe string identifier (e.g., `"ibp"`, `"lhopital"`).
- `name` (String, Required): The display title of the article.
- `tagline` (String, Required): A short 1-line description shown on the Library carousel cards.
- `category` (String, Required): Categorical grouping tag (e.g., `"Integration"`, `"Limits"`). Used for filtering.
- `body_md` (String, Required): The main article content. Supports full GitHub Flavored Markdown (GFM). Inline math can be written with `$math$` and block math with `$$math$$`.
- `micro_problem` (Object, Optional): A small, targeted check-for-understanding problem rendered at the bottom of the article.

---

## 3. The Store (Themes & Expansions)

The Store handles unlockable aesthetics (Themes) and unlockable content (Expansion Packs).

**Location:** `src/data/shop-items.ts`

### A. Creating a Shop Item
Add a `ShopItem` object to the `SHOP_ITEMS` array.

**Schema Reference:**
```typescript
{
  id: "theme-student-mixtape", // or "gamma-expansion-pack"
  name: "Student Mixtape",
  description: "Transform the Archive into a 2010s student desk with CD cases and neon accents.",
  category: "themes", // or "archives" for expansion packs
  price: 2500,
  thumbnailUrl: "/thumbnails/theme_mixtape.png",
  rank: 1, // Optional: 1, 2, or 3 for Archives to indicate difficulty/tier
}
```

**Field Breakdown:**
- `id` (String, Required): The unique identifier. Used throughout the app to verify ownership.
- `name` (String, Required): Display name in the storefront.
- `description` (String, Required): Marketing copy displayed in the store details pane.
- `category` (String, Required): Must be exactly `"themes"` or `"archives"`.
- `price` (Number, Required): The cost in Codex Credits required to unlock it.
- `thumbnailUrl` (String, Optional): Path to a thumbnail image to display in the store card.

### B. Making a Shop Item Functional
Merely adding an item to the store allows a user to buy it, but you must wire it into the application logic to give it a tangible effect:

**For Expansion Packs (`category: "archives"`):**
1. As detailed in the Archive section, navigate to `src/data/codex-data.ts`.
2. Add the `packId: "your-shop-item-id"` property to the targeted `Chapter` object. The UI will automatically obscure this chapter until the `useProgress().ownedItems` set contains this ID.

**For Themes (`category: "themes"`):**
1. Ensure the `id` of the store item begins with `theme-`.
2. Create the physical React Theme component (e.g., `src/themes/ThemeMyCustom.tsx`).
3. Open `src/themes/registry.ts` and add your theme ID to the valid typings.
4. Open `src/components/ThemeRoot.tsx` and add a switch-case statement to render your React component when `activeTheme === "theme-my-custom"`.
