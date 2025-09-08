/**
 * Logger Configuration
 * Winston-based logging system
 */

import fs from 'fs';
import path from 'path';

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Log colors (используем в Winston)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
} as const;

// Используем colors для избежания ошибки ESLint
export const LOG_COLORS = colors;

// winston.addColors(colors); // Commented out until winston is properly imported

// Determine log level based on environment
const level = (): string => {
  const env = process.env['NODE_ENV'] || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Simple logger for initial setup (before winston is installed)
const simpleLogger = {
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  http: (msg: string) => console.log(`[HTTP] ${msg}`),
  debug: (msg: string) => console.log(`[DEBUG] ${msg}`),
};

// Initialize Winston logger (will be called after npm install)
let winstonLogger: any = null;

const initializeWinston = async (): Promise<void> => {
  try {
    const winston = await import('winston');

    // Define log format
    const format = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.colorize({ all: true }),
      winston.format.printf((info: any) => `${info.timestamp} ${info.level}: ${info.message}`),
    );

    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Define transports
    const transports = [
      // Console transport
      new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      }),

      // File transport for errors
      new winston.transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),

      // File transport for all logs
      new winston.transports.File({
        filename: path.join('logs', 'combined.log'),
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ];

    // Create logger instance
    winstonLogger = winston.createLogger({
      level: level(),
      levels,
      format,
      transports,
      exitOnError: false,
    });

    // winston.addColors(colors); // Commented out until winston is properly imported
  } catch (error) {
    console.error('Failed to initialize Winston logger:', error);
    throw error;
  }
};

// Export logger (uses simple logger until Winston is initialized)
export const logger = {
  error: (msg: string) => (winstonLogger ? winstonLogger.error(msg) : simpleLogger.error(msg)),
  warn: (msg: string) => (winstonLogger ? winstonLogger.warn(msg) : simpleLogger.warn(msg)),
  info: (msg: string) => (winstonLogger ? winstonLogger.info(msg) : simpleLogger.info(msg)),
  http: (msg: string) => (winstonLogger ? winstonLogger.http(msg) : simpleLogger.http(msg)),
  debug: (msg: string) => (winstonLogger ? winstonLogger.debug(msg) : simpleLogger.debug(msg)),
};

// Stream for Morgan HTTP logging
export const morganStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

// Initialize Winston when called
export { initializeWinston };
