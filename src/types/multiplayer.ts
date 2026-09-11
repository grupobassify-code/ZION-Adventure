export type MultiplayerMode = 'parkour' | 'onlyup';

export type RoomStatus = 'waiting' | 'ready' | 'starting' | 'playing' | 'finished';

export interface NetworkPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  skin?: string;
  trophies: number;
  ping?: number;
  isBot?: boolean;
}

export interface RoomState {
  code: string;
  mode: MultiplayerMode;
  status: RoomStatus;
  hostId: string;
  players: NetworkPlayer[];
  parkourLevelIndex: number;
  countdown?: number;
  startedAt?: number;
  winnerId?: string | null;
  winnerReason?: string;
}

export interface RemotePlayerState {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  animState: 'idle' | 'run' | 'jump' | 'fall' | 'dash' | 'attack' | 'block';
  isDashing?: boolean;
  isAttacking?: boolean;
  isBlocking?: boolean;
  altitude?: number;
  progressPercent?: number;
  isDead?: boolean;
  isWon?: boolean;
  skin?: string;
  trophies?: number;
  timestamp: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  trophies: number;
  wins: number;
  matchesPlayed: number;
  rank: number;
  tier: 'Bronce' | 'Plata' | 'Oro' | 'Diamante' | 'Maestro Kronos';
  lastActive: number;
  avatarSkin?: string;
}

export interface MatchResultData {
  winnerId: string;
  winnerName: string;
  loserId: string;
  loserName: string;
  mode: MultiplayerMode;
  reason: string;
  trophiesEarned: number;
  winnerTrophiesAwarded?: number;
  loserTrophiesLost?: number;
  durationSeconds: number;
  playerStats: {
    altitude?: number;
    completionTime?: number;
    score?: number;
  };
  opponentStats: {
    altitude?: number;
    completionTime?: number;
    score?: number;
  };
}

export interface MatchEndPayload {
  winnerId: string;
  winnerName: string;
  reason: string;
  trophiesAwarded: number;
  winnerTrophiesAwarded?: number;
  loserTrophiesLost?: number;
  room: RoomState;
}
