import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PublicFrame } from "@/components/PublicSite";

export default function NotFound() {
  return <PublicFrame compactHeader><main className="public-not-found"><div className="public-not-found-equation">{"\\lim_{x\\to ?} page(x)"}</div><p className="public-kicker">404 / Undefined</p><h1>This page tends<br /><em>nowhere.</em></h1><p>The address you followed is not in the archive. Return to the shelves, or begin again from the front door.</p><div className="public-hero-actions"><Link href="/" className="public-button public-button-accent"><ArrowLeft size={15} /> Return home</Link><Link href="/archive" className="public-text-button">Open archive <ArrowRight size={14} /></Link></div></main></PublicFrame>;
}
