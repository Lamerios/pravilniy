/**
 * Demo Game Seeder
 * Создает полную демонстрационную игру с результатами для тестирования
 */

import { SEED_IDS } from './basic-seeder';

/**
 * ID для демо игры и связанных данных
 */
export const DEMO_GAME_IDS = {
  GAME: '550e8400-e29b-41d4-a716-446655445000',
  
  // Round Templates (6 раундов)
  ROUND_TEMPLATES: Array.from({ length: 6 }, (_, i) => 
    `550e8400-e29b-41d4-a716-44665544501${i}`
  ),
  
  // Round Instances
  ROUND_INSTANCES: Array.from({ length: 6 }, (_, i) => 
    `550e8400-e29b-41d4-a716-44665544502${i}`
  ),
  
  // Team Instances (8 участвующих команд)
  TEAM_INSTANCES: Array.from({ length: 8 }, (_, i) => 
    `550e8400-e29b-41d4-a716-44665544503${i}`
  ),
} as const;

/**
 * Данные демонстрационной игры
 */
export const DEMO_GAME_DATA = {
  // Основная игра
  game: {
    id: DEMO_GAME_IDS.GAME,
    title: 'Demo Quiz Night - Интеллектуальная битва',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Неделю назад
    status: 'completed',
    current_round: 6,
    metadata: {
      venue: 'Демо-площадка Quiz Game',
      entry_fee: 500,
      prize_pool: 15000,
      sponsors: ['TechCorp', 'BrainGames Ltd'],
      host: 'Алексей Ведущий',
    },
    notes: 'Демонстрационная игра для показа возможностей системы',
    template_id: SEED_IDS.STANDARD_QUIZ,
    organization_id: SEED_IDS.DEMO_ORG,
    created_by: SEED_IDS.ADMIN_USER,
    started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 часа
    completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // +5 часов
  },

  // Шаблоны раундов
  roundTemplates: [
    {
      id: DEMO_GAME_IDS.ROUND_TEMPLATES[0],
      name: 'Разминка',
      question_count: 10,
      points_per_correct: 1.0,
      stake_enabled: false,
      stake_options: [],
      allowed_point_values: [1.0],
      custom_rules: {},
      order: 1,
      game_template_id: SEED_IDS.STANDARD_QUIZ,
    },
    {
      id: DEMO_GAME_IDS.ROUND_TEMPLATES[1],
      name: 'Музыкальный',
      question_count: 8,
      points_per_correct: 1.5,
      stake_enabled: false,
      stake_options: [],
      allowed_point_values: [1.5],
      custom_rules: { theme: 'music', bonus_for_artist_and_song: 0.5 },
      order: 2,
      game_template_id: SEED_IDS.STANDARD_QUIZ,
    },
    {
      id: DEMO_GAME_IDS.ROUND_TEMPLATES[2],
      name: 'Кино со ставками',
      question_count: 6,
      points_per_correct: 2.0,
      stake_enabled: true,
      stake_options: [1, 2, 3],
      allowed_point_values: [2.0, 4.0, 6.0],
      custom_rules: { theme: 'movies', stake_multiplier: 2.0 },
      order: 3,
      game_template_id: SEED_IDS.STANDARD_QUIZ,
    },
    {
      id: DEMO_GAME_IDS.ROUND_TEMPLATES[3],
      name: 'Спорт',
      question_count: 8,
      points_per_correct: 1.5,
      stake_enabled: false,
      stake_options: [],
      allowed_point_values: [1.5],
      custom_rules: { theme: 'sports' },
      order: 4,
      game_template_id: SEED_IDS.STANDARD_QUIZ,
    },
    {
      id: DEMO_GAME_IDS.ROUND_TEMPLATES[4],
      name: 'История',
      question_count: 7,
      points_per_correct: 2.0,
      stake_enabled: false,
      stake_options: [],
      allowed_point_values: [2.0],
      custom_rules: { theme: 'history' },
      order: 5,
      game_template_id: SEED_IDS.STANDARD_QUIZ,
    },
    {
      id: DEMO_GAME_IDS.ROUND_TEMPLATES[5],
      name: 'Финальные ставки',
      question_count: 5,
      points_per_correct: 3.0,
      stake_enabled: true,
      stake_options: [1, 2, 3, 4, 5],
      allowed_point_values: [3.0, 6.0, 9.0, 12.0, 15.0],
      custom_rules: { theme: 'mixed', final_round: true, all_or_nothing: true },
      order: 6,
      game_template_id: SEED_IDS.STANDARD_QUIZ,
    },
  ],

  // Участвующие команды (8 из 20 доступных)
  participatingTeams: [
    { team_directory_id: SEED_IDS.TEAMS[0], table_number: 1, name: 'Мозговой штурм' },
    { team_directory_id: SEED_IDS.TEAMS[1], table_number: 2, name: 'Эрудиты' },
    { team_directory_id: SEED_IDS.TEAMS[2], table_number: 3, name: 'Знатоки' },
    { team_directory_id: SEED_IDS.TEAMS[4], table_number: 4, name: 'Интеллект' },
    { team_directory_id: SEED_IDS.TEAMS[6], table_number: 5, name: 'Квант' },
    { team_directory_id: SEED_IDS.TEAMS[8], table_number: 6, name: 'Логос' },
    { team_directory_id: SEED_IDS.TEAMS[10], table_number: 7, name: 'Парадокс' },
    { team_directory_id: SEED_IDS.TEAMS[12], table_number: 8, name: 'Мудрецы' },
  ].map((team, index) => ({
    id: DEMO_GAME_IDS.TEAM_INSTANCES[index],
    ...team,
    total_points: 0.0, // Будет рассчитано из ответов
    final_position: index + 1, // Временно, пересчитается
    team_metadata: {
      captain_present: true,
      team_size: Math.floor(Math.random() * 3) + 4, // 4-6 человек
      special_needs: index === 2 ? ['wheelchair_access'] : [],
    },
    game_id: DEMO_GAME_IDS.GAME,
  })),

  // Реалистичные результаты раундов
  roundResults: {
    // Разминка (10 вопросов по 1 баллу)
    round1: [
      { team_index: 0, correct: 8, total: 10 }, // Мозговой штурм
      { team_index: 1, correct: 9, total: 10 }, // Эрудиты  
      { team_index: 2, correct: 7, total: 10 }, // Знатоки
      { team_index: 3, correct: 8, total: 10 }, // Интеллект
      { team_index: 4, correct: 9, total: 10 }, // Квант
      { team_index: 5, correct: 6, total: 10 }, // Логос
      { team_index: 6, correct: 7, total: 10 }, // Парадокс
      { team_index: 7, correct: 8, total: 10 }, // Мудрецы
    ],
    
    // Музыкальный (8 вопросов по 1.5 балла)
    round2: [
      { team_index: 0, correct: 6, total: 8 },
      { team_index: 1, correct: 7, total: 8 },
      { team_index: 2, correct: 8, total: 8 },
      { team_index: 3, correct: 5, total: 8 },
      { team_index: 4, correct: 4, total: 8 },
      { team_index: 5, correct: 7, total: 8 },
      { team_index: 6, correct: 6, total: 8 },
      { team_index: 7, correct: 7, total: 8 },
    ],

    // И так далее для остальных раундов...
  },
};

