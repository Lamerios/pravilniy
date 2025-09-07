"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const sequelize_1 = require("sequelize");
const up = async (queryInterface) => {
    await queryInterface.createTable('scores', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        gameId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'games',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        teamId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'teams',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        roundId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'rounds',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        points: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: 'Количество баллов за раунд'
        },
        bet: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: 'Ставка команды (если есть)'
        },
        totalPoints: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Общее количество баллов с учетом ставки'
        },
        notes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Дополнительные заметки'
        },
        enteredBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            comment: 'Пользователь, который ввел баллы'
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
    await queryInterface.addIndex('scores', {
        fields: ['gameId', 'teamId', 'roundId'],
        unique: true,
        name: 'unique_game_team_round'
    });
    await queryInterface.addIndex('scores', {
        fields: ['gameId'],
        name: 'idx_scores_game_id'
    });
    await queryInterface.addIndex('scores', {
        fields: ['teamId'],
        name: 'idx_scores_team_id'
    });
    await queryInterface.addIndex('scores', {
        fields: ['roundId'],
        name: 'idx_scores_round_id'
    });
    await queryInterface.addIndex('scores', {
        fields: ['createdAt'],
        name: 'idx_scores_created_at'
    });
    await queryInterface.createTable('score_corrections', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        scoreId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'scores',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        oldPoints: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: 'Старые баллы'
        },
        newPoints: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: 'Новые баллы'
        },
        reason: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: 'Причина исправления'
        },
        correctedBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            comment: 'Пользователь, который исправил баллы'
        },
        correctedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    });
    await queryInterface.addIndex('score_corrections', {
        fields: ['scoreId'],
        name: 'idx_score_corrections_score_id'
    });
    await queryInterface.addIndex('score_corrections', {
        fields: ['correctedBy'],
        name: 'idx_score_corrections_corrected_by'
    });
    await queryInterface.addIndex('score_corrections', {
        fields: ['correctedAt'],
        name: 'idx_score_corrections_corrected_at'
    });
};
exports.up = up;
const down = async (queryInterface) => {
    await queryInterface.dropTable('score_corrections');
    await queryInterface.dropTable('scores');
};
exports.down = down;
//# sourceMappingURL=008-create-scores.js.map