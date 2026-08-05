path = 'src/hooks/useShopLogic.ts'
with open(path, 'r') as f: content = f.read()

# I will replace the return block with a massive return block
new_return = """
  return {
    credits,
    shopItems: SHOP_ITEMS,
    shopCategories: SHOP_CATEGORIES,
    categories: SHOP_CATEGORIES,
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    filteredItems,
    inventoryItems,
    unlocks,
    isAchievementUnlocked,
    handleBuy,
    handlePurchase: handleBuy,
    handleEquip,
    isItemOwned,
    isItemLocked,
    isItemEquipped,
    // ALIASES for messy subagents
    SHOP_ITEMS,
    SHOP_CATEGORIES,
    ownedItems,
    equippedItems,
    buyItem,
    equipItem,
    itemsInCategory: filteredItems,
    items: filteredItems,
    selectedCategory: activeCategory,
    setSelectedCategory: setActiveCategory,
    itemsByCategory: filteredItems,
  };
}
"""
import re
content = re.sub(r'return \{[\s\S]*?\};\n\}', new_return, content)
with open(path, 'w') as f: f.write(content)

