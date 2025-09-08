import React, { useEffect, useMemo, useState } from 'react';

import '../styles/position-animations.css';
import { GameLeaderboard, TeamPosition } from '../types/position.types';

interface LeaderboardTableProps {
  leaderboard: GameLeaderboard;
  variant?: 'default' | 'compact' | 'minimal';
  showRounds?: boolean;
  showAverage?: boolean;
  showActivity?: boolean;
  showTableNumbers?: boolean;
  showPositions?: boolean;
  showPositionChanges?: boolean;
  animateChanges?: boolean;
  maxRows?: number | undefined;
  onTeamClick?: ((teamId: number) => void) | undefined;
  className?: string;
}

type SortField = 'position' | 'teamName' | 'totalPoints' | 'roundsPlayed' | 'averagePoints' | 'lastActivity';
type SortOrder = 'asc' | 'desc';

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  leaderboard,
  variant = 'default',
  showRounds = true,
  showAverage = true,
  showActivity = false,
  showTableNumbers = true,
  showPositions = true,
  showPositionChanges = true,
  animateChanges = true,
  maxRows,
  onTeamClick,
  className = ''
}) => {
  const [sortField, setSortField] = useState<SortField>('position');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [animatingTeams, setAnimatingTeams] = useState<Set<number>>(new Set());

  // Отслеживаем изменения позиций для анимации
  useEffect(() => {
    if (!animateChanges) return;

    const newAnimatingTeams = new Set<number>();
    leaderboard.leaderboard.forEach(team => {
      if (team.positionChange !== 'same') {
        newAnimatingTeams.add(team.teamId);
      }
    });

    setAnimatingTeams(newAnimatingTeams);

    // Убираем анимацию через некоторое время
    const timer = setTimeout(() => {
      setAnimatingTeams(new Set());
    }, 1000);

    return () => clearTimeout(timer);
  }, [leaderboard.leaderboard, animateChanges]);

  // Функция для получения CSS класса позиции
  const getPositionClassName = (position: number): string => {
    if (position === 1) return 'position-number--1';
    if (position === 2) return 'position-number--2';
    if (position === 3) return 'position-number--3';
    return 'position-number--default';
  };

  // Функция для получения CSS класса изменения позиции
  const getPositionChangeClassName = (team: TeamPosition): string => {
    const baseClass = 'position-change';
    if (!animateChanges || !animatingTeams.has(team.teamId)) {
      return baseClass;
    }
    return `${baseClass} position-change--${team.positionChange}`;
  };

  // Компонент индикатора изменения позиции
  const PositionChangeIndicator: React.FC<{ team: TeamPosition }> = ({ team }) => {
    if (!showPositionChanges || team.positionChange === 'same') {
      return null;
    }

    const getIndicatorText = () => {
      switch (team.positionChange) {
        case 'up':
          return `↑${team.previousPosition ? team.previousPosition - team.position : ''}`;
        case 'down':
          return `↓${team.previousPosition ? team.position - team.previousPosition : ''}`;
        case 'new':
          return 'NEW';
        default:
          return '';
      }
    };

    return (
      <span className={`position-indicator position-indicator--${team.positionChange}`}>
        <span className="position-indicator__arrow">
          {team.positionChange === 'up' ? '↑' : team.positionChange === 'down' ? '↓' : '★'}
        </span>
        {getIndicatorText()}
      </span>
    );
  };

  // Сортировка данных
  const sortedData = useMemo(() => {
    let data = [...leaderboard.leaderboard];

    if (maxRows) {
      data = data.slice(0, maxRows);
    }

    return data.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortField) {
        case 'position':
          valueA = a.position;
          valueB = b.position;
          break;
        case 'teamName':
          valueA = a.teamName.toLowerCase();
          valueB = b.teamName.toLowerCase();
          break;
        case 'totalPoints':
          valueA = a.totalPoints;
          valueB = b.totalPoints;
          break;
        case 'roundsPlayed':
          valueA = a.roundsPlayed;
          valueB = b.roundsPlayed;
          break;
        case 'averagePoints':
          valueA = a.averagePoints;
          valueB = b.averagePoints;
          break;
        case 'lastActivity':
          valueA = new Date(a.lastActivity || '').getTime();
          valueB = new Date(b.lastActivity || '').getTime();
          break;
        default:
          valueA = a.position;
          valueB = b.position;
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leaderboard.leaderboard, sortField, sortOrder, maxRows]);

  // Обработка клика по заголовку для сортировки
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'position' ? 'asc' : 'desc');
    }
  };

  // Получение иконки сортировки
  const getSortIcon = (field: SortField): string => {
    if (sortField !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // Форматирование времени
  const formatLastActivity = (activity: string): string => {
    const date = new Date(activity);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Сейчас';
    if (diffMinutes < 60) return `${diffMinutes}м`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}ч`;

    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  // Получение класса для позиции
  const getPositionClass = (position: number): string => {
    if (position === 1) return 'position-first';
    if (position === 2) return 'position-second';
    if (position === 3) return 'position-third';
    if (position <= 5) return 'position-top';
    return '';
  };

  // Минимальный вариант (только позиция, название и баллы)
  if (variant === 'minimal') {
    return (
      <div className={`leaderboard-table leaderboard-table--minimal ${className}`}>
        {sortedData.map((entry) => (
          <div
            key={entry.teamId}
            className={`leaderboard-row ${getPositionClass(entry.position)}`}
            onClick={() => onTeamClick?.(entry.teamId)}
          >
            <div className="position">#{entry.position}</div>
            <div className="team-name">{entry.teamName}</div>
            <div className="total-points">{entry.totalPoints}</div>
          </div>
        ))}
      </div>
    );
  }

  // Компактный вариант
  if (variant === 'compact') {
    return (
      <div className={`leaderboard-table leaderboard-table--compact ${className}`}>
        <div className="table-header">
          <div className="header-cell position-header">Поз.</div>
          <div className="header-cell team-header">Команда</div>
          {showTableNumbers && (
            <div className="header-cell table-header">Стол</div>
          )}
          <div className="header-cell points-header">Баллы</div>
          {showRounds && (
            <div className="header-cell rounds-header">Раундов</div>
          )}
        </div>

        <div className="table-body">
          {sortedData.map((entry) => (
            <div
              key={entry.teamId}
              className={`table-row ${getPositionClass(entry.position)}`}
              onClick={() => onTeamClick?.(entry.teamId)}
            >
              <div className="cell position-cell">
                <span className="position-number">#{entry.position}</span>
                {entry.position <= 3 && (
                  <span className="medal">
                    {entry.position === 1 && '🥇'}
                    {entry.position === 2 && '🥈'}
                    {entry.position === 3 && '🥉'}
                  </span>
                )}
              </div>
              <div className="cell team-cell">
                <span className="team-name">{entry.teamName}</span>
              </div>
              {showTableNumbers && (
                <div className="cell table-cell">
                  {entry.tableNumber ? `#${entry.tableNumber}` : '—'}
                </div>
              )}
              <div className="cell points-cell">
                <span className="points-value">{entry.totalPoints}</span>
              </div>
              {showRounds && (
                <div className="cell rounds-cell">{entry.roundsPlayed}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Полная таблица (default)
  return (
    <div className={`leaderboard-table leaderboard-table--default ${className}`}>
      <div className="table-info">
        <h3>Лидерборд: {leaderboard.gameInfo.gameName}</h3>
        <div className="game-stats">
          <span>Команд: {leaderboard.gameInfo.totalTeams}</span>
          <span>Раундов: {leaderboard.gameInfo.totalRounds}</span>
        </div>
      </div>

      <table className="leaderboard-table-element">
        <thead>
          <tr>
            {showPositions && (
              <th
                className="sortable position-column"
                onClick={() => handleSort('position')}
              >
                Позиция {getSortIcon('position')}
              </th>
            )}
            <th
              className="sortable team-column"
              onClick={() => handleSort('teamName')}
            >
              Команда {getSortIcon('teamName')}
            </th>
            {showTableNumbers && (
              <th className="table-column">Стол</th>
            )}
            <th
              className="sortable points-column"
              onClick={() => handleSort('totalPoints')}
            >
              Общие баллы {getSortIcon('totalPoints')}
            </th>
            {showRounds && (
              <th
                className="sortable rounds-column"
                onClick={() => handleSort('roundsPlayed')}
              >
                Раундов {getSortIcon('roundsPlayed')}
              </th>
            )}
            {showAverage && (
              <th
                className="sortable average-column"
                onClick={() => handleSort('averagePoints')}
              >
                Средний балл {getSortIcon('averagePoints')}
              </th>
            )}
            {showActivity && (
              <th
                className="sortable activity-column"
                onClick={() => handleSort('lastActivity')}
              >
                Активность {getSortIcon('lastActivity')}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((entry) => (
            <tr
              key={entry.teamId}
              className={`table-row leaderboard-row ${getPositionClass(entry.position)} ${getPositionChangeClassName(entry)}`}
              onClick={() => onTeamClick?.(entry.teamId)}
            >
              {showPositions && (
                <td className="position-cell">
                  <div className="position-display">
                    <span className={`position-number ${getPositionClassName(entry.position)}`}>
                      {entry.position}
                    </span>
                    {entry.position <= 3 && (
                      <span className="position-medal">
                        {entry.position === 1 && '🥇'}
                        {entry.position === 2 && '🥈'}
                        {entry.position === 3 && '🥉'}
                      </span>
                    )}
                    <PositionChangeIndicator team={entry} />
                  </div>
                </td>
              )}
              <td className="team-cell">
                <div className="team-info">
                  <span className="team-name">{entry.teamName}</span>
                </div>
              </td>
              {showTableNumbers && (
                <td className="table-cell">
                  {entry.tableNumber ? (
                    <span className="table-number">#{entry.tableNumber}</span>
                  ) : (
                    <span className="no-table">—</span>
                  )}
                </td>
              )}
              <td className="points-cell">
                <span className="points-value">{entry.totalPoints}</span>
              </td>
              {showRounds && (
                <td className="rounds-cell">
                  <span className="rounds-count">{entry.roundsPlayed}</span>
                </td>
              )}
              {showAverage && (
                <td className="average-cell">
                  <span className="average-value">{(entry.averagePoints || 0).toFixed(1)}</span>
                </td>
              )}
              {showActivity && (
                <td className="activity-cell">
                  <span className="activity-time">
                    {formatLastActivity(entry.lastActivity || '')}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {maxRows && leaderboard.leaderboard.length > maxRows && (
        <div className="table-footer">
          <span className="more-info">
            Показано {maxRows} из {leaderboard.leaderboard.length} команд
          </span>
        </div>
      )}
    </div>
  );
};
