import { useState } from 'react';
import { TemplateQueryDto } from '../types/template.types';

interface TemplateFiltersProps {
  filters: TemplateQueryDto;
  onFiltersChange: (filters: Partial<TemplateQueryDto>) => void;
  loading?: boolean;
}

export function TemplateFiltersComponent({ filters, onFiltersChange, loading = false }: TemplateFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onFiltersChange({ search: value || undefined, page: 1 });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ sortBy, page: 1 });
  };

  const handleSortOrderChange = (sortOrder: 'ASC' | 'DESC') => {
    onFiltersChange({ sortOrder, page: 1 });
  };

  const handleLimitChange = (limit: number) => {
    onFiltersChange({ limit, page: 1 });
  };

  const clearFilters = () => {
    setSearchValue('');
    onFiltersChange({
      search: undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      page: 1
    });
  };

  return (
    <div className="filters-section">
      <div className="filters-row">
        <div className="search-group">
          <input
            type="text"
            placeholder="Поиск шаблонов..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
            disabled={loading}
          />
          {searchValue && (
            <button
              onClick={() => handleSearchChange('')}
              className="clear-search-btn"
              disabled={loading}
            >
              ×
            </button>
          )}
        </div>

        <div className="filters-controls">
          <div className="filter-group">
            <label htmlFor="sort-by" className="filter-label">
              Сортировка:
            </label>
            <select
              id="sort-by"
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="filter-select"
              disabled={loading}
            >
              <option value="name">По названию</option>
              <option value="createdAt">По дате создания</option>
              <option value="updatedAt">По дате обновления</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-order" className="filter-label">
              Порядок:
            </label>
            <select
              id="sort-order"
              value={filters.sortOrder || 'DESC'}
              onChange={(e) => handleSortOrderChange(e.target.value as 'ASC' | 'DESC')}
              className="filter-select"
              disabled={loading}
            >
              <option value="DESC">По убыванию</option>
              <option value="ASC">По возрастанию</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="limit" className="filter-label">
              На странице:
            </label>
            <select
              id="limit"
              value={filters.limit || 10}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="filter-select"
              disabled={loading}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="clear-filters-btn"
            disabled={loading}
          >
            Сбросить
          </button>
        </div>
      </div>

      {(filters.search || filters.sortBy !== 'createdAt' || filters.sortOrder !== 'DESC') && (
        <div className="active-filters">
          <span className="active-filters-label">Активные фильтры:</span>
          {filters.search && (
            <span className="filter-tag">
              Поиск: "{filters.search}"
              <button
                onClick={() => handleSearchChange('')}
                className="remove-filter-btn"
                disabled={loading}
              >
                ×
              </button>
            </span>
          )}
          {filters.sortBy && filters.sortBy !== 'createdAt' && (
            <span className="filter-tag">
              Сортировка: {filters.sortBy}
              <button
                onClick={() => handleSortChange('createdAt')}
                className="remove-filter-btn"
                disabled={loading}
              >
                ×
              </button>
            </span>
          )}
          {filters.sortOrder && filters.sortOrder !== 'DESC' && (
            <span className="filter-tag">
              Порядок: {filters.sortOrder}
              <button
                onClick={() => handleSortOrderChange('DESC')}
                className="remove-filter-btn"
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
