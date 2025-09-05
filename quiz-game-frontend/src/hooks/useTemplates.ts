import { useCallback, useEffect, useState } from 'react';
import { templateService } from '../services/template.service';
import { PaginationInfo } from '../types/game.types';
import { GameTemplate, TemplateListResult, TemplateQueryDto, TemplateStats } from '../types/template.types';

interface UseTemplatesReturn {
  templates: GameTemplate[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  filters: TemplateQueryDto;
  stats: TemplateStats | null;
  setFilters: (filters: Partial<TemplateQueryDto>) => void;
  refreshTemplates: () => Promise<void>;
  clearError: () => void;
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [filters, setFiltersState] = useState<TemplateQueryDto>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });
  const [stats, setStats] = useState<TemplateStats | null>(null);

  const loadTemplates = useCallback(async (query: TemplateQueryDto = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result: TemplateListResult = await templateService.getTemplates(query);
      setTemplates(result.templates);
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        itemsPerPage: result.itemsPerPage,
        hasNext: result.currentPage < result.totalPages,
        hasPrev: result.currentPage > 1
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки шаблонов');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const result = await templateService.getTemplateStats();
      setStats(result.data);
    } catch (err) {
      console.error('Ошибка загрузки статистики шаблонов:', err);
    }
  }, []);

  const setFilters = useCallback((newFilters: Partial<TemplateQueryDto>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refreshTemplates = useCallback(async () => {
    await loadTemplates(filters);
  }, [loadTemplates, filters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Загружаем шаблоны при изменении фильтров
  useEffect(() => {
    loadTemplates(filters);
  }, [loadTemplates, filters]);

  // Загружаем статистику при монтировании
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    templates,
    loading,
    error,
    pagination,
    filters,
    stats,
    setFilters,
    refreshTemplates,
    clearError
  };
}

interface UseTemplateReturn {
  template: GameTemplate | null;
  loading: boolean;
  error: string | null;
  loadTemplate: (id: string) => Promise<void>;
  clearError: () => void;
}

export function useTemplate(): UseTemplateReturn {
  const [template, setTemplate] = useState<GameTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await templateService.getTemplateById(id);
      setTemplate(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки шаблона');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    template,
    loading,
    error,
    loadTemplate,
    clearError
  };
}
