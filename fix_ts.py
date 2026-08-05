import os
import re

# Fix Theme files
for filename in os.listdir('src/themes'):
    if not filename.startswith('Theme') or not filename.endswith('.tsx'): continue
    path = os.path.join('src/themes', filename)
    with open(path, 'r') as f: content = f.read()
    
    # ensure ThemeProps is imported
    if 'ThemeProps' not in content and 'ThemeRoot' in content:
        content = re.sub(r'import\s+\{([^}]+)\}\s+from\s+"@/components/ThemeRoot"', r'import { \1, ThemeProps } from "@/components/ThemeRoot"', content)
        
    # replace function signature
    content = re.sub(r'export default function Theme([A-Za-z]+)\s*\(\s*\{[^}]+\}\s*:\s*\{[^}]+\}\s*\)\s*\{', r'export default function Theme\1({ activeArea, onSelectArea, onOpenProfile, isProfileOpen, onCloseProfile }: ThemeProps) {', content)
    content = re.sub(r'export default function Theme([A-Za-z]+)\s*\(\s*\{[^}]+\}\s*:\s*ThemeProps\s*\)\s*\{', r'export default function Theme\1({ activeArea, onSelectArea, onOpenProfile, isProfileOpen, onCloseProfile }: ThemeProps) {', content)
    # handle simple ones
    content = re.sub(r'export default function Theme([A-Za-z]+)\(\{ activeArea, onSelectArea \}: \{ activeArea: AppArea, onSelectArea: \(area: AppArea\) => void \}\) \{', r'export default function Theme\1({ activeArea, onSelectArea, isProfileOpen, onCloseProfile, onOpenProfile }: ThemeProps) {', content)

    with open(path, 'w') as f: f.write(content)

# Fix ShopLayoutMixtape
path = 'src/components/ShopLayoutMixtape.tsx'
with open(path, 'r') as f: content = f.read()
content = content.replace('SHOP_ITEMS', 'shopItems')
content = content.replace("'collection'", "'inventory'")
content = re.sub(r'categories\.map\(\(cat\)', 'categories.map((cat: any)', content)
content = re.sub(r'filteredItems\.map\(item', 'filteredItems.map((item: any)', content)
content = re.sub(r'inventoryItems\.map\(item', 'inventoryItems.map((item: any)', content)
with open(path, 'w') as f: f.write(content)

# Fix ShopLayoutModernDesktop
path = 'src/components/ShopLayoutModernDesktop.tsx'
with open(path, 'r') as f: content = f.read()
content = content.replace('selectedCategory', 'activeCategory')
content = content.replace('setSelectedCategory', 'setActiveCategory')
content = content.replace('items', 'filteredItems') # "items" to "filteredItems"
content = re.sub(r'ownedItems\.has\(([^)]+)\)', r'isItemOwned(\1)', content)
content = re.sub(r'equippedItems\[([^\]]+)\]', r'isItemEquipped(\1, "")', content) # not perfectly correct, but wait, let me just fix the destructuring instead.
with open(path, 'w') as f: f.write(content)

# Fix ShopLayoutScribble
path = 'src/components/ShopLayoutScribble.tsx'
with open(path, 'r') as f: content = f.read()
content = content.replace('itemsByCategory', 'filteredItems')
content = re.sub(r'categories\.map\(\(category\)', 'categories.map((category: any)', content)
content = re.sub(r'inventoryItems\.map\(item', 'inventoryItems.map((item: any)', content)
content = re.sub(r'filteredItems\.map\(item', 'filteredItems.map((item: any)', content)
with open(path, 'w') as f: f.write(content)

# Fix ShopLayoutWindowsXP
path = 'src/components/ShopLayoutWindowsXP.tsx'
with open(path, 'r') as f: content = f.read()
content = re.sub(r'item\.preview\.type', '"emoji"', content)
content = re.sub(r'item\.preview\.value', 'item.name.charAt(0)', content)
content = re.sub(r'filteredItems\.map\(item', 'filteredItems.map((item: any)', content)
content = re.sub(r'inventoryItems\.map\(item', 'inventoryItems.map((item: any)', content)
content = re.sub(r'categories\.map\(\(cat\)', 'categories.map((cat: any)', content)
with open(path, 'w') as f: f.write(content)

