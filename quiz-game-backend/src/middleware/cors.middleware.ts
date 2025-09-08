import { NextFunction, Request, Response } from 'express';

/**
 * Middleware для настройки CORS
 */

// Конфигурация CORS
const corsConfig = {
  origin: process.env['CORS_ORIGIN']?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: process.env['CORS_CREDENTIALS'] === 'true' || true,
  maxAge: parseInt(process.env['CORS_MAX_AGE'] || '86400'),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Current-Page', 'X-Per-Page'],
};

/**
 * Проверяет, разрешен ли origin
 */
function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // Разрешаем запросы без origin (например, Postman)

  return corsConfig.origin.some(allowedOrigin => {
    if (allowedOrigin === '*') return true;
    if (allowedOrigin === origin) return true;

    // Поддержка wildcard поддоменов
    if (allowedOrigin.startsWith('*.')) {
      const domain = allowedOrigin.substring(2);
      return origin.endsWith(domain);
    }

    return false;
  });
}

/**
 * CORS middleware
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;

  // Проверяем origin
  if (origin && !isOriginAllowed(origin)) {
    console.warn(`[CORS] Blocked request from disallowed origin: ${origin}`);
    res.status(403).json({
      success: false,
      error: 'CORS_ERROR',
      message: 'Origin not allowed',
    });
    return;
  }

  // Устанавливаем заголовки CORS
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Credentials', corsConfig.credentials.toString());
  res.header('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  res.header('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  res.header('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
  res.header('Access-Control-Max-Age', corsConfig.maxAge.toString());

  // Обрабатываем preflight запросы
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

/**
 * Middleware для установки дополнительных заголовков безопасности
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Заголовки безопасности
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Удаляем заголовок X-Powered-By
  res.removeHeader('X-Powered-By');

  next();
};

/**
 * Middleware для проверки Content-Type
 */
export const contentTypeValidator = (req: Request, res: Response, next: NextFunction): void => {
  // Проверяем только для POST, PUT, PATCH запросов
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];

    if (!contentType) {
      res.status(400).json({
        success: false,
        error: 'ContentTypeError',
        message: 'Content-Type header is required',
      });
      return;
    }

    // Проверяем, что это JSON
    if (!contentType.includes('application/json')) {
      res.status(400).json({
        success: false,
        error: 'ContentTypeError',
        message: 'Content-Type must be application/json',
      });
      return;
    }
  }

  next();
};

/**
 * Middleware для ограничения размера тела запроса
 */
export const bodySizeLimit = (req: Request, res: Response, next: NextFunction): void => {
  const maxSize = parseInt(process.env['REQUEST_SIZE_LIMIT'] || '1048576'); // 1MB по умолчанию
  const contentLength = parseInt(req.headers['content-length'] || '0');

  if (contentLength > maxSize) {
    res.status(413).json({
      success: false,
      error: 'PayloadTooLargeError',
      message: 'Request body too large',
    });
    return;
  }

  next();
};

/**
 * Middleware для логирования CORS запросов
 */
export const corsLogger = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;

  if (origin) {
    console.log(`[CORS] ${req.method} ${req.path} from origin: ${origin}`);
  }

  next();
};
