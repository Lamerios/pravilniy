import { Server, createServer } from 'http';
import { createTestApp } from './app-test';
import { config } from './config/config';

export class QuizGameTestServer {
  private app = createTestApp();
  private server: Server;
  private port: number;

  constructor() {
    this.port = config.server.port;
    this.server = createServer(this.app);
  }

  async start(): Promise<void> {
    try {
      console.log('🚀 Starting Quiz Game Test Server (no database)...');

      // Запускаем сервер без подключения к БД
      this.server.listen(this.port, () => {
        console.log(`🚀 Server is running on http://${config.server.host}:${this.port}`);
        console.log(`🌍 Environment: ${config.server.env}`);
        console.log(`📊 Health check: http://${config.server.host}:${this.port}/health`);
        console.log(`🔗 API info: http://${config.server.host}:${this.port}/api`);
        console.log('⚠️  Note: Database connection disabled for testing');
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());
    } catch (error) {
      console.error('❌ Failed to start test server:', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    console.log('\n🛑 Shutting down test server...');

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

// Запуск тестового сервера если файл выполняется напрямую
if (require.main === module) {
  const server = new QuizGameTestServer();
  server.start().catch(error => {
    console.error('❌ Test server startup failed:', error);
    process.exit(1);
  });
}
