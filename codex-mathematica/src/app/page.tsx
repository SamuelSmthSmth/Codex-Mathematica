"use client";

import CodexWorkspace from "@/components/CodexWorkspace";
import ScholarGate from "@/components/ScholarGate";
import ProfilePanel from "@/components/ProfilePanel";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { scholar, loading, isGuestMode } = useAuth();

  return (
    <main>
      {/* Workspace is always mounted so fonts/assets pre-load;
          ScholarGate overlays it with a fixed full-screen backdrop. */}
      <CodexWorkspace />
      <ProfilePanel />
      {!loading && !scholar && !isGuestMode && <ScholarGate />}
    </main>
  );
}
