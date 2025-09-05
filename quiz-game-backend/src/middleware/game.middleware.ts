import { NextFunction, Request, Response } from 'express';
import { CreateGameDto, UpdateGameDto } from '../types/game.types';

/**
 * Middleware для валидации данных создания игры
 */
export const validateCreateGame = (req: Request, res: Response, next: NextFunction): void => {
  const data: CreateGameDto = req.body;
  const errors: string[] = [];

  // Проверка обязательных полей
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Название игры обязательно');
  }

  if (!data.templateId) {
    errors.push('ID шаблона обязателен');
  }

  // Проверка названия
  if (data.name && data.name.length > 100) {
    errors.push('Название игры не должно превышать 100 символов');
  }

  // Проверка описания
  if (data.description && data.description.length > 500) {
    errors.push('Описание не должно превышать 500 символов');
  }

  // Проверка ID шаблона
  if (data.templateId && (typeof data.templateId !== 'number' || data.templateId < 1)) {
    errors.push('ID шаблона должен быть положительным числом');
  }

  // Проверка даты планирования
  if (data.scheduledAt) {
    const scheduledDate = new Date(data.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      errors.push('Неверный формат даты планирования');
    } else if (scheduledDate < new Date()) {
      errors.push('Дата планирования не может быть в прошлом');
    }
  }

  // Проверка настроек
  if (data.settings) {
    const settingsErrors = validateGameSettings(data.settings);
    errors.push(...settingsErrors);
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
 * Middleware для валидации данных обновления игры
 */
export const validateUpdateGame = (req: Request, res: Response, next: NextFunction): void => {
  const data: UpdateGameDto = req.body;
  const errors: string[] = [];

  // Проверка названия
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Название игры не может быть пустым');
    } else if (data.name.length > 100) {
      errors.push('Название игры не должно превышать 100 символов');
    }
  }

  // Проверка описания
  if (data.description !== undefined && data.description && data.description.length > 500) {
    errors.push('Описание не должно превышать 500 символов');
  }

  // Проверка даты планирования
  if (data.scheduledAt !== undefined && data.scheduledAt) {
    const scheduledDate = new Date(data.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      errors.push('Неверный формат даты планирования');
    } else if (scheduledDate < new Date()) {
      errors.push('Дата планирования не может быть в прошлом');
    }
  }

  // Проверка настроек
  if (data.settings) {
    const settingsErrors = validateGameSettings(data.settings);
    errors.push(...settingsErrors);
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
 * Middleware для валидации параметров запроса
 */
export const validateGameQuery = (req: Request, res: Response, next: NextFunction): void => {
  const errors: string[] = [];

  // Проверка пагинации
  if (req.query['page']) {
    const page = parseInt(req.query['page'] as string);
    if (isNaN(page) || page < 1) {
      errors.push('Номер страницы должен быть положительным числом');
    }
  }

  if (req.query['limit']) {
    const limit = parseInt(req.query['limit'] as string);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push('Лимит должен быть числом от 1 до 100');
    }
  }

  // Проверка сортировки
  if (req.query['sortBy']) {
    const allowedSortFields = ['name', 'createdAt', 'updatedAt', 'status', 'scheduledAt'];
    if (!allowedSortFields.includes(req.query['sortBy'] as string)) {
      errors.push(`Поле сортировки должно быть одним из: ${allowedSortFields.join(', ')}`);
    }
  }

  if (req.query['sortOrder']) {
    if (!['ASC', 'DESC'].includes(req.query['sortOrder'] as string)) {
      errors.push('Порядок сортировки должен быть ASC или DESC');
    }
  }

  // Проверка фильтров
  if (req.query['status']) {
    const allowedStatuses = ['draft', 'scheduled', 'active', 'paused', 'finished', 'cancelled'];
    if (!allowedStatuses.includes(req.query['status'] as string)) {
      errors.push(`Статус должен быть одним из: ${allowedStatuses.join(', ')}`);
    }
  }

  if (req.query['templateId']) {
    const templateId = parseInt(req.query['templateId'] as string);
    if (isNaN(templateId) || templateId < 1) {
      errors.push('ID шаблона должен быть положительным числом');
    }
  }

  if (req.query['organizationId']) {
    const organizationId = parseInt(req.query['organizationId'] as string);
    if (isNaN(organizationId) || organizationId < 1) {
      errors.push('ID организации должен быть положительным числом');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Ошибка валидации параметров запроса',
      details: errors
    });
    return;
  }

  next();
};

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
 * Валидация настроек игры
 */
function validateGameSettings(settings: any): string[] {
  const errors: string[] = [];

  if (settings.maxTeams !== undefined) {
    if (typeof settings.maxTeams !== 'number' || settings.maxTeams < 1 || settings.maxTeams > 50) {
      errors.push('Максимальное количество команд должно быть числом от 1 до 50');
    }
  }

  if (settings.timeLimit !== undefined) {
    if (typeof settings.timeLimit !== 'number' || settings.timeLimit < 60 || settings.timeLimit > 1440) {
      errors.push('Временной лимит должен быть числом от 60 до 1440 минут');
    }
  }

  if (settings.allowLateJoin !== undefined && typeof settings.allowLateJoin !== 'boolean') {
    errors.push('allowLateJoin должен быть булевым значением');
  }

  if (settings.autoStart !== undefined && typeof settings.autoStart !== 'boolean') {
    errors.push('autoStart должен быть булевым значением');
  }

  if (settings.customRules !== undefined && typeof settings.customRules !== 'object') {
    errors.push('customRules должен быть объектом');
  }

  return errors;
}
