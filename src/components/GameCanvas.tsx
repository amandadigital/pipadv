import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LevelData, ToolType, Point, DrawnLine, PlayerState, Particle, UserProgress } from '../types/game';
import { updatePhysics } from '../game/physics';
import { renderGameScene } from '../game/renderer';
import { sound } from '../audio/soundtrack';

interface GameCanvasProps {
  level: LevelData;
  progress: UserProgress;
  currentTool: ToolType;
  inkRemaining: number;
  onInkChange: (ink: number) => void;
  eraserRemaining: number;
  onEraserChange: (charges: number) => void;
  drawnLines: DrawnLine[];
  onDrawnLinesChange: (lines: DrawnLine[]) => void;
  onLevelComplete: (stats: { time: number; inkUsed: number }) => void;
  onDied: () => void;
  touchInput: { left: boolean; right: boolean; jump: boolean };
}

const VIRTUAL_WIDTH = 800;
const VIRTUAL_HEIGHT = 500;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  progress,
  currentTool,
  inkRemaining,
  onInkChange,
  eraserRemaining,
  onEraserChange,
  drawnLines,
  onDrawnLinesChange,
  onLevelComplete,
  touchInput
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic level entity states
  const [erasables, setErasables] = useState(level.erasables || []);
  const [doors, setDoors] = useState(level.doors || []);
  const [keys, setKeys] = useState(level.keys || []);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Synchronous entity tracking refs to avoid frame delays in physics
  const currentDoors = useRef<any[]>(level.doors || []);
  const currentKeys = useRef<any[]>(level.keys || []);

  // Moving platform offsets and tracking
  const movingPlatformOffsets = useRef<Record<string, { currentX: number; currentY: number }>>({});
  const prevMovingPlatformPositions = useRef<Record<string, { x: number; y: number }>>({});

  // Checkpoint position (starts at spawn point)
  const currentCheckpoint = useRef<Point>({ x: level.spawn.x, y: level.spawn.y });

  // Drawing state
  const isDrawing = useRef<boolean>(false);
  const currentStroke = useRef<Point[]>([]);
  const lastScratchSoundTime = useRef<number>(0);
  const mousePos = useRef<Point | null>(null);

  // Player state
  const player = useRef<PlayerState>({
    x: level.spawn.x,
    y: level.spawn.y,
    vx: 0,
    vy: 0,
    w: 16,
    h: 26,
    isGrounded: false,
    isFacingLeft: false,
    isJumping: false,
    coyoteTimer: 0,
    jumpBuffer: 0,
    walkFrame: 0,
    squash: 1,
    slopeAngle: 0,
    rotation: 0
  });

  // Keyboard input states
  const keysDown = useRef<{ left: boolean; right: boolean; jump: boolean; jumpPressed: boolean }>({
    left: false,
    right: false,
    jump: false,
    jumpPressed: false
  });

  const startTime = useRef<number>(performance.now());
  const initialInk = useRef<number>(inkRemaining);
  const isWon = useRef<boolean>(false);

  // Reset player and entities when level changes
  useEffect(() => {
    prevMovingPlatformPositions.current = {};
    currentCheckpoint.current = { x: level.spawn.x, y: level.spawn.y };
    player.current = {
      x: level.spawn.x,
      y: level.spawn.y,
      vx: 0,
      vy: 0,
      w: 16,
      h: 26,
      isGrounded: false,
      isFacingLeft: false,
      isJumping: false,
      coyoteTimer: 0,
      jumpBuffer: 0,
      walkFrame: 0,
      squash: 1,
      slopeAngle: 0,
      rotation: 0
    };
    currentDoors.current = (level.doors || []).map(d => ({ ...d, isOpened: false }));
    currentKeys.current = (level.keys || []).map(k => ({ ...k, collected: false }));
    setErasables(level.erasables || []);
    setDoors(currentDoors.current);
    setKeys(currentKeys.current);
    setParticles([]);
    isWon.current = false;
    startTime.current = performance.now();
    initialInk.current = inkRemaining;
  }, [level]);

  // Convert client coordinate to virtual 800x500 canvas coordinates
  const getCanvasCoords = useCallback((e: MouseEvent | TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;

    return {
      x: Math.max(0, Math.min(VIRTUAL_WIDTH, (clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(VIRTUAL_HEIGHT, (clientY - rect.top) * scaleY))
    };
  }, []);

  // Eraser interaction helper
  const tryEraseAt = useCallback((pt: Point) => {
    if (eraserRemaining <= 0) return;

    let erasedAny = false;
    setErasables(prev =>
      prev.map(item => {
        if (!item.isErased && pt.x >= item.x && pt.x <= item.x + item.w && pt.y >= item.y && pt.y <= item.y + item.h) {
          erasedAny = true;
          // Spawn rubber eraser shavings
          for (let i = 0; i < 14; i++) {
            setParticles(parts => [
              ...parts,
              {
                x: pt.x + (Math.random() - 0.5) * 16,
                y: pt.y + (Math.random() - 0.5) * 16,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2 - 0.5,
                size: Math.random() * 3 + 2,
                alpha: 1,
                color: Math.random() > 0.5 ? '#ded5c5' : '#b3aba0',
                rotation: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 0.2,
                life: 0,
                maxLife: 35
              }
            ]);
          }
          return { ...item, isErased: true };
        }
        return item;
      })
    );

    if (erasedAny) {
      sound.playEraserRub();
      onEraserChange(Math.max(0, eraserRemaining - 1));
    }
  }, [eraserRemaining, onEraserChange]);

  // Pointer event listeners (drawing & erasing)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const pt = getCanvasCoords(e);
      if (!pt) return;
      isDrawing.current = true;
      mousePos.current = pt;

      if (currentTool === 'pencil' && !level.pencilDisabled) {
        if (inkRemaining > 0) {
          currentStroke.current = [pt];
        }
      } else if (currentTool === 'eraser') {
        tryEraseAt(pt);
      }
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const pt = getCanvasCoords(e);
      if (!pt) return;
      mousePos.current = pt;

      if (!isDrawing.current) return;

      if (currentTool === 'pencil' && !level.pencilDisabled) {
        if (inkRemaining <= 0) return;
        const pts = currentStroke.current;
        if (pts.length > 0) {
          const last = pts[pts.length - 1];
          const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
          if (dist >= 5) {
            const cost = dist;
            if (inkRemaining >= cost) {
              pts.push(pt);
              onInkChange(Math.max(0, inkRemaining - cost));

              // Play subtle pencil scratch
              const now = performance.now();
              if (now - lastScratchSoundTime.current > 70) {
                sound.playPencilScratch();
                lastScratchSoundTime.current = now;
              }

              // Graphite dust particles
              if (Math.random() > 0.4) {
                setParticles(parts => [
                  ...parts,
                  {
                    x: pt.x,
                    y: pt.y,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: (Math.random() - 0.5) * 0.8,
                    size: 1.8,
                    alpha: 0.6,
                    color: '#36332f',
                    rotation: 0,
                    vRot: 0,
                    life: 0,
                    maxLife: 20
                  }
                ]);
              }
            }
          }
        }
      } else if (currentTool === 'eraser') {
        tryEraseAt(pt);
      }
    };

    const onPointerUp = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;

      if (currentTool === 'pencil' && !level.pencilDisabled && currentStroke.current.length > 1) {
        const newLine: DrawnLine = {
          id: `line_${Date.now()}_${Math.random()}`,
          points: [...currentStroke.current],
          length: currentStroke.current.length,
          createdAt: Date.now()
        };
        onDrawnLinesChange([...drawnLines, newLine]);
      }
      currentStroke.current = [];
    };

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    return () => {
      canvas.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);

      canvas.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [currentTool, inkRemaining, onInkChange, drawnLines, onDrawnLinesChange, getCanvasCoords, tryEraseAt, level.pencilDisabled]);

  // Keyboard navigation & game input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysDown.current.left = true;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysDown.current.right = true;
      }
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        if (!keysDown.current.jump) {
          keysDown.current.jumpPressed = true;
        }
        keysDown.current.jump = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysDown.current.left = false;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysDown.current.right = false;
      }
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        keysDown.current.jump = false;
        keysDown.current.jumpPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main animation and physics tick loop
  useEffect(() => {
    let animId: number;

    const gameLoop = () => {
      // 1. Update Moving Platforms and carry player
      const t = performance.now() * 0.001;
      const offsets: Record<string, { currentX: number; currentY: number }> = {};
      let ridingDeltaX = 0;
      let ridingDeltaY = 0;

      if (level.movingPlatforms) {
        for (const mp of level.movingPlatforms) {
          const cycle = (Math.sin(t * mp.speed) + 1) / 2;
          const newX = mp.x + mp.dx * cycle;
          const newY = mp.y + mp.dy * cycle;
          offsets[mp.id] = {
            currentX: newX,
            currentY: newY
          };

          const prev = prevMovingPlatformPositions.current[mp.id];
          if (prev) {
            const dx = newX - prev.x;
            const dy = newY - prev.y;

            // Check if player feet are resting on top of this moving platform
            const playerFeet = player.current.y + player.current.h;
            const playerCenterX = player.current.x + player.current.w / 2;

            const isStandingOnPlatform =
              player.current.isGrounded &&
              playerFeet >= prev.y - 6 &&
              playerFeet <= prev.y + 8 &&
              playerCenterX >= prev.x - 4 &&
              playerCenterX <= prev.x + mp.w + 4;

            if (isStandingOnPlatform) {
              ridingDeltaX = dx;
              ridingDeltaY = dy;
            }
          }

          prevMovingPlatformPositions.current[mp.id] = { x: newX, y: newY };
        }
      }
      movingPlatformOffsets.current = offsets;

      // Carry Pip smoothly along with the riding platform!
      if (ridingDeltaX !== 0 || ridingDeltaY !== 0) {
        player.current.x += ridingDeltaX;
        player.current.y += ridingDeltaY;
      }

      // 2. Physics Step
      if (!isWon.current) {
        const inputLeft = keysDown.current.left || touchInput.left;
        const inputRight = keysDown.current.right || touchInput.right;
        const inputJump = keysDown.current.jump || touchInput.jump;
        const inputJumpPressed = keysDown.current.jumpPressed;
        keysDown.current.jumpPressed = false;

        // Checkpoint update: if player is safely resting on a solid platform
        if (player.current.isGrounded && player.current.y < 460 && Math.abs(player.current.vy) < 0.15) {
          const onSolid = level.platforms.some(
            plat => player.current.x + player.current.w > plat.x &&
                    player.current.x < plat.x + plat.w &&
                    Math.abs((player.current.y + player.current.h) - plat.y) < 6
          );
          if (onSolid && player.current.x > currentCheckpoint.current.x + 100) {
            currentCheckpoint.current = { x: player.current.x, y: player.current.y };
          }
        }

        const result = updatePhysics(
          player.current,
          { left: inputLeft, right: inputRight, jump: inputJump, jumpPressed: inputJumpPressed },
          {
            platforms: level.platforms,
            movingPlatforms: level.movingPlatforms || [],
            movingPlatformOffsets: movingPlatformOffsets.current,
            erasables,
            doors: currentDoors.current,
            spikes: level.spikes || [],
            springs: level.springs || [],
            winds: level.winds || [],
            keys: currentKeys.current,
            drawnLines
          },
          level.exit,
          currentCheckpoint.current
        );

        player.current = result.player;

        if (result.justLanded) {
          sound.playLand();
        }

        if (result.hitSpring) {
          sound.playSpring();
        }

        if (result.collectedKeyId) {
          const keyId = result.collectedKeyId;
          sound.playKeyCollect();
          // Update refs synchronously so collision updates immediately
          currentKeys.current = currentKeys.current.map(k =>
            k.id === keyId ? { ...k, collected: true } : k
          );
          let openedAny = false;
          currentDoors.current = currentDoors.current.map(d => {
            if (d.keyId === keyId && !d.isOpened) {
              openedAny = true;
              return { ...d, isOpened: true };
            }
            return d;
          });
          if (openedAny) {
            sound.playDoorOpen();
          }
          setKeys([...currentKeys.current]);
          setDoors([...currentDoors.current]);
        }

        // Instant Checkpoint Respawn: preserves drawn lines & erased obstacles!
        if (result.respawned) {
          sound.playLand();
          // Spawn puff particles at checkpoint
          for (let i = 0; i < 14; i++) {
            setParticles(parts => [
              ...parts,
              {
                x: currentCheckpoint.current.x + 8 + (Math.random() - 0.5) * 16,
                y: currentCheckpoint.current.y + 24,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2 - 0.5,
                size: Math.random() * 2.5 + 1.5,
                alpha: 0.8,
                color: '#61594c',
                rotation: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 0.1,
                life: 0,
                maxLife: 25
              }
            ]);
          }
        }

        if (result.won && !isWon.current) {
          isWon.current = true;
          sound.playLevelComplete();
          const duration = (performance.now() - startTime.current) / 1000;
          const used = Math.max(0, initialInk.current - inkRemaining);
          onLevelComplete({ time: duration, inkUsed: used });
        }
      }

      // 3. Update Particles
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            rotation: p.rotation + p.vRot,
            alpha: Math.max(0, 1 - p.life / p.maxLife),
            life: p.life + 1
          }))
          .filter(p => p.life < p.maxLife)
      );

      // 4. Render Canvas Frame (Crisp 2x Hi-DPI Scaling)
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(2, 2);
          renderGameScene(ctx, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, {
            player: player.current,
            platforms: level.platforms,
            erasables,
            spikes: level.spikes || [],
            doors,
            keys,
            springs: level.springs || [],
            winds: level.winds || [],
            movingPlatforms: level.movingPlatforms || [],
            movingPlatformOffsets: movingPlatformOffsets.current,
            drawnLines,
            currentStroke: currentStroke.current,
            currentTool,
            exitPos: level.exit,
            particles,
            annotation: level.annotation,
            levelId: level.id,
            reducedMotion: progress.reducedMotion,
            mousePos: mousePos.current,
            checkpoint: currentCheckpoint.current
          });
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    level,
    erasables,
    doors,
    keys,
    drawnLines,
    currentTool,
    inkRemaining,
    particles,
    progress.reducedMotion,
    onLevelComplete,
    touchInput
  ]);

  return (
    <div className="relative w-full aspect-[16/10] max-w-5xl border-2 border-[#d2cab9] rounded-lg shadow-md overflow-hidden bg-[#faf7ee]">
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH * 2}
        height={VIRTUAL_HEIGHT * 2}
        className="w-full h-full cursor-crosshair touch-none block"
      />
    </div>
  );
};
