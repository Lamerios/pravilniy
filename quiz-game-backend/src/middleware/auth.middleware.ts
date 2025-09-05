import { NextFunction, Response } from 'express';
import { UserRole } from '../models/user.model';
import { AuthenticatedRequest } from '../types/auth.types';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt.util';

/**
 * Middleware для аутентификации
 */

/**
 * Проверяет JWT токен и добавляет пользователя в request
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Извлекаем токен из заголовка
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        error: 'Access token required',
        message: 'Требуется токен доступа'
      });
      return;
    }

    // Верифицируем токен
    const payload = verifyToken(token);

    // Добавляем пользователя в request
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token has expired') {
        res.status(401).json({
          error: 'Token expired',
          message: 'Токен истек'
        });
        return;
      } else if (error.message === 'Invalid token') {
        res.status(403).json({
          error: 'Invalid token',
          message: 'Недействительный токен'
        });
        return;
      }
    }

    res.status(403).json({
      error: 'Token verification failed',
      message: 'Ошибка проверки токена'
    });
  }
};

/**
 * Middleware для проверки конкретной роли
 */
export const requireRole = (requiredRole: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Требуется аутентификация'
      });
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: `Требуется роль: ${requiredRole}`
      });
      return;
    }

    next();
  };
};

/**
 * Middleware для проверки нескольких ролей (любая из них)
 */
export const requireAnyRole = (requiredRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Требуется аутентификация'
      });
      return;
    }

    if (!requiredRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        message: `Требуется одна из ролей: ${requiredRoles.join(', ')}`
      });
      return;
    }

    next();
  };
};

/**
 * Проверяет, что пользователь является администратором
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Проверяет, что пользователь является администратором или модератором
 */
export const requireAdminOrModerator = requireAnyRole([UserRole.ADMIN, UserRole.MODERATOR]);

/**
 * Проверяет, что пользователь имеет доступ к организации
 */
export const requireOrganizationAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Требуется аутентификация'
    });
    return;
  }

  // Администраторы имеют доступ ко всем организациям
  if (req.user.role === UserRole.ADMIN) {
    next();
    return;
  }

  // Получаем organizationId из параметров или тела запроса
  const organizationId = req.params['organizationId'] || req.body['organizationId'];

  if (!organizationId) {
    res.status(400).json({
      error: 'Organization ID required',
      message: 'Требуется ID организации'
    });
    return;
  }

  // Проверяем, что пользователь принадлежит к этой организации
  if (req.user.organizationId !== parseInt(organizationId)) {
    res.status(403).json({
      error: 'Access denied to organization',
      message: 'Нет доступа к данной организации'
    });
    return;
  }

  next();
};

/**
 * Проверяет, что пользователь имеет доступ к ресурсу
 */
export const requireResourceAccess = (resourceUserIdField: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Требуется аутентификация'
      });
      return;
    }

    // Администраторы имеют доступ ко всем ресурсам
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // Получаем ID пользователя ресурса
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (!resourceUserId) {
      res.status(400).json({
        error: 'Resource user ID required',
        message: 'Требуется ID пользователя ресурса'
      });
      return;
    }

    // Проверяем, что пользователь имеет доступ к ресурсу
    if (req.user.userId !== parseInt(resourceUserId)) {
      res.status(403).json({
        error: 'Access denied to resource',
        message: 'Нет доступа к данному ресурсу'
      });
      return;
    }

    next();
  };
};

/**
 * Опциональная аутентификация (не блокирует запрос, если токен отсутствует)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    // Игнорируем ошибки при опциональной аутентификации
    next();
  }
};

/**
 * Проверяет, что пользователь активен
 */
export const requireActiveUser = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Требуется аутентификация'
    });
    return;
  }

  // TODO: Добавить проверку активности пользователя в базе данных
  // Пока просто пропускаем
  next();
};

/**
 * Middleware для проверки роли OWNER
 */
export const requireOwner = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Требуется аутентификация'
    });
    return;
  }

  if (req.user.role !== UserRole.OWNER) {
    res.status(403).json({
      error: 'Owner access required',
      message: 'Требуется роль владельца'
    });
    return;
  }

  next();
};

/**
 * Middleware для проверки роли MODERATOR или выше
 */
export const requireModeratorOrAbove = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Требуется аутентификация'
    });
    return;
  }

  const allowedRoles = [UserRole.ADMIN, UserRole.OWNER, UserRole.MODERATOR];
  if (!allowedRoles.includes(req.user.role)) {
    res.status(403).json({
      error: 'Moderator access required',
      message: 'Требуется роль модератора или выше'
    });
    return;
  }

  next();
};

/**
 * Middleware для проверки роли OWNER или ADMIN
 */
export const requireOwnerOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Требуется аутентификация'
    });
    return;
  }

  const allowedRoles = [UserRole.ADMIN, UserRole.OWNER];
  if (!allowedRoles.includes(req.user.role)) {
    res.status(403).json({
      error: 'Owner or Admin access required',
      message: 'Требуется роль владельца или администратора'
    });
    return;
  }

  next();
};

/**
 * Middleware для логирования аутентификации
 */
export const authLogger = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Логируем начало запроса
  console.log(`[AUTH] ${req.method} ${req.path} - User: ${req.user?.userId || 'Anonymous'}`);

  // Перехватываем ответ
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log(`[AUTH] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalSend.call(this, data);
  };

  next();
};
