/**
 * Quiz Game Server с Socket.IO
 */

import { createServer, Server as HTTPServer } from 'http';
import { createApp } from './app';
import { SocketService } from './socket/socket.server';
import { logger } from './utils/logger';

export class QuizGameServer {
  private httpServer!: HTTPServer;
  private socketService!: SocketService;
  private port: number;

  constructor() {
    this.port = parseInt(process.env['PORT'] || '5000', 10);
  }

  /**
   * Запуск сервера
   */
  public async start(): Promise<void> {
    try {
      // Создаем Express приложение
      const app = createApp();

      // Создаем HTTP сервер
      this.httpServer = createServer(app);

      // Инициализируем Socket.IO
      this.socketService = new SocketService(this.httpServer);

      // Запускаем сервер
      this.httpServer.listen(this.port, () => {
        logger.info(`🚀 Quiz Game Backend started successfully! Port: ${this.port}, Environment: ${process.env['NODE_ENV'] || 'development'}, SocketIO: true`);
      });

      // Обработка ошибок сервера
      this.httpServer.on('error', (error: NodeJS.ErrnoException) => {
        if (error.syscall !== 'listen') {
          throw error;
        }

        const bind = typeof this.port === 'string' ? 'Pipe ' + this.port : 'Port ' + this.port;

        switch (error.code) {
          case 'EACCES':
            logger.error(`${bind} requires elevated privileges`);
            process.exit(1);
          case 'EADDRINUSE':
            logger.error(`${bind} is already in use`);
            process.exit(1);
          default:
            throw error;
        }
      });

    } catch (error) {
      logger.error(`Failed to start server: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Остановка сервера
   */
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.httpServer) {
        this.httpServer.close(() => {
          logger.info('HTTP server stopped');
          resolve();
        });
      }

      if (this.socketService) {
        this.socketService.close();
        logger.info('Socket.IO service stopped');
      }
    });
  }

  /**
   * Получить Socket.IO сервис
   */
  public getSocketService(): SocketService {
    if (!this.socketService) {
      throw new Error('Socket service not initialized');
    }
    return this.socketService;
  }

  /**
   * Получить HTTP сервер
   */
  public getHttpServer(): HTTPServer {
    if (!this.httpServer) {
      throw new Error('HTTP server not initialized');
    }
    return this.httpServer;
  }
}

// Глобальная переменная для Socket.IO сервиса (для обратной совместимости)
export let socketService: SocketService;

export function createServerWithSocket() {
  const app = createApp();
  const httpServer = createServer(app);

  // Инициализируем Socket.IO
  socketService = new SocketService(httpServer);

  return httpServer;
}

// Экспортируем функцию для получения Socket.IO сервиса
export function getSocketService(): SocketService {
  if (!socketService) {
    throw new Error('Socket service not initialized. Call createServerWithSocket() first.');
  }
  return socketService;
}
