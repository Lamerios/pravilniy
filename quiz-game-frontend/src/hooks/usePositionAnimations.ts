import { useEffect, useRef, useState } from 'react';

interface TeamPosition {
  teamId: number;
  position: number;
  teamName: string;
  totalPoints: number;
  positionChange: 'up' | 'down' | 'same' | 'new';
  lastUpdated: Date;
}

interface PositionChange {
  teamId: number;
  teamName: string;
  oldPosition?: number | undefined;
  newPosition: number;
  change: 'up' | 'down' | 'same' | 'new';
}

interface UsePositionAnimationsOptions {
  leaderboard: TeamPosition[];
  animateChanges?: boolean;
  animationDuration?: number;
}

interface UsePositionAnimationsReturn {
  animatedLeaderboard: TeamPosition[];
  isAnimating: boolean;
  getAnimationClass: (teamId: number) => string;
  getPositionChangeClass: (teamId: number) => string;
}

export const usePositionAnimations = ({
  leaderboard,
  animateChanges = true,
  animationDuration = 1000
}: UsePositionAnimationsOptions): UsePositionAnimationsReturn => {
  const [animatedLeaderboard, setAnimatedLeaderboard] = useState<TeamPosition[]>(leaderboard);
  const [isAnimating, setIsAnimating] = useState(false);
  const [positionChanges, setPositionChanges] = useState<Map<number, PositionChange>>(new Map());

  const previousLeaderboardRef = useRef<TeamPosition[]>([]);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Отслеживаем изменения позиций
  useEffect(() => {
    if (!animateChanges || previousLeaderboardRef.current.length === 0) {
      previousLeaderboardRef.current = leaderboard;
      setAnimatedLeaderboard(leaderboard);
      return;
    }

    const previousPositions = new Map<number, number>();
    previousLeaderboardRef.current.forEach(team => {
      previousPositions.set(team.teamId, team.position);
    });

    const changes = new Map<number, PositionChange>();
    let hasChanges = false;

    leaderboard.forEach(team => {
      const oldPosition = previousPositions.get(team.teamId);
      const newPosition = team.position;

      if (oldPosition !== undefined && oldPosition !== newPosition) {
        hasChanges = true;
        let change: 'up' | 'down' | 'same' | 'new';

        if (oldPosition > newPosition) {
          change = 'up'; // Поднялись в рейтинге
        } else if (oldPosition < newPosition) {
          change = 'down'; // Опустились в рейтинге
        } else {
          change = 'same';
        }

        changes.set(team.teamId, {
          teamId: team.teamId,
          teamName: team.teamName,
          oldPosition,
          newPosition,
          change
        });
      } else if (oldPosition === undefined) {
        // Новая команда
        hasChanges = true;
        changes.set(team.teamId, {
          teamId: team.teamId,
          teamName: team.teamName,
          oldPosition: undefined,
          newPosition,
          change: 'new'
        });
      }
    });

    if (hasChanges) {
      setPositionChanges(changes);
      setIsAnimating(true);
      setAnimatedLeaderboard(leaderboard);

      // Сбрасываем анимацию после завершения
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        setPositionChanges(new Map());
      }, animationDuration);
    } else {
      setAnimatedLeaderboard(leaderboard);
    }

    previousLeaderboardRef.current = leaderboard;
  }, [leaderboard, animateChanges, animationDuration]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const getAnimationClass = (teamId: number): string => {
    if (!isAnimating) return '';

    const change = positionChanges.get(teamId);
    if (!change) return '';

    switch (change.change) {
      case 'up':
        return 'position-animation-up';
      case 'down':
        return 'position-animation-down';
      case 'new':
        return 'position-animation-new';
      default:
        return '';
    }
  };

  const getPositionChangeClass = (teamId: number): string => {
    if (!isAnimating) return '';

    const change = positionChanges.get(teamId);
    if (!change) return '';

    switch (change.change) {
      case 'up':
        return 'position-change-up';
      case 'down':
        return 'position-change-down';
      case 'new':
        return 'position-change-new';
      default:
        return '';
    }
  };

  return {
    animatedLeaderboard,
    isAnimating,
    getAnimationClass,
    getPositionChangeClass
  };
};
