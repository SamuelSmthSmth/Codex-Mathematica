"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, ChevronRight, Compass, Layers3, Sparkles } from "lucide-react";
import { PublicFrame } from "@/components/PublicSite";
import ArchiveDashboard from "@/components/ArchiveDashboard";
import MathRenderer from "@/components/MathRenderer";
import { useAuth } from "@/context/AuthContext";

const signals = [
  { value: "04", label: "core volumes" },
  { value: "∞", label: "problems to solve" },
  { value: "06", label: "ways to study" },
];

export default function Home() {
  const { scholar } = useAuth();

  if (scholar) return <ArchiveDashboard />;

  return (
    <PublicFrame>
      <main>
        <section className="public-hero">
          <div className="public-hero-grid" aria-hidden="true" />
          <div className="public-orbit public-orbit-one" aria-hidden="true" />
          <div className="public-orbit public-orbit-two" aria-hidden="true" />
          <div className="public-hero-inner">
            <div className="public-hero-copy">
              <p className="public-kicker"><span className="public-kicker-line" /> The mathematics archive <span className="public-kicker-year">Est. 2026</span></p>
              <h1>Make difficult<br /><em>things</em> inevitable.</h1>
              <p className="public-hero-lede">Codex Mathematica is a deliberate workspace for mastering calculus—from first principles to Putnam-grade problems.</p>
              <div className="public-hero-actions">
                <Link href="/archive" className="public-button public-button-accent">Enter the archive <ArrowRight size={16} /></Link>
                <Link href="/library" className="public-text-button">Browse the library <ChevronRight size={14} /></Link>
              </div>
            </div>
            <div className="public-hero-aside">
              <MathRenderer className="public-hero-equation" value="\\lim_{x\\to\\infty} \\frac{curiosity}{practice} = \\infty" />
              <div className="public-hero-aside-rule" />
              <p>Not a course. Not a feed.<br />A place to return to the work.</p>
              <span className="public-coordinate">51° 30′ 26″ N / 0° 07′ 39″ W</span>
            </div>
          </div>
          <div className="public-hero-scroll"><span>Scroll to explore</span><span className="public-scroll-line" /></div>
        </section>

        <section className="public-signal-row">
          {signals.map((signal) => <div key={signal.label} className="public-signal"><strong>{signal.value}</strong><span>{signal.label}</span></div>)}
          <p className="public-signal-note">Structured for focus.<br />Designed for return visits.</p>
        </section>

        <section className="public-section public-section-intro">
          <div className="public-section-label">01 / The proposition</div>
          <div className="public-intro-content">
            <h2>Practice is a<br /><span>place you can build.</span></h2>
            <div>
              <p className="public-lead">The best mathematical thinking does not happen in a browser tab full of distractions. It happens when the problem is in front of you, the method is close at hand, and the next step is yours.</p>
              <p>Codex gives every problem a home: a volume, a chapter, a record of your attempt. Solve at your pace, reveal only when you are ready, and build a personal grimoire of hard-won understanding.</p>
              <Link href="/archive" className="public-inline-link">See the archive <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>

        <section className="public-section public-section-dark">
          <div className="public-section-label">02 / The system</div>
          <div className="public-feature-grid">
            <article className="public-feature-card public-feature-card-featured"><div className="public-feature-index">A</div><Layers3 size={22} strokeWidth={1.3} /><h3>Volumes with a point of view.</h3><p>Limits, derivatives, integrals, and series organized into a growing library of carefully chosen fragments.</p><Link href="/archive" className="public-inline-link">Open the shelves <ArrowRight size={14} /></Link></article>
            <article className="public-feature-card"><div className="public-feature-index">B</div><BrainCircuit size={22} strokeWidth={1.3} /><h3>Work, don’t just watch.</h3><p>Reveal solutions after your attempt, self-grade honestly, and turn repetition into evidence of mastery.</p></article>
            <article className="public-feature-card"><div className="public-feature-index">C</div><Compass size={22} strokeWidth={1.3} /><h3>Your method, your environment.</h3><p>Six distinct study spaces—from candlelit archive to student desk—so the interface can meet the mood.</p></article>
          </div>
        </section>

        <section className="public-section public-library-tease">
          <div className="public-library-copy"><div className="public-section-label">03 / The reference desk</div><h2>When you are stuck,<br /><em>go deeper.</em></h2><p>The Technique Library is the quiet room next door: elegant explanations, useful transformations, and small checks for understanding.</p><Link href="/library" className="public-button public-button-outline">Visit the library <BookOpen size={15} /></Link></div>
          <div className="public-library-card"><Sparkles size={15} /><span>Technique of the day</span><strong>King’s Property</strong><p>Flip the limits. Keep the integrand.</p><Link href="/library/kings-property">Read the article <ArrowRight size={14} /></Link></div>
        </section>

        <section className="public-cta-section"><div className="public-cta-mark">∑</div><p className="public-kicker">The next line is yours</p><h2>Start with one<br /><em>good problem.</em></h2><Link href="/archive" className="public-button public-button-accent">Enter the archive <ArrowUpRightIcon /></Link></section>
      </main>
    </PublicFrame>
  );
}

function ArrowUpRightIcon() {
  return <ArrowRight size={16} />;
}
