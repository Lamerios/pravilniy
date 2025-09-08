"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
console.log('🔍 Environment variables:', {
    DB_USER: process.env['DB_USER'],
    DB_PASSWORD: process.env['DB_PASSWORD'] ? '***' : 'undefined',
    NODE_ENV: process.env['NODE_ENV']
});
exports.config = {
    server: {
        port: parseInt(process.env['BACKEND_PORT'] || '5001'),
        host: process.env['BACKEND_HOST'] || 'localhost',
        env: process.env['NODE_ENV'] || 'development'
    },
    db: {
        host: process.env['DB_HOST'] || 'localhost',
        port: parseInt(process.env['DB_PORT'] || '5432'),
        name: process.env['DB_NAME'] || 'quiz_game_dev',
        user: process.env['DB_USER'] || 'postgres',
        password: process.env['DB_PASSWORD'] || 'Lamerios7891',
        pool: {
            min: parseInt(process.env['DB_POOL_MIN'] || '2'),
            max: parseInt(process.env['DB_POOL_MAX'] || '10')
        },
        logging: process.env['NODE_ENV'] === 'development'
    },
    redis: {
        host: process.env['REDIS_HOST'] || 'localhost',
        port: parseInt(process.env['REDIS_PORT'] || '6379'),
        password: process.env['REDIS_PASSWORD'] || undefined,
        db: parseInt(process.env['REDIS_DB'] || '0'),
        ttl: parseInt(process.env['REDIS_TTL'] || '3600')
    },
    jwt: {
        secret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production',
        expiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
        refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d'
    },
    cors: {
        origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
        credentials: process.env['CORS_CREDENTIALS'] === 'true',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    logging: {
        level: process.env['LOG_LEVEL'] || 'info',
        file: process.env['LOG_FILE'] || './logs/backend.log'
    }
};
exports.default = exports.config;
//# sourceMappingURL=config.js.map