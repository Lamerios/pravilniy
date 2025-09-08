import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BulkScoreInput } from '../components/BulkScoreInput';
import { ScoreCorrectionModal } from '../components/ScoreCorrectionModal';
import { GameCorrectionsModal, ScoreHistoryModal } from '../components/ScoreHistoryModal';
import { ScoreInputForm } from '../components/ScoreInputForm';
import { useScores } from '../hooks/useScores';
// import { useGames } from '../hooks/useGames';
// import { useTeams } from '../hooks/useTeams';
import { BulkScoreDto, CreateScoreDto } from '../services/score.service';

interface Round {
  id: number;
  name: string;
  roundNumber: number;
  status: string;
}

interface Team {
  id: number;
  name: string;
  tableNumber?: number | undefined;
}

interface Game {
  id: number;
  name: string;
  status: string;
}

export const ScoreInputPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [inputMode, setInputMode] = useState<'single' | 'bulk'>('bulk');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loadingRounds, setLoadingRounds] = useState(false);

  const gameIdNumber = gameId ? parseInt(gameId) : 0;

  // Заглушки для данных - будут заменены на реальные хуки позже
  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameLoading, setGameLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [gameError, setGameError] = useState<string | null>(null);

  const {
    scores,
    leaderboard,
    loading: scoresLoading,
    createScore,
    bulkCreateScores,
    loadRoundScores,
    loadLeaderboard,
    refresh: refreshScores
  } = useScores({
    gameId: gameIdNumber,
    autoLoad: false
  });

  // Состояния для модальных окон исправлений
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [gameCorrectionsModalOpen, setGameCorrectionsModalOpen] = useState(false);
  const [selectedScoreForCorrection, setSelectedScoreForCorrection] = useState<any>(null);

  // Загрузка данных игры, команд и раундов
  useEffect(() => {
    const loadData = async () => {
      if (!gameIdNumber) return;

      setGameLoading(true);
      setTeamsLoading(true);
      setLoadingRounds(true);

      try {
        // Заглушки для данных
        const mockGame: Game = {
          id: gameIdNumber,
          name: `Игра ${gameIdNumber}`,
          status: 'active'
        };

        const mockTeams: Team[] = [
          { id: 1, name: 'Команда 1', tableNumber: 1 },
          { id: 2, name: 'Команда 2', tableNumber: 2 },
          { id: 3, name: 'Команда 3', tableNumber: 3 }
        ];

        const mockRounds: Round[] = [
          { id: 1, name: 'Разминка', roundNumber: 1, status: 'completed' },
          { id: 2, name: 'Основной раунд', roundNumber: 2, status: 'active' },
          { id: 3, name: 'Финал', roundNumber: 3, status: 'pending' }
        ];

        setGame(mockGame);
        setTeams(mockTeams);
        setRounds(mockRounds);

        // Выбираем активный раунд по умолчанию
        const activeRound = mockRounds.find(r => r.status === 'active') || mockRounds[0];
        if (activeRound) {
          setSelectedRound(activeRound);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setGameError('Ошибка загрузки данных');
      } finally {
        setGameLoading(false);
        setTeamsLoading(false);
        setLoadingRounds(false);
      }
    };

    loadData();
  }, [gameIdNumber]);

  // Загрузка баллов раунда при смене раунда
  useEffect(() => {
    if (selectedRound) {
      loadRoundScores(selectedRound.id);
    }
  }, [selectedRound, loadRoundScores]);

  // Загрузка лидерборда
  useEffect(() => {
    if (gameIdNumber) {
      loadLeaderboard();
    }
  }, [gameIdNumber, loadLeaderboard]);

  // Обработка создания одиночной записи о баллах
  const handleCreateScore = async (scoreData: CreateScoreDto) => {
    const result = await createScore(scoreData);
    if (result) {
      // Обновляем данные
      await Promise.all([
        selectedRound ? loadRoundScores(selectedRound.id) : Promise.resolve(),
        loadLeaderboard()
      ]);

      // Сбрасываем выбранную команду
      setSelectedTeam(null);
    }
  };

  // Обработчики модальных окон исправлений
  const handleCorrectScore = (score: any) => {
    setSelectedScoreForCorrection(score);
    setCorrectionModalOpen(true);
  };

  const handleViewHistory = (score: any) => {
    setSelectedScoreForCorrection(score);
    setHistoryModalOpen(true);
  };

  const handleViewGameCorrections = () => {
    setGameCorrectionsModalOpen(true);
  };

  const handleCorrectionSuccess = (_correctedScore: any) => {
    // Обновляем данные после успешного исправления
    refreshScores();
    Promise.all([
      selectedRound ? loadRoundScores(selectedRound.id) : Promise.resolve(),
      loadLeaderboard()
    ]);
  };

  const closeCorrectionModal = () => {
    setCorrectionModalOpen(false);
    setSelectedScoreForCorrection(null);
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setSelectedScoreForCorrection(null);
  };

  const closeGameCorrectionsModal = () => {
    setGameCorrectionsModalOpen(false);
  };

  // Обработка массового создания баллов
  const handleBulkCreateScores = async (bulkData: BulkScoreDto) => {
    const result = await bulkCreateScores(bulkData);
    if (result) {
      // Обновляем данные
      await Promise.all([
        selectedRound ? loadRoundScores(selectedRound.id) : Promise.resolve(),
        loadLeaderboard()
      ]);
    }
  };

  // Получение существующих баллов для команды в раунде
  const getExistingScore = (teamId: number, roundId: number) => {
    return scores.find(score => score.teamId === teamId && score.roundId === roundId);
  };

  if (gameLoading || teamsLoading || loadingRounds) {
    return (
      <div className="score-input-page">
        <div className="loading">
          <div className="spinner" />
          <p>Загрузка данных игры...</p>
        </div>
      </div>
    );
  }

  if (gameError || !game) {
    return (
      <div className="score-input-page">
        <div className="error">
          <h2>Ошибка загрузки игры</h2>
          <p>{gameError || 'Игра не найдена'}</p>
          <button onClick={() => navigate('/games')} className="btn btn--primary">
            Вернуться к играм
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="score-input-page">
      <div className="score-input-page__header">
        <div className="page-title">
          <h1>Ввод баллов</h1>
          <div className="game-info">
            <span className="game-name">{game.name}</span>
            <span className="game-status">{game.status}</span>
          </div>
        </div>

        <div className="page-actions">
          <button
            onClick={() => navigate(`/games/${gameId}`)}
            className="btn btn--secondary"
          >
            Вернуться к игре
          </button>
        </div>
      </div>

      <div className="score-input-page__controls">
        <div className="round-selector">
          <label>Выберите раунд:</label>
          <select
            value={selectedRound?.id || ''}
            onChange={(e) => {
              const roundId = parseInt(e.target.value);
              const round = rounds.find(r => r.id === roundId);
              setSelectedRound(round || null);
            }}
            className="form-select"
          >
            <option value="">Выберите раунд</option>
            {rounds.map(round => (
              <option key={round.id} value={round.id}>
                {round.name} (Раунд {round.roundNumber}) - {round.status}
              </option>
            ))}
          </select>
        </div>

        <div className="input-mode-selector">
          <label>Режим ввода:</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                value="bulk"
                checked={inputMode === 'bulk'}
                onChange={(e) => setInputMode(e.target.value as 'single' | 'bulk')}
              />
              Массовый ввод
            </label>
            <label className="radio-option">
              <input
                type="radio"
                value="single"
                checked={inputMode === 'single'}
                onChange={(e) => setInputMode(e.target.value as 'single' | 'bulk')}
              />
              Одиночный ввод
            </label>
          </div>
        </div>
      </div>

      {selectedRound && (
        <div className="score-input-page__content">
          {inputMode === 'bulk' ? (
            <BulkScoreInput
              gameId={gameIdNumber}
              round={selectedRound}
              teams={teams.map(team => ({
                id: team.id,
                name: team.name,
                tableNumber: team.tableNumber || 0
              }))}
              onSubmit={handleBulkCreateScores}
            />
          ) : (
            <div className="single-input-mode">
              <div className="team-selector">
                <label>Выберите команду:</label>
                <select
                  value={selectedTeam?.id || ''}
                  onChange={(e) => {
                    const teamId = parseInt(e.target.value);
                    const team = teams.find(t => t.id === teamId);
                    setSelectedTeam(team || null);
                  }}
                  className="form-select"
                >
                  <option value="">Выберите команду</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                      {team.tableNumber && ` (Стол #${team.tableNumber})`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTeam && (
                <ScoreInputForm
                  gameId={gameIdNumber}
                  team={{
                    id: selectedTeam.id,
                    name: selectedTeam.name,
                    tableNumber: selectedTeam.tableNumber || 0
                  }}
                  round={selectedRound}
                  onSubmit={handleCreateScore}
                  onCancel={() => setSelectedTeam(null)}
                  initialData={getExistingScore(selectedTeam.id, selectedRound.id) as any}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Сайдбар с лидербордом */}
      <div className="score-input-page__sidebar">
        <div className="sidebar-section">
          <h3>Текущие позиции</h3>
          {scoresLoading ? (
            <div className="loading-small">Загрузка...</div>
          ) : leaderboard ? (
            <div className="leaderboard">
              {leaderboard.leaderboard.slice(0, 10).map(entry => (
                <div key={entry.teamId} className="leaderboard-entry">
                  <span className="position">#{entry.position}</span>
                  <span className="team-name">{entry.teamName}</span>
                  <span className="points">{entry.totalPoints}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>Нет данных</p>
          )}
        </div>

        {selectedRound && (
          <div className="sidebar-section">
            <h3>Баллы раунда</h3>
            {scoresLoading ? (
              <div className="loading-small">Загрузка...</div>
            ) : (
              <div className="round-scores">
                {scores.length > 0 ? (
                  scores.map(score => (
                    <div key={score.id} className="round-score-entry">
                      <div className="score-info">
                        <span className="team-name">{score.team?.name}</span>
                        <span className="points">{score.totalPoints}</span>
                        {score.bet && (
                          <span className="bet-info">
                            ({score.points} × {score.bet})
                          </span>
                        )}
                      </div>
                      <div className="score-actions">
                        <button
                          onClick={() => handleCorrectScore({
                            id: score.id,
                            teamId: score.teamId,
                            teamName: score.team?.name || '',
                            roundId: score.roundId,
                            roundName: selectedRound?.name || '',
                            points: score.points,
                            totalPoints: score.totalPoints,
                            bet: score.bet,
                            betType: score.betType,
                            notes: score.notes,
                            createdAt: score.createdAt
                          })}
                          className="btn btn--link btn--xs"
                          title="Исправить баллы"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleViewHistory({
                            id: score.id,
                            teamName: score.team?.name || '',
                            roundName: selectedRound?.name || '',
                            points: score.points,
                            totalPoints: score.totalPoints
                          })}
                          className="btn btn--link btn--xs"
                          title="История изменений"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Баллы не введены</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="sidebar-actions">
          <button
            onClick={refreshScores}
            disabled={scoresLoading}
            className="btn btn--secondary btn--small"
          >
            Обновить данные
          </button>

          <button
            onClick={handleViewGameCorrections}
            className="btn btn--secondary btn--small"
          >
            📝 История исправлений
          </button>
        </div>
      </div>

      {/* Модальные окна исправлений */}
      <ScoreCorrectionModal
        score={selectedScoreForCorrection}
        isOpen={correctionModalOpen}
        onClose={closeCorrectionModal}
        onSuccess={handleCorrectionSuccess}
      />

      <ScoreHistoryModal
        score={selectedScoreForCorrection}
        isOpen={historyModalOpen}
        onClose={closeHistoryModal}
      />

      <GameCorrectionsModal
        gameId={gameIdNumber}
        gameName={game?.name || 'Игра'}
        isOpen={gameCorrectionsModalOpen}
        onClose={closeGameCorrectionsModal}
      />
    </div>
  );
};
