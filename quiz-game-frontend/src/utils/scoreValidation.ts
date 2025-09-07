import { BetType } from '../services/score.service';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ScoreValidationOptions {
  allowNegative?: boolean;
  minPoints?: number;
  maxPoints?: number;
  criticalLowThreshold?: number;
  criticalHighThreshold?: number;
}

/**
 * Валидация баллов
 */
export const validatePoints = (
  points: number,
  options: ScoreValidationOptions = {}
): ValidationResult => {
  const {
    allowNegative = true,
    minPoints = -1000,
    maxPoints = 10000,
    criticalLowThreshold = -100,
    criticalHighThreshold = 1000
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Проверка на число
  if (!Number.isInteger(points)) {
    errors.push('Баллы должны быть целым числом');
    return { isValid: false, errors, warnings };
  }

  // Проверка на отрицательность
  if (!allowNegative && points < 0) {
    errors.push('Баллы не могут быть отрицательными');
  }

  // Проверка диапазона
  if (points < minPoints) {
    errors.push(`Баллы не могут быть меньше ${minPoints}`);
  }

  if (points > maxPoints) {
    errors.push(`Баллы не могут быть больше ${maxPoints}`);
  }

  // Предупреждения только для действительно критических значений
  if (points < criticalLowThreshold) {
    warnings.push('Критически низкие баллы - проверьте правильность ввода');
  }

  if (points > criticalHighThreshold) {
    warnings.push('Критически высокие баллы - проверьте правильность ввода');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Валидация ставки
 */
export const validateBet = (
  bet: number | undefined,
  betType: BetType | undefined,
  minBet?: number,
  maxBet?: number
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (bet === undefined) {
    return { isValid: true, errors, warnings };
  }

  // Проверка на отрицательность
  if (bet < 0) {
    errors.push('Ставка не может быть отрицательной');
    return { isValid: false, errors, warnings };
  }

  // Проверка диапазона ставок
  if (minBet !== undefined && bet < minBet) {
    errors.push(`Ставка не может быть меньше ${minBet}`);
  }

  if (maxBet !== undefined && bet > maxBet) {
    errors.push(`Ставка не может быть больше ${maxBet}`);
  }

  // Валидация по типу ставки
  if (betType) {
    switch (betType) {
      case 'MULTIPLIER':
        if (bet < 0.1 || bet > 10) {
          errors.push('Множитель должен быть от 0.1 до 10');
        } else if (bet === 1) {
          warnings.push('Множитель равен 1 - баллы не изменятся');
        }
        break;
      case 'BONUS':
        if (bet < -100 || bet > 100) {
          errors.push('Бонус должен быть от -100 до 100');
        } else if (bet === 0) {
          warnings.push('Бонус равен 0 - баллы не изменятся');
        }
        break;
      case 'FIXED':
        if (bet < 0 || bet > 1000) {
          errors.push('Фиксированные баллы должны быть от 0 до 1000');
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Валидация заметок
 */
export const validateNotes = (notes?: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (notes && notes.length > 500) {
    errors.push('Заметки не могут превышать 500 символов');
  }

  if (notes && notes.trim().length === 0) {
    warnings.push('Заметки содержат только пробелы');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Комплексная валидация данных о баллах
 */
export const validateScoreData = (data: {
  points: number;
  bet?: number | undefined;
  betType?: BetType | undefined;
  minBet?: number | undefined;
  maxBet?: number | undefined;
  notes?: string | undefined;
}, options: ScoreValidationOptions = {}): ValidationResult => {
  const pointsResult = validatePoints(data.points, options);
  const betResult = validateBet(data.bet, data.betType, data.minBet, data.maxBet);
  const notesResult = validateNotes(data.notes);

  const allErrors = [
    ...pointsResult.errors,
    ...betResult.errors,
    ...notesResult.errors
  ];

  const allWarnings = [
    ...pointsResult.warnings,
    ...betResult.warnings,
    ...notesResult.warnings
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};

/**
 * Проверка необходимости подтверждения для критических значений
 */
export const requiresConfirmation = (
  points: number,
  options: ScoreValidationOptions = {}
): boolean => {
  const {
    criticalLowThreshold = -25,
    criticalHighThreshold = 50
  } = options;

  return points < criticalLowThreshold || points > criticalHighThreshold;
};

/**
 * Форматирование ошибок валидации для отображения
 */
export const formatValidationErrors = (result: ValidationResult): string[] => {
  return [...result.errors, ...result.warnings];
};

/**
 * Получение типа алерта на основе результата валидации
 */
export const getValidationAlertType = (result: ValidationResult): 'error' | 'warning' | 'success' => {
  if (result.errors.length > 0) {
    return 'error';
  }
  if (result.warnings.length > 0) {
    return 'warning';
  }
  return 'success';
};

/**
 * Валидация массовых данных о баллах
 */
export const validateBulkScoreData = (scores: Array<{
  teamId: number;
  points: number;
  bet?: number;
  betType?: BetType;
  notes?: string;
}>, options: ScoreValidationOptions = {}): {
  isValid: boolean;
  teamErrors: Record<number, ValidationResult>;
  globalErrors: string[];
} => {
  const teamErrors: Record<number, ValidationResult> = {};
  const globalErrors: string[] = [];

  // Проверка на дубликаты команд
  const teamIds = scores.map(score => score.teamId);
  const duplicateTeams = teamIds.filter((id, index) => teamIds.indexOf(id) !== index);

  if (duplicateTeams.length > 0) {
    globalErrors.push(`Дублирующиеся команды: ${duplicateTeams.join(', ')}`);
  }

  // Валидация каждой записи
  scores.forEach(score => {
    const result = validateScoreData(score, options);
    if (!result.isValid || result.warnings.length > 0) {
      teamErrors[score.teamId] = result;
    }
  });

  const hasTeamErrors = Object.keys(teamErrors).length > 0;
  const hasGlobalErrors = globalErrors.length > 0;

  return {
    isValid: !hasTeamErrors && !hasGlobalErrors,
    teamErrors,
    globalErrors
  };
};

/**
 * Утилиты для работы с формами
 */
export const createFormValidation = (
  validationFn: (value: any) => ValidationResult,
  debounceMs: number = 300
) => {
  let timeoutId: NodeJS.Timeout;

  return (value: any, callback: (result: ValidationResult) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validationFn(value);
      callback(result);
    }, debounceMs);
  };
};

/**
 * Предустановленные конфигурации валидации
 */
export const VALIDATION_PRESETS = {
  strict: {
    allowNegative: false,
    minPoints: 0,
    maxPoints: 30,
    criticalLowThreshold: 0,
    criticalHighThreshold: 25
  },
  normal: {
    allowNegative: true,
    minPoints: -50,
    maxPoints: 100,
    criticalLowThreshold: -25, // Более чем в 2 раза ниже минимума
    criticalHighThreshold: 50   // Более чем в 2 раза выше максимума
  },
  permissive: {
    allowNegative: true,
    minPoints: -100,
    maxPoints: 200,
    criticalLowThreshold: -50,
    criticalHighThreshold: 100
  }
} as const;
