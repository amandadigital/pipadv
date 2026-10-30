import { LevelData } from '../types/game';

// Helper to create consistent level objects
function createLevel(
  id: number,
  title: string,
  chapter: number,
  chapterTitle: string,
  annotation: string,
  spawn: [number, number],
  exit: [number, number],
  maxInk: number,
  maxEraser: number,
  platforms: Array<[number, number, number, number]>,
  opts: {
    erasables?: Array<{ id: string; x: number; y: number; w: number; h: number; label?: string }>;
    spikes?: Array<[number, number, number, number]>;
    keys?: Array<{ id: string; x: number; y: number }>;
    doors?: Array<{ id: string; x: number; y: number; w: number; h: number; keyId: string }>;
    springs?: Array<[number, number, number, number, number]>;
    winds?: Array<[number, number, number, number, number, number]>;
    movingPlatforms?: Array<{ id: string; x: number; y: number; w: number; h: number; dx: number; dy: number; speed: number }>;
    hint: string;
    targetInk?: number;
    targetTime?: number;
    pencilDisabled?: boolean;
    checkpoints?: Array<[number, number]>;
  }
): LevelData {
  return {
    id,
    title,
    chapter,
    chapterTitle,
    annotation,
    spawn: { x: spawn[0], y: spawn[1] },
    exit: { x: exit[0], y: exit[1] },
    maxInk: opts.pencilDisabled ? 0 : maxInk, // True budgeted ink without free surplus
    maxEraser,
    platforms: platforms.map(([x, y, w, h]) => ({ x, y, w, h })),
    erasables: opts.erasables || [],
    spikes: (opts.spikes || []).map(([x, y, w, h]) => ({ x, y, w, h })),
    keys: opts.keys || [],
    doors: opts.doors || [],
    springs: (opts.springs || []).map(([x, y, w, h, bounce]) => ({ x, y, w, h, bounce })),
    winds: (opts.winds || []).map(([x, y, w, h, fx, fy]) => ({ x, y, w, h, forceX: fx, forceY: fy })),
    movingPlatforms: opts.movingPlatforms || [],
    hint: opts.hint,
    targetInk: opts.targetInk || Math.round(maxInk * 0.45),
    targetTime: opts.targetTime || 20,
    pencilDisabled: opts.pencilDisabled,
    checkpoints: (opts.checkpoints || []).map(([x, y]) => ({ x, y }))
  };
}

// ВОТ ЗДЕСЬ ДОЛЖЕН БЫТЬ EXPORT
export const CHAPTER_NAMES = [
  "Chapter 1: First Marks",
  "Chapter 2: The Eraser",
  "Chapter 3: Limited Ink",
  "Chapter 4: Missing Pieces",
  "Chapter 5: False Lines",
  "Chapter 6: Weight & Balance",
  "Chapter 7: Two Sides",
  "Chapter 8: The Rules Change",
  "Chapter 9: Almost Impossible",
  "Chapter 10: The Last Page"
];

/* =========================================================================
   CHAPTER 1: FIRST MARKS (Levels 1 - 10)
   ========================================================================= */
const ch1: LevelData[] = [
  createLevel(1, "The First Step", 1, CHAPTER_NAMES[0], "walk to the exit", [80, 400], [700, 400], 1000, 0, [
    [40, 440, 720, 20]
  ], {
    hint: "Use A/D or Arrow keys to walk right toward the door.",
  }),
  createLevel(2, "Small Leap", 1, CHAPTER_NAMES[0], "space to jump", [80, 400], [700, 400], 1000, 0, [
    [40, 440, 280, 20],
    [440, 440, 320, 20]
  ], {
    hint: "Jump across the gap with Space or W.",
    pencilDisabled: true
  }),
  createLevel(3, "The Pencil", 1, CHAPTER_NAMES[0], "draw a bridge", [80, 400], [720, 400], 800, 0, [
    [40, 440, 200, 20],
    [560, 440, 200, 20]
  ], {
    hint: "Click and drag with your mouse (or finger) to draw a graphite line across the chasm."
  }),
  createLevel(4, "Ascension", 1, CHAPTER_NAMES[0], "climb higher", [80, 400], [700, 180], 500, 0, [
    [40, 440, 220, 20],
    [640, 220, 120, 20]
  ], {
    hint: "Draw a rising diagonal line or a couple of steps to climb up."
  }),
  createLevel(5, "Over the Ridge", 1, CHAPTER_NAMES[0], "scale the wall", [80, 400], [700, 400], 250, 0, [
    [40, 440, 240, 20],
    [360, 260, 60, 180],
    [500, 440, 260, 20]
  ], {
    hint: "Draw a curved ramp over the tall pencil pillar."
  }),
  createLevel(6, "The Stepping Stones", 1, CHAPTER_NAMES[0], "connect the dots", [70, 400], [720, 300], 400, 0, [
    [40, 440, 140, 20],
    [260, 380, 80, 20],
    [460, 340, 80, 20],
    [660, 340, 100, 20]
  ], {
    hint: "Pure platforming: leap from ledge to ledge across the chasm.",
    pencilDisabled: true
  }),
  createLevel(7, "First Needles", 1, CHAPTER_NAMES[0], "sharp graphite", [70, 400], [720, 400], 200, 0, [
    [40, 440, 180, 20],
    [220, 430, 340, 15],
    [560, 440, 200, 20]
  ], {
    spikes: [[230, 415, 320, 15]],
    hint: "Do not touch the graphite spikes. Draw an elevated bridge safe above them."
  }),
  createLevel(8, "The High Shelf", 1, CHAPTER_NAMES[0], "two-tier sketch", [70, 400], [140, 160], 150, 0, [
    [40, 440, 340, 20],
    [400, 320, 180, 20],
    [600, 240, 140, 20],
    [100, 200, 160, 20]
  ], {
    hint: "Climb up the right steps, then draw a bridge heading back left to the high shelf."
  }),
  createLevel(9, "The Descent", 1, CHAPTER_NAMES[0], "soft landing", [80, 120], [720, 400], 110, 0, [
    [60, 160, 140, 20],
    [40, 440, 720, 20]
  ], {
    spikes: [[220, 425, 420, 15]],
    hint: "Draw a slide ramp to guide your fall smoothly past the bed of spikes."
  }),
  createLevel(10, "First Chapter Seal", 1, CHAPTER_NAMES[0], "putting it together", [70, 400], [720, 140], 150, 0, [
    [40, 440, 180, 20],
    [320, 340, 140, 20],
    [640, 180, 120, 20]
  ], {
    spikes: [[220, 425, 520, 15]],
    hint: "Draw your own platforms to bridge across and climb to the high door."
  })
];

/* =========================================================================
   CHAPTER 2: THE ERASER (Levels 11 - 20)
   ========================================================================= */
