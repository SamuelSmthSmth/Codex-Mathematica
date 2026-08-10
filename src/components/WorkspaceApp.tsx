"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeRoot, { type AppArea } from "@/components/ThemeRoot";

export default function WorkspaceApp({ initialArea = "archive" }: { initialArea?: AppArea }) {
  const router = useRouter();
  const [activeArea, setActiveArea] = useState<AppArea>(initialArea);

  return (
    <main className="relative h-screen overflow-hidden">
      <div className="h-full overflow-hidden perspective-[2000px]">
        <ThemeRoot
          activeArea={activeArea}
          onSelectArea={setActiveArea}
          isProfileOpen={false}
          onCloseProfile={() => undefined}
          onOpenProfile={() => router.push("/profile")}
        />
      </div>
    </main>
  );
}
