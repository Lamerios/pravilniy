/**
 * Database Configuration
 * PostgreSQL connection settings
 */

import { Sequelize, Options } from 'sequelize';

import { logger } from '@utils/logger';

// Database configuration interface
interface DatabaseConfig {
  development: Options;
  test: Options;
  production: Options;
}

// Environment variables with defaults
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_NAME = process.env.DB_NAME || 'quiz_game_dev';
const DB_USER = process.env.DB_USER || 'quiz_user';
const DB_PASSWORD = process.env.DB_PASSWORD || 'dev_password';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Base configuration
const baseConfig: Options = {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
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

// Create Sequelize instance
const currentConfig = config[NODE_ENV as keyof DatabaseConfig];
export const sequelize = new Sequelize(currentConfig);

// Test database connection
export const testConnection = async (): Promise<void> => {
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
  try {
    await sequelize.close();
    logger.info('🔒 Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
    throw error;
  }
};
