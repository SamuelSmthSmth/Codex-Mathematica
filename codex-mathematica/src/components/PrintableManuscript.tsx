"use client";

import { useTheme } from "@/context/ThemeContext";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { VOLUMES } from "@/data/codex-data";

const VOLUME_TOTALS: Record<string, number> = {
  alpha: 150,
  beta: 150,
  gamma: 150,
  delta: 150,
  epsilon: 150,
  zeta: 150,
  sigma: 150,
  omega: 150,
};

const GREEK_SYMBOLS: Record<string, string> = {
  alpha: "α",
  beta: "β",
  gamma: "Γ",
  delta: "Δ",
  epsilon: "ε",
  zeta: "ζ",
  sigma: "Σ",
  omega: "Ω",
};

export default function PrintableManuscript() {
  const { printData } = useTheme();

  if (!printData) return null;

  return (
    <div className="hidden print:block w-full text-black bg-white font-serif relative z-[9999]">
      
      {/* Page 1: Title Page */}
      <div className="h-screen flex flex-col justify-center items-center" style={{ pageBreakAfter: "always" }}>
        <h1 
          className="text-6xl font-light mb-6 text-center" 
          style={{ fontFamily: "var(--font-playfair), 'EB Garamond', 'Palatino Linotype', Palatino, serif" }}
        >
          The Grimoire of {printData.scholarName || "Unknown Scholar"}
        </h1>
        <div className="border-t-2 border-[#8b0000] w-24 mb-6"></div>
        <p className="text-2xl text-stone-600 tracking-widest uppercase mb-12">
          Codex Mathematica
        </p>
        <p className="text-sm text-stone-400 mt-auto mb-16 italic">
          Typeset on {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Page 2: Contents & Mastery */}
      <div className="py-10" style={{ pageBreakAfter: "always" }}>
        <h2 className="text-3xl border-b border-stone-300 pb-2 mb-8 uppercase tracking-widest">
          Mastery by Volume
        </h2>
        <div className="flex flex-col gap-4 mb-16">
          {Object.entries(printData.mastery).map(([vol, count]) => {
            const total = VOLUME_TOTALS[vol.toLowerCase()] || 150;
            return (
              <div key={vol} className="flex justify-between items-center text-lg">
                <span className="uppercase tracking-wider">Volume {vol}</span>
                <span className="font-bold text-stone-500">{count} / {total}</span>
              </div>
            );
          })}
        </div>

        <h2 className="text-3xl border-b border-stone-300 pb-2 mb-8 uppercase tracking-widest">
          Table of Contents
        </h2>
        <div className="flex flex-col gap-2">
          {printData.proofs.map((p, idx) => (
            <a key={idx} href={`#fragment-${p.volume}-${p.fragment_id}`} className="flex text-sm text-stone-700 hover:text-stone-900 decoration-stone-300">
              <span className="uppercase w-32">Vol {p.volume}</span>
              <span className="w-32">Chapter {p.chapter}</span>
              <span>Fragment {p.fragment_id}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Group proofs by volume */}
      {Object.entries(printData.mastery).map(([vol]) => {
        const volumeProofs = printData.proofs.filter(p => p.volume === vol);
        const volData = VOLUMES.find(v => v.id.toLowerCase() === vol.toLowerCase());
        
        return (
          <div key={vol}>
            {/* Divider Page */}
            <div className="h-screen flex flex-col items-center pt-32 relative overflow-hidden" style={{ pageBreakAfter: "always" }}>
              {/* Massive faded Greek watermark */}
              <div 
                className="absolute text-[40rem] font-serif font-bold opacity-20 select-none z-0"
                style={{ 
                  left: "-10%",
                  color: volData?.accent || "#d6d3d1",
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 80%)"
                }}
              >
                {GREEK_SYMBOLS[vol.toLowerCase()] || vol[0].toUpperCase()}
              </div>
              <h1 className="text-7xl tracking-[0.5em] uppercase z-10 font-light mt-24">
                Volume {vol}
              </h1>
            </div>

            {/* Proofs for this volume */}
            <div className="py-10">
              {volumeProofs.map((p, idx) => {
                const chapterData = volData?.chapters[p.chapter - 1];
                const fragmentData = chapterData?.fragments.find(f => f.id === p.fragment_id);

                return (
                  <div key={idx} id={`fragment-${p.volume}-${p.fragment_id}`} className="mb-20" style={{ pageBreakInside: "avoid" }}>
                    <h3 className="text-2xl font-bold uppercase tracking-widest mb-4 border-b-2 border-stone-200 pb-2 text-stone-800">
                      Chapter {p.chapter} <span className="text-stone-300 mx-2">|</span> Fragment {p.fragment_id}
                    </h3>
                    
                    {fragmentData && (
                      <div className="mb-6">
                        <div className="bg-stone-50 border border-stone-300 p-6 rounded-md mb-4 text-stone-900">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {fragmentData.problem_raw}
                          </ReactMarkdown>
                        </div>
                        <div className="italic text-stone-500 font-serif text-sm px-2">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {fragmentData.solution_raw}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}

                    <hr className="my-8 border-stone-200 w-1/3 mx-auto" />

                    <div className="text-lg leading-relaxed prose prose-stone max-w-none prose-p:my-4 font-serif">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {p.proof_markdown}
                      </ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      
    </div>
  );
}
