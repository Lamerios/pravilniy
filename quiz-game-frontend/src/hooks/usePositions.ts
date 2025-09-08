import { useCallback, useEffect, useState } from 'react';

import { scoreService } from '../services/score.service';
import { PositionChange, TeamPosition } from '../types/position.types';

interface UsePositionsReturn {
  positions: TeamPosition[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshPositions: () => Promise<void>;
  recalculatePositions: () => Promise<PositionChange[]>;
}

export const usePositions = (gameId: number): UsePositionsReturn => {
  const [positions, setPositions] = useState<TeamPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /**
   * Загрузить позиции команд
   */
  const loadPositions = useCallback(async () => {
    if (!gameId) return;

    try {
      setLoading(true);
      setError(null);

      const leaderboard = await scoreService.getGameLeaderboard(gameId);

      setPositions(leaderboard.leaderboard);
      setLastUpdated(new Date(leaderboard.lastUpdated));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки позиций');
      console.error('Failed to load positions:', err);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  /**
   * Обновить позиции команд
   */
  const refreshPositions = useCallback(async () => {
    await loadPositions();
  }, [loadPositions]);

  /**
   * Пересчитать позиции команд принудительно
   */
  const recalculatePositions = useCallback(async (): Promise<PositionChange[]> => {
    if (!gameId) return [];

    try {
      setLoading(true);
      setError(null);

      const result = await scoreService.recalculateGamePositions(gameId);

      // Обновляем локальные позиции
      setPositions(result.positions);
      setLastUpdated(new Date());

      return result.changes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка пересчета позиций');
      console.error('Failed to recalculate positions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Загружаем позиции при монтировании или изменении gameId
  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  return {
    positions,
    loading,
    error,
    lastUpdated,
    refreshPositions,
    recalculatePositions
  };
};
