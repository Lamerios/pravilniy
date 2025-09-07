import { Request } from 'express';

/**
 * Типы ставок
 */
export type BetType = 'MULTIPLIER' | 'BONUS' | 'FIXED';

/**
 * DTO для создания записи о баллах
 */
export interface CreateScoreDto {
  gameId: number;
  teamId: number;
  roundId: number;
  points: number;
  bet?: number | undefined;
  betType?: BetType | undefined;
  minBet?: number | undefined;
  maxBet?: number | undefined;
  notes?: string | undefined;
  enteredBy?: number;
}

/**
 * DTO для обновления записи о баллах
 */
export interface UpdateScoreDto {
  points?: number | undefined;
  bet?: number | undefined;
  betType?: BetType | undefined;
  minBet?: number | undefined;
  maxBet?: number | undefined;
  notes?: string | undefined;
}

/**
 * DTO для запроса истории баллов
 */
export interface ScoreQueryDto {
  gameId?: number | undefined;
  teamId?: number | undefined;
  roundId?: number | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'ASC' | 'DESC' | undefined;
}

/**
 * Результат запроса списка баллов
 */
export interface ScoreListResult {
  scores: ScoreResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Ответ с данными о баллах
 */
export interface ScoreResponse {
  id: number;
  gameId: number;
  teamId: number;
  roundId: number;
  points: number;
  bet?: number | undefined;
  betType?: BetType | undefined;
  minBet?: number | undefined;
  maxBet?: number | undefined;
  totalPoints: number;
  notes?: string | undefined;
  createdAt: string;
  updatedAt: string;
  team?: {
    id: number;
    name: string;
    tableNumber?: number | undefined;
  };
  round?: {
    id: number;
    name: string;
    roundNumber: number;
  };
  game?: {
    id: number;
    name: string;
  };
}

/**
 * Статистика баллов команды в игре
 */
export interface TeamScoreStats {
  teamId: number;
  teamName: string;
  tableNumber?: number | undefined;
  totalPoints: number;
  roundsPlayed: number;
  averagePoints: number;
  maxPoints: number;
  minPoints: number;
  currentPosition: number;
  scores: ScoreResponse[];
}

/**
 * Статистика баллов игры
 */
export interface GameScoreStats {
  gameId: number;
  gameName: string;
  totalRounds: number;
  totalTeams: number;
  averagePointsPerRound: number;
  teamStats: TeamScoreStats[];
  leaderboard: Array<{
    position: number;
    teamId: number;
    teamName: string;
    tableNumber?: number | undefined;
    totalPoints: number;
  }>;
}

/**
 * DTO для массового ввода баллов
 */
export interface BulkScoreDto {
  gameId: number;
  roundId: number;
  enteredBy: number;
  scores: Array<{
    teamId: number;
    points: number;
    bet?: number;
    betType?: BetType;
    minBet?: number;
    maxBet?: number;
    notes?: string;
  }>;
}

/**
 * Результат массового ввода баллов
 */
export interface BulkScoreResult {
  success: boolean;
  created: number;
  updated: number;
  errors: Array<{
    teamId: number;
    error: string;
  }>;
  scores: ScoreResponse[];
}

/**
 * DTO для исправления баллов
 */
export interface ScoreCorrectionDto {
  scoreId: number;
  newPoints: number;
  reason: string;
  correctedBy: number;
}

/**
 * История исправлений баллов
 */
export interface ScoreCorrectionHistory {
  id: number;
  scoreId: number;
  oldPoints: number;
  newPoints: number;
  reason: string;
  correctedBy: number;
  correctedAt: string;
  correctedByUser?: {
    id: number;
    username: string;
  } | undefined;
}

/**
 * Запрос с аутентификацией для баллов
 */
export interface AuthenticatedScoreRequest extends Request {
  user?: {
    id: number;
    username: string;
    organizationId: number;
    role: string;
  };
}
