"use client";

import { useShopLogic } from "@/hooks/useShopLogic";
import { Coins, Lock, Check, Sparkles } from "lucide-react";
import { ShopItem } from "@/data/shop-items";

function ShopItemTab({ item, isOwned, isLocked, isEquipped, canAfford, handlePurchase, handleEquip }: { item: ShopItem, isOwned: boolean, isLocked: boolean, isEquipped: boolean, canAfford: boolean, handlePurchase: (i: ShopItem) => void, handleEquip: (i: ShopItem) => void }) {
  // Styles for the tab
  const baseClasses = "flex flex-col justify-between border-4 border-stone-800 p-4 transition-transform shadow-[4px_4px_0_rgba(0,0,0,0.8)] relative";
  const rot = (Math.random() * 6 - 3).toFixed(1);
  const bg = isEquipped ? "bg-[#c8f0d8]" : isOwned ? "bg-[#e0f0ff]" : isLocked ? "bg-stone-300" : "bg-[#fff9c4]";

  const onClick = () => {
    if (isOwned && !isEquipped) handleEquip(item);
    else if (!isOwned && canAfford && !isLocked) handlePurchase(item);
  };

  return (
    <div 
      onClick={onClick}
      className={`${baseClasses} ${bg} w-52 h-64 cursor-pointer hover:scale-105 group`}
      style={{ transform: `rotate(${rot}deg)`, borderRadius: "2px 8px 3px 6px" }}
    >
      {/* Tape piece */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/60 border-2 border-stone-800 rotate-3 z-10" />

      <div>
        <div className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-2 border-b-2 border-stone-800/20 pb-1">
          {item.rank === 1 ? "PRESTIGE" : item.rank === 2 ? "STANDARD" : "GRIND"}
        </div>
        <h3 className="text-2xl font-bold text-stone-900 leading-tight mb-2">{item.name}</h3>
        <p className="text-xl text-stone-700 leading-snug">{item.description}</p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t-4 border-stone-800 border-dashed pt-3">
        {isLocked ? (
          <div className="flex items-center gap-1 text-stone-600">
            <Lock size={18} />
            <span className="text-xl font-bold">Locked</span>
          </div>
        ) : isEquipped ? (
          <div className="flex items-center gap-1 text-stone-900 font-bold bg-white px-2 py-1 border-2 border-stone-800 rounded">
            <Check size={18} />
            <span className="text-xl">Equipped</span>
          </div>
        ) : isOwned ? (
          <div className="flex items-center gap-1 text-stone-900 font-bold text-xl">
            <Check size={18} /> Owned
          </div>
        ) : (
          <div className={`flex items-center gap-1 font-bold text-xl px-2 py-1 border-2 border-stone-800 rounded ${canAfford ? 'bg-white text-stone-900 group-hover:bg-[#ffc0cb]' : 'bg-stone-300 text-stone-500'}`}>
            <Coins size={18} /> {item.price}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopLayoutScribble() {
  const { credits, itemsByCategory, ownedItems, equippedItems, isAchievementUnlocked, handlePurchase, handleEquip } = useShopLogic();

  return (
    <div className="h-full p-4 md:p-8 bg-[#fdf7ee] overflow-y-auto" style={{ fontFamily: "'Caveat', cursive", backgroundImage: "radial-gradient(#d6d3d1 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      
      {/* Corkboard / Bulletin Board Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 max-w-5xl mx-auto gap-6">
        <h1 className="text-6xl font-bold text-stone-800 bg-[#ffe0e0] px-8 py-4 border-4 border-stone-800 shadow-[8px_8px_0_rgba(0,0,0,0.8)] transform -rotate-2" style={{ borderRadius: "2px 8px 3px 6px" }}>
          School Store!
        </h1>

        <div className="bg-white border-4 border-stone-800 px-6 py-3 shadow-[6px_6px_0_rgba(0,0,0,0.8)] transform rotate-2 flex items-center gap-3" style={{ borderRadius: "6px 2px 8px 4px" }}>
          <Coins size={32} className="text-[#e88080]" fill="currentColor" />
          <span className="text-4xl font-bold text-stone-900">{credits}</span>
          <span className="text-2xl font-bold text-stone-500 ml-2">credits</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-16 pb-20">
        {itemsByCategory.map(category => (
          <div key={category.category.id} className="bg-[#f5f5f4] border-4 border-stone-800 p-8 shadow-[8px_8px_0_rgba(0,0,0,0.8)] relative" style={{ borderRadius: "4px 12px 6px 8px" }}>
            {/* Push pins */}
            <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-[#e88080] border-2 border-stone-800 shadow-[2px_2px_0_rgba(0,0,0,0.8)]" />
            <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#e88080] border-2 border-stone-800 shadow-[2px_2px_0_rgba(0,0,0,0.8)]" />

            <h2 className="text-4xl font-bold text-stone-900 mb-2 border-b-4 border-stone-800 inline-block pr-8 pb-2 border-dashed">{category.category.label}</h2>

            <div className="flex flex-wrap gap-8 justify-center items-stretch">
              {category.items.map(item => (
                <ShopItemTab
                  key={item.id}
                  item={item}
                  isOwned={ownedItems.has(item.id)}
                  isLocked={!!item.achievementLocked && !isAchievementUnlocked(item.id)}
                  isEquipped={equippedItems[category.category.id] === item.id}
                  canAfford={credits >= item.price}
                  handlePurchase={handlePurchase}
                  handleEquip={handleEquip}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
