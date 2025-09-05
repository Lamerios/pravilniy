import { DataTypes, QueryInterface } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('game_teams', {
      gameId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'games',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      teamId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      joinedAt: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Порядок присоединения команды к игре'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Активна ли команда в игре'
      },
      joinedAtDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Дата присоединения'
      },
      leftAtDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Дата выхода из игры'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Добавляем индексы для оптимизации запросов
    await queryInterface.addIndex('game_teams', ['gameId']);
    await queryInterface.addIndex('game_teams', ['teamId']);
    await queryInterface.addIndex('game_teams', ['isActive']);
    await queryInterface.addIndex('game_teams', ['joinedAt']);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('game_teams');
  }
};
