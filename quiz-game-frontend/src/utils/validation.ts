/**
 * Утилиты валидации для frontend
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Валидация одного поля
 */
export function validateField(value: any, rules: ValidationRule): string | null {
  // Проверка обязательности
  if (rules.required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
    return 'Поле обязательно для заполнения';
  }

  // Если поле не обязательно и пустое, пропускаем остальные проверки
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return null;
  }

  // Проверка минимальной длины
  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
    return `Минимальная длина: ${rules.minLength} символов`;
  }

  // Проверка максимальной длины
  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
    return `Максимальная длина: ${rules.maxLength} символов`;
  }

  // Проверка паттерна
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return 'Неверный формат';
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
export function validateObject(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], rules);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Схемы валидации для игр
 */
export const gameValidationSchemas = {
  createGame: {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    description: {
      maxLength: 500
    },
    templateId: {
      required: true,
      custom: (value: any) => {
        if (!value || isNaN(parseInt(value)) || parseInt(value) < 1) {
          return 'Выберите шаблон игры';
        }
        return null;
      }
    },
    scheduledAt: {
      custom: (value: any) => {
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return 'Неверный формат даты';
          }
          if (date <= new Date()) {
            return 'Дата планирования должна быть в будущем';
          }
        }
        return null;
      }
    },
    'settings.maxTeams': {
      custom: (value: any) => {
        if (value !== undefined && value !== null && value !== '') {
          const num = parseInt(value);
          if (isNaN(num) || num < 1 || num > 50) {
            return 'Максимальное количество команд должно быть от 1 до 50';
          }
        }
        return null;
      }
    },
    'settings.timeLimit': {
      custom: (value: any) => {
        if (value !== undefined && value !== null && value !== '') {
          const num = parseInt(value);
          if (isNaN(num) || num < 0) {
            return 'Временной лимит должен быть неотрицательным числом';
          }
        }
        return null;
      }
    }
  },

  updateGame: {
    name: {
      minLength: 3,
      maxLength: 100,
      custom: (value: any) => {
        if (value !== undefined && (!value || value.trim().length === 0)) {
          return 'Название игры не может быть пустым';
        }
        return null;
      }
    },
    description: {
      maxLength: 500
    },
    scheduledAt: {
      custom: (value: any) => {
        if (value) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return 'Неверный формат даты';
          }
          if (date <= new Date()) {
            return 'Дата планирования должна быть в будущем';
          }
        }
        return null;
      }
    },
    'settings.maxTeams': {
      custom: (value: any) => {
        if (value !== undefined && value !== null && value !== '') {
          const num = parseInt(value);
          if (isNaN(num) || num < 1 || num > 50) {
            return 'Максимальное количество команд должно быть от 1 до 50';
          }
        }
        return null;
      }
    },
    'settings.timeLimit': {
      custom: (value: any) => {
        if (value !== undefined && value !== null && value !== '') {
          const num = parseInt(value);
          if (isNaN(num) || num < 0) {
            return 'Временной лимит должен быть неотрицательным числом';
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
      minLength: 3,
      maxLength: 100
    },
    description: {
      maxLength: 500
    },
    'settings.roundsCount': {
      required: true,
      custom: (value: any) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1 || num > 20) {
          return 'Количество раундов должно быть от 1 до 20';
        }
        return null;
      }
    },
    'settings.questionsPerRound': {
      required: true,
      custom: (value: any) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1 || num > 50) {
          return 'Количество вопросов в раунде должно быть от 1 до 50';
        }
        return null;
      }
    },
    'settings.timePerQuestion': {
      required: true,
      custom: (value: any) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 10 || num > 300) {
          return 'Время на вопрос должно быть от 10 до 300 секунд';
        }
        return null;
      }
    }
  },

  updateTemplate: {
    name: {
      minLength: 3,
      maxLength: 100,
      custom: (value: any) => {
        if (value !== undefined && (!value || value.trim().length === 0)) {
          return 'Название шаблона не может быть пустым';
        }
        return null;
      }
    },
    description: {
      maxLength: 500
    },
    'settings.roundsCount': {
      custom: (value: any) => {
        if (value !== undefined) {
          const num = parseInt(value);
          if (isNaN(num) || num < 1 || num > 20) {
            return 'Количество раундов должно быть от 1 до 20';
          }
        }
        return null;
      }
    },
    'settings.questionsPerRound': {
      custom: (value: any) => {
        if (value !== undefined) {
          const num = parseInt(value);
          if (isNaN(num) || num < 1 || num > 50) {
            return 'Количество вопросов в раунде должно быть от 1 до 50';
          }
        }
        return null;
      }
    },
    'settings.timePerQuestion': {
      custom: (value: any) => {
        if (value !== undefined) {
          const num = parseInt(value);
          if (isNaN(num) || num < 10 || num > 300) {
            return 'Время на вопрос должно быть от 10 до 300 секунд';
          }
        }
        return null;
      }
    }
  }
};

/**
 * Валидация формы создания игры
 */
export function validateCreateGameForm(data: any): ValidationResult {
  return validateObject(data, gameValidationSchemas.createGame);
}

/**
 * Валидация формы обновления игры
 */
export function validateUpdateGameForm(data: any): ValidationResult {
  return validateObject(data, gameValidationSchemas.updateGame);
}

/**
 * Валидация формы создания шаблона
 */
export function validateCreateTemplateForm(data: any): ValidationResult {
  return validateObject(data, templateValidationSchemas.createTemplate);
}

/**
 * Валидация формы обновления шаблона
 */
export function validateUpdateTemplateForm(data: any): ValidationResult {
  return validateObject(data, templateValidationSchemas.updateTemplate);
}

/**
 * Валидация email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Валидация пароля
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну строчную букву');
  }

  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Валидация URL
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Валидация номера телефона (российский формат)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Санитизация строки (удаление HTML тегов и экранирование)
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/<[^>]*>/g, '') // Удаление HTML тегов
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Валидация и санитизация текстового поля
 */
export function validateAndSanitizeText(value: string, maxLength?: number): { value: string; error: string | null } {
  const sanitized = sanitizeString(value);

  if (maxLength && sanitized.length > maxLength) {
    return {
      value: sanitized,
      error: `Максимальная длина: ${maxLength} символов`
    };
  }

  return {
    value: sanitized,
    error: null
  };
}
