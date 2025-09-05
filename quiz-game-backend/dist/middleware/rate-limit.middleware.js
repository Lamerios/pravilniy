"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitLogger = exports.apiRateLimit = exports.authRateLimit = exports.rateLimitMiddleware = void 0;
const rateLimitStore = new Map();
const rateLimitConfig = {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'),
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
    skipSuccessfulRequests: process.env['RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS'] === 'true',
    skipFailedRequests: process.env['RATE_LIMIT_SKIP_FAILED_REQUESTS'] === 'false'
};
function getRateLimitKey(req) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const userId = req.user?.userId;
    if (userId) {
        return `user:${userId}`;
    }
    return `ip:${ip}:${userAgent}`;
}
function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, info] of rateLimitStore.entries()) {
        if (now > info.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}
const rateLimitMiddleware = (req, res, next) => {
    const key = getRateLimitKey(req);
    const now = Date.now();
    cleanupExpiredEntries();
    let rateLimitInfo = rateLimitStore.get(key);
    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
        rateLimitInfo = {
            count: 0,
            resetTime: now + rateLimitConfig.windowMs,
            blocked: false
        };
        rateLimitStore.set(key, rateLimitInfo);
    }
    if (rateLimitInfo.blocked && now < rateLimitInfo.resetTime) {
        const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
        res.status(429).json({
            success: false,
            error: 'TooManyRequestsError',
            message: 'Too many requests, please try again later',
            retryAfter: retryAfter
        });
        return;
    }
    rateLimitInfo.count++;
    if (rateLimitInfo.count > rateLimitConfig.maxRequests) {
        rateLimitInfo.blocked = true;
        const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
        res.status(429).json({
            success: false,
            error: 'TooManyRequestsError',
            message: 'Rate limit exceeded',
            retryAfter: retryAfter,
            limit: rateLimitConfig.maxRequests,
            remaining: 0,
            resetTime: new Date(rateLimitInfo.resetTime).toISOString()
        });
        return;
    }
    const remaining = Math.max(0, rateLimitConfig.maxRequests - rateLimitInfo.count);
    const resetTime = new Date(rateLimitInfo.resetTime).toISOString();
    res.header('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString());
    res.header('X-RateLimit-Remaining', remaining.toString());
    res.header('X-RateLimit-Reset', resetTime);
    const originalSend = res.send;
    res.send = function (data) {
        if (rateLimitConfig.skipSuccessfulRequests && res.statusCode < 400) {
            rateLimitInfo.count = Math.max(0, rateLimitInfo.count - 1);
        }
        if (rateLimitConfig.skipFailedRequests && res.statusCode >= 400) {
            rateLimitInfo.count = Math.max(0, rateLimitInfo.count - 1);
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.rateLimitMiddleware = rateLimitMiddleware;
const authRateLimit = (req, res, next) => {
    const key = `auth:${getRateLimitKey(req)}`;
    const now = Date.now();
    const authConfig = {
        windowMs: 15 * 60 * 1000,
        maxRequests: 5,
        blockDuration: 30 * 60 * 1000
    };
    let rateLimitInfo = rateLimitStore.get(key);
    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
        rateLimitInfo = {
            count: 0,
            resetTime: now + authConfig.windowMs,
            blocked: false
        };
        rateLimitStore.set(key, rateLimitInfo);
    }
    if (rateLimitInfo.blocked && now < rateLimitInfo.resetTime) {
        const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
        res.status(429).json({
            success: false,
            error: 'TooManyAuthAttemptsError',
            message: 'Too many authentication attempts, please try again later',
            retryAfter: retryAfter
        });
        return;
    }
    rateLimitInfo.count++;
    if (rateLimitInfo.count > authConfig.maxRequests) {
        rateLimitInfo.blocked = true;
        rateLimitInfo.resetTime = now + authConfig.blockDuration;
        const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
        res.status(429).json({
            success: false,
            error: 'TooManyAuthAttemptsError',
            message: 'Authentication rate limit exceeded, account temporarily locked',
            retryAfter: retryAfter
        });
        return;
    }
    next();
};
exports.authRateLimit = authRateLimit;
const apiRateLimit = (req, res, next) => {
    const key = `api:${getRateLimitKey(req)}`;
    const now = Date.now();
    const apiConfig = {
        windowMs: 60 * 1000,
        maxRequests: 60
    };
    let rateLimitInfo = rateLimitStore.get(key);
    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
        rateLimitInfo = {
            count: 0,
            resetTime: now + apiConfig.windowMs,
            blocked: false
        };
        rateLimitStore.set(key, rateLimitInfo);
    }
    if (rateLimitInfo.blocked && now < rateLimitInfo.resetTime) {
        const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
        res.status(429).json({
            success: false,
            error: 'ApiRateLimitExceededError',
            message: 'API rate limit exceeded',
            retryAfter: retryAfter
        });
        return;
    }
    rateLimitInfo.count++;
    if (rateLimitInfo.count > apiConfig.maxRequests) {
        rateLimitInfo.blocked = true;
        const retryAfter = Math.ceil((rateLimitInfo.resetTime - now) / 1000);
        res.status(429).json({
            success: false,
            error: 'ApiRateLimitExceededError',
            message: 'API rate limit exceeded',
            retryAfter: retryAfter
        });
        return;
    }
    const remaining = Math.max(0, apiConfig.maxRequests - rateLimitInfo.count);
    res.header('X-RateLimit-Limit', apiConfig.maxRequests.toString());
    res.header('X-RateLimit-Remaining', remaining.toString());
    res.header('X-RateLimit-Reset', new Date(rateLimitInfo.resetTime).toISOString());
    next();
};
exports.apiRateLimit = apiRateLimit;
const rateLimitLogger = (req, res, next) => {
    const key = getRateLimitKey(req);
    const originalSend = res.send;
    res.send = function (data) {
        if (res.statusCode === 429) {
            console.warn(`[RATE_LIMIT] Blocked request from ${key}: ${req.method} ${req.path}`);
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.rateLimitLogger = rateLimitLogger;
//# sourceMappingURL=rate-limit.middleware.js.map