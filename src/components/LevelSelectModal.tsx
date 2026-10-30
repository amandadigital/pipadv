import React, { useState } from 'react';
import { CHAPTER_NAMES } from '../levels/levelData';
import { UserProgress } from '../types/game';
import { X, Check, Lock, Sparkles } from 'lucide-react';

interface LevelSelectModalProps {
  progress: UserProgress;
  currentLevel: number;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  progress,
  currentLevel,
  onSelectLevel,
  onClose
}) => {
  // Determine starting active chapter based on current level
  const defaultChapter = currentLevel > 100 ? 11 : Math.min(10, Math.ceil(currentLevel / 10));
  const [selectedChapter, setSelectedChapter] = useState<number>(defaultChapter || 1);

  // Highest beaten or unlocked level
  const highestUnlocked = Math.max(
    currentLevel,
    ...Object.keys(progress.completedLevels).map(Number).map(n => n + 1),
    1
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
      <div className="bg-[#faf7ee] border border-[#d5cebd] rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2dccf]">
          <div>
            <h2 className="text-base font-medium text-[#2b2926]">Level Index</h2>
            <p className="font-handwriting text-sm text-[#736c61]">choose any unlocked page to replay</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#ede7da] text-[#555046] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter Navigation Bar */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 py-2 border-b border-[#e6e0d2] bg-[#f4efe4]/60 text-xs font-mono">
          {CHAPTER_NAMES.map((name, idx) => {
            const chNum = idx + 1;
            const isUnlocked = chNum === 1 || highestUnlocked >= (chNum - 1) * 10 + 1;
            const isSelected = selectedChapter === chNum;

            return (
              <button
                key={chNum}
                onClick={() => setSelectedChapter(chNum)}
                className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#2b2926] text-[#faf7ee]'
                    : isUnlocked
                    ? 'text-[#5a544a] hover:bg-[#eae3d5]'
                    : 'text-[#9c9486] opacity-60'
                }`}
              >
                <span>Ch {chNum}</span>
                {!isUnlocked && <Lock className="w-2.5 h-2.5" />}
              </button>
            );
          })}

          {/* Infinite Generator Tab */}
          <button
            onClick={() => setSelectedChapter(11)}
            className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors flex items-center gap-1 ${
              selectedChapter === 11
                ? 'bg-[#2b2926] text-[#faf7ee]'
                : 'text-[#5a544a] hover:bg-[#eae3d5]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#94784a]" />
            <span>Infinite 101+</span>
          </button>
        </div>

        {/* Level Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          {selectedChapter <= 10 ? (
            <div>
              <div className="mb-4">
                <span className="text-xs uppercase tracking-wider font-mono text-[#827a6e]">
                  {CHAPTER_NAMES[selectedChapter - 1]}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {Array.from({ length: 10 }, (_, i) => {
                  const lvlNum = (selectedChapter - 1) * 10 + i + 1;
                  const isCompleted = progress.completedLevels[lvlNum]?.completed;
                  const isUnlocked = lvlNum <= highestUnlocked;
                  const isCurrent = currentLevel === lvlNum;

                  return (
                    <button
                      key={lvlNum}
                      disabled={!isUnlocked}
                      onClick={() => {
                        onSelectLevel(lvlNum);
                        onClose();
                      }}
                      className={`relative flex flex-col items-center justify-center p-3.5 rounded border text-sm font-mono transition-all ${
                        isCurrent
                          ? 'border-[#2b2926] bg-[#eae3d4] shadow-xs'
                          : isCompleted
                          ? 'border-[#c9c1b0] bg-[#f2ecde] text-[#2b2926] hover:border-[#8f8674]'
                          : isUnlocked
                          ? 'border-[#d8d1c2] bg-[#faf7ee] text-[#4a453e] hover:border-[#8f8674]'
                          : 'border-dashed border-[#ded7c8] bg-[#f5f1e7] text-[#a8a194] cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="font-semibold">{lvlNum}</span>

                      {/* Completed mark */}
                      {isCompleted && (
                        <Check className="w-3.5 h-3.5 text-[#4e7d56] mt-1" />
                      )}

                      {!isUnlocked && (
                        <Lock className="w-3 h-3 text-[#948d80] mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Infinite 101+ Generator Levels Browser
            <div className="space-y-4">
              <div className="border border-[#e0dacd] rounded-md p-4 bg-[#f4efe4]">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#8a6e3e]" />
                  <h3 className="text-sm font-semibold text-[#2b2926]">Procedural Sketchbook</h3>
                </div>
                <p className="text-xs text-[#6e685c]">
                  Levels 101 and beyond are dynamically synthesized with guaranteed-solvable mathematical paths, unique seeds, and generous ink allowances.
                </p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                {[101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 115, 120, 130, 150, 200, 300, 500, 1000].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => {
                      onSelectLevel(lvl);
                      onClose();
                    }}
                    className={`py-2 px-3 rounded border text-xs font-mono transition-colors text-center ${
                      currentLevel === lvl
                        ? 'border-[#2b2926] bg-[#2b2926] text-[#faf7ee]'
                        : 'border-[#d5cdbe] bg-[#faf7ee] hover:bg-[#eee8dc] text-[#3e3931]'
                    }`}
                  >
                    #{lvl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 border-t border-[#e6e0d2] bg-[#f7f3e9] flex items-center justify-between text-xs text-[#736c61]">
          <span className="font-mono">
            Progress: {Object.keys(progress.completedLevels).length} / 100 beaten
          </span>
          <span className="font-handwriting text-base">pencil & paper</span>
        </div>
      </div>
    </div>
  );
};
