"use client";

import { useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import MathRenderer from "@/components/MathRenderer";
import type { Fragment } from "@/data/codex-data";

function MathBlock({ value }: { value: string }) {
  return <MathRenderer className="shareable-math" value={value} />;
}

export default function ShareableProblem({ fragment }: { fragment: Fragment }) {
  const [revealed, setRevealed] = useState(false);
  const [grade, setGrade] = useState<string | null>(null);

  return (
    <section className="shareable-problem" aria-label={`Problem ${fragment.id}`}>
      <div className="shareable-problem-heading">
        <span>Fragment {String(fragment.id).padStart(5, "0")}</span>
        <span>{fragment.answer_type === "hybrid" ? "Written response" : "Self-graded"}</span>
      </div>
      <div className="shareable-problem-body">
        <p className="public-eyebrow">The prompt</p>
        <MathBlock value={fragment.problem_latex} />
      </div>
      {!revealed ? (
        <button className="public-button public-button-dark" onClick={() => setRevealed(true)}>
          <Eye size={15} /> Reveal solution
        </button>
      ) : (
        <div className="shareable-solution">
          <div>
            <p className="public-eyebrow">The solution</p>
            <MathBlock value={fragment.solution_latex} />
          </div>
          <div className="shareable-grade" aria-label="Self grade">
            <span>How did it go?</span>
            <div className="shareable-grade-buttons">
              {(["Correct", "Close", "Needs work"] as const).map((label) => (
                <button
                  key={label}
                  className={grade === label ? "is-selected" : ""}
                  onClick={() => setGrade(label)}
                >
                  {grade === label && <Check size={12} />}{label}
                </button>
              ))}
            </div>
          </div>
          <button className="public-text-button" onClick={() => { setRevealed(false); setGrade(null); }}>
            <EyeOff size={13} /> Hide solution
          </button>
        </div>
      )}
    </section>
  );
}
