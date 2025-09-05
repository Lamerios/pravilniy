import { Game, GameStatus } from '../types/game.types';

interface GameCardProps {
  game: Game;
  onEdit?: ((game: Game) => void) | undefined;
  onDelete?: ((game: Game) => void) | undefined;
  onStart?: ((game: Game) => void) | undefined;
  onStop?: ((game: Game) => void) | undefined;
  onPause?: ((game: Game) => void) | undefined;
  onResume?: ((game: Game) => void) | undefined;
  loading?: boolean;
}

export function GameCard({
  game,
  onEdit,
  onDelete,
  onStart,
  onStop,
  onPause,
  onResume,
  loading = false
}: GameCardProps) {
  const getStatusInfo = (status: GameStatus) => {
    const statusConfig = {
      [GameStatus.DRAFT]: { label: 'Черновик', className: 'status-draft', icon: '📝' },
      [GameStatus.WAITING]: { label: 'Ожидает', className: 'status-waiting', icon: '⏳' },
      [GameStatus.ACTIVE]: { label: 'Активная', className: 'status-active', icon: '▶️' },
      [GameStatus.PAUSED]: { label: 'Приостановлена', className: 'status-paused', icon: '⏸️' },
      [GameStatus.FINISHED]: { label: 'Завершена', className: 'status-finished', icon: '✅' },
      [GameStatus.CANCELLED]: { label: 'Отменена', className: 'status-cancelled', icon: '❌' }
    };

    return statusConfig[status] || { label: status, className: 'status-unknown', icon: '❓' };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = () => {
    if (game.startedAt && game.finishedAt) {
      const start = new Date(game.startedAt);
      const end = new Date(game.finishedAt);
      const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60); // минуты
      return `${duration} мин`;
    }
    return null;
  };

  const canEdit = game.status === GameStatus.DRAFT || game.status === GameStatus.WAITING;
  const canDelete = game.status !== GameStatus.ACTIVE;
  const canStart = game.status === GameStatus.DRAFT || game.status === GameStatus.WAITING;
  const canStop = game.status === GameStatus.ACTIVE || game.status === GameStatus.PAUSED;
  const canPause = game.status === GameStatus.ACTIVE;
  const canResume = game.status === GameStatus.PAUSED;

  const statusInfo = getStatusInfo(game.status);

  return (
    <div className={`game-card ${statusInfo.className}`}>
      <div className="game-card-header">
        <div className="game-title">
          <h3>{game.name}</h3>
          <span className={`status-badge ${statusInfo.className}`}>
            {statusInfo.icon} {statusInfo.label}
          </span>
        </div>

        <div className="game-actions">
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(game)}
              disabled={loading}
              className="action-btn edit-btn"
              title="Редактировать"
            >
              ✏️
            </button>
          )}

          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(game)}
              disabled={loading}
              className="action-btn delete-btn"
              title="Удалить"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {game.description && (
        <div className="game-description">
          <p>{game.description}</p>
        </div>
      )}

      <div className="game-info">
        <div className="info-row">
          <span className="info-label">Шаблон:</span>
          <span className="info-value">
            {game.template?.name || `ID: ${game.templateId}`}
          </span>
        </div>

        {game.scheduledAt && (
          <div className="info-row">
            <span className="info-label">Запланировано:</span>
            <span className="info-value">
              {formatDate(game.scheduledAt)}
            </span>
          </div>
        )}

        {game.startedAt && (
          <div className="info-row">
            <span className="info-label">Начато:</span>
            <span className="info-value">
              {formatDate(game.startedAt)}
            </span>
          </div>
        )}

        {game.finishedAt && (
          <div className="info-row">
            <span className="info-label">Завершено:</span>
            <span className="info-value">
              {formatDate(game.finishedAt)}
            </span>
          </div>
        )}

        {getDuration() && (
          <div className="info-row">
            <span className="info-label">Длительность:</span>
            <span className="info-value">
              {getDuration()}
            </span>
          </div>
        )}

        {game.createdBy && (
          <div className="info-row">
            <span className="info-label">Создатель:</span>
            <span className="info-value">
              {game.createdBy.username}
            </span>
          </div>
        )}
      </div>

      <div className="game-card-footer">
        <div className="game-dates">
          <span className="date-created">
            Создано: {formatDate(game.createdAt)}
          </span>
          {game.updatedAt !== game.createdAt && (
            <span className="date-updated">
              Обновлено: {formatDate(game.updatedAt)}
            </span>
          )}
        </div>

        <div className="game-controls">
          {canStart && onStart && (
            <button
              onClick={() => onStart(game)}
              disabled={loading}
              className="control-btn start-btn"
            >
              ▶️ Запустить
            </button>
          )}

          {canPause && onPause && (
            <button
              onClick={() => onPause(game)}
              disabled={loading}
              className="control-btn pause-btn"
            >
              ⏸️ Пауза
            </button>
          )}

          {canResume && onResume && (
            <button
              onClick={() => onResume(game)}
              disabled={loading}
              className="control-btn resume-btn"
            >
              ▶️ Продолжить
            </button>
          )}

          {canStop && onStop && (
            <button
              onClick={() => onStop(game)}
              disabled={loading}
              className="control-btn stop-btn"
            >
              ⏹️ Завершить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
