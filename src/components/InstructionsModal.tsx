import React from 'react';
import { X, BookOpen, Pencil, Eraser, MoveHorizontal, ArrowUp, Undo2, RotateCcw, ExternalLink } from 'lucide-react';

interface InstructionsModalProps {
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
      <div className="bg-[#faf7ee] border-2 border-[#d5cebd] rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col paper-ruled max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2dccf] bg-[#f5efe3]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#7d7568]" />
            <h2 className="font-handwriting text-2xl font-bold text-[#2b2926]">Instructions &amp; Field Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#ede7da] text-[#555046] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#3a352c] font-mono">
          {/* Controls Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-[#ded6c5] rounded p-3 bg-[#faf7ee]">
              <div className="flex items-center gap-2 font-semibold text-[#2b2926] mb-1.5">
                <MoveHorizontal className="w-4 h-4 text-[#5e584d]" />
                <span>Movement</span>
              </div>
              <p className="text-[#696256] leading-relaxed">
                <span className="font-bold text-[#2b2926]">A / D</span> or <span className="font-bold text-[#2b2926]">&larr; &rarr;</span> to walk left and right.
              </p>
            </div>

            <div className="border border-[#ded6c5] rounded p-3 bg-[#faf7ee]">
              <div className="flex items-center gap-2 font-semibold text-[#2b2926] mb-1.5">
                <ArrowUp className="w-4 h-4 text-[#5e584d]" />
                <span>Jumping</span>
              </div>
              <p className="text-[#696256] leading-relaxed">
                <span className="font-bold text-[#2b2926]">Space</span>, <span className="font-bold text-[#2b2926]">W</span>, or <span className="font-bold text-[#2b2926]">&uarr;</span> to jump. Hold for height.
              </p>
            </div>

            <div className="border border-[#ded6c5] rounded p-3 bg-[#faf7ee]">
              <div className="flex items-center gap-2 font-semibold text-[#2b2926] mb-1.5">
                <Pencil className="w-4 h-4 text-[#5e584d]" />
                <span>Draw Platforms [P]</span>
              </div>
              <p className="text-[#696256] leading-relaxed">
                Click &amp; drag with your mouse or finger to trace solid graphite lines you can walk on.
              </p>
            </div>

            <div className="border border-[#ded6c5] rounded p-3 bg-[#faf7ee]">
              <div className="flex items-center gap-2 font-semibold text-[#2b2926] mb-1.5">
                <Eraser className="w-4 h-4 text-[#5e584d]" />
                <span>Eraser Tool [E]</span>
              </div>
              <p className="text-[#696256] leading-relaxed">
                Click or rub dashed pencil barriers, trapdoors, and boulders to erase them.
              </p>
            </div>
          </div>

          {/* Quick Keys */}
          <div className="border border-[#ded6c5] rounded p-3 bg-[#f6f1e6] space-y-2">
            <span className="font-semibold block text-[#2b2926]">Keyboard Shortcuts:</span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-[#554f44]">
              <div className="flex items-center gap-1.5">
                <Undo2 className="w-3.5 h-3.5 text-[#736c5f]" />
                <span><span className="font-bold">[Z]</span> Undo last line</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#736c5f]" />
                <span><span className="font-bold">[R]</span> Clean restart</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5 text-[#736c5f]" />
                <span><span className="font-bold">[P]</span> Select pencil</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eraser className="w-3.5 h-3.5 text-[#736c5f]" />
                <span><span className="font-bold">[E]</span> Select eraser</span>
              </div>
            </div>
          </div>

          {/* Checkpoints & Mechanics */}
          <div className="space-y-1.5 text-[#5e584c] leading-relaxed">
            <h3 className="font-semibold text-[#2b2926]">Checkpoints &amp; Pure Eraser Pages:</h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <span className="font-bold text-[#2b2926]">Checkpoints:</span> Falling into a pit or touching needles immediately returns you to your last safe foothold with your drawn lines preserved.
              </li>
              <li>
                <span className="font-bold text-[#2b2926]">Pure Eraser Challenges:</span> In certain eraser levels, the pencil is locked away so you must solve the room purely by rubbing out paths.
              </li>
              <li>
                <span className="font-bold text-[#2b2926]">Exit Door:</span> Reach the sketched doorway on the right to turn the page.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e2dccf] bg-[#f5efe3] flex items-center justify-between">
          <a
            href="https://misiori.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-handwriting text-lg text-[#5e574d] hover:text-[#1e1c1a] hover:underline inline-flex items-center gap-1"
          >
            by misiori <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2b2926] hover:bg-[#3d3a36] text-[#faf7ee] rounded text-xs font-mono transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
