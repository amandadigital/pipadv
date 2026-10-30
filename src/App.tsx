import { useState, useEffect, useCallback, useMemo } from 'react';
import { ALL_100_LEVELS } from './levels/levelData';
import { generateProceduralLevel } from './levels/generator';
import { LevelData, ToolType, DrawnLine, UserProgress } from './types/game';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import { LevelSelectModal } from './components/LevelSelectModal';
import { SettingsModal } from './components/SettingsModal';
import { HintModal } from './components/HintModal';
import { InstructionsModal } from './components/InstructionsModal';
import { StoryModal } from './components/StoryModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { TouchControls } from './components/TouchControls';
import { sound } from './audio/soundtrack';
import { Play, Grid, Settings as SettingsIcon, Feather, ExternalLink, Sparkles, BookOpen } from 'lucide-react';

const SAVE_KEY = 'paper_escape_save_v2';

const DEFAULT_PROGRESS: UserProgress = {
  currentLevel: 1,
  completedLevels: {},
  unlockedChapters: 1,
  soundEnabled: true,
  musicVolume: 0.45,
  sfxVolume: 0.65,
  generousInk: false,
  reducedMotion: false,
  characterName: 'Pip',
  hasSeenPrologue: false
};

export default function App() {
  // Load saved progress from localStorage
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback if localStorage unavailable
    }
    return DEFAULT_PROGRESS;
  });

  // Current active level ID
  const [activeLevelId, setActiveLevelId] = useState<number>(progress.currentLevel);
  const [inGame, setInGame] = useState<boolean>(false);

  // Modals state
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [storyModal, setStoryModal] = useState<'prologue' | 'epilogue' | null>(null);
  const [completedStats, setCompletedStats] = useState<{ time: number; inkUsed: number } | null>(null);

  // Gameplay state
  const [currentTool, setCurrentTool] = useState<ToolType>('pencil');
  const [drawnLines, setDrawnLines] = useState<DrawnLine[]>([]);
  const [inkRemaining, setInkRemaining] = useState<number>(300);
  const [eraserRemaining, setEraserRemaining] = useState<number>(0);
  const [touchInput, setTouchInput] = useState<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false
  });

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  // Retrieve current level data (handcrafted 1-100 or procedural 101+)
  const currentLevelData: LevelData = useMemo(() => {
    let base: LevelData;
    if (activeLevelId <= 100) {
      base = ALL_100_LEVELS.find(l => l.id === activeLevelId) || ALL_100_LEVELS[0];
    } else {
      base = generateProceduralLevel(activeLevelId);
    }

    // Apply generous ink scaling if enabled (and pencil not disabled)
    const inkBoost = base.pencilDisabled ? 0 : (progress.generousInk ? Math.round(base.maxInk * 1.5) : base.maxInk);
    return {
      ...base,
      maxInk: inkBoost
    };
  }, [activeLevelId, progress.generousInk]);

  // Reset resources when loading a level
  const initLevel = useCallback((lvl: LevelData) => {
    setDrawnLines([]);
    setInkRemaining(lvl.maxInk);
    setEraserRemaining(lvl.maxEraser);
    setCurrentTool(lvl.pencilDisabled ? 'eraser' : 'pencil');
    setCompletedStats(null);
    sound.setChapter(lvl.chapter);
  }, []);

  useEffect(() => {
    initLevel(currentLevelData);
  }, [currentLevelData, initLevel]);

  // Start game session from title
  const handleStartGame = () => {
    sound.setVolumes(progress.musicVolume, progress.sfxVolume, !progress.soundEnabled);
    sound.startMusic(currentLevelData.chapter);

    // If player has not seen the story prologue yet, present the prologue modal first!
    if (!progress.hasSeenPrologue) {
      setStoryModal('prologue');
    } else {
      setInGame(true);
    }
  };

  // Callback when player completes prologue modal
  const handleFinishPrologue = () => {
    setProgress(prev => ({
      ...prev,
      characterName: 'Pip',
      hasSeenPrologue: true
    }));
    setStoryModal(null);
    setInGame(true);
    sound.startMusic(currentLevelData.chapter);
  };

  // Switch level
  const handleSelectLevel = (levelId: number) => {
    setActiveLevelId(levelId);
    setProgress(prev => ({ ...prev, currentLevel: levelId }));
    setInGame(true);
    sound.startMusic(levelId > 100 ? 11 : Math.ceil(levelId / 10));
  };

  // Level complete handler
  const handleLevelComplete = (stats: { time: number; inkUsed: number }) => {
    // If Level 100 was just conquered, show ONLY the plot modal!
    if (activeLevelId === 100) {
      setCompletedStats(null);
      setStoryModal('epilogue');
    } else {
      setCompletedStats(stats);
    }

    setProgress(prev => {
      const existing = prev.completedLevels[activeLevelId];
      const bestTime = existing?.bestTime ? Math.min(existing.bestTime, stats.time) : stats.time;
      const bestInk = existing?.bestInkUsed ? Math.min(existing.bestInkUsed, stats.inkUsed) : stats.inkUsed;

      const nextLevel = Math.max(prev.currentLevel, activeLevelId + 1);
      const unlockedCh = Math.max(prev.unlockedChapters, Math.ceil(nextLevel / 10));

      return {
        ...prev,
        currentLevel: nextLevel,
        unlockedChapters: unlockedCh,
        completedLevels: {
          ...prev.completedLevels,
          [activeLevelId]: {
            completed: true,
            bestTime,
            bestInkUsed: bestInk
          }
        }
      };
    });
  };

  // Continue from epilogue directly into procedural level 101
  const handleEpilogueContinue = () => {
    setStoryModal(null);
    setCompletedStats(null);
    handleSelectLevel(101);
  };

  // Dedicated modal switch handlers to ensure no modal stacking
  const handleOpenLevelSelect = () => {
    setCompletedStats(null);
    setShowSettings(false);
    setShowHint(false);
    setShowInstructions(false);
    setShowLevelSelect(true);
  };

  const handleOpenSettings = () => {
    setCompletedStats(null);
    setShowLevelSelect(false);
    setShowHint(false);
    setShowInstructions(false);
    setShowSettings(true);
  };

  const handleOpenInstructions = () => {
    setCompletedStats(null);
    setShowLevelSelect(false);
    setShowSettings(false);
    setShowHint(false);
    setShowInstructions(true);
  };

  // Advance to next level
  const handleNextLevel = () => {
    const nextId = activeLevelId + 1;
    setActiveLevelId(nextId);
    setProgress(prev => ({ ...prev, currentLevel: nextId }));
  };

  // Voluntary full level restart (only when player clicks [R] / restart button)
  const handleRestart = () => {
    initLevel(currentLevelData);
  };

  // Undo last drawn line
  const handleUndo = () => {
    if (drawnLines.length === 0 || currentLevelData.pencilDisabled) return;
    const lastLine = drawnLines[drawnLines.length - 1];
    setDrawnLines(drawnLines.slice(0, -1));
    // Restore ink
    setInkRemaining(prev => Math.min(currentLevelData.maxInk, prev + lastLine.length * 1.0));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'KeyR') {
        handleRestart();
      } else if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
        handleUndo();
      } else if (e.code === 'KeyP') {
        if (!currentLevelData.pencilDisabled) {
          setCurrentTool('pencil');
        }
      } else if (e.code === 'KeyE') {
        if (currentLevelData.maxEraser > 0) {
          setCurrentTool('eraser');
        }
      } else if (e.code === 'KeyH') {
        setShowHint(prev => !prev);
      } else if (e.code === 'Escape') {
        setShowLevelSelect(false);
        setShowSettings(false);
        setShowHint(false);
        setShowInstructions(false);
        setStoryModal(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLevelData, drawnLines]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-[#faf7ee] text-[#2b2926] p-2 sm:p-4 select-none">
      {/* Title Screen */}
      {!inGame ? (
        <div className="flex-1 w-full max-w-xl flex flex-col items-center justify-center text-center p-6 space-y-7">
          <div className="space-y-2">
            <h1 className="font-handwriting text-6xl sm:text-7xl font-bold tracking-tight text-[#22201e]">
              Pip&rsquo;s Adventures
            </h1>
            <div className="flex items-center justify-center gap-1.5">
              <Feather className="w-4 h-4 text-[#8a8274]" />
              <a
                href="https://misiori.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="font-handwriting text-2xl text-[#575045] hover:text-[#1a1816] hover:underline underline-offset-4 transition-colors inline-flex items-center gap-1"
              >
                by misiori <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="font-mono text-xs text-[#7d7568] pt-1">
              a minimalist puzzle-platformer inside a sketchbook
            </p>
          </div>

          {/* Menu Buttons (No static instructions box on main page by default) */}
          <div className="flex flex-col gap-2.5 w-full max-w-xs font-mono text-xs">
            <button
              onClick={handleStartGame}
              className="py-3.5 px-6 bg-[#2b2926] hover:bg-[#3d3a36] text-[#faf7ee] rounded shadow-sm flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>
                {progress.hasSeenPrologue && Object.keys(progress.completedLevels).length > 0
                  ? `Resume Pip's Journey (#${activeLevelId})`
                  : 'Open Journal'}
              </span>
            </button>

            <button
              onClick={() => setStoryModal('prologue')}
              className="py-2.5 px-4 bg-[#ede7d8] hover:bg-[#e2dbcb] text-[#2b2926] rounded border border-[#cfc7b6] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Feather className="w-4 h-4 text-[#615a4e]" />
              <span>Story &bull; Pip</span>
            </button>

            <button
              onClick={() => setShowInstructions(true)}
              className="py-2.5 px-4 bg-[#ede7d8] hover:bg-[#e2dbcb] text-[#2b2926] rounded border border-[#cfc7b6] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#615a4e]" />
              <span>Instructions</span>
            </button>

            <button
              onClick={() => setShowLevelSelect(true)}
              className="py-2.5 px-4 bg-[#ede7d8] hover:bg-[#e2dbcb] text-[#2b2926] rounded border border-[#cfc7b6] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Grid className="w-4 h-4 text-[#615a4e]" />
              <span>Level Index (1–100 &amp; &infin;)</span>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="py-2.5 px-4 bg-[#ede7d8] hover:bg-[#e2dbcb] text-[#2b2926] rounded border border-[#cfc7b6] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4 text-[#615a4e]" />
              <span>Settings</span>
            </button>
          </div>

          <div className="font-handwriting text-lg text-[#857d70] pt-1">
            100 handcrafted pages &bull; infinite generative sketches
          </div>
        </div>
      ) : (
        /* In-Game Workspace (Enlarged max-w-5xl platformer window by default!) */
        <main className="w-full max-w-5xl flex flex-col items-center gap-2 flex-1">
          <HUD
            levelId={activeLevelId}
            chapterTitle={currentLevelData.chapterTitle}
            inkRemaining={inkRemaining}
            maxInk={currentLevelData.maxInk}
            eraserRemaining={eraserRemaining}
            maxEraser={currentLevelData.maxEraser}
            currentTool={currentTool}
            onSelectTool={setCurrentTool}
            onUndo={handleUndo}
            onRestart={handleRestart}
            onOpenHint={() => setShowHint(true)}
            onOpenLevelSelect={handleOpenLevelSelect}
            onOpenSettings={handleOpenSettings}
            canUndo={drawnLines.length > 0}
            pencilDisabled={currentLevelData.pencilDisabled}
          />

          <GameCanvas
            level={currentLevelData}
            progress={progress}
            currentTool={currentTool}
            inkRemaining={inkRemaining}
            onInkChange={setInkRemaining}
            eraserRemaining={eraserRemaining}
            onEraserChange={setEraserRemaining}
            drawnLines={drawnLines}
            onDrawnLinesChange={setDrawnLines}
            onLevelComplete={handleLevelComplete}
            onDied={handleRestart}
            touchInput={touchInput}
          />

          {/* Mobile Touch Controls */}
          <div className="w-full max-w-5xl block sm:hidden">
            <TouchControls
              onInputStart={action => setTouchInput(prev => ({ ...prev, [action]: true }))}
              onInputEnd={action => setTouchInput(prev => ({ ...prev, [action]: false }))}
              currentTool={currentTool}
              onToggleTool={() => {
                if (currentLevelData.pencilDisabled) return;
                setCurrentTool(t => (t === 'pencil' ? 'eraser' : 'pencil'));
              }}
              onRestart={handleRestart}
              hasEraser={currentLevelData.maxEraser > 0}
            />
          </div>

          {/* Bottom marginalia */}
          <footer className="w-full max-w-5xl flex items-center justify-between text-[11px] font-mono text-[#8c8477] px-2 py-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#5a5449]">{progress.characterName || 'Pip'}</span>
              <span>&bull;</span>
              <span>{activeLevelId <= 100 ? `${activeLevelId} / 100` : `Infinite #${activeLevelId}`}</span>
              {activeLevelId > 100 && (
                <span className="flex items-center gap-1 text-[#8f7448]">
                  <Sparkles className="w-3 h-3" /> procedural
                </span>
              )}
            </div>

            <a
              href="https://misiori.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="font-handwriting text-base text-[#615a50] hover:text-[#1e1c1a] hover:underline"
            >
              by misiori
            </a>
          </footer>
        </main>
      )}

      {/* Story Prologue / Epilogue Modal */}
      {storyModal && (
        <StoryModal
          mode={storyModal}
          characterName={progress.characterName || 'Pip'}
          onSaveName={handleFinishPrologue}
          onContinueTo101={handleEpilogueContinue}
          onClose={() => setStoryModal(null)}
        />
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <InstructionsModal
          onClose={() => setShowInstructions(false)}
        />
      )}

      {/* Level Select Modal */}
      {showLevelSelect && (
        <LevelSelectModal
          progress={progress}
          currentLevel={activeLevelId}
          onSelectLevel={handleSelectLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          progress={progress}
          onUpdateProgress={setProgress}
          onReplayPrologue={() => {
            setShowSettings(false);
            setStoryModal('prologue');
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Hint Modal */}
      {showHint && (
        <HintModal
          hint={currentLevelData.hint}
          levelId={activeLevelId}
          onClose={() => setShowHint(false)}
        />
      )}

      {/* Level Complete Modal */}
      {completedStats && (
        <LevelCompleteModal
          levelId={activeLevelId}
          chapterTitle={currentLevelData.chapterTitle}
          inkUsed={completedStats.inkUsed}
          maxInk={currentLevelData.maxInk}
          timeSpent={completedStats.time}
          characterName={progress.characterName || 'Pip'}
          onNext={handleNextLevel}
          onReplay={handleRestart}
          onOpenLevelSelect={handleOpenLevelSelect}
          onOpenEpilogue={() => {
            setCompletedStats(null);
            setStoryModal('epilogue');
          }}
        />
      )}
    </div>
  );
}
