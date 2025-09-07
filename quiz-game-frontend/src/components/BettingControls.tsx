import React from 'react';
import { BetType } from '../services/score.service';

interface BettingControlsProps {
  bet?: number | undefined;
  betType?: BetType | undefined;
  minBet?: number | undefined;
  maxBet?: number | undefined;
  points: number;
  onBetChange: (bet?: number) => void;
  onBetTypeChange: (betType?: BetType) => void;
  onMinBetChange: (minBet?: number) => void;
  onMaxBetChange: (maxBet?: number) => void;
  disabled?: boolean;
  error?: string | undefined;
}

export const BettingControls: React.FC<BettingControlsProps> = ({
  bet,
  betType = 'MULTIPLIER',
  minBet,
  maxBet,
  points,
  onBetChange,
  onBetTypeChange,
  onMinBetChange,
  onMaxBetChange,
  disabled = false,
  error
}) => {
  const calculateTotalPoints = (points: number, bet?: number, type: BetType = 'MULTIPLIER'): number => {
    if (!bet) return points;

    switch (type) {
      case 'MULTIPLIER':
        return Math.round(points * bet * 100) / 100;
      case 'BONUS':
        return points + bet;
      case 'FIXED':
        return bet;
      default:
        return points;
    }
  };

  const totalPoints = calculateTotalPoints(points, bet, betType);

  const getBetTypeDescription = (type: BetType): string => {
    switch (type) {
      case 'MULTIPLIER':
        return 'Умножить баллы на ставку';
      case 'BONUS':
        return 'Добавить ставку к баллам';
      case 'FIXED':
        return 'Ставка заменяет баллы';
      default:
        return '';
    }
  };

  const getBetPlaceholder = (type: BetType): string => {
    switch (type) {
      case 'MULTIPLIER':
        return 'Например: 1.5';
      case 'BONUS':
        return 'Например: 10';
      case 'FIXED':
        return 'Например: 25';
      default:
        return '';
    }
  };

  return (
    <div className="betting-controls">
      <div className="betting-controls__header">
        <h4>Настройка ставки</h4>
        <div className="betting-controls__toggle">
          <label>
            <input
              type="checkbox"
              checked={bet !== undefined}
              onChange={(e) => {
                if (e.target.checked) {
                  onBetChange(betType === 'MULTIPLIER' ? 1 : 0);
                } else {
                  onBetChange(undefined);
                }
              }}
              disabled={disabled}
            />
            Использовать ставку
          </label>
        </div>
      </div>

      {bet !== undefined && (
        <div className="betting-controls__content">
          <div className="betting-controls__row">
            <div className="betting-controls__field">
              <label>Тип ставки:</label>
              <select
                value={betType}
                onChange={(e) => onBetTypeChange(e.target.value as BetType)}
                disabled={disabled}
                className="betting-controls__select"
              >
                <option value="MULTIPLIER">Множитель</option>
                <option value="BONUS">Бонус</option>
                <option value="FIXED">Фиксированные баллы</option>
              </select>
              <small className="betting-controls__description">
                {getBetTypeDescription(betType)}
              </small>
            </div>

            <div className="betting-controls__field">
              <label>Значение ставки:</label>
              <input
                type="number"
                value={bet || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  onBetChange(isNaN(value) ? undefined : value);
                }}
                placeholder={getBetPlaceholder(betType)}
                disabled={disabled}
                className="betting-controls__input"
                step={betType === 'MULTIPLIER' ? '0.1' : '1'}
                min={betType === 'MULTIPLIER' ? '0.1' : '0'}
              />
            </div>
          </div>

          <div className="betting-controls__row">
            <div className="betting-controls__field">
              <label>Мин. ставка:</label>
              <input
                type="number"
                value={minBet || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  onMinBetChange(isNaN(value) ? undefined : value);
                }}
                placeholder="Не ограничена"
                disabled={disabled}
                className="betting-controls__input"
                step={betType === 'MULTIPLIER' ? '0.1' : '1'}
                min={betType === 'MULTIPLIER' ? '0.1' : '0'}
              />
            </div>

            <div className="betting-controls__field">
              <label>Макс. ставка:</label>
              <input
                type="number"
                value={maxBet || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  onMaxBetChange(isNaN(value) ? undefined : value);
                }}
                placeholder="Не ограничена"
                disabled={disabled}
                className="betting-controls__input"
                step={betType === 'MULTIPLIER' ? '0.1' : '1'}
                min={betType === 'MULTIPLIER' ? '0.1' : '0'}
              />
            </div>
          </div>

          {error && (
            <div className="betting-controls__error">
              {error}
            </div>
          )}

          <div className="betting-controls__preview">
            <div className="betting-controls__calculation">
              <div className="calculation-row">
                <span>Базовые баллы:</span>
                <span>{points}</span>
              </div>
              {bet && (
                <div className="calculation-row">
                  <span>Ставка ({betType}):</span>
                  <span>{bet}</span>
                </div>
              )}
              <div className="calculation-row calculation-row--total">
                <span>Итоговые баллы:</span>
                <span className="total-points">{totalPoints}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
