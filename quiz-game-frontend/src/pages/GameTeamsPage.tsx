import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateTeamModal } from '../components/CreateTeamModal';
import { EditTeamModal } from '../components/EditTeamModal';
import { TeamCard } from '../components/TeamCard';
import { TeamSelector } from '../components/TeamSelector';
import { useAuth } from '../hooks/useAuth';
import { gameService } from '../services/game.service';
import { teamService } from '../services/team.service';
import { Game, Team } from '../types/team.types';

interface GameTeamsPageProps {}

export function GameTeamsPage({}: GameTeamsPageProps) {
  const { id: gameId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddTeams, setShowAddTeams] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Загрузка данных игры и команд
  useEffect(() => {
    if (gameId) {
      loadGameData();
    }
  }, [gameId]);

  const loadGameData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем данные игры
      const gameData = await gameService.getGameById(gameId!);
      setGame(gameData);

      // Загружаем команды игры
      const gameTeams = await gameService.getGameTeams(gameId!);
      setTeams(gameTeams);

      // Загружаем доступные команды организации
      if (user?.organizationId) {
        const orgTeams = await teamService.getTeamsByOrganization(user.organizationId);
        setAvailableTeams(orgTeams);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeams = async (teamIds: string[]) => {
    try {
      await gameService.addTeamsToGame(gameId!, teamIds);
      await loadGameData(); // Перезагружаем данные
      setShowAddTeams(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления команд');
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    if (!confirm('Удалить команду из игры?')) {
      return;
    }

    try {
      await gameService.removeTeamsFromGame(gameId!, [teamId]);
      await loadGameData(); // Перезагружаем данные
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления команды');
    }
  };

  const handleCreateTeam = async () => {
    setShowCreateTeam(false);
    await loadGameData(); // Перезагружаем данные
  };

  const handleEditTeam = async () => {
    setEditingTeam(null);
    await loadGameData(); // Перезагружаем данные
  };

  const getAvailableTeamsForSelection = () => {
    const gameTeamIds = teams.map(team => team.id);
    return availableTeams.filter(team => !gameTeamIds.includes(team.id));
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page__header">
          <h1>Управление командами</h1>
        </div>
        <div className="page__content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page__header">
          <h1>Управление командами</h1>
        </div>
        <div className="page__content">
          <div className="alert alert--error">
            <i className="icon icon--warning"></i>
            <span>{error}</span>
          </div>
          <button className="btn btn--primary" onClick={loadGameData}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="page">
        <div className="page__header">
          <h1>Игра не найдена</h1>
        </div>
        <div className="page__content">
          <p>Игра с указанным ID не найдена.</p>
          <button className="btn btn--primary" onClick={() => navigate('/games')}>
            Вернуться к списку игр
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <div className="page__header-content">
          <div className="page__title">
            <h1>Управление командами</h1>
            <p className="page__subtitle">{game.name}</p>
          </div>
          <div className="page__actions">
            <button
              className="btn btn--secondary"
              onClick={() => navigate(`/games/${gameId}`)}
            >
              <i className="icon icon--arrow-left"></i>
              К игре
            </button>
            <button
              className="btn btn--primary"
              onClick={() => setShowAddTeams(true)}
              disabled={getAvailableTeamsForSelection().length === 0}
            >
              <i className="icon icon--plus"></i>
              Добавить команды
            </button>
            <button
              className="btn btn--primary"
              onClick={() => setShowCreateTeam(true)}
            >
              <i className="icon icon--plus"></i>
              Создать команду
            </button>
          </div>
        </div>
      </div>

      <div className="page__content">
        {/* Статистика игры */}
        <div className="game-stats">
          <div className="game-stats__item">
            <span className="game-stats__label">Команд в игре:</span>
            <span className="game-stats__value">{teams.length}</span>
          </div>
          <div className="game-stats__item">
            <span className="game-stats__label">Максимум команд:</span>
            <span className="game-stats__value">{game.settings?.maxTeams || 'Не ограничено'}</span>
          </div>
          <div className="game-stats__item">
            <span className="game-stats__label">Статус игры:</span>
            <span className={`game-stats__value game-stats__value--${game.status}`}>
              {game.status === 'scheduled' ? 'Запланирована' :
               game.status === 'active' ? 'Активна' :
               game.status === 'completed' ? 'Завершена' : 'Отменена'}
            </span>
          </div>
        </div>

        {/* Список команд */}
        <div className="teams-section">
          <div className="teams-section__header">
            <h2>Команды в игре ({teams.length})</h2>
            {teams.length === 0 && (
              <p className="teams-section__empty-text">
                В игре пока нет команд. Добавьте команды, чтобы начать игру.
              </p>
            )}
          </div>

          {teams.length > 0 ? (
            <div className="teams-grid">
              {teams.map(team => (
                <div key={team.id} className="team-card-wrapper">
                  <TeamCard
                    team={team}
                    showActions={true}
                    onEdit={() => setEditingTeam(team)}
                    onRemove={() => handleRemoveTeam(team.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="teams-empty">
              <div className="teams-empty__content">
                <i className="icon icon--users teams-empty__icon"></i>
                <h3>Нет команд в игре</h3>
                <p>Добавьте команды, чтобы начать игру</p>
                <div className="teams-empty__actions">
                  <button
                    className="btn btn--primary"
                    onClick={() => setShowAddTeams(true)}
                    disabled={getAvailableTeamsForSelection().length === 0}
                  >
                    <i className="icon icon--plus"></i>
                    Добавить существующие команды
                  </button>
                  <button
                    className="btn btn--secondary"
                    onClick={() => setShowCreateTeam(true)}
                  >
                    <i className="icon icon--plus"></i>
                    Создать новую команду
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Доступные команды */}
        {getAvailableTeamsForSelection().length > 0 && (
          <div className="available-teams-section">
            <div className="available-teams-section__header">
              <h2>Доступные команды ({getAvailableTeamsForSelection().length})</h2>
              <p>Команды, которые можно добавить в игру</p>
            </div>
            <div className="available-teams-grid">
              {getAvailableTeamsForSelection().slice(0, 6).map(team => (
                <div key={team.id} className="team-card-wrapper team-card-wrapper--available">
                  <TeamCard
                    team={team}
                    showActions={false}
                    compact={true}
                  />
                </div>
              ))}
            </div>
            {getAvailableTeamsForSelection().length > 6 && (
              <div className="available-teams-section__more">
                <p>И еще {getAvailableTeamsForSelection().length - 6} команд...</p>
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={() => setShowAddTeams(true)}
                >
                  Показать все
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальные окна */}
      {showAddTeams && (
        <div className="modal-overlay" onClick={() => setShowAddTeams(false)}>
          <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Добавить команды в игру</h2>
              <button
                className="modal__close"
                onClick={() => setShowAddTeams(false)}
              >
                <i className="icon icon--close"></i>
              </button>
            </div>
            <div className="modal__body">
              <TeamSelector
                selectedTeamIds={teams.map(team => team.id)}
                onSelectionChange={handleAddTeams}
                maxTeams={game.settings?.maxTeams || 20}
                organizationId={user?.organizationId || 0}
                showSearch={true}
                showFilters={true}
                compact={false}
                className="modal-team-selector"
              />
            </div>
          </div>
        </div>
      )}

      {showCreateTeam && (
        <CreateTeamModal
          isOpen={showCreateTeam}
          onClose={() => setShowCreateTeam(false)}
          onSuccess={handleCreateTeam}
        />
      )}

      {editingTeam && (
        <EditTeamModal
          isOpen={!!editingTeam}
          onClose={() => setEditingTeam(null)}
          onSuccess={handleEditTeam}
          team={editingTeam}
        />
      )}
    </div>
  );
}
