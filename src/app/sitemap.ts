import type { MetadataRoute } from "next";
import { VOLUMES } from "@/data/codex-data";
import { TECHNIQUE_ROWS } from "@/data/techniques";

const baseUrl = "https://codex.sous.systems";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/archive", "/library", "/shop", "/privacy", "/terms"].map((path) => ({ url: `${baseUrl}${path}`, lastModified: now, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : 0.7 }));
  const volumeRoutes = VOLUMES.flatMap((volume) => {
    const volumeUrl = `${baseUrl}/archive/${volume.id}`;
    const chapterRoutes = volume.chapters.flatMap((chapter, chapterIndex) => {
      const chapterUrl = `${volumeUrl}/chapter-${chapterIndex + 1}`;
      return [{ url: chapterUrl, lastModified: now, changeFrequency: "monthly" as const, priority: 0.65 }, ...chapter.fragments.map((fragment) => ({ url: `${chapterUrl}/${fragment.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 }))];
    });
    return [{ url: volumeUrl, lastModified: now, changeFrequency: "monthly" as const, priority: 0.75 }, ...chapterRoutes];
  });
  const libraryRoutes = TECHNIQUE_ROWS.flatMap((row) => row.techniques.map((technique) => ({ url: `${baseUrl}/library/${technique.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })));
  return [...staticRoutes, ...volumeRoutes, ...libraryRoutes];
}
