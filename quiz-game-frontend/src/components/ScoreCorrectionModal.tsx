import React, { useEffect, useState } from 'react';
import { scoreService } from '../services/score.service';
import { requiresConfirmation, VALIDATION_PRESETS } from '../utils/scoreValidation';
import { CriticalScoreAlert } from './ScoreValidationAlert';

interface Score {
  id: number;
  teamId: number;
  teamName: string;
  roundId: number;
  roundName: string;
  points: number;
  totalPoints: number;
  bet?: number;
  betType?: string;
  notes?: string | undefined;
  createdAt: string;
}

interface ScoreCorrectionModalProps {
  score: Score | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (correctedScore: Score) => void;
}

export const ScoreCorrectionModal: React.FC<ScoreCorrectionModalProps> = ({
  score,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [newPoints, setNewPoints] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);

  // Сброс формы при открытии/закрытии модального окна
  useEffect(() => {
    if (isOpen && score) {
      setNewPoints(score.points);
      setReason('');
      setError('');
      setShowCriticalAlert(false);
    }
  }, [isOpen, score]);

  // Обработка критических значений
  const handleCriticalConfirm = () => {
    setShowCriticalAlert(false);
    performCorrection();
  };

  const handleCriticalCancel = () => {
    setShowCriticalAlert(false);
  };

  // Выполнение исправления
  const performCorrection = async () => {
    if (!score) return;

    setLoading(true);
    setError('');

    try {
      const response = await scoreService.correctScore(score.id, {
        newPoints,
        reason: reason.trim()
      });

      onSuccess({
        ...score,
        points: response.points,
        totalPoints: response.totalPoints,
        notes: response.notes
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при исправлении баллов');
    } finally {
      setLoading(false);
    }
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!score || !reason.trim()) {
      setError('Укажите причину исправления');
      return;
    }

    // Проверяем необходимость подтверждения для критических значений
    if (requiresConfirmation(newPoints, VALIDATION_PRESETS.normal)) {
      setShowCriticalAlert(true);
      return;
    }

    // Обычное исправление
    await performCorrection();
  };

  // Вычисляем разность баллов
  const pointsDifference = score ? newPoints - score.points : 0;
  const isIncrease = pointsDifference > 0;
  const isDecrease = pointsDifference < 0;

  if (!isOpen || !score) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container score-correction-modal">
        <div className="modal-header">
          <h2 className="modal-title">Исправление баллов</h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="modal-content">
          {/* Информация о баллах */}
          <div className="score-info">
            <div className="info-row">
              <span className="label">Команда:</span>
              <span className="value">{score.teamName}</span>
            </div>
            <div className="info-row">
              <span className="label">Раунд:</span>
              <span className="value">{score.roundName}</span>
            </div>
            <div className="info-row">
              <span className="label">Текущие баллы:</span>
              <span className="value current-points">{score.points}</span>
            </div>
            {score.totalPoints !== score.points && (
              <div className="info-row">
                <span className="label">Итого с учётом ставки:</span>
                <span className="value">{score.totalPoints}</span>
              </div>
            )}
          </div>

          {/* Форма исправления */}
          <form onSubmit={handleSubmit} className="correction-form">
            <div className="form-field">
              <label htmlFor="newPoints">Новые баллы *</label>
              <input
                id="newPoints"
                type="number"
                value={newPoints}
                onChange={(e) => setNewPoints(parseInt(e.target.value) || 0)}
                disabled={loading}
                className="form-input"
                step="1"
                required
                placeholder="Введите новые баллы"
              />
            </div>

            {/* Предварительный просмотр изменений */}
            {pointsDifference !== 0 && (
              <div className={`points-preview ${isIncrease ? 'increase' : 'decrease'}`}>
                <div className="preview-header">
                  {isIncrease ? '📈 Увеличение' : '📉 Уменьшение'} на {Math.abs(pointsDifference)} баллов
                </div>
                <div className="preview-calculation">
                  {score.points} → {newPoints}
                  <span className={`difference ${isIncrease ? 'positive' : 'negative'}`}>
                    ({isIncrease ? '+' : ''}{pointsDifference})
                  </span>
                </div>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="reason">Причина исправления *</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                className="form-textarea"
                rows={3}
                required
                placeholder="Укажите причину исправления (например: ошибка подсчёта, техническая ошибка, пересмотр решения)"
                maxLength={500}
              />
              <div className="char-counter">
                {reason.length}/500
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn--secondary"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className={`btn ${pointsDifference === 0 ? 'btn--secondary' : 'btn--warning'}`}
            disabled={loading || !reason.trim() || pointsDifference === 0}
          >
            {loading ? 'Исправление...' : 'Исправить баллы'}
          </button>
        </div>

        {/* Критический алерт */}
        <CriticalScoreAlert
          points={newPoints}
          teamName={score.teamName}
          onConfirm={handleCriticalConfirm}
          onCancel={handleCriticalCancel}
          isVisible={showCriticalAlert}
        />
      </div>
    </div>
  );
};

// Компонент для отображения истории исправлений
interface CorrectionHistoryItemProps {
  correction: {
    id: number;
    oldPoints: number;
    newPoints: number;
    reason: string;
    correctedBy: string;
    correctedAt: string;
  };
}

export const CorrectionHistoryItem: React.FC<CorrectionHistoryItemProps> = ({ correction }) => {
  const pointsDifference = correction.newPoints - correction.oldPoints;
  const isIncrease = pointsDifference > 0;
  const correctionDate = new Date(correction.correctedAt);

  return (
    <div className="correction-history-item">
      <div className="correction-header">
        <div className="correction-change">
          <span className="old-points">{correction.oldPoints}</span>
          <span className="arrow">→</span>
          <span className="new-points">{correction.newPoints}</span>
          <span className={`difference ${isIncrease ? 'positive' : 'negative'}`}>
            ({isIncrease ? '+' : ''}{pointsDifference})
          </span>
        </div>
        <div className="correction-meta">
          <span className="corrector">{correction.correctedBy}</span>
          <span className="date">
            {correctionDate.toLocaleDateString('ru-RU')} в {correctionDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
      <div className="correction-reason">
        <strong>Причина:</strong> {correction.reason}
      </div>
    </div>
  );
};