const ch2: LevelData[] = [
  createLevel(11, "The Rubber Block", 2, CHAPTER_NAMES[1], "switch to eraser [E]", [80, 400], [700, 400], 0, 5, [
    [40, 440, 720, 20]
  ], {
    erasables: [{ id: "e1", x: 380, y: 280, w: 40, h: 160, label: "barrier" }],
    hint: "Press [E] or click the Eraser icon, then click/rub the dashed pencil wall to erase it.",
    pencilDisabled: true
  }),
  createLevel(12, "Trapdoor", 2, CHAPTER_NAMES[1], "erase beneath you", [80, 200], [80, 400], 0, 5, [
    [40, 240, 140, 20],
    [280, 240, 60, 20],
    [40, 440, 720, 20]
  ], {
    erasables: [{ id: "e2", x: 180, y: 240, w: 100, h: 20, label: "hatch" }],
    hint: "Erase the hatch segment of the upper platform to fall into the lower chamber.",
    pencilDisabled: true
  }),
  createLevel(13, "Sealed Passage", 2, CHAPTER_NAMES[1], "two obstacles", [70, 400], [720, 400], 0, 5, [
    [40, 440, 720, 20]
  ], {
    erasables: [
      { id: "e3a", x: 260, y: 300, w: 30, h: 140 },
      { id: "e3b", x: 500, y: 300, w: 30, h: 140 }
    ],
    hint: "Erase both pencil pillars blocking the path to the exit.",
    pencilDisabled: true
  }),
  createLevel(14, "Draw & Erase", 2, CHAPTER_NAMES[1], "use both tools", [70, 400], [720, 220], 140, 5, [
    [40, 440, 200, 20],
    [640, 260, 120, 20]
  ], {
    erasables: [{ id: "e4", x: 620, y: 160, w: 20, h: 100 }],
    hint: "Draw a bridge across the chasm, then switch to Eraser to remove the gate in front of the door."
  }),
  createLevel(15, "The Wrong Floor", 2, CHAPTER_NAMES[1], "choose what to erase", [70, 220], [720, 400], 0, 5, [
    [40, 260, 240, 20],
    [360, 260, 160, 20],
    [600, 260, 160, 20],
    [40, 440, 720, 20]
  ], {
    erasables: [
      { id: "e5a", x: 280, y: 260, w: 80, h: 20 },
      { id: "e5b", x: 520, y: 260, w: 80, h: 20 }
    ],
    spikes: [[200, 425, 200, 15]],
    hint: "Erase the right hatch (at x:520) to drop safely where there are no spikes below.",
    pencilDisabled: true
  }),
  createLevel(16, "Cage of Pencil", 2, CHAPTER_NAMES[1], "break out", [100, 360], [700, 400], 0, 5, [
    [40, 440, 720, 20]
  ], {
    erasables: [
      { id: "e6a", x: 60, y: 280, w: 20, h: 160 },
      { id: "e6b", x: 60, y: 280, w: 140, h: 20 },
      { id: "e6c", x: 180, y: 280, w: 20, h: 160 }
    ],
    hint: "Erase the right wall of your enclosure to escape rightward.",
    pencilDisabled: true
  }),
  createLevel(17, "Graphite Spire", 2, CHAPTER_NAMES[1], "window of opportunity", [70, 400], [720, 400], 0, 5, [
    [40, 440, 720, 20],
    [380, 100, 40, 220]
  ], {
    erasables: [{ id: "e7", x: 380, y: 320, w: 40, h: 120 }],
    hint: "The central wall is solid except for a weak sketch section near the ground. Erase it to walk through.",
    pencilDisabled: true
  }),
  createLevel(18, "Over and Under", 2, CHAPTER_NAMES[1], "erase the ceiling", [70, 400], [700, 160], 120, 5, [
    [40, 440, 260, 20],
    [40, 240, 220, 20],
    [560, 200, 200, 20]
  ], {
    erasables: [{ id: "e8", x: 260, y: 240, w: 80, h: 20 }],
    hint: "Erase the ceiling block at x:260, jump up through the hole, and draw a bridge to the door."
  }),
  createLevel(19, "The Falling Boulder", 2, CHAPTER_NAMES[1], "clear the jam", [70, 400], [720, 400], 0, 5, [
    [40, 440, 720, 20]
  ], {
    erasables: [
      { id: "e9a", x: 340, y: 360, w: 70, h: 80, label: "boulder" },
      { id: "e9b", x: 480, y: 360, w: 70, h: 80, label: "boulder" }
    ],
    hint: "Erase both boulder sketches blocking your path.",
    pencilDisabled: true
  }),
  createLevel(20, "Rubbed Clean", 2, CHAPTER_NAMES[1], "precision erasing", [70, 400], [720, 200], 130, 5, [
    [40, 440, 200, 20],
    [320, 360, 160, 20],
    [640, 240, 120, 20]
  ], {
    erasables: [
      { id: "e10a", x: 300, y: 200, w: 20, h: 160 },
      { id: "e10b", x: 620, y: 140, w: 20, h: 100 }
    ],
    spikes: [[220, 425, 420, 15]],
    hint: "Erase barriers standing in your flight path between platforms, and draw bridging lines."
  })
];

/* =========================================================================
   CHAPTER 3: LIMITED INK (Levels 21 - 30)
   ========================================================================= */
const ch3: LevelData[] = [
  createLevel(21, "Every Drop Counts", 3, CHAPTER_NAMES[2], "frugal strokes", [70, 400], [720, 400], 85, 0, [
    [40, 440, 180, 20],
    [600, 440, 160, 20]
  ], {
    spikes: [[240, 425, 340, 15]],
    hint: "Draw a small stepping stone in the middle instead of a massive continuous bridge."
  }),
  createLevel(22, "Steep Incline", 3, CHAPTER_NAMES[2], "ramp physics", [70, 400], [700, 180], 95, 0, [
    [40, 440, 160, 20],
    [640, 220, 120, 20]
  ], {
    hint: "A single gentle straight ramp takes less ink than stairs. Draw one smooth diagonal stroke."
  }),
  createLevel(23, "The Needle Pit", 3, CHAPTER_NAMES[2], "high arch", [70, 400], [720, 400], 80, 0, [
    [40, 440, 140, 20],
    [620, 440, 140, 20]
  ], {
    spikes: [[190, 425, 420, 15]],
    hint: "Jump first to gain height, then draw a short floating ledge mid-air to rest on."
  }),
  createLevel(24, "Conserve", 3, CHAPTER_NAMES[2], "tiny footholds", [70, 400], [720, 260], 65, 0, [
    [40, 440, 140, 20],
    [350, 360, 60, 20],
    [640, 300, 120, 20]
  ], {
    hint: "Use the center platform to rest and jump again. Only draw where strictly necessary."
  }),
  createLevel(25, "Thin Lines", 3, CHAPTER_NAMES[2], "delicate work", [70, 400], [700, 140], 55, 0, [
    [40, 440, 140, 20],
    [260, 340, 60, 20],
    [460, 240, 60, 20],
    [640, 180, 120, 20]
  ], {
    hint: "Plan your trajectory between existing stone ledges before laying down graphite."
  }),
  createLevel(26, "The Vault", 3, CHAPTER_NAMES[2], "springboard curve", [70, 400], [720, 400], 75, 0, [
    [40, 440, 140, 20],
    [320, 280, 40, 160],
    [580, 440, 180, 20]
  ], {
    hint: "Draw a small curve before the central pillar to vault over it."
  }),
  createLevel(27, "Two Drops", 3, CHAPTER_NAMES[2], "two short dashes", [70, 400], [720, 380], 70, 0, [
    [40, 440, 100, 20],
    [700, 420, 60, 20]
  ], {
    spikes: [[160, 425, 520, 15]],
    hint: "Draw two small dash platforms across the sea of spikes."
  }),
  createLevel(28, "The Chasm Roof", 3, CHAPTER_NAMES[2], "ceiling glide", [70, 400], [720, 300], 60, 0, [
    [40, 440, 140, 20],
    [240, 180, 320, 20],
    [640, 340, 120, 20]
  ], {
    spikes: [[180, 425, 440, 15]],
    hint: "Draw a step up to reach the upper ledge, walk across, then hop down to the exit."
  }),
  createLevel(29, "Sparsity", 3, CHAPTER_NAMES[2], "economical motion", [70, 340], [720, 180], 65, 0, [
    [40, 380, 140, 20],
    [360, 280, 60, 20],
    [640, 220, 120, 20]
  ], {
    spikes: [[40, 435, 720, 15]],
    hint: "The floor is fully spiked. Stay airborne by bridging the two high platforms."
  }),
  createLevel(30, "The Inkwell Dry", 3, CHAPTER_NAMES[2], "chapter test", [70, 400], [720, 140], 70, 0, [
    [40, 440, 120, 20],
    [280, 320, 50, 20],
    [480, 220, 50, 20],
    [660, 180, 100, 20]
  ], {
    spikes: [[160, 425, 500, 15]],
    hint: "Jump, draw tiny horizontal dashes right beneath your feet, and leap forward."
  })
];

