import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Схема валидации для создания баллов
 */
const createScoreSchema = z
  .object({
    gameId: z.number().int().positive('ID игры должен быть положительным числом'),
    teamId: z.number().int().positive('ID команды должен быть положительным числом'),
    roundId: z.number().int().positive('ID раунда должен быть положительным числом'),
    points: z.number().int('Баллы должны быть целым числом'), // Разрешаем отрицательные баллы (штрафы)
    bet: z.number().min(0, 'Ставка не может быть отрицательной').optional(),
    betType: z.enum(['MULTIPLIER', 'BONUS', 'FIXED']).optional(),
    minBet: z.number().min(0, 'Минимальная ставка не может быть отрицательной').optional(),
    maxBet: z.number().min(0, 'Максимальная ставка не может быть отрицательной').optional(),
    notes: z.string().max(500, 'Заметки не могут превышать 500 символов').optional(),
  })
  .refine(
    data => {
      // Если указаны minBet и maxBet, то minBet должен быть меньше maxBet
      if (data.minBet !== undefined && data.maxBet !== undefined) {
        return data.minBet <= data.maxBet;
      }
      return true;
    },
    {
      message: 'Минимальная ставка должна быть меньше или равна максимальной',
    },
  )
  .refine(
    data => {
      // Валидация ставки в соответствии с типом
      if (data.bet !== undefined && data.betType) {
        switch (data.betType) {
          case 'MULTIPLIER':
            return data.bet >= 0.1 && data.bet <= 10;
          case 'BONUS':
            return data.bet >= -100 && data.bet <= 100;
          case 'FIXED':
            return data.bet >= 0 && data.bet <= 1000;
          default:
            return true;
        }
      }
      return true;
    },
    {
      message: 'Ставка не соответствует выбранному типу',
      path: ['bet'],
    },
  );

/**
 * Схема валидации для обновления баллов
 */
const updateScoreSchema = z
  .object({
    points: z.number().int('Баллы должны быть целым числом').optional(), // Разрешаем отрицательные баллы
    bet: z.number().min(0, 'Ставка не может быть отрицательной').optional(),
    betType: z.enum(['MULTIPLIER', 'BONUS', 'FIXED']).optional(),
    minBet: z.number().min(0, 'Минимальная ставка не может быть отрицательной').optional(),
    maxBet: z.number().min(0, 'Максимальная ставка не может быть отрицательной').optional(),
    notes: z.string().max(500, 'Заметки не могут превышать 500 символов').optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'Необходимо указать хотя бы одно поле для обновления',
  })
  .refine(
    data => {
      // Если указаны minBet и maxBet, то minBet должен быть меньше maxBet
      if (data.minBet !== undefined && data.maxBet !== undefined) {
        return data.minBet <= data.maxBet;
      }
      return true;
    },
    {
      message: 'Минимальная ставка должна быть меньше или равна максимальной',
    },
  );

/**
 * Схема валидации для массового ввода баллов
 */
const bulkScoreSchema = z.object({
  gameId: z.number().int().positive('ID игры должен быть положительным числом'),
  roundId: z.number().int().positive('ID раунда должен быть положительным числом'),
  scores: z
    .array(
      z.object({
        teamId: z.number().int().positive('ID команды должен быть положительным числом'),
        points: z.number().int('Баллы должны быть целым числом'), // Разрешаем отрицательные баллы
        bet: z.number().min(0, 'Ставка не может быть отрицательной').optional(),
        betType: z.enum(['MULTIPLIER', 'BONUS', 'FIXED']).optional(),
        minBet: z.number().min(0, 'Минимальная ставка не может быть отрицательной').optional(),
        maxBet: z.number().min(0, 'Максимальная ставка не может быть отрицательной').optional(),
        notes: z.string().max(500, 'Заметки не могут превышать 500 символов').optional(),
      }),
    )
    .min(1, 'Необходимо указать хотя бы одну команду'),
});

/**
 * Схема валидации для исправления баллов
 */
const correctScoreSchema = z.object({
  newPoints: z.number().int('Новые баллы должны быть целым числом'), // Разрешаем отрицательные баллы
  reason: z
    .string()
    .min(1, 'Необходимо указать причину исправления')
    .max(500, 'Причина не может превышать 500 символов'),
});

/**
 * Схема валидации для запроса баллов
 */
const scoreQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : undefined)),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : undefined)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
  gameId: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : undefined)),
  teamId: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : undefined)),
  roundId: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : undefined)),
});

