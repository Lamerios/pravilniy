"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestApp = createTestApp;
const tslib_1 = require("tslib");
const cors_1 = tslib_1.__importDefault(require("cors"));
const express_1 = tslib_1.__importDefault(require("express"));
const express_rate_limit_1 = tslib_1.__importDefault(require("express-rate-limit"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const config_1 = require("./config/config");
const api_routes_1 = tslib_1.__importDefault(require("./routes/api.routes"));
const health_test_routes_1 = tslib_1.__importDefault(require("./routes/health-test.routes"));
function createTestApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    }));
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: {
            error: 'Too many requests from this IP, please try again later.',
        },
    });
    app.use(limiter);
    app.use((0, cors_1.default)({
        origin: config_1.config.cors.origin,
        credentials: config_1.config.cors.credentials,
        methods: config_1.config.cors.methods,
        allowedHeaders: config_1.config.cors.allowedHeaders,
    }));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
    app.use('/health', health_test_routes_1.default);
    app.use('/api', api_routes_1.default);
    app.use('*', (req, res) => {
        res.status(404).json({
            error: 'Route not found',
            path: req.originalUrl,
            method: req.method,
        });
    });
    app.use((error, req, res) => {
        console.error('Global error handler:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: config_1.config.server.env === 'development' ? error.message : 'Something went wrong',
            ...(config_1.config.server.env === 'development' && { stack: error.stack }),
        });
    });
    return app;
}
//# sourceMappingURL=app-test.js.map