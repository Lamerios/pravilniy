import React, { useEffect, useState } from 'react';

import { GameFilters, GameStatus } from '../types/game.types';

interface GameFiltersProps {
  filters: GameFilters;
  onFiltersChange: (filters: Partial<GameFilters>) => void;
  loading?: boolean;
}

export function GameFiltersComponent({
  filters,
  onFiltersChange,
  loading = false
}: GameFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ search: localSearch, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onFiltersChange]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value as GameStatus | '';
    onFiltersChange({ status, page: 1 });
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sortBy = event.target.value;
    onFiltersChange({ sortBy, page: 1 });
  };

  const handleSortOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sortOrder = event.target.value as 'ASC' | 'DESC';
    onFiltersChange({ sortOrder, page: 1 });
  };

  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = event.target.value ? parseInt(event.target.value) : '';
    onFiltersChange({ templateId, page: 1 });
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFiltersChange({
      search: '',
      status: '',
      templateId: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      page: 1
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.templateId;

  return (
    <div className="game-filters">
      <div className="filters-main">
        <div className="search-container">
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={localSearch}
            onChange={handleSearchChange}
            disabled={loading}
            className="search-input"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="search-clear"
              disabled={loading}
              aria-label="Очистить поиск"
            >
              ×
            </button>
          )}
        </div>

        <div className="filters-basic">
          <select
            value={filters.status}
            onChange={handleStatusChange}
            disabled={loading}
            className="filter-select"
          >
            <option value="">Все статусы</option>
            <option value={GameStatus.DRAFT}>Черновик</option>
            <option value={GameStatus.WAITING}>Ожидает</option>
            <option value={GameStatus.ACTIVE}>Активная</option>
            <option value={GameStatus.PAUSED}>Приостановлена</option>
            <option value={GameStatus.FINISHED}>Завершена</option>
            <option value={GameStatus.CANCELLED}>Отменена</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={handleSortChange}
            disabled={loading}
            className="filter-select"
          >
            <option value="createdAt">По дате создания</option>
            <option value="updatedAt">По дате обновления</option>
            <option value="name">По названию</option>
            <option value="status">По статусу</option>
            <option value="scheduledAt">По дате планирования</option>
          </select>

          <select
            value={filters.sortOrder}
            onChange={handleSortOrderChange}
            disabled={loading}
            className="filter-select"
          >
            <option value="DESC">По убыванию</option>
            <option value="ASC">По возрастанию</option>
          </select>
        </div>

        <div className="filters-actions">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="toggle-advanced"
            disabled={loading}
          >
            {showAdvanced ? 'Скрыть' : 'Дополнительно'}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="clear-filters"
              disabled={loading}
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="filters-advanced">
          <div className="advanced-row">
            <div className="filter-group">
              <label htmlFor="template-filter">Шаблон:</label>
              <select
                id="template-filter"
                value={filters.templateId}
                onChange={handleTemplateChange}
                disabled={loading}
                className="filter-select"
              >
                <option value="">Все шаблоны</option>
                {/* TODO: Загружать список шаблонов */}
                <option value="1">Классическая викторина</option>
                <option value="2">Быстрые вопросы</option>
                <option value="3">Сложная викторина</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="limit-filter">На странице:</label>
              <select
                id="limit-filter"
                value={filters.limit}
                onChange={(e) => onFiltersChange({ limit: parseInt(e.target.value), page: 1 })}
                disabled={loading}
                className="filter-select"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Активные фильтры:</span>
          {filters.search && (
            <span className="filter-tag">
              Поиск: "{filters.search}"
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="filter-tag-remove"
                disabled={loading}
              >
                ×
              </button>
            </span>
          )}
          {filters.status && (
            <span className="filter-tag">
              Статус: {getStatusLabel(filters.status)}
              <button
                type="button"
                onClick={() => onFiltersChange({ status: '', page: 1 })}
                className="filter-tag-remove"
                disabled={loading}
              >
                ×
              </button>
            </span>
          )}
          {filters.templateId && (
            <span className="filter-tag">
              Шаблон: {filters.templateId}
              <button
                type="button"
                onClick={() => onFiltersChange({ templateId: '', page: 1 })}
                className="filter-tag-remove"
                disabled={loading}
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: GameStatus): string {
  const labels: Record<GameStatus, string> = {
    [GameStatus.DRAFT]: 'Черновик',
    [GameStatus.WAITING]: 'Ожидает',
    [GameStatus.ACTIVE]: 'Активная',
    [GameStatus.PAUSED]: 'Приостановлена',
    [GameStatus.FINISHED]: 'Завершена',
    [GameStatus.CANCELLED]: 'Отменена'
  };
  return labels[status] || status;
}
