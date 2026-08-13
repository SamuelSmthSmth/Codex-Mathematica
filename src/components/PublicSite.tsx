import Link from "next/link";
import { ArrowUpRight, BookOpen, CircleUserRound, Menu } from "lucide-react";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="public-header">
      <div className="public-header-inner">
        <Link href="/" className="public-wordmark" aria-label="Codex Mathematica home">
          <span className="public-wordmark-mark">∑</span>
          <span>Codex Mathematica</span>
        </Link>

        <nav className="public-nav" aria-label="Primary navigation">
          <Link href="/archive" className="public-nav-link">Archive</Link>
          <Link href="/library" className="public-nav-link">Library</Link>
          <Link href="/shop" className="public-nav-link">Shop</Link>
        </nav>

        <div className="public-header-actions">
          {!compact && <span className="public-status"><span className="public-status-dot" /> Open for study</span>}
          <Link href="/archive" className="public-header-cta">
            Enter archive <ArrowUpRight size={14} />
          </Link>
          <Link href="/profile" className="public-icon-link" aria-label="Open scholar profile">
            <CircleUserRound size={18} strokeWidth={1.5} />
          </Link>
        </div>

        <details className="public-mobile-nav">
          <summary className="public-mobile-menu" aria-label="Open navigation">
            <Menu size={20} strokeWidth={1.5} />
          </summary>
          <nav className="public-mobile-nav-panel" aria-label="Mobile navigation">
            <Link href="/archive">Archive</Link>
            <Link href="/library">Library</Link>
            <Link href="/shop">Shop</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="public-footer">
      <div className="public-footer-top">
        <div>
          <Link href="/" className="public-wordmark public-wordmark-footer">
            <span className="public-wordmark-mark">∑</span>
            <span>Codex Mathematica</span>
          </Link>
          <p className="public-footer-note">A disciplined place to do difficult mathematics.</p>
        </div>
        <div className="public-footer-links">
          <div>
            <p className="public-footer-label">Explore</p>
            <Link href="/archive">Archive</Link>
            <Link href="/library">Technique library</Link>
            <Link href="/shop">The shop</Link>
          </div>
          <div>
            <p className="public-footer-label">Company</p>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="https://github.com/SamuelSmthSmth/Codex-Mathematica" target="_blank" rel="noreferrer">Source code <ArrowUpRight size={12} /></a>
          </div>
        </div>
      </div>
      <div className="public-footer-bottom">
        <span>© 2026 Codex Mathematica. Built for serious study.</span>
        <span className="public-footer-motto"><BookOpen size={13} /> Study. Reason. Commit.</span>
      </div>
    </footer>
  );
}

export function PublicFrame({ children, compactHeader = false }: { children: React.ReactNode; compactHeader?: boolean }) {
  return (
    <div className="public-site">
      <SiteHeader compact={compactHeader} />
      {children}
      <SiteFooter />
    </div>
  );
}
