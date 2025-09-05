import React from 'react';
import { Team } from '../types/team.types';

interface TeamCardProps {
  team: Team;
  selected?: boolean;
  onSelect?: (team: Team) => void;
  onDeselect?: (team: Team) => void;
  onEdit?: (team: Team) => void;
  onRemove?: (team: Team) => void;
  showActions?: boolean;
  compact?: boolean;
}

/**
 * Компонент карточки команды
 */
export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  selected = false,
  onSelect,
  onDeselect,
  onEdit,
  onRemove,
  showActions = true,
  compact = false
}) => {
  const handleToggleSelection = () => {
    if (selected && onDeselect) {
      onDeselect(team);
    } else if (!selected && onSelect) {
      onSelect(team);
    }
  };

  const getStatusBadge = () => {
    if (team.isActive) {
      return <span className="status-badge status-active">Активна</span>;
    }
    return <span className="status-badge status-inactive">Неактивна</span>;
  };

  const getMemberCount = () => {
    return team.members?.length || 0;
  };

  if (compact) {
    return (
      <div className={`team-card team-card--compact ${selected ? 'team-card--selected' : ''}`}>
        <div className="team-card__header">
          <div className="team-card__logo">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} />
            ) : (
              <div className="team-card__logo-placeholder">
                {team.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="team-card__info">
            <h3 className="team-card__name">{team.name}</h3>
            {team.tableNumber && (
              <span className="team-card__table">Стол #{team.tableNumber}</span>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {showActions && (
          <div className="team-card__actions">
            {onSelect && onDeselect && (
              <button
                type="button"
                className={`btn btn--sm ${selected ? 'btn--secondary' : 'btn--primary'}`}
                onClick={handleToggleSelection}
              >
                {selected ? 'Убрать' : 'Выбрать'}
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => onEdit(team)}
              >
                <i className="icon icon--edit"></i>
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => onRemove(team)}
              >
                <i className="icon icon--trash"></i>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`team-card ${selected ? 'team-card--selected' : ''}`}>
      <div className="team-card__header">
        <div className="team-card__logo">
          {team.logoUrl ? (
            <img src={team.logoUrl} alt={team.name} />
          ) : (
            <div className="team-card__logo-placeholder">
              {team.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="team-card__info">
          <h3 className="team-card__name">{team.name}</h3>
          {team.description && (
            <p className="team-card__description">{team.description}</p>
          )}
          <div className="team-card__meta">
            {team.tableNumber && (
              <span className="team-card__table">Стол #{team.tableNumber}</span>
            )}
            <span className="team-card__members">
              {getMemberCount()} участников
            </span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {team.members && team.members.length > 0 && (
        <div className="team-card__members">
          <h4 className="team-card__members-title">Участники:</h4>
          <div className="team-card__members-list">
            {team.members.slice(0, 3).map((member, index) => (
              <span key={index} className="team-card__member">
                {member.name}
                {member.role && ` (${member.role})`}
              </span>
            ))}
            {team.members.length > 3 && (
              <span className="team-card__member-more">
                +{team.members.length - 3} еще
              </span>
            )}
          </div>
        </div>
      )}

      {team.contactInfo && (
        <div className="team-card__contact">
          {team.contactInfo.email && (
            <div className="team-card__contact-item">
              <span className="team-card__contact-label">Email:</span>
              <span className="team-card__contact-value">{team.contactInfo.email}</span>
            </div>
          )}
          {team.contactInfo.phone && (
            <div className="team-card__contact-item">
              <span className="team-card__contact-label">Телефон:</span>
              <span className="team-card__contact-value">{team.contactInfo.phone}</span>
            </div>
          )}
        </div>
      )}

      {team.statistics && (
        <div className="team-card__stats">
          <div className="team-card__stat">
            <span className="team-card__stat-label">Игр сыграно:</span>
            <span className="team-card__stat-value">{team.statistics.roundsPlayed}</span>
          </div>
          <div className="team-card__stat">
            <span className="team-card__stat-label">Средний счет:</span>
            <span className="team-card__stat-value">{team.statistics.averageScore}</span>
          </div>
        </div>
      )}

      {showActions && (
        <div className="team-card__actions">
          {onSelect && onDeselect && (
            <button
              type="button"
              className={`btn btn--sm ${selected ? 'btn--secondary' : 'btn--primary'}`}
              onClick={handleToggleSelection}
            >
              {selected ? 'Убрать из выбора' : 'Выбрать команду'}
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => onEdit(team)}
            >
              <i className="icon icon--edit"></i>
              Редактировать
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => onRemove(team)}
            >
              <i className="icon icon--trash"></i>
              Удалить
            </button>
          )}
        </div>
      )}
    </div>
  );
};
