import { useState } from 'react';

import { CreateTemplateModal } from '../components/CreateTemplateModal';
import { EditTemplateModal } from '../components/EditTemplateModal';
import { Pagination } from '../components/Pagination';
import { TemplateFiltersComponent } from '../components/TemplateFilters';
import { TemplateList } from '../components/TemplateList';
import { useTemplates } from '../hooks/useTemplates';
import { GameTemplate } from '../types/template.types';
import { templateService } from '../services/templateService';

export function TemplatesPage() {
  const {
    templates,
    loading,
    error,
    pagination,
    filters,
    stats,
    setFilters,
    refreshTemplates,
    clearError
  } = useTemplates();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleLimitChange = (limit: number) => {
    setFilters({ limit, page: 1 });
  };

  const handleEdit = (template: GameTemplate) => {
    setSelectedTemplate(template);
    setShowEditModal(true);
  };

  const handleDelete = async (template: GameTemplate) => {
    if (window.confirm(`Вы уверены, что хотите удалить шаблон "${template.name}"?`)) {
      try {
        await templateService.deleteTemplate(template.id);
        refreshTemplates();
      } catch (error) {
        console.error('Ошибка удаления шаблона:', error);
        // TODO: Показать пользователю сообщение об ошибке
      }
    }
  };

  const handleCreateTemplate = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    // Обновляем список шаблонов после успешного создания
    console.log('handleCreateSuccess called, refreshing templates...');
    refreshTemplates();
    console.log('refreshTemplates called');
  };

  const handleEditSuccess = () => {
    // Обновляем список шаблонов после успешного редактирования
    refreshTemplates();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTemplate(null);
  };

  if (error) {
    return (
      <div className="templates-page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Ошибка загрузки шаблонов</h3>
          <p>{error}</p>
          <button onClick={clearError} className="retry-btn">
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="templates-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Шаблоны игр</h1>
          <div className="header-actions">
            <button
              onClick={handleCreateTemplate}
              className="create-btn"
              disabled={loading}
            >
              ➕ Создать шаблон
            </button>
          </div>
        </div>

        {stats && (
          <div className="stats-overview">
            <div className="stat-item">
              <span className="stat-number">{stats.totalTemplates}</span>
              <span className="stat-label">Всего шаблонов</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.publicTemplates}</span>
              <span className="stat-label">Публичных</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.privateTemplates}</span>
              <span className="stat-label">Приватных</span>
            </div>
          </div>
        )}
      </div>

      <div className="page-content">
        <TemplateFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          loading={loading}
        />

        <TemplateList
          templates={templates}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
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

      {/* Модальное окно создания шаблона */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Модальное окно редактирования шаблона */}
      <EditTemplateModal
        isOpen={showEditModal}
        template={selectedTemplate}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
