import { useEffect, useState } from 'react';

import { templateService } from '../services/template.service';
import { CreateTemplateDto } from '../types/template.types';

interface CreateTemplateModalProps {
  isOpen: boolean;
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

export function CreateTemplateModal({ isOpen, onClose, onSuccess }: CreateTemplateModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    roundsCount: 3,
    maxTeams: 10
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Сброс формы при открытии/закрытии
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        roundsCount: 3,
        maxTeams: 10
      });
      setErrors({});
    }
  }, [isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const createData: CreateTemplateDto = {
        name: formData.name.trim(),
        ...(formData.description.trim() && { description: formData.description.trim() }),
        settings: {
          rounds: formData.roundsCount,
          questionsPerRound: 10, // Значение по умолчанию
          timePerQuestion: 30, // Значение по умолчанию
          scoringSystem: 'standard' as const,
          categories: [],
          difficulty: 'medium' as const
        },
        maxTeams: formData.maxTeams
      };

      await templateService.createTemplate(createData);
      console.log('Template created successfully, calling onSuccess...');
      onSuccess();
      console.log('onSuccess called, closing modal...');
      onClose();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Ошибка создания шаблона'
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal create-template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Создать шаблон</h2>
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
            <label htmlFor="template-name" className="form-label required">
              Название шаблона
            </label>
            <input
              id="template-name"
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
            <label htmlFor="template-description" className="form-label">
              Описание
            </label>
            <textarea
              id="template-description"
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
                <label htmlFor="rounds-count" className="form-label required">
                  Количество раундов
                </label>
                <input
                  id="rounds-count"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.roundsCount}
                  onChange={(e) => handleInputChange('roundsCount', parseInt(e.target.value) || 1)}
                  className={`form-input ${errors.roundsCount ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.roundsCount && <span className="field-error">{errors.roundsCount}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="max-teams" className="form-label required">
                  Максимальное количество команд
                </label>
                <input
                  id="max-teams"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxTeams}
                  onChange={(e) => handleInputChange('maxTeams', parseInt(e.target.value) || 10)}
                  className={`form-input ${errors.maxTeams ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.maxTeams && <span className="field-error">{errors.maxTeams}</span>}
              </div>
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
              {loading ? 'Создание...' : 'Создать шаблон'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
