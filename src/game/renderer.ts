import { PlayerState, Point, DrawnLine, Platform, ErasableItem, HazardSpike, PuzzleKey, PuzzleDoor, SpringDef, WindDraftDef, MovingPlatformDef, Particle, ToolType, CharacterCustomization } from '../types/game';
import { getScarfColor, getInkTone } from './customization';

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
    customization?: CharacterCustomization;
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

  // 13. Draw Player Character
  drawPlayerCharacter(ctx, {
    x: state.player.x + state.player.w / 2,
    y: state.player.y + state.player.h,
    isFacingLeft: state.player.isFacingLeft,
    isGrounded: state.player.isGrounded,
    walkFrame: state.player.walkFrame,
    squash: state.player.squash,
    rotation: state.player.rotation,
    time,
    customization: state.customization
  });

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

export function drawPlayerCharacter(
  ctx: CanvasRenderingContext2D,
  options: {
    x?: number;
    y?: number;
    scale?: number;
    isFacingLeft?: boolean;
    isGrounded?: boolean;
    walkFrame?: number;
    squash?: number;
    rotation?: number;
    time?: number;
    customization?: CharacterCustomization;
  }
) {
  const {
    x = 0,
    y = 0,
    scale = 1,
    isFacingLeft = false,
    isGrounded = true,
    walkFrame = 0,
    squash = 1,
    rotation = 0,
    time = 0,
    customization
  } = options;

  ctx.save();
  ctx.translate(x, y);

  if (rotation) {
    ctx.rotate(rotation);
  }

  const scaleY = squash * scale;
  const scaleX = (1 / Math.sqrt(squash)) * scale;
  ctx.scale(isFacingLeft ? -scaleX : scaleX, scaleY);

  const inkTone = getInkTone(customization?.inkTone);
  const inkColor = inkTone.hex;

  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const headY = -22;

  // 1. Torso stick
  ctx.beginPath();
  ctx.moveTo(0, headY + 5);
  ctx.lineTo(0, -9);
  ctx.stroke();

  // 2. Legs
  if (!isGrounded) {
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
    // Walking leg cycles or standing pose
    const leg1 = Math.sin(walkFrame) * 6;
    const leg2 = -leg1;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(leg1, 0);
    ctx.moveTo(0, -9);
    ctx.lineTo(leg2, 0);
    ctx.stroke();
  }

  // 3. Head (drawn over torso top)
  ctx.beginPath();
  ctx.arc(0, headY, 5.2, 0, Math.PI * 2);
  ctx.fillStyle = inkTone.highlight;
  ctx.fill();
  ctx.stroke();

  // 4. Expression / Eyes (facing right before scale flip)
  const expr = customization?.expression || 'classic';
  ctx.fillStyle = inkColor;
  if (expr === 'cheerful') {
    // Cute curved smiling eyes
    ctx.beginPath();
    ctx.arc(2, headY - 1, 1.8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.lineWidth = 2;
  } else if (expr === 'focused') {
    // Determined eye + brow
    ctx.beginPath();
    ctx.arc(2, headY - 0.8, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.5, headY - 3);
    ctx.lineTo(3.8, headY - 2.2);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.lineWidth = 2;
  } else {
    // Classic curious dot eye
    ctx.beginPath();
    ctx.arc(2, headY - 1, 1.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. THE SCARF (Unmistakable Cozy Fabric Scarf - NOT a tongue!)
  // Wrapped around the neck below the chin, with collar band, knot, and woven fabric tails
  const scarfColorId = customization?.scarfColor ?? 'crimson';
  if (scarfColorId !== 'none') {
    const sc = getScarfColor(scarfColorId);
    const style = customization?.scarfStyle || 'flutter';

    ctx.save();

    // Dainty lightweight collar band around neck
    ctx.fillStyle = sc.fill;
    ctx.strokeStyle = sc.border;
    ctx.lineWidth = 1;

    if (style === 'cozy') {
      // Cute snug winter collar wrap (lightweight & snug)
      ctx.beginPath();
      ctx.ellipse(0, headY + 5.6, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Second snug loop
      ctx.beginPath();
      ctx.ellipse(-0.3, headY + 6.8, 3.4, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Dainty folded tail resting neatly on chest
      ctx.beginPath();
      ctx.moveTo(-1, headY + 6.5);
      ctx.lineTo(-2.8, headY + 9.5);
      ctx.lineTo(-0.8, headY + 9.8);
      ctx.lineTo(0.5, headY + 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cute tiny fringe threads
      ctx.strokeStyle = sc.stripe;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-2.4, headY + 9.6);
      ctx.lineTo(-2.6, headY + 11);
      ctx.moveTo(-1.2, headY + 9.8);
      ctx.lineTo(-1.2, headY + 11.2);
      ctx.stroke();
    } else if (style === 'neckerchief') {
      // Petite triangular bandana
      ctx.beginPath();
      ctx.ellipse(0, headY + 5.5, 3.6, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bandana triangle
      ctx.beginPath();
      ctx.moveTo(-3, headY + 5.8);
      ctx.lineTo(0, headY + 9.8);
      ctx.lineTo(2.5, headY + 5.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Small knot
      ctx.beginPath();
      ctx.arc(-1, headY + 5.8, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Perky little tied bunny ears at back
      const wKnot = Math.sin(time * 9) * 1.2;
      ctx.strokeStyle = sc.fill;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-1.2, headY + 5.8);
      ctx.quadraticCurveTo(-4, headY + 4.5 + wKnot, -6.5, headY + 6 + wKnot);
      ctx.stroke();
    } else {
      // 'flutter' - Dainty Adventurer Ribbon (cute, airy, floating in the breeze!)
      // 1. Soft snug neck collar
      ctx.beginPath();
      ctx.ellipse(0, headY + 5.6, 3.8, 1.8, -0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 2. Cute tiny knot
      ctx.beginPath();
      ctx.arc(-1.2, headY + 5.8, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3. Slender floating ribbon tails
      const wave1 = Math.sin(time * 8.5) * 2;
      const wave2 = Math.cos(time * 8.5 + 1.2) * 1.8;

      // Upper ribbon tail (dainty & bouncy)
      ctx.strokeStyle = sc.fill;
      ctx.lineWidth = 1.9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-1.2, headY + 5.8);
      ctx.bezierCurveTo(
        -4.5, headY + 4.8 + wave1,
        -7.5, headY + 6 + wave1 * 0.6,
        -11, headY + 4.8 - wave1
      );
      ctx.stroke();

      // Tiny cute fringe threads at ribbon tip
      const tipX = -11;
      const tipY = headY + 4.8 - wave1;
      ctx.strokeStyle = sc.stripe;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY - 0.7);
      ctx.lineTo(tipX - 1.8, tipY - 1.2);
      ctx.moveTo(tipX, tipY + 0.7);
      ctx.lineTo(tipX - 1.8, tipY + 1.2);
      ctx.stroke();

      // Under ribbon tail (slender & shorter)
      ctx.strokeStyle = sc.fill;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-1.2, headY + 6.3);
      ctx.quadraticCurveTo(
        -4.5, headY + 7.8 + wave2,
        -7.8, headY + 9 + wave2
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  // 6. HATS / HEADWEAR
  const hatId = customization?.hat || 'none';
  if (hatId !== 'none') {
    ctx.save();
    if (hatId === 'beret') {
      // Artist felt beret
      ctx.fillStyle = '#2b2926';
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 1.3;

      // Soft tilted beret dome
      ctx.beginPath();
      ctx.ellipse(-0.5, headY - 4.5, 7.5, 3.2, -0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Beret stalk / antenna
      ctx.beginPath();
      ctx.moveTo(-1, headY - 7.5);
      ctx.lineTo(-1.5, headY - 10);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (hatId === 'beanie') {
      // Warm knit beanie
      ctx.fillStyle = '#b94040';
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 1.3;

      // Folded beanie dome
      ctx.beginPath();
      ctx.arc(0, headY - 1, 5.8, Math.PI, 0);
      ctx.lineTo(5.8, headY - 3.5);
      ctx.quadraticCurveTo(0, headY - 10, -5.8, headY - 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ribbed cuff
      ctx.fillStyle = '#8f2323';
      ctx.beginPath();
      ctx.rect(-6, headY - 4.5, 12, 3);
      ctx.fill();
      ctx.stroke();

      // Fluffy round pom-pom on top
      ctx.fillStyle = '#faf7f0';
      ctx.beginPath();
      ctx.arc(0, headY - 10, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (hatId === 'crown') {
      // Origami paper crown
      ctx.fillStyle = '#f6d365';
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(-5.5, headY - 4);
      ctx.lineTo(-5.5, headY - 9);
      ctx.lineTo(-2.5, headY - 6.5);
      ctx.lineTo(0, headY - 10.5); // center peak
      ctx.lineTo(2.5, headY - 6.5);
      ctx.lineTo(5.5, headY - 9);
      ctx.lineTo(5.5, headY - 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tiny ruby jewel in center
      ctx.fillStyle = '#c93434';
      ctx.beginPath();
      ctx.arc(0, headY - 6, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatId === 'feather') {
      // Explorer quill feather
      ctx.strokeStyle = '#2b5282';
      ctx.fillStyle = '#93c5fd';
      ctx.lineWidth = 1.2;

      ctx.save();
      ctx.translate(-3, headY - 2);
      ctx.rotate(-0.55);

      // Feather blade
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-3, -7, 0, -14);
      ctx.quadraticCurveTo(3, -7, 0, 0);
      ctx.fill();
      ctx.stroke();

      // Feather shaft / quill
      ctx.strokeStyle = '#1e3a5f';
      ctx.beginPath();
      ctx.moveTo(0, 1.5);
      ctx.lineTo(0, -14);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  ctx.restore();
}