/* =========================================================================
   CHAPTER 4: MISSING PIECES (Levels 31 - 40)
   ========================================================================= */
const ch4: LevelData[] = [
  createLevel(31, "The Broken Bridge", 4, CHAPTER_NAMES[3], "patch the gap", [70, 320], [720, 320], 95, 0, [
    [40, 360, 240, 20],
    [520, 360, 240, 20]
  ], {
    spikes: [[290, 425, 220, 15]],
    hint: "A piece of the bridge snapped off. Draw a pencil plank to seal the gap."
  }),
  createLevel(32, "Missing Rung", 4, CHAPTER_NAMES[3], "stairway repair", [70, 400], [700, 140], 60, 0, [
    [40, 440, 140, 20],
    [220, 360, 80, 20],
    [500, 200, 80, 20],
    [640, 180, 120, 20]
  ], {
    hint: "Draw the missing middle step around y:280 to bridge the two stairs."
  }),
  createLevel(33, "The Ruined Arch", 4, CHAPTER_NAMES[3], "crown of the arch", [70, 400], [720, 400], 90, 0, [
    [40, 440, 140, 20],
    [200, 280, 80, 160],
    [520, 280, 80, 160],
    [640, 440, 120, 20]
  ], {
    spikes: [[290, 425, 220, 15]],
    hint: "Climb the left arch pillar and draw the missing arch keystones to cross over."
  }),
  createLevel(34, "Cut Corner", 4, CHAPTER_NAMES[3], "corner restore", [70, 400], [720, 200], 80, 0, [
    [40, 440, 280, 20],
    [400, 300, 20, 140],
    [420, 300, 200, 20],
    [640, 240, 120, 20]
  ], {
    hint: "Draw a slope from the lower ground over the tall corner corner-post."
  }),
  createLevel(35, "Half-Drawn Floor", 4, CHAPTER_NAMES[3], "finish the sketch", [70, 300], [720, 300], 75, 0, [
    [40, 340, 200, 20],
    [360, 340, 40, 20],
    [540, 340, 40, 20],
    [660, 340, 100, 20]
  ], {
    spikes: [[40, 435, 720, 15]],
    hint: "Fill in the gaps between the floating floor notches."
  }),
  createLevel(36, "The Gap in the Wall", 4, CHAPTER_NAMES[3], "narrow threshold", [70, 400], [720, 400], 30, 0, [
    [40, 440, 720, 20],
    [380, 80, 40, 200],
    [380, 340, 40, 100]
  ], {
    hint: "There is an open gap between y:280 and y:340. Jump through it without touching the graphite.",
  }),
  createLevel(37, "Fragmented Ledge", 4, CHAPTER_NAMES[3], "puzzle jigsaw", [70, 400], [720, 160], 75, 0, [
    [40, 440, 120, 20],
    [240, 380, 40, 20],
    [360, 300, 40, 20],
    [480, 220, 40, 20],
    [640, 200, 120, 20]
  ], {
    hint: "Connect the fragmented ledge markers into a continuous ramp."
  }),
  createLevel(38, "Torn Page", 4, CHAPTER_NAMES[3], "deep divide", [70, 200], [720, 200], 120, 0, [
    [40, 240, 180, 20],
    [600, 240, 160, 20]
  ], {
    spikes: [[40, 435, 720, 15]],
    hint: "A wide gulf separates the two sides. Draw a horizontal tightrope bridge."
  }),
  createLevel(39, "Missing Keystone", 4, CHAPTER_NAMES[3], "bridge collapse", [70, 400], [720, 400], 60, 2, [
    [40, 440, 240, 20],
    [540, 440, 220, 20]
  ], {
    erasables: [{ id: "e_key", x: 280, y: 380, w: 60, h: 60, label: "blocker" }],
    spikes: [[360, 425, 160, 15]],
    hint: "Erase the blocker and draw a clean plank over the spike chasm."
  }),
  createLevel(40, "Restoration Complete", 4, CHAPTER_NAMES[3], "chapter finale", [70, 400], [720, 120], 70, 2, [
    [40, 440, 140, 20],
    [280, 320, 60, 20],
    [520, 220, 60, 20],
    [660, 160, 100, 20]
  ], {
    erasables: [{ id: "e_c4_fin", x: 280, y: 160, w: 20, h: 160 }],
    spikes: [[160, 425, 480, 15]],
    hint: "Erase the dangling barrier on the second step and draw paths connecting the heights."
  })
];

/* =========================================================================
   CHAPTER 5: FALSE LINES (Levels 41 - 50)
   ========================================================================= */
