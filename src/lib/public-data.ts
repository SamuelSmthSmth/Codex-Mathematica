import { TECHNIQUE_ROWS, type Technique } from "@/data/techniques";
import { VOLUMES, type Chapter, type Fragment, type Volume } from "@/data/codex-data";

export function getVolume(id: string): Volume | undefined {
  return VOLUMES.find((volume) => volume.id === id);
}

export function getChapter(volume: Volume, chapterSlug: string): { chapter: Chapter; index: number } | undefined {
  const index = Number(chapterSlug.replace(/^chapter-/, "")) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= volume.chapters.length) return undefined;
  return { chapter: volume.chapters[index], index };
}

export function getFragment(chapter: Chapter, fragmentId: string): Fragment | undefined {
  return chapter.fragments.find((fragment) => String(fragment.id) === fragmentId);
}

export function getTechnique(id: string): Technique | undefined {
  return TECHNIQUE_ROWS.flatMap((row) => row.techniques).find((technique) => technique.id === id);
}
