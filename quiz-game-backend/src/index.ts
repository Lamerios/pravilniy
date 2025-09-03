/**
 * Quiz Game Backend Entry Point
 * Node.js + TypeScript + Express
 */

// Simple logger for initial setup
const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string, error?: any) => console.error(`[ERROR] ${msg}`, error || ''),
  debug: (msg: string) => console.log(`[DEBUG] ${msg}`),
};

// Basic Express setup (packages will be installed later)
let app: any = null;
let server: any = null;

const PORT = process.env.PORT || 5001;

// Initialize Express app (will be called after npm install)
const initializeApp = async (): Promise<void> => {
  try {
    // Dynamic imports to avoid errors before package installation
    const express = (await import('express')).default;
    const cors = (await import('cors')).default;
    const helmet = (await import('helmet')).default;
    const morgan = (await import('morgan')).default;
    const compression = (await import('compression')).default;
    const rateLimit = (await import('express-rate-limit')).default;

    app = express();

    // Security middleware
    app.use(helmet());
    app.use(cors());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    });
    app.use('/api/', limiter);

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    app.use(compression());

    // Logging
    app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

    // Health check endpoint
    app.get('/api/health', (_req: any, res: any) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // Basic route
    app.get('/api', (_req: any, res: any) => {
      res.json({
        message: 'Quiz Game Backend API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          games: '/api/games',
          teams: '/api/teams',
          scores: '/api/scores',
        },
      });
    });

    // 404 handler
    app.use('*', (_req: any, res: any) => {
      res.status(404).json({
        error: 'Route not found',
        message: 'The requested endpoint does not exist',
      });
    });

    // Error handling middleware
    app.use((err: Error, _req: any, res: any, _next: any) => {
      logger.error('Unhandled error:', err);
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      });
    });

    logger.info('✅ Express app initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize Express app:', error);
    throw error;
  }
};

// Start server
const startServer = async (): Promise<void> => {
  if (!app) {
    await initializeApp();
  }

  server = app.listen(PORT, () => {
    logger.info(`🚀 Quiz Game Backend started on port ${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

// Initialize and start if this file is run directly
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (server) {
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

export { app, server, startServer, initializeApp };
