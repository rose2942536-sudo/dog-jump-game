export interface EnvironmentState {
  distance: number;
  canvasWidth: number;
  canvasHeight: number;
  groundY: number;
}

export function drawEnvironment(
  ctx: CanvasRenderingContext2D,
  env: EnvironmentState
) {
  const { distance, canvasWidth: w, canvasHeight: h, groundY } = env;

  // Day / Sunset / Night cycle based on distance (every 800m is a cycle)
  const cyclePhase = (distance % 1200) / 1200; // 0..1

  // 1. Sky Gradient
  drawSky(ctx, w, h, cyclePhase);

  // 2. Sun or Moon
  drawCelestial(ctx, w, h, cyclePhase);

  // 3. Clouds
  drawClouds(ctx, w, h, distance * 0.15, cyclePhase);

  // 4. Distant Mountains (Parallax 0.1)
  drawFarMountains(ctx, w, groundY, distance * 0.08, cyclePhase);

  // 5. Midground Hills & Pine Trees (Parallax 0.35)
  drawMidgroundHills(ctx, w, groundY, distance * 0.35, cyclePhase);

  // 6. Running Ground & Path (Parallax 1.0)
  drawGround(ctx, w, h, groundY, distance);
}

function drawSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  phase: number
) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);

  if (phase < 0.4) {
    // Crisp Morning / Blue Daytime
    grad.addColorStop(0, '#38BDF8'); // Sky blue
    grad.addColorStop(0.5, '#7DD3FC');
    grad.addColorStop(1, '#BAE6FD');
  } else if (phase < 0.7) {
    // Golden Sunset / Twilight
    const t = (phase - 0.4) / 0.3;
    grad.addColorStop(0, '#6366F1'); // Indigo top
    grad.addColorStop(0.4, '#EC4899'); // Rose pink
    grad.addColorStop(0.8, '#F59E0B'); // Warm amber
    grad.addColorStop(1, '#FEF08A'); // Pale yellow horizon
  } else {
    // Starry Night
    grad.addColorStop(0, '#0F172A'); // Deep midnight navy
    grad.addColorStop(0.6, '#1E293B');
    grad.addColorStop(1, '#334155');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Stars at night
  if (phase >= 0.7) {
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137.5) % w);
      const sy = ((i * 73.1) % (h * 0.55));
      const twinkle = Math.sin(phase * 20 + i) * 0.4 + 0.6;
      ctx.globalAlpha = twinkle;
      ctx.fillRect(sx, sy, (i % 3 === 0 ? 2.5 : 1.5), (i % 3 === 0 ? 2.5 : 1.5));
    }
    ctx.restore();
  }
}

