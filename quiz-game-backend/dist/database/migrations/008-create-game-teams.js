"use strict";
const sequelize_1 = require("sequelize");
module.exports = {
    up: async (queryInterface) => {
        await queryInterface.createTable('game_teams', {
            gameId: {
                type: sequelize_1.DataTypes.UUID,
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
                type: sequelize_1.DataTypes.UUID,
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
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                comment: 'Порядок присоединения команды к игре'
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                comment: 'Активна ли команда в игре'
            },
            joinedAtDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                comment: 'Дата присоединения'
            },
            leftAtDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                comment: 'Дата выхода из игры'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW
            }
        });
        await queryInterface.addIndex('game_teams', ['gameId']);
        await queryInterface.addIndex('game_teams', ['teamId']);
        await queryInterface.addIndex('game_teams', ['isActive']);
        await queryInterface.addIndex('game_teams', ['joinedAt']);
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable('game_teams');
    }
};
//# sourceMappingURL=008-create-game-teams.js.map