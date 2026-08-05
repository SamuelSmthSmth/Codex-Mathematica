// @ts-nocheck
"use client";

import React from "react";
import { useLibraryLogic } from "@/hooks/useLibraryLogic";
import LibraryArticle from "@/components/LibraryArticle";
import { Search, Book, ChevronRight, X } from "lucide-react";

export default function LibraryViewModernDesktop() {
  const {
    searchQuery,
    setSearchQuery,
    filteredTechniques,
    activeTechnique,
    setActiveTechnique,
  } = useLibraryLogic();

  if (activeTechnique) {
    return (
      <div className="h-full w-full bg-[#1e1e1e] text-slate-200 overflow-y-auto relative">
        <div className="sticky top-0 left-0 right-0 h-14 bg-[#2a2a2a]/80 backdrop-blur-md border-b border-white/10 flex items-center px-6 z-10">
          <button
            onClick={() => setActiveTechnique(null)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Library</span>
          </button>
        </div>
        <div className="p-8 max-w-4xl mx-auto">
          <LibraryArticle technique={activeTechnique} onBack={() => setActiveTechnique(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#1e1e1e]/90 text-slate-200 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-[#1e1e1e]/80 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-6">
        <h1 className="text-3xl font-semibold text-white tracking-tight">Techniques</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Library..."
            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="p-6">
        {filteredTechniques.length === 0 ? (
          <div className="text-center text-slate-500 mt-20">No techniques found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredTechniques.map((tech) => (
              <div
                key={tech.id}
                onClick={() => setActiveTechnique(tech)}
                className="group flex flex-col gap-3 cursor-pointer"
              >
                <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-white/10 shadow-lg group-hover:shadow-xl group-hover:scale-105 group-hover:border-white/20 transition-all duration-300 flex flex-col p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Book className="w-24 h-24" />
                  </div>
                  <div className="mt-auto z-10 flex flex-col gap-1">
                    <div className="w-8 h-1 bg-blue-500/50 rounded-full mb-2" />
                    <span className="text-xs text-blue-400 font-medium">{tech.category}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <h3 className="text-sm font-medium text-slate-200 group-hover:text-white line-clamp-2 leading-tight">
                    {tech.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
