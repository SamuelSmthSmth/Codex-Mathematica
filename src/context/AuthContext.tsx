"use client";

/**
 * src/context/AuthContext.tsx
 *
 * Scholar authentication context supporting:
 *   - Email + Password (sign-in & registration)
 *   - Google OAuth (popup)
 *   - GitHub OAuth (popup)
 *
 * Exports:
 *   scholar           → Firebase User | null  (globally available for Profile page)
 *   loading           → true while onAuthStateChanged resolves
 *   authError         → last Archive-flavoured error string | null
 *   signInEmail()     → email + password sign-in
 *   registerEmail()   → create account; stamps displayName from email prefix
 *   signInWithGoogle()
 *   signInWithGitHub()
 *   signOut()
 *   updateScholarName() → wrapper for updateProfile, re-syncs local state
 *   clearError()
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  updateProfile,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthContextValue {
  /** The currently authenticated Firebase User, or null if signed out. */
  scholar: User | null;
  /** True while the initial auth state is still resolving. */
  loading: boolean;
  /** Last human-readable Firebase Auth error, or null. */
  authError: string | null;

  /** True if the user bypassed authentication as a guest. */
  isGuestMode: boolean;
  /** Enter the library without saving data. */
  enterAsGuest: () => void;

  signInEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * Update the current scholar's display name.
   * Wraps updateProfile and syncs local state immediately.
   */
  updateScholarName: (newName: string) => Promise<void>;
  clearError: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error normaliser
// ─────────────────────────────────────────────────────────────────────────────

function parseFirebaseError(code: string): string {
  const map: Record<string, string> = {
    "auth/invalid-email":
      "That does not appear to be a valid email address.",
    "auth/user-not-found":
      "No Scholar exists under that address. Perhaps register?",
    "auth/wrong-password":
      "The password does not match our records. Try again.",
    "auth/invalid-credential":
      "Invalid email or password. Verify your credentials.",
    "auth/email-already-in-use":
      "A Scholar already bears this address. Try signing in.",
    "auth/weak-password":
      "Your password must be at least 6 characters.",
    "auth/too-many-requests":
      "Too many failed attempts. The Archive is temporarily sealed.",
    "auth/popup-closed-by-user":
      "The portal was closed before identification was complete.",
    "auth/popup-blocked":
      "Your browser blocked the portal. Allow popups and try again.",
    "auth/cancelled-popup-request":
      "A previous portal was still open. Please try again.",
    "auth/account-exists-with-different-credential":
      "This address is bound to a different sign-in method.",
    "auth/network-request-failed":
      "A network error occurred. Check your connection and retry.",
    "auth/operation-not-allowed":
      "This sign-in method has not been enabled in the Archive.",
  };
  return map[code] ?? "An unknown error has sealed the gate. Please try again.";
}

/** Extract the display-name prefix from an email address. */
function emailToName(email: string): string {
  return email.split("@")[0].replace(/[._-]+/g, " ").trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [scholar, setScholar] = useState<User | null>(null);
  const [loading, setLoading]  = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setScholar(user);
      setLoading(false);
    });
    return unsub;
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);
  const enterAsGuest = useCallback(() => setIsGuestMode(true), []);

  // ── helpers ──────────────────────────────────────────────────────────────

  const wrapAuth = useCallback(
    async (fn: () => Promise<void>) => {
      setAuthError(null);
      try {
        await fn();
      } catch (err: unknown) {
        const code = (err as { code?: string }).code ?? "";
        setAuthError(parseFirebaseError(code));
        throw err;
      }
    },
    [],
  );

  // ── email ─────────────────────────────────────────────────────────────────

  const signInEmail = useCallback(
    (email: string, password: string) =>
      wrapAuth(() => signInWithEmailAndPassword(auth, email, password).then(() => {})),
    [wrapAuth],
  );

  const registerEmail = useCallback(
    (email: string, password: string) =>
      wrapAuth(async () => {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = emailToName(email);
        await updateProfile(user, { displayName });
        // Sync state immediately — onAuthStateChanged won't re-fire for a profile update
        setScholar({ ...user, displayName } as User);
      }),
    [wrapAuth],
  );

  // ── OAuth ─────────────────────────────────────────────────────────────────

  const signInWithGoogle = useCallback(
    () => wrapAuth(() => signInWithPopup(auth, new GoogleAuthProvider()).then(() => {})),
    [wrapAuth],
  );

  const signInWithGitHub = useCallback(
    () => wrapAuth(() => signInWithPopup(auth, new GithubAuthProvider()).then(() => {})),
    [wrapAuth],
  );

  // ── profile ───────────────────────────────────────────────────────────────

  const updateScholarName = useCallback(async (newName: string) => {
    const user = auth.currentUser;
    if (!user) return;
    await updateProfile(user, { displayName: newName.trim() });
    setScholar({ ...user, displayName: newName.trim() } as User);
  }, []);

  // ── sign out ──────────────────────────────────────────────────────────────

  const signOut = useCallback(async () => {
    setAuthError(null);
    setIsGuestMode(false);
    await firebaseSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        scholar,
        loading,
        authError,
        isGuestMode,
        enterAsGuest,
        signInEmail,
        registerEmail,
        signInWithGoogle,
        signInWithGitHub,
        signOut,
        updateScholarName,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      "useAuth must be called inside <AuthProvider>. " +
      "Ensure your root layout wraps children with <AuthProvider>.",
    );
  }
  return ctx;
}
