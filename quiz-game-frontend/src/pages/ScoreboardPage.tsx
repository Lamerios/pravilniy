import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScoreboardDisplay } from '../components/ScoreboardDisplay';
import { useScores } from '../hooks/useScores';

interface Game {
  id: number;
  name: string;
  status: string;
}

interface Round {
  id: number;
  name: string;
  roundNumber: number;
}

export const ScoreboardPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [variant, setVariant] = useState<'cards' | 'table' | 'mixed' | 'fullscreen'>('mixed');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [maxTeams, setMaxTeams] = useState<number | undefined>(undefined);

  const gameIdNumber = gameId ? parseInt(gameId) : 0;

  const {
    scores,
    leaderboard,
    loading,
    error,
    loadScores,
    loadLeaderboard,
    refresh
  } = useScores({
    gameId: gameIdNumber,
    autoLoad: true
  });

  // Загрузка данных игры и раундов
  useEffect(() => {
    const loadGameData = async () => {
      if (!gameIdNumber) return;

      try {
        // Заглушки для данных игры и раундов
        const mockGame: Game = {
          id: gameIdNumber,
          name: `Игра ${gameIdNumber}`,
          status: 'active'
        };

        const mockRounds: Round[] = [
          { id: 1, name: 'Разминка', roundNumber: 1 },
          { id: 2, name: 'Основной раунд', roundNumber: 2 },
          { id: 3, name: 'Финал', roundNumber: 3 }
        ];

        setGame(mockGame);
        setRounds(mockRounds);
      } catch (error) {
        console.error('Error loading game data:', error);
      }
    };

    loadGameData();
  }, [gameIdNumber]);

  // Загрузка баллов при монтировании
  useEffect(() => {
    if (gameIdNumber) {
      Promise.all([
        loadScores(),
        loadLeaderboard()
      ]);
    }
  }, [gameIdNumber, loadScores, loadLeaderboard]);

  // Обработка клика по команде
  const handleTeamClick = (teamId: number) => {
    console.log('Team clicked:', teamId);
    // TODO: Можно открыть модальное окно с подробной информацией о команде
  };

  // Обновление данных
  const handleRefresh = async () => {
    await refresh();
  };

  // Экспорт данных
  const handleExport = () => {
    if (!leaderboard) return;

    const csvData = [
      ['Позиция', 'Команда', 'Стол', 'Общие баллы', 'Раундов', 'Средний балл', 'Последняя активность'],
      ...leaderboard.leaderboard.map(entry => [
        entry.position,
        entry.teamName,
        entry.tableNumber || '',
        entry.totalPoints,
        entry.roundsPlayed,
        (entry.averagePoints || 0).toFixed(1),
        new Date(entry.lastActivity || '').toLocaleString('ru-RU')
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leaderboard_${game?.name || 'game'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !leaderboard) {
    return (
      <div className="scoreboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка табло...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scoreboard-page">
        <div className="error-container">
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/games')} className="btn btn--primary">
            Вернуться к играм
          </button>
        </div>
      </div>
    );
  }

  if (!leaderboard || !game) {
    return (
      <div className="scoreboard-page">
        <div className="no-data-container">
          <h2>Нет данных</h2>
          <p>Табло недоступно для этой игры</p>
          <button onClick={() => navigate('/games')} className="btn btn--primary">
            Вернуться к играм
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scoreboard-page">
      {/* Панель управления */}
      <div className="scoreboard-controls">
        <div className="controls-left">
          <button
            onClick={() => navigate(`/games/${gameId}`)}
            className="btn btn--secondary"
          >
            ← Вернуться к игре
          </button>

          <button
            onClick={() => navigate(`/games/${gameId}/scores`)}
            className="btn btn--secondary"
          >
            ✏️ Ввод баллов
          </button>
        </div>

        <div className="controls-center">
          <div className="view-selector">
            <label>Вид:</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as any)}
              className="form-select"
            >
              <option value="mixed">Смешанный</option>
              <option value="cards">Карточки</option>
              <option value="table">Таблица</option>
              <option value="fullscreen">Полный экран</option>
            </select>
          </div>

          <div className="teams-limit">
            <label>Показать команд:</label>
            <select
              value={maxTeams || 'all'}
              onChange={(e) => setMaxTeams(e.target.value === 'all' ? undefined : parseInt(e.target.value))}
              className="form-select"
            >
              <option value="all">Все</option>
              <option value="5">Топ 5</option>
              <option value="10">Топ 10</option>
              <option value="15">Топ 15</option>
              <option value="20">Топ 20</option>
            </select>
          </div>

          <div className="auto-refresh-control">
            <label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Автообновление
            </label>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                className="form-select form-select--small"
              >
                <option value="10000">10 сек</option>
                <option value="30000">30 сек</option>
                <option value="60000">1 мин</option>
                <option value="300000">5 мин</option>
              </select>
            )}
          </div>
        </div>

        <div className="controls-right">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn--secondary"
            title="Обновить данные"
          >
            {loading ? '⏳' : '🔄'} Обновить
          </button>

          <button
            onClick={handleExport}
            className="btn btn--secondary"
            title="Экспорт в CSV"
          >
            📊 Экспорт
          </button>
        </div>
      </div>

      {/* Главное табло */}
      <div className="scoreboard-main">
        <ScoreboardDisplay
          gameId={gameIdNumber}
          gameName={game.name}
          leaderboard={leaderboard}
          scores={scores}
          rounds={rounds}
          variant={variant}
          autoRefresh={autoRefresh}
          refreshInterval={refreshInterval}
          showHistory={variant !== 'fullscreen'}
          showFilters={variant === 'table' || variant === 'mixed'}
          maxTeams={maxTeams || undefined}
          onTeamClick={handleTeamClick}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Статистика внизу страницы */}
      {variant !== 'fullscreen' && (
        <div className="scoreboard-footer">
          <div className="footer-stats">
            <div className="stat-item">
              <span className="stat-label">Всего команд:</span>
              <span className="stat-value">{leaderboard.gameInfo.totalTeams}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Раундов проведено:</span>
              <span className="stat-value">{leaderboard.gameInfo.totalRounds}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Записей о баллах:</span>
              <span className="stat-value">{scores.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Последнее обновление:</span>
              <span className="stat-value">
                {new Date().toLocaleTimeString('ru-RU')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
