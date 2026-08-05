import re

# ThemeRoot.tsx
path = 'src/components/ThemeRoot.tsx'
with open(path, 'r') as f: content = f.read()
content = content.replace('<ThemeDefault activeArea={activeArea} onSelectArea={onSelectArea} />', '<ThemeDefault activeArea={activeArea} onSelectArea={onSelectArea} isProfileOpen={isProfileOpen} onCloseProfile={onCloseProfile} />')
with open(path, 'w') as f: f.write(content)

# ShopLayoutDiner.tsx
path = 'src/components/ShopLayoutDiner.tsx'
with open(path, 'r') as f: content = f.read()
content = re.sub(r'const \{[^\}]+\}\s*=\s*useShopLogic\(\);', '''const {
    credits,
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    categories,
    filteredItems,
    inventoryItems,
    isItemOwned,
    isItemEquipped,
    handleBuy,
    handleEquip,
} = useShopLogic();''', content)
content = content.replace('ownedItems', 'inventoryItems')
content = content.replace('equippedItems', 'isItemEquipped') # This might cause more errors but lets just fix it manually if so
content = content.replace('SHOP_ITEMS', 'filteredItems')
content = content.replace('SHOP_CATEGORIES', 'categories')
with open(path, 'w') as f: f.write(content)

# ShopLayoutMixtape.tsx
path = 'src/components/ShopLayoutMixtape.tsx'
with open(path, 'r') as f: content = f.read()
content = re.sub(r'const \{[^\}]+\}\s*=\s*useShopLogic\(\);', '''const {
    credits,
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    categories,
    filteredItems,
    inventoryItems,
    isItemOwned,
    isItemEquipped,
    handleBuy,
    handleEquip,
} = useShopLogic();''', content)
with open(path, 'w') as f: f.write(content)

# ShopLayoutModernDesktop.tsx
path = 'src/components/ShopLayoutModernDesktop.tsx'
with open(path, 'r') as f: content = f.read()
content = re.sub(r'const \{[^\}]+\}\s*=\s*useShopLogic\(\);', '''const {
    credits,
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    categories,
    filteredItems,
    inventoryItems,
    isItemOwned,
    isItemEquipped,
    handleBuy,
    handleEquip,
} = useShopLogic();''', content)
with open(path, 'w') as f: f.write(content)

# ShopLayoutScribble.tsx
path = 'src/components/ShopLayoutScribble.tsx'
with open(path, 'r') as f: content = f.read()
content = re.sub(r'const \{[^\}]+\}\s*=\s*useShopLogic\(\);', '''const {
    credits,
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    categories,
    filteredItems,
    inventoryItems,
    isItemOwned,
    isItemEquipped,
    handleBuy,
    handleEquip,
} = useShopLogic();''', content)
with open(path, 'w') as f: f.write(content)

# LibraryViewWindowsXP.tsx
path = 'src/components/LibraryViewWindowsXP.tsx'
with open(path, 'r') as f: content = f.read()
content = content.replace('activeCategory,', '')
content = content.replace('activeTechnique,', 'activeTechnique, setActiveCategory,')
content = content.replace('import { Technique, CategoryMeta } from "@/data/codex-data";', 'import { Technique, CategoryMeta, TechniqueRow } from "@/data/codex-data";')
with open(path, 'w') as f: f.write(content)

