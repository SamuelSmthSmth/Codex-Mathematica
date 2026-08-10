"use client";

/**
 * src/components/ScholarGate.tsx
 *
 * Full-screen blur overlay that blocks the workspace until a scholar
 * is authenticated.
 *
 * Sign-in methods:
 *   - Email + Password  (Sign In / Register toggle)
 *   - Google OAuth
 *   - GitHub OAuth
 */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type FormEvent,
} from "react";
import { useAuth } from "@/context/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// SVG icon atoms (inline — zero deps)
// ─────────────────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="color-mix(in srgb, var(--codex-accent) 60%, transparent)" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(180,130,40,0.6)" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="rgba(160,115,35,0.6)" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="color-mix(in srgb, var(--codex-accent) 60%, transparent)" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
        fill="rgba(180,165,135,0.65)"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────────────────────────────────────

function GoldDivider({ label }: { label?: string }) {
  if (!label) {
    return (
      <div
        className="w-full my-5"
        style={{ height: "1px", background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--codex-accent) 28%, transparent), transparent)" }}
        aria-hidden="true"
      />
    );
  }
  return (
    <div className="w-full flex items-center gap-3 my-5" aria-hidden="true">
      <div className="flex-1" style={{ height: "1px", background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--codex-accent) 22%, transparent))" }} />
      <span style={{ fontFamily: "Georgia, serif", fontSize: "0.58rem", letterSpacing: "0.2em", color: "rgba(160,135,90,0.5)", textTransform: "uppercase" }}>
        {label}
      </span>
      <div className="flex-1" style={{ height: "1px", background: "linear-gradient(to left, transparent, color-mix(in srgb, var(--codex-accent) 22%, transparent))" }} />
    </div>
  );
}

