import React from 'react';

import { ScoreResponse } from '../services/score.service';

interface TeamScoreCardProps {
  teamId: number;
  teamName: string;
  tableNumber?: number | undefined;
  position: number;
  totalPoints: number;
  roundsPlayed: number;
  averagePoints: number;
  lastActivity?: string;
  scores?: ScoreResponse[];
  variant?: 'default' | 'compact' | 'detailed';
  showTrend?: boolean;
  onClick?: () => void;
  className?: string;
}

export const TeamScoreCard: React.FC<TeamScoreCardProps> = ({
  _teamId,
  teamName,
  tableNumber,
  position,
  totalPoints,
  roundsPlayed,
  averagePoints,
  lastActivity,
  scores = [],
  variant = 'default',
  showTrend = false,
  onClick,
  className = ''
}) => {
  // Определяем цвет позиции
  const getPositionColor = (pos: number): string => {
    if (pos === 1) return 'position-gold';
    if (pos === 2) return 'position-silver';
    if (pos === 3) return 'position-bronze';
    if (pos <= 5) return 'position-top';
    return 'position-default';
  };

  // Вычисляем тренд (последние 3 раунда)
  const getTrend = (): 'up' | 'down' | 'stable' => {
    if (!showTrend || scores.length < 2) return 'stable';

    const recentScores = scores.slice(-3);
    const firstScore = recentScores[0]?.totalPoints ?? 0;
    const lastScore = recentScores[recentScores.length - 1]?.totalPoints ?? 0;

    if (lastScore > firstScore) return 'up';
    if (lastScore < firstScore) return 'down';
    return 'stable';
  };

  // Форматируем время последней активности
  const formatLastActivity = (activity?: string): string => {
    if (!activity) return 'Нет данных';

    const date = new Date(activity);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Только что';
    if (diffMinutes < 60) return `${diffMinutes} мин назад`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;

    return date.toLocaleDateString();
  };

  const trend = getTrend();
  const positionColorClass = getPositionColor(position);

  if (variant === 'compact') {
    return (
    <div
      className={`team-score-card team-score-card--compact ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
        <div className={`position-badge ${positionColorClass}`}>
          #{position}
        </div>
        <div className="team-info">
          <div className="team-name">{teamName}</div>
          {tableNumber && (
            <div className="table-number">Стол {tableNumber}</div>
          )}
        </div>
        <div className="score-info">
          <div className="total-points">{totalPoints}</div>
          {showTrend && (
            <div className={`trend trend--${trend}`}>
              {trend === 'up' && '↗️'}
              {trend === 'down' && '↘️'}
              {trend === 'stable' && '→'}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
      className={`team-score-card team-score-card--detailed ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
        <div className="card-header">
          <div className={`position-badge ${positionColorClass}`}>
            #{position}
          </div>
          <div className="team-info">
            <h3 className="team-name">{teamName}</h3>
            {tableNumber && (
              <span className="table-number">Стол #{tableNumber}</span>
            )}
          </div>
          {showTrend && (
            <div className={`trend-indicator trend--${trend}`}>
              {trend === 'up' && '📈'}
              {trend === 'down' && '📉'}
              {trend === 'stable' && '📊'}
            </div>
          )}
        </div>

        <div className="card-stats">
          <div className="stat-item">
            <div className="stat-value">{totalPoints}</div>
            <div className="stat-label">Общие баллы</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{roundsPlayed}</div>
            <div className="stat-label">Раундов</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{averagePoints.toFixed(1)}</div>
            <div className="stat-label">Средний балл</div>
          </div>
        </div>

        {scores.length > 0 && (
          <div className="card-history">
            <div className="history-label">Последние раунды:</div>
            <div className="score-history">
              {scores.slice(-5).map((score, _index) => (
                <div key={score.id} className="history-item">
                  <span className="round-name">
                    {score.round?.name ?? `Р${score.round?.roundNumber}`}
                  </span>
                  <span className="round-points">{score.totalPoints}</span>
                  {score.bet && (
                    <span className="round-bet">
                      ({score.points} × {score.bet})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-footer">
          <div className="last-activity">
            Последняя активность: {formatLastActivity(lastActivity)}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`team-score-card team-score-card--default ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="card-header">
        <div className={`position-badge ${positionColorClass}`}>
          <span className="position-number">#{position}</span>
          {position <= 3 && (
            <span className="position-medal">
              {position === 1 && '🥇'}
              {position === 2 && '🥈'}
              {position === 3 && '🥉'}
            </span>
          )}
        </div>

        <div className="team-info">
          <h4 className="team-name">{teamName}</h4>
          {tableNumber && (
            <span className="table-number">Стол #{tableNumber}</span>
          )}
        </div>

        {showTrend && (
          <div className={`trend-badge trend--${trend}`}>
            {trend === 'up' && <span className="trend-icon">↗️</span>}
            {trend === 'down' && <span className="trend-icon">↘️</span>}
            {trend === 'stable' && <span className="trend-icon">→</span>}
          </div>
        )}
      </div>

      <div className="card-content">
        <div className="score-display">
          <div className="total-points">{totalPoints}</div>
          <div className="points-label">баллов</div>
        </div>

        <div className="team-stats">
          <div className="stat">
            <span className="stat-label">Раундов:</span>
            <span className="stat-value">{roundsPlayed}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Средний:</span>
            <span className="stat-value">{averagePoints.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {lastActivity && (
        <div className="card-footer">
          <div className="activity-info">
            <span className="activity-icon">🕒</span>
            <span className="activity-text">
              {formatLastActivity(lastActivity)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