/**
 * Генерация реалистичных ответов для команды в раунде
 */
function generateAnswers(
  teamIndex: number, 
  roundIndex: number, 
  correctCount: number, 
  totalQuestions: number,
  pointsPerCorrect: number,
  stakeEnabled: boolean = false
) {
  const answers = [];
  const correctAnswers = new Set();
  
  // Случайным образом выбираем какие вопросы будут правильными
  while (correctAnswers.size < correctCount) {
    correctAnswers.add(Math.floor(Math.random() * totalQuestions) + 1);
  }
  
  for (let q = 1; q <= totalQuestions; q++) {
    const isCorrect = correctAnswers.has(q);
    const stake = stakeEnabled ? Math.floor(Math.random() * 3) + 1 : 1;
    
    answers.push({
      question_number: q,
      is_correct: isCorrect,
      stake: stake,
      points_awarded: isCorrect ? pointsPerCorrect * stake : 0,
      notes: isCorrect ? '' : 'Неточный ответ',
      answer_metadata: {
        confidence_level: Math.floor(Math.random() * 5) + 1,
        time_taken_seconds: Math.floor(Math.random() * 120) + 30,
      },
      round_id: DEMO_GAME_IDS.ROUND_INSTANCES[roundIndex],
      team_id: DEMO_GAME_IDS.TEAM_INSTANCES[teamIndex],
      created_by: SEED_IDS.ADMIN_USER,
    });
  }
  
  return answers;
}

/**
 * Основной сидер демо игры
 */
export async function demoGameSeeder(): Promise<void> {
  // TODO: Когда появятся Sequelize модели, реализовать:
  // 1. Создание игры
  // 2. Создание шаблонов раундов
  // 3. Создание экземпляров раундов
  // 4. Создание команд-участников
  // 5. Генерация всех ответов
  // 6. Расчет итоговых баллов и позиций

  console.log('🎮 Demo game seeder data prepared');
  console.log(`✅ Game: ${DEMO_GAME_DATA.game.title}`);
  console.log(`📅 Date: ${DEMO_GAME_DATA.game.date.toLocaleDateString()}`);
  console.log(`🏆 Teams: ${DEMO_GAME_DATA.participatingTeams.length} participants`);
  console.log(`🎯 Rounds: ${DEMO_GAME_DATA.roundTemplates.length} rounds`);
  console.log(`📊 Status: ${DEMO_GAME_DATA.game.status}`);
  
  // Подсчет общего количества ответов
  const totalAnswers = DEMO_GAME_DATA.roundTemplates.reduce((sum, round) => 
    sum + (round.question_count * DEMO_GAME_DATA.participatingTeams.length), 0
  );
  console.log(`💭 Total answers to generate: ${totalAnswers}`);
  
  // Временная заглушка - данные подготовлены для использования
  console.log('⏳ Waiting for Sequelize models to be implemented...');
}

export default demoGameSeeder;