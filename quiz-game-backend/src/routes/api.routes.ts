import { Request, Response, Router } from 'express';
import gameRoutes from './game.routes';
import protectedRoutes from './protected.routes';
import teamRoutes from './team.routes';
import templateRoutes from './template.routes';

const router = Router();

// API информация
router.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Quiz Game API',
    version: '1.0.0',
    description: 'API для управления викторинами и играми',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      protected: '/api/protected',
      organizations: '/api/organizations',
      users: '/api/users',
      games: '/api/games',
      templates: '/api/templates',
      teams: '/api/teams'
    },
    documentation: '/api/docs',
    timestamp: new Date().toISOString()
  });
});

// API статус
router.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development'
  });
});

// Заглушка для будущих роутов
router.get('/organizations', (req: Request, res: Response) => {
  res.json({
    message: 'Organizations endpoint - coming soon',
    timestamp: new Date().toISOString()
  });
});

router.get('/users', (req: Request, res: Response) => {
  res.json({
    message: 'Users endpoint - coming soon',
    timestamp: new Date().toISOString()
  });
});

// Роуты игр
router.use('/games', gameRoutes);

// Роуты шаблонов игр
router.use('/templates', templateRoutes);

// Роуты команд
router.use('/teams', teamRoutes);

// Защищенные роуты
router.use('/protected', protectedRoutes);

export default router;
