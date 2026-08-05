// @ts-nocheck
"use client";

import { useShopLogic } from "@/hooks/useShopLogic";
import { Coffee, Utensils, Coins, Check, Lock, Star } from "lucide-react";

export default function ShopLayoutDiner() {
  const {
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
} = useShopLogic();

  return (
    <div className="h-full bg-[#fdfbe9] text-stone-900 p-8 overflow-y-auto">
      {/* Menu Cover / Header */}
      <div className="max-w-4xl mx-auto border-double border-8 border-red-600 rounded-lg p-2 bg-stone-100 shadow-2xl relative">
        
        {/* Wallet Ticket */}
        <div className="absolute -top-4 -right-4 bg-green-100 border-4 border-green-500 rounded-lg p-3 shadow-[4px_4px_0_#22c55e] rotate-6 z-10 font-mono flex flex-col items-center">
          <span className="text-green-800 font-bold uppercase text-xs">Customer Funds</span>
          <div className="flex items-center gap-2 text-green-900">
            <Coins size={20} />
            <span className="text-xl font-black">{credits}</span>
          </div>
        </div>

        <div className="border-2 border-dashed border-red-400 p-8 text-center bg-white rounded flex flex-col items-center">
          <Utensils size={48} className="text-red-600 mb-4" />
          <h1 className="text-6xl font-black uppercase tracking-tighter font-serif text-red-700">Diner Menu</h1>
          <p className="text-stone-500 font-mono uppercase tracking-widest mt-4 font-bold border-y-2 border-stone-200 py-2 inline-block">Specials • Upgrades • Themes</p>

          <div className="mt-12 w-full text-left space-y-12">
            {categories.map(category => {
              const categoryItems = filteredItems.filter(i => i.category === category.id);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category.id} className="w-full">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6 border-b-4 border-stone-800 pb-2">
                    <h2 className="text-4xl font-black font-serif text-stone-900 uppercase">{category.label}</h2>
                    <span className="text-stone-500 font-mono text-sm tracking-widest bg-stone-200 px-3 py-1 rounded">Daily Specials</span>
                  </div>

                  {/* Items List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 font-mono">
                    {categoryItems.map(item => {
                      const isOwned = isItemOwned(item.id);
                      const isEquipped = isItemEquipped(category.id, item.id);
                      const isAchievement = item.achievementLocked;
                      const canAfford = credits >= item.price;
                      let isLocked = false;
                      if (isAchievement && item.unlockRequirement) {
                        isLocked = !isAchievementUnlocked(item.unlockRequirement);
                      }

                      return (
                        <div key={item.id} className="flex justify-between items-start border-b-2 border-stone-200 border-dotted pb-4 group">
                          <div className="pr-4 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg text-stone-900 group-hover:text-red-600 transition-colors uppercase">
                                {item.name}
                              </h3>
                              {isEquipped && (
                                <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold tracking-widest">
                                  SERVED
                                </span>
                              )}
                            </div>
                            <p className="text-stone-500 text-xs italic font-serif leading-relaxed mb-2">
                              {item.description}
                            </p>
                            {isAchievement && (
                              <p className="text-red-700 text-xs font-bold bg-red-50 inline-block px-2 py-0.5 rounded border border-red-200">
                                ⭐ {item.unlockRequirement}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end shrink-0 pl-4 border-l-2 border-stone-100">
                            {/* Price / Action Button */}
                            {!isOwned ? (
                              <button
                                disabled={isLocked || (!isAchievement && !canAfford)}
                                onClick={() => handlePurchase(item)}
                                className={`text-xl font-black tracking-tight px-3 py-1 rounded transition-all shadow-sm ${
                                  isLocked 
                                    ? "bg-stone-200 text-stone-400 cursor-not-allowed line-through" 
                                    : (!isAchievement && !canAfford)
                                      ? "bg-red-50 text-red-300 cursor-not-allowed"
                                      : "bg-white border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white"
                                }`}
                              >
                                {isLocked ? (
                                  <div className="flex items-center gap-1 text-sm"><Lock size={14}/> Locked</div>
                                ) : (
                                  <span>${(item.price / 100).toFixed(2)}</span>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEquip(item)}
                                className={`text-sm font-bold uppercase tracking-widest px-4 py-2 rounded transition-all ${
                                  isEquipped 
                                    ? "bg-stone-200 text-stone-500 cursor-default" 
                                    : "bg-red-600 text-white hover:bg-red-700 hover:shadow-[2px_2px_0_#991b1b] active:translate-y-1 active:shadow-none"
                                }`}
                              >
                                {isEquipped ? "Eaten" : "Order"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-12 w-full text-center border-t-2 border-stone-300 pt-6 font-mono text-stone-400 text-xs uppercase tracking-widest">
            Thank you for dining at the Grand Archive! • Please pay at register.
          </div>
        </div>
      </div>
    </div>
  );
}
