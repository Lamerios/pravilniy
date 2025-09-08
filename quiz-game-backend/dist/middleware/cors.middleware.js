"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsLogger = exports.bodySizeLimit = exports.contentTypeValidator = exports.securityHeaders = exports.corsMiddleware = void 0;
const corsConfig = {
    origin: process.env['CORS_ORIGIN']?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: process.env['CORS_CREDENTIALS'] === 'true' || true,
    maxAge: parseInt(process.env['CORS_MAX_AGE'] || '86400'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma'
    ],
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Per-Page'
    ]
};
function isOriginAllowed(origin) {
    if (!origin)
        return true;
    return corsConfig.origin.some(allowedOrigin => {
        if (allowedOrigin === '*')
            return true;
        if (allowedOrigin === origin)
            return true;
        if (allowedOrigin.startsWith('*.')) {
            const domain = allowedOrigin.substring(2);
            return origin.endsWith(domain);
        }
        return false;
    });
}
const corsMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && !isOriginAllowed(origin)) {
        console.warn(`[CORS] Blocked request from disallowed origin: ${origin}`);
        res.status(403).json({
            success: false,
            error: 'CORS_ERROR',
            message: 'Origin not allowed'
        });
        return;
    }
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', corsConfig.credentials.toString());
    res.header('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
    res.header('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
    res.header('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
    res.header('Access-Control-Max-Age', corsConfig.maxAge.toString());
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
};
exports.corsMiddleware = corsMiddleware;
const securityHeaders = (req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.removeHeader('X-Powered-By');
    next();
};
exports.securityHeaders = securityHeaders;
const contentTypeValidator = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];
        if (!contentType) {
            res.status(400).json({
                success: false,
                error: 'ContentTypeError',
                message: 'Content-Type header is required'
            });
            return;
        }
        if (!contentType.includes('application/json')) {
            res.status(400).json({
                success: false,
                error: 'ContentTypeError',
                message: 'Content-Type must be application/json'
            });
            return;
        }
    }
    next();
};
exports.contentTypeValidator = contentTypeValidator;
const bodySizeLimit = (req, res, next) => {
    const maxSize = parseInt(process.env['REQUEST_SIZE_LIMIT'] || '1048576');
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > maxSize) {
        res.status(413).json({
            success: false,
            error: 'PayloadTooLargeError',
            message: 'Request body too large'
        });
        return;
    }
    next();
};
exports.bodySizeLimit = bodySizeLimit;
const corsLogger = (req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        console.log(`[CORS] ${req.method} ${req.path} from origin: ${origin}`);
    }
    next();
};
exports.corsLogger = corsLogger;
//# sourceMappingURL=cors.middleware.js.map