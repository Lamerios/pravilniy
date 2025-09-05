import { NextFunction, Request, Response } from 'express';

/**
 * Общий middleware для валидации данных
 */
export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Валидация одного поля
 */
function validateField(value: any, rules: ValidationRule, fieldName: string): string | null {
  // Проверка обязательности
  if (rules.required && (value === undefined || value === null || value === '')) {
    return `Поле ${fieldName} обязательно`;
  }

  // Если поле не обязательно и пустое, пропускаем остальные проверки
  if (value === undefined || value === null || value === '') {
    return null;
  }

  // Проверка типа
  if (rules.type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rules.type) {
      return `Поле ${fieldName} должно быть типа ${rules.type}`;
    }
  }

  // Проверка числовых значений
  if (rules.type === 'number' || typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return `Поле ${fieldName} должно быть не менее ${rules.min}`;
    }
    if (rules.max !== undefined && value > rules.max) {
      return `Поле ${fieldName} должно быть не более ${rules.max}`;
    }
  }

  // Проверка строковых значений
  if (typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return `Поле ${fieldName} должно содержать минимум ${rules.minLength} символов`;
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return `Поле ${fieldName} должно содержать максимум ${rules.maxLength} символов`;
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      return `Поле ${fieldName} имеет неверный формат`;
    }
  }

  // Проверка enum значений
  if (rules.enum && !rules.enum.includes(value)) {
    return `Поле ${fieldName} должно быть одним из: ${rules.enum.join(', ')}`;
  }

  // Кастомная валидация
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

/**
 * Валидация объекта по схеме
 */
function validateObject(data: any, schema: ValidationSchema): string[] {
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], rules, field);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

/**
 * Создание middleware валидации
 */
export function createValidationMiddleware(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validateObject(req.body, schema);

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
}

/**
 * Создание middleware валидации для query параметров
 */
export function createQueryValidationMiddleware(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validateObject(req.query, schema);

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
}

/**
 * Схемы валидации для игр
 */
export const gameValidationSchemas = {
  createGame: {
    name: {
      required: true,
      type: 'string' as const,
      minLength: 3,
      maxLength: 100
    },
    description: {
      type: 'string' as const,
      maxLength: 500
    },
    templateId: {
      required: true,
      type: 'number' as const,
      min: 1
    },
    scheduledAt: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return 'Неверный формат даты планирования';
          }
          if (date < new Date()) {
            return 'Дата планирования не может быть в прошлом';
          }
        }
        return null;
      }
    },
    settings: {
      type: 'object' as const,
      custom: (value: any) => {
        if (value) {
          const settingsErrors = validateGameSettings(value);
          return settingsErrors.length > 0 ? settingsErrors.join('; ') : null;
        }
        return null;
      }
    }
  },

  updateGame: {
    name: {
      type: 'string' as const,
      minLength: 3,
      maxLength: 100,
      custom: (value: string) => {
        if (value !== undefined && (!value || value.trim().length === 0)) {
          return 'Название игры не может быть пустым';
        }
        return null;
      }
    },
    description: {
      type: 'string' as const,
      maxLength: 500
    },
    scheduledAt: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return 'Неверный формат даты планирования';
          }
          if (date < new Date()) {
            return 'Дата планирования не может быть в прошлом';
          }
        }
        return null;
      }
    },
    settings: {
      type: 'object' as const,
      custom: (value: any) => {
        if (value) {
          const settingsErrors = validateGameSettings(value);
          return settingsErrors.length > 0 ? settingsErrors.join('; ') : null;
        }
        return null;
      }
    }
  },

  gameQuery: {
    page: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value) {
          const page = parseInt(value);
          if (isNaN(page) || page < 1) {
            return 'Номер страницы должен быть положительным числом';
          }
        }
        return null;
      }
    },
    limit: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value) {
          const limit = parseInt(value);
          if (isNaN(limit) || limit < 1 || limit > 100) {
            return 'Лимит должен быть числом от 1 до 100';
          }
        }
        return null;
      }
    },
    sortBy: {
      type: 'string' as const,
      enum: ['name', 'createdAt', 'updatedAt', 'status', 'scheduledAt']
    },
    sortOrder: {
      type: 'string' as const,
      enum: ['ASC', 'DESC']
    },
    status: {
      type: 'string' as const,
      enum: ['DRAFT', 'WAITING', 'ACTIVE', 'PAUSED', 'FINISHED', 'CANCELLED']
    },
    templateId: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value) {
          const templateId = parseInt(value);
          if (isNaN(templateId) || templateId < 1) {
            return 'ID шаблона должен быть положительным числом';
          }
        }
        return null;
      }
    },
    organizationId: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value) {
          const organizationId = parseInt(value);
          if (isNaN(organizationId) || organizationId < 1) {
            return 'ID организации должен быть положительным числом';
          }
        }
        return null;
      }
    }
  }
};

