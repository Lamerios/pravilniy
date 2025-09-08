import { Router } from 'express';
import { TemplateController } from '../controllers/template.controller';
import {
  authenticateToken,
  requireActiveUser,
  requireAdminOrModerator,
} from '../middleware/auth.middleware';
import {
  validateCreateTemplate,
  validateTemplateQuery,
  validateUpdateTemplate,
} from '../middleware/template.middleware';

const router = Router();
const templateController = new TemplateController();

/**
 * @route GET /api/templates
 * @desc Получить список шаблонов с пагинацией и фильтрацией
 * @access Public (для публичных шаблонов)
 */
router.get('/', validateTemplateQuery, templateController.getTemplates);

/**
 * @route GET /api/templates/search
 * @desc Поиск шаблонов
 * @access Public
 */
router.get('/search', validateTemplateQuery, templateController.searchTemplates);

/**
 * @route GET /api/templates/stats
 * @desc Получить статистику шаблонов
 * @access Public
 */
router.get('/stats', templateController.getTemplateStats);

/**
 * @route GET /api/templates/:id
 * @desc Получить шаблон по ID
 * @access Public
 */
router.get('/:id', templateController.getTemplateById);

/**
 * @route POST /api/templates
 * @desc Создать новый шаблон
 * @access Private (требуется аутентификация)
 */
router.post(
  '/',
  authenticateToken,
  requireActiveUser,
  requireAdminOrModerator,
  validateCreateTemplate,
  templateController.createTemplate,
);

/**
 * @route PUT /api/templates/:id
 * @desc Обновить шаблон
 * @access Private (только создатель или админ)
 */
router.put(
  '/:id',
  authenticateToken,
  requireActiveUser,
  validateUpdateTemplate,
  templateController.updateTemplate,
);

/**
 * @route DELETE /api/templates/:id
 * @desc Удалить шаблон
 * @access Private (только создатель или админ)
 */
router.delete('/:id', authenticateToken, requireActiveUser, templateController.deleteTemplate);

export default router;
