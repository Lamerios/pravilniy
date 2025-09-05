import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Middleware для проверки ролей пользователя
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Пользователь не аутентифицирован'
      });
      return;
    }

    if (!user.role) {
      res.status(403).json({
        success: false,
        message: 'Роль пользователя не определена'
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Недостаточно прав для выполнения операции'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware для проверки администраторских прав
 */
export const adminMiddleware = roleMiddleware(['admin']);

/**
 * Middleware для проверки прав менеджера или администратора
 */
export const managerMiddleware = roleMiddleware(['admin', 'manager']);

/**
 * Middleware для проверки прав пользователя, менеджера или администратора
 */
export const userMiddleware = roleMiddleware(['admin', 'manager', 'user']);
