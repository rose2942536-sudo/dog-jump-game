export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type DogBreedId = 'shiba' | 'corgi' | 'retriever' | 'poodle';

export interface DogBreed {
  id: DogBreedId;
  name: string;
  koreanName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  earColor: string;
  noseColor: string;
  collarColor: string;
  tailStyle: 'curled' | 'fluffy_stump' | 'long_feathery' | 'pom_pom';
  earStyle: 'pointed' | 'large_bat' | 'floppy' | 'curly_floppy';
  legLength: number; // relative scale
  bodyLength: number;
}

export type ObstacleType = 
  | 'tree_pine' 
  | 'tree_oak' 
  | 'tree_stump' 
  | 'rock_round' 
  | 'rock_sharp'
  | 'fallen_log';

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  variant: number; // for subtle visual variations
  cleared: boolean; // whether player jumped over it
}

export type CollectibleType = 'bone' | 'super_meat';

export interface Collectible {
  id: number;
  type: CollectibleType;
  x: number;
  y: number;
  radius: number;
  bobPhase: number;
  collected: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation?: number;
  vRot?: number;
  type: 'dust' | 'sparkle' | 'bark_wave' | 'debris' | 'confetti' | 'score_popup';
  text?: string;
}

export interface GameScoreState {
  distance: number;
  bones: number;
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  speed: number;
  obstaclesJumped: number;
}
