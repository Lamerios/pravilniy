import React, { useEffect, useState } from 'react';
import { PublicScoreboardTeam } from '../types/scoreboard.types';

interface AnimatedTableRowProps {
  team: PublicScoreboardTeam;
  index: number;
  isAnimating: boolean;
  animationClass: string;
  positionChangeClass: string;
  onAnimationComplete?: () => void;
}

const AnimatedTableRow: React.FC<AnimatedTableRowProps> = ({
  team,
  index,
  isAnimating,
  animationClass,
  positionChangeClass,
  onAnimationComplete
}) => {
  const [showPointsUpdate, setShowPointsUpdate] = useState(false);
  const [previousPoints, setPreviousPoints] = useState(team.totalPoints);

  // Анимация обновления баллов
  useEffect(() => {
    if (previousPoints !== team.totalPoints) {
      setShowPointsUpdate(true);
      setPreviousPoints(team.totalPoints);

      const timer = setTimeout(() => {
        setShowPointsUpdate(false);
        onAnimationComplete?.();
      }, 800);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [team.totalPoints, previousPoints, onAnimationComplete]);

  const getPositionChangeIcon = (change: string) => {
    switch (change) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'same': return '=';
      case 'new': return '★';
      default: return '';
    }
  };

  const getPositionChangeClass = (change: string) => {
    switch (change) {
      case 'up': return 'position-up';
      case 'down': return 'position-down';
      case 'same': return 'position-same';
      case 'new': return 'position-new';
      default: return '';
    }
  };

  return (
    <div
      className={`table-row ${animationClass} ${isAnimating ? 'position-pulse' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="cell position">
        <span className={`position-number ${positionChangeClass}`}>
          {team.position}
        </span>
      </div>
      <div className="cell team">
        <span className="team-name">{team.teamName}</span>
      </div>
      <div className="cell table">
        <span className="table-number">
          {team.tableNumber || '-'}
        </span>
      </div>
      <div className="cell points">
        <span className={`points-value ${showPointsUpdate ? 'points-update' : ''}`}>
          {team.totalPoints}
        </span>
      </div>
      <div className="cell change">
        <span className={`position-change ${getPositionChangeClass(team.positionChange)}`}>
          {getPositionChangeIcon(team.positionChange)}
        </span>
      </div>
    </div>
  );
};

export default AnimatedTableRow;
