"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, CircleUserRound, Compass, Layers3, Sparkles } from "lucide-react";
import { useMemo } from "react";
import MathRenderer from "@/components/MathRenderer";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { VOLUMES, type Volume } from "@/data/codex-data";

function allFragments(volume: Volume) {
  return volume.chapters.flatMap((chapter, chapterIndex) =>
    chapter.fragments.map((fragment) => ({ fragment, chapterIndex })),
  );
}

function getNextFragment(getGrimoireGrade: (fragmentId: number) => string | null) {
  for (const volume of VOLUMES) {
    const open = allFragments(volume).find(({ fragment }) => !getGrimoireGrade(fragment.id));
    if (open) return { ...open, volume };
  }
  const firstVolume = VOLUMES[0];
  const first = allFragments(firstVolume)[0];
  return first ? { ...first, volume: firstVolume } : null;
}

function DashboardMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="archive-dashboard-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

export default function ArchiveDashboard() {
  const { scholar } = useAuth();
  const { credits, grimoire, solvedPerVolume, getGrimoireGrade } = useProgress();
  const next = useMemo(() => getNextFragment(getGrimoireGrade), [getGrimoireGrade]);
  const displayName = scholar?.displayName?.split(" ")[0] || "Scholar";
  const totalFragments = useMemo(
    () => VOLUMES.reduce((sum, volume) => sum + allFragments(volume).length, 0),
    [],
  );
  const completed = Object.keys(grimoire).length;
  const completion = totalFragments ? Math.round((completed / totalFragments) * 100) : 0;

  const volumeProgress = VOLUMES.map((volume) => {
    const total = allFragments(volume).length;
    const solved = solvedPerVolume[volume.id] ?? 0;
    return { volume, total, solved, percent: total ? Math.min(100, Math.round((solved / total) * 100)) : 0 };
  });

  return (
    <main className="archive-dashboard-page">
      <div className="archive-dashboard-grain" aria-hidden="true" />
      <header className="archive-dashboard-header">
        <Link href="/" className="archive-dashboard-brand" aria-label="Codex Mathematica home">
          <span>∑</span> Codex Mathematica
        </Link>
        <nav className="archive-dashboard-nav" aria-label="Study navigation">
          <Link className="is-active" href="/">Archive</Link>
          <Link href="/library">Library</Link>
          <Link href="/shop">Shop</Link>
        </nav>
        <div className="archive-dashboard-actions">
          <span className="archive-dashboard-credits">{credits.toLocaleString()} credits</span>
          <Link href="/profile" className="archive-dashboard-profile" aria-label="Open profile and settings">
            <CircleUserRound size={18} strokeWidth={1.4} />
          </Link>
        </div>
      </header>

      <div className="archive-dashboard-content">
        <section className="archive-dashboard-welcome">
          <div>
            <p className="archive-dashboard-eyebrow"><span /> Scholar dashboard / 01</p>
            <h1>Good to see you,<br /><em>{displayName}.</em></h1>
            <p className="archive-dashboard-lede">The Archive is yours now. Continue the thread, or choose a new volume and begin again with full attention.</p>
          </div>
          <div className="archive-dashboard-equation" aria-label="A reminder to keep studying">
            <MathRenderer value="\\lim_{n \\to \\infty} \\frac{practice}{distraction} = \\infty" />
            <span>A small theorem for the day</span>
          </div>
        </section>

        <section className="archive-dashboard-metrics" aria-label="Study summary">
          <DashboardMetric label="Archive progress" value={`${completion}%`} detail={`${completed} of ${totalFragments} fragments visited`} />
          <DashboardMetric label="Credits" value={credits.toLocaleString()} detail="Earned through honest attempts" />
          <DashboardMetric label="Volumes open" value={String(VOLUMES.length).padStart(2, "0")} detail="Four ways into the work" />
          <DashboardMetric label="Session" value="Active" detail="Your local ledger is ready" />
        </section>

        <section className="archive-dashboard-continue">
          <div className="archive-dashboard-section-heading">
            <span>02</span>
            <div><p className="archive-dashboard-eyebrow">The next line</p><h2>Continue where you left off.</h2></div>
          </div>
          {next ? (
            <div className="archive-dashboard-next-card">
              <div className="archive-dashboard-next-symbol" style={{ color: next.volume.accent }}>{next.volume.symbol}</div>
              <div className="archive-dashboard-next-copy">
                <span>{next.volume.name} / Chapter {next.chapterIndex + 1}</span>
                <h3>{next.volume.chapters[next.chapterIndex].theme}</h3>
                <p>Fragment {String(next.fragment.id).padStart(4, "0")} is ready for your attention.</p>
              </div>
              <Link href="/archive" className="archive-dashboard-primary-action">Enter study <ArrowRight size={15} /></Link>
            </div>
          ) : (
            <div className="archive-dashboard-next-card"><div className="archive-dashboard-next-symbol">∑</div><div className="archive-dashboard-next-copy"><span>Archive complete</span><h3>You have visited every fragment.</h3><p>Return to the volume that deserves another pass.</p></div><Link href="/archive" className="archive-dashboard-primary-action">Review archive <ArrowRight size={15} /></Link></div>
          )}
        </section>

        <section className="archive-dashboard-volume-section">
          <div className="archive-dashboard-section-heading">
            <span>03</span>
            <div><p className="archive-dashboard-eyebrow">The shelves</p><h2>Choose your direction.</h2></div>
            <Link href="/archive" className="archive-dashboard-section-link">Open full archive <ArrowUpRight size={14} /></Link>
          </div>
          <div className="archive-dashboard-volume-grid">
            {volumeProgress.map(({ volume, total, solved, percent }) => (
              <Link href="/archive" className="archive-dashboard-volume-card" key={volume.id}>
                <div className="archive-dashboard-volume-card-top"><span style={{ color: volume.accent }}>{volume.symbol}</span><ArrowUpRight size={15} /></div>
                <p>{volume.name}</p>
                <h3>{volume.subtitle}</h3>
                <div className="archive-dashboard-progress"><span style={{ width: `${percent}%`, background: volume.accent }} /></div>
                <div className="archive-dashboard-volume-meta"><span>{solved} / {total} visited</span><strong>{percent}%</strong></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="archive-dashboard-bottom-grid">
          <Link href="/library" className="archive-dashboard-utility-card"><BookOpen size={19} /><span>Technique library</span><strong>When you need a method.</strong><ArrowUpRight size={14} /></Link>
          <Link href="/shop" className="archive-dashboard-utility-card"><Layers3 size={19} /><span>Customize the instrument</span><strong>Change how the work feels.</strong><ArrowUpRight size={14} /></Link>
          <Link href="/profile" className="archive-dashboard-utility-card"><Compass size={19} /><span>Your record</span><strong>Review progress and settings.</strong><ArrowUpRight size={14} /></Link>
        </section>

        <footer className="archive-dashboard-footer"><span><Sparkles size={13} /> Codex Mathematica / Archive dashboard</span><span>Study. Reason. Commit.</span></footer>
      </div>
    </main>
  );
}

