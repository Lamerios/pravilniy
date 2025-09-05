import { Router } from 'express';
import {
    authenticateToken,
    requireActiveUser,
    requireAdmin,
    requireModeratorOrAbove,
    requireOwner,
    requireOwnerOrAdmin
} from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { UserRole } from '../models/user.model';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Пример защищенных роутов
 * Демонстрирует использование JWT middleware
 */

const router = Router();

/**
 * @route   GET /protected/profile
 * @desc    Получение профиля пользователя (требует аутентификации)
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.get('/profile', authenticateToken, requireActiveUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'UnauthorizedError',
      message: 'Пользователь не аутентифицирован'
    });
    return;
  }

  res.json({
    success: true,
    message: 'Профиль пользователя получен',
    data: {
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      }
    }
  });
}));

/**
 * @route   GET /protected/admin
 * @desc    Административная панель (требует роль ADMIN)
 * @access  Private (Admin only)
 * @headers Authorization: Bearer <token>
 */
router.get('/admin', authenticateToken, requireActiveUser, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    message: 'Добро пожаловать в административную панель',
    data: {
      adminInfo: {
        message: 'Вы имеете доступ к административным функциям',
        timestamp: new Date().toISOString()
      }
    }
  });
}));

/**
 * @route   GET /protected/stats
 * @desc    Статистика системы (требует аутентификации)
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.get('/stats', authenticateToken, requireActiveUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  // Пример статистики
  const stats = {
    totalUsers: 150,
    activeGames: 5,
    totalOrganizations: 10,
    lastUpdated: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Статистика системы получена',
    data: { stats }
  });
}));

/**
 * @route   POST /protected/test
 * @desc    Тестовый endpoint для проверки аутентификации
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.post('/test', authenticateToken, requireActiveUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'UnauthorizedError',
      message: 'Пользователь не аутентифицирован'
    });
    return;
  }

  res.json({
    success: true,
    message: 'Тестовый запрос выполнен успешно',
    data: {
      user: user,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * @route   GET /protected/owner-only
 * @desc    Endpoint только для владельцев
 * @access  Private (Owner only)
 * @headers Authorization: Bearer <token>
 */
router.get('/owner-only', authenticateToken, requireActiveUser, requireOwner, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    message: 'Доступ разрешен только владельцам',
    data: {
      role: 'OWNER',
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * @route   GET /protected/moderator-or-above
 * @desc    Endpoint для модераторов и выше
 * @access  Private (Moderator+)
 * @headers Authorization: Bearer <token>
 */
router.get('/moderator-or-above', authenticateToken, requireActiveUser, requireModeratorOrAbove, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    message: 'Доступ разрешен модераторам и выше',
    data: {
      userRole: req.user?.role,
      allowedRoles: ['ADMIN', 'OWNER', 'MODERATOR'],
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * @route   GET /protected/owner-or-admin
 * @desc    Endpoint для владельцев и администраторов
 * @access  Private (Owner or Admin)
 * @headers Authorization: Bearer <token>
 */
router.get('/owner-or-admin', authenticateToken, requireActiveUser, requireOwnerOrAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    message: 'Доступ разрешен владельцам и администраторам',
    data: {
      userRole: req.user?.role,
      allowedRoles: ['ADMIN', 'OWNER'],
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * @route   GET /protected/role/:role
 * @desc    Endpoint с динамической проверкой роли
 * @access  Private (Specific role)
 * @headers Authorization: Bearer <token>
 */
router.get('/role/:role', authenticateToken, requireActiveUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const requestedRole = req.params['role'] as UserRole;

  // Проверяем, что запрашиваемая роль существует
  if (!Object.values(UserRole).includes(requestedRole)) {
    res.status(400).json({
      success: false,
      error: 'InvalidRoleError',
      message: 'Неверная роль'
    });
    return;
  }

  // Проверяем роль пользователя
  if (req.user?.role !== requestedRole) {
    res.status(403).json({
      success: false,
      error: 'InsufficientPermissionsError',
      message: `Требуется роль: ${requestedRole}`
    });
    return;
  }

  res.json({
    success: true,
    message: `Доступ разрешен для роли: ${requestedRole}`,
    data: {
      userRole: req.user.role,
      requestedRole: requestedRole,
      timestamp: new Date().toISOString()
    }
  });
}));

/**
 * @route   GET /protected/roles-info
 * @desc    Информация о ролях пользователя
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.get('/roles-info', authenticateToken, requireActiveUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'UnauthorizedError',
      message: 'Пользователь не аутентифицирован'
    });
    return;
  }

  const roleInfo = {
    currentRole: user.role,
    availableRoles: Object.values(UserRole),
    permissions: {
      canAccessAdmin: [UserRole.ADMIN].includes(user.role),
      canAccessOwner: [UserRole.OWNER].includes(user.role),
      canAccessModerator: [UserRole.ADMIN, UserRole.OWNER, UserRole.MODERATOR].includes(user.role),
      canAccessOwnerOrAdmin: [UserRole.ADMIN, UserRole.OWNER].includes(user.role)
    }
  };

  res.json({
    success: true,
    message: 'Информация о ролях получена',
    data: roleInfo
  });
}));

export default router;
