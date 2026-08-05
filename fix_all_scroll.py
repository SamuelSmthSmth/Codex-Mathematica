import re, os

# ─── STRATEGY ───────────────────────────────────────────────────────────────
# Each Shop/Library component's ROOT element should be:
#   className="h-full overflow-y-auto ..."  (keeps layout scrollable within any parent)
# The theme wrapper should give it a fixed height via:
#   "h-[calc(100vh-NAV_HEIGHT)]" or "flex-1 min-h-0"
# The inner component should NOT use "absolute inset-0" (taken out of flow)
# ────────────────────────────────────────────────────────────────────────────

# 1. Make all Shop/Library root divs use "h-full overflow-y-auto"
files = {
    'src/components/ShopLayoutDefault.tsx': [
        ('className="h-full flex flex-col"', 'className="h-full overflow-y-auto flex flex-col"'),
    ],
    'src/components/LibraryViewDefault.tsx': [
        # LibraryViewDefault - check its root element
    ],
    'src/components/ShopLayoutDiner.tsx': [
        ('className="min-h-full bg-[#fdfbe9] text-stone-900 p-8 overflow-y-auto"', 'className="h-full bg-[#fdfbe9] text-stone-900 p-8 overflow-y-auto"'),
    ],
    'src/components/LibraryViewDiner.tsx': [
        ('className="min-h-full bg-[#fdfbe9] text-stone-900 font-mono p-8 overflow-y-auto"', 'className="h-full bg-[#fdfbe9] text-stone-900 font-mono p-8 overflow-y-auto"'),
    ],
    'src/components/ShopLayoutMixtape.tsx': [
        ('className="h-full overflow-y-auto bg-stone-950', 'className="h-full overflow-y-auto bg-stone-950'),
    ],
    'src/components/LibraryViewMixtape.tsx': [
        ('className="h-full overflow-y-auto bg-stone-900', 'className="h-full overflow-y-auto bg-stone-900'),
    ],
}

for path, replacements in files.items():
    if not os.path.exists(path):
        print(f"MISSING: {path}")
        continue
    with open(path) as f: content = f.read()
    changed = False
    for old, new in replacements:
        if old != new and old in content:
            content = content.replace(old, new, 1)
            changed = True
            print(f"Fixed: {path}: {old[:50]!r}")
    if changed:
        with open(path, 'w') as f: f.write(content)

print("Done with component fixes")

# 2. Fix ThemeDefault - its wrapper should NOT have overflow-y-auto (child handles scroll)
#    Change: <div className="h-full overflow-y-auto pb-16">
#    To:     <div className="h-full flex flex-col">
#    Then the content div should be flex-1 min-h-0
with open('src/themes/ThemeDefault.tsx') as f: content = f.read()
old = '<div className="h-full overflow-y-auto pb-16">\n        <div key={`${activeArea}-${view.screen}`} className="animate-in fade-in\nzoom-in-95 duration-500 h-full">'
if old in content:
    print("Fixing ThemeDefault wrapper")
    content = content.replace(old, '<div className="h-full flex flex-col">\n        <div key={`${activeArea}-${view.screen}`} className="animate-in fade-in zoom-in-95 duration-500 flex-1 min-h-0">')
    with open('src/themes/ThemeDefault.tsx', 'w') as f: f.write(content)
else:
    print("ThemeDefault pattern not found, checking manually...")
    idx = content.find('h-full overflow-y-auto pb-16')
    if idx >= 0:
        print(f"  Found at char {idx}: ...{content[idx-20:idx+80]}...")

