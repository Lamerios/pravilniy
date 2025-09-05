/**
 * Basic Database Seeder
 * Создает основные данные для разработки: организации, пользователи, команды, шаблоны
 */

// Пока Sequelize модели не созданы, используем прямые SQL запросы
// TODO: Заменить на Sequelize модели когда они будут готовы

/**
 * UUID константы для консистентности данных
 */
export const SEED_IDS = {
  // Organization
  DEMO_ORG: '550e8400-e29b-41d4-a716-446655440000',
  
  // Users
  ADMIN_USER: '550e8400-e29b-41d4-a716-446655440001',
  REGULAR_USER: '550e8400-e29b-41d4-a716-446655440002',
  
  // Game Template
  STANDARD_QUIZ: '550e8400-e29b-41d4-a716-446655440010',
  
  // Teams (20 команд)
  TEAMS: Array.from({ length: 20 }, (_, i) => 
    `550e8400-e29b-41d4-a716-44665544${String(i + 100).padStart(4, '0')}`
  ),
} as const;

/**
 * Тестовые данные
 */
export const SEED_DATA = {
  // Организация
  organization: {
    id: SEED_IDS.DEMO_ORG,
    name: 'Demo Organization',
    domain: 'demo.quiz-game.com',
    subscription_tier: 'enterprise',
    settings: {
      max_concurrent_games: 10,
      custom_branding: true,
      analytics_enabled: true,
      max_teams_per_game: 20,
      default_language: 'ru',
    },
    is_active: true,
  },

  // Пользователи
  users: [
    {
      id: SEED_IDS.ADMIN_USER,
      email: 'admin@demo.quiz-game.com',
      password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeK2cOZeZPBZyY6Ay', // Admin123!
      role: 'admin',
      organization_id: SEED_IDS.DEMO_ORG,
      permissions: {
        can_create_games: true,
        can_manage_teams: true,
        can_view_analytics: true,
        can_manage_users: true,
      },
      is_active: true,
    },
    {
      id: SEED_IDS.REGULAR_USER,
      email: 'user@demo.quiz-game.com', 
      password_hash: '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // User123!
      role: 'user',
      organization_id: SEED_IDS.DEMO_ORG,
      permissions: {
        can_create_games: true,
        can_manage_teams: false,
        can_view_analytics: true,
        can_manage_users: false,
      },
      is_active: true,
    },
  ],

  // Шаблон стандартной игры
  gameTemplate: {
    id: SEED_IDS.STANDARD_QUIZ,
    title: 'Стандартная викторина',
    description: 'Классическая викторина из 6 раундов с различными тематиками',
    rounds_config: {
      total_rounds: 6,
      round_types: ['general', 'music', 'movies', 'sports', 'history', 'final'],
      scoring_system: 'standard',
      stake_rounds: [3, 6], // 3-й и 6-й раунды со ставками
    },
    scoring_rules: {
      base_points: 1.0,
      stake_multiplier: 2.0,
      bonus_correct_streak: 0.5,
      penalty_wrong_stake: -0.5,
    },
    is_active: true,
    is_public: true,
    organization_id: SEED_IDS.DEMO_ORG,
    created_by: SEED_IDS.ADMIN_USER,
  },

  // Команды для справочника
  teams: [
    { name: 'Мозговой штурм', description: 'Команда аналитиков и стратегов' },
    { name: 'Эрудиты', description: 'Ценители классической культуры' },
    { name: 'Знатоки', description: 'Универсальные интеллектуалы' },
    { name: 'Мыслители', description: 'Философы и логики' },
    { name: 'Интеллект', description: 'Команда IT-специалистов' },
    { name: 'Сова Минервы', description: 'Ночные мудрецы' },
    { name: 'Квант', description: 'Математики и физики' },
    { name: 'Синапс', description: 'Нейробиологи и психологи' },
    { name: 'Логос', description: 'Филологи и лингвисты' },
    { name: 'Эврика', description: 'Изобретатели и новаторы' },
    { name: 'Парадокс', description: 'Любители нестандартных решений' },
    { name: 'Гении', description: 'Многопрофильные специалисты' },
    { name: 'Мудрецы', description: 'Опытные игроки викторин' },
    { name: 'Стратеги', description: 'Мастера тактического планирования' },
    { name: 'Эксперты', description: 'Узкопрофильные специалисты' },
    { name: 'Аналитики', description: 'Обработчики больших данных' },
    { name: 'Новаторы', description: 'Креативные решатели задач' },
    { name: 'Профессоры', description: 'Академическое сообщество' },
    { name: 'Исследователи', description: 'Научные работники' },
    { name: 'Интуиция', description: 'Команда интуитивных решений' },
  ].map((team, index) => ({
    id: SEED_IDS.TEAMS[index],
    name: team.name,
    description: team.description,
    logo_path: `/images/teams/team_${index + 1}.png`,
    contact_info: {
      captain: `Капитан ${team.name}`,
      phone: `+7-900-${String(index + 1).padStart(3, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      email: `${team.name.toLowerCase().replace(/\s+/g, '')}@teams.ru`,
    },
    total_games: 0,
    total_wins: 0,
    average_score: 0.0,
    organization_id: SEED_IDS.DEMO_ORG,
  })),
};

/**
 * Основной сидер
 */
export async function basicSeeder(): Promise<void> {
  // TODO: Когда появятся Sequelize модели, заменить на:
  // await Organization.bulkCreate([SEED_DATA.organization]);
  // await User.bulkCreate(SEED_DATA.users);
  // await GameTemplate.create(SEED_DATA.gameTemplate);
  // await TeamDirectory.bulkCreate(SEED_DATA.teams);

  console.log('📊 Basic seeder data prepared');
  console.log(`✅ Organization: ${SEED_DATA.organization.name}`);
  console.log(`👥 Users: ${SEED_DATA.users.length} accounts`);
  console.log(`🎮 Game templates: 1 template`);
  console.log(`🏆 Teams: ${SEED_DATA.teams.length} teams`);
  
  // Временная заглушка - данные подготовлены для использования
  console.log('⏳ Waiting for Sequelize models to be implemented...');
}

export default basicSeeder;