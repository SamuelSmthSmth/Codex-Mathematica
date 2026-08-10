import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { PublicFrame } from "@/components/PublicSite";
import { TECHNIQUE_ROWS } from "@/data/techniques";

export const metadata = {
  title: "Technique Library — Codex Mathematica",
  description: "Reference articles for integration, limits, summations, and the techniques that make calculus click.",
};

export default function LibraryPage() {
  const techniques = TECHNIQUE_ROWS.flatMap((row) => row.techniques);
  return (
    <PublicFrame compactHeader>
      <main className="public-content-page">
        <div className="public-page-heading"><div><p className="public-kicker">03 / Reference desk</p><h1>Technique<br /><em>Library</em></h1></div><p>Short, rigorous notes for the moments when a problem asks for a tool you have not used in a while.</p></div>
        <div className="public-library-toolbar"><span>{techniques.length} articles</span><span><Search size={14} /> Browse by method</span></div>
        <div className="public-article-grid">
          {TECHNIQUE_ROWS.map((row) => <section key={row.id} className="public-article-group"><p className="public-eyebrow">{row.title}</p>{row.techniques.map((technique) => <Link href={`/library/${technique.id}`} className="public-article-row" key={technique.id}><span className="public-article-icon"><BookOpen size={16} /></span><span><strong>{technique.name}</strong><small>{technique.tagline}</small></span><ArrowRight size={15} /></Link>)}</section>)}
        </div>
      </main>
    </PublicFrame>
  );
}
