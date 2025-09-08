import { WhereOptions } from 'sequelize';
import { sequelize } from '../config/database';
import { GameTeam } from '../models/game-team.model';
import { Game } from '../models/game.model';
import { Round } from '../models/round.model';
import { ScoreCorrection } from '../models/score-correction.model';
import { Score } from '../models/score.model';
import { Team } from '../models/team.model';
import { User } from '../models/user.model';
import { getSocketService } from '../server';
import {
  BulkScoreDto,
  BulkScoreResult,
  CreateScoreDto,
  GameScoreStats,
  ScoreCorrectionDto,
  ScoreCorrectionHistory,
  ScoreListResult,
  ScoreQueryDto,
  ScoreResponse,
  TeamScoreStats,
  UpdateScoreDto,
} from '../types/score.types';
import { PositionService } from './position.service';

/**
 * Сервис для работы с баллами команд
 */
export class ScoreService {
  private positionService: PositionService;

  constructor() {
    this.positionService = new PositionService();
  }
  /**
   * Создать запись о баллах
   */
  async createScore(scoreData: CreateScoreDto): Promise<ScoreResponse> {
    const transaction = await sequelize.transaction();

    try {
      // Проверяем существование игры
      const game = await Game.findByPk(scoreData.gameId);
      if (!game) {
        throw new Error('Игра не найдена');
      }

      // Проверяем существование команды
      const team = await Team.findByPk(scoreData.teamId);
      if (!team) {
        throw new Error('Команда не найдена');
      }

      // Проверяем, что команда участвует в игре
      const gameTeam = await GameTeam.findAll({
        where: {
          gameId: scoreData.gameId,
          teamId: scoreData.teamId,
        },
      });

      if (gameTeam.length === 0) {
        throw new Error('Команда не участвует в данной игре');
      }

      // Проверяем существование раунда
      const round = await Round.findByPk(scoreData.roundId);
      if (!round) {
        throw new Error('Раунд не найден');
      }

      // Проверяем, что раунд принадлежит игре
      if (parseInt(round.gameId.toString()) !== scoreData.gameId) {
        throw new Error('Раунд не принадлежит данной игре');
      }

      // Проверяем уникальность записи
      const existingScore = await Score.findOne({
        where: {
          gameId: scoreData.gameId,
          teamId: scoreData.teamId,
          roundId: scoreData.roundId,
        },
      });

      if (existingScore) {
        throw new Error('Баллы для этой команды в данном раунде уже введены');
      }

      // Валидируем баллы (включая предупреждения)
      const pointsValidation = this.validatePoints(scoreData.points);
      if (pointsValidation.warning) {
        // Логируем предупреждение, но не блокируем операцию
        console.warn(`Score validation warning: ${pointsValidation.warning}`, {
          points: scoreData.points,
          teamId: scoreData.teamId,
          roundId: scoreData.roundId,
        });
      }

      // Валидируем ставку
      this.validateBet(scoreData.bet, scoreData.betType, scoreData.minBet, scoreData.maxBet);

      // Вычисляем общие баллы с учетом ставки и типа
      const totalPoints = this.calculateTotalPoints(
        scoreData.points,
        scoreData.bet,
        scoreData.betType || 'MULTIPLIER',
      );

      // Создаем запись о баллах
      const score = await Score.create(
        {
          gameId: scoreData.gameId,
          teamId: scoreData.teamId,
          roundId: scoreData.roundId,
          points: scoreData.points,
          bet: scoreData.bet,
          betType: scoreData.betType || 'MULTIPLIER',
          minBet: scoreData.minBet,
          maxBet: scoreData.maxBet,
          totalPoints,
          notes: scoreData.notes,
          enteredBy: scoreData.enteredBy,
        },
        { transaction },
      );

      await transaction.commit();

      // Пересчитываем позиции команд в игре
      let positionResult;
      try {
        positionResult = await this.positionService.recalculateGamePositions(scoreData.gameId);
      } catch (positionError) {
        console.error('Failed to recalculate positions after score creation:', positionError);
        // Не блокируем основную операцию из-за ошибки пересчета позиций
      }

      // Загружаем связанные данные
      const result = await this.getScoreById(score.id);
      if (!result) {
        throw new Error('Ошибка при получении созданной записи о баллах');
      }

      // Отправляем WebSocket события
      try {
        const socketService = getSocketService();

        // Отправляем обновление баллов
        socketService.emitScoreUpdate(scoreData.gameId, {
          teamId: scoreData.teamId,
          teamName: team.name,
          roundId: scoreData.roundId,
          points: scoreData.points,
          totalPoints: result.totalPoints,
        });

        // Отправляем обновление позиций, если пересчет прошел успешно
        if (positionResult) {
          socketService.emitPositionsUpdate(
            scoreData.gameId,
            positionResult.positions,
            positionResult.changes,
          );
        }
      } catch (socketError) {
        console.error('Failed to emit WebSocket events after score creation:', socketError);
        // Не блокируем основную операцию из-за ошибки WebSocket
      }

      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Обновить запись о баллах
   */
  async updateScore(scoreId: number, scoreData: UpdateScoreDto): Promise<ScoreResponse | null> {
    const transaction = await sequelize.transaction();

    try {
      const score = await Score.findByPk(scoreId);
      if (!score) {
        return null;
      }

      // Пересчитываем общие баллы если изменились points, bet или betType
      const newPoints = scoreData.points !== undefined ? scoreData.points : score.points;
      const newBet = scoreData.bet !== undefined ? scoreData.bet : score.bet;
      const newBetType =
        scoreData.betType !== undefined ? scoreData.betType : score.betType || 'MULTIPLIER';

      // Валидируем новую ставку
      this.validateBet(newBet, newBetType, scoreData.minBet, scoreData.maxBet);

      const totalPoints = this.calculateTotalPoints(newPoints, newBet, newBetType);

      await score.update(
        {
          ...scoreData,
          totalPoints,
        },
        { transaction },
      );

      await transaction.commit();

      // Пересчитываем позиции команд в игре
      let positionResult;
      try {
        positionResult = await this.positionService.recalculateGamePositions(score.gameId);
      } catch (positionError) {
        console.error('Failed to recalculate positions after score update:', positionError);
        // Не блокируем основную операцию из-за ошибки пересчета позиций
      }

      const result = await this.getScoreById(scoreId);
      if (!result) {
        throw new Error('Ошибка при получении обновленной записи о баллах');
      }

      // Отправляем WebSocket события
      try {
        const socketService = getSocketService();

        // Получаем информацию о команде
        const team = await Team.findByPk(score.teamId);
        if (team) {
          // Отправляем обновление баллов
          socketService.emitScoreUpdate(score.gameId, {
            teamId: score.teamId,
            teamName: team.name,
            roundId: score.roundId,
            points: newPoints,
            totalPoints: result.totalPoints,
          });
        }

        // Отправляем обновление позиций, если пересчет прошел успешно
        if (positionResult) {
          socketService.emitPositionsUpdate(
            score.gameId,
            positionResult.positions,
            positionResult.changes,
          );
        }
      } catch (socketError) {
        console.error('Failed to emit WebSocket events after score update:', socketError);
        // Не блокируем основную операцию из-за ошибки WebSocket
      }

      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Получить запись о баллах по ID
   */
  async getScoreById(scoreId: number): Promise<ScoreResponse | null> {
    const score = await Score.findByPk(scoreId, {
      include: [
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'tableNumber'],
        },
        {
          model: Round,
          as: 'round',
          attributes: ['id', 'name', 'roundNumber'],
        },
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'name'],
        },
      ],
    });

    return score ? this.mapScoreToResponse(score) : null;
  }

