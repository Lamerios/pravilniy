import { sequelize } from '../config/database';
// Answer модель удалена
import { setupAssociations } from '../models/associations';
import { GameTemplate } from '../models/game-template.model';
import { Game } from '../models/game.model';
import { Organization } from '../models/organization.model';
import { Round } from '../models/round.model';
import { Score } from '../models/score.model';
import { Team } from '../models/team.model';
import { User } from '../models/user.model';
import { runAllSeeders } from './seeders';

/**
 * Инициализация базы данных
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Добавляем модели в Sequelize
    sequelize.addModels([
      Organization,
      User,
      GameTemplate,
      Game,
      Team,
      Round,
      // Answer, // Модель удалена
      Score
    ]);

    // Настраиваем ассоциации
    setupAssociations();

    console.log('✅ Database models initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database models:', error);
    throw error;
  }
}

/**
 * Синхронизация базы данных
 */
export async function syncDatabase(): Promise<void> {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Failed to sync database:', error);
    throw error;
  }
}

/**
 * Полная инициализация БД
 */
export async function setupDatabase(): Promise<void> {
  try {
    await initializeDatabase();
    await syncDatabase();

    // Запускаем сидеры только если таблицы пустые
    const orgCount = await Organization.count();
    if (orgCount === 0) {
      await runAllSeeders();
    }

    console.log('✅ Database setup completed');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}
