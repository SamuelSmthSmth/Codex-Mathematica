// @ts-nocheck
"use client";

import { useLibraryLogic } from "@/hooks/useLibraryLogic";
import LibraryArticle from "./LibraryArticle";
import { Disc3, Music, PlayCircle, Star } from "lucide-react";

export default function LibraryViewDiner() {
  const { activeTechnique, setActiveTechnique, todaysTechnique, TECHNIQUE_ROWS } = useLibraryLogic();

  if (activeTechnique) {
    return (
      <div className="h-full bg-[#fdfbe9] text-stone-900 font-mono">
        <LibraryArticle
          technique={activeTechnique}
          onBack={() => setActiveTechnique(null)}
        />
      </div>
    );
  }

  return (
    <div className="h-full bg-[#fdfbe9] text-stone-900 font-mono p-8 overflow-y-auto">
      {/* Jukebox Header */}
      <div className="max-w-4xl mx-auto border-8 border-red-600 rounded-t-[4rem] bg-stone-100 p-8 shadow-2xl relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-8 py-2 rounded-full border-4 border-stone-100 font-black text-xl tracking-widest uppercase">
          Tabletop Jukebox
        </div>
        
        <div className="text-center mb-8 mt-4">
          <h1 className="text-5xl font-black text-stone-900 uppercase tracking-tighter">Hits Collection</h1>
          <p className="text-stone-500 mt-2 font-bold tracking-widest uppercase text-sm">Insert Coin to Play • 25¢ per technique</p>
        </div>

        {/* Today's Special Track */}
        {todaysTechnique && (
          <div className="bg-yellow-100 border-4 border-yellow-400 p-6 rounded-xl mb-12 shadow-[4px_4px_0_#ca8a04]">
            <div className="flex items-center gap-3 mb-2 text-yellow-700 font-black uppercase">
              <Star size={24} />
              <span>Track of the Day</span>
            </div>
            <h2 className="text-3xl font-black text-stone-900 mb-2">{todaysTechnique.name}</h2>
            <p className="text-stone-600 font-bold mb-4">{todaysTechnique.tagline}</p>
            <button 
              onClick={() => setActiveTechnique(todaysTechnique)}
              className="bg-red-600 text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-red-700 hover:scale-105 transition-all shadow-[0_4px_0_#991b1b] active:translate-y-[4px] active:shadow-none"
            >
              <PlayCircle size={20} />
              PLAY TRACK
            </button>
          </div>
        )}

        {/* Tracks List (Techniques) */}
        <div id="tour-library-list" className="grid md:grid-cols-2 gap-8 bg-stone-200 p-6 rounded-2xl shadow-inner border-4 border-stone-300">
          {TECHNIQUE_ROWS.map((row, rowIndex) => (
            <div key={row.id} className="flex flex-col gap-3">
              <div className="bg-red-600 text-white text-center font-black py-2 rounded shadow-sm border-2 border-red-800 uppercase tracking-widest">
                {row.title}
              </div>
              <div className="bg-white rounded-lg p-2 border-2 border-stone-300 flex flex-col gap-2">
                {row.techniques.map((tech, techIndex) => {
                  const trackNumber = `${String.fromCharCode(65 + rowIndex)}${techIndex + 1}`;
                  return (
                    <button
                      key={tech.id}
                      onClick={() => setActiveTechnique(tech)}
                      className="group flex items-center justify-between p-3 rounded hover:bg-red-50 transition-colors border-b-2 border-stone-100 last:border-0 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className="bg-stone-200 text-stone-700 font-black px-2 py-1 rounded text-sm group-hover:bg-red-600 group-hover:text-white transition-colors">
                          {trackNumber}
                        </span>
                        <div>
                          <div className="font-bold text-stone-900 group-hover:text-red-700">{tech.name}</div>
                          <div className="text-xs text-stone-500 font-bold truncate max-w-[200px]">{tech.tagline}</div>
                        </div>
                      </div>
                      <Disc3 size={20} className="text-stone-300 group-hover:text-red-500 group-hover:animate-spin" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
