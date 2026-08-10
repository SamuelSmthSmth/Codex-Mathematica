import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { PublicFrame } from "@/components/PublicSite";
import { getChapter, getVolume } from "@/lib/public-data";
import { VOLUMES } from "@/data/codex-data";

type Props = { params: Promise<{ volume: string; chapter: string }> };

export function generateStaticParams() {
  return VOLUMES.flatMap((volume) => volume.chapters.map((_, index) => ({ volume: volume.id, chapter: `chapter-${index + 1}` })));
}

export async function generateMetadata({ params }: Props) {
  const { volume: id, chapter: chapterSlug } = await params;
  const volume = getVolume(id);
  const match = volume && getChapter(volume, chapterSlug);
  if (!volume || !match) return {};
  return { title: `${match.chapter.theme} — ${volume.name} | Codex Mathematica`, description: `Work through ${match.chapter.fragments.length} calculus problems in ${match.chapter.theme}.` };
}

export default async function ChapterPage({ params }: Props) {
  const { volume: id, chapter: chapterSlug } = await params;
  const volume = getVolume(id);
  const match = volume && getChapter(volume, chapterSlug);
  if (!volume || !match) notFound();
  const { chapter, index } = match;
  return <PublicFrame compactHeader><main className="public-content-page public-chapter-page"><Link href={`/archive/${volume.id}`} className="public-back-link"><ArrowLeft size={14} /> {volume.name}</Link><div className="public-page-heading"><div><p className="public-kicker">Chapter {String(index + 1).padStart(2, "0")} / {volume.name}</p><h1>{chapter.theme}</h1></div><p>{chapter.fragments.length} fragments, each one a small invitation to think more carefully.</p></div><div className="public-fragment-grid">{chapter.fragments.map((fragment, fragmentIndex) => <Link className="public-fragment-row" href={`/archive/${volume.id}/chapter-${index + 1}/${fragment.id}`} key={fragment.id}><span className="public-fragment-id">{String(fragmentIndex + 1).padStart(2, "0")}</span><span><small><BookOpen size={11} /> Fragment {fragment.id}</small><strong>{fragment.problem_latex.replace(/\\[a-zA-Z]+/g, " ").slice(0, 90)}{fragment.problem_latex.length > 90 ? "…" : ""}</strong></span><ArrowRight size={15} /></Link>)}</div></main></PublicFrame>;
}
