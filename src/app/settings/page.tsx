import type { Metadata } from "next";
import SettingsPageClient from "@/components/SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings — Codex Mathematica",
  description: "Manage your Codex Mathematica identity, reading environment, focus mode, and local study data.",
  alternates: { canonical: "/settings" },
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