function drawCelestial(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  phase: number
) {
  ctx.save();

  if (phase < 0.7) {
    // Radiant Sun
    const sunX = w * 0.82;
    const sunY = h * 0.22 + (phase > 0.4 ? (phase - 0.4) * 120 : 0);

    // Corona glow
    const glow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 65);
    glow.addColorStop(0, phase > 0.4 ? 'rgba(251, 146, 60, 0.4)' : 'rgba(254, 240, 138, 0.45)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
    ctx.fill();

    // Sun core
    ctx.fillStyle = phase > 0.4 ? '#F97316' : '#FDE047';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 24, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Crescent / Glowing Moon
    const moonX = w * 0.82;
    const moonY = h * 0.22;

    const glow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 50);
    glow.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 50, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Craters
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(moonX - 5, moonY - 3, 4, 0, Math.PI * 2);
    ctx.arc(moonX + 6, moonY + 4, 3, 0, Math.PI * 2);
    ctx.arc(moonX - 2, moonY + 7, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawClouds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  offset: number,
  phase: number
) {
  ctx.save();
  const cloudColor = phase > 0.4 && phase < 0.7 
    ? 'rgba(254, 215, 170, 0.75)' // Sunset peach tint
    : phase >= 0.7 
      ? 'rgba(71, 85, 105, 0.4)' // Night slate tint
      : 'rgba(255, 255, 255, 0.82)';

  ctx.fillStyle = cloudColor;

  const clouds = [
    { x: 120, y: h * 0.16, s: 1.0 },
    { x: 420, y: h * 0.24, s: 0.8 },
    { x: 740, y: h * 0.12, s: 1.2 },
    { x: 1080, y: h * 0.22, s: 0.9 },
  ];

  clouds.forEach((c) => {
    const cx = (c.x - offset) % (w + 200) - 100;
    const realX = cx < -100 ? cx + (w + 200) : cx;
    drawSingleCloud(ctx, realX, c.y, c.s);
  });

  ctx.restore();
}

function drawSingleCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number
) {
  ctx.beginPath();
  ctx.arc(x, y, 22 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 8 * s, 26 * s, 0, Math.PI * 2);
  ctx.arc(x + 46 * s, y, 20 * s, 0, Math.PI * 2);
  ctx.arc(x + 22 * s, y + 8 * s, 18 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawFarMountains(
  ctx: CanvasRenderingContext2D,
  w: number,
  groundY: number,
  offset: number,
  phase: number
) {
  ctx.save();
  const mountainColor = phase > 0.4 && phase < 0.7
    ? '#7C3AED' // Sunset purple
    : phase >= 0.7
      ? '#1E293B' // Night deep slate
      : '#93C5FD'; // Soft daytime blue

  ctx.fillStyle = mountainColor;
  ctx.beginPath();
  ctx.moveTo(0, groundY);

  const step = 80;
  for (let x = -80; x <= w + 160; x += step) {
    const worldX = x + offset;
    const peakHeight = Math.sin(worldX * 0.003) * 75 + Math.cos(worldX * 0.007) * 45 + 140;
    const y = groundY - peakHeight;
    ctx.lineTo(x, y);
  }

  ctx.lineTo(w, groundY);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawMidgroundHills(
  ctx: CanvasRenderingContext2D,
  w: number,
  groundY: number,
  offset: number,
  phase: number
) {
  ctx.save();
  const hillColor = phase > 0.4 && phase < 0.7
    ? '#065F46' // Sunset deep emerald
    : phase >= 0.7
      ? '#0F3724' // Night dark forest
      : '#4ADE80'; // Fresh vibrant lime-green

  ctx.fillStyle = hillColor;
  ctx.beginPath();
  ctx.moveTo(0, groundY);

  const step = 40;
  for (let x = -40; x <= w + 80; x += step) {
    const worldX = x + offset;
    const hillHeight = Math.sin(worldX * 0.008) * 35 + 50;
    const y = groundY - hillHeight;
    ctx.lineTo(x, y);
  }

  ctx.lineTo(w, groundY);
  ctx.closePath();
  ctx.fill();

  // Background tree silhouettes on hilltops
  const treeStep = 110;
  ctx.fillStyle = phase >= 0.7 ? '#092416' : '#15803D';
  for (let x = -80; x <= w + 80; x += treeStep) {
    const worldX = x + offset;
    const hillHeight = Math.sin(worldX * 0.008) * 35 + 50;
    const treeBaseY = groundY - hillHeight;

    // Small background pine
    ctx.beginPath();
    ctx.moveTo(x, treeBaseY - 28);
    ctx.lineTo(x + 10, treeBaseY);
    ctx.lineTo(x - 10, treeBaseY);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  groundY: number,
  distance: number
) {
  ctx.save();

  // 1. Soil / Earth bottom section
  const soilGrad = ctx.createLinearGradient(0, groundY, 0, h);
  soilGrad.addColorStop(0, '#854D0E'); // Warm brown top soil
  soilGrad.addColorStop(0.3, '#713F12');
  soilGrad.addColorStop(1, '#451A03'); // Darker bedrock
  ctx.fillStyle = soilGrad;
  ctx.fillRect(0, groundY, w, h - groundY);

  // 2. Rich Lush Grass Top Band
  const grassGrad = ctx.createLinearGradient(0, groundY - 14, 0, groundY + 4);
  grassGrad.addColorStop(0, '#22C55E'); // Fresh green
  grassGrad.addColorStop(1, '#15803D');
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0, groundY - 14, w, 18);

  // 3. Repeating Grass Blades (Parallax 1.0)
  ctx.fillStyle = '#16A34A';
  const bladeSpacing = 16;
  const bladeOffset = distance % bladeSpacing;
  for (let x = -bladeSpacing; x <= w + bladeSpacing; x += bladeSpacing) {
    const bx = x - bladeOffset;
    ctx.beginPath();
    ctx.moveTo(bx - 3, groundY - 14);
    ctx.lineTo(bx, groundY - 24);
    ctx.lineTo(bx + 3, groundY - 14);
    ctx.fill();
  }

  // 4. Little Daisies & Wildflowers
  const flowerSpacing = 85;
  const flowerOffset = distance % flowerSpacing;
  for (let x = -flowerSpacing; x <= w + flowerSpacing; x += flowerSpacing) {
    const fx = x - flowerOffset;
    const seed = Math.abs(Math.sin((x + distance) * 0.1));
    if (seed > 0.4) {
      // Petals
      ctx.fillStyle = seed > 0.7 ? '#FB7185' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(fx - 2, groundY - 18, 2.5, 0, Math.PI * 2);
      ctx.arc(fx + 2, groundY - 18, 2.5, 0, Math.PI * 2);
      ctx.arc(fx, groundY - 20, 2.5, 0, Math.PI * 2);
      ctx.arc(fx, groundY - 16, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Flower center
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(fx, groundY - 18, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 5. Soil Pebbles in Dirt
  ctx.fillStyle = '#B45309';
  const pebbleSpacing = 60;
  const pebbleOffset = distance % pebbleSpacing;
  for (let x = -pebbleSpacing; x <= w + pebbleSpacing; x += pebbleSpacing) {
    const px = x - pebbleOffset;
    ctx.beginPath();
    ctx.arc(px, groundY + 16, 3, 0, Math.PI * 2);
    ctx.arc(px + 28, groundY + 36, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
