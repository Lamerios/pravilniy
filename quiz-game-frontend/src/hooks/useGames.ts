import { useCallback, useEffect, useState } from 'react';
import { gameService } from '../services/game.service';
import {
    Game,
    GameFilters,
    GameQueryDto,
    GameStats,
    PaginationInfo
} from '../types/game.types';

interface UseGamesReturn {
  games: Game[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  filters: GameFilters;
  stats: GameStats | null;
  setFilters: (filters: Partial<GameFilters>) => void;
  refreshGames: () => Promise<void>;
  loadMore: () => Promise<void>;
  clearError: () => void;
}

export function useGames(): UseGamesReturn {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);

  const [filters, setFiltersState] = useState<GameFilters>({
    search: '',
    status: '',
    templateId: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    page: 1,
    limit: 12
  });

  const setFilters = useCallback((newFilters: Partial<GameFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Сбрасываем страницу при изменении фильтров
    }));
  }, []);

  const loadGames = useCallback(async (query: GameQueryDto, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const result = await gameService.getGames(query);

      if (append) {
        setGames(prev => [...prev, ...result.games]);
      } else {
        setGames(result.games);
      }

      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        itemsPerPage: result.itemsPerPage,
        hasNext: result.currentPage < result.totalPages,
        hasPrev: result.currentPage > 1
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки игр');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const result = await gameService.getGameStats();
      setStats(result.data);
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    }
  }, []);

  const refreshGames = useCallback(async () => {
    const query: GameQueryDto = {
      page: filters.page,
      limit: filters.limit,
      search: filters.search || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      status: filters.status || undefined,
      templateId: filters.templateId || undefined
    };

    await loadGames(query, false);
  }, [filters, loadGames]);

  const loadMore = useCallback(async () => {
    if (!pagination?.hasNext || loading) return;

    const nextPage = filters.page + 1;
    const query: GameQueryDto = {
      ...filters,
      page: nextPage,
      search: filters.search || undefined,
      status: filters.status || undefined,
      templateId: filters.templateId || undefined
    };

    setFiltersState(prev => ({ ...prev, page: nextPage }));
    await loadGames(query, true);
  }, [filters, pagination, loading, loadGames]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Загружаем игры при изменении фильтров
  useEffect(() => {
    refreshGames();
  }, [refreshGames]);

  // Загружаем статистику при монтировании
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    games,
    loading,
    error,
    pagination,
    filters,
    stats,
    setFilters,
    refreshGames,
    loadMore,
    clearError
  };
}

interface UseGameReturn {
  game: Game | null;
  loading: boolean;
  error: string | null;
  loadGame: (id: string) => Promise<void>;
  updateGame: (id: string, data: any) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
  changeGameState: (id: string, action: string, reason?: string) => Promise<void>;
  clearError: () => void;
}

export function useGame(): UseGameReturn {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGame = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await gameService.getGameById(id);
      setGame(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки игры');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGame = useCallback(async (id: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await gameService.updateGame(id, data);
      setGame(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления игры');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGame = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await gameService.deleteGame(id);
      setGame(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления игры');
    } finally {
      setLoading(false);
    }
  }, []);

  const changeGameState = useCallback(async (id: string, action: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await gameService.changeGameState(id, { action: action as any, reason });
      setGame(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка изменения состояния игры');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    game,
    loading,
    error,
    loadGame,
    updateGame,
    deleteGame,
    changeGameState,
    clearError
  };
}
