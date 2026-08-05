"use client";

import { useTheme } from "@/context/ThemeContext";
import ThemeDefault from "@/themes/ThemeDefault";
import ThemeMixtape from "@/themes/ThemeMixtape";
import ThemeDiner from "@/themes/ThemeDiner";
import ThemeWindowsXP from "@/themes/ThemeWindowsXP";
import ThemeModernDesktop from "@/themes/ThemeModernDesktop";
import ThemeScribble from "@/themes/ThemeScribble";
import SpotlightTour, { TourStep } from "./SpotlightTour";

export type AppArea = "archive" | "library" | "shop";

export interface ThemeProps {
  activeArea: AppArea;
  onSelectArea: (area: AppArea) => void;
  onOpenProfile?: () => void;
  isProfileOpen: boolean;
  onCloseProfile: () => void;
}

export default function ThemeRoot({ activeArea, onSelectArea, onOpenProfile, isProfileOpen, onCloseProfile }: ThemeProps) {
  const { activeTheme } = useTheme();

  let themeContent: React.ReactNode;

  switch (activeTheme) {
    case "theme-student-mixtape":
      themeContent = <ThemeMixtape activeArea={activeArea} onSelectArea={onSelectArea} onOpenProfile={onOpenProfile} isProfileOpen={isProfileOpen} onCloseProfile={onCloseProfile} />;
      break;
    case "theme-diner":
      themeContent = <ThemeDiner activeArea={activeArea} onSelectArea={onSelectArea} onOpenProfile={onOpenProfile} isProfileOpen={isProfileOpen} onCloseProfile={onCloseProfile} />;
      break;
    case "theme-windows-xp":
      themeContent = <ThemeWindowsXP activeArea={activeArea} onSelectArea={onSelectArea} onOpenProfile={onOpenProfile} isProfileOpen={isProfileOpen} onCloseProfile={onCloseProfile} />;
      break;
    case "theme-modern-desktop":
      themeContent = <ThemeModernDesktop activeArea={activeArea} onSelectArea={onSelectArea} onOpenProfile={onOpenProfile} isProfileOpen={isProfileOpen} onCloseProfile={onCloseProfile} />;
      break;
    case "theme-scribble":
      themeContent = <ThemeScribble activeArea={activeArea} onSelectArea={onSelectArea} onOpenProfile={onOpenProfile} isProfileOpen={isProfileOpen} onCloseProfile={onCloseProfile} />;
      break;
    default:
      themeContent = <ThemeDefault activeArea={activeArea} onSelectArea={onSelectArea} onOpenProfile={onOpenProfile} isProfileOpen={isProfileOpen} onCloseProfile={onCloseProfile} />;
      break;
  }

  const tourSteps: TourStep[] = [
    {
      targetId: "tour-volume-shelf",
      title: "Welcome to the Archive",
      content: "This is where your mathematical journey begins. The Archive contains all the Volumes of knowledge.",
      onEnter: () => onSelectArea("archive")
    },
    {
      targetId: "tour-shop-themes",
      title: "The Store: Themes",
      content: "Spend credits you earn by solving problems to customize your experience with new themes.",
      onEnter: () => onSelectArea("shop")
    },
    {
      targetId: "tour-shop-archives",
      title: "The Store: Expansions",
      content: "You can also purchase Expansion Packs to unlock new volumes and harder problems.",
      onEnter: () => onSelectArea("shop")
    },
    {
      targetId: "tour-library-list",
      title: "The Library",
      content: "A collection of techniques and formulas. Reference these when you're stuck on a problem.",
      onEnter: () => onSelectArea("library")
    }
  ];

  return (
    <>
      {themeContent}
      <SpotlightTour steps={tourSteps} activeArea={activeArea} />
    </>
  );
}
