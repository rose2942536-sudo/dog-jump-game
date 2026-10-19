import { DogBreed, Obstacle, Collectible, GameState, GameScoreState, ObstacleType } from './types';
import { DOG_BREEDS } from './breeds';
import { drawDog, DogAnimState } from './dogRenderer';
import { drawObstacle, drawCollectible } from './obstacleRenderer';
import { drawEnvironment } from './environmentRenderer';
import { ParticleManager } from './particles';
import { soundManager } from './sound';

export interface EngineCallbacks {
  onStateChange: (state: GameState) => void;
  onScoreUpdate: (scores: GameScoreState) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Viewport virtual dimensions
  private readonly V_WIDTH = 1200;
  private readonly V_HEIGHT = 675; // 16:9 ratio
  private readonly GROUND_Y = 560;

  // Game state
  public state: GameState = 'TITLE';
  public currentBreed: DogBreed = DOG_BREEDS.shiba;
  private callbacks: EngineCallbacks;

  // Physics constants
  private readonly GRAVITY = 1850;
  private readonly JUMP_VELOCITY = -740;
  private readonly DOUBLE_JUMP_VELOCITY = -620;
  private readonly MIN_JUMP_VELOCITY = -320;

  // Dog entity state
  private dogX = 180;
  private dogY = 560;
  private dogVy = 0;
  private isGrounded = true;
  private isDucking = false;
  private jumpsRemaining = 2;
  private squash = 1;
  private runTime = 0;
  private spinAngle = 0;
  private isDoubleJumping = false;
  private isBarking = false;
  private barkTimer = 0;
  private stepSoundTimer = 0;

  // Input & Timers
  private coyoteTimer = 0; // seconds remaining to allow jump after falling
  private jumpBufferTimer = 0; // seconds jump press remains active before landing
  private isJumpHeld = false;

  // World & Obstacles
  private distance = 0;
  private speed = 360;
  private baseSpeed = 360;
  private maxSpeed = 680;
  private nextObstacleDistance = 350;
  private obstacles: Obstacle[] = [];
  private collectibles: Collectible[] = [];
  private obstacleIdCounter = 1;
  private collectibleIdCounter = 1;

  // Particles & Visual FX
  private particles = new ParticleManager();
  private shakeDuration = 0;
  private shakeMagnitude = 0;
  private hitstopTimer = 0;

  // Score & Progression
  private bones = 0;
  private score = 0;
  private combo = 0;
  private maxCombo = 0;
  private obstaclesJumped = 0;
  private highScore = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
    this.callbacks = callbacks;

    // Load saved high score
    const saved = localStorage.getItem('puppy_run_highscore');
    if (saved) {
      this.highScore = parseInt(saved, 10) || 0;
    }

