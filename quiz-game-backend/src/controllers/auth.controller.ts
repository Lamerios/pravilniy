import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import {
  AuthError,
  AuthenticatedRequest,
  ChangePasswordData,
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  SetNewPasswordData,
  ValidationError,
} from '../types/auth.types';

/**
 * Контроллер аутентификации
 * Обрабатывает HTTP запросы для аутентификации
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /auth/login
   * Аутентификация пользователя
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: LoginCredentials = req.body;

      const result = await this.authService.login(credentials);

      res.status(200).json({
        success: true,
        message: 'Успешная аутентификация',
        data: result,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * POST /auth/register
   * Регистрация нового пользователя
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: RegisterData = req.body;

      const result = await this.authService.register(userData);

      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: result,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * POST /auth/refresh
   * Обновление access токена
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token required',
          message: 'Требуется refresh токен',
        });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Токен успешно обновлен',
        data: result,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * POST /auth/change-password
   * Смена пароля
   */
  changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const passwordData: ChangePasswordData = req.body;

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Требуется аутентификация',
        });
        return;
      }

      await this.authService.changePassword(req.user.userId, passwordData);

      res.status(200).json({
        success: true,
        message: 'Пароль успешно изменен',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * POST /auth/forgot-password
   * Запрос сброса пароля
   */
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const resetData: ResetPasswordData = req.body;

      await this.authService.requestPasswordReset(resetData);

      // Всегда возвращаем успех для безопасности
      res.status(200).json({
        success: true,
        message:
          'Если пользователь с таким email существует, инструкции по сбросу пароля отправлены на почту',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * POST /auth/reset-password
   * Установка нового пароля по токену
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const resetData: SetNewPasswordData = req.body;

      await this.authService.setNewPassword(resetData);

      res.status(200).json({
        success: true,
        message: 'Пароль успешно сброшен',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * GET /auth/me
   * Получение информации о текущем пользователе
   */
  getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'Требуется аутентификация',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Информация о пользователе получена',
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * POST /auth/logout
   * Выход из системы (клиентская сторона должна удалить токены)
   */
  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // В JWT нет серверного состояния, поэтому просто возвращаем успех
      // Клиент должен удалить токены на своей стороне

      res.status(200).json({
        success: true,
        message: 'Успешный выход из системы',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * GET /auth/validate
   * Проверка валидности токена
   */
  validateToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'Недействительный токен',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Токен действителен',
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Обработка ошибок
   */
  private handleError(error: any, res: Response): void {
    console.error('Auth Controller Error:', error);

    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.name,
        message: error.message,
      });
      return;
    }

    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: error.name,
        message: error.message,
        field: error.field,
      });
      return;
    }

    // Ошибка валидации Sequelize
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((err: any) => err.message);
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Ошибка валидации данных',
        details: messages,
      });
      return;
    }

    // Ошибка уникальности Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({
        success: false,
        error: 'UniqueConstraintError',
        message: 'Пользователь с такими данными уже существует',
      });
      return;
    }

    // Общая ошибка сервера
    res.status(500).json({
      success: false,
      error: 'InternalServerError',
      message: 'Внутренняя ошибка сервера',
    });
  }
}
