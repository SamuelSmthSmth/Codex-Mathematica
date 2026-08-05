import React from 'react';
import { Flame, AlertTriangle } from 'lucide-react';

interface WipeProgressWidgetProps {
  wipeConfirmStep: number;
  setWipeConfirmStep: (step: number) => void;
  wipeInput: string;
  setWipeInput: (input: string) => void;
  handleWipeClick: () => void;
  handleWipeConfirm: () => void;
  isLightMode?: boolean;
}

export default function WipeProgressWidget({
  wipeConfirmStep,
  setWipeConfirmStep,
  wipeInput,
  setWipeInput,
  handleWipeClick,
  handleWipeConfirm,
  isLightMode = false,
}: WipeProgressWidgetProps) {
  if (wipeConfirmStep === 0) {
    return (
      <button
        onClick={handleWipeClick}
        className="flex items-center gap-3 w-full text-left py-2 px-3 transition-colors duration-200 hover:bg-red-900/10 text-red-700 dark:text-red-500/80 mt-2"
        style={{
          border: isLightMode ? "1px solid #fecaca" : "1px solid rgba(180,50,50,0.2)",
          borderRadius: "2px",
          background: "transparent",
        }}
      >
        <Flame size={16} />
        <span style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem" }}>
          Wipe All Progress
        </span>
      </button>
    );
  }

  return (
    <div className={`mt-2 p-3 border rounded-sm flex flex-col gap-2 ${isLightMode ? 'bg-red-50 border-red-200 text-red-900' : 'bg-red-950/20 border-red-900/50 text-red-400'}`}>
      <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
        <AlertTriangle size={14} />
        Danger Zone
      </div>
      <p className="text-xs" style={{ fontFamily: "Georgia, serif" }}>
        Type <strong>START FROM SCRATCH</strong> to confirm complete wipe of all data.
      </p>
      <input 
        type="text"
        value={wipeInput}
        onChange={(e) => setWipeInput(e.target.value)}
        placeholder="START FROM SCRATCH"
        className="w-full px-2 py-1 text-sm bg-black/10 border border-red-500/30 rounded-sm focus:outline-none focus:border-red-500"
      />
      <div className="flex gap-2 mt-1">
        <button 
          onClick={() => { setWipeConfirmStep(0); setWipeInput(''); }}
          className="flex-1 py-1 text-xs border border-stone-500/30 rounded-sm hover:bg-black/10"
        >
          Cancel
        </button>
        <button 
          onClick={handleWipeConfirm}
          disabled={wipeInput !== 'START FROM SCRATCH'}
          className="flex-1 py-1 text-xs border border-red-500/50 bg-red-500/20 rounded-sm hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
        >
          Confirm Wipe
        </button>
      </div>
    </div>
  );
}
