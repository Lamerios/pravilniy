"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
class HealthController {
    static getHealth = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        try {
            await database_1.sequelize.authenticate();
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env['NODE_ENV'] || 'development',
                database: 'connected',
                version: process.env['npm_package_version'] || '1.0.0',
                memory: {
                    rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
                    heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
                }
            });
        }
        catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: 'Database connection failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    static getDatabaseHealth = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        try {
            const startTime = Date.now();
            await database_1.sequelize.authenticate();
            const responseTime = Date.now() - startTime;
            res.json({
                status: 'healthy',
                database: 'connected',
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString(),
                details: {
                    dialect: database_1.sequelize.getDialect(),
                    host: process.env['DB_HOST'] || 'localhost',
                    port: parseInt(process.env['DB_PORT'] || '5432'),
                    database: process.env['DB_NAME'] || 'quiz_game'
                }
            });
        }
        catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                database: 'disconnected',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        }
    });
    static getMemoryHealth = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        const memUsage = process.memoryUsage();
        res.json({
            status: 'healthy',
            memory: {
                rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
                heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
                external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
            },
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });
}
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map