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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const todaysTechnique = useMemo(() => getTechniqueOfTheDay(), []);

  const allTechniques = useMemo(() => TECHNIQUE_ROWS.flatMap((row) => row.techniques), []);

  const filteredTechniques = useMemo(() => {
    let result = allTechniques;
    if (activeCategory) {
      const rowWithCat = TECHNIQUE_ROWS.find(r => r.title === activeCategory || r.id === activeCategory);
      if (rowWithCat) result = result.filter(t => rowWithCat.techniques.includes(t));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    return result;
  }, [allTechniques, searchQuery, activeCategory]);

  return {
    activeTechnique,
    setActiveTechnique,
    todaysTechnique,
    techniqueRows: TECHNIQUE_ROWS,
    TECHNIQUE_ROWS,
    searchQuery,
    setSearchQuery,
    filteredTechniques,
    activeCategory,
    setActiveCategory,
  };
}
