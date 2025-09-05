#!/usr/bin/env node

/**
 * Скрипт для запуска сидеров базы данных
 * Использование: npm run db:seed [basic|demo|full]
 */

import 'dotenv/config';
import { sequelize } from '../config/database';
import { setupAssociations } from '../models/associations';
import { runBasicSeeders, runDemoSeeders, runFullSeeders } from './seeders';

async function main() {
  try {
    console.log('🚀 Database seeding script started');

    // Получаем аргумент командной строки
    const seedType = process.argv[2] || 'basic';

    console.log(`📋 Seed type: ${seedType}`);

    // Подключаемся к базе данных
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Настраиваем ассоциации
    setupAssociations();
    console.log('🔗 Model associations configured');

    // Синхронизируем модели (создаем таблицы если их нет)
    console.log('🔄 Synchronizing database schema...');
    await sequelize.sync({ alter: false }); // Не изменяем существующие таблицы
    console.log('✅ Database schema synchronized');

    // Запускаем соответствующие сидеры
    switch (seedType.toLowerCase()) {
      case 'basic':
        console.log('\n📦 Running basic seeders only...');
        await runBasicSeeders();
        break;

      case 'demo':
        console.log('\n🎮 Running demo seeders only...');
        await runDemoSeeders();
        break;

      case 'full':
        console.log('\n🎯 Running all seeders...');
        await runFullSeeders();
        break;

      default:
        console.error(`❌ Unknown seed type: ${seedType}`);
        console.log('Available options: basic, demo, full');
        process.exit(1);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Your database is ready to use');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    // Закрываем соединение с базой данных
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Запускаем скрипт
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
