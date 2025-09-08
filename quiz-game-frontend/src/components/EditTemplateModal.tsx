import { useEffect, useState } from 'react';

import { templateService } from '../services/template.service';
import { GameTemplate, TemplateSettings, UpdateTemplateDto } from '../types/template.types';
import { validateUpdateTemplateForm } from '../utils/validation';

interface EditTemplateModalProps {
  isOpen: boolean;
  template: GameTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  settings: TemplateSettings;
  categories: string[];
}

interface FormErrors {
  name?: string;
  'settings.roundsCount'?: string;
  'settings.questionsPerRound'?: string;
  'settings.timePerQuestion'?: string;
  general?: string;
}

export function EditTemplateModal({ isOpen, template, onClose, onSuccess }: EditTemplateModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    settings: {
      rounds: 3,
      questionsPerRound: 10,
      timePerQuestion: 30,
      difficulty: 'medium'
    },
    categories: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Заполнение формы данными шаблона при открытии
  useEffect(() => {
    if (isOpen && template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        settings: {
          rounds: template.settings.rounds,
          questionsPerRound: template.settings.questionsPerRound,
          timePerQuestion: template.settings.timePerQuestion,
          difficulty: template.settings.difficulty || 'medium'
        },
        categories: template.settings.categories || []
      });
      setErrors({});
      setNewCategory('');
    }
  }, [isOpen, template]);

  const validateForm = (): boolean => {
    const validationData = {
      name: formData.name,
      description: formData.description,
      'settings.roundsCount': formData.settings.rounds,
      'settings.questionsPerRound': formData.settings.questionsPerRound,
      'settings.timePerQuestion': formData.settings.timePerQuestion
    };

    const validation = validateUpdateTemplateForm(validationData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleInputChange = (field: keyof FormData, value: string | TemplateSettings | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Очищаем ошибку для этого поля
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSettingsChange = (field: keyof TemplateSettings, value: any) => {
    handleInputChange('settings', {
      ...formData.settings,
      [field]: value
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      handleInputChange('categories', [...formData.categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    handleInputChange('categories', formData.categories.filter(cat => cat !== categoryToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!template) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const updateData: UpdateTemplateDto = {
        name: formData.name.trim(),
        ...(formData.description.trim() && { description: formData.description.trim() }),
        settings: {
          ...formData.settings,
          ...(formData.categories.length > 0 && { categories: formData.categories })
        }
      };

      await templateService.updateTemplate(template.id, updateData);
      onSuccess();
      onClose();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Ошибка обновления шаблона'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal edit-template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Редактировать шаблон</h2>
          <button
            onClick={handleClose}
            className="modal-close"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="edit-template-name" className="form-label required">
              Название шаблона
            </label>
            <input
              id="edit-template-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Введите название шаблона"
              disabled={loading}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="edit-template-description" className="form-label">
              Описание
            </label>
            <textarea
              id="edit-template-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="form-input"
              placeholder="Описание шаблона (необязательно)"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="form-section">
            <h4>Настройки игры</h4>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-rounds-count" className="form-label required">
                  Количество раундов
                </label>
                <input
                  id="edit-rounds-count"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.settings.rounds}
                  onChange={(e) => handleSettingsChange('rounds', parseInt(e.target.value) || 1)}
                  className={`form-input ${errors['settings.roundsCount'] ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors['settings.roundsCount'] && <span className="field-error">{errors['settings.roundsCount']}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="edit-questions-per-round" className="form-label required">
                  Вопросов в раунде
                </label>
                <input
                  id="edit-questions-per-round"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.settings.questionsPerRound}
                  onChange={(e) => handleSettingsChange('questionsPerRound', parseInt(e.target.value) || 1)}
                  className={`form-input ${errors['settings.questionsPerRound'] ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors['settings.questionsPerRound'] && <span className="field-error">{errors['settings.questionsPerRound']}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-time-per-question" className="form-label required">
                  Время на вопрос (секунды)
                </label>
                <input
                  id="edit-time-per-question"
                  type="number"
                  min="10"
                  max="300"
                  value={formData.settings.timePerQuestion}
                  onChange={(e) => handleSettingsChange('timePerQuestion', parseInt(e.target.value) || 30)}
                  className={`form-input ${errors['settings.timePerQuestion'] ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors['settings.timePerQuestion'] && <span className="field-error">{errors['settings.timePerQuestion']}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="edit-difficulty" className="form-label">
                  Уровень сложности
                </label>
                <select
                  id="edit-difficulty"
                  value={formData.settings.difficulty || 'medium'}
                  onChange={(e) => handleSettingsChange('difficulty', e.target.value)}
                  className="form-input"
                  disabled={loading}
                >
                  <option value="easy">🟢 Легкий</option>
                  <option value="medium">🟡 Средний</option>
                  <option value="hard">🔴 Сложный</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Категории</label>
              <div className="categories-input">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Добавить категорию"
                  className="form-input"
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="add-category-btn"
                  disabled={loading || !newCategory.trim()}
                >
                  Добавить
                </button>
              </div>

              {formData.categories.length > 0 && (
                <div className="categories-list">
                  {formData.categories.map((category, index) => (
                    <span key={index} className="category-tag">
                      {category}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="remove-category-btn"
                        disabled={loading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="template-preview">
              <h5>Предварительный просмотр</h5>
              <div className="preview-info">
                <p><strong>Общее время игры:</strong> {Math.round((formData.settings.rounds * formData.settings.questionsPerRound * formData.settings.timePerQuestion) / 60)} минут</p>
                <p><strong>Общее количество вопросов:</strong> {formData.settings.rounds * formData.settings.questionsPerRound}</p>
              </div>
            </div>
          </div>

          {/* Информация о шаблоне */}
          <div className="form-section">
            <h4>Информация о шаблоне</h4>
            <div className="template-info">
              <p><strong>Создан:</strong> {new Date(template.createdAt).toLocaleString()}</p>
              <p><strong>Обновлен:</strong> {new Date(template.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