const ch5: LevelData[] = [
  createLevel(41, "The Decoy Bridge", 5, CHAPTER_NAMES[4], "not all lines hold", [70, 400], [720, 400], 95, 3, [
    [40, 440, 160, 20],
    [600, 440, 160, 20]
  ], {
    erasables: [{ id: "e_fake1", x: 220, y: 380, w: 320, h: 20, label: "fake line" }],
    spikes: [[220, 425, 340, 15]],
    hint: "The dashed bridge at y:380 leads into a trap. Erase it and draw a safe elevated bridge above."
  }),
  createLevel(42, "Mirage Wall", 5, CHAPTER_NAMES[4], "rub the illusion", [70, 400], [720, 400], 0, 4, [
    [40, 440, 720, 20]
  ], {
    erasables: [
      { id: "e_m1", x: 300, y: 260, w: 40, h: 180 },
      { id: "e_m2", x: 440, y: 260, w: 40, h: 180 }
    ],
    hint: "The walls look impenetrable, but both are soft pencil sketches. Erase them cleanly.",
    pencilDisabled: true
  }),
  createLevel(43, "Which Path?", 5, CHAPTER_NAMES[4], "upper or lower", [70, 400], [720, 160], 70, 4, [
    [40, 440, 160, 20],
    [240, 260, 320, 20],
    [640, 200, 120, 20]
  ], {
    erasables: [{ id: "e_path1", x: 400, y: 160, w: 30, h: 100 }],
    spikes: [[220, 425, 380, 15]],
    hint: "Climb up to the middle ledge and erase the wall blocking the upper exit corridor."
  }),
  createLevel(44, "Blind Alley", 5, CHAPTER_NAMES[4], "dead end", [70, 400], [720, 400], 0, 3, [
    [40, 440, 720, 20],
    [320, 220, 160, 20],
    [460, 220, 20, 100]
  ], {
    erasables: [{ id: "e_dead", x: 460, y: 320, w: 20, h: 120 }],
    hint: "The solid corner traps anyone walking down. Erase the lower section to pass right through.",
    pencilDisabled: true
  }),
  createLevel(45, "The Masked Spike", 5, CHAPTER_NAMES[4], "hidden needle", [70, 400], [720, 400], 85, 3, [
    [40, 440, 180, 20],
    [580, 440, 180, 20]
  ], {
    erasables: [{ id: "e_mask", x: 260, y: 400, w: 100, h: 40 }],
    spikes: [[380, 425, 180, 15]],
    hint: "Erase the decoy block on the left and draw high over the spike pit."
  }),
  createLevel(46, "Two Doors?", 5, CHAPTER_NAMES[4], "the true exit", [70, 400], [720, 400], 0, 2, [
    [40, 440, 720, 20],
    [360, 260, 80, 80]
  ], {
    erasables: [{ id: "e_fake_door", x: 360, y: 340, w: 80, h: 100 }],
    hint: "The obstacle in the center can be erased to reveal the straight path to freedom.",
    pencilDisabled: true
  }),
  createLevel(47, "Shadow Ledges", 5, CHAPTER_NAMES[4], "erase the clutter", [70, 400], [720, 180], 65, 5, [
    [40, 440, 140, 20],
    [640, 220, 120, 20]
  ], {
    erasables: [
      { id: "e_sh1", x: 220, y: 360, w: 100, h: 20 },
      { id: "e_sh2", x: 380, y: 280, w: 100, h: 20 },
      { id: "e_sh3", x: 500, y: 200, w: 20, h: 120 }
    ],
    hint: "Erase the vertical bar at x:500 that blocks your access to the right platform."
  }),
  createLevel(48, "Scribble Trap", 5, CHAPTER_NAMES[4], "messy sketch", [70, 400], [720, 400], 0, 4, [
    [40, 440, 720, 20]
  ], {
    erasables: [
      { id: "e_sc1", x: 260, y: 320, w: 50, h: 120 },
      { id: "e_sc2", x: 360, y: 280, w: 50, h: 160 },
      { id: "e_sc3", x: 480, y: 340, w: 50, h: 100 }
    ],
    hint: "Erase all three scribbled columns to carve a smooth pathway.",
    pencilDisabled: true
  }),
  createLevel(49, "The Phantasm Floor", 5, CHAPTER_NAMES[4], "see through it", [70, 200], [720, 400], 90, 4, [
    [40, 240, 240, 20],
    [560, 440, 200, 20]
  ], {
    erasables: [{ id: "e_phan", x: 320, y: 320, w: 160, h: 20 }],
    spikes: [[40, 435, 500, 15]],
    hint: "Draw a safe descending slide from the top ledge all the way to the right floor."
  }),
  createLevel(50, "Clarity", 5, CHAPTER_NAMES[4], "halfway milestone", [70, 400], [720, 140], 75, 5, [
    [40, 440, 140, 20],
    [320, 320, 140, 20],
    [640, 180, 120, 20]
  ], {
    erasables: [
      { id: "e_c5_1", x: 280, y: 200, w: 20, h: 140 },
      { id: "e_c5_2", x: 500, y: 120, w: 20, h: 140 }
    ],
    spikes: [[160, 425, 460, 15]],
    hint: "Erase the two hanging columns and connect the stepping stones with light pencil lines."
  })
];

/* =========================================================================
   CHAPTER 6: WEIGHT AND BALANCE (Levels 51 - 60)
   ========================================================================= */
