"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.asyncHandler = exports.uncaughtExceptionHandler = exports.unhandledRejectionHandler = exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const sequelize_1 = require("sequelize");
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Внутренняя ошибка сервера';
    let errorName = error.name || 'InternalServerError';
    let details = undefined;
    console.error(`[ERROR] ${req.method} ${req.path} - ${statusCode}:`, {
        message: error.message,
        stack: error.stack,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user?.userId || 'Anonymous'
    });
    if (error instanceof sequelize_1.ValidationError) {
        statusCode = 400;
        errorName = 'ValidationError';
        message = 'Ошибка валидации данных';
        details = error.errors.map(err => ({
            field: err.path,
            message: err.message,
            value: err.value
        }));
    }
    else if (error.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        errorName = 'UniqueConstraintError';
        message = 'Запись с такими данными уже существует';
    }
    else if (error.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 400;
        errorName = 'ForeignKeyConstraintError';
        message = 'Нарушение связей между данными';
    }
    else if (error.name === 'SequelizeDatabaseError') {
        statusCode = 500;
        errorName = 'DatabaseError';
        message = 'Ошибка базы данных';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorName = 'TokenError';
        message = 'Недействительный токен';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        errorName = 'TokenExpiredError';
        message = 'Токен истек';
    }
    else if (error.name === 'SyntaxError' && 'body' in error) {
        statusCode = 400;
        errorName = 'SyntaxError';
        message = 'Некорректный JSON';
    }
    else if (error.name === 'MulterError') {
        statusCode = 400;
        errorName = 'FileUploadError';
        message = 'Ошибка загрузки файла';
    }
    else if (error.name === 'CastError') {
        statusCode = 400;
        errorName = 'CastError';
        message = 'Некорректный формат данных';
    }
    const errorResponse = {
        success: false,
        error: errorName,
        message: message
    };
    if (process.env['NODE_ENV'] === 'development') {
        errorResponse.details = details;
        if (error.stack) {
            errorResponse.stack = error.stack;
        }
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    const errorResponse = {
        success: false,
        error: 'NotFoundError',
        message: `Роут ${req.method} ${req.path} не найден`
    };
    res.status(404).json(errorResponse);
};
exports.notFoundHandler = notFoundHandler;
const unhandledRejectionHandler = (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (process.env['NODE_ENV'] === 'production') {
    }
};
exports.unhandledRejectionHandler = unhandledRejectionHandler;
const uncaughtExceptionHandler = (error) => {
    console.error('Uncaught Exception:', error);
    if (process.env['NODE_ENV'] === 'production') {
    }
    process.exit(1);
};
exports.uncaughtExceptionHandler = uncaughtExceptionHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    console.log(`[REQUEST] ${req.method} ${req.path} - ${req.ip} - ${new Date().toISOString()}`);
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
        const resetColor = '\x1b[0m';
        console.log(`${statusColor}[RESPONSE] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms${resetColor}`);
        return originalSend.call(this, data);
    };
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=error.middleware.js.map