#!/usr/bin/env node

/**
 * Скрипт для очистки данных из базы данных
 * Удаляет все записи, но сохраняет структуру таблиц
 *
 * Использование: npm run db:clean [--force]
 */

import 'dotenv/config';
import { sequelize } from '../config/database';
import { runBasicSeeders } from './seeders';
import {
  checkDatabaseConnection,
  cleanAllTables,
  formatDuration,
  getTableCounts,
  waitForConfirmation,
} from './utils';

async function main() {
  const startTime = Date.now();

  try {
    console.log('🧹 Database Clean Script Started');
    console.log('='.repeat(50));

    // Проверяем аргументы командной строки
    const forceClean = process.argv.includes('--force');
    const reseedBasic = process.argv.includes('--reseed');

    if (!forceClean) {
      console.log('⚠️  WARNING: This will delete all data from your database!');
      console.log('   - All records will be deleted');
      console.log('   - Table structure will be preserved');
      console.log('   - You can restore data with seeders');
      console.log('');

      const confirmed = await waitForConfirmation('Are you sure you want to clean all data?');

      if (!confirmed) {
        console.log('❌ Database clean cancelled by user');
        process.exit(0);
      }
    } else {
      console.log('⚡ Force clean mode enabled');
    }

    console.log('\n🔗 Step 1: Checking database connection...');
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to database');
    }

    console.log('\n📊 Step 2: Checking current data...');
    const beforeCounts = await getTableCounts();
    const totalRecordsBefore = Object.values(beforeCounts).reduce(
      (sum, count) => sum + (count > 0 ? count : 0),
      0,
    );

    console.log(`   Total records before cleaning: ${totalRecordsBefore}`);

    if (totalRecordsBefore === 0) {
      console.log('ℹ️  Database is already empty, nothing to clean');
      return;
    }

    console.log('\n🧹 Step 3: Cleaning all tables...');
    await cleanAllTables();

    console.log('\n📊 Step 4: Verifying cleanup...');
    const afterCounts = await getTableCounts();
    const totalRecordsAfter = Object.values(afterCounts).reduce(
      (sum, count) => sum + (count > 0 ? count : 0),
      0,
    );

    console.log(`   Total records after cleaning: ${totalRecordsAfter}`);

    if (reseedBasic) {
      console.log('\n🌱 Step 5: Reseeding basic data...');
      await runBasicSeeders();
      console.log('✅ Basic data restored');
    }

    const duration = formatDuration(startTime);
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 Database cleaned successfully in ${duration}!`);
    console.log(`📊 Removed ${totalRecordsBefore} records from database`);

    if (!reseedBasic) {
      console.log('\n📝 Next steps:');
      console.log('   - Add basic data: npm run db:seed:basic');
      console.log('   - Add demo data: npm run db:seed:demo');
      console.log('   - Full setup: npm run db:setup');
    }
  } catch (error) {
    const duration = formatDuration(startTime);
    console.error(`\n${'='.repeat(50)}`);
    console.error(`❌ Database clean failed after ${duration}:`);
    console.error(error);

    console.log('\n🔧 Recovery options:');
    console.log('1. Run: npm run db:reset --force');
    console.log('2. Check database permissions');
    console.log('3. Manually verify table constraints');

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
