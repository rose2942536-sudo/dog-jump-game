import { DogBreed } from './types';

export interface DogAnimState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  isDucking: boolean;
  isDoubleJumping: boolean;
  spinAngle: number;
  squash: number; // 1 = normal, >1 = wide/short, <1 = tall/thin
  runTime: number; // accumulated time for leg cycles
  isDead: boolean;
  isBarking: boolean;
  barkTimer: number;
}

export function drawDog(
  ctx: CanvasRenderingContext2D,
  breed: DogBreed,
  anim: DogAnimState
) {
  ctx.save();

  // Translate to dog center-bottom position
  ctx.translate(anim.x, anim.y);

  // If dead, draw cute crash posture
  if (anim.isDead) {
    drawDeadDog(ctx, breed);
    ctx.restore();
    return;
  }

  // Double jump somersault spin
  if (anim.isDoubleJumping) {
    ctx.rotate(anim.spinAngle);
  }

  // Squash and stretch
  ctx.scale(anim.squash, 2 - anim.squash);

  // If ducking / sliding, compress vertically
  if (anim.isDucking && anim.isGrounded) {
    ctx.scale(1.2, 0.65);
    ctx.translate(0, 10);
  }

  const runPhase = anim.runTime * 14;
  const legCycle1 = Math.sin(runPhase);
  const legCycle2 = Math.sin(runPhase + Math.PI);
  const bodyBob = anim.isGrounded ? Math.abs(Math.sin(runPhase)) * 4 : 0;
  const tailWag = Math.sin(anim.runTime * 22) * 0.35;

  // Global scale for the puppy
  const scale = 0.85;
  ctx.scale(scale, scale);

  // Shift upward for ground alignment
  ctx.translate(0, -32 - bodyBob);

  // 1. Back Legs (Far side - drawn behind body)
  drawLegs(ctx, breed, legCycle2, -1, anim.isGrounded, anim.isDucking);

  // 2. Tail
  drawTail(ctx, breed, tailWag, anim.isGrounded);

  // 3. Body / Torso
  drawBody(ctx, breed, anim.isGrounded);

  // 4. Front Legs (Near side - drawn in front of body)
  drawLegs(ctx, breed, legCycle1, 1, anim.isGrounded, anim.isDucking);

  // 5. Collar & Bell
  drawCollar(ctx, breed);

  // 6. Head, Ears, Face & Snout
  drawHead(ctx, breed, anim);

  ctx.restore();
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  breed: DogBreed,
  isGrounded: boolean
) {
  ctx.save();
  const bl = breed.bodyLength;

  // Main body oval
  ctx.fillStyle = breed.primaryColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26 * bl, 17, 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Soft cream/white belly underbelly
  ctx.fillStyle = breed.secondaryColor;
  ctx.beginPath();
  ctx.ellipse(2, 6, 18 * bl, 10, 0.1, 0, Math.PI);
  ctx.fill();

  // Poodle woolly puffs
  if (breed.id === 'poodle') {
    ctx.fillStyle = breed.primaryColor;
    for (let i = -16; i <= 16; i += 8) {
      ctx.beginPath();
      ctx.arc(i * bl, -4 + (i % 2) * 3, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Corgi butt heart highlight
  if (breed.id === 'corgi') {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-22 * bl, -2, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawLegs(
  ctx: CanvasRenderingContext2D,
  breed: DogBreed,
  phase: number,
  side: number, // -1 = background, 1 = foreground
  isGrounded: boolean,
  isDucking: boolean
) {
  ctx.save();
  const legScale = breed.legLength;
  const isBack = side === -1;

  // Darken background legs slightly for depth
  ctx.fillStyle = isBack ? adjustColor(breed.primaryColor, -25) : breed.primaryColor;

  const rearHipX = -16 * breed.bodyLength;
  const frontHipX = 14 * breed.bodyLength;
  const hipY = 8;

  if (isDucking) {
    // Sliding paws tucked forward
    drawPaw(ctx, breed, rearHipX - 4, hipY + 10, isBack);
    drawPaw(ctx, breed, frontHipX + 8, hipY + 10, isBack);
  } else if (!isGrounded) {
    // Aerial jump pose: front paws reached forward, rear paws tucked back
    const frontAngle = 0.45;
    const rearAngle = -0.55;

    // Rear leg
    ctx.save();
    ctx.translate(rearHipX, hipY);
    ctx.rotate(rearAngle);
    ctx.fillRect(-3, 0, 7, 20 * legScale);
    drawPaw(ctx, breed, 0, 20 * legScale, isBack);
    ctx.restore();

    // Front leg
    ctx.save();
    ctx.translate(frontHipX, hipY);
    ctx.rotate(frontAngle);
    ctx.fillRect(-3, 0, 7, 20 * legScale);
    drawPaw(ctx, breed, 0, 20 * legScale, isBack);
    ctx.restore();
  } else {
    // Running gallop
    const rearAngle = phase * 0.65;
    const frontAngle = -phase * 0.65;

    // Rear leg
    ctx.save();
    ctx.translate(rearHipX, hipY);
    ctx.rotate(rearAngle);
    ctx.fillRect(-3.5, 0, 7, 22 * legScale);
    drawPaw(ctx, breed, 0, 22 * legScale, isBack);
    ctx.restore();

    // Front leg
    ctx.save();
    ctx.translate(frontHipX, hipY);
    ctx.rotate(frontAngle);
    ctx.fillRect(-3.5, 0, 7, 22 * legScale);
    drawPaw(ctx, breed, 0, 22 * legScale, isBack);
    ctx.restore();
  }

  ctx.restore();
}

function drawPaw(
  ctx: CanvasRenderingContext2D,
  breed: DogBreed,
  x: number,
  y: number,
  isBack: boolean
) {
  // White socks for Shiba/Corgi
  if (breed.id === 'corgi' || breed.id === 'shiba') {
    ctx.fillStyle = '#FFFFFF';
  } else if (breed.id === 'poodle') {
    // Fluffy poodle pom on ankle
    ctx.fillStyle = isBack ? adjustColor(breed.primaryColor, -20) : breed.primaryColor;
    ctx.beginPath();
    ctx.arc(x, y - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.ellipse(x + 1, y, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTail(
  ctx: CanvasRenderingContext2D,
  breed: DogBreed,
  wag: number,
  isGrounded: boolean
) {
  ctx.save();
  const rootX = -24 * breed.bodyLength;
  const rootY = -4;

  ctx.translate(rootX, rootY);
  ctx.rotate(-0.3 + wag);

  ctx.fillStyle = breed.primaryColor;

  if (breed.tailStyle === 'curled') {
    // Shiba curled donut tail
    ctx.lineWidth = 9;
    ctx.strokeStyle = breed.primaryColor;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-4, -10, 10, 0.4, Math.PI * 1.8);
    ctx.stroke();

    // White tip
    ctx.strokeStyle = breed.secondaryColor;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(-4, -10, 10, 1.2, 1.9);
    ctx.stroke();
  } else if (breed.tailStyle === 'fluffy_stump') {
    // Corgi cute heart nub tail
    ctx.beginPath();
    ctx.ellipse(-6, -4, 8, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-9, -4, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (breed.tailStyle === 'long_feathery') {
    // Golden Retriever luxuriant plume tail
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-14, -12, -26, -6);
    ctx.quadraticCurveTo(-18, 4, 0, 0);
    ctx.fill();

    // Feathery tufts
    ctx.fillStyle = breed.secondaryColor;
    ctx.beginPath();
    ctx.arc(-20, -7, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (breed.tailStyle === 'pom_pom') {
    // Poodle thin tail with cute round puff
    ctx.lineWidth = 4;
    ctx.strokeStyle = breed.primaryColor;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-12, -12);
    ctx.stroke();

    ctx.fillStyle = breed.primaryColor;
    ctx.beginPath();
    ctx.arc(-14, -14, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCollar(ctx: CanvasRenderingContext2D, breed: DogBreed) {
  ctx.save();
  const neckX = 18 * breed.bodyLength;
  const neckY = -6;

  // Collar band
  ctx.lineWidth = 4;
  ctx.strokeStyle = breed.collarColor;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(neckX - 4, neckY - 5);
  ctx.lineTo(neckX + 2, neckY + 7);
  ctx.stroke();

  // Shiny golden bell
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(neckX + 3, neckY + 7, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Bell shine
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(neckX + 2, neckY + 6, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  breed: DogBreed,
  anim: DogAnimState
) {
  ctx.save();
  const headX = 22 * breed.bodyLength;
  const headY = -16;

  ctx.translate(headX, headY);

  // 1. Back ear
  drawEar(ctx, breed, -1, anim);

  // 2. Head base circle
  ctx.fillStyle = breed.primaryColor;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();

  // Poodle curly crown puff
  if (breed.id === 'poodle') {
    ctx.fillStyle = breed.primaryColor;
    ctx.beginPath();
    ctx.arc(0, -12, 10, 0, Math.PI * 2);
    ctx.arc(-6, -8, 8, 0, Math.PI * 2);
    ctx.arc(6, -8, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // White cheeks & muzzle
  ctx.fillStyle = breed.secondaryColor;
  if (breed.id === 'shiba') {
    // Shiba white cheeks and eyebrows
    ctx.beginPath();
    ctx.ellipse(3, 4, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // White dot eyebrows
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-3, -8, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -8, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (breed.id === 'corgi') {
    // White blaze down forehead and muzzle
    ctx.beginPath();
    ctx.ellipse(6, 4, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -4, 4, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.ellipse(5, 4, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Snout & Nose
  ctx.fillStyle = breed.noseColor;
  ctx.beginPath();
  ctx.ellipse(14, 2, 4, 3, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // White nose highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(13, 1, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // 4. Cheerful Open Mouth & Bouncing Pink Tongue
  const mouthOpen = anim.isBarking || (!anim.isGrounded) || (anim.runTime % 0.6 > 0.3);
  if (mouthOpen) {
    // Mouth cavity
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.arc(10, 6, 4, 0, Math.PI);
    ctx.fill();

    // Pink panting tongue
    ctx.fillStyle = '#FB7185';
    ctx.beginPath();
    ctx.ellipse(12, 9, 3.5, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Cute smile line
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(9, 3, 4, 0.2, Math.PI * 0.85);
    ctx.stroke();
  }

  // 5. Expressive Happy Eye
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.ellipse(3, -2, 3.8, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Big sparkle in eye
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(2, -3.5, 1.6, 0, Math.PI * 2);
  ctx.arc(4.5, -1, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // 6. Front Ear
  drawEar(ctx, breed, 1, anim);

  ctx.restore();
}

function drawEar(
  ctx: CanvasRenderingContext2D,
  breed: DogBreed,
  side: number,
  anim: DogAnimState
) {
  ctx.save();
  const isBack = side === -1;
  const earX = isBack ? -6 : -2;
  const earY = isBack ? -12 : -8;
  const earScale = isBack ? 0.9 : 1.0;

  // Wind flop angle based on speed / jump
  const windAngle = (!anim.isGrounded ? -0.35 : -0.15) + Math.sin(anim.runTime * 18) * 0.12;

  ctx.translate(earX, earY);
  ctx.scale(earScale, earScale);
  ctx.rotate(windAngle);

  if (breed.earStyle === 'pointed' || breed.earStyle === 'large_bat') {
    // Shiba / Corgi upright alert ears
    const earHeight = breed.earStyle === 'large_bat' ? 24 : 17;
    const earWidth = breed.earStyle === 'large_bat' ? 12 : 9;

    ctx.fillStyle = isBack ? adjustColor(breed.earColor, -20) : breed.earColor;
    ctx.beginPath();
    ctx.moveTo(-earWidth / 2, 4);
    ctx.lineTo(0, -earHeight);
    ctx.lineTo(earWidth / 2, 2);
    ctx.closePath();
    ctx.fill();

    // Inner pink ear
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.moveTo(-earWidth / 4, 2);
    ctx.lineTo(0, -earHeight + 4);
    ctx.lineTo(earWidth / 4, 1);
    ctx.closePath();
    ctx.fill();
  } else if (breed.earStyle === 'floppy' || breed.earStyle === 'curly_floppy') {
    // Retriever / Poodle floppy ears
    ctx.fillStyle = isBack ? adjustColor(breed.primaryColor, -25) : breed.primaryColor;
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.quadraticCurveTo(8, -2, 6, 16);
    ctx.quadraticCurveTo(0, 20, -6, 12);
    ctx.closePath();
    ctx.fill();

    if (breed.earStyle === 'curly_floppy') {
      // Curly puffs on poodle ear
      ctx.fillStyle = breed.primaryColor;
      ctx.beginPath();
      ctx.arc(4, 14, 5, 0, Math.PI * 2);
      ctx.arc(-2, 15, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawDeadDog(ctx: CanvasRenderingContext2D, breed: DogBreed) {
  ctx.save();
  // Sitting or fallen dog with dizzy spiral eyes and a bandage
  ctx.translate(0, -20);
  ctx.rotate(0.3);

  // Body
  ctx.fillStyle = breed.primaryColor;
  ctx.beginPath();
  ctx.ellipse(0, 4, 24, 16, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(18, -10, 14, 0, Math.PI * 2);
  ctx.fill();

  // Dizzy X eyes
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  // Eye 1
  ctx.beginPath();
  ctx.moveTo(14, -13);
  ctx.lineTo(20, -7);
  ctx.moveTo(20, -13);
  ctx.lineTo(14, -7);
  ctx.stroke();

  // Bandage on forehead
  ctx.fillStyle = '#FEF08A';
  ctx.save();
  ctx.translate(22, -18);
  ctx.rotate(-0.4);
  ctx.fillRect(-6, -3, 12, 6);
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(-1.5, -2, 3, 4);
  ctx.fillRect(-3, -0.8, 6, 1.6);
  ctx.restore();

  // Droopy tail
  ctx.fillStyle = breed.primaryColor;
  ctx.beginPath();
  ctx.ellipse(-24, 10, 6, 12, 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function adjustColor(color: string, amount: number): string {
  // Simple hex color darkening/lightening
  if (!color.startsWith('#') || color.length < 7) return color;
  const num = parseInt(color.slice(1), 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
