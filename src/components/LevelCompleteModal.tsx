import React, { useEffect } from 'react';
import { ArrowRight, RotateCcw, Grid, Sparkles, Feather, Heart } from 'lucide-react';

interface LevelCompleteModalProps {
  levelId: number;
  chapterTitle: string;
  inkUsed: number;
  maxInk: number;
  timeSpent: number;
  characterName?: string;
  onNext: () => void;
  onReplay: () => void;
  onOpenLevelSelect: () => void;
  onOpenEpilogue?: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelId,
  chapterTitle,
  inkUsed,
  maxInk,
  timeSpent,
  characterName = 'Pip',
  onNext,
  onReplay,
  onOpenLevelSelect,
  onOpenEpilogue
}) => {
  // Listen for Space / Enter to advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

  const isFinale = levelId === 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[3px] p-4 animate-in fade-in duration-200">
      <div className="bg-[#faf7ee] border-2 border-[#cfc7b6] rounded-lg shadow-2xl w-full max-w-sm p-6 text-center relative overflow-hidden paper-ruled">
        {/* Subtle decorative margin stamp */}
        <div className="font-handwriting text-4xl text-[#2b2926] my-1">
          {isFinale ? "The Notebook Closed" : "Page Solved"}
        </div>

        <p className="text-xs font-mono text-[#787163] mb-4">
          #{levelId} &mdash; {chapterTitle}
        </p>

        {isFinale && (
          <div className="my-4 p-3.5 bg-[#f2ebd9] border border-[#d6cca8] rounded text-left space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a6e3e]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>All 100 Handcrafted Pages Complete!</span>
            </div>
            <p className="text-xs text-[#524d45] leading-relaxed">
              {characterName} looked around at the gentle sketched world and made a quiet choice...
            </p>
            {onOpenEpilogue && (
              <button
                onClick={onOpenEpilogue}
                className="w-full mt-1 py-1.5 px-3 bg-[#8a6e3e] hover:bg-[#72592e] text-[#faf7ee] rounded text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Read {characterName}&rsquo;s Epilogue</span>
              </button>
            )}
          </div>
        )}

        {/* Level Stats */}
        <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-[#e2dccf] font-mono text-xs text-[#4a453e]">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#847d70] uppercase">Ink Applied</span>
            <span className="font-semibold text-sm text-[#2b2926]">
              {Math.round(inkUsed)} / {maxInk}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[#847d70] uppercase">Duration</span>
            <span className="font-semibold text-sm text-[#2b2926]">
              {timeSpent.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            onClick={onReplay}
            className="p-2 rounded border border-[#cfc7b6] hover:bg-[#ede7da] text-[#4a453e] transition-colors cursor-pointer"
            title="Replay level"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="p-2 rounded border border-[#cfc7b6] hover:bg-[#ede7da] text-[#4a453e] transition-colors cursor-pointer"
            title="Level Index"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={onNext}
            className="flex-1 py-2 px-4 bg-[#2b2926] hover:bg-[#403c37] text-[#faf7ee] rounded font-mono text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <span>{isFinale ? 'Enter Infinite Sketches' : 'Next Page'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Signature */}
        <div className="mt-4 pt-2 border-t border-[#e8e2d4] flex items-center justify-center gap-1">
          <Feather className="w-3 h-3 text-[#9c9486]" />
          <a
            href="https://misiori.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-handwriting text-base text-[#6b6459] hover:underline"
          >
            by misiori
          </a>
        </div>
      </div>
    </div>
  );
};