function DarkInput({
  id,
  type,
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
  label,
}: {
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled: boolean;
  autoComplete?: string;
  label: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        style={{ fontFamily: "Georgia, serif", fontSize: "0.56rem", letterSpacing: "0.25em", color: "color-mix(in srgb, var(--codex-accent) 48%, transparent)", textTransform: "uppercase" }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        spellCheck={false}
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "0.88rem",
          background: "#0a0806",
          border: `1px solid ${focused ? "color-mix(in srgb, var(--codex-accent) 50%, transparent)" : "color-mix(in srgb, var(--codex-accent) 18%, transparent)"}`,
          borderRadius: "2px",
          color: "rgba(220,205,170,0.9)",
          caretColor: "var(--codex-accent)",
          letterSpacing: "0.02em",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)",
          padding: "10px 14px",
          width: "100%",
          outline: "none",
          transition: "border-color 0.15s ease",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function OAuthButton({
  id,
  label,
  icon,
  onClick,
  disabled,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center justify-center gap-2.5 py-2.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        fontFamily: "Georgia, serif",
        fontSize: "0.78rem",
        letterSpacing: "0.06em",
        background: "transparent",
        border: `1px solid ${hovered && !disabled ? "color-mix(in srgb, var(--codex-accent) 35%, transparent)" : "rgba(80,65,45,0.65)"}`,
        borderRadius: "2px",
        color: hovered && !disabled ? "rgba(210,185,130,0.92)" : "rgba(160,140,100,0.65)",
        transition: "border-color 0.15s ease, color 0.15s ease",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
      style={{ borderColor: "color-mix(in srgb, var(--codex-accent) 20%, transparent)", borderTopColor: "color-mix(in srgb, var(--codex-accent) 70%, transparent)", animation: "sg-spin 0.7s linear infinite" }}
      aria-hidden="true"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main overlay
// ─────────────────────────────────────────────────────────────────────────────

type Mode = "signin" | "register";

export default function ScholarGate() {
  const { signInEmail, registerEmail, signInWithGoogle, signInWithGitHub, authError, clearError, enterAsGuest } =
    useAuth();

  const [mode, setMode]         = useState<Mode>("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy]         = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  // Focus email on mount
  useEffect(() => { emailRef.current?.focus(); }, []);

  const switchMode = useCallback((next: Mode) => {
    clearError();
    setMode(next);
    setEmail("");
    setPassword("");
  }, [clearError]);

  const run = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true);
    try { await fn(); } catch { /* surfaced via authError */ }
    finally { setBusy(false); }
  }, []);

  const handleEmailSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    clearError();
    if (mode === "signin") {
      run(() => signInEmail(email, password));
    } else {
      run(() => registerEmail(email, password));
    }
  }, [mode, email, password, clearError, run, signInEmail, registerEmail]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: "rgba(4,3,2,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        animation: "sg-fade 0.35s ease forwards",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Scholar identification gate"
    >
      {/* Card */}
      <div
        className="relative w-full max-w-sm flex flex-col px-8 pt-9 pb-8"
        style={{
          background: "linear-gradient(170deg, #161009 0%, #0e0b07 55%, #0a0806 100%)",
          border: "1px solid color-mix(in srgb, var(--codex-accent) 20%, transparent)",
          borderRadius: "3px",
          boxShadow: "0 0 80px color-mix(in srgb, var(--codex-accent) 6%, transparent), 0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,220,100,0.05)",
          animation: authError ? "sg-shake 0.45s cubic-bezier(.36,.07,.19,.97) forwards" : undefined,
        }}
      >

        {/* ── Header ── */}
        <div className="text-center mb-7">
          <p
            aria-hidden="true"
            style={{ fontFamily: "Georgia, serif", fontSize: "0.9rem", letterSpacing: "0.4em", color: "color-mix(in srgb, var(--codex-accent) 35%, transparent)", marginBottom: "0.75rem" }}
          >
            ✦ ✦ ✦
          </p>
          <h1
            style={{
              fontFamily: "var(--font-playfair), 'Palatino Linotype', Palatino, serif",
              fontSize: "1.2rem",
              fontWeight: 400,
              letterSpacing: "0.04em",
              color: "rgba(230,215,185,0.92)",
              marginBottom: "0.35rem",
            }}
          >
            {mode === "signin" ? "Welcome back, Scholar." : "Join the Archive."}
          </h1>
          <p
            className="italic"
            style={{ fontFamily: "Georgia, serif", fontSize: "0.73rem", color: "rgba(140,120,85,0.55)", letterSpacing: "0.02em" }}
          >
            {mode === "signin"
              ? "Sign in to continue your studies."
              : "Create an account to save your progress."}
          </p>
        </div>

        <div className="relative">
            {/* ── Email form ── */}
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3" noValidate>
              {/* Render a hidden input to pass the ref correctly */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="sg-email"
                  style={{ fontFamily: "Georgia, serif", fontSize: "0.56rem", letterSpacing: "0.25em", color: "color-mix(in srgb, var(--codex-accent) 48%, transparent)", textTransform: "uppercase" }}
                >
                  Email
                </label>
                <input
                  ref={emailRef}
                  id="sg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@archive.ac"
                  disabled={busy}
                  autoComplete="email"
                  spellCheck={false}
                  className="focus:outline-none"
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "0.88rem",
                    background: "#0a0806",
                    border: "1px solid color-mix(in srgb, var(--codex-accent) 18%, transparent)",
                    borderRadius: "2px",
                    color: "rgba(220,205,170,0.9)",
                    caretColor: "var(--codex-accent)",
                    boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)",
                    padding: "10px 14px",
                    width: "100%",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "color-mix(in srgb, var(--codex-accent) 50%, transparent)"; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = "color-mix(in srgb, var(--codex-accent) 18%, transparent)"; }}
                />
              </div>

              <DarkInput
                id="sg-password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder={mode === "register" ? "Min. 6 characters" : "••••••••"}
                disabled={busy}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                label="Password"
              />

              <button
                id="sg-submit"
                type="submit"
                disabled={busy || !email.trim() || !password}
                className="w-full flex items-center justify-center gap-2.5 mt-1 uppercase tracking-[0.22em] text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "Georgia, serif",
                  padding: "11px 0",
                  background: "linear-gradient(160deg, #1d1408 0%, #120e07 100%)",
                  border: "1px solid color-mix(in srgb, var(--codex-accent) 35%, transparent)",
                  borderRadius: "2px",
                  color: "color-mix(in srgb, var(--codex-accent) 88%, transparent)",
                  boxShadow: "0 0 24px color-mix(in srgb, var(--codex-accent) 7%, transparent), inset 0 1px 0 rgba(255,220,100,0.05)",
                }}
                onMouseEnter={(e) => {
                  if (!busy && email.trim() && password)
                    Object.assign(e.currentTarget.style, { color: "rgba(220,175,80,1)", borderColor: "color-mix(in srgb, var(--codex-accent) 60%, transparent)", boxShadow: "0 0 40px color-mix(in srgb, var(--codex-accent) 13%, transparent), inset 0 1px 0 rgba(255,220,100,0.08)" });
                }}
                onMouseLeave={(e) =>
                  Object.assign(e.currentTarget.style, { color: "color-mix(in srgb, var(--codex-accent) 88%, transparent)", borderColor: "color-mix(in srgb, var(--codex-accent) 35%, transparent)", boxShadow: "0 0 24px color-mix(in srgb, var(--codex-accent) 7%, transparent), inset 0 1px 0 rgba(255,220,100,0.05)" })
                }
              >
                {busy ? <Spinner /> : mode === "signin" ? "Enter the Archive" : "Register Scholar"}
              </button>
            </form>

            {/* ── Error message ── */}
            {authError && (
              <p
                className="mt-4 text-center italic"
                style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: "rgba(190,80,60,0.85)", lineHeight: 1.5 }}
                role="alert"
              >
                {authError}
              </p>
            )}

            <GoldDivider label="or continue with" />

            {/* ── OAuth buttons ── */}
            <div className="flex flex-col gap-2.5">
              <OAuthButton
                id="sg-google"
                label="Continue with Google"
                icon={<GoogleIcon />}
                onClick={() => run(signInWithGoogle)}
                disabled={busy}
              />
              <OAuthButton
                id="sg-github"
                label="Continue with GitHub"
                icon={<GitHubIcon />}
                onClick={() => run(signInWithGitHub)}
                disabled={busy}
              />
            </div>

            {/* ── Mode toggle ── */}
            <div className="mt-7 flex items-center justify-center gap-0 border" style={{ borderColor: "color-mix(in srgb, var(--codex-accent) 14%, transparent)", borderRadius: "2px", overflow: "hidden" }}>
              {(["signin", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  id={`sg-mode-${m}`}
                  type="button"
                  onClick={() => switchMode(m)}
                  className="flex-1 py-2 text-xs uppercase tracking-[0.18em] transition-all duration-200"
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "0.58rem",
                    background: mode === m ? "color-mix(in srgb, var(--codex-accent) 10%, transparent)" : "transparent",
                    color: mode === m ? "color-mix(in srgb, var(--codex-accent) 90%, transparent)" : "rgba(130,110,75,0.5)",
                    borderRight: m === "signin" ? "1px solid color-mix(in srgb, var(--codex-accent) 14%, transparent)" : "none",
                  }}
                  aria-pressed={mode === m}
                >
                  {m === "signin" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>
        </div>

        {/* ── Explore as Guest ── */}
        <button
          type="button"
          onClick={enterAsGuest}
          className="mt-5 w-full py-3 rounded-sm uppercase transition-all duration-200"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.68rem",
            letterSpacing: "0.12em",
            color: "rgba(180,160,110,0.75)",
            background: "color-mix(in srgb, var(--codex-accent) 5%, transparent)",
            border: "1px solid color-mix(in srgb, var(--codex-accent) 18%, transparent)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(210,185,130,0.95)";
            e.currentTarget.style.borderColor = "color-mix(in srgb, var(--codex-accent) 35%, transparent)";
            e.currentTarget.style.background = "color-mix(in srgb, var(--codex-accent) 10%, transparent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(180,160,110,0.75)";
            e.currentTarget.style.borderColor = "color-mix(in srgb, var(--codex-accent) 18%, transparent)";
            e.currentTarget.style.background = "color-mix(in srgb, var(--codex-accent) 5%, transparent)";
          }}
        >
          Explore as Guest
        </button>
        <p
          className="mt-2 text-center"
          style={{ fontFamily: "Georgia, serif", fontSize: "0.6rem", color: "rgba(140,120,85,0.35)", letterSpacing: "0.05em" }}
        >
          Progress will not be saved
        </p>

        {/* Footer */}
        <p
          className="mt-6 text-center"
          aria-hidden="true"
          style={{ fontFamily: "Georgia, serif", fontSize: "0.55rem", letterSpacing: "0.45em", color: "color-mix(in srgb, var(--codex-accent) 18%, transparent)" }}
        >
          — CODEX MATHEMATICA —
        </p>
      </div>

      <style>{`
        @keyframes sg-fade  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sg-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes sg-spin  { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
