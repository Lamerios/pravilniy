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
 * Создание middleware для валидации тела запроса
 */
export function createValidationMiddleware(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validateObject(req.body, schema);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Ошибки валидации',
        errors
      });
      return;
    }

    next();
  };
}

/**
 * Создание middleware для валидации query параметров
 */
export function createQueryValidationMiddleware(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors = validateObject(req.query, schema);

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Ошибки валидации query параметров',
        errors
      });
      return;
    }

    next();
  };
}

// Схемы валидации для игр
const gameSchemas = {
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
      type: 'string' as const,
      custom: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'ID шаблона обязателен';
        }
        return null;
      }
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
    templateId: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value !== undefined && (!value || value.trim().length === 0)) {
          return 'ID шаблона не может быть пустым';
        }
        return null;
      }
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
    search: {
      type: 'string' as const,
      maxLength: 100
    },
    sortBy: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value && !['name', 'status', 'createdAt', 'updatedAt', 'scheduledAt'].includes(value)) {
          return 'Неверное поле для сортировки';
        }
        return null;
      }
    },
    sortOrder: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value && !['ASC', 'DESC'].includes(value)) {
          return 'Порядок сортировки должен быть ASC или DESC';
        }
        return null;
      }
    },
    status: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value && !['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'].includes(value)) {
          return 'Неверный статус игры';
        }
        return null;
      }
    },
    templateId: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value) {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(value)) {
            return 'Неверный формат ID шаблона';
          }
        }
        return null;
      }
    }
  }
};

// Схемы валидации для шаблонов
const templateSchemas = {
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
    search: {
      type: 'string' as const,
      maxLength: 100
    },
    sortBy: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value && !['name', 'createdAt', 'updatedAt', 'usageCount'].includes(value)) {
          return 'Неверное поле для сортировки';
        }
        return null;
      }
    },
    sortOrder: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value && !['ASC', 'DESC'].includes(value)) {
          return 'Порядок сортировки должен быть ASC или DESC';
        }
        return null;
      }
    },
    difficulty: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value && !['easy', 'medium', 'hard'].includes(value)) {
          return 'Уровень сложности должен быть easy, medium или hard';
        }
        return null;
      }
    }
  }
};

// Схемы валидации для команд
const teamSchemas = {
  createTeam: {
    name: {
      required: true,
      type: 'string' as const,
      minLength: 1,
      maxLength: 100,
      custom: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'Название команды обязательно';
        }
        return null;
      }
    },
    description: {
      type: 'string' as const,
      maxLength: 500
    },
    captain: {
      type: 'string' as const,
      maxLength: 100
    },
    members: {
      type: 'array' as const,
      custom: (value: any[]) => {
        if (value) {
          if (value.length > 20) {
            return 'Максимум 20 участников в команде';
          }
          for (const member of value) {
            if (!member.name || typeof member.name !== 'string') {
              return 'Каждый участник должен иметь имя';
            }
            if (member.email && typeof member.email !== 'string') {
              return 'Email участника должен быть строкой';
            }
          }
        }
        return null;
      }
    },
    contactInfo: {
      type: 'object' as const,
      custom: (value: any) => {
        if (value) {
          if (value.email && typeof value.email !== 'string') {
            return 'Email должен быть строкой';
          }
          if (value.phone && typeof value.phone !== 'string') {
            return 'Телефон должен быть строкой';
          }
          if (value.address && typeof value.address !== 'string') {
            return 'Адрес должен быть строкой';
          }
        }
        return null;
      }
    },
    tableNumber: {
      type: 'number' as const,
      custom: (value: number) => {
        if (value !== undefined) {
          if (value < 1 || value > 999) {
            return 'Номер стола должен быть от 1 до 999';
          }
        }
        return null;
      }
    },
    logoUrl: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value) {
          try {
            new URL(value);
          } catch {
            return 'Неверный формат URL логотипа';
          }
        }
        return null;
      }
    },
    isActive: {
      type: 'boolean' as const
    }
  },

  updateTeam: {
    name: {
      type: 'string' as const,
      minLength: 1,
      maxLength: 100,
      custom: (value: string) => {
        if (value !== undefined && (!value || value.trim().length === 0)) {
          return 'Название команды не может быть пустым';
        }
        return null;
      }
    },
    description: {
      type: 'string' as const,
      maxLength: 500
    },
    captain: {
      type: 'string' as const,
      maxLength: 100
    },
    members: {
      type: 'array' as const,
      custom: (value: any[]) => {
        if (value) {
          if (value.length > 20) {
            return 'Максимум 20 участников в команде';
          }
          for (const member of value) {
            if (!member.name || typeof member.name !== 'string') {
              return 'Каждый участник должен иметь имя';
            }
            if (member.email && typeof member.email !== 'string') {
              return 'Email участника должен быть строкой';
            }
          }
        }
        return null;
      }
    },
    contactInfo: {
      type: 'object' as const,
      custom: (value: any) => {
        if (value) {
          if (value.email && typeof value.email !== 'string') {
            return 'Email должен быть строкой';
          }
          if (value.phone && typeof value.phone !== 'string') {
            return 'Телефон должен быть строкой';
          }
          if (value.address && typeof value.address !== 'string') {
            return 'Адрес должен быть строкой';
          }
        }
        return null;
      }
    },
    tableNumber: {
      type: 'number' as const,
      custom: (value: number) => {
        if (value !== undefined) {
          if (value < 1 || value > 999) {
            return 'Номер стола должен быть от 1 до 999';
          }
        }
        return null;
      }
    },
    logoUrl: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value) {
          try {
            new URL(value);
          } catch {
            return 'Неверный формат URL логотипа';
          }
        }
        return null;
      }
    },
    isActive: {
      type: 'boolean' as const
    }
  },

  teamQuery: {
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
    search: {
      type: 'string' as const,
      maxLength: 100
    },
    sortBy: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value && !['name', 'captain', 'createdAt', 'updatedAt', 'tableNumber'].includes(value)) {
          return 'Неверное поле для сортировки';
        }
        return null;
      }
    },
    sortOrder: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value && !['ASC', 'DESC'].includes(value)) {
          return 'Порядок сортировки должен быть ASC или DESC';
        }
        return null;
      }
    },
    isActive: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value && !['true', 'false'].includes(value)) {
          return 'Фильтр активности должен быть true или false';
        }
        return null;
      }
    },
    organizationId: {
      type: 'string' as const,
      custom: (value: string) => {
        if (value) {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(value)) {
            return 'Неверный формат ID организации';
          }
        }
        return null;
      }
    }
  }
};

