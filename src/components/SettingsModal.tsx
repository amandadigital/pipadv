import React, { useState, useRef, useEffect } from 'react';
import { UserProgress, CharacterCustomization } from '../types/game';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Feather,
  RotateCcw,
  BookOpen,
  Palette,
  Sliders,
  Sparkles,
  Check
} from 'lucide-react';
import { sound } from '../audio/soundtrack';
import { drawPlayerCharacter } from '../game/renderer';
import {
  SCARF_COLORS,
  HATS,
  SCARF_STYLES
} from '../game/customization';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onReplayPrologue?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  progress,
  onUpdateProgress,
  onReplayPrologue,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'character' | 'audio'>('character');
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const customization: CharacterCustomization = progress.customization || {
    scarfColor: 'crimson',
    scarfStyle: 'flutter',
    hat: 'none',
    inkTone: 'graphite',
    expression: 'classic'
  };

  // Live Pip Preview Animation
  useEffect(() => {
    let animId: number;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const time = performance.now() * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Notebook paper background
      ctx.fillStyle = '#faf7f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ruled lines
      ctx.strokeStyle = 'rgba(60, 50, 40, 0.06)';
      ctx.lineWidth = 1;
      for (let y = 18; y < canvas.height; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Red margin line
      ctx.strokeStyle = 'rgba(180, 80, 80, 0.16)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(22, canvas.height);
      ctx.stroke();

      // Binder holes
      ctx.fillStyle = 'rgba(50, 45, 40, 0.08)';
      ctx.beginPath();
      ctx.arc(10, 24, 3, 0, Math.PI * 2);
      ctx.arc(10, 60, 3, 0, Math.PI * 2);
      ctx.arc(10, 96, 3, 0, Math.PI * 2);
      ctx.fill();

      // Idle breathing and slight gentle swaying
      const idleSquash = 1 + Math.sin(time * 2.5) * 0.025;
      const walkCycle = Math.sin(time * 3) * 0.3;

      // Draw Pip with live options
      drawPlayerCharacter(ctx, {
        x: canvas.width / 2 + 10,
        y: canvas.height - 24,
        scale: 2.3,
        isGrounded: true,
        walkFrame: walkCycle,
        squash: idleSquash,
        time,
        customization
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [customization]);

  const updateCustomization = (patch: Partial<CharacterCustomization>) => {
    onUpdateProgress(prev => ({
      ...prev,
      customization: {
        ...(prev.customization || {
          scarfColor: 'crimson',
          scarfStyle: 'flutter',
          hat: 'none',
          inkTone: 'graphite',
          expression: 'classic'
        }),
        ...patch
      }
    }));
  };

  const handleMusicChange = (val: number) => {
    onUpdateProgress(prev => {
      const next = { ...prev, musicVolume: val };
      sound.setVolumes(next.musicVolume, next.sfxVolume, !next.soundEnabled);
      return next;
    });
  };

  const handleSfxChange = (val: number) => {
    onUpdateProgress(prev => {
      const next = { ...prev, sfxVolume: val };
      sound.setVolumes(next.musicVolume, next.sfxVolume, !next.soundEnabled);
      return next;
    });
  };

  const toggleSound = () => {
    onUpdateProgress(prev => {
      const next = { ...prev, soundEnabled: !prev.soundEnabled };
      sound.setVolumes(next.musicVolume, next.sfxVolume, !next.soundEnabled);
      return next;
    });
  };

  const toggleGenerousInk = () => {
    onUpdateProgress(prev => ({
      ...prev,
      generousInk: !prev.generousInk
    }));
  };

  const toggleReducedMotion = () => {
    onUpdateProgress(prev => ({
      ...prev,
      reducedMotion: !prev.reducedMotion
    }));
  };

  const handleResetProgress = () => {
    if (window.confirm("Reset all saved progress? This will reset beaten levels.")) {
      onUpdateProgress(prev => ({
        ...prev,
        currentLevel: 1,
        completedLevels: {},
        unlockedChapters: 1
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[3px] p-3 sm:p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-[#faf7ee] border-2 border-[#d5cebd] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2dccf] bg-[#f5f0e3]">
          <div className="flex items-center gap-2">
            <span className="font-handwriting text-2xl font-bold text-[#2b2926]">Pip's Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#eae3d2] text-[#555046] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#e2dccf] bg-[#ede7d8] px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('character')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-t-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'character'
                ? 'bg-[#faf7ee] text-[#2b2926] border-t border-x border-[#d5cebd] -mb-[1px] font-semibold'
                : 'text-[#6d6659] hover:text-[#2b2926]'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#a83232]" />
            <span>Customize Pip</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-t-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'audio'
                ? 'bg-[#faf7ee] text-[#2b2926] border-t border-x border-[#d5cebd] -mb-[1px] font-semibold'
                : 'text-[#6d6659] hover:text-[#2b2926]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#635c4e]" />
            <span>Audio &amp; Game</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-[#3a352c] flex-1">
          {activeTab === 'character' ? (
            /* CHARACTER CUSTOMIZATION TAB */
            <div className="space-y-5">
              {/* Live Preview Card */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#f3eee2] p-3.5 rounded-lg border border-[#ded5c2]">
                <div className="w-[170px] h-[120px] rounded-md border border-[#c9c0ad] overflow-hidden shadow-inner shrink-0 relative bg-[#faf7f0]">
                  <canvas
                    ref={previewCanvasRef}
                    width={170}
                    height={120}
                    className="w-full h-full block"
                  />
                  <div className="absolute top-1.5 right-2 font-handwriting text-xs text-[#8c8272]">
                    Pip
                  </div>
                </div>

                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#bf7817]" />
                    <span className="font-handwriting text-xl font-bold text-[#2b2926]">Notebook Wardrobe</span>
                  </div>
                  <p className="text-[11px] text-[#6d6659] leading-relaxed font-mono">
                    Customize Pip's cute woven scarf color, scarf style, and playful hats. Changes apply instantly across all levels!
                  </p>
                </div>
              </div>

              {/* 1. Scarf Color */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#2b2926]">Scarf Color</span>
                  <span className="text-[11px] text-[#7c7465] font-mono">
                    {SCARF_COLORS.find(c => c.id === (customization.scarfColor ?? 'crimson'))?.name}
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {SCARF_COLORS.map(color => {
                    const isSelected = (customization.scarfColor ?? 'crimson') === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => updateCustomization({ scarfColor: color.id })}
                        className={`group relative flex flex-col items-center gap-1 p-1.5 rounded-md border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#2b2926] bg-[#ece5d4] shadow-xs ring-1 ring-[#2b2926]'
                            : 'border-[#ded6c5] bg-[#fbf9f4] hover:bg-[#f1ebe0]'
                        }`}
                        title={color.name}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-black/20 flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: color.bgHex }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                        </div>
                        <span className="text-[10px] font-mono truncate max-w-full text-[#4d483e]">
                          {color.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Scarf Style */}
              {(customization.scarfColor ?? 'crimson') !== 'none' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#2b2926]">Scarf Style</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SCARF_STYLES.map(style => {
                      const isSelected = (customization.scarfStyle ?? 'flutter') === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={() => updateCustomization({ scarfStyle: style.id })}
                          className={`p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#2b2926] bg-[#ece5d4] ring-1 ring-[#2b2926]'
                              : 'border-[#ded6c5] bg-[#fbf9f4] hover:bg-[#f3ede1]'
                          }`}
                        >
                          <div className="font-mono text-[11px] font-bold text-[#2b2926] flex items-center justify-between">
                            <span>{style.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-[#2b2926]" />}
                          </div>
                          <div className="text-[10px] text-[#736c5f] mt-0.5 leading-snug line-clamp-2">
                            {style.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Hats & Headwear */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#2b2926]">Hat &amp; Headgear</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {HATS.map(hat => {
                    const isSelected = (customization.hat ?? 'none') === hat.id;
                    return (
                      <button
                        key={hat.id}
                        onClick={() => updateCustomization({ hat: hat.id })}
                        className={`p-2 rounded-md border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#2b2926] bg-[#ece5d4] ring-1 ring-[#2b2926]'
                            : 'border-[#ded6c5] bg-[#fbf9f4] hover:bg-[#f3ede1]'
                        }`}
                      >
                        <div className="font-mono text-[11px] font-bold text-[#2b2926] flex items-center justify-between">
                          <span>{hat.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#2b2926]" />}
                        </div>
                        <div className="text-[9px] text-[#736c5f] mt-0.5 leading-tight truncate">
                          {hat.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* AUDIO & GAMEPLAY TAB */
            <div className="space-y-5">
              {/* Audio Master Toggle */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-[#2b2926] font-semibold">Sound &amp; Music</span>
                <button
                  onClick={toggleSound}
                  className={`p-2 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    progress.soundEnabled
                      ? 'border-[#2b2926] bg-[#2b2926] text-[#faf7ee]'
                      : 'border-[#c8c0b0] bg-[#eee8dc] text-[#71695c]'
                  }`}
                >
                  {progress.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{progress.soundEnabled ? 'Enabled' : 'Muted'}</span>
                </button>
              </div>

              {/* Music Volume */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#6d6659]" /> Music Volume
                  </span>
                  <span>{Math.round(progress.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={progress.musicVolume}
                  onChange={e => handleMusicChange(parseFloat(e.target.value))}
                  className="w-full accent-[#2b2926] cursor-pointer"
                />
              </div>

              {/* SFX Volume */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-[#6d6659]" /> Sound Effects Volume
                  </span>
                  <span>{Math.round(progress.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={progress.sfxVolume}
                  onChange={e => handleSfxChange(parseFloat(e.target.value))}
                  className="w-full accent-[#2b2926] cursor-pointer"
                />
              </div>

              <div className="border-t border-[#e2dccf] pt-4 space-y-4">
                {/* Generous Ink Toggle */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-mono text-xs font-semibold block text-[#2b2926]">Generous Ink (+50%)</span>
                    <span className="text-[11px] text-[#787164]">Provides surplus ink for relaxed puzzle solving</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={progress.generousInk}
                    onChange={toggleGenerousInk}
                    className="w-4 h-4 accent-[#2b2926] cursor-pointer"
                  />
                </label>

                {/* Reduced Motion */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-mono text-xs font-semibold block text-[#2b2926]">Reduced Motion</span>
                    <span className="text-[11px] text-[#787164]">Subdues animations &amp; floating wind particles</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={progress.reducedMotion}
                    onChange={toggleReducedMotion}
                    className="w-4 h-4 accent-[#2b2926] cursor-pointer"
                  />
                </label>
              </div>

              {/* Install PWA App */}
              <div className="border-t border-[#e2dccf] pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold block text-[#2b2926]">Install App (PWA)</span>
                    <span className="text-[11px] text-[#787164]">Play offline like a native app on iPhone &amp; desktop</span>
                  </div>
                  <PWAInstallButton />
                </div>
              </div>

              {/* Story & Reset progress */}
              <div className="border-t border-[#e2dccf] pt-4 flex items-center justify-between">
                {onReplayPrologue && (
                  <button
                    onClick={() => {
                      onClose();
                      onReplayPrologue();
                    }}
                    className="flex items-center gap-1.5 text-xs text-[#554f44] hover:underline cursor-pointer font-mono"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Replay Story Prologue
                  </button>
                )}

                <button
                  onClick={handleResetProgress}
                  className="flex items-center gap-1 text-xs text-[#a14343] hover:underline cursor-pointer ml-auto font-mono"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset campaign progress
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e6e0d2] bg-[#f7f3e9] flex items-center justify-between text-[11px] font-mono text-[#787164]">
          <div className="flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5 text-[#888074]" />
            <span>Pip's Adventures</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2b2926] hover:bg-[#3d3a36] text-[#faf7ee] rounded text-xs font-mono transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