const ch6: LevelData[] = [
  createLevel(51, "The Ferry", 6, CHAPTER_NAMES[5], "ride the line", [70, 400], [720, 400], 0, 0, [
    [40, 440, 140, 20],
    [640, 440, 120, 20]
  ], {
    movingPlatforms: [{ id: "m1", x: 220, y: 440, w: 100, h: 15, dx: 280, dy: 0, speed: 1.5 }],
    spikes: [[180, 465, 460, 15]],
    hint: "Hop onto the oscillating platform and let it carry you across the spike sea. No drawing allowed.",
    pencilDisabled: true
  }),
  createLevel(52, "Vertical Lift", 6, CHAPTER_NAMES[5], "going up", [70, 400], [700, 140], 100, 0, [
    [40, 440, 160, 20],
    [640, 180, 120, 20]
  ], {
    movingPlatforms: [{ id: "m2", x: 340, y: 380, w: 100, h: 15, dx: 0, dy: -200, speed: 1.4 }],
    hint: "Step on the rising platform, then jump off at its peak toward the exit door.",
  }),
  createLevel(53, "Two Shifts", 6, CHAPTER_NAMES[5], "transfer trains", [70, 400], [720, 400], 0, 0, [
    [40, 440, 120, 20],
    [640, 440, 120, 20]
  ], {
    movingPlatforms: [
      { id: "m3a", x: 180, y: 440, w: 80, h: 15, dx: 140, dy: 0, speed: 1.6 },
      { id: "m3b", x: 420, y: 440, w: 80, h: 15, dx: 140, dy: 0, speed: 1.6 }
    ],
    spikes: [[160, 470, 480, 15]],
    hint: "Transfer from the first moving platform to the second at the center point.",
    pencilDisabled: true
  }),
  createLevel(54, "Pencil Piston", 6, CHAPTER_NAMES[5], "timing the crush", [70, 400], [720, 400], 0, 0, [
    [40, 440, 720, 20]
  ], {
    movingPlatforms: [{ id: "m4", x: 380, y: 120, w: 60, h: 220, dx: 0, dy: 100, speed: 1.8 }],
    hint: "Wait until the giant piston rises before sprinting underneath it.",
    pencilDisabled: true
  }),
  createLevel(55, "Mobile Bridge", 6, CHAPTER_NAMES[5], "draw on the run", [70, 360], [720, 200], 40, 0, [
    [40, 400, 140, 20],
    [640, 240, 120, 20]
  ], {
    movingPlatforms: [{ id: "m5", x: 260, y: 320, w: 80, h: 15, dx: 200, dy: 0, speed: 1.2 }],
    hint: "Ride the platform across, using a tiny pencil step only to reach the high exit."
  }),
  createLevel(56, "The Pendulum Gap", 6, CHAPTER_NAMES[5], "rhythm & momentum", [70, 400], [720, 400], 0, 0, [
    [40, 440, 140, 20],
    [360, 360, 60, 20],
    [640, 440, 120, 20]
  ], {
    movingPlatforms: [{ id: "m6", x: 200, y: 420, w: 70, h: 15, dx: 280, dy: 0, speed: 2.0 }],
    spikes: [[160, 465, 460, 15]],
    hint: "Time your jumps with the swift platform rhythm. Pure timing required.",
    pencilDisabled: true
  }),
  createLevel(57, "The Elevator Shaft", 6, CHAPTER_NAMES[5], "deep ascent", [70, 400], [120, 120], 0, 0, [
    [40, 440, 200, 20],
    [40, 160, 180, 20],
    [260, 80, 20, 360]
  ], {
    movingPlatforms: [{ id: "m7", x: 360, y: 400, w: 90, h: 15, dx: 0, dy: -260, speed: 1.6 }],
    hint: "Walk right into the shaft, ride the lift to the top, and leap back left to the high door.",
    pencilDisabled: true
  }),
  createLevel(58, "Drifting Islands", 6, CHAPTER_NAMES[5], "cross currents", [70, 300], [720, 300], 0, 0, [
    [40, 340, 120, 20],
    [660, 340, 100, 20]
  ], {
    movingPlatforms: [
      { id: "m8a", x: 200, y: 320, w: 70, h: 15, dx: 80, dy: 60, speed: 1.2 },
      { id: "m8b", x: 420, y: 380, w: 70, h: 15, dx: 80, dy: -60, speed: 1.2 }
    ],
    spikes: [[40, 455, 720, 15]],
    hint: "Ride the diagonally oscillating platforms across the void. Pure platforming skill.",
    pencilDisabled: true
  }),
  createLevel(59, "The Seesaw Ledge", 6, CHAPTER_NAMES[5], "tilt the scales", [70, 400], [720, 160], 0, 2, [
    [40, 440, 160, 20],
    [640, 200, 120, 20]
  ], {
    erasables: [{ id: "e_c6", x: 440, y: 260, w: 30, h: 120 }],
    movingPlatforms: [{ id: "m9", x: 240, y: 360, w: 120, h: 15, dx: 180, dy: -100, speed: 1.4 }],
    hint: "Erase the barrier at x:440 while riding the diagonal elevator platform.",
    pencilDisabled: true
  }),
  createLevel(60, "Equilibrium", 6, CHAPTER_NAMES[5], "perfect balance", [70, 400], [720, 120], 0, 0, [
    [40, 440, 140, 20],
    [660, 160, 100, 20]
  ], {
    movingPlatforms: [
      { id: "m10a", x: 220, y: 380, w: 80, h: 15, dx: 100, dy: -80, speed: 1.5 },
      { id: "m10b", x: 440, y: 280, w: 80, h: 15, dx: 100, dy: -80, speed: 1.5 }
    ],
    spikes: [[160, 450, 480, 15]],
    hint: "Chain together the two diagonal lifts to reach the high exit. No pencil permitted.",
    pencilDisabled: true
  })
];

/* =========================================================================
   CHAPTER 7: TWO SIDES (Levels 61 - 70) - НОВЫЙ БАЛАНС
   ========================================================================= */
const ch7: LevelData[] = [
  createLevel(61, "The Brass Key", 7, CHAPTER_NAMES[6], "fetch the key", [70, 400], [720, 400], 0, 0, [
    [40, 440, 720, 20]
  ], {
    keys: [{ id: "k1", x: 340, y: 380 }],
    doors: [{ id: "d1", x: 480, y: 40, w: 20, h: 400, keyId: "k1" }],
    hint: "Walk over to collect the key at x:340; the locked graphite gate will unlock automatically.",
    pencilDisabled: true
  }),
  createLevel(62, "High Key, Low Door", 7, CHAPTER_NAMES[6], "ascend then descend", [70, 400], [720, 400], 55, 0, [
    [40, 440, 720, 20],
    [240, 220, 100, 20]
  ], {
    keys: [{ id: "k2", x: 280, y: 170 }],
    doors: [{ id: "d2", x: 540, y: 40, w: 20, h: 400, keyId: "k2" }],
    hint: "Draw a single steep ramp to reach the high key, then drop down to the gate."
  }),
  createLevel(63, "The Pit Key", 7, CHAPTER_NAMES[6], "dive into danger", [70, 200], [720, 200], 65, 0, [
    [40, 240, 180, 20],
    [600, 240, 160, 20],
    [280, 440, 200, 20]
  ], {
    keys: [{ id: "k3", x: 380, y: 390 }],
    doors: [{ id: "d3", x: 580, y: 40, w: 20, h: 200, keyId: "k3" }],
    hint: "Drop down into the pit, grab the key, and draw a zig-zag ladder with your limited ink."
  }),
  createLevel(64, "Dual Barriers", 7, CHAPTER_NAMES[6], "two locks", [70, 400], [720, 400], 60, 0, [
    [40, 440, 720, 20],
    [320, 240, 120, 20]
  ], {
    keys: [
      { id: "k4a", x: 180, y: 380 },
      { id: "k4b", x: 380, y: 190 }
    ],
    doors: [
      { id: "d4a", x: 480, y: 40, w: 20, h: 400, keyId: "k4a" },
      { id: "d4b", x: 580, y: 40, w: 20, h: 400, keyId: "k4b" }
    ],
    hint: "Use a small drawing to reach the high ledge for the second key, then drop down."
  }),
  createLevel(65, "Key Behind Wall", 7, CHAPTER_NAMES[6], "erase the safe", [70, 400], [720, 400], 0, 2, [
    [40, 440, 720, 20]
  ], {
    erasables: [{ id: "e_vault", x: 280, y: 320, w: 60, h: 120 }],
    keys: [{ id: "k5", x: 310, y: 390 }],
    doors: [{ id: "d5", x: 540, y: 40, w: 20, h: 400, keyId: "k5" }],
    hint: "Erase the safe, grab the key, and walk straight to the unlocked door.",
    pencilDisabled: true
  }),
  createLevel(66, "The Mirror Chamber", 7, CHAPTER_NAMES[6], "symmetric puzzle", [70, 400], [720, 400], 50, 2, [
    [40, 440, 720, 20],
    [390, 100, 20, 240]
  ], {
    erasables: [{ id: "e_mirror", x: 390, y: 340, w: 20, h: 100 }],
    keys: [{ id: "k6", x: 180, y: 240 }],
    doors: [{ id: "d6", x: 580, y: 40, w: 20, h: 400, keyId: "k6" }],
    hint: "Erase the threshold, then draw a small ledge to reach the left key."
  }),
  createLevel(67, "Spike Moat Key", 7, CHAPTER_NAMES[6], "island key", [70, 400], [720, 400], 60, 0, [
    [40, 440, 140, 20],
    [340, 380, 60, 20],
    [620, 440, 140, 20]
  ], {
    keys: [{ id: "k7", x: 370, y: 340 }],
    doors: [{ id: "d7", x: 600, y: 40, w: 20, h: 400, keyId: "k7" }],
    spikes: [
      [180, 445, 160, 15],
      [400, 445, 200, 15]
    ],
    hint: "You have enough ink for two thin bridges: one to the island, one to the door."
  }),
  createLevel(68, "Over the Wall", 7, CHAPTER_NAMES[6], "circuitous run", [70, 400], [720, 180], 45, 2, [
    [40, 440, 240, 20],
    [400, 200, 30, 140],
    [620, 240, 140, 20]
  ], {
    erasables: [{ id: "e_c7_68", x: 400, y: 340, w: 30, h: 100 }],
    keys: [{ id: "k8", x: 500, y: 400 }],
    doors: [{ id: "d8", x: 620, y: 40, w: 20, h: 200, keyId: "k8" }],
    hint: "Erase the lower opening in the center wall to slip through and grab the floor key."
  }),
  createLevel(69, "The Moving Key", 7, CHAPTER_NAMES[6], "catch the platform", [70, 400], [720, 400], 0, 0, [
    [40, 440, 160, 20],
    [620, 440, 140, 20]
  ], {
    movingPlatforms: [{ id: "mk", x: 260, y: 380, w: 80, h: 15, dx: 180, dy: 0, speed: 1.8 }],
    keys: [{ id: "k9", x: 360, y: 330 }],
    doors: [{ id: "d9", x: 580, y: 40, w: 20, h: 400, keyId: "k9" }],
    spikes: [[180, 465, 420, 15]],
    hint: "Jump onto the moving platform to catch the key and ride it to the exit door.",
    pencilDisabled: true
  }),
  createLevel(70, "Threshold of the Two", 7, CHAPTER_NAMES[6], "grand lock", [70, 400], [720, 160], 55, 2, [
    [40, 440, 160, 20],
    [320, 300, 120, 20],
    [640, 220, 120, 20]
  ], {
    erasables: [{ id: "e_c7_wall", x: 440, y: 160, w: 20, h: 140 }],
    keys: [{ id: "k10", x: 380, y: 250 }],
    doors: [{ id: "d10", x: 620, y: 40, w: 20, h: 180, keyId: "k10" }],
    spikes: [[180, 445, 440, 15]],
    hint: "Cross the void with a single bridge, grab the key, erase the wall, and jump to the door."
  })
];

