/**
 * Procedural Web Audio API sound generator for Puppy Run
 * 100% self-contained, lightweight, zero external audio asset dependencies.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private bgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
    const savedMute = localStorage.getItem('puppy_run_muted');
    if (savedMute !== null) {
      this.muted = savedMute === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('puppy_run_muted', String(this.muted));
    if (this.muted && this.bgmTimer) {
      this.stopBgm();
    }
    return this.muted;
  }

  public playJump() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.16);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playDoubleJump() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Layer 1: high melodic flip
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(1040, t + 0.22);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.24);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  public playBark() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Playful dog bark "멍!"
    const playYip = (delay: number, baseFreq: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + delay;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * 0.9, start);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.35, start + 0.04);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, start + 0.12);

      gain.gain.setValueAtTime(0.28, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.13);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.13);
    };

    playYip(0, 380);
    playYip(0.08, 440);
  }

  public playBoneCollect(combo: number = 1) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const baseIndex = Math.min(combo - 1, notes.length - 2);

    for (let i = 0; i < 2; i++) {
      const freq = notes[baseIndex + i] || 1046.50;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.18);
    }
  }

  public playObstacleJumped() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Subtle gentle whoosh when clearing an obstacle
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.08);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playHit() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Low thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.28);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);

    // Whimper chirp (cute, not sad)
    setTimeout(() => {
      if (!this.ctx || this.muted) return;
      const wOsc = this.ctx.createOscillator();
      const wGain = this.ctx.createGain();
      const wt = this.ctx.currentTime;

      wOsc.type = 'sine';
      wOsc.frequency.setValueAtTime(520, wt);
      wOsc.frequency.linearRampToValueAtTime(360, wt + 0.22);

      wGain.gain.setValueAtTime(0.18, wt);
      wGain.gain.exponentialRampToValueAtTime(0.01, wt + 0.25);

      wOsc.connect(wGain);
      wGain.connect(this.ctx.destination);

      wOsc.start(wt);
      wOsc.stop(wt + 0.25);
    }, 120);
  }

  public playStep() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Very quiet footstep tap on grass/dirt
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110 + Math.random() * 20, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.045);
  }

  // Cheerful, rhythmic marimba-style background melody
  public startBgm() {
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.initCtx();

    // Catchy cheerful melody pattern in C Major / Pentatonic
    // C4=261.6, D4=293.7, E4=329.6, G4=392.0, A4=440.0, C5=523.3, D5=587.3, E5=659.3
    const melody = [
      523.3, 0, 392.0, 523.3,  659.3, 0, 587.3, 0,
      523.3, 392.0, 440.0, 523.3, 392.0, 0, 0, 0,
      440.0, 0, 523.3, 0,      587.3, 0, 659.3, 0,
      587.3, 523.3, 440.0, 392.0, 523.3, 0, 0, 0
    ];

    const bass = [
      130.8, 0, 196.0, 0, 164.8, 0, 196.0, 0,
      130.8, 0, 196.0, 0, 164.8, 0, 196.0, 0,
      174.6, 0, 220.0, 0, 196.0, 0, 246.9, 0,
      130.8, 0, 196.0, 0, 130.8, 0, 0, 0
    ];

    const stepDuration = 140; // ms per 16th note

    this.bgmTimer = window.setInterval(() => {
      if (this.muted || !this.bgmPlaying) return;
      this.initCtx();
      if (!this.ctx) return;

      const idx = this.bgmStep % melody.length;
      const mFreq = melody[idx];
      const bFreq = bass[idx];
      const t = this.ctx.currentTime;

      if (mFreq > 0) {
        const mOsc = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();
        mOsc.type = 'triangle';
        mOsc.frequency.setValueAtTime(mFreq, t);

        mGain.gain.setValueAtTime(0.045, t);
        mGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        mOsc.connect(mGain);
        mGain.connect(this.ctx.destination);
        mOsc.start(t);
        mOsc.stop(t + 0.18);
      }

      if (bFreq > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(bFreq, t);

        bGain.gain.setValueAtTime(0.06, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        bOsc.connect(bGain);
        bGain.connect(this.ctx.destination);
        bOsc.start(t);
        bOsc.stop(t + 0.15);
      }

      this.bgmStep++;
    }, stepDuration);
  }

  public stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public isBgm(): boolean {
    return this.bgmPlaying;
  }
}

export const soundManager = new SoundManager();
