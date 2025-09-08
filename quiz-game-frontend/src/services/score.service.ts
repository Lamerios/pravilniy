import { GameLeaderboard, LeaderboardResponse, PositionRecalculationResponse, TeamPosition } from '../types/position.types';

import { apiClient } from './api.client';

// Типы для баллов (синхронизированы с backend)
export type BetType = 'MULTIPLIER' | 'BONUS' | 'FIXED';

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
}

export interface UpdateScoreDto {
  points?: number;
  bet?: number;
  betType?: BetType;
  minBet?: number;
  maxBet?: number;
  notes?: string;
}

export interface ScoreResponse {
  id: number;
  gameId: number;
  teamId: number;
  roundId: number;
  points: number;
  bet?: number;
  betType?: BetType;
  minBet?: number;
  maxBet?: number;
  totalPoints: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  team?: {
    id: number;
    name: string;
    tableNumber?: number;
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

export interface BulkScoreDto {
  gameId: number;
  roundId: number;
  scores: Array<{
    teamId: number;
    points: number;
    bet?: number | undefined;
    betType?: BetType | undefined;
    minBet?: number | undefined;
    maxBet?: number | undefined;
    notes?: string | undefined;
  }>;
}

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
    tableNumber?: number;
    totalPoints: number;
  }>;
}

export interface TeamScoreStats {
  teamId: number;
  teamName: string;
  tableNumber?: number;
  totalPoints: number;
  roundsPlayed: number;
  averagePoints: number;
  maxPoints: number;
  minPoints: number;
  currentPosition: number;
  scores: ScoreResponse[];
}


export interface ScoreCorrectionDto {
  newPoints: number;
  reason: string;
}

export interface ScoreListResult {
  scores: ScoreResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Сервис для работы с баллами
 */
class ScoreService {
  /**
   * Создать запись о баллах
   */
  async createScore(scoreData: CreateScoreDto): Promise<ScoreResponse> {
    const response = await apiClient.post('/scores', scoreData);
    return response.data.data;
  }

  /**
   * Обновить запись о баллах
   */
  async updateScore(scoreId: number, scoreData: UpdateScoreDto): Promise<ScoreResponse> {
    const response = await apiClient.put(`/scores/${scoreId}`, scoreData);
    return response.data.data;
  }

  /**
   * Получить запись о баллах по ID
   */
  async getScoreById(scoreId: number): Promise<ScoreResponse> {
    const response = await apiClient.get(`/scores/${scoreId}`);
    return response.data.data;
  }

  /**
   * Получить список баллов с фильтрацией
   */
  async getScores(params?: {
    gameId?: number | undefined;
    teamId?: number | undefined;
    roundId?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: 'ASC' | 'DESC' | undefined;
  }): Promise<ScoreListResult> {
    const response = await apiClient.get('/scores', params ? { params } : {});
    return response.data.data;
  }

  /**
   * Получить историю баллов игры
   */
  async getGameScoresHistory(gameId: number, params?: {
    teamId?: number | undefined;
    roundId?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: 'ASC' | 'DESC' | undefined;
  }): Promise<ScoreListResult> {
    const response = await apiClient.get(`/games/${gameId}/scores`, params ? { params } : {});
    return response.data.data;
  }

  /**
   * Получить статистику баллов игры
   */
  async getGameScoreStats(gameId: number): Promise<GameScoreStats> {
    const response = await apiClient.get(`/games/${gameId}/scores/stats`);
    return response.data.data;
  }


  /**
   * Получить баллы конкретного раунда
   */
  async getRoundScores(gameId: number, roundId: number): Promise<ScoreResponse[]> {
    const response = await apiClient.get(`/games/${gameId}/rounds/${roundId}/scores`);
    return response.data.data;
  }

  /**
   * Получить баллы команды в игре
   */
  async getTeamScores(gameId: number, teamId: number): Promise<ScoreResponse[]> {
    const response = await apiClient.get(`/scores/teams/${gameId}/${teamId}`);
    return response.data.data;
  }

