import { Particle } from './types';

export class ParticleManager {
  private particles: Particle[] = [];
  private nextId: number = 1;

  public clear() {
    this.particles = [];
  }

  public addDust(x: number, y: number, count: number = 3) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        id: this.nextId++,
        type: 'dust',
        x: x + (Math.random() - 0.5) * 12,
        y: y - Math.random() * 6,
        vx: -60 - Math.random() * 50,
        vy: -20 - Math.random() * 40,
        size: 4 + Math.random() * 4,
        color: '#E2E8F0',
        alpha: 0.7,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.5,
      });
    }
  }

  public addJumpCloud(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 8) * i + Math.PI;
      const speed = 70 + Math.random() * 50;
      this.particles.push({
        id: this.nextId++,
        type: 'dust',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.5,
        size: 6 + Math.random() * 5,
        color: '#CBD5E1',
        alpha: 0.8,
        life: 0.4,
        maxLife: 0.4,
      });
    }
  }

  public addBarkWave(x: number, y: number) {
    // Cute sound wave ring
    this.particles.push({
      id: this.nextId++,
      type: 'bark_wave',
      x: x + 16,
      y: y - 16,
      vx: 180,
      vy: 0,
      size: 14,
      color: '#38BDF8',
      alpha: 0.9,
      life: 0.4,
      maxLife: 0.4,
    });

    // Floating "멍!" text
    this.particles.push({
      id: this.nextId++,
      type: 'score_popup',
      x: x + 24,
      y: y - 24,
      vx: 30,
      vy: -50,
      size: 18,
      color: '#0284C7',
      alpha: 1.0,
      life: 0.6,
      maxLife: 0.6,
      text: '멍! 🐾',
    });
  }

  public addBoneSparkles(x: number, y: number, textPopup?: string) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        id: this.nextId++,
        type: 'sparkle',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        color: ['#F59E0B', '#FBBF24', '#FEF08A', '#FFFFFF'][Math.floor(Math.random() * 4)],
        alpha: 1.0,
        life: 0.55 + Math.random() * 0.25,
        maxLife: 0.8,
      });
    }

    if (textPopup) {
      this.particles.push({
        id: this.nextId++,
        type: 'score_popup',
        x: x,
        y: y - 10,
        vx: 0,
        vy: -70,
        size: 16,
        color: '#F59E0B',
        alpha: 1.0,
        life: 0.7,
        maxLife: 0.7,
        text: textPopup,
      });
    }
  }

  public addCrashDebris(x: number, y: number) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 160;
      this.particles.push({
        id: this.nextId++,
        type: 'debris',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        size: 4 + Math.random() * 5,
        color: ['#78350F', '#64748B', '#B45309', '#EF4444'][Math.floor(Math.random() * 4)],
        alpha: 1.0,
        life: 0.6 + Math.random() * 0.3,
        maxLife: 0.9,
      });
    }
  }

  public addConfetti(x: number, y: number) {
    const palette = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];
    for (let i = 0; i < 40; i++) {
      const angle = (Math.random() * 0.8 - 0.4) - Math.PI / 2;
      const speed = 180 + Math.random() * 220;
      this.particles.push({
        id: this.nextId++,
        type: 'confetti',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 6,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 1.0,
        life: 1.4 + Math.random() * 0.6,
        maxLife: 2.0,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 10,
      });
    }
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Gravity for debris/dust/confetti
      if (p.type === 'debris' || p.type === 'confetti') {
        p.vy += 450 * dt;
      } else if (p.type === 'dust') {
        p.vy += 60 * dt;
      }

      if (p.rotation !== undefined && p.vRot !== undefined) {
        p.rotation += p.vRot * dt;
      }

      // Fade out
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;

      if (p.type === 'score_popup' && p.text) {
        ctx.font = 'bold 16px "Outfit", sans-serif';
        ctx.fillStyle = p.color;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.type === 'bark_wave') {
        const progress = 1 - p.life / p.maxLife;
        const currentRadius = p.size + progress * 32;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3 * (1 - progress);
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, -Math.PI * 0.35, Math.PI * 0.35);
        ctx.stroke();
      } else if (p.type === 'confetti') {
        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.rotation !== undefined) ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      } else if (p.type === 'sparkle') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dust & debris
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