/**
 * Схемы валидации для шаблонов
 */
export const templateValidationSchemas = {
  createTemplate: {
    name: {
      required: true,
      type: 'string' as const,
      minLength: 3,
      maxLength: 100
    },
    description: {
      type: 'string' as const,
      maxLength: 500
    },
    settings: {
      required: true,
      type: 'object' as const,
      custom: (value: any) => {
        if (value) {
          const settingsErrors = validateTemplateSettings(value);
          return settingsErrors.length > 0 ? settingsErrors.join('; ') : null;
        }
        return null;
      }
    },
    tags: {
      type: 'array' as const,
      custom: (value: any[]) => {
        if (value) {
          if (value.length > 10) {
            return 'Максимум 10 тегов';
          }
          for (const tag of value) {
            if (typeof tag !== 'string' || tag.length > 20) {
              return 'Тег должен быть строкой не более 20 символов';
            }
          }
        }
        return null;
      }
    }
  },

  updateTemplate: {
    name: {
      type: 'string' as const,
      minLength: 3,
      maxLength: 100,
      custom: (value: string) => {
        if (value !== undefined && (!value || value.trim().length === 0)) {
          return 'Название шаблона не может быть пустым';
        }
        return null;
      }
    },
    description: {
      type: 'string' as const,
      maxLength: 500
    },
    settings: {
      type: 'object' as const,
      custom: (value: any) => {
        if (value) {
          const settingsErrors = validateTemplateSettings(value);
          return settingsErrors.length > 0 ? settingsErrors.join('; ') : null;
        }
        return null;
      }
    },
    tags: {
      type: 'array' as const,
      custom: (value: any[]) => {
        if (value) {
          if (value.length > 10) {
            return 'Максимум 10 тегов';
          }
          for (const tag of value) {
            if (typeof tag !== 'string' || tag.length > 20) {
              return 'Тег должен быть строкой не более 20 символов';
            }
          }
        }
        return null;
      }
    }
  },

  templateQuery: {
    page: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value) {
          const page = parseInt(value);
          if (isNaN(page) || page < 1) {
            return 'Номер страницы должен быть положительным числом';
          }
        }
        return null;
      }
    },
    limit: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value) {
          const limit = parseInt(value);
          if (isNaN(limit) || limit < 1 || limit > 100) {
            return 'Лимит должен быть числом от 1 до 100';
          }
        }
        return null;
      }
    },
    sortBy: {
      type: 'string' as const,
      enum: ['name', 'createdAt', 'updatedAt', 'isPublic']
    },
    sortOrder: {
      type: 'string' as const,
      enum: ['ASC', 'DESC']
    },
    isPublic: {
      type: 'string' as const,
      enum: ['true', 'false']
    },
    difficulty: {
      type: 'string' as const,
      enum: ['easy', 'medium', 'hard']
    }
  }
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
    if (typeof settings.timeLimit !== 'number' || settings.timeLimit < 0) {
      errors.push('Временной лимит должен быть неотрицательным числом');
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

/**
 * Валидация настроек шаблона
 */
function validateTemplateSettings(settings: any): string[] {
  const errors: string[] = [];

  if (settings.roundsCount !== undefined) {
    if (typeof settings.roundsCount !== 'number' || settings.roundsCount < 1 || settings.roundsCount > 20) {
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
