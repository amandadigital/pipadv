import { PlayerState, Point, DrawnLine, Platform, ErasableItem, HazardSpike, PuzzleKey, PuzzleDoor, SpringDef, WindDraftDef, MovingPlatformDef } from '../types/game';

export interface LevelCollisionEntities {
  platforms: Platform[];
  movingPlatforms: MovingPlatformDef[];
  movingPlatformOffsets: Record<string, { currentX: number; currentY: number }>;
  erasables: ErasableItem[];
  doors: PuzzleDoor[];
  spikes: HazardSpike[];
  springs: SpringDef[];
  winds: WindDraftDef[];
  keys: PuzzleKey[];
  drawnLines: DrawnLine[];
}

export interface PhysicsStepResult {
  player: PlayerState;
  died: boolean;
  respawned: boolean;
  won: boolean;
  collectedKeyId: string | null;
  hitSpring: boolean;
  justLanded: boolean;
}

// Distance from point to line segment
function distToSegmentSquared(p: Point, v: Point, w: Point): { dist2: number; closest: Point } {
  const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
  if (l2 === 0) return { dist2: (p.x - v.x) * (p.x - v.x) + (p.y - v.y) * (p.y - v.y), closest: v };
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const closest = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
  const dist2 = (p.x - closest.x) * (p.x - closest.x) + (p.y - closest.y) * (p.y - closest.y);
  return { dist2, closest };
}

