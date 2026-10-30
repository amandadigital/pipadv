import React from 'react';
import { ToolType } from '../types/game';
import { Pencil, Eraser, RotateCcw, Lightbulb, Grid, Settings as SettingsIcon, Undo2 } from 'lucide-react';

interface HUDProps {
  levelId: number;
  chapterTitle: string;
  inkRemaining: number;
  maxInk: number;
  eraserRemaining: number;
  maxEraser: number;
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onUndo: () => void;
  onRestart: () => void;
  onOpenHint: () => void;
  onOpenLevelSelect: () => void;
  onOpenSettings: () => void;
  canUndo: boolean;
  pencilDisabled?: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  levelId,
  chapterTitle,
  inkRemaining,
  maxInk,
  eraserRemaining,
  maxEraser,
  currentTool,
  onSelectTool,
  onUndo,
  onRestart,
  onOpenHint,
  onOpenLevelSelect,
  onOpenSettings,
  canUndo,
  pencilDisabled
}) => {
  const inkPercent = maxInk > 0 ? Math.max(0, Math.min(100, (inkRemaining / maxInk) * 100)) : 0;

  return (
    <header className="w-full max-w-5xl flex items-center justify-between px-3 py-2 text-[#2b2926] border-b border-[#e5dfd2]">
      {/* Level Info & Misiori Link */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenLevelSelect}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#ede7da] transition-colors text-xs font-mono tracking-tight cursor-pointer"
          title="Select Level"
        >
          <Grid className="w-3.5 h-3.5 text-[#555047]" />
          <span className="font-semibold text-sm">#{levelId}</span>
          <span className="hidden sm:inline text-[#787165] text-xs">/ {chapterTitle}</span>
        </button>

        <a
          href="https://misiori.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="font-handwriting text-base text-[#605a52] hover:text-[#1e1c1a] hover:underline underline-offset-2 transition-colors ml-1"
          title="Creator portfolio"
        >
          by misiori
        </a>
      </div>

      {/* Ink & Eraser Resource Gauges */}
      <div className="flex items-center gap-4">
        {/* Ink Bar or Pencil Locked */}
        {pencilDisabled ? (
          <div className="flex items-center gap-1.5" title="Pencil disabled on this page">
            <Pencil className="w-3.5 h-3.5 text-[#8c8577] opacity-40" />
            <span className="font-handwriting text-sm text-[#7c7567] italic">
              no pencil allowed
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5" title={`Ink: ${Math.round(inkRemaining)} / ${maxInk}`}>
            <Pencil className="w-3.5 h-3.5 text-[#3a3630]" />
            <div className="w-24 sm:w-36 h-2.5 bg-[#e4ded0] rounded-sm overflow-hidden p-0.5 border border-[#c8c0b0]">
              <div
                className="h-full bg-[#2a2825] rounded-xs transition-all duration-75"
                style={{ width: `${inkPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-[#666055] min-w-8">
              {Math.round(inkPercent)}%
            </span>
          </div>
        )}

        {/* Eraser count (if available on level) */}
        {maxEraser > 0 && (
          <div className="flex items-center gap-1" title={`Eraser Charges: ${eraserRemaining}`}>
            <Eraser className="w-3.5 h-3.5 text-[#6c655b]" />
            <span className="text-xs font-mono text-[#524d45]">{eraserRemaining}</span>
          </div>
        )}
      </div>

      {/* Tools & Quick Actions */}
      <div className="flex items-center gap-1">
        {/* Tool Toggles */}
        {!pencilDisabled && (
          <button
            onClick={() => onSelectTool('pencil')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              currentTool === 'pencil' ? 'bg-[#2b2926] text-[#faf7ee]' : 'hover:bg-[#ede7da] text-[#4a453e]'
            }`}
            title="Pencil [P]"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {maxEraser > 0 && (
          <button
            onClick={() => onSelectTool('eraser')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              currentTool === 'eraser' ? 'bg-[#2b2926] text-[#faf7ee]' : 'hover:bg-[#ede7da] text-[#4a453e]'
            }`}
            title="Eraser [E]"
          >
            <Eraser className="w-4 h-4" />
          </button>
        )}

        <div className="w-px h-4 bg-[#ded6c5] mx-1" />

        {/* Undo */}
        {!pencilDisabled && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded hover:bg-[#ede7da] disabled:opacity-30 disabled:hover:bg-transparent text-[#4a453e] transition-colors cursor-pointer"
            title="Undo line [Z]"
          >
            <Undo2 className="w-4 h-4" />
          </button>
        )}

        {/* Restart */}
        <button
          onClick={onRestart}
          className="p-1.5 rounded hover:bg-[#ede7da] text-[#4a453e] transition-colors cursor-pointer"
          title="Restart level [R]"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Hint */}
        <button
          onClick={onOpenHint}
          className="p-1.5 rounded hover:bg-[#ede7da] text-[#4a453e] transition-colors cursor-pointer"
          title="Hint [H]"
        >
          <Lightbulb className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded hover:bg-[#ede7da] text-[#4a453e] transition-colors cursor-pointer"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
