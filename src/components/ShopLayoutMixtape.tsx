// @ts-nocheck
import React from "react";
import { useShopLogic } from "@/hooks/useShopLogic";
import { Coins, Skull, Check } from "lucide-react";

export default function ShopLayoutMixtape() {
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
    <div className="h-full overflow-y-auto bg-stone-950 text-stone-300 font-mono p-4 md:p-8 selection:bg-pink-500 selection:text-stone-950">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar - Zine Index */}
        <aside className="md:col-span-1 flex flex-col">
          <div className="border-4 border-stone-100 bg-stone-100 text-stone-900 p-6 mb-8 transform -rotate-2 shadow-[8px_8px_0_#ec4899] z-10 relative">
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-4">
              Zine<br/>Catalog
            </h1>
            <div className="bg-stone-900 text-stone-100 px-4 py-2 font-bold flex items-center justify-between text-sm shadow-inner">
              <span>CREDITS</span>
              <span className="flex items-center gap-1 text-pink-400">
                <Coins size={14} /> {credits.toLocaleString()}
              </span>
            </div>
            {/* Rough edge detail */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-stone-950 transform rotate-45 translate-x-4 -translate-y-4"></div>
          </div>

          <div className="flex bg-stone-900 border-2 border-stone-800 mb-6 sticky top-4 z-20">
            <button
              onClick={() => setActiveTab("browse")}
              className={`flex-1 py-3 text-sm font-bold uppercase transition-colors ${activeTab === "browse" ? "bg-pink-500 text-stone-950" : "text-stone-500 hover:text-stone-300 hover:bg-stone-800"}`}
            >
              Browse
            </button>
            <button
              onClick={() => setActiveTab("collection")}
              className={`flex-1 py-3 text-sm font-bold uppercase transition-colors ${activeTab === "collection" ? "bg-pink-500 text-stone-950" : "text-stone-500 hover:text-stone-300 hover:bg-stone-800"}`}
            >
              Stash
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {SHOP_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-left px-4 py-3 font-bold uppercase tracking-widest text-sm border-l-4 transition-all ${
                  activeCategory === cat.id 
                    ? "border-pink-500 bg-stone-900 text-white" 
                    : "border-transparent text-stone-500 hover:text-stone-300 hover:bg-stone-900/50"
                }`}
              >
                <span className="mr-2 opacity-50">{cat.icon}</span> {cat.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-3">
          {activeTab === "collection" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {shopItems.filter(item => item.category === activeCategory && ownedItems.has(item.id)).length === 0 ? (
                <div className="col-span-full border-4 border-dashed border-stone-800 p-12 text-center text-stone-600 font-bold uppercase tracking-widest">
                  Nothing in your stash yet.
                </div>
              ) : (
                shopItems.filter(item => item.category === activeCategory && ownedItems.has(item.id)).map(item => {
                  const isEquipped = equippedItems[item.category] === item.id;
                  return (
                    <div key={item.id} className={`p-6 border-2 flex flex-col ${isEquipped ? "border-pink-500 bg-stone-900 shadow-[4px_4px_0_#ec4899]" : "border-stone-700 bg-stone-900/50"}`}>
                      <h3 className="text-xl font-bold text-stone-100 mb-2">{item.name}</h3>
                      <p className="text-stone-400 text-sm mb-6 flex-1">{item.description}</p>
                      {isEquipped ? (
                        <div className="flex items-center gap-2 text-pink-500 font-bold uppercase tracking-widest text-sm bg-pink-500/10 p-2 justify-center border border-pink-500/20">
                          <Check size={16} /> Equipped
                        </div>
                      ) : (
                        <button
                          onClick={() => equipItem(item.category, item.id)}
                          className="bg-stone-800 text-stone-300 font-bold uppercase tracking-widest text-sm py-2 hover:bg-stone-700 hover:text-white transition-colors"
                        >
                          Equip
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {itemsInCategory.map((item) => {
                const isOwned = ownedItems.has(item.id);
                const canAfford = credits >= item.price;
                const isLocked = !!item.achievementLocked && !isAchievementUnlocked(item.id);
                const isEquipped = equippedItems[item.category] === item.id;

                const handleBuy = () => {
                  if (isOwned || isLocked) return;
                  const bought = buyItem(item.id, item.price);
                  if (bought && item.category === "themes") {
                    equipItem(item.category, item.id);
                  }
                };

                return (
                  <div 
                    key={item.id}
                    className={`relative p-5 border-2 flex flex-col transition-all ${
                      isEquipped ? "border-pink-500 bg-stone-900 shadow-[4px_4px_0_#ec4899]" : 
                      isOwned ? "border-stone-700 bg-stone-900/50 opacity-80" : 
                      "border-stone-800 bg-stone-900 hover:border-stone-600 hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
                    }`}
                  >
                    {isEquipped && (
                      <div className="absolute -top-3 -right-3 bg-pink-500 text-stone-950 font-black text-xs px-3 py-1 uppercase transform rotate-6 shadow-md z-10 border-2 border-stone-950">
                        Equipped
                      </div>
                    )}
                    
                    <h3 className="text-xl font-bold text-stone-100 mb-2 leading-tight">{item.name}</h3>
                    <p className="text-stone-400 text-xs mb-6 flex-1">{item.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-800/50">
                      {isOwned ? (
                        <span className="text-pink-500 font-bold text-xs uppercase tracking-widest">Owned</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-stone-300 font-bold text-sm">
                          <Coins size={14} className="text-stone-500" />
                          {item.price.toLocaleString()}
                        </span>
                      )}

                      {!isOwned ? (
                        <button
                          onClick={handleBuy}
                          disabled={isLocked || !canAfford}
                          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-transform ${
                            isLocked ? "bg-stone-800 text-stone-600 cursor-not-allowed" :
                            !canAfford ? "bg-stone-800 text-stone-500 cursor-not-allowed" :
                            "bg-stone-200 text-stone-900 hover:bg-white active:scale-95"
                          }`}
                        >
                          {isLocked ? "Locked" : !canAfford ? "Broke" : "Cop It"}
                        </button>
                      ) : null}
                    </div>

                    {isLocked && (
                      <div className="h-full bg-stone-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center border-2 border-stone-800 z-10">
                        <Skull className="text-stone-600 mb-3" size={32} />
                        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                          Requires:<br/>
                          <span className="text-pink-400">{item.achievementLocked}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
