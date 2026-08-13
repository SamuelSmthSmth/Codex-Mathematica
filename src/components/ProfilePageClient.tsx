"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CircleUserRound, LogIn, ShieldCheck } from "lucide-react";
import AccountPageStyles from "@/components/AccountPageStyles";
import ScholarGate from "@/components/ScholarGate";
import { useAuth } from "@/context/AuthContext";
import { useProgress, type SelfGrade } from "@/context/ProgressContext";
import { VOLUMES } from "@/data/codex-data";

const GRADE_LABELS: Record<SelfGrade, string> = {
  correct: "Conquered",
  close: "In progress",
  wrong: "Needs another pass",
};

function countFragments() {
  return VOLUMES.reduce(
    (total, volume) => total + volume.chapters.reduce((chapterTotal, chapter) => chapterTotal + chapter.fragments.length, 0),
    0,
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="quiet-profile-stat">
      <span className="quiet-profile-eyebrow">{label}</span>
      <strong>{value}</strong>
      <span>{note}</span>
    </div>
  );
}

function SectionHeading({ number, title, detail }: { number: string; title: string; detail: string }) {
  return (
    <div className="quiet-profile-section-heading">
      <span>{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
    </div>
  );
}

export default function ProfilePageClient() {
  const { scholar, loading, isGuestMode } = useAuth();
  const { credits, grimoire, solvedPerVolume } = useProgress();
  const [showAuth, setShowAuth] = useState(false);

  const totalFragments = useMemo(() => countFragments(), []);
  const gradeCounts = useMemo(() => {
    const counts: Record<SelfGrade, number> = { correct: 0, close: 0, wrong: 0 };
    Object.values(grimoire).forEach((entry) => {
      counts[entry.grade] += 1;
    });
    return counts;
  }, [grimoire]);
  const completedCount = gradeCounts.correct + gradeCounts.close + gradeCounts.wrong;
  const completion = totalFragments === 0 ? 0 : Math.round((completedCount / totalFragments) * 100);
  const displayName = scholar?.displayName || (isGuestMode ? "Guest Scholar" : "Visitor");
  const initials = displayName.slice(0, 1).toUpperCase();

  const volumeProgress = useMemo(
    () => VOLUMES.map((volume) => {
      const total = volume.chapters.reduce((sum, chapter) => sum + chapter.fragments.length, 0);
      const solved = solvedPerVolume[volume.id] ?? 0;
      return {
        ...volume,
        total,
        solved,
        percent: total === 0 ? 0 : Math.min(100, Math.round((solved / total) * 100)),
      };
    }),
    [solvedPerVolume],
  );

  if (loading) {
    return (
      <main className="quiet-profile-page quiet-profile-loading">
        <div className="quiet-profile-loading-mark">∑</div>
        <p>Preparing your record</p>
      </main>
    );
  }

  return (
    <main className="quiet-profile-page">
      <AccountPageStyles />
      <div className="quiet-profile-backdrop" aria-hidden="true" />
      <header className="quiet-profile-header">
        <Link href="/" className="quiet-profile-back-link"><ArrowLeft size={15} /> Home</Link>
        <nav className="quiet-profile-page-nav" aria-label="Account navigation">
          <Link href="/profile" aria-current="page">Profile</Link>
          <Link href="/settings">Settings</Link>
        </nav>
        <div className="quiet-profile-wordmark"><span>∑</span> Codex Mathematica</div>
        <span className="quiet-profile-header-status"><span /> {scholar ? "Scholar session" : isGuestMode ? "Guest session" : "Preview"}</span>
      </header>

      <div className="quiet-profile-content">
        <section className="quiet-profile-intro">
          <div>
            <p className="quiet-profile-eyebrow">Account / 01</p>
            <h1>Your profile.</h1>
            <p className="quiet-profile-lede">A personal index for your work in the Codex—not another view of the archive.</p>
          </div>
          <div className="quiet-profile-intro-actions">
            <Link href="/settings" className="quiet-profile-primary-action">Open settings <ArrowUpRight size={16} /></Link>
            <Link href="/archive" className="quiet-profile-secondary-action">Return to study <ArrowRight size={14} /></Link>
          </div>
        </section>

        <section className="quiet-profile-identity quiet-profile-panel">
          <div className="quiet-profile-avatar-wrap">
            <div className="quiet-profile-avatar"><span>{initials}</span></div>
            <span className="quiet-profile-avatar-caption">{scholar ? "Verified scholar" : "Preview record"}</span>
          </div>
          <div className="quiet-profile-identity-main">
            <p className="quiet-profile-eyebrow">Current identity</p>
            <h2>{displayName}</h2>
            <p>{scholar?.email || (isGuestMode ? "Your local record stays on this device." : "A private study record is created when you sign in.")}</p>
          </div>
          <div className="quiet-profile-identity-meta">
            <span className="quiet-profile-eyebrow">Credits</span>
            <strong>{credits.toLocaleString()}</strong>
            <Link href="/shop">Visit the shop <ArrowUpRight size={13} /></Link>
          </div>
        </section>

        {!scholar && !isGuestMode && (
          <section className="quiet-profile-preview-callout" aria-label="Sign in prompt">
            <div>
              <p className="quiet-profile-eyebrow">Save your record</p>
              <h2>This page is yours when you are ready.</h2>
              <p>Explore the archive freely. Sign in only when you want progress, credits, and preferences attached to an account.</p>
            </div>
            <button type="button" className="quiet-profile-primary-action" onClick={() => setShowAuth(true)}>
              <LogIn size={15} /> Sign in or register
            </button>
          </section>
        )}

        <section className="quiet-profile-section">
          <SectionHeading number="02" title="Study record" detail="A measured view of your current work." />
          <div className="quiet-profile-stats-grid">
            <StatCard label="Total progress" value={`${completion}%`} note={`${completedCount} of ${totalFragments} fragments visited`} />
            <StatCard label="Conquered" value={String(gradeCounts.correct)} note={GRADE_LABELS.correct} />
            <StatCard label="In progress" value={String(gradeCounts.close)} note={GRADE_LABELS.close} />
            <StatCard label="Needs another pass" value={String(gradeCounts.wrong)} note={GRADE_LABELS.wrong} />
          </div>
          <div className="quiet-profile-volume-list">
            {volumeProgress.map((volume) => (
              <Link href={`/archive/${volume.id}`} key={volume.id} className="quiet-profile-volume-row">
                <span className="quiet-profile-volume-symbol">{volume.symbol}</span>
                <span className="quiet-profile-volume-name"><strong>{volume.name}</strong><small>{volume.subtitle}</small></span>
                <span className="quiet-profile-volume-track"><span style={{ width: `${volume.percent}%` }} /></span>
                <span className="quiet-profile-volume-percent">{volume.percent}%</span>
                <ArrowUpRight size={14} />
              </Link>
            ))}
          </div>
        </section>

        <section className="quiet-profile-section quiet-profile-section-compact">
          <SectionHeading number="03" title="Account boundary" detail="The profile is for identity and progress. Preferences live separately." />
          <div className="quiet-profile-account-links">
            <Link href="/settings" className="quiet-profile-account-link"><ShieldCheck size={18} /><span><strong>Profile &amp; settings</strong><small>Manage identity, reading conditions, data, and sign-out.</small></span><ArrowUpRight size={15} /></Link>
            <Link href="/archive" className="quiet-profile-account-link"><CircleUserRound size={18} /><span><strong>Continue into the archive</strong><small>Leave this account page and return to your study workspace.</small></span><ArrowUpRight size={15} /></Link>
          </div>
        </section>

        <footer className="quiet-profile-footer">
          <span><CircleUserRound size={14} /> Codex Mathematica / Profile</span>
          <span>Study. Reason. Commit.</span>
        </footer>
      </div>

      {showAuth && !scholar && !isGuestMode && <ScholarGate />}
    </main>
  );
}
