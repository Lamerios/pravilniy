import { NextFunction, Request, Response } from 'express';
import { CreateTemplateDto, UpdateTemplateDto } from '../types/template.types';

/**
 * Middleware для валидации данных создания шаблона
 */
export const validateCreateTemplate = (req: Request, res: Response, next: NextFunction): void => {
  const data: CreateTemplateDto = req.body;
  const errors: string[] = [];

  // Проверка обязательных полей
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Название шаблона обязательно');
  }

  if (!data.settings) {
    errors.push('Настройки шаблона обязательны');
  }

  // Проверка названия
  if (data.name && data.name.length > 100) {
    errors.push('Название шаблона не должно превышать 100 символов');
  }

  // Проверка описания
  if (data.description && data.description.length > 500) {
    errors.push('Описание не должно превышать 500 символов');
  }

  // Проверка настроек
  if (data.settings) {
    const settingsErrors = validateTemplateSettings(data.settings);
    errors.push(...settingsErrors);
  }

  // Проверка тегов
  if (data.tags && Array.isArray(data.tags)) {
    if (data.tags.length > 10) {
      errors.push('Максимум 10 тегов');
    }

    for (const tag of data.tags) {
      if (typeof tag !== 'string' || tag.length > 20) {
        errors.push('Тег должен быть строкой не более 20 символов');
        break;
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
 * Middleware для валидации данных обновления шаблона
 */
export const validateUpdateTemplate = (req: Request, res: Response, next: NextFunction): void => {
  const data: UpdateTemplateDto = req.body;
  const errors: string[] = [];

  // Проверка названия
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Название шаблона не может быть пустым');
    } else if (data.name.length > 100) {
      errors.push('Название шаблона не должно превышать 100 символов');
    }
  }

  // Проверка описания
  if (data.description !== undefined && data.description && data.description.length > 500) {
    errors.push('Описание не должно превышать 500 символов');
  }

  // Проверка настроек
  if (data.settings) {
    const settingsErrors = validateTemplateSettings(data.settings);
    errors.push(...settingsErrors);
  }

  // Проверка тегов
  if (data.tags !== undefined && Array.isArray(data.tags)) {
    if (data.tags.length > 10) {
      errors.push('Максимум 10 тегов');
    }

    for (const tag of data.tags) {
      if (typeof tag !== 'string' || tag.length > 20) {
        errors.push('Тег должен быть строкой не более 20 символов');
        break;
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
 * Middleware для валидации параметров запроса
 */
export const validateTemplateQuery = (req: Request, res: Response, next: NextFunction): void => {
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
    const allowedSortFields = ['name', 'createdAt', 'updatedAt', 'isPublic'];
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
  if (req.query['isPublic']) {
    if (!['true', 'false'].includes(req.query['isPublic'] as string)) {
      errors.push('Фильтр isPublic должен быть true или false');
    }
  }

  if (req.query['difficulty']) {
    if (!['easy', 'medium', 'hard'].includes(req.query['difficulty'] as string)) {
      errors.push('Уровень сложности должен быть easy, medium или hard');
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
 * Валидация настроек шаблона
 */
function validateTemplateSettings(settings: any): string[] {
  const errors: string[] = [];

  if (settings.rounds !== undefined) {
    if (typeof settings.rounds !== 'number' || settings.rounds < 1 || settings.rounds > 20) {
      errors.push('Количество раундов должно быть числом от 1 до 20');
    }
  }

  if (settings.questionsPerRound !== undefined) {
    if (typeof settings.questionsPerRound !== 'number' || settings.questionsPerRound < 1 || settings.questionsPerRound > 50) {
      errors.push('Количество вопросов в раунде должно быть числом от 1 до 50');
    }
  }

  if (settings.timePerQuestion !== undefined) {
    if (typeof settings.timePerQuestion !== 'number' || settings.timePerQuestion < 10 || settings.timePerQuestion > 300) {
      errors.push('Время на вопрос должно быть числом от 10 до 300 секунд');
    }
  }

  if (settings.scoringSystem !== undefined) {
    if (!['standard', 'bonus', 'penalty'].includes(settings.scoringSystem)) {
      errors.push('Система подсчета очков должна быть standard, bonus или penalty');
    }
  }

  if (settings.bonusPoints !== undefined) {
    if (typeof settings.bonusPoints !== 'number' || settings.bonusPoints < 0 || settings.bonusPoints > 100) {
      errors.push('Бонусные очки должны быть числом от 0 до 100');
    }
  }

  if (settings.penaltyPoints !== undefined) {
    if (typeof settings.penaltyPoints !== 'number' || settings.penaltyPoints < 0 || settings.penaltyPoints > 100) {
      errors.push('Штрафные очки должны быть числом от 0 до 100');
    }
  }

  if (settings.difficulty !== undefined) {
    if (!['easy', 'medium', 'hard'].includes(settings.difficulty)) {
      errors.push('Уровень сложности должен быть easy, medium или hard');
    }
  }

  if (settings.categories !== undefined) {
    if (!Array.isArray(settings.categories)) {
      errors.push('Категории должны быть массивом');
    } else if (settings.categories.length > 20) {
      errors.push('Максимум 20 категорий');
    }
  }

  return errors;
}
