import { Router } from 'express';
import { GameController } from '../controllers/game.controller';
import { ScoreController } from '../controllers/score.controller';
import {
    authenticateToken,
    requireActiveUser,
    requireAdminOrModerator
} from '../middleware/auth.middleware';
import {
    validateAddTeamsToGame,
    validateCreateGame,
    validateGameQuery,
    validateGameStateChange,
    validateRemoveTeamsFromGame,
    validateUpdateGame
} from '../middleware/game.middleware';

const router = Router();
const gameController = new GameController();
const scoreController = new ScoreController();

/**
 * @route GET /api/games
 * @desc Получить список игр с пагинацией и фильтрацией
 * @access Public (для публичных игр)
 */
router.get(
  '/',
  validateGameQuery,
  gameController.getGames
);

/**
 * @route GET /api/games/search
 * @desc Поиск игр
 * @access Public
 */
router.get(
  '/search',
  validateGameQuery,
  gameController.searchGames
);

/**
 * @route GET /api/games/stats
 * @desc Получить статистику игр
 * @access Public
 */
router.get(
  '/stats',
  gameController.getGameStats
);

/**
 * @route GET /api/games/:id
 * @desc Получить игру по ID
 * @access Public
 */
router.get(
  '/:id',
  gameController.getGameById
);

/**
 * @route POST /api/games
 * @desc Создать новую игру
 * @access Private (требуется аутентификация)
 */
router.post(
  '/',
  authenticateToken,
  requireActiveUser,
  requireAdminOrModerator,
  validateCreateGame,
  gameController.createGame
);

/**
 * @route PUT /api/games/:id
 * @desc Обновить игру
 * @access Private (только создатель или админ)
 */
router.put(
  '/:id',
  authenticateToken,
  requireActiveUser,
  validateUpdateGame,
  gameController.updateGame
);

/**
 * @route DELETE /api/games/:id
 * @desc Удалить игру
 * @access Private (только создатель или админ)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireActiveUser,
  gameController.deleteGame
);

/**
 * @route POST /api/games/:id/start
 * @desc Запустить игру
 * @access Private (только создатель или админ)
 */
router.post(
  '/:id/start',
  authenticateToken,
  requireActiveUser,
  requireAdminOrModerator,
  validateGameStateChange,
  gameController.startGame
);

/**
 * @route POST /api/games/:id/stop
 * @desc Остановить игру
 * @access Private (только создатель или админ)
 */
router.post(
  '/:id/stop',
  authenticateToken,
  requireActiveUser,
  requireAdminOrModerator,
  validateGameStateChange,
  gameController.stopGame
);

/**
 * @route POST /api/games/:id/pause
 * @desc Приостановить игру
 * @access Private (только создатель или админ)
 */
router.post(
  '/:id/pause',
  authenticateToken,
  requireActiveUser,
  requireAdminOrModerator,
  validateGameStateChange,
  gameController.pauseGame
);

/**
 * @route POST /api/games/:id/resume
 * @desc Возобновить игру
 * @access Private (только создатель или админ)
 */
router.post(
  '/:id/resume',
  authenticateToken,
  requireActiveUser,
  requireAdminOrModerator,
  validateGameStateChange,
  gameController.resumeGame
);

/**
 * @route POST /api/games/:id/teams
 * @desc Добавить команды в игру
 * @access Private (только создатель или админ)
 */
router.post(
  '/:id/teams',
  authenticateToken,
  requireActiveUser,
  requireAdminOrModerator,
  validateAddTeamsToGame,
  gameController.addTeamsToGame
);

/**
 * @route DELETE /api/games/:id/teams
 * @desc Удалить команды из игры
 * @access Private (только создатель или админ)
 */
router.delete(
  '/:id/teams',
  authenticateToken,
  requireActiveUser,
  requireAdminOrModerator,
  validateRemoveTeamsFromGame,
  gameController.removeTeamsFromGame
);

/**
 * @route GET /api/games/:id/teams
 * @desc Получить команды игры
 * @access Private
 */
router.get(
  '/:id/teams',
  authenticateToken,
  requireActiveUser,
  gameController.getGameTeams
);

/**
 * @route GET /api/games/:gameId/corrections
 * @desc Получить все исправления баллов по игре
 * @access Private (Admin, Manager)
 */
router.get(
  '/:gameId/corrections',
  authenticateToken,
  requireActiveUser,
  requireAdminOrModerator,
  scoreController.getGameCorrections
);

/**
 * @route GET /api/games/:id/leaderboard
 * @desc Получить рейтинг команд игры с позициями
 * @access Public
 */
router.get(
  '/:id/leaderboard',
  gameController.getGameLeaderboard
);

/**
 * @route POST /api/games/:id/recalculate-positions
 * @desc Пересчитать позиции команд в игре
 * @access Private (Admin, Manager)
 */
router.post(
  '/:id/recalculate-positions',
  authenticateToken,
  requireActiveUser,
  requireAdminOrModerator,
  gameController.recalculateGamePositions
);

export default router;
