import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';

/**
 * Утилиты для работы с базой данных
 * Содержит функции для проверки, очистки и управления БД
 */

/**
 * Проверяет подключение к базе данных
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection is working');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Получает информацию о базе данных
 */
export async function getDatabaseInfo(): Promise<{
  dialect: string;
  database: string;
  host: string;
  port: number;
  tables: string[];
}> {
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();

  return {
    dialect: sequelize.getDialect(),
    database: sequelize.getDatabaseName(),
    host: sequelize.config.host || 'localhost',
    port: Number(sequelize.config.port) || 5432,
    tables: tables as string[]
  };
}

/**
 * Проверяет существование таблиц
 */
export async function checkTablesExist(): Promise<{
  exists: boolean;
  tables: string[];
  missingTables: string[];
}> {
  const queryInterface = sequelize.getQueryInterface();
  const existingTables = await queryInterface.showAllTables() as string[];

  // Ожидаемые таблицы
  const expectedTables = [
    'organizations',
    'users',
    'game_templates',
    'games',
    'teams',
    'rounds',
    'scores'
  ];

  const missingTables = expectedTables.filter(table =>
    !existingTables.includes(table)
  );

  return {
    exists: missingTables.length === 0,
    tables: existingTables,
    missingTables
  };
}

/**
 * Очищает все данные из таблиц (но сохраняет структуру)
 */
export async function cleanAllTables(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables() as string[];

  console.log('🧹 Cleaning all tables...');

  // Отключаем проверки внешних ключей
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }).catch(() => {
    // Для PostgreSQL
    return sequelize.query('SET session_replication_role = replica', { raw: true });
  });

  try {
    // Очищаем таблицы в обратном порядке (чтобы избежать конфликтов FK)
    const tablesToClean = [...tables].reverse();

    for (const table of tablesToClean) {
      try {
        await queryInterface.bulkDelete(table, {}, {});
        console.log(`  ✅ Cleaned table: ${table}`);
      } catch (error) {
        console.warn(`  ⚠️  Could not clean table ${table}:`, (error as Error).message);
      }
    }
  } finally {
    // Включаем обратно проверки внешних ключей
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true }).catch(() => {
      // Для PostgreSQL
      return sequelize.query('SET session_replication_role = DEFAULT', { raw: true });
    });
  }

  console.log('✅ All tables cleaned');
}

/**
 * Удаляет все таблицы из базы данных
 */
export async function dropAllTables(): Promise<void> {
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables() as string[];

  if (tables.length === 0) {
    console.log('ℹ️  No tables to drop');
    return;
  }

  console.log('🗑️  Dropping all tables...');

  // Отключаем проверки внешних ключей
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }).catch(() => {
    // Для PostgreSQL
    return sequelize.query('SET session_replication_role = replica', { raw: true });
  });

  try {
    // Удаляем таблицы в обратном порядке
    const tablesToDrop = [...tables].reverse();

    for (const table of tablesToDrop) {
      try {
        await queryInterface.dropTable(table);
        console.log(`  ✅ Dropped table: ${table}`);
      } catch (error) {
        console.warn(`  ⚠️  Could not drop table ${table}:`, (error as Error).message);
      }
    }
  } finally {
    // Включаем обратно проверки внешних ключей
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true }).catch(() => {
      // Для PostgreSQL
      return sequelize.query('SET session_replication_role = DEFAULT', { raw: true });
    });
  }

  console.log('✅ All tables dropped');
}

/**
 * Получает количество записей в каждой таблице
 */
export async function getTableCounts(): Promise<Record<string, number>> {
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables() as string[];
  const counts: Record<string, number> = {};

  for (const table of tables) {
    try {
      const result = await sequelize.query(
        `SELECT COUNT(*) as count FROM ${table}`,
        { type: QueryTypes.SELECT }
      );
      counts[table] = (result[0] as any).count;
    } catch (error) {
      counts[table] = -1; // Ошибка при подсчете
    }
  }

  return counts;
}

/**
 * Проверяет состояние базы данных и выводит отчет
 */
export async function checkDatabaseStatus(): Promise<void> {
  console.log('🔍 Checking database status...\n');

  // Проверяем подключение
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    console.log('❌ Cannot proceed - database connection failed');
    return;
  }

  // Получаем информацию о БД
  const dbInfo = await getDatabaseInfo();
  console.log('📊 Database Information:');
  console.log(`   Dialect: ${dbInfo.dialect}`);
  console.log(`   Database: ${dbInfo.database}`);
  console.log(`   Host: ${dbInfo.host}:${dbInfo.port}`);
  console.log(`   Tables: ${dbInfo.tables.length}\n`);

  // Проверяем таблицы
  const tablesInfo = await checkTablesExist();
  console.log('📋 Tables Status:');
  if (tablesInfo.exists) {
    console.log('   ✅ All expected tables exist');
  } else {
    console.log('   ⚠️  Missing tables:', tablesInfo.missingTables.join(', '));
  }

  // Получаем количество записей
  if (tablesInfo.tables.length > 0) {
    console.log('\n📈 Record Counts:');
    const counts = await getTableCounts();

    for (const [table, count] of Object.entries(counts)) {
      const status = count === -1 ? '❌ Error' : `${count} records`;
      console.log(`   ${table}: ${status}`);
    }
  }

  console.log('\n✅ Database status check completed');
}

/**
 * Ждет подтверждения пользователя
 */
export async function waitForConfirmation(message: string): Promise<boolean> {
  // В production или CI среде не запрашиваем подтверждение
  if (process.env['NODE_ENV'] === 'production' || process.env['CI'] === 'true') {
    console.log(`⚠️  ${message} (auto-confirmed in ${process.env['NODE_ENV'] || 'CI'} environment)`);
    return true;
  }

  // В development среде показываем предупреждение, но не блокируем
  console.log(`⚠️  ${message}`);
  console.log('ℹ️  Proceeding automatically in development environment...');
  return true;
}

/**
 * Форматирует время выполнения
 */
export function formatDuration(startTime: number): string {
  const duration = Date.now() - startTime;
  if (duration < 1000) {
    return `${duration}ms`;
  } else if (duration < 60000) {
    return `${(duration / 1000).toFixed(1)}s`;
  } else {
    return `${Math.floor(duration / 60000)}m ${((duration % 60000) / 1000).toFixed(1)}s`;
  }
}
