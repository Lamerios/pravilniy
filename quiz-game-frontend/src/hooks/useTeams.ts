import { useCallback, useEffect, useState } from 'react';
import { teamService } from '../services/team.service';
import {
    PaginationInfo,
    Team,
    TeamFilters,
    TeamListResult,
    TeamQueryDto,
    TeamStats
} from '../types/team.types';

interface UseTeamsReturn {
  teams: Team[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  filters: TeamFilters;
  stats: TeamStats | null;
  loadTeams: (query?: TeamQueryDto) => Promise<void>;
  loadStats: () => Promise<void>;
  setFilters: (filters: TeamFilters) => void;
  refreshTeams: () => Promise<void>;
  searchTeams: (query: string) => Promise<Team[]>;
}

/**
 * Хук для работы с командами
 */
export const useTeams = (initialQuery: TeamQueryDto = {}): UseTeamsReturn => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [filters, setFilters] = useState<TeamFilters>({
    search: initialQuery.search || undefined,
    isActive: initialQuery.isActive || undefined,
    sortBy: initialQuery.sortBy || 'createdAt',
    sortOrder: initialQuery.sortOrder || 'DESC'
  });
  const [stats, setStats] = useState<TeamStats | null>(null);

  /**
   * Загрузить список команд
   */
  const loadTeams = useCallback(async (query: TeamQueryDto = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams: TeamQueryDto = {
        page: query.page || 1,
        limit: query.limit || 10,
        search: query.search || filters.search || undefined,
        sortBy: query.sortBy || filters.sortBy || undefined,
        sortOrder: query.sortOrder || filters.sortOrder || undefined,
        isActive: query.isActive !== undefined ? query.isActive : filters.isActive || undefined,
        organizationId: query.organizationId || undefined
      };

      const result: TeamListResult = await teamService.getTeams(queryParams);

      setTeams(result.teams);
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        itemsPerPage: result.itemsPerPage,
        hasNext: result.currentPage < result.totalPages,
        hasPrev: result.currentPage > 1
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки команд');
      setTeams([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Загрузить статистику команд
   */
  const loadStats = useCallback(async () => {
    try {
      const teamStats = await teamService.getTeamStats();
      setStats(teamStats);
    } catch (err) {
      console.error('Ошибка загрузки статистики команд:', err);
    }
  }, []);

  /**
   * Обновить фильтры
   */
  const updateFilters = useCallback((newFilters: TeamFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Обновить список команд
   */
  const refreshTeams = useCallback(async () => {
    await loadTeams();
  }, [loadTeams]);

  /**
   * Поиск команд
   */
  const searchTeams = useCallback(async (query: string): Promise<Team[]> => {
    try {
      if (!query.trim()) {
        return [];
      }

      const result = await teamService.searchTeams(query, 20);
      return result.teams;
    } catch (err) {
      console.error('Ошибка поиска команд:', err);
      return [];
    }
  }, []);

  // Загружаем команды при изменении фильтров
  useEffect(() => {
    loadTeams();
  }, [filters, loadTeams]);

  // Загружаем статистику при монтировании
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    teams,
    loading,
    error,
    pagination,
    filters,
    stats,
    loadTeams,
    loadStats,
    setFilters: updateFilters,
    refreshTeams,
    searchTeams
  };
};
