import { Router } from 'express';
import { scoreController } from '../controllers/score.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateGameScoresQuery, validateRoundScoresParams } from '../middleware/score.middleware';

const router = Router();

/**
 * Маршруты для истории баллов игр
 * Префикс: /api/games/:gameId
 */

// История баллов игры
router.get('/:gameId/scores', authenticateToken, validateGameScoresQuery, scoreController.getGameScoresHistory);

// Статистика баллов игры
router.get('/:gameId/scores/stats', authenticateToken, scoreController.getGameScoreStats);

// Лидерборд игры
router.get('/:gameId/leaderboard', authenticateToken, scoreController.getGameLeaderboard);

// Сводка по раундам игры
router.get('/:gameId/rounds/summary', authenticateToken, scoreController.getGameRoundsSummary);

// Баллы конкретного раунда
router.get('/:gameId/rounds/:roundId/scores', authenticateToken, validateRoundScoresParams, scoreController.getRoundScores);

export default router;
