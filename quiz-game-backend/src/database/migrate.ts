/**
 * Скрипт для запуска миграций базы данных
 * Использует Sequelize QueryInterface для выполнения миграций
 */

import 'dotenv/config';
import { sequelize } from '../config/database';
import { rollbackAllMigrations, runAllMigrations } from './migrations';

async function migrate() {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    const queryInterface = sequelize.getQueryInterface();

    // Получаем аргумент командной строки
    const action = process.argv[2];

    switch (action) {
      case 'up':
        await runAllMigrations(queryInterface);
        break;

      case 'down':
        await rollbackAllMigrations(queryInterface);
        break;

      case 'reset':
        console.log('🔄 Resetting database (rollback + migrate)...');
        await rollbackAllMigrations(queryInterface);
        await runAllMigrations(queryInterface);
        break;

      default:
        console.log('📋 Usage:');
        console.log('  npm run migrate:up    - Run all migrations');
        console.log('  npm run migrate:down  - Rollback all migrations');
        console.log('  npm run migrate:reset - Reset database (rollback + migrate)');
        process.exit(1);
    }

    console.log('🎉 Migration process completed successfully!');
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Запуск миграции, если файл запущен напрямую
if (require.main === module) {
  migrate();
}

export { migrate };
