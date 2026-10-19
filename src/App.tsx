/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameState, GameScoreState, DogBreed } from './game/types';
import { DOG_BREEDS } from './game/breeds';
import { GameHUD } from './components/GameHUD';
import { TitleScreen } from './components/TitleScreen';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [selectedBreed, setSelectedBreed] = useState<DogBreed>(DOG_BREEDS.shiba);
  const [scores, setScores] = useState<GameScoreState>({
    distance: 0,
    bones: 0,
    score: 0,
    highScore: 0,
    combo: 0,
    maxCombo: 0,
    speed: 360,
    obstaclesJumped: 0,
  });

  // Initialize game engine once
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onStateChange: (state) => {
        setGameState(state);
      },
      onScoreUpdate: (newScores) => {
        setScores(newScores);
      },
    });

    engine.setBreed(selectedBreed);
    engine.run();
    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, []);

  // Sync breed change to engine
  const handleSelectBreed = useCallback((breed: DogBreed) => {
    setSelectedBreed(breed);
    if (engineRef.current) {
      engineRef.current.setBreed(breed);
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      // Prevent default page scroll on Space / Arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        engineRef.current.handleJumpPress();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        engineRef.current.handleDuckPress();
      } else if (e.code === 'KeyB') {
        engineRef.current.handleBark();
      } else if (e.code === 'Escape') {
        if (engineRef.current.state === 'PLAYING') {
          engineRef.current.pause();
        } else if (engineRef.current.state === 'PAUSED') {
          engineRef.current.resume();
        }
      } else if (e.code === 'Enter') {
        if (engineRef.current.state === 'TITLE' || engineRef.current.state === 'GAME_OVER') {
          engineRef.current.start();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        engineRef.current.handleJumpRelease();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        engineRef.current.handleDuckRelease();
      }
    };

    // Clear held keys on window blur
    const handleBlur = () => {
      if (engineRef.current) {
        engineRef.current.handleJumpRelease();
        engineRef.current.handleDuckRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Touch and click on canvas for jump
  const handlePointerDown = () => {
    if (!engineRef.current) return;
    if (gameState === 'PLAYING') {
      engineRef.current.handleJumpPress();
    }
  };

  const handlePointerUp = () => {
    if (!engineRef.current) return;
    if (gameState === 'PLAYING') {
      engineRef.current.handleJumpRelease();
    }
  };

  const handleStart = () => {
    if (engineRef.current) {
      engineRef.current.start();
    }
  };

  const handlePauseToggle = () => {
    if (!engineRef.current) return;
    if (gameState === 'PLAYING') {
      engineRef.current.pause();
    } else if (gameState === 'PAUSED') {
      engineRef.current.resume();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restart();
    }
  };

  const handleHome = () => {
    if (engineRef.current) {
      engineRef.current.state = 'TITLE';
      setGameState('TITLE');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center select-none">
      {/* 60FPS High Performance Isolated Game Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="w-full h-full block cursor-pointer object-contain"
      />

      {/* In-Game HUD overlay (Only during active PLAYING or PAUSED) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <GameHUD
          scores={scores}
          isPaused={gameState === 'PAUSED'}
          onPauseToggle={handlePauseToggle}
          onJump={() => engineRef.current?.handleJumpPress()}
          onJumpRelease={() => engineRef.current?.handleJumpRelease()}
          onDuck={() => engineRef.current?.handleDuckPress()}
          onDuckRelease={() => engineRef.current?.handleDuckRelease()}
          onBark={() => engineRef.current?.handleBark()}
          breedName={selectedBreed.koreanName.split(' ')[0]}
        />
      )}

      {/* Title Screen Modal */}
      {gameState === 'TITLE' && (
        <TitleScreen
          currentBreed={selectedBreed}
          onSelectBreed={handleSelectBreed}
          onStart={handleStart}
          highScore={scores.highScore}
        />
      )}

      {/* Game Over Screen Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          scores={scores}
          breed={selectedBreed}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}

      {/* Pause Screen Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={() => engineRef.current?.resume()}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}
    </div>
  );
}