  /**
   * Получить статистику команды
   */
  async getTeamScoreStats(gameId: number, teamId: number): Promise<TeamScoreStats> {
    const response = await apiClient.get(`/scores/teams/${gameId}/${teamId}/stats`);
    return response.data.data;
  }

  /**
   * Массовый ввод баллов
   */
  async bulkCreateScores(bulkData: BulkScoreDto): Promise<BulkScoreResult> {
    const response = await apiClient.post('/scores/bulk', bulkData);
    return response.data.data;
  }

  /**
   * Исправить баллы
   */
  async correctScore(scoreId: number, correctionData: ScoreCorrectionDto): Promise<ScoreResponse> {
    const response = await apiClient.post(`/scores/${scoreId}/correct`, correctionData);
    return response.data.data;
  }

  /**
   * Получить историю исправлений баллов
   */
  async getScoreCorrectionHistory(scoreId: number): Promise<any[]> {
    const response = await apiClient.get(`/scores/${scoreId}/corrections`);
    return response.data.data;
  }

  /**
   * Получить все исправления по игре
   */
  async getGameCorrections(gameId: number, params: { page: number; limit: number }): Promise<{
    corrections: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    const response = await apiClient.get(`/games/${gameId}/corrections`, { params });
    return response.data.data;
  }

  /**
   * Удалить запись о баллах
   */
  async deleteScore(scoreId: number): Promise<void> {
    await apiClient.delete(`/scores/${scoreId}`);
  }

  /**
   * Получить leaderboard игры с позициями команд
   */
  async getGameLeaderboard(gameId: number): Promise<GameLeaderboard> {
    const response = await apiClient.get<LeaderboardResponse>(`/games/${gameId}/leaderboard`);
    return response.data.data as unknown as GameLeaderboard;
  }

  /**
   * Пересчитать позиции команд в игре
   */
  async recalculateGamePositions(gameId: number): Promise<{
    positions: TeamPosition[];
    changes: Array<{
      teamId: number;
      teamName: string;
      oldPosition?: number | undefined;
      newPosition: number;
      change: 'up' | 'down' | 'same' | 'new';
    }>;
  }> {
    const response = await apiClient.post<PositionRecalculationResponse>(`/games/${gameId}/recalculate-positions`);
    return response.data.data as unknown as {
      positions: TeamPosition[];
      changes: Array<{
        teamId: number;
        teamName: string;
        oldPosition?: number | undefined;
        newPosition: number;
        change: 'up' | 'down' | 'same' | 'new';
      }>;
    };
  }

  /**
   * Рассчитать итоговые баллы с учетом ставки (клиентская логика для предпросмотра)
   */
  calculateTotalPoints(points: number, bet?: number, betType: BetType = 'MULTIPLIER'): number {
    if (!bet) {
      return points;
    }

    let totalPoints: number;

    switch (betType) {
      case 'MULTIPLIER':
        totalPoints = points * bet;
        break;
      case 'BONUS':
        totalPoints = points + bet;
        break;
      case 'FIXED':
        totalPoints = bet;
        break;
      default:
        totalPoints = points;
    }

    return Math.round(totalPoints * 100) / 100;
  }

  /**
   * Валидация ставки (клиентская логика)
   */
  validateBet(bet?: number, betType?: BetType, minBet?: number, maxBet?: number): string | null {
    if (!bet) {
      return null; // Ставка не обязательна
    }

    if (bet <= 0) {
      return 'Ставка должна быть положительным числом';
    }

    if (minBet && bet < minBet) {
      return `Ставка не может быть меньше ${minBet}`;
    }

    if (maxBet && bet > maxBet) {
      return `Ставка не может быть больше ${maxBet}`;
    }

    if (betType === 'MULTIPLIER') {
      if (bet > 10) {
        return 'Множитель не может быть больше 10';
      }
      if (bet < 0.1) {
        return 'Множитель не может быть меньше 0.1';
      }
    } else if (betType === 'BONUS') {
      if (bet > 100) {
        return 'Бонус не может быть больше 100 баллов';
      }
    } else if (betType === 'FIXED') {
      if (bet > 200) {
        return 'Фиксированные баллы не могут быть больше 200';
      }
    }

    return null;
  }

}

export const scoreService = new ScoreService();
