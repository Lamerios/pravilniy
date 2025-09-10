import { useEffect, useState } from 'react';

import { templateService } from '../services/template.service';
import { GameTemplate, UpdateTemplateDto } from '../types/template.types';

interface EditTemplateModalProps {
  isOpen: boolean;
  template: GameTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  roundsCount: number;
  maxTeams: number;
}

interface FormErrors {
  name?: string;
  roundsCount?: string;
  maxTeams?: string;
  general?: string;
}

export function EditTemplateModal({ isOpen, template, onClose, onSuccess }: EditTemplateModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    roundsCount: 3,
    maxTeams: 10,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Заполнение формы данными шаблона при открытии
  useEffect(() => {
    if (isOpen && template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        roundsCount: template.roundsCount,
        maxTeams: template.maxTeams || 10,
      });
      setErrors({});
    }
  }, [isOpen, template]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название шаблона обязательно';
    }
    if (formData.roundsCount < 1 || formData.roundsCount > 20) {
      newErrors.roundsCount = 'Количество раундов должно быть от 1 до 20';
    }
    if (formData.maxTeams < 1 || formData.maxTeams > 50) {
      newErrors.maxTeams = 'Максимальное количество команд должно быть от 1 до 50';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
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
        description: formData.description.trim() ? formData.description.trim() : undefined,
        roundsCount: formData.roundsCount,
        maxTeams: formData.maxTeams,
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
                  value={formData.roundsCount}
                  onChange={e => handleInputChange('roundsCount', parseInt(e.target.value) || 1)}
                  className={`form-input ${errors.roundsCount ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.roundsCount && <span className="field-error">{errors.roundsCount}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="edit-max-teams" className="form-label required">
                  Максимальное количество команд
                </label>
                <input
                  id="edit-max-teams"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxTeams}
                  onChange={e => handleInputChange('maxTeams', parseInt(e.target.value) || 10)}
                  className={`form-input ${errors.maxTeams ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.maxTeams && <span className="field-error">{errors.maxTeams}</span>}
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