    this.resizeCanvas();
    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    this.resizeCanvas();
  };

  private resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
  }

  public setBreed(breed: DogBreed) {
    this.currentBreed = breed;
  }

  public start() {
    this.resetGame();
    this.state = 'PLAYING';
    this.callbacks.onStateChange(this.state);
    soundManager.startBgm();
  }

  public resume() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.callbacks.onStateChange(this.state);
      this.lastTime = performance.now();
    }
  }

  public pause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.callbacks.onStateChange(this.state);
    }
  }

  public restart() {
    this.resetGame();
    this.state = 'PLAYING';
    this.callbacks.onStateChange(this.state);
    soundManager.startBgm();
  }

  private resetGame() {
    this.dogX = 180;
    this.dogY = this.GROUND_Y;
    this.dogVy = 0;
    this.isGrounded = true;
    this.isDucking = false;
    this.jumpsRemaining = 2;
    this.squash = 1;
    this.runTime = 0;
    this.spinAngle = 0;
    this.isDoubleJumping = false;
    this.isBarking = false;
    this.barkTimer = 0;

    this.distance = 0;
    this.speed = this.baseSpeed;
    this.nextObstacleDistance = 450;
    this.obstacles = [];
    this.collectibles = [];
    this.particles.clear();

    this.bones = 0;
    this.score = 0;
    this.combo = 0;
    this.obstaclesJumped = 0;
    this.hitstopTimer = 0;
    this.shakeDuration = 0;

    this.emitScoreUpdate();
  }

  // --- Input Handlers ---
  public handleJumpPress() {
    if (this.state === 'TITLE' || this.state === 'GAME_OVER') {
      this.start();
      return;
    }

    if (this.state !== 'PLAYING') return;

    this.isJumpHeld = true;

    // Coyote time check or already grounded
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.executeJump();
      this.jumpsRemaining = 1;
      this.coyoteTimer = 0;
    } else if (this.jumpsRemaining > 0) {
      // Double jump in mid-air
      this.executeDoubleJump();
      this.jumpsRemaining = 0;
    } else {
      // Buffer jump for when landing soon
      this.jumpBufferTimer = 0.14;
    }
  }

  public handleJumpRelease() {
    this.isJumpHeld = false;
    // Variable jump height: cut vertical rise short if released early
    if (this.dogVy < this.MIN_JUMP_VELOCITY) {
      this.dogVy = this.MIN_JUMP_VELOCITY;
    }
  }

  public handleDuckPress() {
    if (this.state !== 'PLAYING') return;
    this.isDucking = true;
    if (!this.isGrounded) {
      // Fast fall down
      this.dogVy += 400;
    }
  }

  public handleDuckRelease() {
    this.isDucking = false;
  }

  public handleBark() {
    if (this.state !== 'PLAYING') return;
    this.isBarking = true;
    this.barkTimer = 0.35;
    soundManager.playBark();
    this.particles.addBarkWave(this.dogX + 20, this.dogY - 24);

    // Bark can collect nearby low-hanging treats or award small style points!
    this.collectibles.forEach(col => {
      if (!col.collected && Math.abs(col.x - this.dogX) < 130) {
        this.collectItem(col);
      }
    });
  }

  private executeJump() {
    this.dogVy = this.JUMP_VELOCITY;
    this.isGrounded = false;
    this.squash = 0.72; // Stretch tall
    soundManager.playJump();
    this.particles.addJumpCloud(this.dogX, this.GROUND_Y);
  }

  private executeDoubleJump() {
    this.dogVy = this.DOUBLE_JUMP_VELOCITY;
    this.isDoubleJumping = true;
    this.spinAngle = 0;
    this.squash = 0.85;
    soundManager.playDoubleJump();
    this.particles.addBoneSparkles(this.dogX, this.dogY - 20);
  }

  // --- Main Game Loop ---
  public run() {
    this.lastTime = performance.now();
    const loop = (timestamp: number) => {
      const rawDt = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;

      // Clamp delta time to avoid frame skips/tunneling
      const dt = Math.min(rawDt, 0.05);

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    soundManager.stopBgm();
    window.removeEventListener('resize', this.onResize);
  }

  // --- Update Physics & Logic ---
  private update(dt: number) {
    // Hitstop freeze frame handling
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    if (this.state === 'PLAYING') {
      this.updatePlaying(dt);
    } else if (this.state === 'TITLE') {
      // Idle running animation on title screen
      this.runTime += dt * 0.9;
      this.particles.update(dt);
    } else {
      this.particles.update(dt);
    }
  }

  private updatePlaying(dt: number) {
    // 1. Difficulty & Speed ramping
    this.speed = Math.min(this.maxSpeed, this.baseSpeed + (this.distance * 0.18));
    const stepDist = this.speed * dt;
    this.distance += stepDist / 30; // convert to meter display scale
    this.score += Math.round(stepDist * 0.1);

    // 2. Dog animation & run cycle
    this.runTime += dt * (this.speed / 280);

    // Bark timer
    if (this.barkTimer > 0) {
      this.barkTimer -= dt;
      if (this.barkTimer <= 0) {
        this.isBarking = false;
      }
    }

    // 3. Ground physics & Coyote Time
    const wasGrounded = this.isGrounded;
    if (this.isGrounded) {
      this.coyoteTimer = 0.12;
      this.stepSoundTimer += dt;
      if (this.stepSoundTimer > 0.22) {
        this.stepSoundTimer = 0;
        soundManager.playStep();
        this.particles.addDust(this.dogX - 16, this.GROUND_Y, 1);
      }
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // Jump buffer timer
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    // Gravity
    this.dogVy += this.GRAVITY * dt;
    this.dogY += this.dogVy * dt;

    // Double jump flip rotation
    if (this.isDoubleJumping) {
      this.spinAngle += Math.PI * 4.5 * dt;
      if (this.spinAngle >= Math.PI * 2) {
        this.spinAngle = 0;
        this.isDoubleJumping = false;
      }
    }

    // Landing on ground
    if (this.dogY >= this.GROUND_Y) {
      this.dogY = this.GROUND_Y;
      this.dogVy = 0;
      this.isGrounded = true;
      this.isDoubleJumping = false;
      this.spinAngle = 0;
      this.jumpsRemaining = 2;

      // Landing squash and dust
      if (!wasGrounded) {
        this.squash = 1.35; // squash wide on impact
        this.particles.addDust(this.dogX, this.GROUND_Y, 4);

        // Check buffered jump
        if (this.jumpBufferTimer > 0) {
          this.executeJump();
          this.jumpBufferTimer = 0;
        }
      }
    }

    // Smoothly settle squash and stretch back to 1.0
    this.squash += (1.0 - this.squash) * Math.min(1, 14 * dt);

    // 4. Spawn Obstacles & Collectibles
    this.nextObstacleDistance -= stepDist;
    if (this.nextObstacleDistance <= 0) {
      this.spawnObstaclePattern();
    }

    // 5. Move Obstacles & Check Collisions
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= stepDist;

      // Check obstacle jump clear for points
      if (!obs.cleared && obs.x + obs.width / 2 < this.dogX) {
        obs.cleared = true;
        this.obstaclesJumped++;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        this.score += 50 * Math.min(this.combo, 5);
        soundManager.playObstacleJumped();
        this.particles.addBoneSparkles(this.dogX, this.dogY - 50, `+${50 * Math.min(this.combo, 5)}!`);
      }

      // Check collision with dog
      if (this.checkCollision(obs)) {
        this.triggerGameOver();
        return;
      }

      // Remove off-screen obstacles
      if (obs.x < -150) {
        this.obstacles.splice(i, 1);
      }
    }

    // 6. Move & Collect Items
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const item = this.collectibles[i];
      item.x -= stepDist;
      item.bobPhase += dt * 5;

      // Check pickup
      if (!item.collected && this.checkItemPickup(item)) {
        this.collectItem(item);
      }

      // Remove offscreen
      if (item.x < -60) {
        this.collectibles.splice(i, 1);
      }
    }

    // 7. Update particles & camera shake
    this.particles.update(dt);
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
    }

    this.emitScoreUpdate();
  }

  private collectItem(item: Collectible) {
    item.collected = true;
    this.bones++;
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    const points = item.type === 'super_meat' ? 250 : 100;
    this.score += points * Math.min(this.combo, 5);

    soundManager.playBoneCollect(this.combo);
    this.particles.addBoneSparkles(
      item.x,
      item.y,
      `+${points * Math.min(this.combo, 5)} 🦴`
    );
  }

  private triggerGameOver() {
    this.state = 'GAME_OVER';
    soundManager.stopBgm();
    soundManager.playHit();

    // Hitstop freeze for 60ms
    this.hitstopTimer = 0.08;

    // Screen shake
    this.shakeDuration = 0.35;
    this.shakeMagnitude = 14;

    this.particles.addCrashDebris(this.dogX + 10, this.dogY - 20);

    // High score check
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('puppy_run_highscore', String(this.highScore));
      this.particles.addConfetti(this.V_WIDTH / 2, 200);
    }

    this.callbacks.onStateChange(this.state);
    this.emitScoreUpdate();
  }

  private checkCollision(obs: Obstacle): boolean {
    // Dog collision bounding box (inset for forgiving hitboxes)
    const dogBoxW = 44 * this.currentBreed.bodyLength;
    const dogBoxH = this.isDucking ? 24 : 38;
    const dogBoxX = this.dogX - dogBoxW / 2;
    const dogBoxY = this.dogY - dogBoxH;

    // Obstacle collision box
    let obsBoxX = obs.x - obs.width / 2 + 6;
    let obsBoxW = obs.width - 12;
    let obsBoxH = obs.height - 8;
    let obsBoxY = obs.y - obsBoxH;

    // For tall pine/oak trees, only the bottom trunk + low canopy is the hazard
    if (obs.type === 'tree_pine' || obs.type === 'tree_oak') {
      obsBoxW = obs.width * 0.45;
      obsBoxX = obs.x - obsBoxW / 2;
      obsBoxH = obs.height * 0.75;
      obsBoxY = obs.y - obsBoxH;
    }

    // AABB intersection check
    return (
      dogBoxX < obsBoxX + obsBoxW &&
      dogBoxX + dogBoxW > obsBoxX &&
      dogBoxY < obsBoxY + obsBoxH &&
      dogBoxY + dogBoxH > obsBoxY
    );
  }

  private checkItemPickup(item: Collectible): boolean {
    const dx = this.dogX - item.x;
    const dy = (this.dogY - 24) - item.y;
    const distSq = dx * dx + dy * dy;
    const pickupDist = item.radius + 28;
    return distSq < pickupDist * pickupDist;
  }

  private spawnObstaclePattern() {
    // Decide obstacle type: 나무(Trees/Stump/Log) or 돌(Round rock/Sharp rock)
    const obstacleTypes: ObstacleType[] = [
      'tree_pine',
      'tree_oak',
      'tree_stump',
      'fallen_log',
      'rock_round',
      'rock_sharp',
    ];

    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    let width = 50;
    let height = 55;

    switch (type) {
      case 'tree_pine':
        width = 54;
        height = 84;
        break;
      case 'tree_oak':
        width = 62;
        height = 78;
        break;
      case 'tree_stump':
        width = 46;
        height = 36;
        break;
      case 'fallen_log':
        width = 56;
        height = 32;
        break;
      case 'rock_round':
        width = 52;
        height = 42;
        break;
      case 'rock_sharp':
        width = 44;
        height = 48;
        break;
    }

    const obsX = this.V_WIDTH + 60;
    const obsY = this.GROUND_Y;

    this.obstacles.push({
      id: this.obstacleIdCounter++,
      type,
      x: obsX,
      y: obsY,
      width,
      height,
      variant: Math.random(),
      cleared: false,
    });

    // Spawn Bone snacks in fun jump arcs or floating treats
    const pattern = Math.random();
    if (pattern < 0.45) {
      // Arc of bones over the obstacle to reward skillful jumps
      const boneCount = 3;
      for (let b = 0; b < boneCount; b++) {
        const bx = obsX - 40 + b * 40;
        const by = this.GROUND_Y - height - 35 - Math.sin((b / (boneCount - 1)) * Math.PI) * 25;
        this.collectibles.push({
          id: this.collectibleIdCounter++,
          type: 'bone',
          x: bx,
          y: by,
          radius: 12,
          bobPhase: Math.random() * Math.PI,
          collected: false,
        });
      }
    } else if (pattern < 0.7) {
      // Single Super Meat treat floating high
      this.collectibles.push({
        id: this.collectibleIdCounter++,
        type: 'super_meat',
        x: obsX + 60,
        y: this.GROUND_Y - 110,
        radius: 16,
        bobPhase: Math.random() * Math.PI,
        collected: false,
      });
    } else {
      // Low bones for easy snacking
      this.collectibles.push({
        id: this.collectibleIdCounter++,
        type: 'bone',
        x: obsX + 80,
        y: this.GROUND_Y - 24,
        radius: 12,
        bobPhase: Math.random() * Math.PI,
        collected: false,
      });
    }

    // Next obstacle spacing scales with speed to guarantee fair jump time
    const minTimeGap = 1.1; // minimum 1.1s gap between obstacles
    const variableGap = 0.5 + Math.random() * 0.9;
    this.nextObstacleDistance = this.speed * (minTimeGap + variableGap);
  }

  private emitScoreUpdate() {
    this.callbacks.onScoreUpdate({
      distance: Math.floor(this.distance),
      bones: this.bones,
      score: this.score,
      highScore: this.highScore,
      combo: this.combo,
      maxCombo: this.maxCombo,
      speed: Math.round(this.speed),
      obstaclesJumped: this.obstaclesJumped,
    });
  }

  // --- Rendering Pass ---
  private render() {
    const { canvas, ctx } = this;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    // Clear whole physical canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Uniform letterbox scaling to fit 16:9 virtual resolution inside canvas
    const scaleX = canvas.width / this.V_WIDTH;
    const scaleY = canvas.height / this.V_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvas.width - this.V_WIDTH * scale) / 2;
    const offsetY = (canvas.height - this.V_HEIGHT * scale) / 2;

    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Screen Shake
    if (this.shakeDuration > 0) {
      const shakeAmt = this.shakeMagnitude * (this.shakeDuration / 0.35);
      const sx = (Math.random() - 0.5) * shakeAmt;
      const sy = (Math.random() - 0.5) * shakeAmt;
      ctx.translate(sx, sy);
    }

    // 1. Parallax Environment
    drawEnvironment(ctx, {
      distance: this.distance * 30,
      canvasWidth: this.V_WIDTH,
      canvasHeight: this.V_HEIGHT,
      groundY: this.GROUND_Y,
    });

    // 2. Obstacles (나무와 돌)
    for (const obs of this.obstacles) {
      drawObstacle(ctx, obs);
    }

    // 3. Collectibles (Bones / Treats)
    for (const col of this.collectibles) {
      drawCollectible(ctx, col);
    }

    // 4. Particles (Behind dog / dust)
    this.particles.draw(ctx);

    // 5. The Puppy
    const animState: DogAnimState = {
      x: this.dogX,
      y: this.dogY,
      vx: 0,
      vy: this.dogVy,
      isGrounded: this.isGrounded,
      isDucking: this.isDucking,
      isDoubleJumping: this.isDoubleJumping,
      spinAngle: this.spinAngle,
      squash: this.squash,
      runTime: this.runTime,
      isDead: this.state === 'GAME_OVER',
      isBarking: this.isBarking,
      barkTimer: this.barkTimer,
    };
    drawDog(ctx, this.currentBreed, animState);

    ctx.restore();
  }
}
