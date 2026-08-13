import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { PublicFrame } from "@/components/PublicSite";
import { getVolume } from "@/lib/public-data";
import { VOLUMES } from "@/data/codex-data";

type Props = { params: Promise<{ volume: string }> };

export function generateStaticParams() {
  return VOLUMES.map((volume) => ({ volume: volume.id }));
}

export async function generateMetadata({ params }: Props) {
  const { volume: id } = await params;
  const volume = getVolume(id);
  if (!volume) return {};
  return { title: `${volume.name}: ${volume.subtitle} | Codex Mathematica`, description: `Study ${volume.subtitle.toLowerCase()} in the Codex Mathematica archive.` };
}

export default async function VolumePage({ params }: Props) {
  const { volume: id } = await params;
  const volume = getVolume(id);
  if (!volume) notFound();
  return <PublicFrame compactHeader><main className="public-content-page public-archive-page"><Link href="/archive" className="public-back-link"><ArrowLeft size={14} /> Back to archive</Link><div className="public-volume-heading"><div className="public-volume-symbol">{volume.symbol}</div><div><p className="public-kicker">Volume / {volume.name}</p><h1>{volume.subtitle}</h1><p>{volume.chapters.length} chapters · {volume.chapters.reduce((total, chapter) => total + chapter.fragments.length, 0)} fragments</p></div></div><div className="public-chapter-list">{volume.chapters.map((chapter, index) => <Link href={`/archive/${volume.id}/chapter-${index + 1}`} className="public-chapter-row" key={`${volume.id}-${index}`}><span className="public-chapter-number">{String(index + 1).padStart(2, "0")}</span><span className="public-chapter-copy"><small>{chapter.packId ? <><Lock size={11} /> Expansion</> : <><Sparkles size={11} /> Chapter {index + 1}</>}</small><strong>{chapter.theme}</strong><em>{chapter.fragments.length} fragments</em></span><ArrowRight size={16} /></Link>)}</div></main></PublicFrame>;
}
