import type { Metadata } from "next";
import ProfilePageClient from "@/components/ProfilePageClient";

export const metadata: Metadata = {
  title: "Profile — Codex Mathematica",
  description: "Review your Codex Mathematica study record, mastery, preferences, and saved progress.",
  alternates: { canonical: "/profile" },
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
