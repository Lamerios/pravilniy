import { useCallback, useEffect, useState } from 'react';
import { templateService } from '../services/template.service';
import { GameTemplate, TemplateQueryDto } from '../types/template.types';

interface UseTemplatesReturn {
  templates: GameTemplate[];
  loading: boolean;
  error: string | null;
  loadTemplates: (query?: TemplateQueryDto) => Promise<void>;
  clearError: () => void;
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async (query: TemplateQueryDto = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await templateService.getTemplates(query);
      setTemplates(result.templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки шаблонов');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Загружаем шаблоны при монтировании
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    error,
    loadTemplates,
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
