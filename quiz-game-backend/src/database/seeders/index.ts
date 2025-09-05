/**
 * Database Seeders Index
 * Экспорт всех сидов для управления тестовыми данными
 */

import { basicSeeder } from './basic-seeder';
import { demoGameSeeder } from './demo-game-seeder';

/**
 * Все доступные сиды в порядке выполнения
 */
export const seeders = {
  basic: basicSeeder,
  demoGame: demoGameSeeder,
} as const;

/**
 * Запуск всех сидов по порядку
 */
export async function runAllSeeders(): Promise<void> {
  console.log('🌱 Starting database seeding...');
  
  try {
    // 1. Базовые данные (организации, пользователи, команды)
    console.log('📊 Running basic seeder...');
    await basicSeeder();
    console.log('✅ Basic seeder completed');

    // 2. Демо игра с полным циклом
    console.log('🎮 Running demo game seeder...');
    await demoGameSeeder();
    console.log('✅ Demo game seeder completed');

    console.log('🎉 All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

/**
 * Запуск только базовых сидов
 */
export async function runBasicSeeder(): Promise<void> {
  console.log('🌱 Running basic seeder only...');
  await basicSeeder();
  console.log('✅ Basic seeder completed');
}

/**
 * Запуск только демо игры
 */
export async function runDemoGameSeeder(): Promise<void> {
  console.log('🎮 Running demo game seeder only...');
  await demoGameSeeder();
  console.log('✅ Demo game seeder completed');
}

export default {
  runAllSeeders,
  runBasicSeeder,
  runDemoGameSeeder,
  seeders,
};