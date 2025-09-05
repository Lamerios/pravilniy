/**
 * Database Connection Checker
 * Проверка подключения к базе данных и базовой настройки
 */

import { testConnection } from '../config/database';

/**
 * Проверка подключения к базе данных
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Checking database connection...');
    
    await testConnection();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Проверка структуры базы данных
 */
export async function checkDatabaseStructure(): Promise<boolean> {
  try {
    console.log('🔍 Checking database structure...');
    
    // TODO: Когда появятся Sequelize модели, добавить проверки:
    // - Наличие схем (core, analytics, audit)
    // - Наличие основных таблиц
    // - Проверка индексов
    // - Проверка foreign keys
    
    console.log('⏳ Structure check pending Sequelize models implementation');
    return true;
  } catch (error) {
    console.error('❌ Database structure check failed:', error);
    return false;
  }
}

/**
 * Проверка прав доступа
 */
export async function checkDatabasePermissions(): Promise<boolean> {
  try {
    console.log('🔍 Checking database permissions...');
    
    // TODO: Добавить проверки прав:
    // - SELECT, INSERT, UPDATE, DELETE на основных таблицах
    // - CREATE для создания временных объектов
    // - Права на выполнение процедур
    
    console.log('⏳ Permissions check pending implementation');
    return true;
  } catch (error) {
    console.error('❌ Database permissions check failed:', error);
    return false;
  }
}

/**
 * Полная проверка готовности БД
 */
export async function fullDatabaseCheck(): Promise<void> {
  console.log('🚀 Starting full database check...\n');
  
  const checks = [
    { name: 'Connection', check: checkDatabaseConnection },
    { name: 'Structure', check: checkDatabaseStructure },
    { name: 'Permissions', check: checkDatabasePermissions },
  ];
  
  const results = [];
  
  for (const { name, check } of checks) {
    const result = await check();
    results.push({ name, success: result });
  }
  
  console.log('\n📊 Check Results:');
  console.log('─'.repeat(40));
  
  let allPassed = true;
  for (const { name, success } of results) {
    const status = success ? '✅' : '❌';
    const message = success ? 'PASSED' : 'FAILED';
    console.log(`${status} ${name.padEnd(15)} ${message}`);
    
    if (!success) {
      allPassed = false;
    }
  }
  
  console.log('─'.repeat(40));
  
  if (allPassed) {
    console.log('🎉 All database checks passed!');
  } else {
    console.log('⚠️  Some database checks failed. Please fix the issues.');
    process.exit(1);
  }
}

// CLI запуск
if (require.main === module) {
  fullDatabaseCheck().catch((error) => {
    console.error('💥 Database check crashed:', error);
    process.exit(1);
  });
}

export default {
  checkDatabaseConnection,
  checkDatabaseStructure, 
  checkDatabasePermissions,
  fullDatabaseCheck,
};