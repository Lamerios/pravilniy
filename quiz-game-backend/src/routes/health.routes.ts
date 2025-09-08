import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

// Проверка здоровья сервера
router.get('/', HealthController.getHealth);

// Детальная проверка БД
router.get('/database', HealthController.getDatabaseHealth);

// Проверка памяти
router.get('/memory', HealthController.getMemoryHealth);

export default router;
