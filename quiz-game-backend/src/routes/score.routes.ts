import { Router } from 'express';
import { scoreController } from '../controllers/score.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import {
    checkScoreAccess,
    validateBulkScore,
    validateCorrectScore,
    validateCreateScore,
    validateScoreQuery,
    validateUpdateScore
} from '../middleware/score.middleware';

const router = Router();

// Применяем аутентификацию и проверку доступа ко всем маршрутам
router.use(authenticateToken);
router.use(checkScoreAccess);

/**
 * @route POST /api/scores
 * @desc Создать запись о баллах
 * @access Private (Admin, Manager, User)
 */
router.post('/',
  roleMiddleware(['admin', 'manager', 'user']),
  validateCreateScore,
  scoreController.createScore
);

/**
 * @route POST /api/scores/bulk
 * @desc Массовый ввод баллов
 * @access Private (Admin, Manager)
 */
router.post('/bulk',
  roleMiddleware(['admin', 'manager']),
  validateBulkScore,
  scoreController.bulkCreateScores
);

/**
 * @route GET /api/scores
 * @desc Получить список баллов с пагинацией и фильтрацией
 * @access Private (Admin, Manager, User)
 */
router.get('/',
  validateScoreQuery,
  scoreController.getScores
);

/**
 * @route GET /api/scores/game/:gameId/stats
 * @desc Получить статистику баллов игры
 * @access Private (Admin, Manager, User)
 */
router.get('/game/:gameId/stats',
  scoreController.getGameScoreStats
);

/**
 * @route GET /api/scores/team/:gameId/:teamId
 * @desc Получить баллы команды в игре
 * @access Private (Admin, Manager, User)
 */
router.get('/team/:gameId/:teamId',
  scoreController.getTeamScores
);

/**
 * @route GET /api/scores/team/:gameId/:teamId/stats
 * @desc Получить статистику баллов команды в игре
 * @access Private (Admin, Manager, User)
 */
router.get('/team/:gameId/:teamId/stats',
  scoreController.getTeamScoreStats
);

/**
 * @route GET /api/scores/:id
 * @desc Получить запись о баллах по ID
 * @access Private (Admin, Manager, User)
 */
router.get('/:id',
  scoreController.getScoreById
);

/**
 * @route PUT /api/scores/:id
 * @desc Обновить запись о баллах
 * @access Private (Admin, Manager)
 */
router.put('/:id',
  roleMiddleware(['admin', 'manager']),
  validateUpdateScore,
  scoreController.updateScore
);

/**
 * @route POST /api/scores/:id/correct
 * @desc Исправить баллы
 * @access Private (Admin, Manager)
 */
router.post('/:id/correct',
  roleMiddleware(['admin', 'manager']),
  validateCorrectScore,
  scoreController.correctScore
);

/**
 * @route GET /api/scores/:id/corrections
 * @desc Получить историю исправлений баллов
 * @access Private (Admin, Manager)
 */
router.get('/:id/corrections',
  roleMiddleware(['admin', 'manager']),
  scoreController.getScoreCorrectionHistory
);

/**
 * @route DELETE /api/scores/:id
 * @desc Удалить запись о баллах
 * @access Private (Admin)
 */
router.delete('/:id',
  roleMiddleware(['admin']),
  scoreController.deleteScore
);

export default router;

