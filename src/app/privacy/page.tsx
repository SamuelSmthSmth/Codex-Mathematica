import { PublicFrame } from "@/components/PublicSite";

export const metadata = { title: "Privacy — Codex Mathematica", description: "Privacy information for Codex Mathematica." };

export default function PrivacyPage() {
  return <PublicFrame compactHeader><main className="public-legal-page"><p className="public-kicker">Legal / 01</p><h1>Privacy<br /><em>policy</em></h1><p className="public-legal-updated">Last updated: August 10, 2026</p><section><h2>In brief</h2><p>Codex Mathematica is designed to keep the work close to you. Guest progress is stored locally in your browser. If you choose to authenticate, Firebase is used to provide sign-in and synchronize your saved study progress.</p><h2>What we store</h2><p>Your account identity, preferences, Codex Credits, and graded fragment progress may be stored so your workspace can follow you between sessions. We do not sell personal information or use your mathematics practice to build advertising profiles.</p><h2>Your choices</h2><p>You can explore as a guest, export your local save file, or wipe local progress from the Scholar Profile. For account deletion or questions, contact the project owner through the linked source repository.</p></section></main></PublicFrame>;
}
