import { PlayerState, Point, DrawnLine, Platform, ErasableItem, HazardSpike, PuzzleKey, PuzzleDoor, SpringDef, WindDraftDef, MovingPlatformDef, Particle, ToolType } from '../types/game';

// Deterministic jitter for sketchy hand-drawn feel
function jitter(val: number, amount: number = 1.2): number {
  return val + (Math.sin(val * 12.9898) * amount);
}

export function drawSketchLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string = '#2a2825',
  width: number = 2
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 1.5;
  const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 1.5;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(midX, midY, x2, y2);
  ctx.stroke();

  // Secondary faint pencil pass for authentic graphite feel
  ctx.strokeStyle = 'rgba(42, 40, 37, 0.25)';
  ctx.lineWidth = Math.max(1, width - 1);
  ctx.beginPath();
  ctx.moveTo(x1 + 0.5, y1 - 0.5);
  ctx.lineTo(x2 - 0.5, y2 + 0.5);
  ctx.stroke();

  ctx.restore();
}

export function drawSketchRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fillColor?: string,
  strokeColor: string = '#2a2825',
  isDashed: boolean = false
) {
  ctx.save();
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, w, h);
  }

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  if (isDashed) {
    ctx.setLineDash([6, 4]);
  }

  // Draw 4 sketchy borders
  ctx.beginPath();
  ctx.moveTo(x + jitter(x, 1), y + jitter(y, 1));
  ctx.lineTo(x + w + jitter(x + w, 1), y);
  ctx.lineTo(x + w, y + h + jitter(y + h, 1));
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

