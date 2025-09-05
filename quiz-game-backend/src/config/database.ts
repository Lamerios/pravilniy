// Загружаем переменные окружения в самом начале
import 'dotenv/config';

import { Sequelize } from 'sequelize-typescript';
import { config } from './config';

// Импортируем модели
// Answer модель удалена
import { GameTemplate } from '../models/game-template.model';
import { Game } from '../models/game.model';
import { Organization } from '../models/organization.model';
import { Round } from '../models/round.model';
import { Score } from '../models/score.model';
import { Team } from '../models/team.model';
import { User } from '../models/user.model';

// Интерфейс для конфигурации БД
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: 'postgres';
  logging: boolean;
  pool: {
    min: number;
    max: number;
    acquire: number;
    idle: number;
  };
  dialectOptions?: {
    ssl: boolean;
    connectTimeout: number;
  };
  models: any[];
}

// Конфигурация подключения к БД
const dbConfig: DatabaseConfig = {
  host: config.db.host === 'localhost' ? '127.0.0.1' : config.db.host, // Принудительно IPv4
  port: config.db.port,
  database: config.db.name,
  username: config.db.user,
  password: config.db.password,
  dialect: 'postgres',
  logging: config.db.logging,
  pool: {
    min: config.db.pool.min,
    max: config.db.pool.max,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    // Дополнительные опции для pg драйвера
    ssl: false,
    connectTimeout: 60000,
  },
  models: [Organization, User, GameTemplate, Game, Team, Round, Score]
};

// Отладочная информация
console.log('🔍 Database config:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  username: dbConfig.username,
  password: dbConfig.password ? '***' : 'undefined'
});

// Создание экземпляра Sequelize
export const sequelize = new Sequelize(dbConfig);

// Функция для подключения к БД
export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Синхронизация моделей (в development режиме)
    if (config.server.env === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
}

// Функция для закрытия соединения
export async function closeDatabase(): Promise<void> {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
}

// Экспорт для использования в других модулях
export default sequelize;
