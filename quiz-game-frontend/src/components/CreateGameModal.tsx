import { useState, useEffect } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import { gameService } from '../services/game.service';
import { CreateGameDto, GameSettings } from '../types/game.types';
import { GameTemplate } from '../types/template.types';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  templateId: string;
  scheduledAt: string;
  settings: GameSettings;
}

interface FormErrors {
  name?: string;
  templateId?: string;
  scheduledAt?: string;
  general?: string;
}

export function CreateGameModal({ isOpen, onClose, onSuccess }: CreateGameModalProps) {
  const { templates, loading: templatesLoading, error: templatesError } = useTemplates();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    templateId: '',
    scheduledAt: '',
    settings: {
      maxTeams: 10,
      allowLateJoin: true,
      autoStart: false,
      timeLimit: 0
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);

  // Сброс формы при открытии/закрытии
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        templateId: '',
        scheduledAt: '',
        settings: {
          maxTeams: 10,
          allowLateJoin: true,
          autoStart: false,
          timeLimit: 0
        }
      });
      setErrors({});
      setSelectedTemplate(null);
    }
  }, [isOpen]);

  // Обновление настроек при выборе шаблона
  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          timeLimit: selectedTemplate.timePerQuestion * selectedTemplate.questionsPerRound * selectedTemplate.roundsCount
        }
      }));
    }
  }, [selectedTemplate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название игры обязательно';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Название должно содержать минимум 3 символа';
    }

    if (!formData.templateId) {
      newErrors.templateId = 'Выберите шаблон игры';
    }

    if (formData.scheduledAt) {
      const scheduledDate = new Date(formData.scheduledAt);
      const now = new Date();
      if (scheduledDate <= now) {
        newErrors.scheduledAt = 'Дата планирования должна быть в будущем';
      }
    }

    if (formData.settings.maxTeams && formData.settings.maxTeams < 1) {
      newErrors.general = 'Максимальное количество команд должно быть больше 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | GameSettings) => {
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

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    handleInputChange('templateId', templateId);
  };

  const handleSettingsChange = (field: keyof GameSettings, value: any) => {
    handleInputChange('settings', {
      ...formData.settings,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const createData: CreateGameDto = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        templateId: parseInt(formData.templateId),
        scheduledAt: formData.scheduledAt || undefined,
        settings: formData.settings
      };

      await gameService.createGame(createData);
      onSuccess();
      onClose();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Ошибка создания игры'
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
      <div className="modal create-game-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Создать игру</h2>
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
            <label htmlFor="game-name" className="form-label required">
              Название игры
            </label>
            <input
              id="game-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Введите название игры"
              disabled={loading}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="game-description" className="form-label">
              Описание
            </label>
            <textarea
              id="game-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="form-input"
              placeholder="Описание игры (необязательно)"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="template-select" className="form-label required">
              Шаблон игры
            </label>
            <select
              id="template-select"
              value={formData.templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className={`form-input ${errors.templateId ? 'error' : ''}`}
              disabled={loading || templatesLoading}
            >
              <option value="">Выберите шаблон</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.roundsCount} раундов, {template.questionsPerRound} вопросов)
                </option>
              ))}
            </select>
            {errors.templateId && <span className="field-error">{errors.templateId}</span>}
            {templatesError && <span className="field-error">{templatesError}</span>}
          </div>

          {selectedTemplate && (
            <div className="template-info">
              <h4>Информация о шаблоне</h4>
              <div className="template-details">
                <p><strong>Раундов:</strong> {selectedTemplate.roundsCount}</p>
                <p><strong>Вопросов в раунде:</strong> {selectedTemplate.questionsPerRound}</p>
                <p><strong>Время на вопрос:</strong> {selectedTemplate.timePerQuestion} сек</p>
                {selectedTemplate.description && (
                  <p><strong>Описание:</strong> {selectedTemplate.description}</p>
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="scheduled-date" className="form-label">
              Дата планирования
            </label>
            <input
              id="scheduled-date"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
              className={`form-input ${errors.scheduledAt ? 'error' : ''}`}
              disabled={loading}
            />
            {errors.scheduledAt && <span className="field-error">{errors.scheduledAt}</span>}
            <small className="form-hint">Оставьте пустым для немедленного запуска</small>
          </div>

          <div className="form-section">
            <h4>Настройки игры</h4>
            
            <div className="form-group">
              <label htmlFor="max-teams" className="form-label">
                Максимальное количество команд
              </label>
              <input
                id="max-teams"
                type="number"
                min="1"
                max="50"
                value={formData.settings.maxTeams || ''}
                onChange={(e) => handleSettingsChange('maxTeams', parseInt(e.target.value) || undefined)}
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.settings.allowLateJoin || false}
                  onChange={(e) => handleSettingsChange('allowLateJoin', e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-text">Разрешить присоединение после начала</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.settings.autoStart || false}
                  onChange={(e) => handleSettingsChange('autoStart', e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-text">Автоматический запуск</span>
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="time-limit" className="form-label">
                Лимит времени (минуты)
              </label>
              <input
                id="time-limit"
                type="number"
                min="0"
                value={formData.settings.timeLimit || ''}
                onChange={(e) => handleSettingsChange('timeLimit', parseInt(e.target.value) || 0)}
                className="form-input"
                disabled={loading}
              />
              <small className="form-hint">0 = без ограничений</small>
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
              disabled={loading || templatesLoading}
            >
              {loading ? 'Создание...' : 'Создать игру'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
