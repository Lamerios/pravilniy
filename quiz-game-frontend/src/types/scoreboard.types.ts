/**
 * Типы для публичного табло
 */

export interface PublicScoreboardTeam {
  position: number;
  teamId: number;
  teamName: string;
  tableNumber?: number | undefined;
  totalPoints: number;
  positionChange: 'up' | 'down' | 'same' | 'new';
  lastUpdated: Date;
}

export interface PublicScoreboardData {
  gameId: number;
  gameName: string;
  gameStatus: string;
  totalRounds: number;
  totalTeams: number;
  leaderboard: PublicScoreboardTeam[];
  lastUpdated: string;
}

export interface PublicScoreboardResponse {
  success: boolean;
  message: string;
  data: PublicScoreboardData;
}
