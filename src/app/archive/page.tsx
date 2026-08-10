import type { Metadata } from "next";
import ArchiveHome from "@/components/ArchiveHome";

export const metadata: Metadata = {
  title: "Archive — Codex Mathematica",
  description: "Browse the Codex Mathematica volumes, choose a chapter, and work through calculus problems at your own pace.",
  alternates: { canonical: "/archive" },
};

export default function ArchivePage() {
  return <ArchiveHome />;
}
