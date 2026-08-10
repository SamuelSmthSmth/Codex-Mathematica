import { notFound } from "next/navigation";
import { PublicFrame } from "@/components/PublicSite";
import PublicTechniqueArticle from "@/components/PublicTechniqueArticle";
import { getTechnique } from "@/lib/public-data";
import { TECHNIQUE_ROWS } from "@/data/techniques";

type Props = { params: Promise<{ technique: string }> };

export function generateStaticParams() {
  return TECHNIQUE_ROWS.flatMap((row) => row.techniques.map((technique) => ({ technique: technique.id })));
}

export async function generateMetadata({ params }: Props) {
  const { technique: id } = await params;
  const technique = getTechnique(id);
  if (!technique) return {};
  return { title: `${technique.name} — Technique Library | Codex Mathematica`, description: technique.tagline };
}

export default async function TechniquePage({ params }: Props) {
  const { technique: id } = await params;
  const technique = getTechnique(id);
  if (!technique) notFound();
  return <PublicFrame compactHeader><PublicTechniqueArticle technique={technique} /></PublicFrame>;
}