/* =========================================================================
   CHAPTER 8: THE RULES CHANGE (Levels 71 - 80) - НОВЫЙ БАЛАНС
   ========================================================================= */
const ch8: LevelData[] = [
  createLevel(71, "The Coiled Wire", 8, CHAPTER_NAMES[7], "spiral springboard", [70, 400], [700, 140], 0, 0, [
    [40, 440, 720, 20],
    [620, 180, 140, 20]
  ], {
    springs: [[360, 430, 40, 10, 1.4]],
    hint: "Jump onto the spring to launch high onto the ledge. Pure spring physics.",
    pencilDisabled: true
  }),
  createLevel(72, "Double Bounce", 8, CHAPTER_NAMES[7], "chain reaction", [70, 400], [720, 120], 0, 0, [
    [40, 440, 180, 20],
    [400, 320, 80, 20],
    [640, 160, 120, 20]
  ], {
    springs: [
      [220, 430, 40, 10, 1.3],
      [420, 310, 40, 10, 1.4]
    ],
    hint: "Chain both springs together with momentum. No drawing allowed.",
    pencilDisabled: true
  }),
  createLevel(73, "Wind from the Pages", 8, CHAPTER_NAMES[7], "updraft chimney", [70, 400], [720, 120], 0, 0, [
    [40, 440, 220, 20],
    [620, 180, 140, 20]
  ], {
    winds: [[320, 100, 80, 340, 0, -0.6]],
    spikes: [[240, 445, 360, 15]],
    hint: "The updraft will carry you safely over the spikes. Just step into the air current.",
    pencilDisabled: true
  }),
  createLevel(74, "Tailwind", 8, CHAPTER_NAMES[7], "soaring draft", [70, 300], [720, 300], 0, 0, [
    [40, 340, 140, 20],
    [640, 340, 120, 20]
  ], {
    winds: [[200, 180, 420, 260, 0, -0.55]],
    spikes: [[40, 455, 720, 15]],
    hint: "Jump into the wind stream. The updraft will carry you safely across the void.",
    pencilDisabled: true
  }),
  createLevel(75, "Spring & Eraser", 8, CHAPTER_NAMES[7], "clear the flight path", [70, 400], [720, 140], 0, 2, [
    [40, 440, 720, 20],
    [620, 180, 140, 20]
  ], {
    springs: [[260, 430, 40, 10, 1.5]],
    erasables: [{ id: "e_c8_ceil", x: 240, y: 220, w: 120, h: 20 }],
    hint: "Erase the ceiling above the spring, then bounce straight up to the door.",
    pencilDisabled: true
  }),
  createLevel(76, "Headwind Challenge", 8, CHAPTER_NAMES[7], "against the draft", [70, 400], [720, 400], 40, 0, [
    [40, 440, 720, 20]
  ], {
    winds: [[300, 240, 260, 200, -0.4, 0]],
    hint: "The wind pushes left. Draw one tiny diagonal stroke to slip under it."
  }),
  createLevel(77, "The Skyward Catapult", 8, CHAPTER_NAMES[7], "massive launch", [70, 400], [720, 80], 0, 0, [
    [40, 440, 180, 20],
    [640, 120, 120, 20]
  ], {
    springs: [[280, 430, 50, 10, 1.8]],
    spikes: [[360, 445, 260, 15]],
    hint: "Run into the super-spring. It launches you directly to the goal platform.",
    pencilDisabled: true
  }),
  createLevel(78, "Draft & Gate", 8, CHAPTER_NAMES[7], "aerial key", [70, 400], [720, 400], 0, 0, [
    [40, 440, 720, 20]
  ], {
    winds: [[280, 80, 80, 360, 0, -0.6]],
    keys: [{ id: "k_c8", x: 320, y: 140 }],
    doors: [{ id: "d_c8", x: 580, y: 40, w: 20, h: 400, keyId: "k_c8" }],
    hint: "Ride the updraft to grab the floating key, then drop to the unlocked door.",
    pencilDisabled: true
  }),
  createLevel(79, "Pinball Alley", 8, CHAPTER_NAMES[7], "pure bounce precision", [70, 400], [720, 220], 0, 0, [
    [40, 440, 120, 20],
    [340, 370, 80, 20],
    [480, 310, 80, 20],
    [640, 260, 120, 20]
  ], {
    springs: [
      [200, 430, 40, 10, 1.3],
      [360, 360, 40, 10, 1.4],
      [500, 300, 40, 10, 1.4]
    ],
    spikes: [[160, 470, 460, 15]],
    hint: "Chain the three springs with pure timing. No pencil or eraser needed.",
    pencilDisabled: true
  }),
  createLevel(80, "Vortex & Wire", 8, CHAPTER_NAMES[7], "chapter culmination", [70, 400], [720, 120], 50, 2, [
    [40, 440, 140, 20],
    [640, 160, 120, 20]
  ], {
    erasables: [{ id: "e_c8_fin", x: 500, y: 120, w: 20, h: 140 }],
    springs: [[220, 430, 40, 10, 1.4]],
    winds: [[340, 100, 120, 340, 0.35, -0.4]],
    spikes: [[160, 465, 460, 15]],
    hint: "Spring up, ride the wind, erase the bar, and glide to the exit."
  })
];

