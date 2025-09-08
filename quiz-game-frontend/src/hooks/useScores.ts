import { useCallback, useEffect, useState } from 'react';

import {
    BulkScoreDto,
    BulkScoreResult,
    CreateScoreDto,
    GameScoreStats,
    ScoreListResult,
    ScoreResponse,
    scoreService,
    TeamScoreStats,
    UpdateScoreDto
} from '../services/score.service';
import { GameLeaderboard } from '../types/position.types';

interface UseScoresOptions {
  gameId?: number;
  teamId?: number;
  roundId?: number;
  autoLoad?: boolean;
}

interface UseScoresReturn {
  // Данные
  scores: ScoreResponse[];
  gameStats: GameScoreStats | null;
  leaderboard: GameLeaderboard | null;
  teamStats: TeamScoreStats | null;

  // Состояние загрузки
  loading: boolean;
  creating: boolean;
  updating: boolean;
  bulkCreating: boolean;

  // Ошибки
  error: string | null;

  // Пагинация
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;

  // Методы
  loadScores: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => Promise<void>;
  loadGameStats: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  loadTeamStats: (teamId: number) => Promise<void>;
  loadRoundScores: (roundId: number) => Promise<void>;

  createScore: (scoreData: CreateScoreDto) => Promise<ScoreResponse | null>;
  updateScore: (scoreId: number, scoreData: UpdateScoreDto) => Promise<ScoreResponse | null>;
  deleteScore: (scoreId: number) => Promise<boolean>;
  bulkCreateScores: (bulkData: BulkScoreDto) => Promise<BulkScoreResult | null>;

  // Утилиты
  clearError: () => void;
  refresh: () => Promise<void>;
}

export const useScores = (options: UseScoresOptions = {}): UseScoresReturn => {
  const { gameId, teamId, roundId, autoLoad = false } = options;

  // Состояние данных
  const [scores, setScores] = useState<ScoreResponse[]>([]);
  const [gameStats, setGameStats] = useState<GameScoreStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameLeaderboard | null>(null);
  const [teamStats, setTeamStats] = useState<TeamScoreStats | null>(null);
  const [pagination, setPagination] = useState<UseScoresReturn['pagination']>(null);

  // Состояние загрузки
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [bulkCreating, setBulkCreating] = useState(false);

  // Ошибки
  const [error, setError] = useState<string | null>(null);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Загрузка баллов
  const loadScores = useCallback(async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) => {
    if (!gameId && !teamId && !roundId) return;

    setLoading(true);
    setError(null);

    try {
      let result: ScoreListResult;

      if (gameId) {
        result = await scoreService.getGameScoresHistory(gameId, {
          teamId: teamId !== undefined ? teamId : undefined,
          roundId: roundId !== undefined ? roundId : undefined,
          ...params
        });
      } else {
        result = await scoreService.getScores({
          gameId: gameId !== undefined ? gameId : undefined,
          teamId: teamId !== undefined ? teamId : undefined,
          roundId: roundId !== undefined ? roundId : undefined,
          ...params
        });
      }

      setScores(result.scores);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки баллов');
    } finally {
      setLoading(false);
    }
  }, [gameId, teamId, roundId]);

  // Загрузка статистики игры
  const loadGameStats = useCallback(async () => {
    if (!gameId) return;

    setLoading(true);
    setError(null);

    try {
      const stats = await scoreService.getGameScoreStats(gameId);
      setGameStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Загрузка лидерборда
  const loadLeaderboard = useCallback(async () => {
    if (!gameId) return;

    setLoading(true);
    setError(null);

    try {
      const board = await scoreService.getGameLeaderboard(gameId);
      setLeaderboard(board);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки лидерборда');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Загрузка статистики команды
  const loadTeamStats = useCallback(async (teamId: number) => {
    if (!gameId) return;

    setLoading(true);
    setError(null);

    try {
      const stats = await scoreService.getTeamScoreStats(gameId, teamId);
      setTeamStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки статистики команды');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Загрузка баллов раунда
  const loadRoundScores = useCallback(async (roundId: number) => {
    if (!gameId) return;

    setLoading(true);
    setError(null);

    try {
      const roundScores = await scoreService.getRoundScores(gameId, roundId);
      setScores(roundScores);
      setPagination(null); // Для раунда пагинация не нужна
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки баллов раунда');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Создание записи о баллах
  const createScore = useCallback(async (scoreData: CreateScoreDto): Promise<ScoreResponse | null> => {
    setCreating(true);
    setError(null);

    try {
      const newScore = await scoreService.createScore(scoreData);

      // Обновляем локальное состояние
      setScores(prev => [newScore, ...prev]);

      return newScore;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания записи о баллах');
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  // Обновление записи о баллах
  const updateScore = useCallback(async (scoreId: number, scoreData: UpdateScoreDto): Promise<ScoreResponse | null> => {
    setUpdating(true);
    setError(null);

    try {
      const updatedScore = await scoreService.updateScore(scoreId, scoreData);

      // Обновляем локальное состояние
      setScores(prev => prev.map(score =>
        score.id === scoreId ? updatedScore : score
      ));

      return updatedScore;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления записи о баллах');
      return null;
    } finally {
      setUpdating(false);
    }
  }, []);

  // Удаление записи о баллах
  const deleteScore = useCallback(async (scoreId: number): Promise<boolean> => {
    setError(null);

    try {
      await scoreService.deleteScore(scoreId);

      // Обновляем локальное состояние
      setScores(prev => prev.filter(score => score.id !== scoreId));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления записи о баллах');
      return false;
    }
  }, []);

  // Массовое создание баллов
  const bulkCreateScores = useCallback(async (bulkData: BulkScoreDto): Promise<BulkScoreResult | null> => {
    setBulkCreating(true);
    setError(null);

    try {
      const result = await scoreService.bulkCreateScores(bulkData);

      // Обновляем локальное состояние
      if (result.scores.length > 0) {
        setScores(prev => [...result.scores, ...prev]);
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка массового создания баллов');
      return null;
    } finally {
      setBulkCreating(false);
    }
  }, []);

  // Обновление всех данных
  const refresh = useCallback(async () => {
    await Promise.all([
      loadScores(),
      gameId ? loadGameStats() : Promise.resolve(),
      gameId ? loadLeaderboard() : Promise.resolve()
    ]);
  }, [loadScores, loadGameStats, loadLeaderboard, gameId]);

  // Автозагрузка при монтировании
  useEffect(() => {
    if (autoLoad) {
      loadScores();
    }
  }, [autoLoad, loadScores]);

  return {
    // Данные
    scores,
    gameStats,
    leaderboard,
    teamStats,
    pagination,

    // Состояние загрузки
    loading,
    creating,
    updating,
    bulkCreating,

    // Ошибки
    error,

    // Методы
    loadScores,
    loadGameStats,
    loadLeaderboard,
    loadTeamStats,
    loadRoundScores,
    createScore,
    updateScore,
    deleteScore,
    bulkCreateScores,

    // Утилиты
    clearError,
    refresh
  };
};
