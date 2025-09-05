import express, { Application } from 'express';
import helmet from 'helmet';

// Импорт middleware
import {
    bodySizeLimit,
    contentTypeValidator,
    corsMiddleware,
    securityHeaders
} from './middleware/cors.middleware';
import {
    errorHandler,
    notFoundHandler,
    requestLogger
} from './middleware/error.middleware';
import {
    apiRateLimit,
    authRateLimit,
    rateLimitMiddleware
} from './middleware/rate-limit.middleware';

// Импорт роутов
import apiRoutes from './routes/api.routes';
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';

export function createApp(): Application {
  const app = express();

  // Trust proxy (для правильного определения IP)
  app.set('trust proxy', 1);

  // Безопасность
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // Дополнительные заголовки безопасности
  app.use(securityHeaders);

  // CORS
  app.use(corsMiddleware);

  // Парсинг тела запроса
  app.use(express.json({
    limit: process.env['REQUEST_SIZE_LIMIT'] || '10mb',
    strict: true
  }));
  app.use(express.urlencoded({
    extended: true,
    limit: process.env['REQUEST_SIZE_LIMIT'] || '10mb'
  }));

  // Валидация Content-Type
  app.use(contentTypeValidator);

  // Ограничение размера тела запроса
  app.use(bodySizeLimit);

  // Логирование запросов
  app.use(requestLogger);

  // Rate limiting
  app.use(rateLimitMiddleware);

  // Публичные роуты (без аутентификации)
  app.use('/health', healthRoutes);
  app.use('/api/auth', authRateLimit, authRoutes);

  // Защищенные API роуты
  app.use('/api', apiRateLimit, apiRoutes);

  // 404 обработчик
  app.use(notFoundHandler);

  // Глобальный обработчик ошибок
  app.use(errorHandler);

  return app;
}
