import React, { useEffect, useState } from 'react';

import { BetType, BulkScoreDto, scoreService } from '../services/score.service';

interface BulkScoreTeam {
  id: number;
  name: string;
  tableNumber: number;
}

interface Round {
  id: number;
  name: string;
  roundNumber: number;
}

interface TeamScoreData {
  teamId: number;
  points: number;
  bet?: number | undefined;
  betType?: BetType | undefined;
  minBet?: number | undefined;
  maxBet?: number | undefined;
  notes?: string | undefined;
}

interface BulkScoreInputProps {
  gameId: number;
  round: Round;
  teams: BulkScoreTeam[];
  onSubmit: (bulkData: BulkScoreDto) => Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
}

export const BulkScoreInput: React.FC<BulkScoreInputProps> = ({
  gameId,
  round,
  teams,
  onSubmit,
  onCancel,
  disabled = false
}) => {
  const [teamScores, setTeamScores] = useState<Map<number, TeamScoreData>>(new Map());
  const [globalBet, setGlobalBet] = useState<number | undefined>();
  const [globalBetType, setGlobalBetType] = useState<BetType>('MULTIPLIER');
  const [useGlobalBetting, setUseGlobalBetting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Map<number, string>>(new Map());

  // Инициализация данных команд
  useEffect(() => {
    const initialScores = new Map<number, TeamScoreData>();
    teams.forEach(team => {
      initialScores.set(team.id, {
        teamId: team.id,
        points: 0,
        betType: 'MULTIPLIER'
      });
    });
    setTeamScores(initialScores);
  }, [teams]);

  // Обновление баллов команды
  const updateTeamScore = (teamId: number, updates: Partial<TeamScoreData>) => {
    setTeamScores(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(teamId) || { teamId, points: 0 };
      newMap.set(teamId, { ...current, ...updates });
      return newMap;
    });

    // Очищаем ошибку для этой команды
    if (errors.has(teamId)) {
      setErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.delete(teamId);
        return newErrors;
      });
    }
  };

  // Применение глобальных настроек ставок
  const applyGlobalBetting = () => {
    if (!useGlobalBetting) return;

    setTeamScores(prev => {
      const newMap = new Map(prev);
      newMap.forEach((score, teamId) => {
        newMap.set(teamId, {
          ...score,
          bet: globalBet,
          betType: globalBetType
        });
      });
      return newMap;
    });
  };

  useEffect(() => {
    applyGlobalBetting();
  }, [useGlobalBetting, globalBet, globalBetType]);

  // Быстрое заполнение одинаковыми баллами
  const fillAllPoints = (points: number) => {
    setTeamScores(prev => {
      const newMap = new Map(prev);
      newMap.forEach((score, teamId) => {
        newMap.set(teamId, { ...score, points });
      });
      return newMap;
    });
  };

  // Валидация всех данных
  const validateAll = (): boolean => {
    const newErrors = new Map<number, string>();

    teamScores.forEach((score, teamId) => {
      // Валидация баллов
      if (score.points < 0) {
        newErrors.set(teamId, 'Баллы не могут быть отрицательными');
        return;
      }

      // Валидация ставки
      if (score.bet !== undefined) {
        const betError = scoreService.validateBet(score.bet, score.betType);
        if (betError) {
          newErrors.set(teamId, betError);
          return;
        }
      }
    });

    setErrors(newErrors);
    return newErrors.size === 0;
  };

  // Обработка отправки
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll() || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const scores = Array.from(teamScores.values()).map(score => ({
        teamId: score.teamId,
        points: score.points,
        bet: score.bet !== undefined ? score.bet : undefined,
        betType: score.betType !== undefined ? score.betType : undefined,
        minBet: score.minBet !== undefined ? score.minBet : undefined,
        maxBet: score.maxBet !== undefined ? score.maxBet : undefined,
        notes: score.notes?.trim() || undefined
      }));

      const bulkData: BulkScoreDto = {
        gameId,
        roundId: round.id,
        scores
      };

      await onSubmit(bulkData);
    } catch (error) {
      console.error('Error submitting bulk scores:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Подсчет общих статистик
  const totalTeams = teams.length;
  const filledTeams = Array.from(teamScores.values()).filter(score => score.points > 0).length;
  const totalPoints = Array.from(teamScores.values()).reduce((sum, score) => {
    return sum + scoreService.calculateTotalPoints(score.points, score.bet, score.betType);
  }, 0);

  return (
    <div className="bulk-score-input">
      <div className="bulk-score-input__header">
        <h3>Массовый ввод баллов</h3>
        <div className="round-info">
          <span className="round-name">{round.name}</span>
          <span className="round-number">Раунд {round.roundNumber}</span>
        </div>
        <div className="bulk-stats">
          <span>Команд: {totalTeams}</span>
          <span>Заполнено: {filledTeams}</span>
          <span>Общие баллы: {Math.round(totalPoints)}</span>
        </div>
      </div>

      <div className="bulk-score-input__controls">
        <div className="quick-fill">
          <label>Быстрое заполнение:</label>
          <div className="quick-fill__buttons">
            {[0, 5, 10, 15, 20, 25].map(points => (
              <button
                key={points}
                type="button"
                onClick={() => fillAllPoints(points)}
                disabled={disabled || submitting}
                className="btn btn--small btn--secondary"
              >
                {points}
              </button>
            ))}
          </div>
        </div>

        <div className="global-betting">
          <label>
            <input
              type="checkbox"
              checked={useGlobalBetting}
              onChange={(e) => setUseGlobalBetting(e.target.checked)}
              disabled={disabled || submitting}
            />
            Применить ставки ко всем командам
          </label>

          {useGlobalBetting && (
            <div className="global-betting__controls">
              <select
                value={globalBetType}
                onChange={(e) => setGlobalBetType(e.target.value as BetType)}
                disabled={disabled || submitting}
                className="form-select"
              >
                <option value="MULTIPLIER">Множитель</option>
                <option value="BONUS">Бонус</option>
                <option value="FIXED">Фиксированные баллы</option>
              </select>

              <input
                type="number"
                value={globalBet || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setGlobalBet(isNaN(value) ? undefined : value);
                }}
                placeholder="Значение ставки"
                disabled={disabled || submitting}
                className="form-input"
                step={globalBetType === 'MULTIPLIER' ? '0.1' : '1'}
                min={globalBetType === 'MULTIPLIER' ? '0.1' : '0'}
              />
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bulk-score-input__form">
        <div className="teams-grid">
          {teams.map(team => {
            const score = teamScores.get(team.id);
            const error = errors.get(team.id);
            const totalPoints = score ?
              scoreService.calculateTotalPoints(score.points, score.bet, score.betType) : 0;

            return (
              <div key={team.id} className="team-score-card">
                <div className="team-score-card__header">
                  <span className="team-name">{team.name}</span>
                  {team.tableNumber && (
                    <span className="table-number">#{team.tableNumber}</span>
                  )}
                </div>

                <div className="team-score-card__inputs">
                  <div className="score-input">
                    <label>Баллы</label>
                    <input
                      type="number"
                      value={score?.points || 0}
                      onChange={(e) => updateTeamScore(team.id, {
                        points: parseInt(e.target.value) || 0
                      })}
                      disabled={disabled || submitting}
                      className={`form-input ${error ? 'form-input--error' : ''}`}
                      min="0"
                    />
                  </div>

                  {!useGlobalBetting && (
                    <div className="betting-input">
                      <div className="betting-type">
                        <select
                          value={score?.betType || 'MULTIPLIER'}
                          onChange={(e) => updateTeamScore(team.id, {
                            betType: e.target.value as BetType
                          })}
                          disabled={disabled || submitting}
                          className="form-select form-select--small"
                        >
                          <option value="MULTIPLIER">×</option>
                          <option value="BONUS">+</option>
                          <option value="FIXED">→</option>
                        </select>
                      </div>

                      <input
                        type="number"
                        value={score?.bet || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          updateTeamScore(team.id, {
                            bet: isNaN(value) ? undefined : value
                          });
                        }}
                        placeholder="Ставка"
                        disabled={disabled || submitting}
                        className="form-input form-input--small"
                        step={score?.betType === 'MULTIPLIER' ? '0.1' : '1'}
                        min={score?.betType === 'MULTIPLIER' ? '0.1' : '0'}
                      />
                    </div>
                  )}

                  <div className="notes-input">
                    <textarea
                      value={score?.notes || ''}
                      onChange={(e) => updateTeamScore(team.id, {
                        notes: e.target.value
                      })}
                      placeholder="Заметки..."
                      disabled={disabled || submitting}
                      className="form-textarea form-textarea--small"
                      maxLength={200}
                    />
                  </div>
                </div>

                <div className="team-score-card__result">
                  <span className="total-points">
                    Итого: {totalPoints}
                  </span>
                  {score?.bet && (
                    <span className="calculation">
                      ({score.points} {score.betType === 'MULTIPLIER' ? '×' :
                        score.betType === 'BONUS' ? '+' : '→'} {score.bet})
                    </span>
                  )}
                </div>

                {error && (
                  <div className="team-score-card__error">
                    {error}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bulk-score-input__actions">
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
            disabled={disabled || submitting || errors.size > 0 || filledTeams === 0}
            className="btn btn--primary"
          >
            {submitting ? 'Сохранение...' : `Сохранить баллы (${filledTeams} команд)`}
          </button>
        </div>
      </form>
    </div>
  );
};
