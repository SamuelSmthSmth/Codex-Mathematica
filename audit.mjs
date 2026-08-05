/**
 * Static audit of all Codex-Mathematica theme/layout files.
 * Checks for:
 *  1. JS crash patterns (undefined variable usage, .map on possibly-undefined)
 *  2. Scroll setup (overflow-y-auto/scroll present + container has a bounded height)
 *  3. Missing hook destructuring
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const SRC = "/home/samuel/Documents/GitHub/Codex-Mathematica/src";
const THEMES = ["Default","Diner","Mixtape","ModernDesktop","Scribble","WindowsXP"];
const AREAS = ["shop","library"];

const results = [];

function audit(label, filePath) {
  let src;
  try { src = readFileSync(filePath, "utf8"); }
  catch { results.push({ label, status:"MISSING", issues:["File not found"] }); return; }

  const issues = [];

  // --- CRASH CHECKS ---
  // 1. .map on something that might be undefined (no optional chaining)
  const mapMatches = [...src.matchAll(/(\w+)\.map\(/g)];
  for (const m of mapMatches) {
    const varName = m[1];
    // Check if it's declared with const/let or comes from destructuring
    const declared = src.includes(`const ${varName}`) || src.includes(`let ${varName}`) || src.includes(` ${varName},`) || src.includes(`{ ${varName}`) || src.includes(`,${varName}`);
    if (!declared && !["Object","Array","React","Math","String"].includes(varName)) {
      issues.push(`CRASH: '${varName}.map()' used but declaration not found`);
    }
  }

  // 2. Variables used inside JSX that might not be destructured
  const useShopDestructure = src.match(/const\s*\{([^}]+)\}\s*=\s*useShopLogic/s);
  const useLibDestructure = src.match(/const\s*\{([^}]+)\}\s*=\s*useLibraryLogic/s);

  const checkVars = (destructured, usages, label2) => {
    if (!destructured) return;
    const available = new Set(destructured[1].split(/[\s,\n]+/).map(s => s.trim()).filter(Boolean));
    for (const v of usages) {
      if (!available.has(v)) {
        issues.push(`CRASH: '${v}' used in JSX but not in ${label2} destructuring`);
      }
    }
  };

  if (useShopDestructure) {
    const usedInJSX = [];
    if (src.includes("ownedItems.has")) usedInJSX.push("ownedItems");
    if (src.includes("equippedItems[") || src.includes("equippedItems.")) usedInJSX.push("equippedItems");
    if (src.includes("isAchievementUnlocked(")) usedInJSX.push("isAchievementUnlocked");
    if (src.includes("handlePurchase(")) usedInJSX.push("handlePurchase");
    if (src.includes("handleEquip(")) usedInJSX.push("handleEquip");
    if (src.includes("itemsByCategory.map") || src.includes("itemsByCategory,")) usedInJSX.push("itemsByCategory");
    if (src.includes("isItemOwned(")) usedInJSX.push("isItemOwned");
    if (src.includes("isItemEquipped(")) usedInJSX.push("isItemEquipped");
    checkVars(useShopDestructure, usedInJSX, "useShopLogic");
  }

  if (useLibDestructure) {
    const usedInJSX = [];
    if (src.includes("TECHNIQUE_ROWS.map") || src.includes("TECHNIQUE_ROWS,")) usedInJSX.push("TECHNIQUE_ROWS");
    if (src.includes("techniqueRows.map") || src.includes("techniqueRows,")) usedInJSX.push("techniqueRows");
    if (src.includes("todaysTechnique")) usedInJSX.push("todaysTechnique");
    if (src.includes("activeTechnique")) usedInJSX.push("activeTechnique");
    if (src.includes("setActiveTechnique")) usedInJSX.push("setActiveTechnique");
    checkVars(useLibDestructure, usedInJSX, "useLibraryLogic");
  }

  // --- SCROLL CHECKS ---
  const hasOverflowAuto = /overflow-y-auto|overflow-y-scroll/.test(src);
  const hasBoundedHeight = /\babsolute inset-0\b|h-full|flex-1|min-h-0|h-screen/.test(src);

  if (!hasOverflowAuto) {
    issues.push("SCROLL: No overflow-y-auto/scroll found — page cannot scroll");
  } else if (!hasBoundedHeight) {
    issues.push("SCROLL: overflow-y-auto present but no bounded height (h-full/flex-1/absolute inset-0) — scroll won't activate");
  }

  const status = issues.length === 0 ? "OK" : issues.some(i => i.startsWith("CRASH")) ? "CRASH" : "WARN";
  results.push({ label, status, issues });
}

// Audit all layout components
for (const theme of THEMES) {
  audit(`Shop/${theme}`,    join(SRC, `components/ShopLayout${theme}.tsx`));
  audit(`Library/${theme}`, join(SRC, `components/LibraryView${theme}.tsx`));
  audit(`Theme/${theme}`,   join(SRC, `themes/Theme${theme}.tsx`));
}

// Print results
console.log("\n=== CODEX MATHEMATICA AUDIT REPORT ===\n");

const crashes = results.filter(r => r.status === "CRASH");
const warns   = results.filter(r => r.status === "WARN");
const ok      = results.filter(r => r.status === "OK");
const missing = results.filter(r => r.status === "MISSING");

console.log(`✅ OK:      ${ok.length}`);
console.log(`⚠️  WARN:   ${warns.length}`);
console.log(`❌ CRASH:  ${crashes.length}`);
console.log(`🚫 MISSING: ${missing.length}`);
console.log();

for (const r of results) {
  if (r.status === "OK") continue;
  const icon = r.status === "CRASH" ? "❌" : r.status === "WARN" ? "⚠️ " : "🚫";
  console.log(`${icon} ${r.label}`);
  for (const issue of r.issues) {
    console.log(`   → ${issue}`);
  }
}

console.log("\n=== ALL RESULTS ===");
for (const r of results) {
  const icon = r.status === "OK" ? "✅" : r.status === "CRASH" ? "❌" : r.status === "WARN" ? "⚠️ " : "🚫";
  console.log(`${icon} ${r.label}`);
}
