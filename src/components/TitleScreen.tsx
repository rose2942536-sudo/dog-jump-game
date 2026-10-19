import React from 'react';
import { DogBreed } from '../game/types';
import { DOG_BREEDS } from '../game/breeds';
import { Trophy, Play, Check } from 'lucide-react';

interface TitleScreenProps {
  currentBreed: DogBreed;
  onSelectBreed: (breed: DogBreed) => void;
  onStart: () => void;
  highScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  currentBreed,
  onSelectBreed,
  onStart,
  highScore,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-between p-6 md:p-8 z-20 text-white select-none">
      {/* Top Bar / Best Record */}
      <div className="w-full max-w-3xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-amber-500/30">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>최고 기록: <strong className="font-game tabular-nums text-white ml-1">{highScore.toLocaleString()}</strong> 점</span>
        </div>
        <div className="text-xs text-slate-400">
          2D 점프 러너 게임
        </div>
      </div>

      {/* Main Title Lockup */}
      <div className="flex flex-col items-center text-center my-auto max-w-2xl">
        {/* Bespoke Logo with SVG Paws & Bone */}
        <div className="relative mb-3 flex items-center justify-center">
          <svg className="w-16 h-16 md:w-20 md:h-20 text-amber-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C10.5 2 9 3.2 9 5c0 1.2.7 2.2 1.6 2.7L6.8 11.5C6 11.2 5 11 4 11c-2.2 0-4 1.8-4 4s1.8 4 4 4c1.2 0 2.2-.6 2.8-1.5l4.3 2.1C11 20 11 21 11 22c0 1.1.9 2 2 2s2-.9 2-2c0-.9 0-1.8-.1-2.4l4.3-2.1c.6.9 1.6 1.5 2.8 1.5 2.2 0 4-1.8 4-4s-1.8-4-4-4c-1 0-2 .2-2.8.5l-3.8-3.8c.9-.5 1.6-1.5 1.6-2.7 0-1.8-1.5-3-3-3z" />
          </svg>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg font-game">
          멍멍이의 <span className="text-amber-400">신나는 달리기</span>
        </h1>
        <p className="mt-2 text-slate-300 text-sm md:text-base font-medium max-w-md">
          나무와 바위 장애물을 폴짝폴짝 뛰어넘고, 달콤한 황금 뼈다귀를 모두 모아보세요!
        </p>

        {/* Dog Breed Selection Grid */}
        <div className="mt-6 w-full">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            함께 달릴 강아지 친구를 골라보세요
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto">
            {Object.values(DOG_BREEDS).map((breed) => {
              const isSelected = breed.id === currentBreed.id;
              return (
                <button
                  key={breed.id}
                  onClick={() => onSelectBreed(breed)}
                  className={`relative p-3 rounded-2xl flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg scale-105'
                      : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-800/60 hover:border-slate-500'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Puppy Avatar Disc */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner border"
                    style={{
                      backgroundColor: breed.primaryColor,
                      borderColor: breed.secondaryColor,
                    }}
                  >
                    <span>🐶</span>
                  </div>

                  <span className="font-bold text-xs md:text-sm text-white mt-0.5">
                    {breed.koreanName.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-300 font-normal">
                    {breed.name}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-amber-300 font-medium">
            "{currentBreed.tagline}"
          </div>
        </div>

        {/* Start Game Button */}
        <div className="mt-7 flex flex-col items-center gap-3 w-full">
          <button
            onClick={onStart}
            className="w-full max-w-xs py-4 px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-lg md:text-xl rounded-2xl shadow-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>게임 시작 (Space)</span>
          </button>

          {/* Control Hint Line */}
          <p className="text-xs text-slate-400 font-medium">
            스페이스바 또는 화면 터치로 점프 (공중에서 한 번 더 누르면 2단 점프!)
          </p>
        </div>
      </div>

      {/* Footer Key Guide */}
      <div className="w-full max-w-3xl flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-4">
        <span>🎮 <strong className="text-slate-200">Space / ↑ / 클릭</strong> 점프</span>
        <span>·</span>
        <span><strong className="text-slate-200">공중에서 Space</strong> 2단 회전점프</span>
        <span>·</span>
        <span><strong className="text-slate-200">↓ / S</strong> 숙이기 (슬라이드)</span>
        <span>·</span>
        <span><strong className="text-slate-200">B</strong> 멍멍! 짖기</span>
        <span>·</span>
        <span><strong className="text-slate-200">Esc</strong> 일시정지</span>
      </div>
    </div>
  );
};
