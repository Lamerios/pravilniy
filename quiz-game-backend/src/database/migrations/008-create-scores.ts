import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Создаем таблицу scores
  await queryInterface.createTable('scores', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    roundId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rounds',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Количество баллов за раунд',
    },
    bet: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Ставка команды (если есть)',
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Общее количество баллов с учетом ставки',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Дополнительные заметки',
    },
    enteredBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Пользователь, который ввел баллы',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Создаем уникальный индекс для предотвращения дублирования баллов
  await queryInterface.addIndex('scores', {
    fields: ['gameId', 'teamId', 'roundId'],
    unique: true,
    name: 'unique_game_team_round',
  });

  // Создаем индексы для оптимизации запросов
  await queryInterface.addIndex('scores', {
    fields: ['gameId'],
    name: 'idx_scores_game_id',
  });

  await queryInterface.addIndex('scores', {
    fields: ['teamId'],
    name: 'idx_scores_team_id',
  });

  await queryInterface.addIndex('scores', {
    fields: ['roundId'],
    name: 'idx_scores_round_id',
  });

  await queryInterface.addIndex('scores', {
    fields: ['createdAt'],
    name: 'idx_scores_created_at',
  });

  // Создаем таблицу score_corrections
  await queryInterface.createTable('score_corrections', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    scoreId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'scores',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    oldPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Старые баллы',
    },
    newPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Новые баллы',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Причина исправления',
    },
    correctedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Пользователь, который исправил баллы',
    },
    correctedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Создаем индексы для таблицы исправлений
  await queryInterface.addIndex('score_corrections', {
    fields: ['scoreId'],
    name: 'idx_score_corrections_score_id',
  });

  await queryInterface.addIndex('score_corrections', {
    fields: ['correctedBy'],
    name: 'idx_score_corrections_corrected_by',
  });

  await queryInterface.addIndex('score_corrections', {
    fields: ['correctedAt'],
    name: 'idx_score_corrections_corrected_at',
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  // Удаляем таблицы в обратном порядке
  await queryInterface.dropTable('score_corrections');
  await queryInterface.dropTable('scores');
};
