// @ts-nocheck
"use client";

import { useLibraryLogic } from "@/hooks/useLibraryLogic";
import LibraryArticle from "./LibraryArticle";
import { BookOpen, Sparkles } from "lucide-react";
import { Technique } from "@/data/techniques";

export default function LibraryViewScribble() {
  const { activeTechnique, setActiveTechnique, todaysTechnique, TECHNIQUE_ROWS } = useLibraryLogic();

  if (activeTechnique) {
    return (
      <LibraryArticle
        technique={activeTechnique}
        onBack={() => setActiveTechnique(null)}
      />
    );
  }

  return (
    <div className="flex-1 min-h-0 p-4 md:p-8 bg-[#fdf7ee] overflow-y-auto" style={{ fontFamily: "'Caveat', cursive" }}>
      <h1 className="text-5xl font-bold text-stone-800 mb-12 text-center" style={{ transform: "rotate(-2deg)" }}>
        My Messy Desk
      </h1>

      <div className="max-w-5xl mx-auto flex flex-col items-center pb-20">
        
        {/* Today's Technique */}
        <div 
          onClick={() => setActiveTechnique(todaysTechnique)}
          className="w-full max-w-2xl bg-white border-4 border-stone-800 p-6 md:p-8 cursor-pointer hover:scale-[1.02] transition-transform shadow-[8px_8px_0_rgba(0,0,0,0.8)] mb-16 relative group"
          style={{ borderRadius: "4px 12px 6px 8px", transform: "rotate(1deg)" }}
        >
          {/* Binder Rings */}
          <div className="absolute -left-3 top-4 bottom-4 flex flex-col justify-between py-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-8 h-4 rounded-full border-4 border-stone-800 bg-stone-300" />
            ))}
          </div>
          
          <div className="ml-6">
            <div className="flex items-center gap-2 text-[#e88080] mb-2 text-2xl font-bold">
              <Sparkles size={24} />
              <span>Priority Task!</span>
            </div>
            <h2 className="text-4xl font-bold text-stone-900 leading-tight mb-3 group-hover:underline decoration-wavy decoration-[#e88080] underline-offset-4">{todaysTechnique.name}</h2>
            <p className="text-2xl text-stone-600 font-medium leading-relaxed">{todaysTechnique.tagline}</p>
          </div>
        </div>

        {/* Categories / Scattered Notebooks */}
        <div className="w-full space-y-16">
          {TECHNIQUE_ROWS.map((row, rIdx) => (
            <div key={row.id} className="relative">
              <div className="absolute -top-6 left-4 bg-[#ffc0cb] px-4 py-1 border-4 border-stone-800 shadow-[4px_4px_0_rgba(0,0,0,0.8)] z-10" style={{ transform: "rotate(-3deg)", borderRadius: "2px 8px 3px 6px" }}>
                <h3 className="text-2xl font-bold text-stone-900">{row.title}</h3>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 md:gap-10 pt-8 p-4 bg-stone-200/40 border-4 border-stone-800 border-dashed rounded-xl">
                {row.techniques.map((tech, tIdx) => {
                  const rot = rIdx % 2 === 0 ? (tIdx % 2 === 0 ? 3 : -2) : (tIdx % 2 === 0 ? -4 : 2);
                  const bgColors = ["bg-[#c8f0d8]", "bg-[#fff9c4]", "bg-[#ffe0e0]", "bg-[#e0f0ff]"];
                  const bg = bgColors[(rIdx + tIdx) % bgColors.length];
                  
                  return (
                    <div 
                      key={tech.id}
                      onClick={() => setActiveTechnique(tech)}
                      className={`w-64 h-48 ${bg} border-4 border-stone-800 p-5 cursor-pointer hover:scale-110 hover:z-20 transition-transform shadow-[5px_5px_0_rgba(0,0,0,0.8)] flex flex-col justify-between`}
                      style={{
                        transform: `rotate(${rot}deg)`,
                        borderRadius: "2px 8px 3px 6px"
                      }}
                    >
                      <h4 className="text-3xl font-bold text-stone-900 leading-tight">{tech.name}</h4>
                      <div className="flex justify-end">
                        <BookOpen size={28} className="text-stone-800/50" />
                      </div>
                    </div>
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
