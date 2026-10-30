import React from 'react';
import { UserProgress } from '../types/game';
import { X, Volume2, VolumeX, Music, Feather, RotateCcw, ExternalLink, BookOpen } from 'lucide-react';
import { sound } from '../audio/soundtrack';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-[2px] p-4">
      <div className="bg-[#faf7ee] border border-[#d5cebd] rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2dccf]">
          <h2 className="text-base font-medium text-[#2b2926]">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#ede7da] text-[#555046] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-[#3a352c]">
          {/* Audio Master Toggle */}
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">Sound &amp; Music</span>
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
                <Music className="w-3.5 h-3.5" /> Music Volume
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
                <Volume2 className="w-3.5 h-3.5" /> Sound Effects Volume
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
                <span className="text-[11px] text-[#787164]">Subdues animations &amp; floating elements</span>
              </div>
              <input
                type="checkbox"
                checked={progress.reducedMotion}
                onChange={toggleReducedMotion}
                className="w-4 h-4 accent-[#2b2926] cursor-pointer"
              />
            </label>
          </div>

          {/* Story & Reset progress */}
          <div className="border-t border-[#e2dccf] pt-4 flex items-center justify-between">
            {onReplayPrologue && (
              <button
                onClick={() => {
                  onClose();
                  onReplayPrologue();
                }}
                className="flex items-center gap-1 text-[11px] text-[#554f44] hover:underline cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Replay Story Prologue
              </button>
            )}

            <button
              onClick={handleResetProgress}
              className="flex items-center gap-1 text-[11px] text-[#a14343] hover:underline cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset campaign progress
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e6e0d2] bg-[#f7f3e9] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5 text-[#888074]" />
            <a
              href="https://misiori.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-handwriting text-lg text-[#3b362f] hover:underline flex items-center gap-1"
            >
              by misiori <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#2b2926] text-[#faf7ee] rounded text-xs font-mono hover:bg-[#3d3a36] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