export function renderGameScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: {
    player: PlayerState;
    platforms: Platform[];
    erasables: ErasableItem[];
    spikes: HazardSpike[];
    doors: PuzzleDoor[];
    keys: PuzzleKey[];
    springs: SpringDef[];
    winds: WindDraftDef[];
    movingPlatforms: MovingPlatformDef[];
    movingPlatformOffsets: Record<string, { currentX: number; currentY: number }>;
    drawnLines: DrawnLine[];
    currentStroke: Point[] | null;
    currentTool: ToolType;
    exitPos: Point;
    particles: Particle[];
    annotation?: string;
    levelId: number;
    reducedMotion: boolean;
    mousePos: Point | null;
    checkpoint?: Point;
  }
) {
  const time = performance.now() * 0.001;

  // 1. Clear & Draw Notebook Paper Texture
  ctx.fillStyle = '#faf7f0';
  ctx.fillRect(0, 0, width, height);

  // Ruled notebook lines (horizontal)
  ctx.strokeStyle = 'rgba(60, 50, 40, 0.045)';
  ctx.lineWidth = 1;
  for (let y = 28; y < height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Vertical margin line (faint rose-graphite notebook margin)
  ctx.strokeStyle = 'rgba(180, 80, 80, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(42, height);
  ctx.stroke();

  // Subtle notebook perforation / spiral binder holes on left margin
  ctx.fillStyle = 'rgba(50, 45, 40, 0.06)';
  for (let y = 20; y < height; y += 32) {
    ctx.beginPath();
    ctx.arc(16, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Handwritten Annotation / Marginalia on canvas
  if (state.annotation) {
    ctx.save();
    ctx.font = '22px "Caveat", cursive';
    ctx.fillStyle = 'rgba(60, 55, 50, 0.5)';
    ctx.fillText(state.annotation, 64, 46);
    ctx.restore();
  }

  // 3. Draw Wind Drafts
  for (const wind of state.winds) {
    ctx.save();
    ctx.fillStyle = 'rgba(180, 200, 220, 0.08)';
    ctx.fillRect(wind.x, wind.y, wind.w, wind.h);

    // Floating animated draft stream lines
    ctx.strokeStyle = 'rgba(100, 120, 140, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    const offset = (time * 60) % 16;
    ctx.lineDashOffset = -offset;

    if (Math.abs(wind.forceY) > Math.abs(wind.forceX)) {
      // Updraft
      for (let x = wind.x + 15; x < wind.x + wind.w; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, wind.y + wind.h);
        ctx.lineTo(x, wind.y);
        ctx.stroke();
      }
    } else {
      // Horizontal wind
      for (let y = wind.y + 15; y < wind.y + wind.h; y += 22) {
        ctx.beginPath();
        ctx.moveTo(wind.x, y);
        ctx.lineTo(wind.x + wind.w, y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 4. Draw Static Platforms (Hand-Drawn Pencil Slabs)
  for (const p of state.platforms) {
    ctx.save();
    ctx.fillStyle = '#f0ebe0';
    ctx.fillRect(p.x, p.y, p.w, p.h);

    // Sketchy hatch lines inside platform for tactile paper texture
    ctx.strokeStyle = 'rgba(50, 45, 40, 0.12)';
    ctx.lineWidth = 1;
    for (let x = p.x + 4; x < p.x + p.w; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, p.y + 2);
      ctx.lineTo(x - 4, p.y + p.h - 2);
      ctx.stroke();
    }

    drawSketchRect(ctx, p.x, p.y, p.w, p.h, undefined, '#2b2926');
    ctx.restore();
  }

  // 5. Draw Moving Platforms
  for (const mp of state.movingPlatforms) {
    const offset = state.movingPlatformOffsets[mp.id] || { currentX: mp.x, currentY: mp.y };
    ctx.save();
    ctx.fillStyle = '#ebe4d5';
    ctx.fillRect(offset.currentX, offset.currentY, mp.w, mp.h);

    // Track line showing motion range
    ctx.strokeStyle = 'rgba(60, 50, 40, 0.1)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mp.x, mp.y + mp.h / 2);
    ctx.lineTo(mp.x + mp.dx, mp.y + mp.dy + mp.h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    drawSketchRect(ctx, offset.currentX, offset.currentY, mp.w, mp.h, undefined, '#252320');
    ctx.restore();
  }

  // 6. Draw Erasable Items (dashed pencil marks, erasable texture)
  for (const item of state.erasables) {
    if (item.isErased) continue;
    ctx.save();
    ctx.fillStyle = 'rgba(235, 230, 218, 0.85)';
    ctx.fillRect(item.x, item.y, item.w, item.h);

    // Cross-hatching to signify erasable pencil sketch
    ctx.strokeStyle = 'rgba(80, 75, 70, 0.35)';
    ctx.lineWidth = 1;
    for (let x = item.x + 4; x < item.x + item.w + item.h; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, item.y);
      ctx.lineTo(x - item.h, item.y + item.h);
      ctx.stroke();
    }

    drawSketchRect(ctx, item.x, item.y, item.w, item.h, undefined, '#48443e', true);

    if (item.label) {
      ctx.font = '14px "Caveat", cursive';
      ctx.fillStyle = '#6e6962';
      ctx.fillText(item.label, item.x + 4, item.y - 4);
    }
    ctx.restore();
  }

  // 7. Draw Spikes (Graphite needles)
  for (const s of state.spikes) {
    ctx.save();
    ctx.fillStyle = '#2b2926';
    const spikeCount = Math.max(1, Math.floor(s.w / 14));
    const step = s.w / spikeCount;

    ctx.beginPath();
    for (let i = 0; i < spikeCount; i++) {
      const baseX = s.x + i * step;
      ctx.moveTo(baseX, s.y + s.h);
      ctx.lineTo(baseX + step / 2, s.y);
      ctx.lineTo(baseX + step, s.y + s.h);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 8. Draw Springs (Spiral notebook coils)
  for (const spring of state.springs) {
    ctx.save();
    ctx.strokeStyle = '#2b2926';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const loops = 4;
    const loopW = spring.w / loops;
    for (let i = 0; i < loops; i++) {
      const lx = spring.x + i * loopW;
      ctx.arc(lx + loopW / 2, spring.y + spring.h / 2, loopW / 2, 0, Math.PI, true);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 9. Draw Locked Doors & Keys
  for (const door of state.doors) {
    if (door.isOpened) continue;
    ctx.save();
    ctx.fillStyle = '#e8dec8';
    ctx.fillRect(door.x, door.y, door.w, door.h);

    // Iron gate bars
    ctx.strokeStyle = '#2a2825';
    ctx.lineWidth = 2;
    for (let x = door.x + 5; x < door.x + door.w; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, door.y);
      ctx.lineTo(x, door.y + door.h);
      ctx.stroke();
    }
    drawSketchRect(ctx, door.x, door.y, door.w, door.h, undefined, '#2a2825');

    // Keyhole icon in door center
    ctx.fillStyle = '#2a2825';
    ctx.beginPath();
    ctx.arc(door.x + door.w / 2, door.y + door.h / 2 - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(door.x + door.w / 2 - 1.5, door.y + door.h / 2 - 2, 3, 8);
    ctx.restore();
  }

  for (const key of state.keys) {
    if (key.collected) continue;
    ctx.save();
    const bob = state.reducedMotion ? 0 : Math.sin(time * 4) * 3;
    const ky = key.y + bob;

    ctx.strokeStyle = '#9c7333';
    ctx.fillStyle = '#c9a15b';
    ctx.lineWidth = 2;

    // Key ring
    ctx.beginPath();
    ctx.arc(key.x, ky, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Key stem & teeth
    ctx.beginPath();
    ctx.moveTo(key.x, ky + 6);
    ctx.lineTo(key.x, ky + 18);
    ctx.moveTo(key.x, ky + 14);
    ctx.lineTo(key.x + 4, ky + 14);
    ctx.moveTo(key.x, ky + 18);
    ctx.lineTo(key.x + 4, ky + 18);
    ctx.stroke();
    ctx.restore();
  }

  // 10. Draw Exit Doorway (The notebook exit portal)
  ctx.save();
  const exitX = state.exitPos.x;
  const exitY = state.exitPos.y;
  const doorW = 26;
  const doorH = 38;

  // Door aura / graphite glow
  const aura = ctx.createRadialGradient(exitX, exitY, 4, exitX, exitY, 32);
  aura.addColorStop(0, 'rgba(42, 40, 37, 0.12)');
  aura.addColorStop(1, 'rgba(42, 40, 37, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(exitX - 35, exitY - 45, 70, 70);

  // Doorway frame
  ctx.fillStyle = '#2b2926';
  ctx.fillRect(exitX - doorW / 2, exitY - doorH / 2, doorW, doorH);

  // Inner doorway arch (soft paper light from the next page)
  ctx.fillStyle = '#faf7f0';
  ctx.beginPath();
  ctx.rect(exitX - doorW / 2 + 3, exitY - doorH / 2 + 3, doorW - 6, doorH - 3);
  ctx.fill();

  // Subtle doorknob
  ctx.fillStyle = '#2b2926';
  ctx.beginPath();
  ctx.arc(exitX + 6, exitY, 2, 0, Math.PI * 2);
  ctx.fill();

  // Exit annotation
  ctx.font = '13px "Caveat", cursive';
  ctx.fillStyle = 'rgba(42, 40, 37, 0.6)';
  ctx.fillText('exit', exitX - 8, exitY - doorH / 2 - 6);
  ctx.restore();

  // Draw Checkpoint Marker (Subtle pencil bookmark)
  if (state.checkpoint) {
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 90, 80, 0.35)';
    ctx.fillStyle = 'rgba(120, 100, 70, 0.25)';
    ctx.lineWidth = 1.2;
    const cx = state.checkpoint.x + 8;
    const cy = state.checkpoint.y + 26;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - 14);
    ctx.lineTo(cx + 6, cy - 10);
    ctx.lineTo(cx, cy - 6);
    ctx.stroke();
    ctx.restore();
  }

  // 11. Draw Player Drawn Lines (Solid graphite platforms)
  for (const line of state.drawnLines) {
    if (line.points.length < 2) continue;
    ctx.save();
    ctx.strokeStyle = '#1e1c1a';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(line.points[0].x, line.points[0].y);
    for (let i = 1; i < line.points.length; i++) {
      ctx.lineTo(line.points[i].x, line.points[i].y);
    }
    ctx.stroke();

    // Charcoal friction texture trace
    ctx.strokeStyle = 'rgba(50, 45, 40, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Draw current live stroke being drawn
  if (state.currentStroke && state.currentStroke.length > 1) {
    ctx.save();
    ctx.strokeStyle = '#38342f';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(state.currentStroke[0].x, state.currentStroke[0].y);
    for (let i = 1; i < state.currentStroke.length; i++) {
      ctx.lineTo(state.currentStroke[i].x, state.currentStroke[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 12. Draw Particles (Graphite dust & eraser shavings)
  for (const p of state.particles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  }

  // 13. Draw Player Character (Minimalist hand-sketched stick figure)
  const p = state.player;
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h);

  // Lean over when walking on slopes!
  if (p.rotation) {
    ctx.rotate(p.rotation);
  }

  // Squash & stretch scale
  const scaleY = p.squash;
  const scaleX = 1 / Math.sqrt(p.squash);
  ctx.scale(p.isFacingLeft ? -scaleX : scaleX, scaleY);

  ctx.strokeStyle = '#1e1c1a';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Head
  const headY = -22;
  ctx.beginPath();
  ctx.arc(0, headY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#faf7f0';
  ctx.fill();
  ctx.stroke();

  // Eye dot
  ctx.fillStyle = '#1e1c1a';
  ctx.beginPath();
  ctx.arc(2, headY - 1, 1, 0, Math.PI * 2);
  ctx.fill();

  // Torso
  ctx.beginPath();
  ctx.moveTo(0, headY + 5);
  ctx.lineTo(0, -9);
  ctx.stroke();

  // Headband / Scarf trailing in the wind
  ctx.strokeStyle = 'rgba(60, 50, 45, 0.7)';
  ctx.lineWidth = 1.5;
  const scarfWave = Math.sin(time * 10) * 3;
  ctx.beginPath();
  ctx.moveTo(-2, headY + 2);
  ctx.quadraticCurveTo(-7, headY + 4 + scarfWave, -12, headY + 2 - scarfWave);
  ctx.stroke();

  // Legs with running animation
  ctx.strokeStyle = '#1e1c1a';
  ctx.lineWidth = 2;
  if (!p.isGrounded) {
    // Airborne jump pose
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(-4, -4);
    ctx.lineTo(-2, 0);
    ctx.moveTo(0, -9);
    ctx.lineTo(4, -5);
    ctx.lineTo(5, 0);
    ctx.stroke();
  } else {
    // Walking leg cycles
    const leg1 = Math.sin(p.walkFrame) * 6;
    const leg2 = -leg1;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(leg1, 0);
    ctx.moveTo(0, -9);
    ctx.lineTo(leg2, 0);
    ctx.stroke();
  }

  ctx.restore();

  // 14. Draw Tool Cursor (Pencil or Eraser tip near cursor)
  if (state.mousePos) {
    const mx = state.mousePos.x;
    const my = state.mousePos.y;
    ctx.save();
    if (state.currentTool === 'pencil') {
      // Small pencil tip indicator
      ctx.strokeStyle = '#2b2926';
      ctx.fillStyle = '#4a453e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + 8, my - 16);
      ctx.lineTo(mx + 14, my - 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Small eraser block indicator
      ctx.strokeStyle = '#7c7367';
      ctx.fillStyle = 'rgba(230, 220, 215, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(mx - 8, my - 8, 16, 16);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}
