"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const cors_middleware_1 = require("./middleware/cors.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const rate_limit_middleware_1 = require("./middleware/rate-limit.middleware");
const api_routes_1 = tslib_1.__importDefault(require("./routes/api.routes"));
const auth_routes_1 = tslib_1.__importDefault(require("./routes/auth.routes"));
const health_routes_1 = tslib_1.__importDefault(require("./routes/health.routes"));
function createApp() {
    const app = (0, express_1.default)();
    app.set('trust proxy', 1);
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
    app.use(cors_middleware_1.securityHeaders);
    app.use(cors_middleware_1.corsMiddleware);
    app.use(express_1.default.json({
        limit: process.env['REQUEST_SIZE_LIMIT'] || '10mb',
        strict: true
    }));
    app.use(express_1.default.urlencoded({
        extended: true,
        limit: process.env['REQUEST_SIZE_LIMIT'] || '10mb'
    }));
    app.use(cors_middleware_1.contentTypeValidator);
    app.use(cors_middleware_1.bodySizeLimit);
    app.use(error_middleware_1.requestLogger);
    app.use(rate_limit_middleware_1.rateLimitMiddleware);
    app.use('/health', health_routes_1.default);
    app.use('/api/auth', rate_limit_middleware_1.authRateLimit, auth_routes_1.default);
    app.use('/api', rate_limit_middleware_1.apiRateLimit, api_routes_1.default);
    app.use(error_middleware_1.notFoundHandler);
    app.use(error_middleware_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map