/**
 * Валидация настроек игры
 */
function validateGameSettings(settings: any): string[] {
  const errors: string[] = [];

  if (!settings || typeof settings !== 'object') {
    errors.push('Настройки должны быть объектом');
    return errors;
  }

  if (settings.rounds !== undefined) {
    if (!Number.isInteger(settings.rounds) || settings.rounds < 1 || settings.rounds > 20) {
      errors.push('Количество раундов должно быть целым числом от 1 до 20');
    }
  }

  if (settings.questionsPerRound !== undefined) {
    if (!Number.isInteger(settings.questionsPerRound) || settings.questionsPerRound < 1 || settings.questionsPerRound > 50) {
      errors.push('Количество вопросов в раунде должно быть целым числом от 1 до 50');
    }
  }

  if (settings.timePerQuestion !== undefined) {
    if (!Number.isInteger(settings.timePerQuestion) || settings.timePerQuestion < 10 || settings.timePerQuestion > 300) {
      errors.push('Время на вопрос должно быть целым числом от 10 до 300 секунд');
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

/**
 * Валидация настроек шаблона
 */
function validateTemplateSettings(settings: any): string[] {
  const errors: string[] = [];

  if (!settings || typeof settings !== 'object') {
    errors.push('Настройки должны быть объектом');
    return errors;
  }

  if (settings.rounds !== undefined) {
    if (!Number.isInteger(settings.rounds) || settings.rounds < 1 || settings.rounds > 20) {
      errors.push('Количество раундов должно быть целым числом от 1 до 20');
    }
  }

  if (settings.questionsPerRound !== undefined) {
    if (!Number.isInteger(settings.questionsPerRound) || settings.questionsPerRound < 1 || settings.questionsPerRound > 50) {
      errors.push('Количество вопросов в раунде должно быть целым числом от 1 до 50');
    }
  }

  if (settings.timePerQuestion !== undefined) {
    if (!Number.isInteger(settings.timePerQuestion) || settings.timePerQuestion < 10 || settings.timePerQuestion > 300) {
      errors.push('Время на вопрос должно быть целым числом от 10 до 300 секунд');
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

// Экспорт схем валидации
export const gameValidationSchemas = {
  createGame: gameSchemas.createGame,
  updateGame: gameSchemas.updateGame,
  gameQuery: gameSchemas.gameQuery
};

export const templateValidationSchemas = {
  createTemplate: templateSchemas.createTemplate,
  updateTemplate: templateSchemas.updateTemplate,
  templateQuery: templateSchemas.templateQuery
};

export const teamValidationSchemas = {
  createTeam: teamSchemas.createTeam,
  updateTeam: teamSchemas.updateTeam,
  teamQuery: teamSchemas.teamQuery
};
