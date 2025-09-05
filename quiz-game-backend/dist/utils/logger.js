"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWinston = exports.morganStream = exports.logger = exports.LOG_COLORS = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
exports.LOG_COLORS = colors;
const level = () => {
    const env = process.env['NODE_ENV'] || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};
const simpleLogger = {
    error: (msg) => console.error(`[ERROR] ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${msg}`),
    info: (msg) => console.log(`[INFO] ${msg}`),
    http: (msg) => console.log(`[HTTP] ${msg}`),
    debug: (msg) => console.log(`[DEBUG] ${msg}`),
};
let winstonLogger = null;
const initializeWinston = async () => {
    try {
        const winston = await Promise.resolve().then(() => tslib_1.__importStar(require('winston')));
        const format = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston.format.colorize({ all: true }), winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
        const logsDir = path_1.default.join(process.cwd(), 'logs');
        if (!fs_1.default.existsSync(logsDir)) {
            fs_1.default.mkdirSync(logsDir, { recursive: true });
        }
        const transports = [
            new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
            }),
            new winston.transports.File({
                filename: path_1.default.join('logs', 'error.log'),
                level: 'error',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                maxsize: 5242880,
                maxFiles: 5,
            }),
            new winston.transports.File({
                filename: path_1.default.join('logs', 'combined.log'),
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                maxsize: 5242880,
                maxFiles: 5,
            }),
        ];
        winstonLogger = winston.createLogger({
            level: level(),
            levels,
            format,
            transports,
            exitOnError: false,
        });
    }
    catch (error) {
        console.error('Failed to initialize Winston logger:', error);
        throw error;
    }
};
exports.initializeWinston = initializeWinston;
exports.logger = {
    error: (msg) => winstonLogger ? winstonLogger.error(msg) : simpleLogger.error(msg),
    warn: (msg) => winstonLogger ? winstonLogger.warn(msg) : simpleLogger.warn(msg),
    info: (msg) => winstonLogger ? winstonLogger.info(msg) : simpleLogger.info(msg),
    http: (msg) => winstonLogger ? winstonLogger.http(msg) : simpleLogger.http(msg),
    debug: (msg) => winstonLogger ? winstonLogger.debug(msg) : simpleLogger.debug(msg),
};
exports.morganStream = {
    write: (message) => {
        exports.logger.http(message.trim());
    },
};
//# sourceMappingURL=logger.js.map