/**
 * Индексный файл для экспорта всех миграций
 * Обеспечивает централизованное управление миграциями базы данных
 */

import * as createOrganizations from './001-create-organizations';
import * as createUsers from './002-create-users';
import * as createGameTemplates from './003-create-game-templates';
import * as createGames from './004-create-games';
import * as createTeams from './005-create-teams';
import * as createRounds from './006-create-rounds';
// import * as createAnswers from './007-create-answers'; // Миграция удалена
import * as createScores from './008-create-scores';

// Экспорт всех миграций в порядке выполнения
export const migrations = [
  {
    name: '001-create-organizations',
    up: createOrganizations.up,
    down: createOrganizations.down
  },
  {
    name: '002-create-users',
    up: createUsers.up,
    down: createUsers.down
  },
  {
    name: '003-create-game-templates',
    up: createGameTemplates.up,
    down: createGameTemplates.down
  },
  {
    name: '004-create-games',
    up: createGames.up,
    down: createGames.down
  },
  {
    name: '005-create-teams',
    up: createTeams.up,
    down: createTeams.down
  },
  {
    name: '006-create-rounds',
    up: createRounds.up,
    down: createRounds.down
  },
  // {
  //   name: '007-create-answers', // Миграция удалена
  //   up: createAnswers.up,
  //   down: createAnswers.down
  // },
  {
    name: '008-create-scores',
    up: createScores.up,
    down: createScores.down
  }
];

// Функция для запуска всех миграций
export async function runAllMigrations(queryInterface: any): Promise<void> {
  console.log('🚀 Starting database migrations...');

  for (const migration of migrations) {
    try {
      console.log(`📝 Running migration: ${migration.name}`);
      await migration.up(queryInterface);
      console.log(`✅ Migration completed: ${migration.name}`);
    } catch (error) {
      console.error(`❌ Migration failed: ${migration.name}`, error);
      throw error;
    }
  }

  console.log('🎉 All migrations completed successfully!');
}

// Функция для отката всех миграций
export async function rollbackAllMigrations(queryInterface: any): Promise<void> {
  console.log('🔄 Starting database migrations rollback...');

  // Откат в обратном порядке
  const reversedMigrations = [...migrations].reverse();

  for (const migration of reversedMigrations) {
    try {
      console.log(`📝 Rolling back migration: ${migration.name}`);
      await migration.down(queryInterface);
      console.log(`✅ Migration rollback completed: ${migration.name}`);
    } catch (error) {
      console.error(`❌ Migration rollback failed: ${migration.name}`, error);
      throw error;
    }
  }

  console.log('🎉 All migrations rolled back successfully!');
}

export default migrations;
