import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'sequelize';

/**
 * Middleware для централизованной обработки ошибок
 */

// Интерфейс для ошибок API
interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Интерфейс для ответа с ошибкой
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: any;
  stack?: string;
}

/**
 * Создает объект ошибки API
 */
export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Обработчик ошибок для Express
 */
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Внутренняя ошибка сервера';
  let errorName = error.name || 'InternalServerError';
  let details: any = undefined;

  // Логируем ошибку
  console.error(`[ERROR] ${req.method} ${req.path} - ${statusCode}:`, {
    message: error.message,
    stack: error.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    user: (req as any).user?.userId || 'Anonymous'
  });

  // Обработка различных типов ошибок
  if (error instanceof ValidationError) {
    // Ошибки валидации Sequelize
    statusCode = 400;
    errorName = 'ValidationError';
    message = 'Ошибка валидации данных';
    details = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
  } else if (error.name === 'SequelizeUniqueConstraintError') {
    // Ошибка уникальности
    statusCode = 409;
    errorName = 'UniqueConstraintError';
    message = 'Запись с такими данными уже существует';
  } else if (error.name === 'SequelizeForeignKeyConstraintError') {
    // Ошибка внешнего ключа
    statusCode = 400;
    errorName = 'ForeignKeyConstraintError';
    message = 'Нарушение связей между данными';
  } else if (error.name === 'SequelizeDatabaseError') {
    // Ошибка базы данных
    statusCode = 500;
    errorName = 'DatabaseError';
    message = 'Ошибка базы данных';
  } else if (error.name === 'JsonWebTokenError') {
    // Ошибка JWT
    statusCode = 401;
    errorName = 'TokenError';
    message = 'Недействительный токен';
  } else if (error.name === 'TokenExpiredError') {
    // Истекший токен
    statusCode = 401;
    errorName = 'TokenExpiredError';
    message = 'Токен истек';
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    // Ошибка парсинга JSON
    statusCode = 400;
    errorName = 'SyntaxError';
    message = 'Некорректный JSON';
  } else if (error.name === 'MulterError') {
    // Ошибка загрузки файлов
    statusCode = 400;
    errorName = 'FileUploadError';
    message = 'Ошибка загрузки файла';
  } else if (error.name === 'CastError') {
    // Ошибка приведения типов
    statusCode = 400;
    errorName = 'CastError';
    message = 'Некорректный формат данных';
  }

  // Формируем ответ
  const errorResponse: ErrorResponse = {
    success: false,
    error: errorName,
    message: message
  };

  // Добавляем детали в development режиме
  if (process.env['NODE_ENV'] === 'development') {
    errorResponse.details = details;
    if (error.stack) {
      errorResponse.stack = error.stack;
    }
  }

  // Отправляем ответ
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware для обработки 404 ошибок
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: 'NotFoundError',
    message: `Роут ${req.method} ${req.path} не найден`
  };

  res.status(404).json(errorResponse);
};

/**
 * Middleware для обработки необработанных промисов
 */
export const unhandledRejectionHandler = (reason: any, promise: Promise<any>): void => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);

  // В production можно отправить уведомление в систему мониторинга
  if (process.env['NODE_ENV'] === 'production') {
    // TODO: Интеграция с Sentry или другой системой мониторинга
  }
};

/**
 * Middleware для обработки необработанных исключений
 */
export const uncaughtExceptionHandler = (error: Error): void => {
  console.error('Uncaught Exception:', error);

  // В production можно отправить уведомление в систему мониторинга
  if (process.env['NODE_ENV'] === 'production') {
    // TODO: Интеграция с Sentry или другой системой мониторинга
  }

  // Завершаем процесс
  process.exit(1);
};

/**
 * Асинхронный wrapper для обработки ошибок в async функциях
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware для логирования запросов
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Логируем начало запроса
  console.log(`[REQUEST] ${req.method} ${req.path} - ${req.ip} - ${new Date().toISOString()}`);

  // Перехватываем ответ
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Красный для ошибок, зеленый для успеха
    const resetColor = '\x1b[0m';

    console.log(`${statusColor}[RESPONSE] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms${resetColor}`);
    return originalSend.call(this, data);
  };

  next();
};
