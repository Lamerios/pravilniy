/**
 * Quiz Game Backend Entry Point
 * Node.js + TypeScript + Express
 */

import { QuizGameServer } from './server';
import { logger } from './utils/logger';

async function initializeApp(): Promise<void> {
  try {
    logger.info('Starting Quiz Game Backend...');

    // Создаем и запускаем сервер
    const server = new QuizGameServer();
    await server.start();
  } catch (error) {
    logger.error(
      `Failed to initialize application: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    process.exit(1);
  }
}

// Обработка необработанных ошибок
process.on('uncaughtException', error => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
  process.exit(1);
});

// Запускаем приложение
initializeApp().catch(error => {
  logger.error(
    `Application startup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
  );
  process.exit(1);
});
