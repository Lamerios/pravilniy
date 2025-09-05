import React, { useCallback, useEffect, useState } from 'react';
import { teamService } from '../services/team.service';
import { Team, TeamFilters } from '../types/team.types';

interface TeamSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: TeamFilters) => void;
  onTeamSelect: (team: Team) => void;
  selectedTeamIds: string[];
  filters: TeamFilters;
  placeholder?: string;
  showFilters?: boolean;
}

/**
 * Компонент поиска команд
 */
export const TeamSearch: React.FC<TeamSearchProps> = ({
  onSearch,
  onFilterChange,
  onTeamSelect,
  selectedTeamIds,
  filters,
  placeholder = 'Поиск команд...',
  showFilters = true
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [searchResults, setSearchResults] = useState<Team[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = useCallback(async (query: string) => {
    try {
      setIsSearching(true);
      const results = await teamService.searchTeams(query, 10);
      setSearchResults(results.teams);
      setShowResults(true);
    } catch (error) {
      console.error('Ошибка поиска команд:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof TeamFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  const handleTeamSelect = (team: Team) => {
    onTeamSelect(team);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const isTeamSelected = (teamId: string) => {
    return selectedTeamIds.includes(teamId);
  };

  return (
    <div className="team-search">
      <div className="team-search__input-group">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />
          <div className="input-group-append">
            <span className="input-group-text">
              {isSearching ? (
                <div className="spinner spinner--sm"></div>
              ) : (
                <i className="icon icon--search"></i>
              )}
            </span>
          </div>
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="team-search__results">
            <div className="team-search__results-header">
              <span>Результаты поиска ({searchResults.length})</span>
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() => setShowResults(false)}
              >
                <i className="icon icon--close"></i>
              </button>
            </div>
            <div className="team-search__results-list">
              {searchResults.map((team) => (
                <div
                  key={team.id}
                  className={`team-search__result-item ${
                    isTeamSelected(team.id) ? 'team-search__result-item--selected' : ''
                  }`}
                  onClick={() => !isTeamSelected(team.id) && handleTeamSelect(team)}
                >
                  <div className="team-search__result-info">
                    <div className="team-search__result-logo">
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.name} />
                      ) : (
                        <div className="team-search__result-logo-placeholder">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="team-search__result-details">
                      <h4 className="team-search__result-name">{team.name}</h4>
                      {team.tableNumber && (
                        <span className="team-search__result-table">
                          Стол #{team.tableNumber}
                        </span>
                      )}
                      <span className="team-search__result-members">
                        {team.members?.length || 0} участников
                      </span>
                    </div>
                  </div>
                  {isTeamSelected(team.id) && (
                    <div className="team-search__result-status">
                      <i className="icon icon--check"></i>
                      Выбрана
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="team-search__filters">
          <div className="form-group">
            <label className="form-label">Статус:</label>
            <select
              className="form-control form-control--sm"
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('isActive', value === '' ? undefined : value === 'true');
              }}
            >
              <option value="">Все</option>
              <option value="true">Активные</option>
              <option value="false">Неактивные</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Сортировка:</label>
            <select
              className="form-control form-control--sm"
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="createdAt">По дате создания</option>
              <option value="name">По названию</option>
              <option value="tableNumber">По номеру стола</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Порядок:</label>
            <select
              className="form-control form-control--sm"
              value={filters.sortOrder || 'DESC'}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'ASC' | 'DESC')}
            >
              <option value="DESC">По убыванию</option>
              <option value="ASC">По возрастанию</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
