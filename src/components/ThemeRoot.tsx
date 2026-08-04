"use client";

import { useTheme } from "@/context/ThemeContext";
import ThemeDefault from "@/themes/ThemeDefault";
import ThemeMixtape from "@/themes/ThemeMixtape";
import ThemeDiner from "@/themes/ThemeDiner";
import ThemeWindowsXP from "@/themes/ThemeWindowsXP";
import ThemeModernDesktop from "@/themes/ThemeModernDesktop";
import ThemeScribble from "@/themes/ThemeScribble";
import OnboardingTour from "./OnboardingTour";
import ProfilePanelDefault from "./ProfilePanelDefault";

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
      themeContent = <ThemeMixtape activeArea={activeArea} onSelectArea={onSelectArea} isProfileOpen={isProfileOpen} onCloseProfile={onCloseProfile} />;
      break;
    case "theme-diner":
      themeContent = <ThemeDiner activeArea={activeArea} onSelectArea={onSelectArea} isProfileOpen={isProfileOpen} onCloseProfile={onCloseProfile} />;
      break;
    case "theme-windows-xp":
      themeContent = <ThemeWindowsXP activeArea={activeArea} onSelectArea={onSelectArea} onOpenProfile={onOpenProfile} isProfileOpen={isProfileOpen} onCloseProfile={onCloseProfile} />;
      break;
    case "theme-modern-desktop":
      themeContent = <ThemeModernDesktop activeArea={activeArea} onSelectArea={onSelectArea} onOpenProfile={onOpenProfile} isProfileOpen={isProfileOpen} onCloseProfile={onCloseProfile} />;
      break;
    case "theme-scribble":
      themeContent = <ThemeScribble activeArea={activeArea} onSelectArea={onSelectArea} isProfileOpen={isProfileOpen} onCloseProfile={onCloseProfile} />;
      break;
    default:
      themeContent = <ThemeDefault activeArea={activeArea} onSelectArea={onSelectArea} />;
      break;
  }

  return (
    <>
      {themeContent}
      <OnboardingTour activeArea={activeArea} />
      {activeTheme === "theme-student-mixtape" ? null : 
       activeTheme === "theme-diner" ? null :
       activeTheme === "theme-windows-xp" ? null :
       activeTheme === "theme-modern-desktop" ? null :
       activeTheme === "theme-scribble" ? null :
       <ProfilePanelDefault isOpen={isProfileOpen} onClose={onCloseProfile} />}
    </>
  );
}
