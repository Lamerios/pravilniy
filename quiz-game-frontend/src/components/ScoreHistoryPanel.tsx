import React, { useMemo, useState } from 'react';

import { ScoreResponse } from '../services/score.service';

interface Round {
  id: number;
  name: string;
  roundNumber: number;
}

interface ScoreHistoryPanelProps {
  gameId: number;
  gameName: string;
  scores: ScoreResponse[];
  rounds?: Round[];
  variant?: 'timeline' | 'table' | 'chart';
  showTeamFilter?: boolean;
  showRoundFilter?: boolean;
  maxEntries?: number;
  onScoreClick?: (score: ScoreResponse) => void;
  className?: string;
}

export const ScoreHistoryPanel: React.FC<ScoreHistoryPanelProps> = ({
  gameId: _gameId,
  gameName,
  scores,
  rounds = [],
  variant = 'timeline',
  showTeamFilter = true,
  showRoundFilter = true,
  maxEntries,
  onScoreClick,
  className = ''
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Фильтрация и сортировка данных
  const filteredScores = useMemo(() => {
    let filtered = [...scores];

    if (selectedTeamId) {
      filtered = filtered.filter(score => score.teamId === selectedTeamId);
    }

    if (selectedRoundId) {
      filtered = filtered.filter(score => score.roundId === selectedRoundId);
    }

    // Сортировка по времени создания
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    if (maxEntries) {
      filtered = filtered.slice(0, maxEntries);
    }

    return filtered;
  }, [scores, selectedTeamId, selectedRoundId, sortOrder, maxEntries]);

  // Получение уникальных команд
  const teams = useMemo(() => {
    const teamMap = new Map();
    scores.forEach(score => {
      if (score.team && !teamMap.has(score.teamId)) {
        teamMap.set(score.teamId, score.team);
      }
    });
    return Array.from(teamMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [scores]);

  // Группировка по раундам для chart variant
  const scoresByRound = useMemo(() => {
    const grouped = new Map<number, ScoreResponse[]>();
    filteredScores.forEach(score => {
      if (!grouped.has(score.roundId)) {
        grouped.set(score.roundId, []);
      }
      grouped.get(score.roundId)!.push(score);
    });
    return grouped;
  }, [filteredScores]);

  // Форматирование времени
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение цвета для баллов (зеленый для положительных, красный для отрицательных)
  const getScoreColor = (points: number): string => {
    if (points > 0) return 'score-positive';
    if (points < 0) return 'score-negative';
    return 'score-neutral';
  };

  // Рендер фильтров
  const renderFilters = () => (
    <div className="history-filters">
      {showTeamFilter && (
        <div className="filter-group">
          <label htmlFor="team-filter">Команда:</label>
          <select
            id="team-filter"
            value={selectedTeamId ?? ''}
            onChange={(e) => setSelectedTeamId(e.target.value ? parseInt(e.target.value) : null)}
            className="filter-select"
          >
            <option value="">Все команды</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
                {team.tableNumber && ` (Стол #${team.tableNumber})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {showRoundFilter && rounds.length > 0 && (
        <div className="filter-group">
          <label htmlFor="round-filter">Раунд:</label>
          <select
            id="round-filter"
            value={selectedRoundId ?? ''}
            onChange={(e) => setSelectedRoundId(e.target.value ? parseInt(e.target.value) : null)}
            className="filter-select"
          >
            <option value="">Все раунды</option>
            {rounds.map(round => (
              <option key={round.id} value={round.id}>
                {round.name} (Раунд {round.roundNumber})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="filter-group">
        <label htmlFor="sort-order">Порядок:</label>
        <select
          id="sort-order"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="filter-select"
        >
          <option value="desc">Сначала новые</option>
          <option value="asc">Сначала старые</option>
        </select>
      </div>
    </div>
  );

  // Timeline вариант
  if (variant === 'timeline') {
    return (
      <div className={`score-history-panel score-history-panel--timeline ${className}`}>
        <div className="panel-header">
          <h3>История баллов: {gameName}</h3>
          <div className="panel-stats">
            <span>Всего записей: {scores.length}</span>
            {filteredScores.length !== scores.length && (
              <span>Показано: {filteredScores.length}</span>
            )}
          </div>
        </div>

        {(showTeamFilter || showRoundFilter) && renderFilters()}

        <div className="timeline-container">
          {filteredScores.length === 0 ? (
            <div className="empty-state">
              <p>Нет данных для отображения</p>
            </div>
          ) : (
            <div className="timeline">
              {filteredScores.map((score, _index) => (
                <div
                  key={score.id}
                  className="timeline-item"
                  onClick={() => onScoreClick?.(score)}
                >
                  <div className="timeline-marker">
                    <div className={`marker-dot ${getScoreColor(score.points)}`} />
                    <div className="marker-time">{formatTime(score.createdAt)}</div>
                  </div>

                  <div className="timeline-content">
                    <div className="score-header">
                      <span className="team-name">{score.team?.name}</span>
                      <span className="round-name">
                        {score.round?.name ?? `Раунд ${score.round?.roundNumber}`}
                      </span>
                    </div>

                    <div className="score-details">
                      <div className="score-points">
                        <span className="base-points">Баллы: {score.points}</span>
                        {score.bet && (
                          <span className="bet-info">
                            Ставка: {score.bet} ({score.betType})
                          </span>
                        )}
                        <span className={`total-points ${getScoreColor(score.totalPoints)}`}>
                          Итого: {score.totalPoints}
                        </span>
                      </div>

                      {score.notes && (
                        <div className="score-notes">
                          <span className="notes-icon">📝</span>
                          <span className="notes-text">{score.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Table вариант
  if (variant === 'table') {
    return (
      <div className={`score-history-panel score-history-panel--table ${className}`}>
        <div className="panel-header">
          <h3>История баллов: {gameName}</h3>
        </div>

        {(showTeamFilter || showRoundFilter) && renderFilters()}

        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Время</th>
                <th>Команда</th>
                <th>Раунд</th>
                <th>Баллы</th>
                <th>Ставка</th>
                <th>Итого</th>
                <th>Заметки</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.map(score => (
                <tr
                  key={score.id}
                  className="history-row"
                  onClick={() => onScoreClick?.(score)}
                >
                  <td className="time-cell">{formatTime(score.createdAt)}</td>
                  <td className="team-cell">
                    <div className="team-info">
                      <span className="team-name">{score.team?.name}</span>
                      {score.team?.tableNumber && (
                        <span className="table-number">#{score.team.tableNumber}</span>
                      )}
                    </div>
                  </td>
                  <td className="round-cell">
                    {score.round?.name || `Раунд ${score.round?.roundNumber}`}
                  </td>
                  <td className={`points-cell ${getScoreColor(score.points)}`}>
                    {score.points}
                  </td>
                  <td className="bet-cell">
                    {score.bet ? (
                      <span className="bet-display">
                        {score.bet} ({score.betType})
                      </span>
                    ) : (
                      <span className="no-bet">—</span>
                    )}
                  </td>
                  <td className={`total-cell ${getScoreColor(score.totalPoints)}`}>
                    <strong>{score.totalPoints}</strong>
                  </td>
                  <td className="notes-cell">
                    {score.notes ? (
                      <span className="notes-preview" title={score.notes}>
                        {score.notes.length > 30 ? `${score.notes.substring(0, 30)}...` : score.notes}
                      </span>
                    ) : (
                      <span className="no-notes">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Chart вариант (группировка по раундам)
  return (
    <div className={`score-history-panel score-history-panel--chart ${className}`}>
      <div className="panel-header">
        <h3>Баллы по раундам: {gameName}</h3>
      </div>

      {(showTeamFilter || showRoundFilter) && renderFilters()}

      <div className="chart-container">
        {Array.from(scoresByRound.entries()).map(([roundId, roundScores]) => {
          const round = rounds.find(r => r.id === roundId);
          const totalPoints = roundScores.reduce((sum, score) => sum + score.totalPoints, 0);
          const averagePoints = totalPoints / roundScores.length;

          return (
            <div key={roundId} className="round-chart-section">
              <div className="round-header">
                <h4 className="round-name">
                  {round?.name || `Раунд ${round?.roundNumber || roundId}`}
                </h4>
                <div className="round-stats">
                  <span>Команд: {roundScores.length}</span>
                  <span>Общие баллы: {totalPoints}</span>
                  <span>Средний балл: {averagePoints.toFixed(1)}</span>
                </div>
              </div>

              <div className="scores-grid">
                {roundScores
                  .sort((a, b) => b.totalPoints - a.totalPoints)
                  .map(score => (
                    <div
                      key={score.id}
                      className="score-card"
                      onClick={() => onScoreClick?.(score)}
                    >
                      <div className="score-team">{score.team?.name}</div>
                      <div className={`score-value ${getScoreColor(score.totalPoints)}`}>
                        {score.totalPoints}
                      </div>
                      {score.bet && (
                        <div className="score-bet">
                          {score.points} × {score.bet}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