  /**
   * Получить список баллов с фильтрацией и пагинацией
   */
  async getScores(query: ScoreQueryDto): Promise<ScoreListResult> {
    const {
      gameId,
      teamId,
      roundId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const where: WhereOptions = {};

    if (gameId) where['gameId'] = gameId;
    if (teamId) where['teamId'] = teamId;
    if (roundId) where['roundId'] = roundId;

    const offset = (page - 1) * limit;

    const { count, rows } = await Score.findAndCountAll({
      where,
      include: [
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'tableNumber'],
        },
        {
          model: Round,
          as: 'round',
          attributes: ['id', 'name', 'roundNumber'],
        },
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'name'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      scores: rows.map(score => this.mapScoreToResponse(score)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Получить баллы команды в игре
   */
  async getTeamScores(gameId: number, teamId: number): Promise<ScoreResponse[]> {
    const scores = await Score.findAll({
      where: {
        gameId,
        teamId,
      },
      include: [
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'tableNumber'],
        },
        {
          model: Round,
          as: 'round',
          attributes: ['id', 'name', 'roundNumber'],
        },
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    return scores.map(score => this.mapScoreToResponse(score));
  }

  /**
   * Получить статистику баллов команды
   */
  async getTeamScoreStats(gameId: number, teamId: number): Promise<TeamScoreStats> {
    const team = await Team.findByPk(teamId);
    if (!team) {
      throw new Error('Команда не найдена');
    }

    const scores = await this.getTeamScores(gameId, teamId);

    const totalPoints = scores.reduce((sum, score) => sum + score.totalPoints, 0);
    const roundsPlayed = scores.length;
    const averagePoints = roundsPlayed > 0 ? totalPoints / roundsPlayed : 0;
    const maxPoints = roundsPlayed > 0 ? Math.max(...scores.map(s => s.totalPoints)) : 0;
    const minPoints = roundsPlayed > 0 ? Math.min(...scores.map(s => s.totalPoints)) : 0;

    // Получаем текущую позицию команды
    const allTeamStats = await this.getGameScoreStats(gameId);
    const currentPosition =
      allTeamStats.leaderboard.findIndex(entry => entry.teamId === teamId) + 1;

    return {
      teamId: parseInt(team.id.toString()),
      teamName: team.name,
      tableNumber: team.tableNumber || undefined,
      totalPoints,
      roundsPlayed,
      averagePoints: Math.round(averagePoints * 100) / 100,
      maxPoints,
      minPoints,
      currentPosition,
      scores,
    };
  }

  /**
   * Получить статистику баллов игры
   */
  async getGameScoreStats(gameId: number): Promise<GameScoreStats> {
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error('Игра не найдена');
    }

    const teams = await Team.findAll({
      include: [
        {
          model: Game,
          as: 'games',
          where: { id: gameId },
          through: { attributes: [] },
        },
      ],
    });

    const rounds = await Round.findAll({
      where: { gameId },
    });

    if (teams.length === 0) {
      throw new Error('В игре нет команд');
    }

    // Получаем статистику для каждой команды
    const teamStats: TeamScoreStats[] = [];
    for (const team of teams) {
      const stats = await this.getTeamScoreStats(gameId, parseInt(team.id.toString()));
      teamStats.push(stats);
    }

    // Сортируем по общим баллам
    teamStats.sort((a, b) => b.totalPoints - a.totalPoints);

    // Создаем таблицу лидеров с позициями
    const leaderboard = teamStats.map((stats, index) => ({
      position: index + 1,
      teamId: stats.teamId,
      teamName: stats.teamName,
      tableNumber: stats.tableNumber,
      totalPoints: stats.totalPoints,
    }));

    // Вычисляем средние баллы за раунд
    const totalPoints = teamStats.reduce((sum, stats) => sum + stats.totalPoints, 0);
    const averagePointsPerRound = rounds.length > 0 ? totalPoints / rounds.length : 0;

    return {
      gameId: parseInt(game.id.toString()),
      gameName: game.name,
      totalRounds: rounds.length,
      totalTeams: teams.length,
      averagePointsPerRound: Math.round(averagePointsPerRound * 100) / 100,
      teamStats,
      leaderboard,
    };
  }

  /**
   * Массовый ввод баллов
   */
  async bulkCreateScores(bulkData: BulkScoreDto): Promise<BulkScoreResult> {
    const transaction = await sequelize.transaction();

    try {
      const results: ScoreResponse[] = [];
      const errors: Array<{ teamId: number; error: string }> = [];

      for (const scoreData of bulkData.scores) {
        try {
          const createData: CreateScoreDto = {
            gameId: bulkData.gameId,
            roundId: bulkData.roundId,
            teamId: scoreData.teamId,
            points: scoreData.points,
            bet: scoreData.bet || undefined,
            notes: scoreData.notes || undefined,
            enteredBy: bulkData.enteredBy,
          };

          const score = await this.createScore(createData);
          results.push(score);
        } catch (error) {
          errors.push({
            teamId: scoreData.teamId,
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
          });
        }
      }

      await transaction.commit();

      // Отправляем WebSocket события для массового ввода
      try {
        const socketService = getSocketService();

        // Отправляем обновление позиций для игры
        if (results.length > 0) {
          const gameId = bulkData.gameId;
          const positionResult = await this.positionService.recalculateGamePositions(gameId);

          if (positionResult) {
            socketService.emitPositionsUpdate(
              gameId,
              positionResult.positions,
              positionResult.changes,
            );
          }
        }
      } catch (socketError) {
        console.error('Failed to emit WebSocket events after bulk score creation:', socketError);
        // Не блокируем основную операцию из-за ошибки WebSocket
      }

      return {
        success: true,
        created: results.length,
        updated: 0, // Для массового создания updated всегда 0
        errors,
        scores: results,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Исправить баллы (создать корректировку)
   */
  async correctScore(correctionData: ScoreCorrectionDto): Promise<ScoreResponse> {
    const transaction = await sequelize.transaction();

    try {
      const score = await Score.findByPk(correctionData.scoreId);
      if (!score) {
        throw new Error('Запись о баллах не найдена');
      }

      // Создаем запись о корректировке
      await ScoreCorrection.create(
        {
          scoreId: correctionData.scoreId,
          oldPoints: score.points,
          newPoints: correctionData.newPoints,
          reason: correctionData.reason,
          correctedBy: correctionData.correctedBy,
        },
        { transaction },
      );

      // Обновляем баллы с учетом типа ставки
      const totalPoints = this.calculateTotalPoints(
        correctionData.newPoints,
        score.bet,
        score.betType || 'MULTIPLIER',
      );
      await score.update(
        {
          points: correctionData.newPoints,
          totalPoints,
        },
        { transaction },
      );

      await transaction.commit();

      // Пересчитываем позиции команд в игре
      let positionResult;
      try {
        positionResult = await this.positionService.recalculateGamePositions(score.gameId);
      } catch (positionError) {
        console.error('Failed to recalculate positions after score correction:', positionError);
        // Не блокируем основную операцию из-за ошибки пересчета позиций
      }

      const result = await this.getScoreById(correctionData.scoreId);
      if (!result) {
        throw new Error('Ошибка при получении исправленной записи о баллах');
      }

      // Отправляем WebSocket события
      try {
        const socketService = getSocketService();

        // Получаем информацию о команде
        const team = await Team.findByPk(score.teamId);
        if (team) {
          // Отправляем коррекцию баллов
          socketService.emitScoreCorrection(score.gameId, {
            scoreId: correctionData.scoreId,
            teamId: score.teamId,
            teamName: team.name,
            oldPoints: score.points || 0,
            newPoints: correctionData.newPoints,
            reason: correctionData.reason,
            correctedBy: String(correctionData.correctedBy || 'Система'),
          });

          // Отправляем обновление баллов
          socketService.emitScoreUpdate(score.gameId, {
            teamId: score.teamId,
            teamName: team.name,
            roundId: score.roundId,
            points: correctionData.newPoints,
            totalPoints: result.totalPoints,
          });
        }

        // Отправляем обновление позиций, если пересчет прошел успешно
        if (positionResult) {
          socketService.emitPositionsUpdate(
            score.gameId,
            positionResult.positions,
            positionResult.changes,
          );
        }
      } catch (socketError) {
        console.error('Failed to emit WebSocket events after score correction:', socketError);
        // Не блокируем основную операцию из-за ошибки WebSocket
      }

      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Получить историю исправлений баллов
   */
  async getScoreCorrectionHistory(scoreId: number): Promise<ScoreCorrectionHistory[]> {
    const corrections = await ScoreCorrection.findAll({
      where: { scoreId },
      include: [
        {
          model: User,
          as: 'correctedByUser',
          attributes: ['id', 'email'],
        },
      ],
      order: [['correctedAt', 'DESC']],
    });

    return corrections.map(correction => ({
      id: correction.id,
      scoreId: correction.scoreId,
      oldPoints: correction.oldPoints,
      newPoints: correction.newPoints,
      reason: correction.reason,
      correctedBy: correction.correctedBy,
      correctedAt: correction.correctedAt.toISOString(),
      correctedByUser: correction.correctedByUser
        ? {
            id: correction.correctedByUser.id,
            username: correction.correctedByUser.email,
          }
        : undefined,
    }));
  }

  /**
   * Получить историю баллов игры
   */
  async getGameScoresHistory(gameId: number, query: ScoreQueryDto): Promise<ScoreListResult> {
    const {
      teamId,
      roundId,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const where: WhereOptions = { gameId };

    if (teamId) where['teamId'] = teamId;
    if (roundId) where['roundId'] = roundId;

    const offset = (page - 1) * limit;

    const { count, rows } = await Score.findAndCountAll({
      where,
      include: [
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'tableNumber'],
        },
        {
          model: Round,
          as: 'round',
          attributes: ['id', 'name', 'roundNumber'],
        },
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'name'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      scores: rows.map(score => this.mapScoreToResponse(score)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Получить баллы конкретного раунда
   */
  async getRoundScores(gameId: number, roundId: number): Promise<ScoreResponse[]> {
    const scores = await Score.findAll({
      where: {
        gameId,
        roundId,
      },
      include: [
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name', 'tableNumber'],
        },
        {
          model: Round,
          as: 'round',
          attributes: ['id', 'name', 'roundNumber'],
        },
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'name'],
        },
      ],
      order: [
        ['totalPoints', 'DESC'],
        ['createdAt', 'ASC'],
      ],
    });

    return scores.map(score => this.mapScoreToResponse(score));
  }

  /**
   * Получить лидерборд игры
   */
  async getGameLeaderboard(gameId: number): Promise<{
    leaderboard: Array<{
      position: number;
      teamId: number;
      teamName: string;
      tableNumber?: number | undefined;
      totalPoints: number;
      roundsPlayed: number;
      averagePoints: number;
      lastActivity: string;
    }>;
    gameInfo: {
      gameId: number;
      gameName: string;
      totalRounds: number;
      totalTeams: number;
    };
  }> {
    const gameStats = await this.getGameScoreStats(gameId);

    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error('Игра не найдена');
    }

    const rounds = await Round.findAll({
      where: { gameId },
    });

    // Получаем последнюю активность для каждой команды
    const leaderboardWithActivity = [];
    for (const teamStats of gameStats.teamStats) {
      const lastScore = await Score.findOne({
        where: {
          gameId,
          teamId: teamStats.teamId,
        },
        order: [['updatedAt', 'DESC']],
      });

      leaderboardWithActivity.push({
        position: teamStats.currentPosition,
        teamId: teamStats.teamId,
        teamName: teamStats.teamName,
        tableNumber: teamStats.tableNumber || undefined,
        totalPoints: teamStats.totalPoints,
        roundsPlayed: teamStats.roundsPlayed,
        averagePoints: teamStats.averagePoints,
        lastActivity: lastScore ? lastScore.updatedAt.toISOString() : new Date().toISOString(),
      });
    }

    // Сортируем по позиции
    leaderboardWithActivity.sort((a, b) => a.position - b.position);

    return {
      leaderboard: leaderboardWithActivity,
      gameInfo: {
        gameId: parseInt(game.id.toString()),
        gameName: game.name,
        totalRounds: rounds.length,
        totalTeams: gameStats.totalTeams,
      },
    };
  }

  /**
   * Получить сводку баллов по раундам для игры
   */
  async getGameRoundsSummary(gameId: number): Promise<{
    rounds: Array<{
      roundId: number;
      roundName: string;
      roundNumber: number;
      totalScores: number;
      averagePoints: number;
      maxPoints: number;
      minPoints: number;
      teamsParticipated: number;
    }>;
  }> {
    const rounds = await Round.findAll({
      where: { gameId },
      order: [['roundNumber', 'ASC']],
    });

    const roundsSummary = [];
    for (const round of rounds) {
      const roundScores = await Score.findAll({
        where: {
          gameId,
          roundId: round.id,
        },
      });

      if (roundScores.length > 0) {
        const totalPoints = roundScores.reduce((sum, score) => sum + score.totalPoints, 0);
        const pointsArray = roundScores.map(score => score.totalPoints);

        roundsSummary.push({
          roundId: parseInt(round.id.toString()),
          roundName: round.name,
          roundNumber: round.roundNumber,
          totalScores: roundScores.length,
          averagePoints: Math.round((totalPoints / roundScores.length) * 100) / 100,
          maxPoints: Math.max(...pointsArray),
          minPoints: Math.min(...pointsArray),
          teamsParticipated: roundScores.length,
        });
      } else {
        roundsSummary.push({
          roundId: parseInt(round.id.toString()),
          roundName: round.name,
          roundNumber: round.roundNumber,
          totalScores: 0,
          averagePoints: 0,
          maxPoints: 0,
          minPoints: 0,
          teamsParticipated: 0,
        });
      }
    }

    return { rounds: roundsSummary };
  }

  /**
   * Удалить запись о баллах
   */
  async deleteScore(scoreId: number): Promise<boolean> {
    const score = await Score.findByPk(scoreId);
    if (!score) {
      return false;
    }

    await score.destroy();
    return true;
  }

  /**
   * Вычислить общие баллы с учетом ставки и типа
   */
  private calculateTotalPoints(
    points: number,
    bet?: number,
    betType: 'MULTIPLIER' | 'BONUS' | 'FIXED' = 'MULTIPLIER',
  ): number {
    if (!bet) {
      return points;
    }

    let totalPoints: number;

    switch (betType) {
      case 'MULTIPLIER':
        // Умножаем баллы на ставку (множитель)
        totalPoints = points * bet;
        break;

      case 'BONUS':
        // Добавляем ставку как бонус к баллам
        totalPoints = points + bet;
        break;

      case 'FIXED':
        // Ставка определяет фиксированные баллы (игнорируем исходные баллы)
        totalPoints = bet;
        break;

      default:
        totalPoints = points;
    }

    // Округляем до 2 знаков после запятой
    return Math.round(totalPoints * 100) / 100;
  }

  /**
   * Валидация баллов (включая отрицательные)
   */
  private validatePoints(points: number): { isValid: boolean; warning?: string } {
    // Критически низкие баллы (возможная ошибка)
    if (points < -100) {
      return {
        isValid: true,
        warning: 'Критически низкие баллы. Убедитесь в корректности ввода.',
      };
    }

    // Критически высокие баллы (возможная ошибка)
    if (points > 1000) {
      return {
        isValid: true,
        warning: 'Критически высокие баллы. Убедитесь в корректности ввода.',
      };
    }

    return { isValid: true };
  }

  /**
   * Валидация существования связанных сущностей
   */
  private async validateEntities(gameId: number, teamId: number, roundId: number): Promise<void> {
    // Проверяем существование игры
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error('Игра не найдена');
    }

    // Проверяем существование команды
    const team = await Team.findByPk(teamId);
    if (!team) {
      throw new Error('Команда не найдена');
    }

    // Проверяем существование раунда
    const round = await Round.findByPk(roundId);
    if (!round) {
      throw new Error('Раунд не найден');
    }

    // Проверяем, что раунд принадлежит игре
    if (parseInt(round.gameId.toString()) !== gameId) {
      throw new Error('Раунд не принадлежит указанной игре');
    }
  }

  /**
   * Валидация ставки
   */
  private validateBet(bet?: number, betType?: string, minBet?: number, maxBet?: number): void {
    if (!bet) {
      return; // Ставка не обязательна
    }

    // Проверяем, что ставка положительная
    if (bet <= 0) {
      throw new Error('Ставка должна быть положительным числом');
    }

    // Проверяем минимальную ставку
    if (minBet && bet < minBet) {
      throw new Error(`Ставка не может быть меньше ${minBet}`);
    }

    // Проверяем максимальную ставку
    if (maxBet && bet > maxBet) {
      throw new Error(`Ставка не может быть больше ${maxBet}`);
    }

    // Дополнительные проверки в зависимости от типа ставки
    if (betType === 'MULTIPLIER') {
      if (bet > 10) {
        throw new Error('Множитель не может быть больше 10');
      }
      if (bet < 0.1) {
        throw new Error('Множитель не может быть меньше 0.1');
      }
    } else if (betType === 'BONUS') {
      if (bet > 100) {
        throw new Error('Бонус не может быть больше 100 баллов');
      }
    } else if (betType === 'FIXED') {
      if (bet > 200) {
        throw new Error('Фиксированные баллы не могут быть больше 200');
      }
    }
  }

  /**
   * Преобразовать модель Score в ScoreResponse
   */
  private mapScoreToResponse(score: Score): ScoreResponse {
    const response: ScoreResponse = {
      id: score.id,
      gameId: score.gameId,
      teamId: score.teamId,
      roundId: score.roundId,
      points: score.points,
      bet: score.bet || undefined,
      betType: score.betType || undefined,
      minBet: score.minBet || undefined,
      maxBet: score.maxBet || undefined,
      totalPoints: score.totalPoints,
      notes: score.notes || undefined,
      createdAt: score.createdAt.toISOString(),
      updatedAt: score.updatedAt.toISOString(),
    };

    if (score.team) {
      response.team = {
        id: parseInt(score.team.id.toString()),
        name: score.team.name,
        tableNumber: score.team.tableNumber,
      };
    }

    if (score.round) {
      response.round = {
        id: parseInt(score.round.id.toString()),
        name: score.round.name,
        roundNumber: score.round.roundNumber,
      };
    }

    if (score.game) {
      response.game = {
        id: parseInt(score.game.id.toString()),
        name: score.game.name,
      };
    }

    return response;
  }

  /**
   * Получить все исправления баллов по игре
   */
  async getGameCorrections(
    gameId: number,
    options: { page: number; limit: number },
  ): Promise<{
    corrections: Array<{
      id: number;
      scoreId: number;
      teamName: string;
      roundName: string;
      oldPoints: number;
      newPoints: number;
      reason: string;
      correctedBy: string;
      correctedAt: Date;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    // Получаем исправления с информацией о команде, раунде и пользователе
    const { count, rows: corrections } = await ScoreCorrection.findAndCountAll({
      include: [
        {
          model: Score,
          as: 'score',
          where: { gameId },
          include: [
            {
              model: Team,
              as: 'team',
              attributes: ['name'],
            },
            {
              model: Round,
              as: 'round',
              attributes: ['name', 'roundNumber'],
            },
          ],
        },
        {
          model: User,
          as: 'corrector',
          attributes: ['username', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const formattedCorrections = corrections.map(correction => ({
      id: parseInt(correction.id.toString()),
      scoreId: parseInt(correction.scoreId.toString()),
      teamName: (correction.score as any).team.name,
      roundName: `${(correction.score as any).round.name} (Раунд ${(correction.score as any).round.roundNumber})`,
      oldPoints: correction.oldPoints,
      newPoints: correction.newPoints,
      reason: correction.reason,
      correctedBy: String(correction.correctedBy || 'Система'),
      correctedAt: correction.createdAt,
    }));

    const totalPages = Math.ceil(count / limit);

    return {
      corrections: formattedCorrections,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
      },
    };
  }
}

export const scoreService = new ScoreService();
