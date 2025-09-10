import { GameTemplate } from '../types/template.types';

interface TemplateListProps {
  templates: GameTemplate[] | undefined;
  loading?: boolean;
  onEdit?: (template: GameTemplate) => void;
  onDelete?: (template: GameTemplate) => void;
}

export function TemplateList({
  templates,
  loading = false,
  onEdit,
  onDelete,
}: TemplateListProps) {
  console.log('TemplateList received templates:', templates);
  console.log('TemplateList templates length:', templates?.length);
  if (loading) {
    return (
      <div className="template-list loading">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="template-card skeleton">
            <div className="skeleton-header" />
            <div className="skeleton-content">
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
            </div>
            <div className="skeleton-actions" />
          </div>
        ))}
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="template-list empty">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>Шаблоны не найдены</h3>
          <p>Создайте первый шаблон игры или измените параметры поиска</p>
        </div>
      </div>
    );
  }

  return (
    <div className="template-list">
      {templates.map((template) => (
        <div key={template.id} className="template-card">
          <div className="template-header">
            <h3 className="template-name">{template.name}</h3>
            <div className="template-actions">
              <button
                onClick={() => onEdit?.(template)}
                className="action-btn edit-btn"
                title="Редактировать"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete?.(template)}
                className="action-btn delete-btn"
                title="Удалить"
              >
                🗑️
              </button>
            </div>
          </div>

          {template.description && (
            <p className="template-description">{template.description}</p>
          )}

          <div className="template-details">
            <div className="detail-item">
              <span className="detail-label">Раундов:</span>
              <span className="detail-value">{template.roundsCount}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Вопросов в раунде:</span>
              <span className="detail-value">{template.questionsPerRound}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Время на вопрос:</span>
              <span className="detail-value">{template.timePerQuestion} сек</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Общее время:</span>
              <span className="detail-value">
                {Math.round((template.roundsCount * template.questionsPerRound * template.timePerQuestion) / 60)} мин
              </span>
            </div>
          </div>

          {template.settings?.difficulty && (
            <div className="template-difficulty">
              <span className={`difficulty-badge difficulty-${template.settings.difficulty}`}>
                {template.settings.difficulty === 'easy' && '🟢 Легкий'}
                {template.settings.difficulty === 'medium' && '🟡 Средний'}
                {template.settings.difficulty === 'hard' && '🔴 Сложный'}
              </span>
            </div>
          )}

          {template.settings?.categories && template.settings.categories.length > 0 && (
            <div className="template-categories">
              <span className="categories-label">Категории:</span>
              <div className="categories-list">
                {template.settings?.categories.slice(0, 3).map((category, index) => (
                  <span key={index} className="category-tag">
                    {category}
                  </span>
                ))}
                {template.settings?.categories.length > 3 && (
                  <span className="category-tag more">
                    +{template.settings.categories.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="template-footer">
            <div className="template-dates">
              <span className="date-item">
                Создан: {new Date(template.createdAt).toLocaleDateString()}
              </span>
              {template.updatedAt !== template.createdAt && (
                <span className="date-item">
                  Обновлен: {new Date(template.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
