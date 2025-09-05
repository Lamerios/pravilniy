import { Router } from 'express';
import { teamController } from '../controllers/team.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { validateCreateTeam, validateTeamQuery, validateUpdateTeam } from '../middleware/team.middleware';

const router = Router();

// Применяем аутентификацию ко всем маршрутам
router.use(authenticateToken);

/**
 * @route GET /api/teams
 * @desc Получить список команд с пагинацией и фильтрацией
 * @access Private (Admin, Manager, User)
 */
router.get('/', validateTeamQuery, teamController.getTeams);

/**
 * @route GET /api/teams/search
 * @desc Поиск команд
 * @access Private (Admin, Manager, User)
 */
router.get('/search', teamController.searchTeams);

/**
 * @route GET /api/teams/stats
 * @desc Получить статистику команд
 * @access Private (Admin, Manager, User)
 */
router.get('/stats', teamController.getTeamStats);

/**
 * @route GET /api/teams/check-table/:tableNumber
 * @desc Проверить уникальность номера стола
 * @access Private (Admin, Manager, User)
 */
router.get('/check-table/:tableNumber', teamController.checkTableNumber);

/**
 * @route GET /api/teams/next-table-number
 * @desc Получить следующий доступный номер стола
 * @access Private (Admin, Manager, User)
 */
router.get('/next-table-number', teamController.getNextTableNumber);

/**
 * @route POST /api/teams/validate-table-numbers
 * @desc Валидировать номера столов
 * @access Private (Admin, Manager, User)
 */
router.post('/validate-table-numbers', teamController.validateTableNumbers);

/**
 * @route GET /api/teams/organization/:organizationId
 * @desc Получить команды по организации
 * @access Private (Admin, Manager)
 */
router.get('/organization/:organizationId',
  roleMiddleware(['admin', 'manager']),
  teamController.getTeamsByOrganization
);

/**
 * @route GET /api/teams/:id
 * @desc Получить команду по ID
 * @access Private (Admin, Manager, User)
 */
router.get('/:id', teamController.getTeamById);

/**
 * @route POST /api/teams
 * @desc Создать новую команду
 * @access Private (Admin, Manager)
 */
router.post('/',
  roleMiddleware(['admin', 'manager']),
  validateCreateTeam,
  teamController.createTeam
);

/**
 * @route PUT /api/teams/:id
 * @desc Обновить команду
 * @access Private (Admin, Manager)
 */
router.put('/:id',
  roleMiddleware(['admin', 'manager']),
  validateUpdateTeam,
  teamController.updateTeam
);

/**
 * @route DELETE /api/teams/:id
 * @desc Удалить команду
 * @access Private (Admin)
 */
router.delete('/:id',
  roleMiddleware(['admin']),
  teamController.deleteTeam
);

export default router;
