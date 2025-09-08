// Answer модель удалена - ответы не хранятся в системе
import { GameTemplate } from '../../models/game-template.model';
import { Organization } from '../../models/organization.model';
import { User, UserRole } from '../../models/user.model';

/**
 * Базовый сидер для создания тестовых данных
 */
export async function seedBasicData(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');

    // Создаем организацию
    const organization = await Organization.create({
      name: 'Quiz Game Demo Organization',
      description: 'Демонстрационная организация для тестирования',
      email: 'demo@quiz-game.com',
      website: 'https://quiz-game.com',
      isActive: true,
    });

    console.log('✅ Organization created:', organization.name);

    // Создаем пользователя-админа
    const adminUser = await User.create({
      email: 'admin@quiz-game.com',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq', // password123
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      organizationId: organization.id,
      isActive: true,
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Создаем шаблон игры
    const gameTemplate = await GameTemplate.create({
      name: 'Классическая викторина',
      description:
        'Стандартный шаблон для проведения викторин. Администратор создает раунды и вносит баллы команд вручную.',
      roundsCount: 3,
      maxTeams: 20,
      organizationId: organization.id,
      createdBy: adminUser.id,
      isActive: true,
    });

    console.log('✅ Game template created:', gameTemplate.name);

    console.log('ℹ️  Demo game, teams, rounds and scores will be created during actual usage');
    console.log('ℹ️  Seeder focuses on basic data: Organization, Admin user, and Game template');
    console.log(
      'ℹ️  Business process: Admin creates games, teams register, admin enters round scores',
    );

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

export default seedBasicData;
