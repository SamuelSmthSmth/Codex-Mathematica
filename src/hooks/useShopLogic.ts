import { useState, useMemo } from "react";
import { useProgress } from "@/context/ProgressContext";
import { SHOP_ITEMS, SHOP_CATEGORIES, type ShopItem } from "@/data/shop-items";

export function useShopLogic() {
  const { credits, buyItem, ownedItems, equipItem, equippedItems, isAchievementUnlocked } = useProgress();

  const [activeTab, setActiveTab] = useState<'browse' | 'inventory'>('browse');
  const [activeCategory, setActiveCategory] = useState<string>(SHOP_CATEGORIES[0]?.id || '');

  const handleBuy = (item: ShopItem) => {
    const isOwned = ownedItems.has(item.id);
    const isLocked = !!item.achievementLocked && !isAchievementUnlocked(item.id);
    if (isOwned || isLocked) return;
    
    const bought = buyItem(item.id, item.price);
    if (bought && item.category === "themes") {
      equipItem(item.category, item.id);
    }
  };

  const handleEquip = (item: ShopItem) => {
    equipItem(item.category, item.id);
  };

  const isItemOwned = (id: string) => ownedItems.has(id);
  const isItemLocked = (id: string, achievementLocked?: boolean) => !!achievementLocked && !isAchievementUnlocked(id);
  const isItemEquipped = (category: string, id: string) => equippedItems[category] === id;

  const filteredItems = useMemo(() => SHOP_ITEMS.filter(item => item.category === activeCategory), [activeCategory]);
  const inventoryItems = useMemo(() => SHOP_ITEMS.filter(item => ownedItems.has(item.id)), [ownedItems]);
  const unlocks = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const item of SHOP_ITEMS) {
      map[item.id] = ownedItems.has(item.id);
    }
    return map;
  }, [ownedItems]);

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
  };
}
