import os
import re

complete_destructuring = """const {
    credits,
    shopItems,
    shopCategories,
    categories,
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    filteredItems,
    inventoryItems,
    unlocks,
    isAchievementUnlocked,
    handleBuy,
    handlePurchase,
    handleEquip,
    isItemOwned,
    isItemLocked,
    isItemEquipped,
    SHOP_ITEMS,
    SHOP_CATEGORIES,
    ownedItems,
    equippedItems,
    buyItem,
    equipItem,
    itemsInCategory,
    items,
    selectedCategory,
    setSelectedCategory,
    itemsByCategory,
} = useShopLogic();"""

for filename in os.listdir('src/components'):
    if not filename.startswith('ShopLayout') or not filename.endswith('.tsx'): continue
    path = os.path.join('src/components', filename)
    with open(path, 'r') as f: content = f.read()
    content = re.sub(r'const\s*\{\s*credits,[\s\S]*?\}\s*=\s*useShopLogic\(\);', complete_destructuring, content)
    with open(path, 'w') as f: f.write(content)

