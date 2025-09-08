"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development',
        database: 'disconnected (test mode)',
        version: process.env['npm_package_version'] || '1.0.0',
        memory: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
        }
    });
});
router.get('/database', (req, res) => {
    res.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        error: 'Database connection disabled in test mode',
        timestamp: new Date().toISOString()
    });
});
router.get('/memory', (req, res) => {
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
exports.default = router;
//# sourceMappingURL=health-test.routes.js.map