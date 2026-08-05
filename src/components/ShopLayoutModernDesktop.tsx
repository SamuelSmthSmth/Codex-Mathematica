// @ts-nocheck
"use client";

import React from "react";
import { useShopLogic } from "@/hooks/useShopLogic";
import { Coins, CheckCircle2, Lock, ShoppingCart } from "lucide-react";

export default function ShopLayoutModernDesktop() {
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
    <div className="h-full w-full bg-[#1e1e1e] text-slate-200 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 flex-none h-16 bg-[#1e1e1e]/80 backdrop-blur-xl border-b border-white/10 flex filteredItems-center justify-between px-8">
        <h1 className="text-xl font-semibold text-white tracking-tight">App Store</h1>
        <div className="flex filteredItems-center gap-2 px-3 py-1.5 bg-black/50 border border-white/10 rounded-full">
          <Coins className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-slate-200">{credits}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-none border-r border-white/10 bg-[#2a2a2a]/30 overflow-y-auto p-4 flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
            Categories
          </div>
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`tour-shop-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#1a1a1a]">
          {/* Hero Banner (App Store style) */}
          <div className="mb-10 w-full h-64 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-black border border-white/10 p-8 flex flex-col justify-end relative overflow-hidden group">
            <div className="h-full bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <ShoppingCart className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-2">Featured</div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Expand Your Desktop</h2>
              <p className="text-slate-300 max-w-md text-sm">
                Discover new themes and modules to customize your Codex workspace.
              </p>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isOwned = isItemOwned(item.id);
              const isEquipped = isItemEquipped(item.category, item.id);
              const canAfford = credits >= item.price;

              return (
                <div
                  key={item.id}
                  className="flex flex-col bg-[#222222] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all group"
                >
                  <div className="h-40 bg-gradient-to-br from-[#333] to-[#111] relative flex filteredItems-center justify-center overflow-hidden border-b border-white/5">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-6xl group-hover:scale-110 transition-transform duration-500">
                        {item.name.charAt(0)}
                      </div>
                    )}
                    {isEquipped && (
                      <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-lg flex filteredItems-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Installed
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between filteredItems-start mb-2 gap-4">
                      <h3 className="font-semibold text-lg text-slate-100 leading-tight">
                        {item.name}
                      </h3>
                      {!isOwned && (
                        <div className="flex filteredItems-center gap-1 text-sm font-medium text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded flex-shrink-0">
                          <Coins className="w-3 h-3" />
                          {item.price}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-6 flex-1">
                      {item.description}
                    </p>

                    <div className="mt-auto">
                      {isOwned ? (
                        <button
                          onClick={() => handleEquip(item)}
                          disabled={isEquipped}
                          className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                            isEquipped
                              ? "bg-white/5 text-slate-500 cursor-default"
                              : "bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/30 hover:border-blue-600"
                          }`}
                        >
                          {isEquipped ? "Installed" : "Install"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePurchase(item)}
                          disabled={!canAfford}
                          className={`w-full py-2 rounded-lg text-sm font-medium flex filteredItems-center justify-center gap-2 transition-all ${
                            canAfford
                              ? "bg-slate-100 text-black hover:bg-white"
                              : "bg-white/5 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {!canAfford && <Lock className="w-3 h-3" />}
                          {canAfford ? "Get" : "Insufficient Funds"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500">
                No apps available in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
