import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { collection, getCountFromServer, getDocs, query, orderBy, writeBatch } from "firebase/firestore";
import { db, isConfigured } from "@/lib/firebase";
import { useProgress } from "@/context/ProgressContext";
import { SHOP_ITEMS } from "@/data/shop-items";

export function useProfileLogic(isOpen: boolean) {
  const { scholar, isGuestMode, signOut, updateScholarName } = useAuth();
  const { isLightMode, toggleTheme, isFocusMode, setIsFocusMode, setPrintData, activeThemeName, activeThemeId } = useTheme();
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [conqueredCount, setConqueredCount] = useState<number | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [editedName, setEditedName] = useState("");
  const { equippedItems, equipItem, wipeProgress } = useProgress();
  
  // Wipe Progress State
  const [wipeConfirmStep, setWipeConfirmStep] = useState(0);
  const [wipeInput, setWipeInput] = useState("");

  const handleWipeClick = useCallback(() => {
    if (wipeConfirmStep === 0) setWipeConfirmStep(1);
  }, [wipeConfirmStep]);

  const handleWipeConfirm = useCallback(() => {
    if (wipeConfirmStep === 1 && wipeInput === "START FROM SCRATCH") {
      const confirm = window.confirm("Are you absolutely sure? This will permanently erase ALL your progress.");
      if (confirm) {
        wipeProgress();
        setWipeConfirmStep(0);
        setWipeInput("");
        window.location.reload();
      }
    }
  }, [wipeConfirmStep, wipeInput, wipeProgress]);

  const activeBannerId = equippedItems["banners"];
  const activeBanner = SHOP_ITEMS.find((item) => item.id === activeBannerId);

  useEffect(() => {
    if (!isConfigured || !scholar || isGuestMode || !isOpen) return;

    getCountFromServer(collection(db, "users", scholar.uid, "grimoire"))
      .then(snap => setConqueredCount(snap.data().count))
      .catch(() => setConqueredCount(0));
  }, [scholar, isGuestMode, isOpen]);

  const handleExport = useCallback(async () => {
    if (!scholar || !isConfigured) return;
    try {
      const q = query(
        collection(db, "users", scholar.uid, "grimoire"),
        orderBy("volume"),
        orderBy("chapter"),
        orderBy("fragment_id")
      );
      const snap = await getDocs(q);
      
      let markdownContent = `# Codex Mathematica Grimoire\n\nScholar: ${scholar.displayName || "Unknown"}\n\n---\n\n`;
      
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        markdownContent += `## Volume ${data.volume}, Chapter ${data.chapter}, Fragment ${data.fragment_id}\n\n`;
        markdownContent += `${data.proof_markdown}\n\n---\n\n`;
      });
      
      const blob = new Blob([markdownContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "My_Grimoire.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export grimoire", err);
    }
  }, [scholar]);

  const handleExportPdf = useCallback(async () => {
    if (!scholar || !isConfigured) return;
    setIsGeneratingPdf(true);
    try {
      const q = query(
        collection(db, "users", scholar.uid, "grimoire"),
        orderBy("volume"),
        orderBy("chapter"),
        orderBy("fragment_id")
      );
      const snap = await getDocs(q);
      
      const proofs: any[] = [];
      const mastery: Record<string, number> = {};
      
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const vol = data.volume as string;
        proofs.push({
          volume: vol,
          chapter: data.chapter as number,
          fragment_id: data.fragment_id as number,
          proof_markdown: data.proof_markdown as string,
        });
        
        mastery[vol] = (mastery[vol] || 0) + 1;
      });
      
      setPrintData({
        scholarName: scholar.displayName || "Unknown Scholar",
        proofs,
        mastery,
      });

      // Wait a tick for React to render the PrintableManuscript in the background
      setTimeout(() => {
        window.print();
        setIsGeneratingPdf(false);
      }, 500);
      
    } catch (err) {
      console.error("Failed to prepare PDF data", err);
      setIsGeneratingPdf(false);
    }
  }, [scholar, setPrintData]);

  const handleBurn = useCallback(async () => {
    if (!scholar || !isConfigured) return;
    const confirmed = window.confirm("Are you sure you want to burn your Grimoire? This will delete all saved proofs permanently.");
    if (!confirmed) return;

    try {
      const snap = await getDocs(collection(db, "users", scholar.uid, "grimoire"));
      const batch = writeBatch(db);
      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      
      setConqueredCount(0);
      window.dispatchEvent(new Event("grimoire-updated"));
    } catch (err) {
      console.error("Failed to burn grimoire", err);
    }
  }, [scholar]);

  useEffect(() => {
    setEditedName(scholar?.displayName ?? (isGuestMode ? "Guest Scholar" : ""));
  }, [scholar?.displayName, isGuestMode, isOpen]);

  const handleUpdateName = useCallback(async () => {
    if (!scholar || isGuestMode || !editedName.trim() || editedName === scholar.displayName) return;
    setIsSavingName(true);
    try {
      await updateScholarName(editedName);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch {
      // Ignored for now
    } finally {
      setIsSavingName(false);
    }
  }, [scholar, isGuestMode, editedName, updateScholarName]);

  const getProviderLabel = useCallback(() => {
    if (isGuestMode) return "Guest Account";
    if (!scholar) return "";
    const provider = scholar.providerData[0]?.providerId;
    if (provider === "google.com") return "Google Scholar";
    if (provider === "github.com") return "GitHub Scholar";
    return "Archive Scholar (Email)";
  }, [isGuestMode, scholar]);

  const avatarUrl = scholar?.photoURL;

  return {
    scholar,
    isGuestMode,
    signOut,
    isLightMode,
    toggleTheme,
    isFocusMode,
    setIsFocusMode,
    activeThemeName,
    activeThemeId,
    activeBanner,
    equippedItems,
    equipItem,
    isSavingName,
    nameSaved,
    conqueredCount,
    isGeneratingPdf,
    editedName,
    setEditedName,
    handleExport,
    handleExportPdf,
    handleBurn,
    handleUpdateName,
    getProviderLabel,
    avatarUrl,
    wipeConfirmStep,
    setWipeConfirmStep,
    wipeInput,
    setWipeInput,
    handleWipeClick,
    handleWipeConfirm
  };
}
