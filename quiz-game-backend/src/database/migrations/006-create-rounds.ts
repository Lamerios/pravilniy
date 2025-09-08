import { DataTypes, QueryInterface } from 'sequelize';

/**
 * Миграция для создания таблицы rounds
 * Создает таблицу для хранения информации о раундах игры
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('rounds', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: 'Уникальный идентификатор раунда',
    },
    gameId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Ссылка на игровую сессию',
    },
    roundNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Номер раунда в игре',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Название раунда',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Описание раунда',
    },
    type: {
      type: DataTypes.ENUM('STANDARD', 'BLITZ', 'BONUS', 'FINAL', 'TIEBREAKER'),
      allowNull: false,
      defaultValue: 'STANDARD',
      comment: 'Тип раунда',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACTIVE', 'PAUSED', 'FINISHED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
      comment: 'Статус раунда',
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Время на раунд в секундах',
    },
    questionTimeLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Время на вопрос в секундах',
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Общее количество вопросов в раунде',
    },
    currentQuestion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Номер текущего вопроса',
    },
    maxPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: 'Максимальное количество очков за раунд',
    },
    multiplier: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 1.0,
      comment: 'Множитель очков для раунда',
    },
    questions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Список вопросов раунда в формате JSON',
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Настройки раунда в формате JSON',
    },
    statistics: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        totalAnswers: 0,
        correctAnswers: 0,
        averageTime: 0,
        participatingTeams: 0,
      },
      comment: 'Статистика раунда в формате JSON',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Дата и время начала раунда',
    },
    finishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Дата и время окончания раунда',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Дата и время создания записи',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Дата и время последнего обновления записи',
    },
  });

  // Создание индексов
  await queryInterface.addIndex('rounds', ['gameId']);
  await queryInterface.addIndex('rounds', ['roundNumber']);
  await queryInterface.addIndex('rounds', ['type']);
  await queryInterface.addIndex('rounds', ['status']);
  await queryInterface.addIndex('rounds', ['startedAt']);
  await queryInterface.addIndex('rounds', ['finishedAt']);
  await queryInterface.addIndex('rounds', ['createdAt']);

  // Композитный индекс для уникальности номера раунда в рамках игры
  await queryInterface.addIndex('rounds', ['gameId', 'roundNumber'], {
    unique: true,
    name: 'rounds_game_number_unique',
  });

  console.log('✅ Migration: rounds table created');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('rounds');
  console.log('✅ Migration rollback: rounds table dropped');
}
