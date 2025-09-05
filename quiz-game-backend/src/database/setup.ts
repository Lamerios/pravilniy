#!/usr/bin/env node

/**
 * Скрипт для полной настройки базы данных
 * Создает таблицы (если их нет) и заполняет тестовыми данными
 *
 * Использование: npm run db:setup [basic|demo|full]
 */

import 'dotenv/config';
import { sequelize } from '../config/database';
import { setupAssociations } from '../models/associations';
import { runAllMigrations } from './migrations';
import { runBasicSeeders, runDemoSeeders, runFullSeeders } from './seeders';
import {
    checkDatabaseConnection,
    checkDatabaseStatus,
    checkTablesExist,
    formatDuration
} from './utils';

async function main() {
  const startTime = Date.now();

  try {
    console.log('🚀 Database Setup Script Started');
    console.log('=' .repeat(50));

    // Получаем тип настройки из аргументов
    const setupType = process.argv[2] || 'full';
    console.log(`📋 Setup type: ${setupType}`);

    console.log('\n🔗 Step 1: Checking database connection...');
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to database');
    }

    // Настраиваем ассоциации
    setupAssociations();
    console.log('✅ Model associations configured');

    console.log('\n📊 Step 2: Checking existing tables...');
    const tablesInfo = await checkTablesExist();

    if (!tablesInfo.exists) {
      console.log('⚠️  Missing tables detected, running migrations...');
      console.log(`   Missing: ${tablesInfo.missingTables.join(', ')}`);

      const queryInterface = sequelize.getQueryInterface();
      await runAllMigrations(queryInterface);
    } else {
      console.log('✅ All required tables exist');
    }

    console.log('\n🌱 Step 3: Running seeders...');
    switch (setupType.toLowerCase()) {
      case 'basic':
        console.log('📦 Running basic seeders only...');
        await runBasicSeeders();
        break;

      case 'demo':
        console.log('🎮 Running demo seeders only...');
        await runDemoSeeders();
        break;

      case 'full':
      default:
        console.log('🎯 Running all seeders...');
        await runFullSeeders();
        break;
    }

    console.log('\n🔍 Step 4: Verifying database state...');
    await checkDatabaseStatus();

    const duration = formatDuration(startTime);
    console.log('\n' + '='.repeat(50));
    console.log(`🎉 Database setup completed successfully in ${duration}!`);
    console.log('📊 Your database is ready to use');

    // Показываем следующие шаги
    console.log('\n📝 Next steps:');
    console.log('   - Start your application: npm run dev');
    console.log('   - Check database status: npm run db:check');
    console.log('   - Reset if needed: npm run db:reset');

  } catch (error) {
    const duration = formatDuration(startTime);
    console.error('\n' + '='.repeat(50));
    console.error(`❌ Database setup failed after ${duration}:`);
    console.error(error);

    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your database connection settings in .env');
    console.log('2. Ensure PostgreSQL is running and accessible');
    console.log('3. Verify database permissions for your user');
    console.log('4. Try running: npm run db:reset --force');

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
