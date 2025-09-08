#!/usr/bin/env node

/**
 * Скрипт для проверки состояния базы данных
 * Показывает информацию о подключении, таблицах и данных
 *
 * Использование: npm run db:check
 */

import 'dotenv/config';
import { sequelize } from '../config/database';
import { checkDatabaseStatus } from './utils';

async function main() {
  try {
    console.log('🔍 Database Status Check');
    console.log('='.repeat(50));

    await checkDatabaseStatus();

    console.log('\n✅ Database check completed');
  } catch (error) {
    console.error('\n❌ Database check failed:', error);

    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if PostgreSQL is running');
    console.log('2. Verify your .env configuration');
    console.log('3. Run: npm run db:setup');

    process.exit(1);
  } finally {
    // Закрываем соединение с базой данных
    await sequelize.close();
  }
}

// Запускаем скрипт
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
