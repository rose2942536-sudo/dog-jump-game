import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Home } from 'lucide-react';
import { soundManager } from '../game/sound';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
}) => {
  const [muted, setMuted] = React.useState(soundManager.isMuted());

  const handleMuteToggle = () => {
    const next = soundManager.toggleMute();
    setMuted(next);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-30 select-none animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
        <span className="text-4xl mb-2">⏸️</span>
        <h2 className="text-2xl font-black text-white font-game">게임 일시정지</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          잠시 숨을 고르고 준비되면 계속 달려보세요!
        </p>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>계속하기 (Esc)</span>
          </button>

          <button
            onClick={handleMuteToggle}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer text-sm"
          >
            {muted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>소리 켜기</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>소리 끄기</span>
              </>
            )}
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>처음부터 다시 달리기</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 text-slate-400 hover:text-white transition text-xs mt-1 cursor-pointer"
          >
            타이틀 화면으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};
