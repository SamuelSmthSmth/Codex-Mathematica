import re

with open("src/themes/ThemeDefault.tsx", "r") as f:
    content = f.read()

# 1. Replace AppView
app_view_regex = re.compile(r'type AppView =.*?;\n', re.DOTALL)
new_app_view = """type AppView =
  | { screen: "shelf" }
  | { screen: "chapters"; volume: Volume }
  | { screen: "book-reader"; volume: Volume; chapterIndex: number; fragmentIndex: number }
  | { screen: "chapter-end"; volume: Volume; chapterIndex: number };
"""
content = app_view_regex.sub(new_app_view, content, count=1)

# 2. Extract out the blocks from VIEW 2 down to the end of the file.
# The comment "// ─────────────────────────────────────────────────────────────────────────────\n// VIEW 2" 
# starts the section we want to replace.
split_point = content.find("// ─────────────────────────────────────────────────────────────────────────────\n// VIEW 2")
if split_point == -1:
    print("Could not find VIEW 2 split point")
    exit(1)

head = content[:split_point]

new_views = """// ─────────────────────────────────────────────────────────────────────────────
// VIEW 2 — Table of Contents (ChapterTOC)
// ─────────────────────────────────────────────────────────────────────────────

function ChapterTOC({ volume, onSelectChapter, onClose }: { volume: Volume; onSelectChapter: (idx: number) => void; onClose: () => void }) {
  const { isLightMode } = useTheme();
  return (
    <SceneBackground volume={volume}>
      <nav className="w-full max-w-2xl z-10 mb-6"><BackButton onClick={onClose} label="Return to the Archive" /></nav>
      <div className="w-full max-w-2xl z-10 flex-1 flex flex-col items-center">
        <div 
          className="w-full rounded-[2px_12px_12px_2px] relative overflow-hidden transition-all duration-700 p-10 md:p-16"
          style={{
            background: isLightMode 
              ? `linear-gradient(160deg, #ffffff 0%, ${volume.leather}10 35%, #fcfaf7 100%)`
              : `linear-gradient(160deg, ${lightenHex(volume.leather, 8)} 0%, ${volume.leather} 45%, ${lightenHex(volume.leather, -12)} 100%)`,
            border: `1px solid ${volume.accent}30`,
            boxShadow: isLightMode ? "0 10px 40px rgba(0,0,0,0.08)" : "0 25px 60px rgba(0,0,0,0.8), inset 2px 0 10px rgba(255,255,255,0.05)",
          }}
        >
          {/* Book Spine Edge */}
          <div className="absolute top-0 bottom-0 left-0 w-8" style={{ background: isLightMode ? "linear-gradient(to right, rgba(0,0,0,0.1), transparent)" : "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.1))", borderRight: `1px solid ${volume.accent}20` }} />
          
          <header className="relative z-10 text-center mb-16 mt-4">
            <div className="mb-4 leading-none select-none mx-auto flex justify-center" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "4.5rem", color: volume.accent, textShadow: `0 0 40px ${volume.accent}50` }}>
              {volume.symbol}
            </div>
            <div className="flex items-center justify-center gap-4 mb-5">
               <div className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${volume.accent})` }} />
               <p className="uppercase tracking-[0.25em]" style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: isLightMode ? "#78716c" : "rgba(220,200,160,0.7)" }}>Volume {volume.name}</p>
               <div className="w-12 h-px" style={{ background: `linear-gradient(to left, transparent, ${volume.accent})` }} />
            </div>
            <h2 className="font-light" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "2.8rem", letterSpacing: "0.05em", color: isLightMode ? "#292524" : "#f5ebd7" }}>
              {volume.subtitle}
            </h2>
            <div className="mt-8 mx-auto w-full max-w-[280px]"><GoldRule color={volume.accent} /></div>
          </header>
          
          <main className="relative z-10 max-w-lg mx-auto">
            <div className="flex flex-col gap-3">
              {volume.chapters.map((chapter, idx) => (
                <ChapterTOCRow key={idx} chapter={chapter} index={idx} volume={volume} onSelect={() => onSelectChapter(idx)} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </SceneBackground>
  );
}

function ChapterTOCRow({ chapter, index, volume, onSelect }: { chapter: Chapter; index: number; volume: Volume; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const { isLightMode } = useTheme();
  const { getGrimoireGrade } = useProgress();

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full text-left group focus:outline-none"
    >
      <div className="flex items-center justify-between py-3">
        <div className="flex flex-col">
           <p className="uppercase tracking-widest transition-colors duration-300" style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", color: hovered ? volume.accent : (isLightMode ? "#78716c" : "rgba(200,180,140,0.6)") }}>CHAPTER {toRoman(index)}</p>
           <p className="mt-1 transition-colors duration-300" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "1.15rem", color: hovered ? (isLightMode ? "#1c1917" : "#fff") : (isLightMode ? "#44403c" : "rgba(220,210,190,0.9)") }}>{chapter.theme}</p>
        </div>
        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
           {chapter.fragments.map(frag => {
             const grade = getGrimoireGrade(frag.id);
             const indicator = grade ? GRADE_INDICATOR[grade] : { bg: isLightMode ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)", shadow: "none" };
             return (
               <div key={frag.id} style={{ width: "6px", height: "6px", borderRadius: "50%", background: indicator.bg, boxShadow: indicator.shadow }} />
             );
           })}
        </div>
      </div>
      <div className="w-full h-px opacity-30 mt-2" style={{ background: `linear-gradient(to right, ${volume.accent}, transparent)` }} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 3 — Book Reader
// ─────────────────────────────────────────────────────────────────────────────

const GRADE_INDICATOR: Record<SelfGrade, { bg: string; shadow: string }> = {
  correct: { bg: "rgba(110,200,80,0.8)",  shadow: "0 0 6px rgba(110,200,80,0.6), 0 0 14px rgba(80,180,50,0.3)" },
  close:   { bg: "rgba(200,160,50,0.75)", shadow: "0 0 6px rgba(200,150,40,0.55), 0 0 12px rgba(180,130,30,0.25)" },
  wrong:   { bg: "rgba(200,80,60,0.55)",  shadow: "0 0 6px rgba(180,60,40,0.4), 0 0 10px rgba(160,40,20,0.15)" },
};

function BookReader({ volume, chapterIndex, initialFragmentIndex, onBack, onComplete }: { volume: Volume; chapterIndex: number; initialFragmentIndex: number; onBack: () => void; onComplete: () => void; }) {
  const chapter = volume.chapters[chapterIndex];
  const [currentIndex, setCurrentIndex] = useState(initialFragmentIndex);
  const [animState, setAnimState] = useState<{ type: 'next' | 'prev', fromIndex: number, toIndex: number } | null>(null);
  const { isLightMode } = useTheme();
  const { getGrimoireGrade } = useProgress();

  const handleNext = () => {
    if (animState) return;
    if (currentIndex < chapter.fragments.length - 1) {
      setAnimState({ type: 'next', fromIndex: currentIndex, toIndex: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => setAnimState(null), 400);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (animState) return;
    if (currentIndex > 0) {
      setAnimState({ type: 'prev', fromIndex: currentIndex, toIndex: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
      setTimeout(() => setAnimState(null), 400);
    } else {
      onBack();
    }
  };

  const handleJump = (index: number) => {
    if (animState || index === currentIndex) return;
    setCurrentIndex(index);
  }

  const pagesToRender = [];
  if (animState) {
     pagesToRender.push({ index: animState.fromIndex, animClass: animState.type === 'next' ? 'anim-page-next-out' : 'anim-page-prev-out' });
     pagesToRender.push({ index: animState.toIndex, animClass: animState.type === 'next' ? 'anim-page-next-in' : 'anim-page-prev-in' });
  } else {
     pagesToRender.push({ index: currentIndex, animClass: '' });
  }

  return (
    <SceneBackground volume={volume}>
      <nav className="w-full max-w-3xl z-10 flex items-center justify-between mb-4">
        <BackButton onClick={onBack} label="Back to Contents" />
        <p className="text-right uppercase tracking-[0.2em] truncate" style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem", color: volume.accent, opacity: 0.7 }}>
          Fragment {currentIndex + 1} of {chapter.fragments.length}
        </p>
      </nav>

      <div className="w-full max-w-3xl flex-1 flex flex-col relative book-perspective z-10">
         <div className="flex-1 relative w-full h-full">
            {pagesToRender.map(({ index, animClass }) => (
               <div key={index} className={`absolute inset-0 w-full h-full page-turn-wrapper ${animClass}`} style={{ backfaceVisibility: "hidden" }}>
                  <FragmentPage volume={volume} chapterIndex={chapterIndex} fragment={chapter.fragments[index]} />
               </div>
            ))}
         </div>
         
         {/* Footer / Pagination */}
         <div className="flex-shrink-0 flex items-center justify-between py-6 px-4 h-20">
            <button onClick={handlePrev} className="text-stone-500 hover:text-amber-200 transition-colors uppercase tracking-widest text-[0.6rem] flex items-center gap-1 font-serif"><ArrowLeft size={12}/> Prev</button>
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[60%]">
               {chapter.fragments.map((frag, idx) => {
                 const grade = getGrimoireGrade(frag.id);
                 const indicator = grade ? GRADE_INDICATOR[grade] : { bg: isLightMode ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)", shadow: "none" };
                 const isActive = idx === currentIndex;
                 return (
                   <button 
                     key={frag.id} 
                     onClick={() => handleJump(idx)}
                     className="rounded-full transition-all hover:scale-125 focus:outline-none"
                     title={`Fragment ${frag.id}`}
                     style={{ 
                       width: "7px", height: "7px", 
                       background: indicator.bg, 
                       boxShadow: isActive ? `0 0 0 1.5px ${volume.accent}` : indicator.shadow,
                       opacity: isActive ? 1 : 0.6
                     }} 
                   />
                 );
               })}
            </div>
            <button onClick={handleNext} className="text-stone-500 hover:text-amber-200 transition-colors uppercase tracking-widest text-[0.6rem] flex items-center gap-1 font-serif">Next <ChevronRight size={12}/></button>
         </div>
      </div>
    </SceneBackground>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fragment Page (Parchment Desk Replacement)
// ─────────────────────────────────────────────────────────────────────────────

const GRADE_OPTIONS: { grade: SelfGrade; label: string; icon: React.ReactNode; style: React.CSSProperties }[] = [
  { grade: "correct", label: "Correct", icon: <CheckCheck size={14} strokeWidth={2.2} />, style: { color: "rgba(130,200,100,0.9)", background: "rgba(80,180,50,0.08)", border: "1px solid rgba(80,180,50,0.3)" } },
  { grade: "close", label: "Close", icon: <Minus size={14} strokeWidth={2.2} />, style: { color: "rgba(200,170,80,0.9)", background: "rgba(200,150,40,0.08)", border: "1px solid rgba(200,150,40,0.3)" } },
  { grade: "wrong", label: "Incorrect", icon: <RotateCcw size={14} strokeWidth={2} />, style: { color: "rgba(200,100,80,0.85)", background: "rgba(180,70,50,0.06)", border: "1px solid rgba(180,70,50,0.25)" } },
];

const CREDIT_MAP: Record<SelfGrade, number> = { correct: 100, close: 50, wrong: 0 };

function FragmentPage({ volume, chapterIndex, fragment }: { volume: Volume; chapterIndex: number; fragment: Fragment; }) {
  const { isLightMode, activeAnimation } = useTheme();
  
  const revealClass = (() => {
    switch (activeAnimation) {
      case "anim-typewriter": return "reveal-typewriter";
      case "anim-cipher":     return "reveal-cipher";
      case "anim-receipt":    return "reveal-receipt";
      default:                return "";
    }
  })();
  const revealStyle = revealClass ? {} : { animation: "inkwell-unfurl 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards" };

  const { gradePhase, setGradePhase, chosenGrade, isAlreadyConquered, handleGrade, handleRetry } = useWorkspaceLogic({ volume, chapterIndex, fragment });

  return (
     <article className="w-full h-full relative flex flex-col rounded-[2px_12px_12px_2px] overflow-hidden transition-all duration-500" style={{ background: isLightMode ? "#fcfaf7" : "#0c0a08", border: isLightMode ? "1px solid #e5e7eb" : "1px solid #292524", boxShadow: isLightMode ? "0 4px 12px rgba(0,0,0,0.03)" : "0 20px 40px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02)" }}>
       {/* Textures */}
       <div className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.05] z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat" }} aria-hidden="true" />
       <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-6 z-10" style={{ background: isLightMode ? "linear-gradient(to right, rgba(0,0,0,0.05), transparent)" : "linear-gradient(to right, rgba(0,0,0,0.4), transparent)", borderRight: `1px solid ${volume.accent}10` }} />
       
       <div className="relative z-10 flex-1 overflow-y-auto px-8 md:px-16 py-12" style={{ scrollbarWidth: "none" }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-light" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "1.4rem", color: isLightMode ? "#292524" : "#e8d5a3" }}>
               CHAPTER {toRoman(chapterIndex)} &middot; <span style={{ color: volume.accent }}>{volume.chapters[chapterIndex].theme}</span>
             </h3>
             <span className="font-serif text-xl text-stone-700/40">&sect; {pad3(fragment.id)}</span>
          </div>
          <GoldRule />
          
          {/* Problem */}
          <section className="mt-12 mb-10 flex flex-col items-center" aria-label="Mathematical problem">
            <p className="uppercase tracking-[0.4em] mb-6 text-stone-500/80" style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem" }}>Problem</p>
            <div className={`w-full max-w-xl py-14 px-8 text-center border rounded-sm transition-colors duration-300 ${isLightMode ? "bg-white border-stone-200" : "bg-black/40 border-stone-800/80"}`} style={{ boxShadow: isLightMode ? "0 4px 15px rgba(0,0,0,0.02)" : "inset 0 4px 20px rgba(0,0,0,0.2)" }}>
              <MathRenderer className="[&_.katex]:text-[2.2rem] [&_.katex-display]:my-0 text-stone-200">{`$$\n${fragment.problem_latex}\n$$`}</MathRenderer>
            </div>
          </section>

          {/* Reveal & Answer */}
          <section className="flex flex-col items-center w-full max-w-xl mx-auto" aria-label="Answer reveal and grading">
            {gradePhase === "problem" && (
              <div className="my-8">
                <button
                  onClick={() => setGradePhase("revealed")}
                  className="group flex items-center gap-2.5 px-8 py-3.5 text-xs uppercase tracking-[0.22em] transition-all duration-200 active:scale-95"
                  style={{ fontFamily: "Georgia, serif", background: isLightMode ? "linear-gradient(135deg, #ffffff 0%, #f4f0ea 100%)" : "linear-gradient(135deg, #1a1208 0%, #0f0c06 100%)", border: isLightMode ? "1px solid rgba(200,146,42,0.5)" : "1px solid rgba(200,146,42,0.3)", borderRadius: "2px", color: isLightMode ? "#966812" : "rgba(200,146,42,0.9)", boxShadow: isLightMode ? "0 2px 5px rgba(0,0,0,0.05)" : "0 0 20px rgba(200,146,42,0.08), inset 0 1px 0 rgba(255,220,100,0.06)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = isLightMode ? "#44403c" : "rgba(220,175,80,0.95)"; e.currentTarget.style.borderColor = "rgba(200,146,42,0.6)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = isLightMode ? "#966812" : "rgba(200,146,42,0.9)"; e.currentTarget.style.borderColor = isLightMode ? "rgba(200,146,42,0.5)" : "rgba(200,146,42,0.3)"; }}
                >
                  <BookMarked size={14} strokeWidth={1.8} /> Reveal Answer
                </button>
              </div>
            )}

            {(gradePhase === "revealed" || gradePhase === "graded") && (
              <div className={`w-full overflow-hidden ${revealClass}`} style={revealStyle}>
                <div className="flex items-center gap-3 mb-6 mt-4">
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(200,146,42,0.25))" }} />
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", letterSpacing: "0.32em", color: "rgba(200,146,42,0.6)", textTransform: "uppercase" }}>The Solution</p>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(200,146,42,0.25))" }} />
                </div>
                <div className="w-full py-10 px-8 text-center mb-8" style={{ background: isLightMode ? "linear-gradient(160deg, #ffffff 0%, #f4f0ea 100%)" : "linear-gradient(160deg, #110e09 0%, #0c0a07 100%)", border: isLightMode ? "1px solid #d1d5db" : "1px solid rgba(200,146,42,0.18)", borderRadius: "2px", boxShadow: isLightMode ? "0 2px 5px rgba(0,0,0,0.05)" : "0 0 40px rgba(200,146,42,0.04), inset 0 1px 0 rgba(200,146,42,0.06)" }}>
                  <MathRenderer className="[&_.katex]:text-3xl text-amber-100/85 [&_.katex-display]:my-0">{`$$${fragment.solution_latex}$$`}</MathRenderer>
                  <p className="mt-4" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "0.68rem", color: "rgba(150,130,90,0.45)", letterSpacing: "0.05em" }}>{fragment.solution_latex}</p>
                </div>

                {gradePhase === "revealed" && (
                  <div className="flex flex-col items-center gap-5 pb-10">
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: isLightMode ? "#78716c" : "rgba(168,155,128,0.65)", letterSpacing: "0.05em" }}>Did you get this right?</p>
                    <div className="flex items-center gap-3">
                      {GRADE_OPTIONS.map(({ grade, label, icon, style }) => (
                        <button key={grade} onClick={() => handleGrade(grade)} className="flex items-center gap-2 px-6 py-3 rounded-sm uppercase tracking-widest transition-all duration-150 hover:-translate-y-0.5 active:scale-95" style={{ fontFamily: "Georgia, serif", fontSize: "0.65rem", letterSpacing: "0.15em", ...style }}>
                          {icon}{label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {gradePhase === "graded" && chosenGrade !== null && (
                  <div className="flex flex-col items-center gap-4 pb-10" style={{ animation: "inkwell-unfurl 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}>
                    <div className="flex items-center gap-3 px-8 py-4 rounded-sm" style={{ ...(GRADE_OPTIONS.find((g) => g.grade === chosenGrade)?.style ?? {}) }}>
                      {GRADE_OPTIONS.find((g) => g.grade === chosenGrade)?.icon}
                      <span style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                        {chosenGrade === "correct" ? "Fragment Conquered" : chosenGrade === "close" ? "Partial Credit" : "Needs More Work"}
                      </span>
                    </div>
                    {!isAlreadyConquered && CREDIT_MAP[chosenGrade] > 0 && (
                      <p className="tracking-widest uppercase" style={{ fontFamily: "'Courier New', monospace", fontSize: "0.75rem", color: "rgba(200,146,42,0.8)" }}>+{CREDIT_MAP[chosenGrade].toLocaleString()} Credits</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {!isAlreadyConquered && (
                        <button onClick={() => setGradePhase("revealed")} className="flex items-center gap-2 px-5 py-2.5 rounded-sm uppercase tracking-widest transition-all duration-150 hover:bg-white/5" style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: isLightMode ? "#78716c" : "rgba(150,138,115,0.8)", background: "transparent", border: isLightMode ? "1px solid #e5e7eb" : "1px solid rgba(80,75,65,0.8)" }}>Re-grade</button>
                      )}
                      <button onClick={handleRetry} className="flex items-center gap-2 px-5 py-2.5 rounded-sm uppercase tracking-widest transition-all duration-150 hover:bg-white/5" style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: isLightMode ? "#78716c" : "rgba(150,138,115,0.8)", background: "transparent", border: isLightMode ? "1px solid #e5e7eb" : "1px solid rgba(80,75,65,0.8)" }}>
                        <RotateCcw size={13} strokeWidth={2} />Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
       </div>
       <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24 z-10" style={{ background: isLightMode ? "linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 100%)" : "linear-gradient(to top, rgba(12,10,8,0.95) 0%, transparent 100%)" }} aria-hidden="true" />
     </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW 4 — Chapter End Card
// ─────────────────────────────────────────────────────────────────────────────

function ChapterEndCard({ volume, chapterIndex, onNext, onBack }: { volume: Volume; chapterIndex: number; onNext: () => void; onBack: () => void; }) {
  const chapter = volume.chapters[chapterIndex];
  const { isLightMode } = useTheme();
  const { getGrimoireGrade } = useProgress();
  
  let correct = 0, close = 0, wrong = 0, unseen = 0;
  chapter.fragments.forEach(frag => {
     const g = getGrimoireGrade(frag.id);
     if (g === 'correct') correct++;
     else if (g === 'close') close++;
     else if (g === 'wrong') wrong++;
     else unseen++;
  });

  return (
    <SceneBackground volume={volume}>
      <nav className="w-full max-w-2xl z-10 mb-6"><BackButton onClick={onBack} label="Back to Contents" /></nav>
      <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center z-10">
         <div className="text-center mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 leading-none select-none mx-auto flex justify-center" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "5rem", color: volume.accent, textShadow: `0 0 50px ${volume.accent}60` }}>
              {volume.symbol}
            </div>
            <p className="uppercase tracking-[0.4em] mb-4 text-amber-200/60" style={{ fontFamily: "Georgia, serif", fontSize: "0.75rem" }}>Chapter {toRoman(chapterIndex)} Completed</p>
            <h2 className="font-light mb-8" style={{ fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif", fontSize: "2.5rem", color: isLightMode ? "#292524" : "#f5ebd7" }}>
              {chapter.theme}
            </h2>
            <GoldRule color={volume.accent} />
         </div>

         <div className="w-full max-w-md rounded-sm p-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150" style={{ background: isLightMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.2)", border: isLightMode ? "1px solid #d1d5db" : "1px solid rgba(80,75,65,0.5)", backdropFilter: "blur(4px)" }}>
            <p className="text-center uppercase tracking-widest mb-6 text-xs font-serif" style={{ color: isLightMode ? "#78716c" : "#78716c" }}>Performance</p>
            
            <div className="w-full h-2 rounded-full overflow-hidden flex mb-6" style={{ background: isLightMode ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)" }}>
               {correct > 0 && <div style={{ width: `${(correct/chapter.fragments.length)*100}%`, background: "rgba(110,200,80,0.8)" }} />}
               {close > 0 && <div style={{ width: `${(close/chapter.fragments.length)*100}%`, background: "rgba(200,160,50,0.8)" }} />}
               {wrong > 0 && <div style={{ width: `${(wrong/chapter.fragments.length)*100}%`, background: "rgba(200,80,60,0.8)" }} />}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center font-serif text-sm">
               <div>
                  <p style={{ color: "rgba(110,200,80,0.9)" }} className="text-2xl mb-1">{correct}</p>
                  <p className="uppercase tracking-widest text-[0.55rem]" style={{ color: isLightMode ? "#a8a29e" : "#57534e" }}>Conquered</p>
               </div>
               <div>
                  <p style={{ color: "rgba(200,160,50,0.9)" }} className="text-2xl mb-1">{close}</p>
                  <p className="uppercase tracking-widest text-[0.55rem]" style={{ color: isLightMode ? "#a8a29e" : "#57534e" }}>Close</p>
               </div>
               <div>
                  <p style={{ color: "rgba(200,80,60,0.9)" }} className="text-2xl mb-1">{wrong}</p>
                  <p className="uppercase tracking-widest text-[0.55rem]" style={{ color: isLightMode ? "#a8a29e" : "#57534e" }}>Wrong</p>
               </div>
            </div>
         </div>

         <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700 delay-300">
            {chapterIndex < volume.chapters.length - 1 && (
               <button onClick={onNext} className="group uppercase tracking-widest text-xs font-serif flex items-center gap-2 px-8 py-4 rounded-sm transition-all duration-300 hover:scale-105" style={{ background: `${volume.accent}15`, border: `1px solid ${volume.accent}50`, color: volume.accent, boxShadow: `0 0 20px ${volume.accent}10, inset 0 0 10px ${volume.accent}05` }}>
                  Proceed to Chapter {toRoman(chapterIndex + 1)} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </button>
            )}
            {chapterIndex === volume.chapters.length - 1 && (
               <div className="uppercase tracking-[0.25em] text-sm font-serif" style={{ color: volume.accent }}>
                  Volume Complete
               </div>
            )}
         </div>
      </div>
    </SceneBackground>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared micro-components
// ─────────────────────────────────────────────────────────────────────────────

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 transition-colors duration-200"
      style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", letterSpacing: "0.12em", color: "rgba(150,130,90,0.55)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(210,190,140,0.9)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(150,130,90,0.55)")}
    >
      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={1.8} />
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export Theme Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ThemeDefault() {
  const [view, setView] = useState<AppView>({ screen: "shelf" });

  const openVolume = useCallback((volume: Volume) => {
    setView({ screen: "chapters", volume });
  }, []);

  const openChapter = useCallback((volume: Volume, chapterIndex: number) => {
    setView({ screen: "book-reader", volume, chapterIndex, fragmentIndex: 0 });
  }, []);

  const goToShelf = useCallback(() => setView({ screen: "shelf" }), []);
  const goToChapters = useCallback((volume: Volume) => setView({ screen: "chapters", volume }), []);
  const goToChapterEnd = useCallback((volume: Volume, chapterIndex: number) => setView({ screen: "chapter-end", volume, chapterIndex }), []);

  if (view.screen === "shelf") return <LibraryShelf onSelect={openVolume} />;
  if (view.screen === "chapters") return <ChapterTOC volume={view.volume} onSelectChapter={(idx) => openChapter(view.volume, idx)} onClose={goToShelf} />;
  
  if (view.screen === "book-reader") {
    return (
      <BookReader 
        volume={view.volume} 
        chapterIndex={view.chapterIndex} 
        initialFragmentIndex={view.fragmentIndex}
        onBack={() => goToChapters(view.volume)}
        onComplete={() => goToChapterEnd(view.volume, view.chapterIndex)}
      />
    );
  }

  if (view.screen === "chapter-end") {
    return (
      <ChapterEndCard 
        volume={view.volume} 
        chapterIndex={view.chapterIndex} 
        onBack={() => goToChapters(view.volume)}
        onNext={() => openChapter(view.volume, view.chapterIndex + 1)}
      />
    );
  }

  return null;
}
"""

content = head + new_views

with open("src/themes/ThemeDefault.tsx", "w") as f:
    f.write(content)

