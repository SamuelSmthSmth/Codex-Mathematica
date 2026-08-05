// @ts-nocheck
import React from "react";
import { useLibraryLogic } from "@/hooks/useLibraryLogic";
import LibraryArticle from "./LibraryArticle";
import { Disc3, Search } from "lucide-react";

export default function LibraryViewMixtape() {
  const { activeTechnique, setActiveTechnique, todaysTechnique, TECHNIQUE_ROWS } = useLibraryLogic();

  if (activeTechnique) {
    return <LibraryArticle technique={activeTechnique} onBack={() => setActiveTechnique(null)} />;
  }

  return (
    <div className="h-full overflow-y-auto bg-stone-900 text-stone-300 p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 border-b-4 border-stone-700 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-pink-500 tracking-tighter uppercase drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
              The Tape Rack
            </h1>
            <p className="text-stone-400 mt-2 text-sm uppercase tracking-widest flex items-center gap-2">
              <Search size={14} /> Dusty cassettes & hidden techniques
            </p>
          </div>
          <Disc3 size={48} className="text-stone-700 animate-[spin_10s_linear_infinite]" />
        </header>

        {/* Hero / Technique of the Day */}
        <section className="mb-12 bg-stone-800 border-2 border-stone-700 p-6 rounded relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-pink-500 text-stone-900 font-bold px-3 py-1 text-xs uppercase transform translate-x-2 -translate-y-1 z-10 shadow-sm">
            Now Playing
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">{todaysTechnique.name}</h2>
          <p className="text-stone-400 mb-6 text-sm relative z-10">{todaysTechnique.tagline}</p>
          <button 
            onClick={() => setActiveTechnique(todaysTechnique)}
            className="relative z-10 bg-pink-500 text-stone-900 font-bold px-6 py-2 uppercase tracking-widest hover:bg-pink-400 active:scale-95 transition-all shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            Play Tape
          </button>
          
          <div className="absolute bottom-0 right-4 opacity-5 text-9xl font-black pointer-events-none transform translate-y-4">
            A
          </div>
        </section>

        {/* The Cardboard Box / Rack */}
        <div className="bg-stone-800/30 border-4 border-dashed border-stone-700 p-6 sm:p-8 rounded-lg relative">
          <div className="absolute top-0 left-4 -translate-y-1/2 bg-stone-900 px-2 text-stone-500 font-bold tracking-widest text-sm uppercase">
            Cardboard Box
          </div>
          {TECHNIQUE_ROWS.map((row) => (
            <div key={row.id} className="mb-10 last:mb-0">
              <h3 className="text-xl font-bold text-pink-400 mb-6 border-b border-stone-700 pb-2 inline-block">
                [{row.title.toUpperCase()}]
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {row.techniques.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => setActiveTechnique(tech)}
                    className="group relative bg-stone-900 border-2 border-stone-700 p-4 text-left hover:border-pink-500 transition-colors h-32 flex flex-col justify-between hover:-translate-y-1 shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0_rgba(236,72,153,0.2)]"
                  >
                    {/* Cassette Tape Aesthetic */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-stone-950 rounded-full flex justify-between px-1 items-center opacity-50 group-hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-800 group-hover:bg-pink-900"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-800 group-hover:bg-pink-900"></div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-xs text-stone-500 font-bold mb-1 line-clamp-1">MIX-{tech.id.substring(0,4).toUpperCase()}</div>
                      <div className="font-bold text-stone-200 leading-tight group-hover:text-pink-400 transition-colors line-clamp-2">
                        {tech.name}
                      </div>
                    </div>
                    <div className="text-[10px] text-stone-600 uppercase mt-2 line-clamp-1 group-hover:text-stone-400">
                      {tech.tagline}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
