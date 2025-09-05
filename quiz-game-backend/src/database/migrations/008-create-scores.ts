import { DataTypes, QueryInterface } from 'sequelize';

/**
 * Миграция для создания таблицы scores
 * Создает таблицу для хранения детализированной информации об очках команд
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('scores', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: 'Уникальный идентификатор записи очков'
    },
    gameId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Ссылка на игровую сессию'
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Ссылка на команду'
    },
    roundId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'rounds',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Ссылка на раунд (null для общего счета)'
    },
    answerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'answers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Ссылка на ответ (если очки за конкретный ответ)'
    },
    scoreType: {
      type: DataTypes.ENUM(
        'ANSWER', 'BONUS', 'PENALTY', 'TIME_BONUS', 'STREAK_BONUS',
        'PARTICIPATION', 'MANUAL', 'ADJUSTMENT'
      ),
      allowNull: false,
      comment: 'Тип начисления очков'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Количество очков (может быть отрицательным для штрафов)'
    },
    basePoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Базовые очки без бонусов'
    },
    bonusPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Бонусные очки'
    },
    multiplier: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 1.0,
      comment: 'Множитель очков'
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Причина начисления/снятия очков'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Подробное описание начисления очков'
    },
    questionNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Номер вопроса (если применимо)'
    },
    roundNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Номер раунда (для быстрого доступа)'
    },
    isValid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Флаг валидности записи очков'
    },
    isManual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Флаг ручного начисления очков'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Дополнительные данные начисления в формате JSON'
    },
    awardedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Пользователь, начисливший очки (для ручных начислений)'
    },
    awardedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Дата и время начисления очков'
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
  await queryInterface.addIndex('scores', ['gameId']);
  await queryInterface.addIndex('scores', ['teamId']);
  await queryInterface.addIndex('scores', ['roundId']);
  await queryInterface.addIndex('scores', ['answerId']);
  await queryInterface.addIndex('scores', ['scoreType']);
  await queryInterface.addIndex('scores', ['points']);
  await queryInterface.addIndex('scores', ['isValid']);
  await queryInterface.addIndex('scores', ['isManual']);
  await queryInterface.addIndex('scores', ['awardedBy']);
  await queryInterface.addIndex('scores', ['awardedAt']);
  await queryInterface.addIndex('scores', ['createdAt']);

  // Композитные индексы для производительности
  await queryInterface.addIndex('scores', ['gameId', 'teamId']);
  await queryInterface.addIndex('scores', ['teamId', 'roundId']);
  await queryInterface.addIndex('scores', ['gameId', 'roundId']);
  await queryInterface.addIndex('scores', ['teamId', 'scoreType']);
  await queryInterface.addIndex('scores', ['roundNumber', 'questionNumber']);

  // Индекс для быстрого подсчета очков команды
  await queryInterface.addIndex('scores', ['teamId', 'isValid', 'points']);

  console.log('✅ Migration: scores table created');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('scores');
  console.log('✅ Migration rollback: scores table dropped');
}
