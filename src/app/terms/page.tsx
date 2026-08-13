import { PublicFrame } from "@/components/PublicSite";

export const metadata = { title: "Terms — Codex Mathematica", description: "Terms of use for Codex Mathematica." };

export default function TermsPage() {
  return <PublicFrame compactHeader><main className="public-legal-page"><p className="public-kicker">Legal / 02</p><h1>Terms of<br /><em>use</em></h1><p className="public-legal-updated">Last updated: August 10, 2026</p><section><h2>Use the archive well</h2><p>Codex Mathematica is an educational tool. Treat the problem sets, explanations, and account features as a study aid—not as a substitute for instruction, assessment guidance, or professional advice.</p><h2>Accounts and progress</h2><p>You are responsible for keeping access to your account secure. Credits, themes, and archive access are product features for this application and have no cash value. We may improve or change the archive as the project develops.</p><h2>Content and availability</h2><p>We aim for accurate, useful mathematics, but no software or content collection is error-free. The archive is provided as-is while we continue to refine the platform.</p></section></main></PublicFrame>;
}
