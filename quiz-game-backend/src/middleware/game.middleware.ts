import { NextFunction, Request, Response } from 'express';
import { createQueryValidationMiddleware, createValidationMiddleware, gameValidationSchemas } from './validation.middleware';

/**
 * Middleware для валидации данных создания игры
 */
export const validateCreateGame = createValidationMiddleware(gameValidationSchemas.createGame);

/**
 * Middleware для валидации данных обновления игры
 */
export const validateUpdateGame = createValidationMiddleware(gameValidationSchemas.updateGame);

/**
 * Middleware для валидации параметров запроса
 */
export const validateGameQuery = createQueryValidationMiddleware(gameValidationSchemas.gameQuery);

/**
 * Middleware для валидации изменения состояния игры
 */
export const validateGameStateChange = (req: Request, res: Response, next: NextFunction): void => {
  const errors: string[] = [];

  const allowedActions = ['start', 'pause', 'resume', 'stop', 'finish'];
  const action = req.body.action;

  if (!action) {
    errors.push('Действие обязательно');
  } else if (!allowedActions.includes(action)) {
    errors.push(`Действие должно быть одним из: ${allowedActions.join(', ')}`);
  }

  if (req.body.reason && typeof req.body.reason !== 'string') {
    errors.push('Причина должна быть строкой');
  }

  if (req.body.reason && req.body.reason.length > 200) {
    errors.push('Причина не должна превышать 200 символов');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Ошибка валидации данных',
      details: errors
    });
    return;
  }

  next();
};
