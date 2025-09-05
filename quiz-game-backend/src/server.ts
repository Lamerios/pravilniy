import { createServer, Server } from 'http';
import { createApp } from './app';
import { config } from './config/config';
import { connectDatabase } from './config/database';

export class QuizGameServer {
  private app = createApp();
  private server: Server;
  private port: number;

  constructor() {
    this.port = config.server.port;
    this.server = createServer(this.app);
  }

  async start(): Promise<void> {
    try {
      // Подключаемся к базе данных
      await connectDatabase();

      // Запускаем сервер
      this.server.listen(this.port, () => {
        console.log(`🚀 Server is running on http://${config.server.host}:${this.port}`);
        console.log(`🌍 Environment: ${config.server.env}`);
        console.log(`📊 Database: ${config.db.host}:${config.db.port}/${config.db.name}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    console.log('\n🛑 Shutting down server...');

    this.server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });

    // Принудительное завершение через 10 секунд
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
}

// Запуск сервера если файл выполняется напрямую
if (require.main === module) {
  const server = new QuizGameServer();
  server.start().catch((error) => {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  });
}
