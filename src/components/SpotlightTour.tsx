"use client";

import { useState, useEffect } from "react";
import { useProgress } from "@/context/ProgressContext";
import { X, HelpCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { AppArea } from "./ThemeRoot";

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  onEnter?: () => void; // Used to auto-navigate
}

export interface SpotlightTourProps {
  steps: TourStep[];
  activeArea: AppArea;
}

export default function SpotlightTour({ steps, activeArea }: SpotlightTourProps) {
  const { hasSeenTour, markTourSeen } = useProgress();
  const { activeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = steps[stepIndex];

  // Auto-trigger if they haven't seen it
  useEffect(() => {
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  // Handle onEnter actions (like auto-navigating)
  useEffect(() => {
    if (isOpen && currentStep?.onEnter) {
      currentStep.onEnter();
    }
  }, [isOpen, stepIndex, currentStep]);

  // Track the target element's position
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    const updateRect = () => {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null); // Element might not be rendered yet
      }
    };

    updateRect();
    // Re-check periodically in case of animations/layout shifts
    const interval = setInterval(updateRect, 100);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen, currentStep]);

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

  // Determine popover position based on targetRect
  let popoverStyle: React.CSSProperties = {};
  if (targetRect) {
    // Default to below the element
    let top = targetRect.bottom + 16;
    let left = targetRect.left + targetRect.width / 2;
    let transformX = "-50%";
    let transformY = "0";

    const estimatedHeight = 300;

    // If it would go off the bottom of the screen, try placing it above
    if (top + estimatedHeight > window.innerHeight) {
      const topAbove = targetRect.top - 16;
      if (topAbove - estimatedHeight > 16) {
        // Safe to place above
        top = topAbove;
        transformY = "-100%";
      } else {
        // Target is too big (takes up whole screen), place in middle of screen
        top = window.innerHeight / 2;
        left = window.innerWidth / 2;
        transformX = "-50%";
        transformY = "-50%";
      }
    }
    
    if (transformY !== "-50%") {
      // Prevent horizontal overflow
      if (left < 200) {
        left = Math.max(16, targetRect.left);
        transformX = "0";
      } else if (left + 200 > window.innerWidth) {
        left = Math.min(window.innerWidth - 16, targetRect.right);
        transformX = "-100%";
      }
    }

    popoverStyle = {
      top: `${top}px`,
      left: `${left}px`,
      transform: `translate(${transformX}, ${transformY})`,
      position: "fixed",
    };
  } else {
    // Fallback if element not found: center of screen
    popoverStyle = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      position: "fixed",
    };
  }

  // Theme adaptations for the Help Button
  let btnClasses = "bg-amber-500 text-white hover:bg-amber-600";
  if (activeTheme === "theme-student-mixtape") btnClasses = "bg-fuchsia-600 text-white hover:bg-fuchsia-700 shadow-[4px_4px_0_#000] border-2 border-black rounded-none";
  if (activeTheme === "theme-windows-xp") btnClasses = "bg-blue-600 text-white hover:bg-blue-700 border-2 border-white shadow-md rounded-none";
  if (activeTheme === "theme-diner") btnClasses = "bg-red-600 text-white hover:bg-red-700 shadow-[0_0_10px_rgba(220,38,38,0.8)] border-2 border-red-800";
  if (activeTheme === "theme-scribble") btnClasses = "bg-[#fff9c4] text-stone-800 border-[3px] border-stone-800 hover:bg-[#ffc0cb] shadow-[4px_4px_0_#333]";

  return (
    <>
      <button
        onClick={() => {
          setStepIndex(0);
          setIsOpen(true);
        }}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 z-40 ${btnClasses}`}
        aria-label="Help"
        style={activeTheme === "theme-scribble" ? { borderRadius: "4px 8px 3px 6px", transform: "rotate(-3deg)" } : {}}
      >
        <HelpCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-auto">
          {/* SVG Overlay to cut out the spotlight hole */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                {targetRect && (
                  <rect
                    x={targetRect.left - 8}
                    y={targetRect.top - 8}
                    width={targetRect.width + 16}
                    height={targetRect.height + 16}
                    rx="8"
                    fill="black"
                    className="transition-all duration-300 ease-out"
                  />
                )}
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.6)"
              mask="url(#spotlight-mask)"
            />
          </svg>

          {/* Interactive target blocker so users don't accidentally click things while touring */}
          {targetRect && (
            <div 
              className="absolute z-[101]"
              style={{
                left: targetRect.left - 8,
                top: targetRect.top - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                cursor: "pointer"
              }}
              onClick={handleNext}
            />
          )}

          {/* The Popover Callout */}
          <div
            className="z-[102] w-[320px] bg-white border-2 border-stone-800 rounded-xl shadow-[8px_8px_0_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 ease-out"
            style={popoverStyle}
          >
            <div className="bg-amber-300 p-3 border-b-2 border-stone-800 flex justify-between items-center">
              <h3 className="font-bold text-stone-900 font-sans tracking-wide">{currentStep?.title}</h3>
              <button onClick={handleClose} className="text-stone-700 hover:text-stone-900">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 bg-amber-50">
              <p className="text-stone-700 font-medium leading-relaxed">{currentStep?.content}</p>
            </div>

            <div className="p-3 bg-amber-100 border-t-2 border-stone-800 flex justify-between items-center">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all ${i === stepIndex ? 'w-4 bg-stone-800' : 'w-2 bg-stone-400'}`} />
                ))}
              </div>
              <div className="flex gap-2">
                {stepIndex > 0 && (
                  <button onClick={handlePrev} className="px-2 py-1 text-stone-600 font-bold hover:bg-amber-200 rounded transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                )}
                <button 
                  onClick={handleNext} 
                  className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded flex items-center shadow-[2px_2px_0_rgba(0,0,0,0.5)] transition-transform active:translate-y-px active:shadow-none"
                >
                  {stepIndex === steps.length - 1 ? "Finish" : "Next"} 
                  {stepIndex < steps.length - 1 && <ChevronRight size={16} className="ml-1" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
