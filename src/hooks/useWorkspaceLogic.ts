import { useState, useCallback, useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useProgress, type SelfGrade } from "@/context/ProgressContext";
import type { Volume, Fragment } from "@/data/codex-data";

export type GradePhase = "problem" | "revealed" | "graded";

export function useWorkspaceLogic({
  volume,
  chapterIndex,
  fragment,
}: {
  volume: Volume;
  chapterIndex: number;
  fragment: Fragment;
  // Legacy params kept for API compatibility but unused now that we use local grimoire
  cachedData?: any;
  onCacheUpdate?: (fragId: number, data: any) => void;
}) {
  const [gradePhase, setGradePhase] = useState<GradePhase>("problem");

  const { isGuestMode } = useAuth();
  const { addCredits, recordSolve, saveGrimoireEntry, getGrimoireGrade } = useProgress();

  // ── Hydration: check local grimoire first ─────────────────────────────────
  useEffect(() => {
    setGradePhase("problem");

    const existingGrade = getGrimoireGrade(fragment.id);
    if (existingGrade !== null) {
      // Already in local save — jump straight to graded state
      setGradePhase("graded");
    }
  }, [fragment.id, getGrimoireGrade]);

  // ── Derived state from local grimoire ──────────────────────────────────────
  const chosenGrade = getGrimoireGrade(fragment.id);
  const isAlreadyConquered = chosenGrade !== null;

  // ── Grade handler ─────────────────────────────────────────────────────────
  const handleGrade = useCallback(
    async (grade: SelfGrade) => {
      const wasAlreadyConquered = getGrimoireGrade(fragment.id) !== null;

      // 1. Write to local grimoire (source of truth)
      saveGrimoireEntry(fragment.id, grade, volume.id, chapterIndex);
      setGradePhase("graded");

      // 2. Award credits and record solve only on first attempt
      if (!wasAlreadyConquered) {
        addCredits(grade);
        if (grade !== "wrong") {
          recordSolve(volume.id);
        }
      }

      // 3. Background sync to Firestore (best-effort, non-blocking)
      if (!isGuestMode && auth.currentUser) {
        try {
          const docRef = doc(
            db,
            "users",
            auth.currentUser.uid,
            "grimoire",
            String(fragment.id)
          );
          await setDoc(
            docRef,
            {
              fragment_id: fragment.id,
              volume: volume.id,
              chapter: chapterIndex,
              grade,
              sealed_at: serverTimestamp(),
            },
            { merge: true }
          );
          window.dispatchEvent(new Event("grimoire-updated"));
        } catch {
          // Silently ignore — local save is the source of truth
        }
      }
    },
    [
      fragment.id,
      volume.id,
      chapterIndex,
      isGuestMode,
      getGrimoireGrade,
      saveGrimoireEntry,
      addCredits,
      recordSolve,
    ]
  );

  // ── Reset (try again) ─────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setGradePhase("problem");
  }, []);

  return {
    gradePhase,
    setGradePhase,
    chosenGrade,
    isAlreadyConquered,
    handleGrade,
    handleRetry,
  };
}
