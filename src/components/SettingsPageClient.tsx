"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Download, Eye, EyeOff, LogIn, LogOut, Moon, RotateCcw, Settings2, ShieldCheck, Sun, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AccountPageStyles from "@/components/AccountPageStyles";
import ScholarGate from "@/components/ScholarGate";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { useTheme } from "@/context/ThemeContext";

function SectionHeading({ number, title, detail }: { number: string; title: string; detail: string }) {
  return (
    <div className="quiet-profile-section-heading">
      <span>{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
    </div>
  );
}

function downloadFile(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function SettingsPageClient() {
  const router = useRouter();
  const { scholar, loading, isGuestMode, signOut, updateScholarName } = useAuth();
  const { exportSave, wipeProgress } = useProgress();
  const { isLightMode, toggleTheme, isFocusMode, setIsFocusMode, activeThemeName } = useTheme();
  const [editedName, setEditedName] = useState("");
  const [nameState, setNameState] = useState<"idle" | "saving" | "saved">("idle");
  const [resetState, setResetState] = useState<"idle" | "confirming">("idle");
  const [showAuth, setShowAuth] = useState(false);

  const displayName = scholar?.displayName || (isGuestMode ? "Guest Scholar" : "Visitor");
  const initials = displayName.slice(0, 1).toUpperCase();

  const handleSaveName = async () => {
    const nextName = editedName.trim();
    if (!scholar || isGuestMode || !nextName || nextName === scholar.displayName) return;
    setNameState("saving");
    try {
      await updateScholarName(nextName);
      setNameState("saved");
      window.setTimeout(() => setNameState("idle"), 1800);
    } catch {
      setNameState("idle");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleReset = () => {
    if (resetState === "idle") {
      setResetState("confirming");
      return;
    }
    wipeProgress();
    setResetState("idle");
  };

  if (loading) {
    return (
      <main className="quiet-profile-page quiet-profile-loading">
        <div className="quiet-profile-loading-mark">∑</div>
        <p>Preparing your settings</p>
      </main>
    );
  }

  return (
    <main className="quiet-profile-page">
      <AccountPageStyles />
      <div className="quiet-profile-backdrop" aria-hidden="true" />
      <header className="quiet-profile-header">
        <Link href="/profile" className="quiet-profile-back-link"><ArrowLeft size={15} /> Profile</Link>
        <nav className="quiet-profile-page-nav" aria-label="Account navigation">
          <Link href="/profile">Profile</Link>
          <Link href="/settings" aria-current="page">Settings</Link>
        </nav>
        <div className="quiet-profile-wordmark"><span>∑</span> Codex Mathematica</div>
        <span className="quiet-profile-header-status"><span /> {scholar ? "Scholar session" : isGuestMode ? "Guest session" : "Preview"}</span>
      </header>

      <div className="quiet-profile-content">
        <section className="quiet-profile-intro">
          <div>
            <p className="quiet-profile-eyebrow">Account / 02</p>
            <h1>Settings.</h1>
            <p className="quiet-profile-lede">Tune the conditions around your work. These controls are deliberately separate from the archive.</p>
          </div>
          <Link href="/profile" className="quiet-profile-secondary-action">View profile <ArrowUpRight size={15} /></Link>
        </section>

        {!scholar && !isGuestMode && (
          <section className="quiet-profile-preview-callout" aria-label="Sign in prompt">
            <div>
              <p className="quiet-profile-eyebrow">Preview mode</p>
              <h2>Settings are ready before your account is.</h2>
              <p>You can explore locally now. Sign in when you want your identity and preferences to travel with your study record.</p>
            </div>
            <button type="button" className="quiet-profile-primary-action" onClick={() => setShowAuth(true)}><LogIn size={15} /> Sign in or register</button>
          </section>
        )}

        <div className="quiet-profile-columns quiet-settings-columns">
          <section className="quiet-profile-section quiet-profile-section-compact">
            <SectionHeading number="01" title="Identity" detail="How the Codex addresses you." />
            <div className="quiet-profile-identity quiet-profile-panel quiet-settings-identity">
              <div className="quiet-profile-avatar"><span>{initials}</span></div>
              <div className="quiet-profile-identity-main">
                <p className="quiet-profile-eyebrow">Current scholar</p>
                <h2>{displayName}</h2>
                <p>{scholar?.email || (isGuestMode ? "Unlinked local session" : "No account connected")}</p>
              </div>
            </div>
            <div className="quiet-profile-field-group quiet-settings-field">
              <label htmlFor="settings-name">Display name</label>
              <div className="quiet-profile-field-row">
                <input id="settings-name" value={editedName || displayName} onChange={(event) => setEditedName(event.target.value)} disabled={!scholar || isGuestMode} />
                {scholar && !isGuestMode && <button type="button" onClick={handleSaveName} disabled={nameState === "saving" || !editedName.trim() || editedName.trim() === scholar.displayName}>
                  {nameState === "saved" ? <Check size={15} /> : nameState === "saving" ? "Saving" : "Save"}
                </button>}
              </div>
              {!scholar && !isGuestMode && <p className="quiet-profile-field-note">Sign in to save a display name.</p>}
              {isGuestMode && <p className="quiet-profile-field-note">Guest names remain local to this device.</p>}
            </div>
            <div className="quiet-profile-account-row"><ShieldCheck size={16} /><span>{scholar ? "Account connected" : isGuestMode ? "Unlinked local session" : "Preview record"}</span></div>
          </section>

          <section className="quiet-profile-section quiet-profile-section-compact">
            <SectionHeading number="02" title="Reading conditions" detail="Small adjustments to the instrument." />
            <div className="quiet-profile-setting-list">
              <button type="button" onClick={toggleTheme} className="quiet-profile-setting-row">
                <span>{isLightMode ? <Sun size={16} /> : <Moon size={16} />} Reading environment</span><strong>{isLightMode ? "Sunlit" : "Candlelit"}</strong>
              </button>
              <button type="button" onClick={() => setIsFocusMode(!isFocusMode)} className="quiet-profile-setting-row">
                <span>{isFocusMode ? <Eye size={16} /> : <EyeOff size={16} />} Focus mode</span><strong>{isFocusMode ? "On" : "Off"}</strong>
              </button>
              <div className="quiet-profile-setting-row quiet-profile-setting-static"><span><Settings2 size={16} /> Active experience</span><strong>{activeThemeName}</strong></div>
            </div>
            <Link href="/shop" className="quiet-profile-secondary-action">Change your experience <ArrowUpRight size={14} /></Link>
          </section>
        </div>

        <section className="quiet-profile-section quiet-profile-section-compact">
          <SectionHeading number="03" title="Data &amp; account" detail="Keep a portable copy of your work and control this session." />
          <div className="quiet-profile-actions-grid">
            <button type="button" onClick={() => downloadFile("codex-save.json", exportSave(), "application/json")} className="quiet-profile-action-card"><Download size={17} /><span><strong>Export save file</strong><small>Download a portable JSON record.</small></span><ArrowUpRight size={14} /></button>
            <button type="button" onClick={handleReset} className={`quiet-profile-action-card quiet-profile-action-danger ${resetState === "confirming" ? "is-confirming" : ""}`}><Trash2 size={17} /><span><strong>{resetState === "confirming" ? "Click again to reset" : "Reset local progress"}</strong><small>{resetState === "confirming" ? "This cannot be undone." : "Clear this device's ledger."}</small></span><RotateCcw size={14} /></button>
            <button type="button" onClick={handleSignOut} className="quiet-profile-action-card"><LogOut size={17} /><span><strong>{isGuestMode ? "Leave guest session" : "Sign out"}</strong><small>Return to the public site.</small></span><ArrowUpRight size={14} /></button>
          </div>
        </section>

        <footer className="quiet-profile-footer">
          <span><Settings2 size={14} /> Codex Mathematica / Settings</span>
          <span>Study. Reason. Commit.</span>
        </footer>
      </div>

      {showAuth && !scholar && !isGuestMode && <ScholarGate />}
    </main>
  );
}
