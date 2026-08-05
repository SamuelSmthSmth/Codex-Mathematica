"use client";

import { useState, useEffect } from "react";
import { useProgress } from "@/context/ProgressContext";
import { X, HelpCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { AppArea } from "./ThemeRoot";

// Define the steps for each area
const TOUR_STEPS: Record<AppArea, { targetId?: string; title: string; content: string; position?: "top" | "bottom" | "left" | "right" | "center" }[]> = {
  archive: [
    {
      title: "Welcome to the Archive",
      content: "This is where your magical mathematics journey begins. The Archive contains all the Volumes of knowledge.",
      position: "center",
    },
    {
      title: "Select a Volume",
      content: "Click on any volume (like Alpha or Gamma) to open it. Each volume focuses on a different area of mathematics.",
      position: "center",
    },
    {
      title: "Solve Problems",
      content: "Inside a volume, select a chapter and then a problem. Write your answer, reveal the solution, and grade yourself honestly to earn credits!",
      position: "center",
    }
  ],
  shop: [
    {
      title: "Welcome to the Mall",
      content: "Here you can spend the credits you've earned by solving problems.",
      position: "center",
    },
    {
      title: "Themes and Expansions",
      content: "Purchase new visual themes to change how the app looks, or buy Expansion Packs to unlock harder problems.",
      position: "center",
    }
  ],
  library: [
    {
      title: "The Library",
      content: "A collection of techniques, formulas, and reference materials. Use these when you're stuck on a problem.",
      position: "center",
    }
  ]
};

export default function OnboardingTour({ activeArea }: { activeArea: AppArea }) {
  const { hasSeenTour, markTourSeen } = useProgress();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Auto-trigger if they haven't seen it
  useEffect(() => {
    if (!hasSeenTour) {
      // Small delay to let the page render
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  const steps = TOUR_STEPS[activeArea];
  const currentStep = steps[stepIndex];

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    markTourSeen();
  };

  return (
    <>
      <button
        onClick={() => {
          setStepIndex(0);
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center hover:bg-amber-600 transition-transform hover:scale-110 z-40"
        aria-label="Help"
      >
        <HelpCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[#fcfaf7] border border-amber-500/30 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-amber-100/50 p-4 border-b border-amber-200/50 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-amber-900">{currentStep.title}</h3>
              <button onClick={handleClose} className="text-amber-700 hover:text-amber-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-stone-700 text-lg leading-relaxed">{currentStep.content}</p>
            </div>
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all ${i === stepIndex ? 'w-6 bg-amber-500' : 'w-2 bg-amber-200'}`} />
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleClose} className="px-4 py-2 text-stone-500 font-medium hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors flex items-center">
                  Skip Tour
                </button>
                {stepIndex > 0 && (
                  <button onClick={handlePrev} className="px-4 py-2 text-stone-600 font-semibold hover:bg-stone-200 rounded-lg transition-colors flex items-center">
                    <ChevronLeft size={16} className="mr-1" /> Back
                  </button>
                )}
                <button onClick={handleNext} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow transition-colors flex items-center">
                  {stepIndex === steps.length - 1 ? "Finish" : "Next"} {stepIndex < steps.length - 1 && <ChevronRight size={16} className="ml-1" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
