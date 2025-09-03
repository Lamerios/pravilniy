/**
 * Database Configuration
 * PostgreSQL connection settings
 */

// Load environment variables (dotenv will be installed later)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
} catch {
  // dotenv not installed yet, use process.env directly
}

// Simple logger for now (will be replaced when utils/logger is available)
const logger = {
  info: (msg: string) => process.stdout.write(`[INFO] ${msg}\n`),
  error: (msg: string, error?: any) => process.stderr.write(`[ERROR] ${msg} ${error ? String(error) : ''}\n`),
  debug: (msg: string) => process.stdout.write(`[DEBUG] ${msg}\n`),
};

// Database configuration interface
interface DatabaseConfig {
  development: Record<string, any>;
  test: Record<string, any>;
  production: Record<string, any>;
}

// Environment variables with defaults
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_NAME = process.env.DB_NAME || 'quiz_game_dev';
const DB_USER = process.env.DB_USER || 'quiz_user';
const DB_PASSWORD = process.env.DB_PASSWORD || 'dev_password';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Base configuration
const baseConfig = {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres' as const,
  dialectOptions: {
    charset: 'utf8',
    collate: 'utf8_unicode_ci',
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: (msg: string) => logger.debug(msg),
};

// Environment-specific configurations
export const config: DatabaseConfig = {
  development: {
    ...baseConfig,
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    logging: (msg: string) => logger.debug(`[DB] ${msg}`),
  },
  test: {
    ...baseConfig,
    database: `${DB_NAME}_test`,
    username: DB_USER,
    password: DB_PASSWORD,
    logging: false,
  },
  production: {
    ...baseConfig,
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    logging: false,
    dialectOptions: {
      ...baseConfig.dialectOptions,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000,
    },
  },
};

// Sequelize instance will be created when sequelize package is installed
export let sequelize: any = null;

// Initialize Sequelize (will be called after npm install)
export const initializeSequelize = async (): Promise<void> => {
  try {
    // Dynamic import to avoid errors before package installation
    const { Sequelize } = await import('sequelize');
    const currentConfig = config[NODE_ENV as keyof DatabaseConfig];
    sequelize = new Sequelize(currentConfig);
    logger.info('✅ Sequelize initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize Sequelize:', error);
    throw error;
  }
};

// Test database connection
export const testConnection = async (): Promise<void> => {
  if (!sequelize) {
    await initializeSequelize();
  }
  
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// Close database connection
export const closeConnection = async (): Promise<void> => {
  if (!sequelize) {
    return;
  }
  
  try {
    await sequelize.close();
    logger.info('🔒 Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
    throw error;
  }
};