/**
 * Middleware для валидации создания баллов
 */
export const validateCreateScore = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Преобразуем строковые значения в числа
    const body = {
      ...req.body,
      gameId: req.body.gameId ? parseInt(req.body.gameId) : undefined,
      teamId: req.body.teamId ? parseInt(req.body.teamId) : undefined,
      roundId: req.body.roundId ? parseInt(req.body.roundId) : undefined,
      points: req.body.points ? parseInt(req.body.points) : undefined,
      bet: req.body.bet ? parseInt(req.body.bet) : undefined,
    };

    const validatedData = createScoreSchema.parse(body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
      });
    }
  }
};

/**
 * Middleware для валидации обновления баллов
 */
export const validateUpdateScore = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Преобразуем строковые значения в числа
    const body = {
      ...req.body,
      points: req.body.points ? parseInt(req.body.points) : undefined,
      bet: req.body.bet ? parseInt(req.body.bet) : undefined,
    };

    const validatedData = updateScoreSchema.parse(body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
      });
    }
  }
};

/**
 * Middleware для валидации массового ввода баллов
 */
export const validateBulkScore = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Преобразуем строковые значения в числа
    const body = {
      ...req.body,
      gameId: req.body.gameId ? parseInt(req.body.gameId) : undefined,
      roundId: req.body.roundId ? parseInt(req.body.roundId) : undefined,
      scores: req.body.scores?.map((score: any) => ({
        ...score,
        teamId: score.teamId ? parseInt(score.teamId) : undefined,
        points: score.points ? parseInt(score.points) : undefined,
        bet: score.bet ? parseInt(score.bet) : undefined,
      })),
    };

    const validatedData = bulkScoreSchema.parse(body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
      });
    }
  }
};

/**
 * Middleware для валидации исправления баллов
 */
export const validateCorrectScore = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Преобразуем строковые значения в числа
    const body = {
      ...req.body,
      newPoints: req.body.newPoints ? parseInt(req.body.newPoints) : undefined,
    };

    const validatedData = correctScoreSchema.parse(body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
      });
    }
  }
};

/**
 * Middleware для валидации запроса баллов
 */
export const validateScoreQuery = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const validatedData = scoreQuerySchema.parse(req.query);
    req.query = validatedData as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Ошибка валидации параметров запроса',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
      });
    }
  }
};

/**
 * Middleware для проверки прав доступа к баллам
 */
export const checkScoreAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Необходима аутентификация',
      });
      return;
    }

    // Проверяем роль пользователя
    if (!['admin', 'manager', 'user'].includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'Недостаточно прав для доступа к баллам',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
};

/**
 * Валидация параметров для получения истории баллов игры
 */
export const validateGameScoresQuery = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Валидируем gameId из параметров
    const gameId = parseInt(req.params['gameId']!);
    if (isNaN(gameId) || gameId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID игры должен быть положительным числом',
        errors: [{ field: 'gameId', message: 'Неверный формат ID игры' }],
      });
      return;
    }

    // Валидируем query параметры
    const querySchema = z.object({
      teamId: z
        .string()
        .transform(val => parseInt(val))
        .refine(val => !isNaN(val) && val > 0)
        .optional(),
      roundId: z
        .string()
        .transform(val => parseInt(val))
        .refine(val => !isNaN(val) && val > 0)
        .optional(),
      page: z
        .string()
        .transform(val => parseInt(val))
        .refine(val => !isNaN(val) && val > 0)
        .optional(),
      limit: z
        .string()
        .transform(val => parseInt(val))
        .refine(val => !isNaN(val) && val > 0 && val <= 100)
        .optional(),
      sortBy: z
        .enum(['createdAt', 'updatedAt', 'points', 'totalPoints', 'teamId', 'roundId'])
        .optional(),
      sortOrder: z.enum(['ASC', 'DESC']).optional(),
    });

    querySchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Ошибка валидации параметров запроса',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка валидации',
    });
  }
};

/**
 * Валидация параметров для получения баллов раунда
 */
export const validateRoundScoresParams = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const gameId = parseInt(req.params['gameId']!);
    const roundId = parseInt(req.params['roundId']!);

    if (isNaN(gameId) || gameId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID игры должен быть положительным числом',
      });
      return;
    }

    if (isNaN(roundId) || roundId <= 0) {
      res.status(400).json({
        success: false,
        message: 'ID раунда должен быть положительным числом',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка валидации параметров',
    });
  }
};
