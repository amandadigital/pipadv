import { LevelData, Point, Platform, HazardSpike, ErasableItem, PuzzleKey, PuzzleDoor, SpringDef, WindDraftDef, MovingPlatformDef } from '../types/game';

// Linear congruential generator for reproducible procedural seeds
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = Math.abs(seed) % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  choice<T>(items: T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }
}

const GENERATOR_TITLES = [
  "Endless Sketch",
  "Graphite Expanse",
  "The Unwritten Line",
  "Pencil Wanderer",
  "Notebook Nebula",
  "Continuous Trace",
  "Margin of Infinity",
  "Drawn from Memory",
  "Fading Horizon",
  "The Blank Canvas",
  "Whispering Ruled Sheet",
  "Etched in Graphite",
  "The Endless Margin",
  "Fold in the Void",
  "A New Page"
];

const GENERATOR_ANNOTATIONS = [
  "the page continues...",
  "guaranteed solvable route",
  "mind the graphite needles",
  "chart your own bridge",
  "the notebook has no end",
  "draw with intention",
  "measure twice, leap once",
  "a fresh sketch unfolds"
];

/**
 * Generate a guaranteed-solvable procedural level for levelId >= 101
 */
export function generateProceduralLevel(levelId: number): LevelData {
  const rng = new SeededRandom(levelId * 2654435761);

  const titlePrefix = rng.choice(GENERATOR_TITLES);
  const title = `${titlePrefix} #${levelId}`;
  const annotation = rng.choice(GENERATOR_ANNOTATIONS);

  const spawn: Point = { x: 70, y: 400 };
  const exit: Point = { x: 720, y: rng.int(120, 360) };

  // Generate 3 to 5 waypoints between spawn and exit
  const numWaypoints = rng.int(3, 5);
  const waypoints: Point[] = [spawn];

  const stepX = (exit.x - spawn.x) / (numWaypoints + 1);

  for (let i = 1; i <= numWaypoints; i++) {
    const prev = waypoints[i - 1];
    const targetX = spawn.x + i * stepX + rng.range(-20, 20);
    // Keep Y within jumpable vertical delta (jump is ~90px, with ink bridge ~140px)
    const maxYChange = 110;
    const targetY = Math.max(140, Math.min(420, prev.y + rng.range(-maxYChange, maxYChange * 0.7)));
    waypoints.push({ x: targetX, y: targetY });
  }
  waypoints.push(exit);

  // Build platforms beneath waypoints
  const platforms: Platform[] = [
    // Starting platform
    { x: 40, y: 440, w: 120, h: 20 },
    // Exit platform
    { x: exit.x - 40, y: exit.y + 30, w: 120, h: 20 }
  ];

  const spikes: HazardSpike[] = [];
  const erasables: ErasableItem[] = [];
  const keys: PuzzleKey[] = [];
  const doors: PuzzleDoor[] = [];
  const springs: SpringDef[] = [];
  const winds: WindDraftDef[] = [];
  const movingPlatforms: MovingPlatformDef[] = [];

  // Theme variation based on RNG
  const archetype = levelId % 6;

  // Add stepping platforms for each intermediate waypoint
  for (let i = 1; i < waypoints.length - 1; i++) {
    const wp = waypoints[i];
    const platWidth = rng.int(70, 110);
    const platX = wp.x - platWidth / 2;
    const platY = wp.y + 30;

    if (archetype === 1 && i === 2) {
      // Moving platform archetype
      movingPlatforms.push({
        id: `mp_proc_${i}`,
        x: platX,
        y: platY,
        w: platWidth,
        h: 15,
        dx: rng.choice([-80, 80]),
        dy: 0,
        speed: 1.5
      });
    } else {
      platforms.push({
        x: platX,
        y: platY,
        w: platWidth,
        h: 20
      });
    }

    // Spring archetype
    if (archetype === 2 && i === 1) {
      springs.push({
        x: platX + platWidth / 2 - 20,
        y: platY - 10,
        w: 40,
        h: 10,
        bounce: 1.4
      });
    }

    // Wind draft archetype
    if (archetype === 3 && i === 2) {
      winds.push({
        x: platX,
        y: platY - 180,
        w: platWidth,
        h: 180,
        forceX: rng.choice([-0.2, 0.3]),
        forceY: -0.5
      });
    }
  }

  // Key & Door archetype
  if (archetype === 4 && waypoints.length >= 4) {
    const keyWp = waypoints[1];
    const doorWp = waypoints[waypoints.length - 2];
    keys.push({
      id: `key_proc_${levelId}`,
      x: keyWp.x,
      y: keyWp.y - 10
    });
    const doorBottom = doorWp.y + 30;
    doors.push({
      id: `door_proc_${levelId}`,
      x: doorWp.x + 30,
      y: 20,
      w: 20,
      h: Math.max(120, doorBottom - 20),
      keyId: `key_proc_${levelId}`
    });
  }

  // Erasable barrier archetype
  if (archetype === 5 && waypoints.length >= 3) {
    const midWp = waypoints[2];
    erasables.push({
      id: `erase_proc_${levelId}`,
      x: midWp.x - 10,
      y: midWp.y - 70,
      w: 20,
      h: 100,
      label: "pencil barrier"
    });
  }

  // Add floor spikes safely below (only in the abyss between x:160 and x:640)
  spikes.push({
    x: 160,
    y: 465,
    w: 500,
    h: 15
  });

  const isPurePlatformer = archetype === 1 && (levelId % 2 === 0);
  const proceduralInk = isPurePlatformer ? 0 : 75 + (levelId % 35);

  return {
    id: levelId,
    title,
    chapter: 11,
    chapterTitle: "The Infinite Notebook",
    annotation,
    spawn,
    exit,
    maxInk: proceduralInk,
    maxEraser: erasables.length > 0 ? 3 : 0,
    pencilDisabled: isPurePlatformer,
    platforms,
    erasables,
    spikes,
    keys,
    doors,
    springs,
    winds,
    movingPlatforms,
    hint: isPurePlatformer 
      ? "Pure platforming challenge: time your leaps across the moving platforms without drawing." 
      : "Observe the path between waypoints. Draw frugal stepping stones or ramps only where needed.",
    targetInk: Math.round(proceduralInk * 0.5),
    targetTime: 25
  };
}
