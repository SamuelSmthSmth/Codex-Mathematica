// @ts-nocheck
import React from "react";
import { useShopLogic } from "@/hooks/useShopLogic";

export default function ShopLayoutWindowsXP() {
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
    <div className="h-full flex flex-col font-[Tahoma] bg-white text-black">
      {/* Top Banner (Credits) */}
      <div className="bg-[#ece9d8] border-b border-gray-400 p-2 flex justify-between items-center px-4 shadow-sm">
        <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span>Account Balance:</span>
          <span className="text-green-700 bg-white px-2 py-0.5 border border-gray-400 rounded-sm drop-shadow-sm font-mono">
            ${credits}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1 text-xs border cursor-pointer ${activeTab === 'browse' ? 'border-gray-500 bg-white font-bold' : 'border-transparent hover:border-gray-400 bg-transparent'}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse
          </button>
          <button 
            className={`px-3 py-1 text-xs border cursor-pointer ${activeTab === 'inventory' ? 'border-gray-500 bg-white font-bold' : 'border-transparent hover:border-gray-400 bg-transparent'}`}
            onClick={() => setActiveTab('inventory')}
          >
            My Collection
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Add/Remove Programs Style */}
        <div className="w-40 bg-[#7ba2e7] flex flex-col p-2 gap-2 overflow-y-auto shadow-[inset_-2px_0_4px_rgba(0,0,0,0.1)] h-full border-r border-blue-800">
          {activeTab === 'browse' && categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center justify-center py-4 px-2 rounded border cursor-pointer transition-all ${
                activeCategory === cat.id 
                  ? 'bg-white border-white text-blue-900 shadow-md font-bold transform scale-[1.02]' 
                  : 'bg-transparent border-transparent text-white hover:bg-blue-400 hover:text-white'
              }`}
            >
              <div className="text-3xl mb-2 drop-shadow-md">{cat.icon}</div>
              <div className="text-xs text-center leading-tight">{cat.label}</div>
            </button>
          ))}
          {activeTab === 'inventory' && (
             <div className="flex flex-col items-center justify-center py-4 px-2 rounded bg-white border-white text-blue-900 shadow-md font-bold">
                <div className="text-3xl mb-2 drop-shadow-md">🎒</div>
                <div className="text-xs text-center leading-tight">My Inventory</div>
             </div>
          )}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white p-4 overflow-y-auto h-full">
          {activeTab === 'browse' ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm font-bold text-gray-800 mb-2 border-b-2 border-blue-200 pb-1 flex justify-between items-end">
                <span>Available Programs ({filteredItems.length})</span>
                <span className="text-[10px] font-normal text-gray-500">Sort by: Name</span>
              </div>
              {filteredItems.map((item: any) => (
                <div key={item.id} className="flex bg-[#f9f9f9] p-3 border border-gray-300 rounded-sm hover:bg-blue-50 transition-colors shadow-sm group">
                  <div className="w-12 h-12 bg-white border border-gray-400 flex items-center justify-center mr-4 rounded-sm text-2xl overflow-hidden shadow-inner flex-shrink-0">
                    {"emoji" === 'color' ? (
                      <div className="w-full h-full" style={{ backgroundColor: item.name.charAt(0) }} />
                    ) : "emoji" === 'emoji' ? (
                      <div>{item.name.charAt(0)}</div>
                    ) : (
                      <div className="text-gray-400 text-xs">img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-black flex items-center gap-2">
                      <span className="truncate">{item.name}</span>
                      {unlocks[item.id] && <span className="text-[9px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded border border-green-300 font-bold tracking-wider">INSTALLED</span>}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2 pr-2">{item.description}</div>
                  </div>
                  <div className="flex flex-col justify-center items-end ml-2 w-24 flex-shrink-0 border-l border-gray-200 pl-3">
                    {!unlocks[item.id] ? (
                      <>
                        <div className="text-sm font-bold text-blue-800 mb-1.5">${item.price}</div>
                        <button 
                          onClick={() => handlePurchase(item)}
                          disabled={credits < item.price}
                          className={`w-full py-1 text-xs border shadow-sm rounded-sm font-bold cursor-pointer transition-all ${
                            credits >= item.price 
                              ? 'bg-gradient-to-b from-gray-100 to-gray-200 border-gray-400 hover:from-blue-50 hover:to-blue-100 hover:border-blue-400 active:from-gray-300 active:to-gray-300 text-black' 
                              : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Add
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleEquip(item)}
                        className="w-full py-1 text-xs border shadow-sm rounded-sm font-bold cursor-pointer bg-gradient-to-b from-gray-100 to-gray-200 border-gray-400 hover:from-blue-50 hover:to-blue-100 hover:border-blue-400 active:from-gray-300 active:to-gray-300 text-black"
                      >
                        Equip
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-sm font-bold text-gray-800 mb-2 border-b-2 border-blue-200 pb-1">
                Installed Programs ({inventoryItems.length})
              </div>
              {inventoryItems.map((item: any) => (
                <div key={item.id} className="flex bg-[#f9f9f9] p-3 border border-gray-300 rounded-sm hover:bg-blue-50 transition-colors shadow-sm">
                  <div className="w-12 h-12 bg-white border border-gray-400 flex items-center justify-center mr-4 rounded-sm text-2xl overflow-hidden shadow-inner flex-shrink-0">
                    {"emoji" === 'color' ? (
                      <div className="w-full h-full" style={{ backgroundColor: item.name.charAt(0) }} />
                    ) : "emoji" === 'emoji' ? (
                      <div>{item.name.charAt(0)}</div>
                    ) : (
                      <div className="text-gray-400 text-xs">img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-black truncate">{item.name}</div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2 pr-2">{item.description}</div>
                  </div>
                  <div className="flex flex-col justify-center items-end ml-2 w-24 flex-shrink-0 border-l border-gray-200 pl-3">
                    <button 
                      onClick={() => handleEquip(item)}
                      className="w-full py-1 text-xs border shadow-sm rounded-sm font-bold cursor-pointer bg-gradient-to-b from-gray-100 to-gray-200 border-gray-400 hover:from-blue-50 hover:to-blue-100 hover:border-blue-400 active:from-gray-300 active:to-gray-300 text-black"
                    >
                      Equip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
