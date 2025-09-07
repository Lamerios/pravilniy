import { Response } from 'express';
import { scoreService } from '../services/score.service';
import { AuthenticatedRequest } from '../types/auth.types';
import {
  BulkScoreDto,
  CreateScoreDto,
  ScoreCorrectionDto,
  ScoreQueryDto,
  UpdateScoreDto
} from '../types/score.types';

export class ScoreController {
  /**
   * Создать запись о баллах
   * POST /api/scores
   */
  async createScore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const scoreData: CreateScoreDto = {
        ...req.body,
        enteredBy: req.user?.userId // Администратор, который вносит баллы
      };

      const score = await scoreService.createScore(scoreData);

      res.status(201).json({
        success: true,
        data: score,
        message: 'Баллы успешно добавлены'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка создания баллов'
      });
    }
  }

  /**
   * Обновить запись о баллах
   * PUT /api/scores/:id
   */
  async updateScore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const scoreData: UpdateScoreDto = req.body;

      const score = await scoreService.updateScore(parseInt(id!), scoreData);

      if (!score) {
        res.status(404).json({
          success: false,
          message: 'Запись о баллах не найдена'
        });
        return;
      }

      res.json({
        success: true,
        data: score,
        message: 'Баллы успешно обновлены'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка обновления баллов'
      });
    }
  }

  /**
   * Получить запись о баллах по ID
   * GET /api/scores/:id
   */
  async getScoreById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const score = await scoreService.getScoreById(parseInt(id!));

      if (!score) {
        res.status(404).json({
          success: false,
          message: 'Запись о баллах не найдена'
        });
        return;
      }

      res.json({
        success: true,
        data: score,
        message: 'Баллы успешно получены'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения баллов'
      });
    }
  }

  /**
   * Получить список баллов с пагинацией и фильтрацией
   * GET /api/scores
   */
  async getScores(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query: ScoreQueryDto = {
        page: req.query['page'] ? parseInt(req.query['page'] as string) : undefined,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : undefined,
        sortBy: req.query['sortBy'] as string,
        sortOrder: req.query['sortOrder'] as 'ASC' | 'DESC',
        gameId: req.query['gameId'] ? parseInt(req.query['gameId'] as string) : undefined,
        teamId: req.query['teamId'] ? parseInt(req.query['teamId'] as string) : undefined,
        roundId: req.query['roundId'] ? parseInt(req.query['roundId'] as string) : undefined
      };

      const result = await scoreService.getScores(query);

      res.json({
        success: true,
        data: result,
        message: 'Баллы успешно получены'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения баллов'
      });
    }
  }

  /**
   * Получить баллы команды в игре
   * GET /api/scores/team/:gameId/:teamId
   */
  async getTeamScores(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { gameId, teamId } = req.params;

      const scores = await scoreService.getTeamScores(parseInt(gameId!), parseInt(teamId!));

      res.json({
        success: true,
        data: scores,
        message: 'Баллы команды успешно получены'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения баллов команды'
      });
    }
  }

  /**
   * Получить статистику баллов команды в игре
   * GET /api/scores/team/:gameId/:teamId/stats
   */
  async getTeamScoreStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { gameId, teamId } = req.params;

      const stats = await scoreService.getTeamScoreStats(parseInt(gameId!), parseInt(teamId!));

      res.json({
        success: true,
        data: stats,
        message: 'Статистика баллов команды успешно получена'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения статистики команды'
      });
    }
  }


  /**
   * Массовый ввод баллов
   * POST /api/scores/bulk
   */
  async bulkCreateScores(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const bulkData: BulkScoreDto = req.body;
      const enteredBy = req.user?.userId;

      const result = await scoreService.bulkCreateScores(bulkData);

      res.status(201).json({
        success: true,
        data: result,
        message: `Массовый ввод завершен. Создано: ${result.created}, ошибок: ${result.errors.length}`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка массового ввода баллов'
      });
    }
  }

  /**
   * Исправить баллы
   * POST /api/scores/:id/correct
   */
  async correctScore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const correctionData: ScoreCorrectionDto = {
        ...req.body,
        scoreId: parseInt(id!),
        correctedBy: req.user?.userId!
      };

      const score = await scoreService.correctScore(correctionData);

      res.json({
        success: true,
        data: score,
        message: 'Баллы успешно исправлены'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка исправления баллов'
      });
    }
  }

  /**
   * Получить историю исправлений баллов
   * GET /api/scores/:id/corrections
   */
  async getScoreCorrectionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const history = await scoreService.getScoreCorrectionHistory(parseInt(id!));

      res.json({
        success: true,
        data: history,
        message: 'История исправлений успешно получена'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения истории исправлений'
      });
    }
  }

  /**
   * Получение всех исправлений по игре
   * GET /api/games/:gameId/corrections
   */
  async getGameCorrections(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;

      const corrections = await scoreService.getGameCorrections(parseInt(gameId!), { page, limit });

      res.json({
        success: true,
        data: corrections,
        message: 'Исправления игры успешно получены'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения исправлений игры'
      });
    }
  }

  /**
   * Удалить запись о баллах
   * DELETE /api/scores/:id
   */
  async deleteScore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const success = await scoreService.deleteScore(parseInt(id!));

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Запись о баллах не найдена'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Баллы успешно удалены'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка удаления баллов'
      });
    }
  }

  /**
   * Получить историю баллов игры
   * GET /api/games/:gameId/scores
   */
  async getGameScoresHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;
      const query = {
        teamId: req.query['teamId'] ? parseInt(req.query['teamId'] as string) : undefined,
        roundId: req.query['roundId'] ? parseInt(req.query['roundId'] as string) : undefined,
        page: req.query['page'] ? parseInt(req.query['page'] as string) : 1,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 50,
        sortBy: (req.query['sortBy'] as string) || 'createdAt',
        sortOrder: (req.query['sortOrder'] as 'ASC' | 'DESC') || 'DESC'
      };

      const result = await scoreService.getGameScoresHistory(parseInt(gameId!), query);

      res.json({
        success: true,
        data: result,
        message: 'История баллов игры успешно получена'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения истории баллов'
      });
    }
  }

  /**
   * Получить статистику баллов игры
   * GET /api/games/:gameId/scores/stats
   */
  async getGameScoreStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;

      const stats = await scoreService.getGameScoreStats(parseInt(gameId!));

      res.json({
        success: true,
        data: stats,
        message: 'Статистика баллов игры успешно получена'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения статистики баллов игры'
      });
    }
  }

  /**
   * Получить лидерборд игры
   * GET /api/games/:gameId/leaderboard
   */
  async getGameLeaderboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;

      const leaderboard = await scoreService.getGameLeaderboard(parseInt(gameId!));

      res.json({
        success: true,
        data: leaderboard,
        message: 'Лидерборд игры успешно получен'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения лидерборда'
      });
    }
  }

  /**
   * Получить баллы конкретного раунда
   * GET /api/games/:gameId/rounds/:roundId/scores
   */
  async getRoundScores(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { gameId, roundId } = req.params;

      const scores = await scoreService.getRoundScores(
        parseInt(gameId!),
        parseInt(roundId!)
      );

      res.json({
        success: true,
        data: scores,
        message: 'Баллы раунда успешно получены'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения баллов раунда'
      });
    }
  }

  /**
   * Получить сводку по раундам игры
   * GET /api/games/:gameId/rounds/summary
   */
  async getGameRoundsSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { gameId } = req.params;

      const summary = await scoreService.getGameRoundsSummary(parseInt(gameId!));

      res.json({
        success: true,
        data: summary,
        message: 'Сводка по раундам успешно получена'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения сводки по раундам'
      });
    }
  }
}

export const scoreController = new ScoreController();
