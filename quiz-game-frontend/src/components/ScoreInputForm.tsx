import React, { useEffect, useState } from 'react';

import { BetType, CreateScoreDto, scoreService } from '../services/score.service';
import { requiresConfirmation, validateScoreData, VALIDATION_PRESETS } from '../utils/scoreValidation';

import { BettingControls } from './BettingControls';
import { CriticalScoreAlert, ScoreValidationAlert, useValidationAlerts } from './ScoreValidationAlert';

interface ScoreInputTeam {
  id: number;
  name: string;
  tableNumber: number;
}

interface Round {
  id: number;
  name: string;
  roundNumber: number;
}

interface ScoreInputFormProps {
  gameId: number;
  team: ScoreInputTeam;
  round: Round;
  onSubmit: (scoreData: CreateScoreDto) => Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  initialData?: Partial<CreateScoreDto>;
}

export const ScoreInputForm: React.FC<ScoreInputFormProps> = ({
  gameId,
  team,
  round,
  onSubmit,
  onCancel,
  disabled = false,
  initialData
}) => {
  const [points, setPoints] = useState<number>(initialData?.points ?? 0);
  const [bet, setBet] = useState<number | undefined>(initialData?.bet);
  const [betType, setBetType] = useState<BetType>(initialData?.betType ?? 'MULTIPLIER');
  const [minBet, setMinBet] = useState<number | undefined>(initialData?.minBet);
  const [maxBet, setMaxBet] = useState<number | undefined>(initialData?.maxBet);
  const [notes, setNotes] = useState<string>(initialData?.notes ?? '');

  const [submitting, setSubmitting] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);
  // Removed unused state variables

  const { alerts, clearAlerts } = useValidationAlerts();

  // Минимальная валидация только для критических ошибок
  useEffect(() => {
    clearAlerts();
    // Показываем алерты только для серьезных ошибок ставок
    if (bet !== undefined && betType) {
      const betError = scoreService.validateBet(bet, betType, minBet, maxBet);
      if (betError) {
        alerts.push({ type: 'error', message: betError });
      }
    }
  }, [bet, betType, minBet, maxBet]);

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (points === undefined || points === null) {
      newErrors.points = 'Введите количество баллов';
    }

    const validation = validateScoreData({
      points: points ?? 0,
      bet: bet ?? undefined,
      betType: betType ?? undefined,
      minBet: minBet ?? undefined,
      maxBet: maxBet ?? undefined,
      notes: notes ?? undefined
    }, VALIDATION_PRESETS.normal);

    if (!validation.isValid) {
      validation.errors.forEach(error => {
        if (error.includes('Баллы')) {
          newErrors.points = error;
        } else if (error.includes('ставка') || error.includes('множитель') || error.includes('бонус')) {
          newErrors.bet = error;
        } else if (error.includes('заметки')) {
          newErrors.notes = error;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка критических значений
  const handleCriticalConfirm = () => {
    setShowCriticalAlert(false);
    setPendingSubmission(true);
    performSubmission();
  };

  const handleCriticalCancel = () => {
    setShowCriticalAlert(false);
    setPendingSubmission(false);
  };

  // Выполнение отправки
  const performSubmission = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const scoreData: CreateScoreDto = {
        gameId,
        teamId: team.id,
        roundId: round.id,
        points,
        bet: bet !== undefined ? bet : undefined,
        betType: betType !== undefined ? betType : undefined,
        minBet: minBet !== undefined ? minBet : undefined,
        maxBet: maxBet !== undefined ? maxBet : undefined,
        notes: notes.trim() ?? undefined
      };

      await onSubmit(scoreData);

      // Сброс формы после успешной отправки
      setPoints(0);
      setBet(undefined);
      setNotes('');
      clearAlerts();
      setErrors({});
    } catch (error) {
      console.error('Error submitting score:', error);
      setErrors({ general: 'Ошибка при сохранении баллов' });
    } finally {
      setSubmitting(false);
      setPendingSubmission(false);
    }
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || submitting) {
      return;
    }

    // Проверяем необходимость подтверждения для критических значений
    if (requiresConfirmation(points, VALIDATION_PRESETS.normal)) {
      setShowCriticalAlert(true);
      return;
    }

    // Обычная отправка
    performSubmission();
  };

  // Сброс формы
  const handleReset = () => {
    setPoints(0);
    setBet(undefined);
    setBetType('MULTIPLIER');
    setMinBet(undefined);
    setMaxBet(undefined);
    setNotes('');
    setErrors({});
  };

  // Вычисляем итоговые баллы для предпросмотра
  const totalPoints = scoreService.calculateTotalPoints(points, bet, betType);

  return (
    <div className="score-input-form">
      <div className="score-input-form__header">
        <h3>Ввод баллов</h3>
        <div className="team-info">
          <span className="team-name">{team.name}</span>
          {team.tableNumber && (
            <span className="table-number">Стол #{team.tableNumber}</span>
          )}
        </div>
        <div className="round-info">
          <span className="round-name">{round.name}</span>
          <span className="round-number">Раунд {round.roundNumber}</span>
        </div>
      </div>

      {/* Алерты валидации */}
      <ScoreValidationAlert
        alerts={alerts}
        onDismiss={(index) => {
          const newAlerts = [...alerts];
          newAlerts.splice(index, 1);
          clearAlerts();
          newAlerts.forEach(alert => alerts.push(alert));
        }}
      />

      {/* Критический алерт */}
      <CriticalScoreAlert
        points={points}
        teamName={team.name}
        onConfirm={handleCriticalConfirm}
        onCancel={handleCriticalCancel}
        isVisible={showCriticalAlert}
      />

      <form onSubmit={handleSubmit} className="score-input-form__form">
        <div className="form-section">
          <div className="form-field">
            <label htmlFor="points">Базовые баллы *</label>
            <input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              disabled={disabled || submitting}
              className={`form-input ${errors.points ? 'form-input--error' : ''}`}
              step="1"
              required
              placeholder="Введите баллы (могут быть отрицательными для штрафов)"
            />
            {errors.points && (
              <span className="form-error">{errors.points}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="notes">Заметки</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={disabled || submitting}
              className={`form-textarea ${errors.notes ? 'form-textarea--error' : ''}`}
              placeholder="Дополнительные заметки о баллах..."
              maxLength={500}
            />
            <small className="form-hint">
              {notes.length}/500 символов
            </small>
            {errors.notes && (
              <span className="form-error">{errors.notes}</span>
            )}
          </div>
        </div>

        <div className="form-section">
          <BettingControls
            bet={bet ?? undefined}
            betType={betType}
            minBet={minBet ?? undefined}
            maxBet={maxBet ?? undefined}
            points={points}
            onBetChange={setBet}
            onBetTypeChange={(betType) => setBetType(betType ?? 'MULTIPLIER')}
            onMinBetChange={setMinBet}
            onMaxBetChange={setMaxBet}
            disabled={disabled || submitting}
            error={errors.bet}
          />
        </div>

        <div className="score-input-form__actions">
          <button
            type="button"
            onClick={handleReset}
            disabled={disabled || submitting}
            className="btn btn--secondary"
          >
            Сбросить
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="btn btn--tertiary"
            >
              Отмена
            </button>
          )}

          <button
            type="submit"
            disabled={disabled || submitting || Object.keys(errors).length > 0}
            className="btn btn--primary"
          >
            {submitting ? 'Сохранение...' : 'Сохранить баллы'}
          </button>
        </div>

        <div className="score-input-form__preview">
          <div className="score-preview">
            <span className="score-preview__label">Итоговые баллы:</span>
            <span className="score-preview__value">{totalPoints}</span>
            {bet && (
              <span className="score-preview__details">
                ({points} {betType === 'MULTIPLIER' ? '×' : betType === 'BONUS' ? '+' : '→'} {bet})
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
