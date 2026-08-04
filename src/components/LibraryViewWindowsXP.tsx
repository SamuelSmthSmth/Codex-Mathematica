import React from "react";
import { useLibraryLogic } from "@/hooks/useLibraryLogic";
import LibraryArticle from "@/components/LibraryArticle";

export default function LibraryViewWindowsXP() {
  const { activeTechnique, setActiveTechnique, techniqueRows } = useLibraryLogic();

  if (activeTechnique) {
    return (
      <div className="h-full flex flex-col bg-white font-[Tahoma] text-black">
        <div className="bg-[#ece9d8] border-b border-gray-400 p-1 flex items-center gap-2 text-sm shadow-sm">
          <button 
            onClick={() => setActiveTechnique(null)}
            className="flex items-center gap-1 hover:bg-gray-200 px-2 py-1 border border-transparent hover:border-gray-400 rounded cursor-pointer"
          >
            <span className="text-blue-600 font-bold">←</span> Back
          </button>
          <div className="text-gray-500">|</div>
          <div className="flex-1 truncate font-bold">
            {activeTechnique.title}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <LibraryArticle technique={activeTechnique} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex font-[Tahoma] bg-white overflow-hidden text-black">
      {/* Left pane - Folder tasks */}
      <div className="w-48 bg-gradient-to-b from-[#6699ff] to-[#6699ff] border-r border-gray-400 flex flex-col p-2 gap-4 overflow-y-auto hidden sm:flex h-full">
        <div className="bg-white rounded border border-blue-400 overflow-hidden shadow-sm">
          <div className="bg-blue-200 text-blue-900 font-bold px-2 py-1 text-xs">Folder Tasks</div>
          <div className="p-2 text-xs text-blue-800 flex flex-col gap-1">
            <div className="hover:underline cursor-pointer flex items-center gap-1"><span>📁</span> Make a new folder</div>
            <div className="hover:underline cursor-pointer flex items-center gap-1"><span>🌐</span> Publish this folder</div>
            <div className="hover:underline cursor-pointer flex items-center gap-1"><span>🔗</span> Share this folder</div>
          </div>
        </div>
        <div className="bg-white rounded border border-blue-400 overflow-hidden shadow-sm">
          <div className="bg-blue-200 text-blue-900 font-bold px-2 py-1 text-xs">Other Places</div>
          <div className="p-2 text-xs text-blue-800 flex flex-col gap-1">
            <div className="hover:underline cursor-pointer flex items-center gap-1"><span>🖥️</span> My Computer</div>
            <div className="hover:underline cursor-pointer flex items-center gap-1"><span>🌐</span> My Network Places</div>
          </div>
        </div>
      </div>

      {/* Right pane - Icons */}
      <div className="flex-1 p-4 overflow-y-auto bg-white h-full">
        {techniqueRows.map((row, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-gray-500 text-xs font-bold border-b border-gray-200 pb-1 mb-3">{row.category}</h2>
            <div className="flex flex-wrap gap-4">
              {row.techniques.map((tech) => (
                <div 
                  key={tech.id} 
                  onClick={() => setActiveTechnique(tech)}
                  className="flex flex-col items-center w-24 p-1 hover:bg-blue-100 hover:outline hover:outline-1 hover:outline-blue-300 cursor-pointer rounded transition-colors"
                >
                  <div className="text-4xl mb-1 drop-shadow-sm text-yellow-500">
                    {tech.icon === "Sparkles" ? "📝" : "📁"}
                  </div>
                  <div className="text-black text-xs text-center line-clamp-2 leading-tight select-none">
                    {tech.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
