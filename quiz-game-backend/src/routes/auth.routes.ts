import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authLogger, authenticateToken, requireActiveUser } from '../middleware/auth.middleware';

/**
 * Роуты для аутентификации
 */

const router = Router();
const authController = new AuthController();

// Применяем логирование ко всем роутам аутентификации
router.use(authLogger);

/**
 * @route   POST /auth/login
 * @desc    Аутентификация пользователя
 * @access  Public
 * @body    { email: string, password: string }
 */
router.post('/login', authController.login);

/**
 * @route   POST /auth/register
 * @desc    Регистрация нового пользователя
 * @access  Public
 * @body    { email: string, password: string, firstName: string, lastName: string, organizationId: number, role?: UserRole }
 */
router.post('/register', authController.register);

/**
 * @route   POST /auth/refresh
 * @desc    Обновление access токена
 * @access  Public
 * @body    { refreshToken: string }
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /auth/forgot-password
 * @desc    Запрос сброса пароля
 * @access  Public
 * @body    { email: string }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /auth/reset-password
 * @desc    Установка нового пароля по токену
 * @access  Public
 * @body    { token: string, newPassword: string }
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @route   GET /auth/me
 * @desc    Получение информации о текущем пользователе
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.get('/me', authenticateToken, requireActiveUser, authController.getCurrentUser);

/**
 * @route   GET /auth/validate
 * @desc    Проверка валидности токена
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.get('/validate', authenticateToken, requireActiveUser, authController.validateToken);

/**
 * @route   POST /auth/change-password
 * @desc    Смена пароля
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @body    { currentPassword: string, newPassword: string }
 */
router.post(
  '/change-password',
  authenticateToken,
  requireActiveUser,
  authController.changePassword,
);

/**
 * @route   POST /auth/logout
 * @desc    Выход из системы
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.post('/logout', authenticateToken, authController.logout);

export default router;
