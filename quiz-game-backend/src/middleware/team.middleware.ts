import { NextFunction, Request, Response } from 'express';
import { createQueryValidationMiddleware, createValidationMiddleware, teamValidationSchemas } from './validation.middleware';

/**
 * Валидация создания команды
 */
export const validateCreateTeam = createValidationMiddleware(teamValidationSchemas.createTeam);

/**
 * Валидация обновления команды
 */
export const validateUpdateTeam = createValidationMiddleware(teamValidationSchemas.updateTeam);

/**
 * Валидация запроса списка команд
 */
export const validateTeamQuery = createQueryValidationMiddleware(teamValidationSchemas.teamQuery);

/**
 * Валидация данных команды
 */
export const validateTeamData = (req: Request, res: Response, next: NextFunction): void => {
  const { name, description, captain, members, contactInfo, tableNumber, logoUrl } = req.body;

  // Валидация обязательных полей
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Название команды обязательно'
    });
    return;
  }

  if (name.length > 100) {
    res.status(400).json({
      success: false,
      message: 'Название команды не должно превышать 100 символов'
    });
    return;
  }

  // Валидация описания
  if (description && (typeof description !== 'string' || description.length > 500)) {
    res.status(400).json({
      success: false,
      message: 'Описание не должно превышать 500 символов'
    });
    return;
  }

  // Валидация капитана
  if (captain && (typeof captain !== 'string' || captain.length > 100)) {
    res.status(400).json({
      success: false,
      message: 'Имя капитана не должно превышать 100 символов'
    });
    return;
  }

  // Валидация участников
  if (members && Array.isArray(members)) {
    for (const member of members) {
      if (!member.name || typeof member.name !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Каждый участник должен иметь имя'
        });
        return;
      }

      if (member.email && typeof member.email !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Email участника должен быть строкой'
        });
        return;
      }
    }
  }

  // Валидация контактной информации
  if (contactInfo && typeof contactInfo === 'object') {
    const { email, phone, address } = contactInfo;

    if (email && typeof email !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Email должен быть строкой'
      });
      return;
    }

    if (phone && typeof phone !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Телефон должен быть строкой'
      });
      return;
    }

    if (address && typeof address !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Адрес должен быть строкой'
      });
      return;
    }
  }

  // Валидация номера стола
  if (tableNumber !== undefined) {
    if (typeof tableNumber !== 'number' || tableNumber < 1 || tableNumber > 999) {
      res.status(400).json({
        success: false,
        message: 'Номер стола должен быть числом от 1 до 999'
      });
      return;
    }
  }

  // Валидация URL логотипа
  if (logoUrl && typeof logoUrl !== 'string') {
    res.status(400).json({
      success: false,
      message: 'URL логотипа должен быть строкой'
    });
    return;
  }

  next();
};

/**
 * Валидация запроса списка команд
 */
export const validateTeamQueryParams = (req: Request, res: Response, next: NextFunction): void => {
  const { page, limit, search, sortBy, sortOrder, isActive, organizationId } = req.query;

  // Валидация пагинации
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    res.status(400).json({
      success: false,
      message: 'Номер страницы должен быть положительным числом'
    });
    return;
  }

  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    res.status(400).json({
      success: false,
      message: 'Лимит должен быть числом от 1 до 100'
    });
    return;
  }

  // Валидация поиска
  if (search && typeof search !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Параметр поиска должен быть строкой'
    });
    return;
  }

  // Валидация сортировки
  if (sortBy && typeof sortBy !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Поле сортировки должно быть строкой'
    });
    return;
  }

  if (sortOrder && !['ASC', 'DESC'].includes(sortOrder as string)) {
    res.status(400).json({
      success: false,
      message: 'Порядок сортировки должен быть ASC или DESC'
    });
    return;
  }

  // Валидация фильтра активности
  if (isActive && !['true', 'false'].includes(isActive as string)) {
    res.status(400).json({
      success: false,
      message: 'Фильтр активности должен быть true или false'
    });
    return;
  }

  // Валидация ID организации
  if (organizationId && typeof organizationId !== 'string') {
    res.status(400).json({
      success: false,
      message: 'ID организации должен быть строкой'
    });
    return;
  }

  next();
};

/**
 * Валидация ID команды
 */
export const validateTeamId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    res.status(400).json({
      success: false,
      message: 'ID команды обязателен'
    });
    return;
  }

  // Проверяем формат UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    res.status(400).json({
      success: false,
      message: 'Неверный формат ID команды'
    });
    return;
  }

  next();
};

/**
 * Валидация номера стола
 */
export const validateTableNumber = (req: Request, res: Response, next: NextFunction): void => {
  const { tableNumber } = req.params;

  if (!tableNumber || isNaN(Number(tableNumber))) {
    res.status(400).json({
      success: false,
      message: 'Номер стола должен быть числом'
    });
    return;
  }

  const num = Number(tableNumber);
  if (num < 1 || num > 999) {
    res.status(400).json({
      success: false,
      message: 'Номер стола должен быть от 1 до 999'
    });
    return;
  }

  next();
};
