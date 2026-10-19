import { Obstacle, Collectible } from './types';

export function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save();
  ctx.translate(obs.x, obs.y);

  switch (obs.type) {
    case 'tree_pine':
      drawPineTree(ctx, obs.width, obs.height, obs.variant);
      break;
    case 'tree_oak':
      drawOakTree(ctx, obs.width, obs.height, obs.variant);
      break;
    case 'tree_stump':
      drawTreeStump(ctx, obs.width, obs.height);
      break;
    case 'fallen_log':
      drawFallenLog(ctx, obs.width, obs.height);
      break;
    case 'rock_round':
      drawRoundRock(ctx, obs.width, obs.height);
      break;
    case 'rock_sharp':
      drawSharpRock(ctx, obs.width, obs.height);
      break;
  }

  ctx.restore();
}

// 1. 소나무 (Pine Tree)
function drawPineTree(ctx: CanvasRenderingContext2D, w: number, h: number, variant: number) {
  const trunkW = w * 0.28;
  const trunkH = h * 0.35;

  // Trunk
  ctx.fillStyle = '#78350F';
  ctx.fillRect(-trunkW / 2, -trunkH, trunkW, trunkH);

  // Bark lines
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-trunkW * 0.2, -trunkH * 0.8);
  ctx.lineTo(-trunkW * 0.2, -trunkH * 0.2);
  ctx.moveTo(trunkW * 0.25, -trunkH * 0.6);
  ctx.lineTo(trunkW * 0.25, -trunkH * 0.1);
  ctx.stroke();

  // Tiered pine foliage (3 triangles)
  const tiers = 3;
  const colors = ['#15803D', '#16A34A', '#22C55E'];

  for (let i = 0; i < tiers; i++) {
    const tierBaseY = -trunkH - i * (h * 0.22);
    const tierH = h * 0.36;
    const tierW = w * (1.1 - i * 0.24);

    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(0, tierBaseY - tierH);
    ctx.lineTo(tierW / 2, tierBaseY);
    ctx.quadraticCurveTo(0, tierBaseY - 4, -tierW / 2, tierBaseY);
    ctx.closePath();
    ctx.fill();

    // Snow/highlight edge on pine needles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-tierW / 2, tierBaseY);
    ctx.lineTo(0, tierBaseY - tierH);
    ctx.stroke();
  }

  // Pinecone decoration on one branch
  if (variant > 0.5) {
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.ellipse(w * 0.22, -trunkH - 12, 4, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 2. 활엽수 / 참나무 (Oak Tree)
function drawOakTree(ctx: CanvasRenderingContext2D, w: number, h: number, variant: number) {
  const trunkW = w * 0.32;
  const trunkH = h * 0.42;

  // Sturdy trunk with root flare
  ctx.fillStyle = '#854D0E';
  ctx.beginPath();
  ctx.moveTo(-trunkW * 0.7, 0);
  ctx.quadraticCurveTo(-trunkW * 0.4, -trunkH * 0.5, -trunkW * 0.4, -trunkH);
  ctx.lineTo(trunkW * 0.4, -trunkH);
  ctx.quadraticCurveTo(trunkW * 0.4, -trunkH * 0.5, trunkW * 0.7, 0);
  ctx.closePath();
  ctx.fill();

  // Bark textures
  ctx.strokeStyle = '#5A3207';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -trunkH * 0.8);
  ctx.lineTo(0, -trunkH * 0.2);
  ctx.stroke();

  // Cloud-like leafy foliage clumps
  const canopyY = -trunkH - 4;
  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.arc(0, canopyY - h * 0.25, w * 0.46, 0, Math.PI * 2);
  ctx.arc(-w * 0.28, canopyY - h * 0.16, w * 0.32, 0, Math.PI * 2);
  ctx.arc(w * 0.28, canopyY - h * 0.16, w * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // Lighter leafy highlights
  ctx.fillStyle = '#4ADE80';
  ctx.beginPath();
  ctx.arc(-w * 0.1, canopyY - h * 0.32, w * 0.22, 0, Math.PI * 2);
  ctx.arc(w * 0.15, canopyY - h * 0.2, w * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Red apples / berries if variant
  if (variant > 0.4) {
    ctx.fillStyle = '#EF4444';
    const apples = [
      [-w * 0.2, canopyY - h * 0.2],
      [w * 0.2, canopyY - h * 0.15],
      [0, canopyY - h * 0.36]
    ];
    apples.forEach(([ax, ay]) => {
      ctx.beginPath();
      ctx.arc(ax, ay, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// 3. 그루터기 (Tree Stump)
function drawTreeStump(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Stump body
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(-w * 0.55, 0);
  ctx.lineTo(-w * 0.45, -h * 0.85);
  ctx.lineTo(w * 0.45, -h * 0.85);
  ctx.lineTo(w * 0.55, 0);
  ctx.closePath();
  ctx.fill();

  // Bark roughness
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w * 0.2, -h * 0.7);
  ctx.lineTo(-w * 0.2, -h * 0.1);
  ctx.moveTo(w * 0.2, -h * 0.6);
  ctx.lineTo(w * 0.2, -h * 0.2);
  ctx.stroke();

  // Top cut flat oval
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.85, w * 0.45, h * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Concentric age rings
  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.85, w * 0.32, h * 0.12, 0, 0, Math.PI * 2);
  ctx.ellipse(0, -h * 0.85, w * 0.18, h * 0.06, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Tiny cute green sprout growing out from the side
  ctx.strokeStyle = '#22C55E';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.35, -h * 0.7);
  ctx.quadraticCurveTo(w * 0.55, -h * 0.9, w * 0.5, -h * 1.05);
  ctx.stroke();

  ctx.fillStyle = '#4ADE80';
  ctx.beginPath();
  ctx.ellipse(w * 0.53, -h * 1.05, 5, 3, 0.4, 0, Math.PI * 2);
  ctx.fill();
}

// 4. 쓰러진 통나무 (Fallen Log)
function drawFallenLog(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Main horizontal log
  ctx.fillStyle = '#674019';
  ctx.beginPath();
  ctx.roundRect(-w * 0.5, -h * 0.7, w, h * 0.7, [6, 12, 4, 4]);
  ctx.fill();

  // Wood end cut ring
  ctx.fillStyle = '#B4783E';
  ctx.beginPath();
  ctx.ellipse(-w * 0.45, -h * 0.35, 6, h * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Moss on top
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.ellipse(-w * 0.1, -h * 0.7, w * 0.3, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cute red mushroom growing on top
  const mushX = w * 0.2;
  const mushY = -h * 0.7;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(mushX - 1.5, mushY - 5, 3, 6);
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(mushX, mushY - 5, 5, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(mushX - 2, mushY - 7, 1, 0, Math.PI * 2);
  ctx.arc(mushX + 2, mushY - 6, 1, 0, Math.PI * 2);
  ctx.fill();
}

// 5. 둥근 바위 (Round Boulder)
function drawRoundRock(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Main boulder silhouette
  ctx.fillStyle = '#64748B'; // slate stone
  ctx.beginPath();
  ctx.moveTo(-w * 0.48, 0);
  ctx.quadraticCurveTo(-w * 0.52, -h * 0.75, -w * 0.2, -h * 0.95);
  ctx.quadraticCurveTo(w * 0.25, -h * 1.05, w * 0.48, -h * 0.6);
  ctx.quadraticCurveTo(w * 0.52, -h * 0.2, w * 0.48, 0);
  ctx.closePath();
  ctx.fill();

  // Highlight facet
  ctx.fillStyle = '#94A3B8';
  ctx.beginPath();
  ctx.moveTo(-w * 0.18, -h * 0.9);
  ctx.quadraticCurveTo(w * 0.15, -h * 0.98, w * 0.35, -h * 0.7);
  ctx.quadraticCurveTo(w * 0.1, -h * 0.65, -w * 0.18, -h * 0.9);
  ctx.fill();

  // Shadow bottom
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(-w * 0.42, 0);
  ctx.quadraticCurveTo(0, -h * 0.25, w * 0.42, 0);
  ctx.fill();

  // Stone crack line
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.05, -h * 0.7);
  ctx.lineTo(-w * 0.15, -h * 0.4);
  ctx.lineTo(-w * 0.1, -h * 0.25);
  ctx.stroke();

  // Moss patch on stone top
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.ellipse(-w * 0.2, -h * 0.8, w * 0.18, 5, -0.2, 0, Math.PI * 2);
  ctx.fill();
}

// 6. 뾰족한 바위 (Sharp Jagged Rock)
function drawSharpRock(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Angular crystalline jagged shape
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(-w * 0.5, 0);
  ctx.lineTo(-w * 0.35, -h * 0.55);
  ctx.lineTo(-w * 0.15, -h * 0.4);
  ctx.lineTo(w * 0.05, -h * 1.0);
  ctx.lineTo(w * 0.38, -h * 0.6);
  ctx.lineTo(w * 0.5, 0);
  ctx.closePath();
  ctx.fill();

  // Sunlit facet (left side)
  ctx.fillStyle = '#94A3B8';
  ctx.beginPath();
  ctx.moveTo(-w * 0.15, -h * 0.4);
  ctx.lineTo(w * 0.05, -h * 1.0);
  ctx.lineTo(0, -h * 0.3);
  ctx.closePath();
  ctx.fill();

  // Dark shadow facet (right side)
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.moveTo(w * 0.05, -h * 1.0);
  ctx.lineTo(w * 0.38, -h * 0.6);
  ctx.lineTo(0, -h * 0.3);
  ctx.closePath();
  ctx.fill();

  // Secondary smaller sharp rock alongside
  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.moveTo(-w * 0.55, 0);
  ctx.lineTo(-w * 0.4, -h * 0.45);
  ctx.lineTo(-w * 0.2, 0);
  ctx.closePath();
  ctx.fill();
}

// 간식 / 뼈다귀 그리기 (Collectibles)
export function drawCollectible(ctx: CanvasRenderingContext2D, item: Collectible) {
  if (item.collected) return;

  ctx.save();
  const bobY = Math.sin(item.bobPhase) * 6;
  ctx.translate(item.x, item.y + bobY);

  if (item.type === 'bone') {
    // Golden Bone
    // Soft outer glow halo
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
    grad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();

    // Golden Bone body
    ctx.fillStyle = '#F59E0B'; // Amber gold
    ctx.beginPath();
    ctx.roundRect(-12, -4, 24, 8, 4);
    ctx.fill();

    // Bone ends (4 circular knobs)
    const knobRadius = 5.5;
    const knobs = [
      [-12, -5],
      [-12, 5],
      [12, -5],
      [12, 5],
    ];
    knobs.forEach(([kx, ky]) => {
      ctx.beginPath();
      ctx.arc(kx, ky, knobRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Top bright highlight
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.roundRect(-10, -3, 20, 3, 2);
    ctx.fill();

    // Sparkle star near bone
    const sparkleAngle = item.bobPhase * 2;
    const sx = Math.cos(sparkleAngle) * 14;
    const sy = Math.sin(sparkleAngle) * 10;
    drawSparkleStar(ctx, sx, sy, 3.5, '#FFFFFF');
  } else if (item.type === 'super_meat') {
    // Juicy Meat Drumstick (Super Treat!)
    // Rainbow glow
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // Bone handle
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(-16, -3, 14, 6);
    ctx.beginPath();
    ctx.arc(-16, -4, 4, 0, Math.PI * 2);
    ctx.arc(-16, 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Juicy meat drumstick
    ctx.fillStyle = '#B91C1C';
    ctx.beginPath();
    ctx.ellipse(6, 0, 15, 12, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#F87171';
    ctx.beginPath();
    ctx.ellipse(4, -4, 8, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawSparkleStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.lineTo(r, 0);
    ctx.lineTo(r * 0.25, r * 0.25);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
