/**
 * Типы для работы с позициями команд
 */

export interface TeamPosition {
  teamId: number;
  teamName: string;
  tableNumber?: number;
  totalPoints: number;
  position: number;
  previousPosition?: number;
  positionChange: 'up' | 'down' | 'same' | 'new';
  lastUpdated: Date;
  roundsPlayed?: number;
  averagePoints?: number;
  lastActivity?: string;
}

export interface PositionChange {
  teamId: number;
  teamName: string;
  oldPosition?: number | undefined;
  newPosition: number;
  change: 'up' | 'down' | 'same' | 'new';
}

export interface GameLeaderboard {
  gameId: number;
  leaderboard: TeamPosition[];
  lastUpdated: string;
  gameInfo: {
    gameName: string;
    status: string;
    totalRounds: number;
    totalTeams?: number;
  };
}

export interface LeaderboardResponse {
  success: boolean;
  message: string;
  data: GameLeaderboard;
}

export interface PositionRecalculationResponse {
  success: boolean;
  message: string;
  data: {
    gameId: number;
    positions: TeamPosition[];
    changes: PositionChange[];
  };
}