/* =========================================================================
   CHAPTER 9: ALMOST IMPOSSIBLE (Levels 81 - 90) - НОВЫЙ БАЛАНС
   ========================================================================= */
const ch9: LevelData[] = [
  createLevel(81, "The Labyrinth Gate", 9, CHAPTER_NAMES[8], "three-step sequence", [70, 400], [720, 400], 0, 3, [
    [40, 440, 720, 20],
    [220, 240, 20, 100],
    [420, 100, 20, 140]
  ], {
    erasables: [
      { id: "e_l1", x: 220, y: 340, w: 20, h: 100 },
      { id: "e_l2", x: 420, y: 240, w: 20, h: 100 }
    ],
    keys: [{ id: "k_c9_1", x: 320, y: 380 }],
    doors: [{ id: "d_c9_1", x: 580, y: 40, w: 20, h: 400, keyId: "k_c9_1" }],
    hint: "Erase the maze barriers, grab the key, and walk to the opened gate.",
    pencilDisabled: true
  }),
  createLevel(82, "The Tower of Needle", 9, CHAPTER_NAMES[8], "spiral ascent", [70, 400], [720, 120], 45, 4, [
    [40, 440, 140, 20],
    [240, 360, 100, 20],
    [420, 280, 100, 20],
    [640, 160, 120, 20]
  ], {
    erasables: [{ id: "e_tow", x: 340, y: 180, w: 20, h: 180 }],
    spikes: [
      [180, 445, 440, 15],
      [240, 345, 100, 15]
    ],
    hint: "Erase the tower wall. Use minimal graphite dashes to ascend."
  }),
  createLevel(83, "Pendulum & Trap", 9, CHAPTER_NAMES[8], "synchronized motion", [70, 400], [720, 400], 0, 2, [
    [40, 440, 120, 20],
    [640, 440, 120, 20]
  ], {
    movingPlatforms: [{ id: "m_c9", x: 200, y: 440, w: 90, h: 15, dx: 300, dy: 0, speed: 2.2 }],
    erasables: [{ id: "e_pend", x: 480, y: 320, w: 30, h: 120 }],
    spikes: [[160, 470, 460, 15]],
    hint: "Ride the moving platform, erase the blocking wall mid-air, and leap to the door.",
    pencilDisabled: true
  }),
  createLevel(84, "The Split Corridor", 9, CHAPTER_NAMES[8], "upper or lower run", [70, 400], [720, 240], 40, 4, [
    [40, 440, 140, 20],
    [200, 300, 420, 20],
    [640, 280, 120, 20]
  ], {
    keys: [{ id: "k_c9_4", x: 380, y: 240 }],
    doors: [{ id: "d_c9_4", x: 600, y: 40, w: 20, h: 240, keyId: "k_c9_4" }],
    erasables: [{ id: "e_c9_4", x: 300, y: 300, w: 60, h: 20 }],
    hint: "Erase the blocker, grab the key, and draw a short line to the door."
  }),
  createLevel(85, "Crossfire of Wind", 9, CHAPTER_NAMES[8], "opposing currents", [70, 400], [720, 160], 0, 0, [
    [40, 440, 140, 20],
    [640, 200, 120, 20]
  ], {
    winds: [
      [200, 240, 200, 200, 0, -0.5],
      [420, 160, 200, 200, 0.4, 0]
    ],
    spikes: [[160, 455, 460, 15]],
    hint: "Navigate the intersecting air currents to reach the exit ledge without any drawing.",
    pencilDisabled: true
  }),
  createLevel(86, "The Razor Edge", 9, CHAPTER_NAMES[8], "tight corridor", [70, 400], [720, 400], 35, 4, [
    [40, 440, 720, 20],
    [200, 120, 380, 180]
  ], {
    erasables: [{ id: "e_raz", x: 320, y: 340, w: 40, h: 100 }],
    spikes: [[400, 425, 120, 15]],
    hint: "Erase the block, then draw the most efficient straight bridge over the spikes."
  }),
  createLevel(87, "Double Vault Key", 9, CHAPTER_NAMES[8], "precision bounce", [70, 400], [720, 180], 0, 0, [
    [40, 440, 140, 20],
    [640, 220, 120, 20]
  ], {
    springs: [[240, 430, 40, 10, 1.5]],
    keys: [{ id: "k_c9_7", x: 420, y: 160 }],
    doors: [{ id: "d_c9_7", x: 620, y: 40, w: 20, h: 180, keyId: "k_c9_7" }],
    spikes: [[160, 465, 460, 15]],
    hint: "Use the high bounce spring to launch through the key directly to the goal platform.",
    pencilDisabled: true
  }),
  createLevel(88, "The Clockwork Gear", 9, CHAPTER_NAMES[8], "orbital platforms", [70, 400], [720, 400], 0, 0, [
    [40, 440, 120, 20],
    [640, 440, 120, 20]
  ], {
    movingPlatforms: [
      { id: "m_c9_8a", x: 180, y: 380, w: 70, h: 15, dx: 0, dy: -140, speed: 1.5 },
      { id: "m_c9_8b", x: 320, y: 240, w: 80, h: 15, dx: 140, dy: 0, speed: 1.5 },
      { id: "m_c9_8c", x: 500, y: 240, w: 70, h: 15, dx: 0, dy: 140, speed: 1.5 }
    ],
    spikes: [[140, 465, 490, 15]],
    hint: "Time the moving platforms across the void. Pure platforming skill.",
    pencilDisabled: true
  }),
  createLevel(89, "The False Sanctuary", 9, CHAPTER_NAMES[8], "look closely", [70, 400], [720, 160], 40, 5, [
    [40, 440, 140, 20],
    [320, 340, 160, 20],
    [640, 200, 120, 20]
  ], {
    erasables: [
      { id: "e_c9_9a", x: 380, y: 200, w: 30, h: 140 },
      { id: "e_c9_9b", x: 580, y: 200, w: 30, h: 140 }
    ],
    keys: [{ id: "k_c9_9", x: 400, y: 300 }],
    doors: [{ id: "d_c9_9", x: 620, y: 40, w: 20, h: 160, keyId: "k_c9_9" }],
    spikes: [[160, 455, 460, 15]],
    hint: "Erase the cage, take the key, draw a precise bridge up."
  }),
  createLevel(90, "At the Precipice", 9, CHAPTER_NAMES[8], "penultimate challenge", [70, 400], [720, 120], 35, 4, [
    [40, 440, 120, 20],
    [360, 320, 80, 20],
    [640, 160, 120, 20]
  ], {
    erasables: [{ id: "e_c9_10", x: 480, y: 180, w: 20, h: 140 }],
    springs: [[200, 430, 40, 10, 1.4]],
    keys: [{ id: "k_c9_10", x: 390, y: 260 }],
    doors: [{ id: "d_c9_10", x: 620, y: 40, w: 20, h: 120, keyId: "k_c9_10" }],
    spikes: [[140, 465, 480, 15]],
    hint: "Bounce to the ledge, grab the key, erase the wall, and draw a light bridge."
  })
];

