export interface Point {
  x: number;
  y: number;
}

export type ToolType = 'pencil' | 'eraser';

export interface DrawnLine {
  id: string;
  points: Point[];
  length: number;
  createdAt: number;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: 'solid' | 'one-way';
}

export interface MovingPlatformDef {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dx: number;
  dy: number;
  speed: number;
}

export interface ErasableItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  isErased?: boolean;
  eraseProgress?: number; // 0 to 1
}

export interface HazardSpike {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PuzzleKey {
  id: string;
  x: number;
  y: number;
  collected?: boolean;
}

export interface PuzzleDoor {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  keyId: string;
  isOpened?: boolean;
}

export interface SpringDef {
  x: number;
  y: number;
  w: number;
  h: number;
  bounce: number;
}

export interface WindDraftDef {
  x: number;
  y: number;
  w: number;
  h: number;
  forceX: number;
  forceY: number;
}

export interface LevelData {
  id: number;
  title: string;
  chapter: number;
  chapterTitle: string;
  annotation?: string;
  spawn: Point;
  exit: Point;
  maxInk: number;
  maxEraser: number;
  platforms: Platform[];
  erasables?: ErasableItem[];
  spikes?: HazardSpike[];
  keys?: PuzzleKey[];
  doors?: PuzzleDoor[];
  springs?: SpringDef[];
  winds?: WindDraftDef[];
  movingPlatforms?: MovingPlatformDef[];
  hint: string;
  targetInk: number;
  targetTime: number;
  pencilDisabled?: boolean;
  checkpoints?: Point[];
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  isGrounded: boolean;
  isFacingLeft: boolean;
  isJumping: boolean;
  coyoteTimer: number;
  jumpBuffer: number;
  walkFrame: number;
  squash: number; // for juicy jump/landing squash & stretch
  slopeAngle: number; // in radians
  rotation: number; // current visual tilt angle in radians
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
}

export interface LevelRecord {
  completed: boolean;
  bestTime?: number;
  bestInkUsed?: number;
  masteryInk?: boolean;
}

export interface UserProgress {
  currentLevel: number;
  completedLevels: Record<number, LevelRecord>;
  unlockedChapters: number;
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  generousInk: boolean;
  reducedMotion: boolean;
  characterName: string;
  hasSeenPrologue: boolean;
}
