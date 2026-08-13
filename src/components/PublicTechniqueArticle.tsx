"use client";

import { useRouter } from "next/navigation";
import LibraryArticle from "@/components/LibraryArticle";
import type { Technique } from "@/data/techniques";

export default function PublicTechniqueArticle({ technique }: { technique: Technique }) {
  const router = useRouter();
  return <LibraryArticle technique={technique} onBack={() => router.push("/library")} />;
}
