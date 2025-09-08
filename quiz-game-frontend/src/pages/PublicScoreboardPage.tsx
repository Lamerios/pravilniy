import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import AnimatedTableRow from '../components/AnimatedTableRow';
import ConnectionStatus from '../components/ConnectionStatus';
import FullscreenToggle from '../components/FullscreenToggle';
import { usePositionAnimations } from '../hooks/usePositionAnimations';
import { useWebSocket } from '../hooks/useWebSocket';
import { apiClient } from '../services/api.client';
import '../styles/position-animations.css';
import { PublicScoreboardData } from '../types/scoreboard.types';
import './PublicScoreboardPage.css';

interface PublicScoreboardPageProps {}

const PublicScoreboardPage: React.FC<PublicScoreboardPageProps> = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [scoreboardData, setScoreboardData] = useState<PublicScoreboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Загрузка данных табло
  const loadScoreboard = useCallback(async () => {
    if (!gameId) {
      setError('ID игры не указан');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/api/games/${gameId}/scoreboard`);

      if (response.data.success) {
        setScoreboardData(response.data.data);
        setLastUpdated(new Date());
      } else {
        setError(response.data.message || 'Ошибка загрузки табло');
      }
    } catch (err) {
      console.error('Failed to load scoreboard:', err);
      setError('Ошибка загрузки табло');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // WebSocket подключение с автоматическим переподключением
  const {
    connected,
    connecting,
    reconnectAttempts,
    reconnect
  } = useWebSocket({
    gameId: parseInt(gameId || '0'),
    autoConnect: !!gameId,
    reconnectAttempts: 5,
    reconnectInterval: 3000,
    onScoreUpdate: () => {
      // Обновляем данные табло при изменении баллов
      loadScoreboard();
    },
    onPositionsUpdate: () => {
      // Обновляем данные табло при изменении позиций
      loadScoreboard();
    },
    onScoreboardUpdate: (data) => {
      // Прямое обновление табло
      if (data.gameId === parseInt(gameId || '0')) {
        setScoreboardData(prev => ({
          ...prev!,
          leaderboard: data.leaderboard,
          lastUpdated: data.lastUpdated
        }));
        setLastUpdated(new Date());
      }
    }
  });

  // Анимации изменения позиций
  const {
    animatedLeaderboard,
    isAnimating,
    getAnimationClass,
    getPositionChangeClass
  } = usePositionAnimations({
    leaderboard: scoreboardData?.leaderboard || [],
    animateChanges: true,
    animationDuration: 1000
  });

  // Загрузка данных при монтировании
  useEffect(() => {
    loadScoreboard();
  }, [loadScoreboard]);

  // Автообновление каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      if (!connected) {
        loadScoreboard();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [connected, loadScoreboard]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'FINISHED': return 'status-finished';
      case 'WAITING': return 'status-waiting';
      default: return 'status-unknown';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Игра идет';
      case 'FINISHED': return 'Игра завершена';
      case 'WAITING': return 'Ожидание начала';
      default: return status;
    }
  };


  if (loading) {
    return (
      <div className="public-scoreboard-page">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Загрузка табло...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-scoreboard-page">
        <div className="error-container">
          <h2>Ошибка загрузки табло</h2>
          <p>{error}</p>
          <button onClick={loadScoreboard} className="retry-button">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!scoreboardData) {
    return (
      <div className="public-scoreboard-page">
        <div className="error-container">
          <h2>Табло не найдено</h2>
          <p>Игра с указанным ID не найдена</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-scoreboard-page">
      <FullscreenToggle />
      <div className="scoreboard-header">
        <h1 className="game-title">{scoreboardData.gameName}</h1>
        <div className="game-info">
          <div className={`game-status ${getStatusColor(scoreboardData.gameStatus)}`}>
            {getStatusText(scoreboardData.gameStatus)}
          </div>
          <div className="game-stats">
            <span>Раундов: {scoreboardData.totalRounds}</span>
            <span>Команд: {scoreboardData.totalTeams}</span>
          </div>
        </div>
        <div className="connection-status">
          <ConnectionStatus
            connected={connected}
            connecting={connecting}
            reconnectAttempts={reconnectAttempts}
            maxReconnectAttempts={5}
            onReconnect={reconnect}
          />
          {lastUpdated && (
            <div className="last-updated">
              Обновлено: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <div className="scoreboard-content">
        <div className="leaderboard-table">
          <div className="table-header">
            <div className="header-cell position">Место</div>
            <div className="header-cell team">Команда</div>
            <div className="header-cell table">Стол</div>
            <div className="header-cell points">Баллы</div>
            <div className="header-cell change">Изменение</div>
          </div>

          <div className="table-body">
            {animatedLeaderboard.map((team, index) => (
              <AnimatedTableRow
                key={team.teamId}
                team={team}
                index={index}
                isAnimating={isAnimating}
                animationClass={getAnimationClass(team.teamId)}
                positionChangeClass={getPositionChangeClass(team.teamId)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="scoreboard-footer">
        <div className="refresh-info">
          <p>Табло обновляется автоматически</p>
          <p>При проблемах с подключением данные обновляются каждые 30 секунд</p>
        </div>
      </div>
    </div>
  );
};

export default PublicScoreboardPage;