/* =========================================================================
   CHAPTER 10: THE LAST PAGE (Levels 91 - 100) - НОВЫЙ БАЛАНС
   ========================================================================= */
const ch10: LevelData[] = [
  createLevel(91, "The Margin Line", 10, CHAPTER_NAMES[9], "edge of the ruled sheet", [70, 400], [720, 400], 0, 0, [
    [40, 440, 120, 20],
    [260, 440, 80, 20],
    [460, 440, 80, 20],
    [640, 440, 120, 20]
  ], {
    spikes: [
      [160, 465, 100, 15],
      [340, 465, 120, 15],
      [540, 465, 100, 15]
    ],
    hint: "Pure precision platforming. No pencil, no eraser: time your jumps over the spike gaps.",
    pencilDisabled: true
  }),
  createLevel(92, "The Graphite Spiral", 10, CHAPTER_NAMES[9], "wind through the spiral", [70, 200], [400, 280], 35, 2, [
    [40, 240, 140, 20],
    [40, 440, 720, 20],
    [240, 140, 340, 20],
    [240, 140, 20, 240],
    [560, 140, 20, 120],
    [560, 320, 20, 60],
    [240, 380, 340, 20]
  ], {
    erasables: [{ id: "e_spir", x: 560, y: 260, w: 20, h: 60 }],
    hint: "Erase the wall and navigate into the spiral center with very tight ink."
  }),
  createLevel(93, "Origami Crease", 10, CHAPTER_NAMES[9], "folded paper geometry", [70, 400], [720, 140], 30, 1, [
    [40, 440, 140, 20],
    [240, 360, 100, 20],
    [440, 260, 100, 20],
    [640, 180, 120, 20]
  ], {
    erasables: [{ id: "e_fold", x: 420, y: 160, w: 20, h: 100 }],
    spikes: [[180, 445, 440, 15]],
    hint: "Strict single-stroke budget. Erase the high fold and make every dot count."
  }),
  createLevel(94, "The Inkwell Reservoir", 10, CHAPTER_NAMES[9], "deep vat of creativity", [70, 140], [720, 400], 25, 0, [
    [40, 180, 140, 20],
    [620, 440, 140, 20]
  ], {
    spikes: [[40, 465, 580, 15]],
    hint: "Micro ink! Draw a single tiny dot foothold mid-air to survive the drop."
  }),
  createLevel(95, "Scribble & Void", 10, CHAPTER_NAMES[9], "erase the dark scribble", [70, 400], [720, 400], 0, 2, [
    [40, 440, 720, 20]
  ], {
    erasables: [
      { id: "e_c10_5a", x: 260, y: 280, w: 80, h: 160 },
      { id: "e_c10_5b", x: 420, y: 280, w: 80, h: 160 }
    ],
    hint: "No pencil allowed and exactly 2 eraser strokes. Erase only the passing window.",
    pencilDisabled: true
  }),
  createLevel(96, "The Kinetic Sketch", 10, CHAPTER_NAMES[9], "all moving parts", [70, 400], [720, 160], 0, 1, [
    [40, 440, 120, 20],
    [400, 330, 80, 20],
    [640, 200, 120, 20]
  ], {
    movingPlatforms: [
      { id: "m_c10_6", x: 200, y: 400, w: 75, h: 15, dx: 140, dy: -120, speed: 2.2 }
    ],
    springs: [[420, 320, 40, 10, 1.5]],
    erasables: [{ id: "e_c10_6", x: 540, y: 160, w: 20, h: 120 }],
    spikes: [[140, 465, 480, 15]],
    hint: "High-speed moving lift, spring launch, and eraser timing. Pure kinetic mastery.",
    pencilDisabled: true
  }),
  createLevel(97, "The Dual Keylock", 10, CHAPTER_NAMES[9], "harmony of two keys", [70, 400], [720, 400], 35, 0, [
    [40, 440, 720, 20],
    [240, 260, 80, 20],
    [480, 260, 80, 20]
  ], {
    keys: [
      { id: "k_c10_7a", x: 280, y: 220 },
      { id: "k_c10_7b", x: 520, y: 220 }
    ],
    doors: [
      { id: "d_c10_7a", x: 620, y: 40, w: 20, h: 400, keyId: "k_c10_7a" },
      { id: "d_c10_7b", x: 670, y: 40, w: 20, h: 400, keyId: "k_c10_7b" }
    ],
    hint: "Two high keys on limited ledges. Micro-budget ink: draw only tiny ramps."
  }),
  createLevel(98, "The Draft Cathedral", 10, CHAPTER_NAMES[9], "soaring drafts", [70, 400], [720, 100], 0, 0, [
    [40, 440, 140, 20],
    [640, 140, 120, 20]
  ], {
    winds: [
      [220, 110, 100, 330, 0, -0.6],
      [330, 110, 110, 330, 0, -0.6],
      [490, 100, 110, 340, 0, -0.6]
    ],
    spikes: [[140, 465, 490, 15]],
    hint: "Ride the vertical updrafts without any pencil or eraser. Pure aerial mastery.",
    pencilDisabled: true
  }),
  createLevel(99, "Before the End", 10, CHAPTER_NAMES[9], "every mark remembered", [70, 400], [720, 140], 35, 2, [
    [40, 440, 120, 20],
    [320, 340, 100, 20],
    [540, 260, 80, 20],
    [660, 180, 100, 20]
  ], {
    erasables: [
      { id: "e_c10_9a", x: 280, y: 200, w: 20, h: 160 },
      { id: "e_c10_9b", x: 480, y: 120, w: 20, h: 160 }
    ],
    keys: [{ id: "k_c10_9", x: 370, y: 300 }],
    doors: [{ id: "d_c10_9", x: 640, y: 40, w: 20, h: 140, keyId: "k_c10_9" }],
    spikes: [[140, 465, 500, 15]],
    hint: "Erase the barriers, capture the key mid-air, and budget every drop of graphite."
  }),
  createLevel(100, "The Artist's Signature", 10, CHAPTER_NAMES[9], "escape the page", [70, 400], [720, 100], 40, 2, [
    [40, 440, 140, 20],
    [240, 360, 80, 20],
    [440, 280, 80, 20],
    [660, 140, 100, 20]
  ], {
    erasables: [{ id: "e_c10_100", x: 380, y: 140, w: 20, h: 180, label: "signature" }],
    springs: [[260, 350, 40, 10, 1.45]],
    keys: [{ id: "k_100", x: 480, y: 240 }],
    doors: [{ id: "d_100", x: 640, y: 20, w: 20, h: 120, keyId: "k_100" }],
    spikes: [[140, 465, 510, 15]],
    hint: "The supreme trial. Spring jump, erase signature, grab key, and bridge to freedom."
  })
];

export const ALL_100_LEVELS: LevelData[] = [
  ...ch1,
  ...ch2,
  ...ch3,
  ...ch4,
  ...ch5,
  ...ch6,
  ...ch7,
  ...ch8,
  ...ch9,
  ...ch10
];