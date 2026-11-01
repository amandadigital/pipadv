import React, { useState } from 'react';
import { Feather, ArrowRight, Sparkles, Heart } from 'lucide-react';

interface StoryModalProps {
  mode: 'prologue' | 'epilogue';
  characterName?: string;
  onSaveName?: (name: string) => void;
  onContinueTo101?: () => void;
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  mode,
  onSaveName,
  onContinueTo101,
  onClose
}) => {
  const [step, setStep] = useState<number>(0);

  const handleFinishPrologue = () => {
    if (onSaveName) {
      onSaveName('Pip');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[3px] p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#faf7ee] border-2 border-[#d5cebd] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col paper-ruled max-h-[92vh]">
        {mode === 'prologue' ? (
          /* PROLOGUE MODE */
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
            {/* Minimalist Step Indicators */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map(s => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    s === step ? 'w-8 bg-[#2b2926]' : 'w-2 bg-[#d8d1c2]'
                  }`}
                />
              ))}
            </div>

            {/* Panel 0: The Student's Sketch */}
            {step === 0 && (
              <div className="space-y-5 animate-in fade-in duration-150 flex flex-col items-center">
                {/* Sketch 1: Hand sketching little figure */}
                <svg width="240" height="150" viewBox="0 0 240 150" className="border border-[#ded6c5] rounded-md bg-[#faf7f0] shadow-2xs">
                  {/* Ruled lines */}
                  <line x1="10" y1="30" x2="230" y2="30" stroke="rgba(60,50,40,0.06)" strokeWidth="1" />
                  <line x1="10" y1="60" x2="230" y2="60" stroke="rgba(60,50,40,0.06)" strokeWidth="1" />
                  <line x1="10" y1="90" x2="230" y2="90" stroke="rgba(60,50,40,0.06)" strokeWidth="1" />
                  <line x1="10" y1="120" x2="230" y2="120" stroke="rgba(60,50,40,0.06)" strokeWidth="1" />
                  {/* Red margin line */}
                  <line x1="42" y1="0" x2="42" y2="150" stroke="rgba(180,80,80,0.2)" strokeWidth="1.5" />
                  {/* Little character being drawn */}
                  <circle cx="110" cy="80" r="7" fill="#faf7f0" stroke="#2b2926" strokeWidth="2" />
                  <circle cx="112" cy="79" r="1.2" fill="#2b2926" />
                  <line x1="110" y1="87" x2="110" y2="105" stroke="#2b2926" strokeWidth="2" strokeLinecap="round" />
                  {/* Scarf: Collar around neck & trailing tails */}
                  <ellipse cx="110" cy="88" rx="5.5" ry="2.2" fill="#c93434" stroke="#8b1e1e" strokeWidth="1.2" />
                  <circle cx="108" cy="88.5" r="2" fill="#c93434" stroke="#8b1e1e" strokeWidth="1.2" />
                  <path d="M 108 88.5 Q 100 87 93 91" stroke="#c93434" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M 108 89.5 Q 102 93 96 95" stroke="#c93434" strokeWidth="2" fill="none" strokeLinecap="round" />
                  {/* Legs */}
                  <line x1="110" y1="105" x2="104" y2="120" stroke="#2b2926" strokeWidth="2" strokeLinecap="round" />
                  <line x1="110" y1="105" x2="116" y2="120" stroke="#2b2926" strokeWidth="2" strokeLinecap="round" />
                  {/* Pencil tip sketching */}
                  <polygon points="150,55 175,30 183,38 158,63" fill="#6d655a" stroke="#2b2926" strokeWidth="1.5" />
                  <polygon points="150,55 158,63 144,69" fill="#e8dec8" stroke="#2b2926" strokeWidth="1.2" />
                  <polygon points="144,69 146,67 141,72" fill="#2b2926" />
                  {/* Annotation */}
                  <text x="60" y="44" fontFamily="Caveat, cursive" fontSize="16" fill="rgba(60,50,40,0.4)">a doodle in the margin...</text>
                </svg>

                <div className="space-y-1.5 max-w-sm">
                  <h3 className="font-handwriting text-3xl font-bold text-[#2b2926]">Drawn in Class</h3>
                  <p className="text-xs text-[#5c5549] leading-relaxed font-mono">
                    During a quiet afternoon, a student doodled a little character inside their lined notebook margin.
                  </p>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2 bg-[#2b2926] hover:bg-[#3d3a36] text-[#faf7ee] rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Turn the Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Panel 1: Thrown Away */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-150 flex flex-col items-center">
                {/* Sketch 2: Notebook tossed into bin */}
                <svg width="240" height="150" viewBox="0 0 240 150" className="border border-[#ded6c5] rounded-md bg-[#faf7f0] shadow-2xs">
                  {/* Wastebasket outline */}
                  <line x1="60" y1="50" x2="75" y2="135" stroke="#787063" strokeWidth="1.8" />
                  <line x1="180" y1="50" x2="165" y2="135" stroke="#787063" strokeWidth="1.8" />
                  <ellipse cx="120" cy="50" rx="60" ry="12" fill="none" stroke="#787063" strokeWidth="1.8" />
                  <line x1="75" y1="135" x2="165" y2="135" stroke="#787063" strokeWidth="1.8" />
                  {/* Paper mesh texture */}
                  <line x1="85" y1="60" x2="95" y2="135" stroke="rgba(120,110,100,0.2)" strokeWidth="1" />
                  <line x1="155" y1="60" x2="145" y2="135" stroke="rgba(120,110,100,0.2)" strokeWidth="1" />
                  {/* Crumpled Notebook resting inside */}
                  <path d="M 90 70 Q 120 55 150 72 L 145 105 Q 115 115 88 100 Z" fill="#f4eee1" stroke="#2b2926" strokeWidth="1.8" />
                  {/* Spiral binder on edge */}
                  <ellipse cx="92" cy="74" rx="2" ry="4" stroke="#4a443d" strokeWidth="1.2" fill="none" />
                  <ellipse cx="91" cy="82" rx="2" ry="4" stroke="#4a443d" strokeWidth="1.2" fill="none" />
                  <ellipse cx="90" cy="90" rx="2" ry="4" stroke="#4a443d" strokeWidth="1.2" fill="none" />
                  {/* Subtle toss motion arc */}
                  <path d="M 130 18 Q 165 24 140 55" stroke="rgba(80,70,60,0.25)" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
                  <text x="60" y="145" fontFamily="Caveat, cursive" fontSize="15" fill="rgba(60,50,40,0.45)">tossed into the recycling bin...</text>
                </svg>

                <div className="space-y-1.5 max-w-sm">
                  <h3 className="font-handwriting text-3xl font-bold text-[#2b2926]">Tossed Aside</h3>
                  <p className="text-xs text-[#5c5549] leading-relaxed font-mono">
                    When the bell rang, the notebook was closed, forgotten, and discarded near the windowsill.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(0)}
                    className="px-3 py-2 border border-[#cfc7b6] text-[#554f45] rounded text-xs font-mono hover:bg-[#ede7da] transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2 bg-[#2b2926] hover:bg-[#3d3a36] text-[#faf7ee] rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Awakening</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Panel 2: The Escape & Name Choice */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-150 flex flex-col items-center">
                {/* Sketch 3: Little character stepping out into the page */}
                <svg width="240" height="150" viewBox="0 0 240 150" className="border border-[#ded6c5] rounded-md bg-[#faf7f0] shadow-2xs">
                  {/* Ruled lines */}
                  <line x1="10" y1="30" x2="230" y2="30" stroke="rgba(60,50,40,0.06)" strokeWidth="1" />
                  <line x1="10" y1="60" x2="230" y2="60" stroke="rgba(60,50,40,0.06)" strokeWidth="1" />
                  <line x1="10" y1="90" x2="230" y2="90" stroke="rgba(60,50,40,0.06)" strokeWidth="1" />
                  <line x1="10" y1="120" x2="230" y2="120" stroke="rgba(60,50,40,0.06)" strokeWidth="1" />
                  {/* Red margin line */}
                  <line x1="42" y1="0" x2="42" y2="150" stroke="rgba(180,80,80,0.2)" strokeWidth="1.5" />
                  {/* Drawn platform bridge */}
                  <line x1="50" y1="110" x2="180" y2="95" stroke="#1e1c1a" strokeWidth="3" strokeLinecap="round" />
                  {/* Character standing and looking forward */}
                  <g transform="translate(110, 95) rotate(-6)">
                    <circle cx="0" cy="-22" r="5" fill="#faf7f0" stroke="#1e1c1a" strokeWidth="2" />
                    <line x1="0" y1="-17" x2="0" y2="-9" stroke="#1e1c1a" strokeWidth="2" strokeLinecap="round" />
                    {/* Scarf: Collar & Fluttering Tails */}
                    <ellipse cx="0" cy="-16" rx="4.8" ry="2" fill="#c93434" stroke="#8b1e1e" strokeWidth="1" />
                    <circle cx="-1.5" cy="-15.5" r="1.8" fill="#c93434" stroke="#8b1e1e" strokeWidth="1" />
                    <path d="M -1.5 -15.5 Q -7 -17 -13 -14" stroke="#c93434" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                    <path d="M -1.5 -15 Q -6 -12 -10 -9" stroke="#c93434" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                    <line x1="0" y1="-9" x2="-4" y2="0" stroke="#1e1c1a" strokeWidth="2" strokeLinecap="round" />
                    <line x1="0" y1="-9" x2="4" y2="0" stroke="#1e1c1a" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  {/* Doorway in distance */}
                  <rect x="195" y="60" width="18" height="30" fill="#2b2926" />
                  <rect x="197" y="62" width="14" height="26" fill="#faf7f0" />
                  <text x="50" y="44" fontFamily="Caveat, cursive" fontSize="17" fill="#2b2926">time to turn the pages...</text>
                </svg>

                <div className="space-y-1.5 max-w-sm">
                  <h3 className="font-handwriting text-3xl font-bold text-[#2b2926]">Pip&rsquo;s Awakening</h3>
                  <p className="text-xs text-[#5c5549] leading-relaxed font-mono">
                    Deep inside the journal, Pip opened their eyes. Armed with stray graphite and an eraser, the quiet journey begins.
                  </p>
                </div>

                <div className="flex gap-2 w-full max-w-xs pt-1">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-[#cfc7b6] text-[#554f45] rounded text-xs font-mono hover:bg-[#ede7da] transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinishPrologue}
                    className="flex-1 py-2.5 bg-[#2b2926] hover:bg-[#3d3a36] text-[#faf7ee] rounded text-xs font-mono flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <Feather className="w-3.5 h-3.5" />
                    <span>Begin Pip&rsquo;s Adventures</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* EPILOGUE MODE (LEVEL 100 BEATEN) */
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#8a6e3e] uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-[#8a6e3e]" />
              <span>Epilogue &bull; Page 100</span>
            </div>

            {/* Sketch of character sitting happily in the notebook */}
            <svg width="260" height="150" viewBox="0 0 260 150" className="border border-[#ded6c5] rounded-md bg-[#faf7f0] shadow-xs">
              {/* Ruled lines */}
              <line x1="10" y1="30" x2="250" y2="30" stroke="rgba(60,50,40,0.06)" strokeWidth="1" />
              <line x1="10" y1="60" x2="250" y2="60" stroke="rgba(60,50,40,0.06)" strokeWidth="1" />
              <line x1="10" y1="90" x2="250" y2="90" stroke="rgba(60,50,40,0.06)" strokeWidth="1" />
              <line x1="10" y1="120" x2="250" y2="120" stroke="rgba(60,50,40,0.06)" strokeWidth="1" />
              {/* Red margin line */}
              <line x1="42" y1="0" x2="42" y2="150" stroke="rgba(180,80,80,0.2)" strokeWidth="1.5" />
              {/* Resting bench slab */}
              <rect x="70" y="85" width="120" height="14" fill="#ede6d6" stroke="#2b2926" strokeWidth="1.8" rx="2" />
              {/* Character sitting with legs dangling */}
              <g transform="translate(125, 85)">
                <circle cx="0" cy="-22" r="5" fill="#faf7f0" stroke="#1e1c1a" strokeWidth="2" />
                <circle cx="2" cy="-23" r="1" fill="#1e1c1a" />
                {/* Scarf: Cozy Draped Collar & Tails */}
                <ellipse cx="0" cy="-16" rx="4.8" ry="2" fill="#c93434" stroke="#8b1e1e" strokeWidth="1" />
                <circle cx="-1.5" cy="-15.5" r="1.8" fill="#c93434" stroke="#8b1e1e" strokeWidth="1" />
                <path d="M -1.5 -15.5 Q -6 -14 -10 -11" stroke="#c93434" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <path d="M -1.5 -15 Q -4 -11 -7 -7" stroke="#c93434" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                {/* Sitting dangling legs */}
                <line x1="0" y1="-5" x2="6" y2="-5" stroke="#1e1c1a" strokeWidth="2" strokeLinecap="round" />
                <line x1="6" y1="-5" x2="6" y2="9" stroke="#1e1c1a" strokeWidth="2" strokeLinecap="round" />
                {/* Tiny steam cup of tea */}
                <rect x="18" y="-9" width="7" height="9" fill="#faf7f0" stroke="#2b2926" strokeWidth="1.2" rx="1" />
                <path d="M 21 -12 Q 19 -15 22 -17" stroke="rgba(60,50,40,0.3)" strokeWidth="1" fill="none" />
              </g>
              {/* Stars in the paper margin */}
              <text x="80" y="45" fontFamily="Caveat, cursive" fontSize="20" fill="rgba(60,50,40,0.5)">✦</text>
              <text x="175" y="40" fontFamily="Caveat, cursive" fontSize="16" fill="rgba(60,50,40,0.4)">✦</text>
              <text x="140" y="25" fontFamily="Caveat, cursive" fontSize="18" fill="rgba(60,50,40,0.45)">✦</text>
              <text x="65" y="130" fontFamily="Caveat, cursive" fontSize="17" fill="#2b2926">"I think I&rsquo;ll stay a while."</text>
            </svg>

            <div className="space-y-2 max-w-sm">
              <h3 className="font-handwriting text-3xl font-bold text-[#2b2926]">
                Pip Found a Home
              </h3>
              <p className="text-xs text-[#524c42] leading-relaxed font-mono">
                After journeying through 100 pages, Pip reached the edge of the final chapter.
              </p>
              <p className="text-xs text-[#524c42] leading-relaxed font-mono">
                Looking back across the warm paper and quiet pencil bridges, Pip realized this world was never a trap. It was peaceful, beautiful, and endlessly welcoming.
              </p>
              <p className="text-xs text-[#2b2926] font-semibold leading-relaxed font-mono pt-1">
                Pip decided to stay and live right here in the notebook, because Pip liked it here.
              </p>
            </div>

            <div className="pt-2 w-full max-w-xs">
              <button
                onClick={onContinueTo101 || onClose}
                className="w-full py-2.5 bg-[#2b2926] hover:bg-[#3d3a36] text-[#faf7ee] rounded text-xs font-mono flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-[#d48b8b]" />
                <span>Continue to Page 101</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
