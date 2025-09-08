import { NextFunction, Request, Response } from 'express';

/**
 * Middleware для ограничения частоты запросов (Rate Limiting)
 */

// Интерфейс для хранения информации о запросах
interface RateLimitInfo {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// Хранилище для rate limiting (в production лучше использовать Redis)
const rateLimitStore = new Map<string, RateLimitInfo>();

// Конфигурация rate limiting
const rateLimitConfig = {
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 минут
  maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
  skipSuccessfulRequests: process.env['RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS'] === 'true',
  skipFailedRequests: process.env['RATE_LIMIT_SKIP_FAILED_REQUESTS'] === 'false',
};

/**
 * Получает ключ для rate limiting
 */
function getRateLimitKey(req: Request): string {
  // Используем IP адрес и User-Agent для идентификации
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Для аутентифицированных пользователей используем их ID
  const userId = (req as any).user?.userId;
  if (userId) {
    return `user:${userId}`;
  }

  return `ip:${ip}:${userAgent}`;
}

/**
 * Очищает устаревшие записи из хранилища
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();

  for (const [key, info] of rateLimitStore.entries()) {
    if (now > info.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Основной middleware для rate limiting
 */
export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const key = getRateLimitKey(req);
  const now = Date.now();

  // Очищаем устаревшие записи
  cleanupExpiredEntries();

  // Получаем или создаем информацию о rate limit
  let rateLimitInfo = rateLimitStore.get(key);

  if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
    // Создаем новую запись
    rateLimitInfo = {
      count: 0,
      resetTime: now + rateLimitConfig.windowMs,
      blocked: false,
    };
    rateLimitStore.set(key, rateLimitInfo);
  }

  // Проверяем, не заблокирован ли пользователь
  if (rateLimitInfo.blocked && now < rateLimitInfo.resetTime) {
    const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);

    res.status(429).json({
      success: false,
      error: 'TooManyRequestsError',
      message: 'Too many requests, please try again later',
      retryAfter,
    });
    return;
  }

  // Увеличиваем счетчик запросов
  rateLimitInfo.count++;

  // Проверяем лимит
  if (rateLimitInfo.count > rateLimitConfig.maxRequests) {
    rateLimitInfo.blocked = true;

    const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);

    res.status(429).json({
      success: false,
      error: 'TooManyRequestsError',
      message: 'Rate limit exceeded',
      retryAfter,
      limit: rateLimitConfig.maxRequests,
      remaining: 0,
      resetTime: new Date(rateLimitInfo.resetTime).toISOString(),
    });
    return;
  }

  // Устанавливаем заголовки с информацией о rate limit
  const remaining = Math.max(0, rateLimitConfig.maxRequests - rateLimitInfo.count);
  const resetTime = new Date(rateLimitInfo.resetTime).toISOString();

  res.header('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString());
  res.header('X-RateLimit-Remaining', remaining.toString());
  res.header('X-RateLimit-Reset', resetTime);

  // Перехватываем ответ для обновления счетчика
  const originalSend = res.send;
  res.send = function (data) {
    // Обновляем счетчик в зависимости от результата
    if (rateLimitConfig.skipSuccessfulRequests && res.statusCode < 400) {
      rateLimitInfo!.count = Math.max(0, rateLimitInfo!.count - 1);
    }

    if (rateLimitConfig.skipFailedRequests && res.statusCode >= 400) {
      rateLimitInfo!.count = Math.max(0, rateLimitInfo!.count - 1);
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Строгий rate limiting для аутентификации
 */
export const authRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const key = `auth:${getRateLimitKey(req)}`;
  const now = Date.now();

  // Более строгие лимиты для аутентификации
  const authConfig = {
    windowMs: 15 * 60 * 1000, // 15 минут
    maxRequests: 5, // 5 попыток входа
    blockDuration: 30 * 60 * 1000, // Блокировка на 30 минут
  };

  let rateLimitInfo = rateLimitStore.get(key);

  if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
    rateLimitInfo = {
      count: 0,
      resetTime: now + authConfig.windowMs,
      blocked: false,
    };
    rateLimitStore.set(key, rateLimitInfo);
  }

  if (rateLimitInfo.blocked && now < rateLimitInfo.resetTime) {
    const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);

    res.status(429).json({
      success: false,
      error: 'TooManyAuthAttemptsError',
      message: 'Too many authentication attempts, please try again later',
      retryAfter,
    });
    return;
  }

  rateLimitInfo.count++;

  if (rateLimitInfo.count > authConfig.maxRequests) {
    rateLimitInfo.blocked = true;
    rateLimitInfo.resetTime = now + authConfig.blockDuration;

    const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);

    res.status(429).json({
      success: false,
      error: 'TooManyAuthAttemptsError',
      message: 'Authentication rate limit exceeded, account temporarily locked',
      retryAfter,
    });
    return;
  }

  next();
};

/**
 * Rate limiting для API endpoints
 */
export const apiRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const key = `api:${getRateLimitKey(req)}`;
  const now = Date.now();

  // Лимиты для API
  const apiConfig = {
    windowMs: 60 * 1000, // 1 минута
    maxRequests: 60, // 60 запросов в минуту
  };

  let rateLimitInfo = rateLimitStore.get(key);

  if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
    rateLimitInfo = {
      count: 0,
      resetTime: now + apiConfig.windowMs,
      blocked: false,
    };
    rateLimitStore.set(key, rateLimitInfo);
  }

  if (rateLimitInfo.blocked && now < rateLimitInfo.resetTime) {
    const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);

    res.status(429).json({
      success: false,
      error: 'ApiRateLimitExceededError',
      message: 'API rate limit exceeded',
      retryAfter,
    });
    return;
  }

  rateLimitInfo.count++;

  if (rateLimitInfo.count > apiConfig.maxRequests) {
    rateLimitInfo.blocked = true;

    const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);

    res.status(429).json({
      success: false,
      error: 'ApiRateLimitExceededError',
      message: 'API rate limit exceeded',
      retryAfter,
    });
    return;
  }

  const remaining = Math.max(0, apiConfig.maxRequests - rateLimitInfo.count);
  res.header('X-RateLimit-Limit', apiConfig.maxRequests.toString());
  res.header('X-RateLimit-Remaining', remaining.toString());
  res.header('X-RateLimit-Reset', new Date(rateLimitInfo.resetTime).toISOString());

  next();
};

/**
 * Middleware для логирования rate limit событий
 */
export const rateLimitLogger = (req: Request, res: Response, next: NextFunction): void => {
  const key = getRateLimitKey(req);

  // Перехватываем ответ для логирования
  const originalSend = res.send;
  res.send = function (data) {
    if (res.statusCode === 429) {
      console.warn(`[RATE_LIMIT] Blocked request from ${key}: ${req.method} ${req.path}`);
    }

    return originalSend.call(this, data);
  };

  next();
};
