import { Game } from '../types/game.types';
import { GameCard } from './GameCard';

interface GameListProps {
  games: Game[];
  loading?: boolean;
  onEdit?: ((game: Game) => void) | undefined;
  onDelete?: ((game: Game) => void) | undefined;
  onStart?: ((game: Game) => void) | undefined;
  onStop?: ((game: Game) => void) | undefined;
  onPause?: ((game: Game) => void) | undefined;
  onResume?: ((game: Game) => void) | undefined;
}

export function GameList({
  games,
  loading = false,
  onEdit,
  onDelete,
  onStart,
  onStop,
  onPause,
  onResume
}: GameListProps) {
  if (loading && games.length === 0) {
    return (
      <div className="game-list">
        <div className="loading-skeleton">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="game-card-skeleton">
              <div className="skeleton-header">
                <div className="skeleton-title"></div>
                <div className="skeleton-status"></div>
              </div>
              <div className="skeleton-description"></div>
              <div className="skeleton-info">
                <div className="skeleton-row"></div>
                <div className="skeleton-row"></div>
                <div className="skeleton-row"></div>
              </div>
              <div className="skeleton-footer">
                <div className="skeleton-date"></div>
                <div className="skeleton-controls"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="game-list">
        <div className="empty-state">
          <div className="empty-icon">🎮</div>
          <h3>Игры не найдены</h3>
          <p>Попробуйте изменить фильтры или создать новую игру</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-list">
      <div className="games-grid">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onEdit={onEdit}
            onDelete={onDelete}
            onStart={onStart}
            onStop={onStop}
            onPause={onPause}
            onResume={onResume}
            loading={loading}
          />
        ))}
      </div>

      {loading && games.length > 0 && (
        <div className="loading-overlay">
          <div className="loading-spinner">Загрузка...</div>
        </div>
      )}
    </div>
  );
}
