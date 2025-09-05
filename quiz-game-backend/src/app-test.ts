import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './config/config';

// Импорт роутов (тестовые версии)
import apiRoutes from './routes/api.routes';
import healthTestRoutes from './routes/health-test.routes';

export function createTestApp(): Application {
  const app = express();

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

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов с одного IP
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
  });
  app.use(limiter);

  // CORS
  app.use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
  }));

  // Парсинг тела запроса
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Логирование запросов
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Роуты (тестовые)
  app.use('/health', healthTestRoutes);
  app.use('/api', apiRoutes);

  // 404 обработчик
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      error: 'Route not found',
      path: req.originalUrl,
      method: req.method,
    });
  });

  // Глобальный обработчик ошибок
  app.use((error: Error, req: Request, res: Response) => {
    console.error('Global error handler:', error);

    res.status(500).json({
      error: 'Internal server error',
      message: config.server.env === 'development' ? error.message : 'Something went wrong',
      ...(config.server.env === 'development' && { stack: error.stack }),
    });
  });

  return app;
}



