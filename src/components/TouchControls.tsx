import React, { useCallback } from 'react';
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
  // Safe pointer event handler compatible with all mobile browsers including iOS Safari on iPhone 7+
  const createButtonHandlers = useCallback(
    (action: 'left' | 'right' | 'jump') => {
      return {
        onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // ignore if not supported
          }
          onInputStart(action);
        },
        onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
          try {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
          } catch {
            // ignore
          }
          onInputEnd(action);
        },
        onPointerCancel: () => onInputEnd(action),
        // Fallback touch events with passive-safe handling
        onTouchStart: () => onInputStart(action),
        onTouchEnd: () => onInputEnd(action),
        onTouchCancel: () => onInputEnd(action)
      };
    },
    [onInputStart, onInputEnd]
  );

  return (
    <div
      className="w-full max-w-5xl flex items-center justify-between px-3 py-2 select-none touch-none"
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      {/* Left / Right Movement Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Move Left"
          {...createButtonHandlers('left')}
          className="w-14 h-14 rounded-full bg-[#ede7d8] active:bg-[#dbd4c3] border-2 border-[#cfc7b6] flex items-center justify-center text-[#2b2926] shadow-sm active:scale-90 transition-transform cursor-pointer"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

        <button
          type="button"
          aria-label="Move Right"
          {...createButtonHandlers('right')}
          className="w-14 h-14 rounded-full bg-[#ede7d8] active:bg-[#dbd4c3] border-2 border-[#cfc7b6] flex items-center justify-center text-[#2b2926] shadow-sm active:scale-90 transition-transform cursor-pointer"
        >
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>

      {/* Center Tool Switch & Restart */}
      <div className="flex items-center gap-2">
        {hasEraser && (
          <button
            type="button"
            onClick={onToggleTool}
            aria-label="Switch Tool"
            className={`w-11 h-11 rounded-full border-2 border-[#cfc7b6] flex items-center justify-center transition-colors shadow-2xs active:scale-90 cursor-pointer ${
              currentTool === 'eraser' ? 'bg-[#2b2926] text-[#faf7ee]' : 'bg-[#ede7d8] text-[#2b2926]'
            }`}
          >
            {currentTool === 'eraser' ? <Eraser className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
          </button>
        )}

        <button
          type="button"
          onClick={onRestart}
          aria-label="Restart Level"
          className="w-11 h-11 rounded-full bg-[#ede7d8] active:bg-[#dbd4c3] border-2 border-[#cfc7b6] flex items-center justify-center text-[#524d45] shadow-2xs active:scale-90 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Jump Button (Enlarged & high-contrast for tactile ease on iPhone 7) */}
      <div className="flex items-center">
        <button
          type="button"
          aria-label="Jump"
          {...createButtonHandlers('jump')}
          className="w-16 h-16 rounded-full bg-[#2b2926] active:bg-[#45403a] text-[#faf7ee] border-2 border-[#1e1c1a] flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
        >
          <ArrowUp className="w-8 h-8" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
