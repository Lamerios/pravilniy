import { Transaction } from 'sequelize';
import { Score } from '../models/score.model';
import { Team } from '../models/team.model';
import { logger } from '../utils/logger';

export interface TeamPosition {
  teamId: number;
  teamName: string;
  tableNumber?: number | undefined;
  totalPoints: number;
  position: number;
  previousPosition?: number | undefined;
  positionChange: 'up' | 'down' | 'same' | 'new';
  lastUpdated: Date;
}

export interface PositionCalculationResult {
  positions: TeamPosition[];
  changes: Array<{
    teamId: number;
    teamName: string;
    oldPosition?: number | undefined;
    newPosition: number;
    change: 'up' | 'down' | 'same' | 'new';
  }>;
}

export class PositionService {
  /**
   * Пересчитать позиции всех команд в игре
   */
  async recalculateGamePositions(
    gameId: number,
    transaction?: Transaction
  ): Promise<PositionCalculationResult> {
    try {
      logger.info(`Starting position recalculation for game ${gameId}`);

      // Получаем текущие позиции команд
      const currentPositions = await this.getCurrentPositions(gameId, transaction);

      // Получаем команды с их суммарными баллами
      const teamsWithScores = await this.getTeamsWithTotalScores(gameId, transaction);

      // Рассчитываем новые позиции
      const newPositions = this.calculatePositions(teamsWithScores);

      // Определяем изменения позиций
      const changes = this.calculatePositionChanges(currentPositions, newPositions);

      // Обновляем позиции в базе данных
      await this.updatePositionsInDatabase(gameId, newPositions, transaction);

      logger.info(`Position recalculation completed for game ${gameId}: ${newPositions.length} teams, ${changes.filter(c => c.change !== 'same').length} changes`);

      return {
        positions: newPositions,
        changes
      };
    } catch (error) {
      logger.error(`Failed to recalculate positions for game ${gameId}: ${error}`);
      throw error;
    }
  }

  /**
   * Получить текущие позиции команд
   */
  private async getCurrentPositions(
    gameId: number,
    transaction?: Transaction
  ): Promise<Map<number, number>> {
    const scores = await Score.findAll({
      where: { gameId },
      attributes: ['teamId', 'position'],
      group: ['teamId', 'position'],
      transaction: transaction || null
    });

    const positions = new Map<number, number>();
    scores.forEach(score => {
      if (score.position) {
        positions.set(score.teamId, score.position);
      }
    });

    return positions;
  }

  /**
   * Получить команды с их суммарными баллами
   */
  private async getTeamsWithTotalScores(
    gameId: number,
    transaction?: Transaction
  ): Promise<Array<{
    teamId: number;
    teamName: string;
    tableNumber?: number | undefined;
    totalPoints: number;
    lastUpdated: Date;
  }>> {
    // Получаем команды через GameTeam связь
    const { GameTeam } = await import('../models/game-team.model');

    const teams = await Team.findAll({
      include: [
        {
          model: GameTeam,
          as: 'GameTeams',
          where: { gameId },
          attributes: [],
          required: true
        },
        {
          model: Score,
          as: 'scores',
          where: { gameId },
          attributes: [],
          required: false
        }
      ],
      attributes: [
        'id',
        'name',
        'tableNumber',
        [
          Score.sequelize!.fn('COALESCE',
            Score.sequelize!.fn('SUM', Score.sequelize!.col('scores.totalPoints')),
            0
          ),
          'totalPoints'
        ],
        [
          Score.sequelize!.fn('COALESCE',
            Score.sequelize!.fn('MAX', Score.sequelize!.col('scores.updatedAt')),
            Score.sequelize!.col('Team.createdAt')
          ),
          'lastUpdated'
        ]
      ],
      group: ['Team.id', 'Team.name', 'Team.tableNumber', 'Team.createdAt'],
      transaction: transaction || null
    });

    return teams.map(team => ({
      teamId: parseInt(team.id.toString()),
      teamName: team.name,
      tableNumber: team.tableNumber,
      totalPoints: parseFloat((team as any).dataValues.totalPoints) || 0,
      lastUpdated: new Date((team as any).dataValues.lastUpdated)
    }));
  }

  /**
   * Рассчитать позиции на основе баллов
   */
  private calculatePositions(teams: Array<{
    teamId: number;
    teamName: string;
    tableNumber?: number | undefined;
    totalPoints: number;
    lastUpdated: Date;
  }>): TeamPosition[] {
    // Сортируем команды:
    // 1. По убыванию totalPoints
    // 2. При равенстве баллов - по возрастанию времени последнего обновления (раньше = выше)
    const sortedTeams = teams.sort((a, b) => {
      if (a.totalPoints !== b.totalPoints) {
        return b.totalPoints - a.totalPoints; // По убыванию баллов
      }

      // При равенстве баллов - по времени (раньше обновился = выше позиция)
      return a.lastUpdated.getTime() - b.lastUpdated.getTime();
    });

    // Присваиваем позиции
    return sortedTeams.map((team, index) => ({
      teamId: team.teamId,
      teamName: team.teamName,
      tableNumber: team.tableNumber,
      totalPoints: team.totalPoints,
      position: index + 1,
      positionChange: 'same' as const, // Будет обновлено в calculatePositionChanges
      lastUpdated: team.lastUpdated
    }));
  }

  /**
   * Определить изменения позиций
   */
  private calculatePositionChanges(
    currentPositions: Map<number, number>,
    newPositions: TeamPosition[]
  ): Array<{
    teamId: number;
    teamName: string;
    oldPosition?: number | undefined;
    newPosition: number;
    change: 'up' | 'down' | 'same' | 'new';
  }> {
    return newPositions.map(team => {
      const oldPosition = currentPositions.get(team.teamId);
      let change: 'up' | 'down' | 'same' | 'new';

      if (oldPosition === undefined) {
        change = 'new';
      } else if (oldPosition > team.position) {
        change = 'up';
      } else if (oldPosition < team.position) {
        change = 'down';
      } else {
        change = 'same';
      }

      // Обновляем positionChange в team
      team.previousPosition = oldPosition || undefined;
      team.positionChange = change;

      return {
        teamId: team.teamId,
        teamName: team.teamName,
        oldPosition: oldPosition || undefined,
        newPosition: team.position,
        change
      };
    });
  }

  /**
   * Обновить позиции в базе данных
   */
  private async updatePositionsInDatabase(
    gameId: number,
    positions: TeamPosition[],
    transaction?: Transaction
  ): Promise<void> {
    // Обновляем позиции во всех записях Score для каждой команды
    for (const position of positions) {
      await Score.update(
        { position: position.position },
        {
          where: {
            gameId,
            teamId: position.teamId
          },
          transaction: transaction || null
        }
      );
    }
  }

  /**
   * Получить текущий leaderboard игры
   */
  async getGameLeaderboard(gameId: number): Promise<TeamPosition[]> {
    const result = await this.recalculateGamePositions(gameId);
    return result.positions;
  }

  /**
   * Получить позицию конкретной команды
   */
  async getTeamPosition(gameId: number, teamId: number): Promise<number> {
    const leaderboard = await this.getGameLeaderboard(gameId);
    const team = leaderboard.find(t => t.teamId === teamId);
    return team ? team.position : 0;
  }
}
