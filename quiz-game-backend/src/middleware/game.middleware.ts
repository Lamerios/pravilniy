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

/**
 * Middleware для валидации добавления команд в игру
 */
export const validateAddTeamsToGame = (req: Request, res: Response, next: NextFunction): void => {
  const errors: string[] = [];

  const { teamIds } = req.body;

  if (!teamIds) {
    errors.push('Список ID команд обязателен');
  } else if (!Array.isArray(teamIds)) {
    errors.push('teamIds должен быть массивом');
  } else if (teamIds.length === 0) {
    errors.push('Список команд не может быть пустым');
  } else if (teamIds.length > 20) {
    errors.push('Максимум 20 команд за раз');
  } else {
    // Проверяем, что все ID являются строками
    for (let i = 0; i < teamIds.length; i++) {
      if (typeof teamIds[i] !== 'string' || teamIds[i].trim() === '') {
        errors.push(`ID команды ${i + 1} должен быть непустой строкой`);
      }
    }
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

/**
 * Middleware для валидации удаления команд из игры
 */
export const validateRemoveTeamsFromGame = (req: Request, res: Response, next: NextFunction): void => {
  const errors: string[] = [];

  const { teamIds } = req.body;

  if (!teamIds) {
    errors.push('Список ID команд обязателен');
  } else if (!Array.isArray(teamIds)) {
    errors.push('teamIds должен быть массивом');
  } else if (teamIds.length === 0) {
    errors.push('Список команд не может быть пустым');
  } else {
    // Проверяем, что все ID являются строками
    for (let i = 0; i < teamIds.length; i++) {
      if (typeof teamIds[i] !== 'string' || teamIds[i].trim() === '') {
        errors.push(`ID команды ${i + 1} должен быть непустой строкой`);
      }
    }
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
