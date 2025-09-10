import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreateGameModal } from '../components/CreateGameModal';
import { EditGameModal } from '../components/EditGameModal';
import { GameFiltersComponent } from '../components/GameFilters';
import { GameList } from '../components/GameList';
import { Pagination } from '../components/Pagination';
import { useGames } from '../hooks/useGames';
import { Game } from '../types/game.types';

export function GamesPage() {
  const navigate = useNavigate();
  const {
    games,
    loading,
    error,
    pagination,
    filters,
    stats,
    setFilters,
    refreshGames,
    clearError
  } = useGames();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleLimitChange = (limit: number) => {
    setFilters({ limit, page: 1 });
  };

  const handleEdit = (game: Game) => {
    setSelectedGame(game);
    setShowEditModal(true);
  };

  const handleDelete = async (game: Game) => {
    if (!window.confirm(`Вы уверены, что хотите удалить игру "${game.name}"?`)) {
      return;
    }

    setActionLoading(game.id);
    try {
      // TODO: Вызвать API для удаления игры
      console.log('Delete game:', game);
      await refreshGames();
    } catch (error) {
      console.error('Ошибка удаления игры:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleManageTeams = (game: Game) => {
    navigate(`/games/${game.id}/teams`);
  };

  const handleStart = async (game: Game) => {
    setActionLoading(game.id);
    try {
      // TODO: Вызвать API для запуска игры
      console.log('Start game:', game);
      await refreshGames();
    } catch (error) {
      console.error('Ошибка запуска игры:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStop = async (game: Game) => {
    if (!window.confirm(`Вы уверены, что хотите завершить игру "${game.name}"?`)) {
      return;
    }

    setActionLoading(game.id);
    try {
      // TODO: Вызвать API для остановки игры
      console.log('Stop game:', game);
      await refreshGames();
    } catch (error) {
      console.error('Ошибка остановки игры:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (game: Game) => {
    setActionLoading(game.id);
    try {
      // TODO: Вызвать API для приостановки игры
      console.log('Pause game:', game);
      await refreshGames();
    } catch (error) {
      console.error('Ошибка приостановки игры:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (game: Game) => {
    setActionLoading(game.id);
    try {
      // TODO: Вызвать API для возобновления игры
      console.log('Resume game:', game);
      await refreshGames();
    } catch (error) {
      console.error('Ошибка возобновления игры:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateGame = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    // Обновляем список игр после успешного создания
    refreshGames();
  };

  const handleEditSuccess = () => {
    // Обновляем список игр после успешного редактирования
    refreshGames();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedGame(null);
  };

  if (error) {
    return (
      <div className="games-page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Ошибка загрузки игр</h3>
          <p>{error}</p>
          <button onClick={clearError} className="retry-btn">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="games-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Игры</h1>
          <div className="header-actions">
            <button
              onClick={handleCreateGame}
              className="create-btn"
              disabled={loading}
            >
              ➕ Создать игру
            </button>
          </div>
        </div>

        {stats && (
          <div className="stats-overview">
            <div className="stat-item">
              <span className="stat-number">{stats.totalGames}</span>
              <span className="stat-label">Всего игр</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.activeGames}</span>
              <span className="stat-label">Активных</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.finishedGames}</span>
              <span className="stat-label">Завершенных</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.draftGames}</span>
              <span className="stat-label">Черновиков</span>
            </div>
          </div>
        )}
      </div>

      <div className="page-content">
        <GameFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          loading={loading}
        />

        <GameList
          games={games}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStart={handleStart}
          onStop={handleStop}
          onPause={handlePause}
          onResume={handleResume}
          onManageTeams={handleManageTeams}
        />

        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            loading={loading}
          />
        )}
      </div>

      {/* Модальное окно создания игры */}
      <CreateGameModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Модальное окно редактирования игры */}
      <EditGameModal
        isOpen={showEditModal}
        game={selectedGame}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
