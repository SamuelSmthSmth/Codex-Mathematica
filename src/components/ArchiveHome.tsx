"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, CircleUserRound, Clock3, Layers3, LockKeyhole, Sparkles } from "lucide-react";
import { useMemo } from "react";
import ArchiveHomeStyles from "@/components/ArchiveHomeStyles";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { VOLUMES, type Volume } from "@/data/codex-data";

function allFragments(volume: Volume) {
  return volume.chapters.flatMap((chapter, chapterIndex) => chapter.fragments.map((fragment) => ({ fragment, chapterIndex })));
}

function findNextFragment(getGrimoireGrade: (fragmentId: number) => string | null) {
  for (const volume of VOLUMES) {
    const open = allFragments(volume).find(({ fragment }) => !getGrimoireGrade(fragment.id));
    if (open) return { ...open, volume };
  }
  const firstVolume = VOLUMES[0];
  const first = firstVolume && allFragments(firstVolume)[0];
  return first ? { ...first, volume: firstVolume } : null;
}

function ArchiveMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="quiet-archive-metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

export default function ArchiveHome() {
  const { scholar, isGuestMode } = useAuth();
  const { credits, grimoire, solvedPerVolume, ownedItems, getGrimoireGrade } = useProgress();
  const next = useMemo(() => findNextFragment(getGrimoireGrade), [getGrimoireGrade]);
  const totalFragments = useMemo(() => VOLUMES.reduce((sum, volume) => sum + allFragments(volume).length, 0), []);
  const visited = Object.keys(grimoire).length;
  const completion = totalFragments ? Math.round((visited / totalFragments) * 100) : 0;
  const sessionLabel = scholar ? "Scholar" : isGuestMode ? "Guest" : "Preview";

  return (
    <main className="quiet-archive-page">
      <ArchiveHomeStyles />
      <div className="quiet-archive-backdrop" aria-hidden="true" />
      <header className="quiet-archive-header">
        <Link href="/" className="quiet-archive-wordmark" aria-label="Codex Mathematica home"><span>∑</span> Codex Mathematica</Link>
        <nav className="quiet-archive-nav" aria-label="Primary navigation">
          <Link href="/archive" aria-current="page">Archive</Link>
          <Link href="/library">Library</Link>
          <Link href="/shop">Shop</Link>
        </nav>
        <Link href="/profile" className="quiet-archive-account" aria-label="Open profile"><span className="quiet-archive-account-dot" /><span>{sessionLabel}</span><CircleUserRound size={17} strokeWidth={1.4} /></Link>
      </header>

      <div className="quiet-archive-content">
        <section className="quiet-archive-intro">
          <div>
            <p className="quiet-archive-eyebrow"><span /> Archive / 01</p>
            <h1>The work<br /><em>is here.</em></h1>
            <p className="quiet-archive-lede">A deliberate shelf of limits, derivatives, integrals, and series. Choose a volume, enter a chapter, and give one problem your full attention.</p>
          </div>
          <div className="quiet-archive-intro-note"><Clock3 size={16} /><strong>{sessionLabel === "Preview" ? "A private record begins here." : "Your ledger is ready."}</strong>{sessionLabel === "Preview" ? "Browse freely. Your local attempts can become a saved record whenever you sign in." : "The archive remembers visited fragments and keeps the next problem close."}</div>
        </section>

        <section className="quiet-archive-metrics" aria-label="Archive summary">
          <ArchiveMetric label="Progress" value={`${completion}%`} detail={`${visited} of ${totalFragments} visited`} />
          <ArchiveMetric label="Credits" value={credits.toLocaleString()} detail="Earned through attempts" />
          <ArchiveMetric label="Volumes" value={String(VOLUMES.length).padStart(2, "0")} detail="Core shelves open" />
          <ArchiveMetric label="Record" value={sessionLabel} detail={scholar ? "Synced scholar session" : "Local preview session"} />
        </section>

        <section className="quiet-archive-continue">
          <div className="quiet-archive-section-heading"><span>02</span><div><p className="quiet-archive-eyebrow">The next line</p><h2>Continue the thread.</h2><p>One clear place to begin, without losing the shelves.</p></div></div>
          {next && <div className="quiet-archive-next">
            <div className="quiet-archive-next-symbol" style={{ color: next.volume.accent }}>{next.volume.symbol}</div>
            <div className="quiet-archive-next-copy"><span>{next.volume.name} / Chapter {next.chapterIndex + 1}</span><h3>{next.volume.chapters[next.chapterIndex].theme}</h3><p>Fragment {String(next.fragment.id).padStart(4, "0")} is waiting for your attention.</p></div>
            <Link href={`/archive/${next.volume.id}/chapter-${next.chapterIndex + 1}/${next.fragment.id}`} className="quiet-archive-action">Begin problem <ArrowRight size={15} /></Link>
          </div>}
        </section>

        <section className="quiet-archive-shelves">
          <div className="quiet-archive-section-heading"><span>03</span><div><p className="quiet-archive-eyebrow">The shelves</p><h2>Choose your direction.</h2><p>Each volume is a different way into the same discipline.</p></div></div>
          <div className="quiet-archive-shelf-grid">
            {VOLUMES.map((volume) => {
              const fragments = allFragments(volume);
              const solved = solvedPerVolume[volume.id] ?? 0;
              const percent = fragments.length ? Math.min(100, Math.round((solved / fragments.length) * 100)) : 0;
              return <article className="quiet-archive-volume" key={volume.id}>
                <Link href={`/archive/${volume.id}`} aria-label={`Open ${volume.name}`}>
                  <div className="quiet-archive-volume-mark"><span style={{ color: volume.accent }}>{volume.symbol}</span><ArrowUpRight size={16} /></div>
                  <p className="quiet-archive-volume-name">{volume.name}</p>
                  <h3>{volume.subtitle}</h3>
                </Link>
                <div className="quiet-archive-volume-meta"><span>{solved} / {fragments.length} visited</span><strong>{percent}%</strong></div>
                <div className="quiet-archive-progress" aria-label={`${percent}% complete`}><span style={{ width: `${percent}%`, background: volume.accent }} /></div>
                <div className="quiet-archive-chapters">
                  {volume.chapters.map((chapter, index) => {
                    const locked = Boolean(chapter.packId && !ownedItems.has(chapter.packId));
                    const chapterContent = <><span className="quiet-archive-chapter-number">{String(index + 1).padStart(2, "0")}</span><strong>{chapter.theme}</strong><small>{locked ? "Expansion" : `${chapter.fragments.length} fragments`}</small>{locked ? <LockKeyhole size={13} /> : <CheckCircle2 size={13} />}</>;
                    return locked ? <Link href="/shop" className="quiet-archive-chapter quiet-archive-chapter-locked" key={`${volume.id}-${index}`} aria-label={`Unlock ${chapter.theme} in the shop`} title="Unlock this expansion in the shop">{chapterContent}</Link> : <Link href={`/archive/${volume.id}/chapter-${index + 1}`} className="quiet-archive-chapter" key={`${volume.id}-${index}`}>{chapterContent}</Link>;
                  })}
                </div>
              </article>;
            })}
          </div>
        </section>

        <section className="quiet-archive-utility-grid" aria-label="Archive tools">
          <Link href="/library" className="quiet-archive-utility"><BookOpen size={18} /><strong>Reference desk</strong><span>Find the method behind the problem.</span></Link>
          <Link href="/shop" className="quiet-archive-utility"><Layers3 size={18} /><strong>Change the instrument</strong><span>Choose a study environment from the shop.</span></Link>
          <Link href="/profile" className="quiet-archive-utility"><Sparkles size={18} /><strong>Review your record</strong><span>Progress and preferences live on their own page.</span></Link>
        </section>

        <footer className="quiet-archive-footer"><span><Sparkles size={13} /> Codex Mathematica / Archive</span><span>Study. Reason. Commit.</span></footer>
      </div>
    </main>
  );
}
