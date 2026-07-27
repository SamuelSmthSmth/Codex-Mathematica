# Codex Mathematica: Master Design Document

## 1. Project Overview & Philosophy

**Codex Mathematica** is an advanced, beautifully designed web platform intended for students studying calculus, ranging from AS Level basics to STEP and Putnam-level difficulty.

### Core Philosophy

- **Frictionless Learning:** Remove UI/UX barriers (like typing raw LaTeX) so the user can focus entirely on solving math on physical paper.
- **Positive Reinforcement:** Avoid discouraging statistics (no failure rates or accuracy percentages displayed). Focus on forward momentum and learning.
- **Total Immersion:** Themes are not just color swaps; they are complete visual and lexical overhauls that transform the entire website into different nostalgic or aesthetic environments.
- **Scope:** Stick to the "Big 4" (Limits, Differentiation, Summations, Integrals). Do not dilute the platform with Linear Algebra or other disciplines.

---

## 2. Core Interaction Loop (The Workspace)

The traditional method of typing complex integral solutions into a web form is being scrapped. We are adopting a **"Self-Grade" (Trust) System**.

### The Workflow

1. **Present:** User selects a problem and it is rendered flawlessly on screen.
2. **Solve:** User works out the problem on physical paper (simulating exam environments).
3. **Reveal:** User clicks a "Reveal Answer" button. The solution appears using a theme-specific animation (typing, ink flowing, printing).
4. **Grade:** User is prompted: *"Did you get this right?"* with options: **Correct**, **Close (Partial Credit)**, or **Incorrect**.
5. **Reward:** Logging the result updates the user's progress and awards **Credits** (which are only visible in the Shop).

---

## 3. The Technique Library (The "Anti-Textbook")

