import React, { useEffect, useState } from 'react';
import { scoreService } from '../services/score.service';
import { CorrectionHistoryItem } from './ScoreCorrectionModal';

interface Score {
  id: number;
  teamName: string;
  roundName: string;
  points: number;
  totalPoints: number;
}

interface CorrectionHistory {
  id: number;
  oldPoints: number;
  newPoints: number;
  reason: string;
  correctedBy: string;
  correctedAt: string;
}

interface ScoreHistoryModalProps {
  score: Score | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ScoreHistoryModal: React.FC<ScoreHistoryModalProps> = ({
  score,
  isOpen,
  onClose
}) => {
  const [history, setHistory] = useState<CorrectionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Загрузка истории исправлений
  useEffect(() => {
    if (isOpen && score) {
      loadCorrectionHistory();
    }
  }, [isOpen, score]);

  const loadCorrectionHistory = async () => {
    if (!score) return;

    setLoading(true);
    setError('');

    try {
      const response = await scoreService.getScoreCorrectionHistory(score.id);
      setHistory(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке истории исправлений');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !score) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container score-history-modal">
        <div className="modal-header">
          <h2 className="modal-title">История исправлений</h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
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
          </div>

          {/* История исправлений */}
          <div className="history-section">
            <h3 className="section-title">
              История изменений
              {history.length > 0 && <span className="count">({history.length})</span>}
            </h3>

            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <span>Загрузка истории...</span>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
                <button
                  onClick={loadCorrectionHistory}
                  className="btn btn--link"
                >
                  Попробовать снова
                </button>
              </div>
            )}

            {!loading && !error && history.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <div className="empty-title">Исправлений не найдено</div>
                <div className="empty-description">
                  Баллы для этой команды в данном раунде ещё не исправлялись.
                </div>
              </div>
            )}

            {!loading && !error && history.length > 0 && (
              <div className="history-list">
                {history.map((correction) => (
                  <CorrectionHistoryItem
                    key={correction.id}
                    correction={correction}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={onClose}
            className="btn btn--secondary"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения сводки исправлений по игре
interface GameCorrectionsModalProps {
  gameId: number | null;
  gameName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface GameCorrection {
  id: number;
  scoreId: number;
  teamName: string;
  roundName: string;
  oldPoints: number;
  newPoints: number;
  reason: string;
  correctedBy: string;
  correctedAt: string;
}

export const GameCorrectionsModal: React.FC<GameCorrectionsModalProps> = ({
  gameId,
  gameName,
  isOpen,
  onClose
}) => {
  const [corrections, setCorrections] = useState<GameCorrection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Загрузка исправлений игры
  useEffect(() => {
    if (isOpen && gameId) {
      loadGameCorrections();
    }
  }, [isOpen, gameId, currentPage]);

  const loadGameCorrections = async () => {
    if (!gameId) return;

    setLoading(true);
    setError('');

    try {
      const response = await scoreService.getGameCorrections(gameId, {
        page: currentPage,
        limit: 10
      });

      setCorrections(response.corrections);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при загрузке исправлений игры');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!isOpen || !gameId) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container game-corrections-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            Исправления в игре "{gameName}"
          </h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            ×
          </button>
        </div>

        <div className="modal-content">
          {/* Статистика */}
          <div className="corrections-stats">
            <div className="stat-item">
              <span className="stat-value">{totalItems}</span>
              <span className="stat-label">Всего исправлений</span>
            </div>
          </div>

          {/* Список исправлений */}
          <div className="corrections-section">
            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <span>Загрузка исправлений...</span>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
                <button
                  onClick={loadGameCorrections}
                  className="btn btn--link"
                >
                  Попробовать снова
                </button>
              </div>
            )}

            {!loading && !error && corrections.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <div className="empty-title">Исправлений не найдено</div>
                <div className="empty-description">
                  В этой игре пока не было исправлений баллов.
                </div>
              </div>
            )}

            {!loading && !error && corrections.length > 0 && (
              <div className="corrections-list">
                {corrections.map((correction) => (
                  <div key={correction.id} className="game-correction-item">
                    <div className="correction-header">
                      <div className="team-round">
                        <span className="team-name">{correction.teamName}</span>
                        <span className="round-name">{correction.roundName}</span>
                      </div>
                      <div className="correction-change">
                        <span className="old-points">{correction.oldPoints}</span>
                        <span className="arrow">→</span>
                        <span className="new-points">{correction.newPoints}</span>
                        <span className={`difference ${correction.newPoints > correction.oldPoints ? 'positive' : 'negative'}`}>
                          ({correction.newPoints > correction.oldPoints ? '+' : ''}{correction.newPoints - correction.oldPoints})
                        </span>
                      </div>
                    </div>
                    <div className="correction-meta">
                      <span className="corrector">{correction.correctedBy}</span>
                      <span className="date">
                        {new Date(correction.correctedAt).toLocaleDateString('ru-RU')} в {new Date(correction.correctedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="correction-reason">
                      <strong>Причина:</strong> {correction.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="btn btn--secondary"
                >
                  ← Предыдущая
                </button>

                <span className="page-info">
                  Страница {currentPage} из {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="btn btn--secondary"
                >
                  Следующая →
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={onClose}
            className="btn btn--secondary"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
