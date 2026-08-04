import { useMemo, useState } from "react";
import { TECHNIQUE_ROWS, type Technique } from "@/data/techniques";

function getTechniqueOfTheDay(): Technique {
  const allTechniques = TECHNIQUE_ROWS.flatMap((row) => row.techniques);
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return allTechniques[dayOfYear % allTechniques.length];
}

export function useLibraryLogic() {
  const [activeTechnique, setActiveTechnique] = useState<Technique | null>(null);
  const todaysTechnique = useMemo(() => getTechniqueOfTheDay(), []);

  return {
    activeTechnique,
    setActiveTechnique,
    todaysTechnique,
    techniqueRows: TECHNIQUE_ROWS,
  };
}
