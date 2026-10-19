import React from 'react';
import { GameScoreState, DogBreed } from '../game/types';
import { RotateCcw, Trophy, Award, Home } from 'lucide-react';

interface GameOverModalProps {
  scores: GameScoreState;
  breed: DogBreed;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  scores,
  breed,
  onRestart,
  onHome,
}) => {
  const isNewRecord = scores.score >= scores.highScore && scores.score > 0;

  return (
    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-30 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
        {/* Cute Dog Resting Avatar */}
        <div className="relative mb-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-md border-2"
            style={{
              backgroundColor: breed.primaryColor,
              borderColor: breed.secondaryColor,
            }}
          >
            <span>🐶</span>
          </div>
          <span className="absolute -bottom-1 -right-1 text-2xl">🩹</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-black text-white font-game">
          {isNewRecord ? '🎉 새로운 신기록 달성!' : '아쉽지만 넘어져 버렸어요!'}
        </h2>
        <p className="text-slate-400 text-xs md:text-sm mt-1">
          {breed.koreanName.split(' ')[0]}가 다시 일어날 준비를 하고 있어요!
        </p>

        {/* Score Summary Box */}
        <div className="w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 my-5 grid grid-cols-2 gap-3 text-left">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">달린 거리</span>
            <span className="text-xl md:text-2xl font-bold font-game tabular-nums text-white">
              {scores.distance.toLocaleString()} <span className="text-xs text-slate-400 font-normal">m</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">모은 뼈다귀</span>
            <span className="text-xl md:text-2xl font-bold font-game tabular-nums text-amber-300">
              {scores.bones} <span className="text-xs text-slate-400 font-normal">개</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">최대 콤보</span>
            <span className="text-xl md:text-2xl font-bold font-game tabular-nums text-orange-400">
              {scores.maxCombo}x
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">뛰어넘은 장애물</span>
            <span className="text-xl md:text-2xl font-bold font-game tabular-nums text-emerald-400">
              {scores.obstaclesJumped}개
            </span>
          </div>

          {/* Final Score Highlight */}
          <div className="col-span-2 pt-3 border-t border-slate-700/80 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">최종 점수</span>
            <span className="text-2xl md:text-3xl font-black font-game tabular-nums text-amber-400">
              {scores.score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* High Score Badge */}
        <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium mb-5 bg-amber-950/40 border border-amber-500/20 px-3 py-1.5 rounded-full">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>최고 기록: <strong className="font-game tabular-nums text-white ml-0.5">{scores.highScore.toLocaleString()}</strong> 점</span>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>다시 달리기 (Space)</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer text-sm"
          >
            <Home className="w-4 h-4" />
            <span>강아지 바꾸기 / 홈</span>
          </button>
        </div>
      </div>
    </div>
  );
};
