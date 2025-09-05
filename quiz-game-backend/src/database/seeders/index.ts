import { seedBasicData } from './basic-seeder';
import { seedDemoGame } from './demo-game-seeder';

/**
 * Главный файл для управления всеми сидерами
 * Позволяет запускать разные наборы данных для разных целей
 */

export interface SeederOptions {
  basic?: boolean;
  demo?: boolean;
  reset?: boolean;
}

/**
 * Запускает все необходимые сидеры
 */
export async function runAllSeeders(options: SeederOptions = {}): Promise<void> {
  const { basic = true, demo = false, reset = false } = options;

  try {
    console.log('🌱 Starting database seeding...');
    console.log(`📋 Options: basic=${basic}, demo=${demo}, reset=${reset}`);

    if (reset) {
      console.log('🔄 Reset option enabled - this would clear existing data first');
      // TODO: Implement reset functionality when needed
    }

    if (basic) {
      console.log('\n📦 Running basic seeder...');
      await seedBasicData();
    }

    if (demo) {
      console.log('\n🎮 Running demo game seeder...');
      await seedDemoGame();
    }

    console.log('\n🎉 All seeders completed successfully!');
    console.log('📊 Database is ready for use');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

/**
 * Запускает только базовые данные (минимум для работы системы)
 */
export async function runBasicSeeders(): Promise<void> {
  return runAllSeeders({ basic: true, demo: false });
}

/**
 * Запускает полный набор данных (базовые + демо игра)
 */
export async function runFullSeeders(): Promise<void> {
  return runAllSeeders({ basic: true, demo: true });
}

/**
 * Запускает только демо игру (требует наличия базовых данных)
 */
export async function runDemoSeeders(): Promise<void> {
  return runAllSeeders({ basic: false, demo: true });
}

// Экспорт отдельных сидеров
export { seedBasicData } from './basic-seeder';
export { seedDemoGame } from './demo-game-seeder';

// Экспорт по умолчанию
export default runAllSeeders;