A massive library teaching mathematical techniques (e.g., King's Property, Integration by Parts, Weierstrass Substitution).

- **Layout:** "Netflix-style" interface with horizontal scrolling carousels and no rigid textbook structure, encouraging serendipitous discovery.
- **Rows:** Hooky titles like *"The Dark Arts of Integration"* or *"I'm Feeling Lucky"*.
- **Hero Banner:** Auto-playing/highlighted "Technique of the Day" at the top.
- **Micro-Problems:** Articles contain embedded sanity-check questions.
- **Interactive Reveals:** Answers to micro-problems are hidden and revealed via theme-dependent mechanics:
  - **Digital themes:** Frosted glass blurs or cipher scrambles that lock into place.
  - **Analog themes:** Ink flowing onto the page.

---

## 4. Progression & Economy

A gamified, large-number credit system to drive engagement.

### Earning Credits

- **1 Standard Question Solved:** 100 Credits.
- **Auxiliary (Expansion) Questions:** 200 – 300 Credits (scaling based on the Rank/Difficulty of the expansion pack).

### Stats

Excluded from the UI entirely to prevent burnout. Only available via an "Export Report" feature for tutors/teachers.

---

## 5. The Store & Expansion Packs

A dedicated marketplace where users spend their hard-earned Credits. The user's Wallet/Credit Balance is **ONLY** visible while inside the Store.

### Store UI (Hybrid Design)

- **Sidebar Navigation (Guardian Tales style):** Categories for Global Themes, Animations, Palettes, Banners, and Archives (Expansions).
- **Item Grid (Keymash style):** Clean, premium-looking cards showing item name, preview, and a purchase button.
- **Pricing Flavor:** All items are priced in multiples of 50 to add a subtle "gacha/shop" psychological flavor without the predatory mechanics.
- **Inventory Tab:** A toggle at the top of the store to switch to "My Collection" where users can equip what they own.

### The Items

- **Cosmetics:** Full Theme Packs, A La Carte animations, simple color palettes, and Profile Banners.
- **Achievement-Locked Items:** Certain cosmetics cannot be purchased until a milestone is hit.
  - *Example:* Solving 100 Limits questions unlocks the ability to buy the exclusive "Limits Master" banner.
  - *Example:* Purchasing 5 items unlocks a "Whale" banner in the store.

### Ranked Expansion Packs (The Archives)

- **Rank 3 (The Grind):** Cheap, standard algorithmically generated questions.
- **Rank 2 (The Standard):** Moderately priced, curated questions.
- **Rank 1 (The Prestige):** Highly expensive, hand-crafted, meticulously designed questions (Putnam/STEP level).

> **Integration:** Expansions appear at the bottom of existing Volumes (e.g., "Auxiliary Chapter"). Identified in the chapter list by a subtle, theme-specific indicator (e.g., a wax seal, a chili pepper, an LED light).

---

## 6. Theme Engine & Visual Overhauls

Themes completely change the layout, fonts, colors, animations, and terminology. Each major theme will have its own React component file to prevent code spaghetti. LaTeX math will remain mathematically accurate but will be styled via CSS (color, text-shadow) to fit the vibe.

### Theme 1: Default (Dark Academia / The Grand Archive)

- **Vibe:** Mahogany desk, warm spotlight, leather, parchment (top-down view).
- **Volumes $\rightarrow$ Tomes:** Lying flat on a desk.
- **Chapters $\rightarrow$ Chapters**
- **Workspace:** Parchment paper.
- **Animation:** Smooth left-to-right mask reveal (ink flowing).
- **Indicators:** Quill or wax seal icons.

### Theme 2: Student Mixtape (CD / ZZZ Vibe)

- **Vibe:** 2010s student desk, light wood, neon accents, portable CD player (top-down view).
- **Volumes $\rightarrow$ Albums / Mixtapes:** Plastic CD Jewel Cases.
- **Chapters $\rightarrow$ Tracks / Setlists:** Written on lined notebook paper.
- **Workspace:** Math rendered on lined binder paper.
- **Interaction:** Navigating triggers a CD to spin. When solving, the CD spins continuously in the player at the top of the screen.
- **Animation:** Staggered digital typing / LED equalizer reveal.
- **Indicators:** Glowing LED dot or pixel badge.

### Theme 3: The Diner / Café

- **Vibe:** Light Mode = Morning Cafe (steam, coffee). Dark Mode = Late-night Diner (neon, flickering candle) (top-down view).
- **Volumes $\rightarrow$ Menus (Categories):** e.g., Appetizers (Limits), Main Courses (Integrals).
- **Chapters $\rightarrow$ Courses / Dishes**
- **Workspace:** The question is served on a "Plate" (circular container). The answer prints out on a physical Waiter's Receipt / Order Pad.
- **Animation:** A "Paid" stamp coming down, or a kitchen ticket printing out.
- **Indicators:** Chili pepper or star.

### Theme 4: Windows XP / Retro PC

- **Vibe:** Nostalgic 90s/2000s desktop environment.
- **Volumes $\rightarrow$ Desktop Shortcuts**
- **Chapters $\rightarrow$ File Explorer Directories (Folders)**
- **Workspace:** A classic "Notepad.exe" window.
- **Animation:** Blinking cursor typing.

### Theme 5: Plain / Minimalist

- **Vibe:** Pure, distraction-free studying. Standard UI with simple accent color swaps (e.g., deep crimson, neon green).

---

## 7. User Navigation & Profile

Symmetrical, unobtrusive top-bar navigation to keep the main workspace clean.

- **Top Left (Shopping Bag Icon):** Opens the Store/Inventory view. Icon morphs into an "X" to close.
- **Top Right (Avatar Icon):** Opens the single-window Profile Panel.

### Profile Panel (Single Window, No Tabs)

- **Identity:** Avatar, Username, Date Joined.
- **Settings:** Accessibility toggles, Audio toggles, "Export Report" button.
- *(Wallet moved exclusively to the Store UI. Absolutely no failure rates or accuracy stats visible).*

---

## 8. Data Architecture (JSON Schema)

The backend requires a robust JSON schema to feed the UI, populated via our deterministic symbolic generator. Constraints are baked directly into the LaTeX strings.

```json
{
  "id": "gamma_base_0042",
  "problem_latex": "\\int_{0}^{\\infty} \\frac{\\sin(x)}{x} dx, \\quad x > 0",
  "answer_latex": "\\frac{\\pi}{2}",
  "rank": null,
  "volume_target": "Gamma"
}
```

> **Note:** `rank` is `null` for standard archive questions. It only contains a string (e.g., `"Rank 1"`) for questions belonging to purchased Expansion Packs.

---

## 9. Implementation Roadmap

### Phase 1: The "Antigravity" Skeleton (Minimal UI)

- Build the core React components for all main areas:
  - **Main Loop:** `<VolumeSelector/>`, `<ChapterSelector/>`, `<Workspace/>`
  - **Technique Library:** `<LibraryCarousel/>`, `<LibraryArticle/>`
  - **Storefront:** `<ShopLayout/>`, `<Inventory/>`
- Ignore all themes, colors, and styling. Focus purely on data flow, routing, and layout skeleton.
- Prove the navigation loop works across the Archive, Library, and Shop.

### Phase 2: The Theme Engine

- Set up the global `ThemeContext`.
- Build the conditional rendering logic (e.g., rendering `<MixtapeTheme/>` instead of `<DefaultTheme/>`).
- Implement the CSS overrides and UI metaphors based on the sketches (CD cases, Diner menus, Windows XP folders).
- Add the specific animations (ink reveal, typing, receipt printing).

### Phase 3: Content Population & Gamification

- Populate the Netflix-style carousels in the Technique Library.
- Implement the achievement-locking logic for Store items (e.g., tracking solved questions to unlock Banners).
- Finalize the Credit economy math on the backend.

### Phase 4: Backend & Polish

- Hook the generic JSON up to the actual Firebase database.
- Finalize domain linking and hosting.
- Add user authentication and sync Credit balances/Inventory to Firebase user profiles.

