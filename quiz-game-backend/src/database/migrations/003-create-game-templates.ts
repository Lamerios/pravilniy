import { DataTypes, QueryInterface } from 'sequelize';

/**
 * Миграция для создания таблицы game_templates
 * Создает таблицу для хранения шаблонов игр
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('game_templates', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: 'Уникальный идентификатор шаблона игры'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Ссылка на организацию-владельца шаблона'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'Ссылка на пользователя, создавшего шаблон'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Название шаблона игры'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Описание шаблона игры'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Категория шаблона игры'
    },
    difficulty: {
      type: DataTypes.ENUM('EASY', 'MEDIUM', 'HARD', 'EXPERT'),
      allowNull: false,
      defaultValue: 'MEDIUM',
      comment: 'Уровень сложности игры'
    },
    type: {
      type: DataTypes.ENUM('QUIZ', 'SURVEY', 'TRIVIA', 'COMPETITION'),
      allowNull: false,
      defaultValue: 'QUIZ',
      comment: 'Тип игры'
    },
    maxTeams: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        min: 1,
        max: 100
      },
      comment: 'Максимальное количество команд'
    },
    maxPlayersPerTeam: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 1,
        max: 20
      },
      comment: 'Максимальное количество игроков в команде'
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Общее время игры в минутах'
    },
    roundTimeLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Время на раунд в минутах'
    },
    questionTimeLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Время на вопрос в секундах'
    },
    scoringSystem: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        basePoints: 10,
        timeBonus: true,
        penaltyForWrong: false,
        streakBonus: false
      },
      comment: 'Система подсчета очков в формате JSON'
    },
    rules: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Правила игры в формате JSON'
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Дополнительные настройки шаблона в формате JSON'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'Теги для категоризации шаблона'
    },
    thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL изображения-превью шаблона'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Флаг публичности шаблона'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Флаг активности шаблона'
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Версия шаблона'
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Дата и время публикации шаблона'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Дата и время создания записи'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Дата и время последнего обновления записи'
    }
  });

  // Создание индексов
  await queryInterface.addIndex('game_templates', ['organizationId']);
  await queryInterface.addIndex('game_templates', ['createdBy']);
  await queryInterface.addIndex('game_templates', ['name']);
  await queryInterface.addIndex('game_templates', ['category']);
  await queryInterface.addIndex('game_templates', ['difficulty']);
  await queryInterface.addIndex('game_templates', ['type']);
  await queryInterface.addIndex('game_templates', ['isPublic']);
  await queryInterface.addIndex('game_templates', ['isActive']);
  await queryInterface.addIndex('game_templates', ['createdAt']);
  await queryInterface.addIndex('game_templates', ['publishedAt']);

  // GIN индекс для массива тегов (если поддерживается)
  try {
    await queryInterface.sequelize.query(
      'CREATE INDEX game_templates_tags_idx ON game_templates USING GIN (tags)'
    );
  } catch (error) {
    console.warn('⚠️  GIN index for tags not created (may not be supported)');
  }

  console.log('✅ Migration: game_templates table created');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('game_templates');
  console.log('✅ Migration rollback: game_templates table dropped');
}
