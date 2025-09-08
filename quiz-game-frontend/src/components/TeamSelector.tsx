import React, { useCallback, useEffect, useState } from 'react';

import { useTeams } from '../hooks/useTeams';
import { Team, TeamFilters, TeamSelection } from '../types/team.types';

import { TeamCard } from './TeamCard';
import { TeamSearch } from './TeamSearch';

interface TeamSelectorProps {
  selectedTeamIds: string[];
  onSelectionChange: (teamIds: string[]) => void;
  maxTeams?: number;
  organizationId: number;
  showSearch?: boolean;
  showFilters?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Компонент выбора команд с поиском и фильтрацией
 */
export const TeamSelector: React.FC<TeamSelectorProps> = ({
  selectedTeamIds,
  onSelectionChange,
  maxTeams = 20,
  organizationId,
  showSearch = true,
  showFilters = true,
  compact = false,
  className = ''
}) => {
  const [selections, setSelections] = useState<TeamSelection[]>([]);
  const [filters, setFilters] = useState<TeamFilters>({
    isActive: true,
    sortBy: 'name',
    sortOrder: 'ASC'
  });

  const {
    teams,
    loading,
    error,
    pagination,
    loadTeams,
    setFilters: updateFilters,
    refreshTeams
  } = useTeams({
    organizationId,
    ...filters
  });

  // Инициализируем selections при загрузке команд
  useEffect(() => {
    const newSelections: TeamSelection[] = teams.map(team => ({
      teamId: team.id,
      team,
      selected: selectedTeamIds.includes(team.id)
    }));
    setSelections(newSelections);
  }, [teams, selectedTeamIds]);

  const handleTeamSelect = useCallback((team: Team) => {
    if (selectedTeamIds.includes(team.id)) {
      return; // Команда уже выбрана
    }

    if (selectedTeamIds.length >= maxTeams) {
      alert(`Максимум команд: ${maxTeams}`);
      return;
    }

    const newSelectedIds = [...selectedTeamIds, team.id];
    onSelectionChange(newSelectedIds);
  }, [selectedTeamIds, maxTeams, onSelectionChange]);

  const handleTeamDeselect = useCallback((team: Team) => {
    const newSelectedIds = selectedTeamIds.filter(id => id !== team.id);
    onSelectionChange(newSelectedIds);
  }, [selectedTeamIds, onSelectionChange]);

  const handleSearch = useCallback((query: string) => {
    updateFilters({ ...filters, search: query });
  }, [filters, updateFilters]);

  const handleFilterChange = useCallback((newFilters: TeamFilters) => {
    setFilters(newFilters);
    updateFilters(newFilters);
  }, [updateFilters]);

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNext) {
      loadTeams({
        page: (pagination.currentPage || 1) + 1,
        organizationId
      });
    }
  }, [pagination, loadTeams, organizationId]);

  const getSelectedTeams = () => {
    return selections.filter(s => s.selected).map(s => s.team);
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  if (error) {
    return (
      <div className={`team-selector ${className}`}>
        <div className="alert alert--error">
          <h4>Ошибка загрузки команд</h4>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={refreshTeams}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`team-selector ${className}`}>
      {/* Заголовок и статистика */}
      <div className="team-selector__header">
        <div className="team-selector__title">
          <h3>Выбор команд</h3>
          <span className="team-selector__count">
            {selectedTeamIds.length} / {maxTeams} выбрано
          </span>
        </div>
        {selectedTeamIds.length > 0 && (
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={clearSelection}
          >
            Очистить выбор
          </button>
        )}
      </div>

      {/* Поиск и фильтры */}
      {showSearch && (
        <div className="team-selector__search">
          <TeamSearch
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onTeamSelect={handleTeamSelect}
            selectedTeamIds={selectedTeamIds}
            filters={filters}
            showFilters={showFilters}
            placeholder="Поиск команд по названию..."
          />
        </div>
      )}

      {/* Выбранные команды */}
      {selectedTeamIds.length > 0 && (
        <div className="team-selector__selected">
          <h4>Выбранные команды ({selectedTeamIds.length})</h4>
          <div className="team-selector__selected-list">
            {getSelectedTeams().map(team => (
              <TeamCard
                key={team.id}
                team={team}
                selected={true}
                onDeselect={handleTeamDeselect}
                compact={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Список доступных команд */}
      <div className="team-selector__available">
        <h4>Доступные команды</h4>

        {loading && teams.length === 0 ? (
          <div className="team-selector__loading">
            <div className="spinner" />
            <p>Загрузка команд...</p>
          </div>
        ) : (
          <>
            {teams.length === 0 ? (
              <div className="team-selector__empty">
                <p>Команды не найдены</p>
                {filters.search && (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => handleSearch('')}
                  >
                    Очистить поиск
                  </button>
                )}
              </div>
            ) : (
              <div className="team-selector__list">
                {teams.map(team => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    selected={selectedTeamIds.includes(team.id)}
                    onSelect={handleTeamSelect}
                    onDeselect={handleTeamDeselect}
                    compact={compact}
                  />
                ))}
              </div>
            )}

            {/* Кнопка "Загрузить еще" */}
            {pagination?.hasNext && (
              <div className="team-selector__load-more">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Загрузка...' : 'Загрузить еще'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Информация о лимитах */}
      {selectedTeamIds.length >= maxTeams && (
        <div className="team-selector__limit-warning">
          <div className="alert alert--warning">
            <i className="icon icon--warning" />
            <span>Достигнут лимит команд ({maxTeams})</span>
          </div>
        </div>
      )}
    </div>
  );
};
