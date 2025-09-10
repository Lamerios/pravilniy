/**
 * Страница управления командами
 */

import { useState } from 'react';

import { CreateTeamModal } from '../components/CreateTeamModal';
import { EditTeamModal } from '../components/EditTeamModal';
import { Pagination } from '../components/Pagination';
import { TeamCard } from '../components/TeamCard';
import { TeamSearch } from '../components/TeamSearch';

export function TeamsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // TODO: Заменить на реальные данные из API
  const teams: any[] = [];
  const loading = false;
  const error = null;
  const pagination = null;

  const handleEdit = (team: any) => {
    setSelectedTeam(team);
    setShowEditModal(true);
  };

  const handleDelete = async (team: any) => {
    if (!window.confirm(`Вы уверены, что хотите удалить команду "${team.name}"?`)) {
      return;
    }

    setActionLoading(team.id);
    try {
      // TODO: Вызвать API для удаления команды
      console.log('Delete team:', team);
    } catch (error) {
      console.error('Ошибка удаления команды:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateTeam = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    // TODO: Обновить список команд
    console.log('Team created successfully');
  };

  const handleEditSuccess = () => {
    // TODO: Обновить список команд
    console.log('Team updated successfully');
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTeam(null);
  };

  if (error) {
    return (
      <div className="teams-page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Ошибка загрузки команд</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="teams-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Команды</h1>
          <div className="header-actions">
            <button
              onClick={handleCreateTeam}
              className="create-btn"
              disabled={loading}
            >
              ➕ Создать команду
            </button>
          </div>
        </div>

        <div className="stats-overview">
          <div className="stat-item">
            <span className="stat-number">{teams.length}</span>
            <span className="stat-label">Всего команд</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Активных</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Зарегистрированных</span>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="search-section">
          <TeamSearch
            onSearch={setSearchTerm}
            onFilterChange={() => {}}
            onTeamSelect={() => {}}
            selectedTeamIds={[]}
            filters={{}}
            placeholder="Поиск команд..."
            showFilters={false}
          />
        </div>

        <div className="teams-grid">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner">Загрузка команд...</div>
            </div>
          ) : teams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>Команды не найдены</h3>
              <p>Создайте первую команду или проверьте поисковый запрос</p>
              <button onClick={handleCreateTeam} className="create-first-btn">
                Создать команду
              </button>
            </div>
          ) : (
            teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onEdit={handleEdit}
                onRemove={handleDelete}
                showActions={true}
              />
            ))
          )}
        </div>

        {pagination && (
          <Pagination
            pagination={pagination}
            onPageChange={(page) => console.log('Page changed:', page)}
            onLimitChange={(limit) => console.log('Limit changed:', limit)}
            loading={loading}
          />
        )}
      </div>

      {/* Модальное окно создания команды */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Модальное окно редактирования команды */}
      <EditTeamModal
        isOpen={showEditModal}
        team={selectedTeam}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}

export default TeamsPage;
