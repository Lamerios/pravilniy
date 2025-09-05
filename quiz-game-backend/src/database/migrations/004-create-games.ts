import { DataTypes, QueryInterface } from 'sequelize';

/**
 * Миграция для создания таблицы games
 * Создает таблицу для хранения игровых сессий
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('games', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: 'Уникальный идентификатор игровой сессии'
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
      comment: 'Ссылка на организацию-владельца игры'
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'game_templates',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'Ссылка на шаблон игры'
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
      comment: 'Ссылка на пользователя, создавшего игру'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Название игровой сессии'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Описание игровой сессии'
    },
    gameCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Уникальный код для входа в игру'
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'WAITING', 'ACTIVE', 'PAUSED', 'FINISHED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'DRAFT',
      comment: 'Статус игровой сессии'
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
    currentRound: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Номер текущего раунда'
    },
    totalRounds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Общее количество раундов'
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
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Настройки игровой сессии в формате JSON'
    },
    gameData: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Данные игры (вопросы, ответы, конфигурация) в формате JSON'
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
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Дата и время начала игры'
    },
    finishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Дата и время окончания игры'
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Запланированная дата и время игры'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Флаг публичности игры'
    },
    allowLateJoin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Разрешить присоединение после начала игры'
    },
    autoStart: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Автоматический запуск игры'
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
  await queryInterface.addIndex('games', ['organizationId']);
  await queryInterface.addIndex('games', ['templateId']);
  await queryInterface.addIndex('games', ['createdBy']);
  await queryInterface.addIndex('games', ['gameCode'], { unique: true });
  await queryInterface.addIndex('games', ['status']);
  await queryInterface.addIndex('games', ['isPublic']);
  await queryInterface.addIndex('games', ['startedAt']);
  await queryInterface.addIndex('games', ['scheduledAt']);
  await queryInterface.addIndex('games', ['createdAt']);

  console.log('✅ Migration: games table created');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('games');
  console.log('✅ Migration rollback: games table dropped');
}
