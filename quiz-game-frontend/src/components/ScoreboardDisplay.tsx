import React, { useEffect, useState } from 'react';

import { ScoreResponse } from '../services/score.service';
import { GameLeaderboard } from '../types/position.types';

import { LeaderboardTable } from './LeaderboardTable';
import { ScoreHistoryPanel } from './ScoreHistoryPanel';
import { TeamScoreCard } from './TeamScoreCard';

interface Round {
  id: number;
  name: string;
  roundNumber: number;
}

interface ScoreboardDisplayProps {
  gameId: number;
  gameName: string;
  leaderboard: GameLeaderboard;
  scores: ScoreResponse[];
  rounds?: Round[];
  variant?: 'cards' | 'table' | 'mixed' | 'fullscreen';
  autoRefresh?: boolean;
  refreshInterval?: number;
  showHistory?: boolean;
  showFilters?: boolean;
  showPositions?: boolean;
  showPositionChanges?: boolean;
  animateChanges?: boolean;
  maxTeams?: number | undefined;
  onTeamClick?: ((teamId: number) => void) | undefined;
  onRefresh?: (() => void) | undefined;
  className?: string;
}

export const ScoreboardDisplay: React.FC<ScoreboardDisplayProps> = ({
  gameId,
  gameName,
  leaderboard,
  scores,
  rounds = [],
  variant = 'mixed',
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  showHistory = true,
  showFilters = true,
  showPositions = true,
  showPositionChanges = true,
  animateChanges = true,
  maxTeams,
  onTeamClick,
  onRefresh,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'leaderboard' | 'history'>('leaderboard');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Автообновление
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
      setLastUpdate(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  // Обработка полноэкранного режима
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Форматирование времени последнего обновления
  const formatLastUpdate = (): string => {
    return lastUpdate.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Получение топ команд
  const topTeams = maxTeams ?
    leaderboard.leaderboard.slice(0, maxTeams) :
    leaderboard.leaderboard;

  // Полноэкранный вариант
  if (variant === 'fullscreen' || isFullscreen) {
    return (
      <div className={`scoreboard-display scoreboard-display--fullscreen ${className}`}>
        <div className="fullscreen-header">
          <h1 className="game-title">{gameName}</h1>
          <div className="game-info">
            <span className="teams-count">Команд: {leaderboard.gameInfo.totalTeams}</span>
            <span className="rounds-count">Раундов: {leaderboard.gameInfo.totalRounds}</span>
            <span className="last-update">Обновлено: {formatLastUpdate()}</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="fullscreen-toggle"
            title="Выйти из полноэкранного режима"
          >
            ⛶
          </button>
        </div>

        <div className="fullscreen-content">
          <div className="top-teams">
            {topTeams.slice(0, 3).map((entry) => (
              <div key={entry.teamId} className={`podium-place place-${entry.position}`}>
                <div className="place-medal">
                  {entry.position === 1 && '🥇'}
                  {entry.position === 2 && '🥈'}
                  {entry.position === 3 && '🥉'}
                </div>
                <div className="place-info">
                  <div className="place-position">#{entry.position}</div>
                  <div className="place-team">{entry.teamName}</div>
                  <div className="place-points">{entry.totalPoints}</div>
                  <div className="place-stats">
                    {entry.roundsPlayed || 0} раундов | {(entry.averagePoints || 0).toFixed(1)} средний
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="other-teams">
              <LeaderboardTable
                leaderboard={leaderboard}
                variant="compact"
                maxRows={maxTeams ? Math.max(maxTeams - 3, 0) || undefined : undefined}
                showRounds={true}
                showAverage={true}
                showPositions={showPositions}
                showPositionChanges={showPositionChanges}
                animateChanges={animateChanges}
                onTeamClick={onTeamClick}
              />
          </div>
        </div>
      </div>
    );
  }

  // Карточки команд
  if (variant === 'cards') {
    return (
      <div className={`scoreboard-display scoreboard-display--cards ${className}`}>
        <div className="scoreboard-header">
          <h2>Табло: {gameName}</h2>
          <div className="header-controls">
            <button
              onClick={onRefresh}
              className="refresh-btn"
              title="Обновить данные"
            >
              🔄
            </button>
            <button
              onClick={toggleFullscreen}
              className="fullscreen-btn"
              title="Полноэкранный режим"
            >
              ⛶
            </button>
          </div>
        </div>

        <div className="teams-grid">
          {topTeams.map((entry) => {
            const teamScores = scores.filter(score => score.teamId === entry.teamId);
            return (
              <TeamScoreCard
                key={entry.teamId}
                teamId={entry.teamId}
                teamName={entry.teamName}
                tableNumber={entry.tableNumber || undefined}
                position={entry.position}
                totalPoints={entry.totalPoints}
                roundsPlayed={entry.roundsPlayed || 0}
                averagePoints={entry.averagePoints || 0}
                lastActivity={entry.lastActivity || ''}
                scores={teamScores}
                variant="default"
                showTrend={true}
                onClick={() => onTeamClick?.(entry.teamId)}
              />
            );
          })}
        </div>

        {showHistory && (
          <div className="history-section">
            <ScoreHistoryPanel
              gameId={gameId}
              gameName={gameName}
              scores={scores}
              rounds={rounds}
              variant="timeline"
              maxEntries={10}
              onScoreClick={(score) => onTeamClick?.(score.teamId)}
            />
          </div>
        )}
      </div>
    );
  }

  // Только таблица
  if (variant === 'table') {
    return (
      <div className={`scoreboard-display scoreboard-display--table ${className}`}>
        <div className="scoreboard-header">
          <h2>Лидерборд: {gameName}</h2>
          <div className="header-controls">
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setViewMode('leaderboard')}
              >
                Рейтинг
              </button>
              <button
                className={`toggle-btn ${viewMode === 'history' ? 'active' : ''}`}
                onClick={() => setViewMode('history')}
              >
                История
              </button>
            </div>
            <button onClick={onRefresh} className="refresh-btn">🔄</button>
            <button onClick={toggleFullscreen} className="fullscreen-btn">⛶</button>
          </div>
        </div>

        <div className="scoreboard-content">
          {viewMode === 'leaderboard' ? (
            <LeaderboardTable
              leaderboard={leaderboard}
              variant="default"
              maxRows={maxTeams || undefined}
              showRounds={true}
              showAverage={true}
              showActivity={true}
              showPositions={showPositions}
              showPositionChanges={showPositionChanges}
              animateChanges={animateChanges}
              onTeamClick={onTeamClick}
            />
          ) : (
            <ScoreHistoryPanel
              gameId={gameId}
              gameName={gameName}
              scores={scores}
              rounds={rounds}
              variant="table"
              showTeamFilter={showFilters}
              showRoundFilter={showFilters}
              onScoreClick={(score) => onTeamClick?.(score.teamId)}
            />
          )}
        </div>
      </div>
    );
  }

  // Смешанный вариант (default)
  return (
    <div className={`scoreboard-display scoreboard-display--mixed ${className}`}>
      <div className="scoreboard-header">
        <div className="header-title">
          <h2>{gameName}</h2>
          <div className="game-stats">
            <span>Команд: {leaderboard.gameInfo.totalTeams}</span>
            <span>Раундов: {leaderboard.gameInfo.totalRounds}</span>
            <span>Обновлено: {formatLastUpdate()}</span>
          </div>
        </div>

        <div className="header-controls">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setViewMode('leaderboard')}
            >
              📊 Рейтинг
            </button>
            <button
              className={`toggle-btn ${viewMode === 'history' ? 'active' : ''}`}
              onClick={() => setViewMode('history')}
            >
              📈 История
            </button>
          </div>

          <div className="action-controls">
            <button
              onClick={onRefresh}
              className="control-btn refresh-btn"
              title="Обновить данные"
              disabled={autoRefresh}
            >
              🔄
            </button>
            <button
              onClick={toggleFullscreen}
              className="control-btn fullscreen-btn"
              title="Полноэкранный режим"
            >
              ⛶
            </button>
          </div>
        </div>
      </div>

      <div className="scoreboard-content">
        <div className="main-content">
          {viewMode === 'leaderboard' ? (
            <div className="leaderboard-section">
              {/* Топ-3 команды в виде карточек */}
              <div className="top-teams-cards">
                {topTeams.slice(0, 3).map((entry) => {
                  const teamScores = scores.filter(score => score.teamId === entry.teamId);
                  return (
                    <TeamScoreCard
                      key={entry.teamId}
                      teamId={entry.teamId}
                      teamName={entry.teamName}
                      tableNumber={entry.tableNumber || undefined}
                      position={entry.position}
                      totalPoints={entry.totalPoints}
                      roundsPlayed={entry.roundsPlayed || 0}
                      averagePoints={entry.averagePoints || 0}
                      lastActivity={entry.lastActivity || ''}
                      scores={teamScores}
                      variant="default"
                      showTrend={true}
                      onClick={() => onTeamClick?.(entry.teamId)}
                      className={`top-team-card position-${entry.position}`}
                    />
                  );
                })}
              </div>

              {/* Остальные команды в таблице */}
              {topTeams.length > 3 && (
                <div className="remaining-teams">
                  <h3>Остальные команды</h3>
                  <LeaderboardTable
                    leaderboard={{
                      ...leaderboard,
                      leaderboard: topTeams.slice(3)
                    }}
                    variant="compact"
                    maxRows={maxTeams ? maxTeams - 3 || undefined : undefined}
                    showRounds={true}
                    showAverage={false}
                    showPositions={showPositions}
                    showPositionChanges={showPositionChanges}
                    animateChanges={animateChanges}
                    onTeamClick={onTeamClick}
                  />
                </div>
              )}
            </div>
          ) : (
            <ScoreHistoryPanel
              gameId={gameId}
              gameName={gameName}
              scores={scores}
              rounds={rounds}
              variant="timeline"
              showTeamFilter={showFilters}
              showRoundFilter={showFilters}
              maxEntries={20}
              onScoreClick={(score) => onTeamClick?.(score.teamId)}
            />
          )}
        </div>

        {/* Сайдбар с краткой информацией */}
        <div className="scoreboard-sidebar">
          <div className="sidebar-section">
            <h4>Краткий рейтинг</h4>
            <div className="mini-leaderboard">
              {topTeams.slice(0, 10).map((entry) => (
                <div
                  key={entry.teamId}
                  className="mini-team-entry"
                  onClick={() => onTeamClick?.(entry.teamId)}
                >
                  <span className="mini-position">#{entry.position}</span>
                  <span className="mini-name">{entry.teamName}</span>
                  <span className="mini-points">{entry.totalPoints}</span>
                </div>
              ))}
            </div>
          </div>

          {autoRefresh && (
            <div className="sidebar-section">
              <h4>Автообновление</h4>
              <div className="auto-refresh-info">
                <span>Каждые {refreshInterval / 1000} сек</span>
                <span>Последнее: {formatLastUpdate()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
