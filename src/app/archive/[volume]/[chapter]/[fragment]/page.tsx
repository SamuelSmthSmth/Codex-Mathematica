import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { PublicFrame } from "@/components/PublicSite";
import ShareableProblem from "@/components/ShareableProblem";
import { getChapter, getFragment, getVolume } from "@/lib/public-data";
import { VOLUMES } from "@/data/codex-data";

type Props = { params: Promise<{ volume: string; chapter: string; fragment: string }> };

export function generateStaticParams() {
  return VOLUMES.flatMap((volume) => volume.chapters.flatMap((chapter, chapterIndex) => chapter.fragments.map((fragment) => ({ volume: volume.id, chapter: `chapter-${chapterIndex + 1}`, fragment: String(fragment.id) }))));
}

export async function generateMetadata({ params }: Props) {
  const { volume: id, chapter: chapterSlug, fragment: fragmentId } = await params;
  const volume = getVolume(id);
  const match = volume && getChapter(volume, chapterSlug);
  const fragment = match && getFragment(match.chapter, fragmentId);
  if (!volume || !match || !fragment) return {};
  return { title: `Fragment ${fragment.id} — ${match.chapter.theme} | Codex Mathematica`, description: `A shareable calculus problem from ${match.chapter.theme} in the ${volume.name} archive.` };
}

export default async function FragmentPage({ params }: Props) {
  const { volume: id, chapter: chapterSlug, fragment: fragmentId } = await params;
  const volume = getVolume(id);
  const match = volume && getChapter(volume, chapterSlug);
  const fragment = match && getFragment(match.chapter, fragmentId);
  if (!volume || !match || !fragment) notFound();
  return <PublicFrame compactHeader><main className="public-content-page public-problem-page"><div className="public-problem-nav"><Link href={`/archive/${volume.id}/chapter-${match.index + 1}`} className="public-back-link"><ArrowLeft size={14} /> Back to chapter</Link><span><Share2 size={13} /> Shareable problem</span></div><div className="public-page-heading"><div><p className="public-kicker">{volume.name} / {match.chapter.theme}</p><h1>One problem.<br /><em>Full attention.</em></h1></div><p>Take the time the problem deserves. When you are ready, reveal the solution and assess the attempt honestly.</p></div><ShareableProblem fragment={fragment} /><div className="public-problem-cta"><p>Want the full immersive workspace?</p><Link href="/archive" className="public-button public-button-outline">Enter the archive <ArrowLeft size={14} className="rotate-180" /></Link></div></main></PublicFrame>;
}
