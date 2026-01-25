export interface GameSettings {
  nLevel: number;
  trialCount: number;
  intervalMs: number;
}

export interface Trial {
  position: number; // 0-8 for 3x3 grid
  letter: string;
}

export interface GameState {
  trials: Trial[];
  currentTrialIndex: number;
  isRunning: boolean;
  positionMatches: boolean[];
  audioMatches: boolean[];
  userPositionResponses: boolean[];
  userAudioResponses: boolean[];
}

export interface GameResults {
  positionHits: number;
  positionMisses: number;
  positionFalseAlarms: number;
  audioHits: number;
  audioMisses: number;
  audioFalseAlarms: number;
  positionAccuracy: number;
  audioAccuracy: number;
}

export type GamePhase = 'settings' | 'playing' | 'results';
