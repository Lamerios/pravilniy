#!/usr/bin/env node

/**
 * Скрипт для полного сброса базы данных
 * Удаляет все таблицы, создает их заново и заполняет тестовыми данными
 *
 * Использование: npm run db:reset [--force]
 */

import 'dotenv/config';
import { sequelize } from '../config/database';
import { setupAssociations } from '../models/associations';
import { runAllMigrations } from './migrations';
import { runFullSeeders } from './seeders';
import {
    checkDatabaseConnection,
    checkDatabaseStatus,
    dropAllTables,
    formatDuration,
    waitForConfirmation
} from './utils';

async function main() {
  const startTime = Date.now();

  try {
    console.log('🔄 Database Reset Script Started');
    console.log('=' .repeat(50));

    // Проверяем аргументы командной строки
    const forceReset = process.argv.includes('--force');

    if (!forceReset) {
      console.log('⚠️  WARNING: This will completely reset your database!');
      console.log('   - All tables will be dropped');
      console.log('   - All data will be lost');
      console.log('   - Database will be recreated from scratch');
      console.log('');

      const confirmed = await waitForConfirmation(
        'Are you sure you want to proceed with database reset?'
      );

      if (!confirmed) {
        console.log('❌ Database reset cancelled by user');
        process.exit(0);
      }
    } else {
      console.log('⚡ Force reset mode enabled');
    }

    console.log('\n🔗 Step 1: Checking database connection...');
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to database');
    }

    // Настраиваем ассоциации
    setupAssociations();
    console.log('✅ Model associations configured');

    console.log('\n🗑️  Step 2: Dropping all existing tables...');
    await dropAllTables();

    console.log('\n📊 Step 3: Running migrations...');
    const queryInterface = sequelize.getQueryInterface();
    await runAllMigrations(queryInterface);

    console.log('\n🌱 Step 4: Running seeders...');
    await runFullSeeders();

    console.log('\n🔍 Step 5: Verifying database state...');
    await checkDatabaseStatus();

    const duration = formatDuration(startTime);
    console.log('\n' + '='.repeat(50));
    console.log(`🎉 Database reset completed successfully in ${duration}!`);
    console.log('📊 Your database is now ready to use with fresh test data');

  } catch (error) {
    const duration = formatDuration(startTime);
    console.error('\n' + '='.repeat(50));
    console.error(`❌ Database reset failed after ${duration}:`);
    console.error(error);

    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your database connection settings');
    console.log('2. Ensure PostgreSQL is running');
    console.log('3. Verify database permissions');
    console.log('4. Check the logs above for specific errors');

    process.exit(1);
  } finally {
    // Закрываем соединение с базой данных
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Обработка сигналов завершения
process.on('SIGINT', async () => {
  console.log('\n⚠️  Received SIGINT, cleaning up...');
  await sequelize.close();
  process.exit(130);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Received SIGTERM, cleaning up...');
  await sequelize.close();
  process.exit(143);
});

// Запускаем скрипт
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
