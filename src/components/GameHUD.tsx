import React from 'react';
import { GameScoreState } from '../game/types';
import { Volume2, VolumeX, Pause, Play, Sparkles } from 'lucide-react';
import { soundManager } from '../game/sound';

interface GameHUDProps {
  scores: GameScoreState;
  isPaused: boolean;
  onPauseToggle: () => void;
  onJump: () => void;
  onJumpRelease: () => void;
  onDuck: () => void;
  onDuckRelease: () => void;
  onBark: () => void;
  breedName: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  scores,
  isPaused,
  onPauseToggle,
  onJump,
  onJumpRelease,
  onDuck,
  onDuckRelease,
  onBark,
  breedName,
}) => {
  const [muted, setMuted] = React.useState(soundManager.isMuted());

  const handleMuteClick = () => {
    const nextMuted = soundManager.toggleMute();
    setMuted(nextMuted);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 select-none z-10">
      {/* Top Bar Perimeter Clusters */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Distance & Breed */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-3">
            <span className="text-xl">🏃</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">거리</span>
              <span className="text-xl md:text-2xl font-bold font-game tabular-nums text-white">
                {scores.distance.toLocaleString()} <span className="text-xs font-normal text-slate-400">m</span>
              </span>
            </div>
          </div>

          {/* Bones Counter */}
          <div className="bg-amber-950/70 backdrop-blur-md border border-amber-600/50 rounded-2xl px-3.5 py-2.5 shadow-lg flex items-center gap-2.5">
            <span className="text-xl">🦴</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-amber-300 font-medium">뼈다귀</span>
              <span className="text-xl md:text-2xl font-bold font-game tabular-nums text-amber-200">
                {scores.bones}
              </span>
            </div>
          </div>

          {/* Combo Multiplier (shows when active) */}
          {scores.combo > 1 && (
            <div className="animate-bounce bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-3 py-1.5 rounded-xl font-bold font-game text-xs md:text-sm shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{scores.combo}x 콤보!</span>
            </div>
          )}
        </div>

        {/* Right: Score & Utility Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Total Score */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-2.5 shadow-lg flex flex-col items-end mr-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">점수</span>
            <span className="text-xl md:text-2xl font-extrabold font-game tabular-nums text-emerald-400">
              {scores.score.toLocaleString()}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleMuteClick}
            className="w-11 h-11 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow-md cursor-pointer"
            title={muted ? '소리 켜기' : '소리 끄기'}
            aria-label="Sound Toggle"
          >
            {muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Pause Toggle */}
          <button
            onClick={onPauseToggle}
            className="w-11 h-11 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow-md cursor-pointer"
            title={isPaused ? '계속하기' : '일시정지 (Esc)'}
            aria-label="Pause Game"
          >
            {isPaused ? <Play className="w-5 h-5 text-amber-400" /> : <Pause className="w-5 h-5 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Bottom Area: Dog Tag & Touch / Mobile Controls */}
      <div className="flex items-end justify-between w-full">
        {/* Left: Dog Name Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/70 backdrop-blur-sm border border-slate-700/50 rounded-xl px-3 py-1.5 text-xs text-slate-300">
          <span>🐕 {breedName} 달리는 중</span>
        </div>

        {/* Right: Mobile Touch Action Buttons (Always available on touch screens) */}
        <div className="flex items-center gap-3 pointer-events-auto ml-auto">
          {/* Bark button */}
          <button
            onClick={onBark}
            className="w-14 h-14 rounded-2xl bg-sky-600/90 hover:bg-sky-500 active:scale-90 border-2 border-sky-400 text-white font-bold flex flex-col items-center justify-center shadow-lg transition select-none cursor-pointer"
          >
            <span className="text-base">📢</span>
            <span className="text-[10px] font-bold">멍멍!</span>
          </button>

          {/* Duck / Slide button */}
          <button
            onPointerDown={onDuck}
            onPointerUp={onDuckRelease}
            onPointerLeave={onDuckRelease}
            className="w-14 h-14 rounded-2xl bg-slate-700/90 active:bg-slate-600 active:scale-90 border-2 border-slate-500 text-white font-bold flex flex-col items-center justify-center shadow-lg transition select-none cursor-pointer"
          >
            <span className="text-base">⬇️</span>
            <span className="text-[10px] font-bold">숙이기</span>
          </button>

          {/* Jump button (Big Primary) */}
          <button
            onPointerDown={onJump}
            onPointerUp={onJumpRelease}
            onPointerLeave={onJumpRelease}
            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 border-3 border-amber-200 text-slate-950 font-extrabold flex flex-col items-center justify-center shadow-xl transition select-none cursor-pointer"
          >
            <span className="text-2xl">⬆️</span>
            <span className="text-xs font-black tracking-wider uppercase">점프</span>
          </button>
        </div>
      </div>
    </div>
  );
};
