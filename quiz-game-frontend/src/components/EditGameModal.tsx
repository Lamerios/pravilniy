import { useEffect, useState } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import { gameService } from '../services/game.service';
import { Game, GameSettings, UpdateGameDto } from '../types/game.types';
import { GameTemplate } from '../types/template.types';
import { validateUpdateGameForm } from '../utils/validation';

interface EditGameModalProps {
  isOpen: boolean;
  game: Game | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  scheduledAt: string;
  settings: GameSettings;
}

interface FormErrors {
  name?: string;
  scheduledAt?: string;
  general?: string;
}

export function EditGameModal({ isOpen, game, onClose, onSuccess }: EditGameModalProps) {
  const { templates, loading: templatesLoading } = useTemplates();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
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

  // Заполнение формы данными игры при открытии
  useEffect(() => {
    if (isOpen && game) {
      setFormData({
        name: game.name,
        description: game.description || '',
        scheduledAt: game.scheduledAt ? new Date(game.scheduledAt).toISOString().slice(0, 16) : '',
        settings: {
          maxTeams: game.settings?.maxTeams || 10,
          allowLateJoin: game.settings?.allowLateJoin ?? true,
          autoStart: game.settings?.autoStart ?? false,
          timeLimit: game.settings?.timeLimit || 0
        }
      });
      setErrors({});

      // Находим шаблон игры
      const template = templates.find(t => t.id === game.templateId);
      setSelectedTemplate(template || null);
    }
  }, [isOpen, game, templates]);

  const validateForm = (): boolean => {
    const validationData = {
      name: formData.name,
      description: formData.description,
      scheduledAt: formData.scheduledAt,
      'settings.maxTeams': formData.settings.maxTeams,
      'settings.timeLimit': formData.settings.timeLimit
    };

    const validation = validateUpdateGameForm(validationData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }

    setErrors({});
    return true;
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

  const handleSettingsChange = (field: keyof GameSettings, value: any) => {
    handleInputChange('settings', {
      ...formData.settings,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!game) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const updateData: UpdateGameDto = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        scheduledAt: formData.scheduledAt || undefined,
        settings: formData.settings
      };

      await gameService.updateGame(game.id, updateData);
      onSuccess();
      onClose();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Ошибка обновления игры'
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

  if (!isOpen || !game) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal edit-game-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Редактировать игру</h2>
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
            <label htmlFor="edit-game-name" className="form-label required">
              Название игры
            </label>
            <input
              id="edit-game-name"
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
            <label htmlFor="edit-game-description" className="form-label">
              Описание
            </label>
            <textarea
              id="edit-game-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="form-input"
              placeholder="Описание игры (необязательно)"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Информация о шаблоне (только для чтения) */}
          {selectedTemplate && (
            <div className="form-group">
              <label className="form-label">Шаблон игры</label>
              <div className="template-info-display">
                <div className="template-details">
                  <p><strong>{selectedTemplate.name}</strong></p>
                  <p><strong>Раундов:</strong> {selectedTemplate.roundsCount}</p>
                  <p><strong>Вопросов в раунде:</strong> {selectedTemplate.questionsPerRound}</p>
                  <p><strong>Время на вопрос:</strong> {selectedTemplate.timePerQuestion} сек</p>
                  {selectedTemplate.description && (
                    <p><strong>Описание:</strong> {selectedTemplate.description}</p>
                  )}
                </div>
              </div>
              <small className="form-hint">Шаблон нельзя изменить после создания игры</small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="edit-scheduled-date" className="form-label">
              Дата планирования
            </label>
            <input
              id="edit-scheduled-date"
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
              <label htmlFor="edit-max-teams" className="form-label">
                Максимальное количество команд
              </label>
              <input
                id="edit-max-teams"
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
              <label htmlFor="edit-time-limit" className="form-label">
                Лимит времени (минуты)
              </label>
              <input
                id="edit-time-limit"
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

          {/* Информация о статусе игры */}
          <div className="form-section">
            <h4>Информация об игре</h4>
            <div className="game-info">
              <p><strong>Статус:</strong> <span className={`status-badge status-${game.status.toLowerCase()}`}>{game.status}</span></p>
              <p><strong>Создана:</strong> {new Date(game.createdAt).toLocaleString()}</p>
              <p><strong>Обновлена:</strong> {new Date(game.updatedAt).toLocaleString()}</p>
              {game.startedAt && <p><strong>Запущена:</strong> {new Date(game.startedAt).toLocaleString()}</p>}
              {game.finishedAt && <p><strong>Завершена:</strong> {new Date(game.finishedAt).toLocaleString()}</p>}
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
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