export function updatePhysics(
  player: PlayerState,
  inputs: { left: boolean; right: boolean; jump: boolean; jumpPressed: boolean },
  entities: LevelCollisionEntities,
  exitPos: Point,
  checkpoint: Point
): PhysicsStepResult {
  let died = false;
  let won = false;
  let collectedKeyId: string | null = null;
  let hitSpring = false;
  let justLanded = false;

  const GRAVITY = 0.38;
  const WALK_ACCEL = 0.55;
  const WALK_MAX = 3.4;
  const FRICTION = 0.78;
  const JUMP_FORCE = -8.2;

  // Horizontal acceleration
  if (inputs.left) {
    player.vx -= WALK_ACCEL;
    player.isFacingLeft = true;
  } else if (inputs.right) {
    player.vx += WALK_ACCEL;
    player.isFacingLeft = false;
  } else {
    player.vx *= FRICTION;
    if (Math.abs(player.vx) < 0.05) player.vx = 0;
  }

  // Clamp max walk speed
  if (player.vx > WALK_MAX) player.vx = WALK_MAX;
  if (player.vx < -WALK_MAX) player.vx = -WALK_MAX;

  // Apply wind forces
  for (const wind of entities.winds) {
    if (
      player.x + player.w > wind.x &&
      player.x < wind.x + wind.w &&
      player.y + player.h > wind.y &&
      player.y < wind.y + wind.h
    ) {
      player.vx += wind.forceX;
      player.vy += wind.forceY;
    }
  }

  // Coyote timer & jump buffer
  if (player.isGrounded) {
    player.coyoteTimer = 7;
  } else {
    player.coyoteTimer = Math.max(0, player.coyoteTimer - 1);
  }

  if (inputs.jumpPressed) {
    player.jumpBuffer = 6;
  } else {
    player.jumpBuffer = Math.max(0, player.jumpBuffer - 1);
  }

  // Execute jump
  if (player.jumpBuffer > 0 && player.coyoteTimer > 0) {
    player.vy = JUMP_FORCE;
    player.isGrounded = false;
    player.coyoteTimer = 0;
    player.jumpBuffer = 0;
    player.isJumping = true;
    player.squash = 0.75; // stretch upwards
  }

  // Variable jump height control (cutting short jump)
  if (!inputs.jump && player.vy < -2.5) {
    player.vy *= 0.5;
  }

  // Apply gravity
  player.vy += GRAVITY;
  if (player.vy > 12) player.vy = 12;

  // Squash spring recovery
  player.squash += (1 - player.squash) * 0.2;

  // Walking animation frame
  if (player.isGrounded && Math.abs(player.vx) > 0.3) {
    player.walkFrame += Math.abs(player.vx) * 0.18;
  } else {
    player.walkFrame = 0;
  }

  const wasGrounded = player.isGrounded;
  player.isGrounded = false;

  // 1. Move Horizontally and check collisions
  player.x += player.vx;

  // Bounds check horizontal
  if (player.x < 10) {
    player.x = 10;
    player.vx = 0;
  } else if (player.x + player.w > 790) {
    player.x = 790 - player.w;
    player.vx = 0;
  }

  // Solid boxes for collision
  const solidBoxes: Array<{ x: number; y: number; w: number; h: number }> = [
    ...entities.platforms,
    ...entities.erasables.filter(e => !e.isErased),
    ...entities.doors.filter(d => !d.isOpened),
    ...entities.movingPlatforms.map(mp => {
      const offset = entities.movingPlatformOffsets[mp.id] || { currentX: mp.x, currentY: mp.y };
      return { x: offset.currentX, y: offset.currentY, w: mp.w, h: mp.h };
    })
  ];

  for (const box of solidBoxes) {
    if (
      player.x < box.x + box.w &&
      player.x + player.w > box.x &&
      player.y < box.y + box.h &&
      player.y + player.h > box.y
    ) {
      // Step-up assistance: when walking off a slope or ground onto a slightly elevated platform edge (<= 7px)
      const footOverlap = (player.y + player.h) - box.y;
      if (footOverlap > 0 && footOverlap <= 7 && player.vy >= 0) {
        // Smoothly step up onto the top surface of the platform!
        player.y = box.y - player.h;
        player.vy = 0;
        player.isGrounded = true;
        continue;
      }

      if (player.vx > 0) {
        player.x = box.x - player.w;
        player.vx = 0;
      } else if (player.vx < 0) {
        player.x = box.x + box.w;
        player.vx = 0;
      }
    }
  }

  // 2. Move Vertically and check collisions
  player.y += player.vy;

  for (const box of solidBoxes) {
    if (
      player.x < box.x + box.w &&
      player.x + player.w > box.x &&
      player.y < box.y + box.h &&
      player.y + player.h > box.y
    ) {
      if (player.vy > 0) {
        // Landing on top
        player.y = box.y - player.h;
        player.vy = 0;
        player.isGrounded = true;
        if (!wasGrounded) {
          justLanded = true;
          player.squash = 1.35; // squash on landing
        }
      } else if (player.vy < 0) {
        // Hitting ceiling
        player.y = box.y + box.h;
        player.vy = 0;
      }
    }
  }

  // 2b. Moving Platform Crushing Check (Level 54 Pencil Piston & downward squash)
  for (const mp of entities.movingPlatforms) {
    const offset = entities.movingPlatformOffsets[mp.id] || { currentX: mp.x, currentY: mp.y };
    const mpBox = { x: offset.currentX, y: offset.currentY, w: mp.w, h: mp.h };

    // Check if player is underneath the moving block horizontally
    const xOverlap = (player.x + player.w - 3 > mpBox.x) && (player.x + 3 < mpBox.x + mpBox.w);
    if (xOverlap) {
      const pistonBottom = mpBox.y + mpBox.h;
      // If the descending block penetrates or presses down on Pip's head from above
      if (pistonBottom >= player.y && pistonBottom <= player.y + player.h + 8 && mpBox.y < player.y) {
        // Check if Pip is resting on the floor or near a platform below
        const onFloor = entities.platforms.some(
          plat => player.x + player.w > plat.x &&
                  player.x < plat.x + plat.w &&
                  player.y + player.h >= plat.y - 8 &&
                  player.y + player.h <= plat.y + plat.h + 8
        );
        if (player.isGrounded || onFloor || player.y >= 410) {
          died = true;
        }
      }
    }
  }

  // 3. Collision with Drawn Lines (Platforms & Slopes)
  const feetCenterX = player.x + player.w / 2;
  const playerFeetY = player.y + player.h;
  let standingOnSlope = false;
  let currentSlopeAngle = 0;
  let isSteepFalling = false;

  for (const line of entities.drawnLines) {
    for (let i = 0; i < line.points.length - 1; i++) {
      const p1 = line.points[i];
      const p2 = line.points[i + 1];

      // Orient segment left to right
      const [startPt, endPt] = p1.x <= p2.x ? [p1, p2] : [p2, p1];
      const dx = endPt.x - startPt.x;
      const dy = endPt.y - startPt.y;

      // Ignore zero-length or micro jitter
      if (dx * dx + dy * dy < 2) continue;

      const angle = Math.atan2(dy, dx);
      const steepness = Math.abs(angle);
      const isSheerCliff = steepness > (80 * Math.PI / 180); // approx > 80 degrees

      // Check if player's X overlaps this segment
      if (feetCenterX >= startPt.x - 4 && feetCenterX <= endPt.x + 4) {
        // Calculate exact line height at feetCenterX
        const t = dx === 0 ? 0.5 : Math.max(0, Math.min(1, (feetCenterX - startPt.x) / dx));
        const surfaceY = startPt.y + t * dy;

        if (isSheerCliff) {
          // If slope exceeds 80 degrees, character cannot stand on it and falls!
          const distY = Math.abs(playerFeetY - surfaceY);
          if (distY < 16 && player.x + player.w > startPt.x - 2 && player.x < endPt.x + 2) {
            isSteepFalling = true;
            player.isGrounded = false;
            player.coyoteTimer = 0;
            // Slide down with falling velocity (no horizontal teleportation)
            if (player.vy < 2.5) player.vy = 2.5;
            player.vx *= 0.8;
          }
        } else {
          // Slope is <= 80 degrees: walkable slope! Smoothly walk up and down
          const feetDistY = playerFeetY - surfaceY;
          if (feetDistY >= -14 && feetDistY <= 16 && player.vy >= -1.5) {
            player.y = surfaceY - player.h;
            player.vy = 0;
            player.isGrounded = true;
            standingOnSlope = true;
            currentSlopeAngle = angle;
            if (!wasGrounded) {
              justLanded = true;
              player.squash = 1.3;
            }
          }
        }
      }
    }
  }

  if (isSteepFalling) {
    player.isGrounded = false;
  }

  // Visual lean into the slope:
  // When grounded on a walkable slope, tilt sprite to align with the slope angle!
  // When running on incline, add subtle forward lean into the slope.
  // When in falling state or on flat ground, smoothly returns upright.
  const motionLean = (player.isGrounded && Math.abs(player.vx) > 0.4) ? (player.isFacingLeft ? -0.06 : 0.06) : 0;
  const targetRotation = (player.isGrounded && standingOnSlope && !isSteepFalling) ? (currentSlopeAngle + motionLean) : 0;
  player.slopeAngle = currentSlopeAngle;
  player.rotation = (player.rotation ?? 0) + (targetRotation - (player.rotation ?? 0)) * 0.25;

  // 4. Collision with Springs (Trampolines)
  for (const spring of entities.springs) {
    if (
      player.x + player.w > spring.x &&
      player.x < spring.x + spring.w &&
      player.y + player.h >= spring.y - 4 &&
      player.y + player.h <= spring.y + spring.h + 8 &&
      player.vy >= 0
    ) {
      player.vy = -11.5 * spring.bounce;
      player.isGrounded = false;
      player.squash = 0.6;
      hitSpring = true;
    }
  }

  // 5. Collision with Spikes
  for (const spike of entities.spikes) {
    // Generous hitbox margin (spikes only trigger on inner core)
    const margin = 4;
    if (
      player.x + player.w - margin > spike.x &&
      player.x + margin < spike.x + spike.w &&
      player.y + player.h - margin > spike.y &&
      player.y + margin < spike.y + spike.h
    ) {
      died = true;
    }
  }

  // Fall into abyss
  if (player.y > 510) {
    died = true;
  }

  // Handle death and instant checkpoint respawn
  if (died) {
    player.x = checkpoint.x;
    player.y = checkpoint.y;
    player.vx = 0;
    player.vy = 0;
    player.isGrounded = true;
    player.coyoteTimer = 0;
    player.jumpBuffer = 0;
    player.squash = 1.3;

    return {
      player,
      died: true,
      respawned: true,
      won: false,
      collectedKeyId: null,
      hitSpring: false,
      justLanded: true
    };
  }

  // 6. Check Key Pickups (Generous hitbox covering key ring, stem, and player bounds)
  for (const key of entities.keys) {
    if (!key.collected) {
      const keyCenterY = key.y + 6;
      const pCenterX = player.x + player.w / 2;
      const pCenterY = player.y + player.h / 2;

      const xDist = Math.abs(pCenterX - key.x);
      const yDist = Math.abs(pCenterY - keyCenterY);
      const directDist = Math.hypot(pCenterX - key.x, pCenterY - keyCenterY);

      if ((xDist < (player.w / 2 + 16) && yDist < (player.h / 2 + 20)) || directDist < 34) {
        collectedKeyId = key.id;
      }
    }
  }

  // 7. Check Exit Door Reach
  const exitDist = Math.hypot(
    player.x + player.w / 2 - exitPos.x,
    player.y + player.h / 2 - exitPos.y
  );
  if (exitDist < 28) {
    won = true;
  }

  return {
    player,
    died: false,
    respawned: false,
    won,
    collectedKeyId,
    hitSpring,
    justLanded
  };
}
