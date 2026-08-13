import Link from "next/link";
import { ArrowRight, Coins, Palette, PackageOpen, Sparkles } from "lucide-react";
import { PublicFrame } from "@/components/PublicSite";
import { SHOP_ITEMS } from "@/data/shop-items";

export const metadata = {
  title: "Shop — Codex Mathematica",
  description: "Customize your Codex study environment and unlock new calculus volumes with Codex Credits.",
};

export default function ShopPage() {
  const themes = SHOP_ITEMS.filter((item) => item.category === "themes");
  const archives = SHOP_ITEMS.filter((item) => item.category === "archives");
  return (
    <PublicFrame compactHeader>
      <main className="public-content-page">
        <div className="public-page-heading"><div><p className="public-kicker">04 / The outfitter</p><h1>The<br /><em>Shop</em></h1></div><p>Earn Codex Credits by doing the work. Spend them on a study environment that makes returning feel like a choice.</p></div>
        <div className="public-shop-note"><Coins size={17} /><span><strong>Credits are earned, not sold.</strong> Solve problems, build momentum, and unlock the rest as you go.</span><Link href="/archive">Start earning <ArrowRight size={14} /></Link></div>
        <ShopGroup title="Study environments" icon={<Palette size={17} />} items={themes} />
        <ShopGroup title="Archive expansions" icon={<PackageOpen size={17} />} items={archives} />
      </main>
    </PublicFrame>
  );
}

function ShopGroup({ title, icon, items }: { title: string; icon: React.ReactNode; items: typeof SHOP_ITEMS }) {
  if (!items.length) return null;
  return <section className="public-shop-group"><div className="public-shop-group-heading"><span>{icon}</span><h2>{title}</h2><small>{items.length} items</small></div><div className="public-shop-grid">{items.map((item) => <article className="public-shop-card" key={item.id}><div className="public-shop-card-art"><Sparkles size={22} strokeWidth={1.2} /></div><div className="public-shop-card-body"><p className="public-eyebrow">{item.category === "themes" ? "Environment" : "Expansion"}</p><h3>{item.name}</h3><p>{item.description}</p><div className="public-shop-card-footer"><span><Coins size={13} /> {item.price === 0 ? "Free" : item.price.toLocaleString()}</span><Link href="/archive">View in archive <ArrowRight size={13} /></Link></div></div></article>)}</div></section>;
}
