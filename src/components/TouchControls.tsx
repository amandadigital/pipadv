import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Pencil, Eraser, RotateCcw } from 'lucide-react';
import { ToolType } from '../types/game';

interface TouchControlsProps {
  onInputStart: (action: 'left' | 'right' | 'jump') => void;
  onInputEnd: (action: 'left' | 'right' | 'jump') => void;
  currentTool: ToolType;
  onToggleTool: () => void;
  onRestart: () => void;
  hasEraser: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputStart,
  onInputEnd,
  currentTool,
  onToggleTool,
  onRestart,
  hasEraser
}) => {
  return (
    <div className="w-full max-w-5xl flex items-center justify-between px-4 py-2 select-none touch-none">
      {/* Left / Right Movement */}
      <div className="flex items-center gap-2">
        <button
          onTouchStart={e => { e.preventDefault(); onInputStart('left'); }}
          onTouchEnd={e => { e.preventDefault(); onInputEnd('left'); }}
          onMouseDown={() => onInputStart('left')}
          onMouseUp={() => onInputEnd('left')}
          className="w-13 h-13 rounded-full bg-[#ede7d8] active:bg-[#dbd4c3] border border-[#cfc7b6] flex items-center justify-center text-[#2b2926] shadow-xs active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onTouchStart={e => { e.preventDefault(); onInputStart('right'); }}
          onTouchEnd={e => { e.preventDefault(); onInputEnd('right'); }}
          onMouseDown={() => onInputStart('right')}
          onMouseUp={() => onInputEnd('right')}
          className="w-13 h-13 rounded-full bg-[#ede7d8] active:bg-[#dbd4c3] border border-[#cfc7b6] flex items-center justify-center text-[#2b2926] shadow-xs active:scale-95 transition-transform"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Center Tool Switch & Restart */}
      <div className="flex items-center gap-2">
        {hasEraser && (
          <button
            onClick={onToggleTool}
            className={`w-10 h-10 rounded-full border border-[#cfc7b6] flex items-center justify-center transition-colors shadow-xs ${
              currentTool === 'eraser' ? 'bg-[#2b2926] text-[#faf7ee]' : 'bg-[#ede7d8] text-[#2b2926]'
            }`}
          >
            {currentTool === 'eraser' ? <Eraser className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          </button>
        )}

        <button
          onClick={onRestart}
          className="w-10 h-10 rounded-full bg-[#ede7d8] active:bg-[#dbd4c3] border border-[#cfc7b6] flex items-center justify-center text-[#524d45] shadow-xs active:scale-95 transition-transform"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Jump Button */}
      <div className="flex items-center">
        <button
          onTouchStart={e => { e.preventDefault(); onInputStart('jump'); }}
          onTouchEnd={e => { e.preventDefault(); onInputEnd('jump'); }}
          onMouseDown={() => onInputStart('jump')}
          onMouseUp={() => onInputEnd('jump')}
          className="w-15 h-15 rounded-full bg-[#2b2926] active:bg-[#403c37] text-[#faf7ee] border border-[#2b2926] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <ArrowUp className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
