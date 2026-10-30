import React from 'react';
import { X, Lightbulb } from 'lucide-react';

interface HintModalProps {
  hint: string;
  levelId: number;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  hint,
  levelId,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4 animate-in fade-in duration-100">
      <div className="bg-[#faf7ee] border-2 border-[#d0c9b8] rounded-md shadow-lg w-full max-w-sm p-5 relative paper-ruled">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded hover:bg-[#ede7da] text-[#555046] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-[#8a6e3e]" />
          <span className="font-mono text-xs uppercase tracking-wider text-[#6d665a]">
            Note #{levelId}
          </span>
        </div>

        <p className="font-handwriting text-2xl text-[#2a2825] leading-snug my-2">
          &ldquo;{hint}&rdquo;
        </p>

        <div className="mt-4 pt-2 border-t border-[#e2dccf] flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#2b2926] text-[#faf7ee] rounded text-xs font-mono hover:bg-[#3d3a36] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
