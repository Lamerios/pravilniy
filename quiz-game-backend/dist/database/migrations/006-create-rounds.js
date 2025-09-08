"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.createTable('rounds', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            comment: 'Уникальный идентификатор раунда'
        },
        gameId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'games',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            comment: 'Ссылка на игровую сессию'
        },
        roundNumber: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: 'Номер раунда в игре'
        },
        name: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: 'Название раунда'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Описание раунда'
        },
        type: {
            type: sequelize_1.DataTypes.ENUM('STANDARD', 'BLITZ', 'BONUS', 'FINAL', 'TIEBREAKER'),
            allowNull: false,
            defaultValue: 'STANDARD',
            comment: 'Тип раунда'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('PENDING', 'ACTIVE', 'PAUSED', 'FINISHED', 'CANCELLED'),
            allowNull: false,
            defaultValue: 'PENDING',
            comment: 'Статус раунда'
        },
        timeLimit: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: 'Время на раунд в секундах'
        },
        questionTimeLimit: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: 'Время на вопрос в секундах'
        },
        totalQuestions: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: 'Общее количество вопросов в раунде'
        },
        currentQuestion: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Номер текущего вопроса'
        },
        maxPoints: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10,
            comment: 'Максимальное количество очков за раунд'
        },
        multiplier: {
            type: sequelize_1.DataTypes.DECIMAL(3, 2),
            allowNull: false,
            defaultValue: 1.0,
            comment: 'Множитель очков для раунда'
        },
        questions: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: [],
            comment: 'Список вопросов раунда в формате JSON'
        },
        settings: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
            comment: 'Настройки раунда в формате JSON'
        },
        statistics: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: {
                totalAnswers: 0,
                correctAnswers: 0,
                averageTime: 0,
                participatingTeams: 0
            },
            comment: 'Статистика раунда в формате JSON'
        },
        startedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Дата и время начала раунда'
        },
        finishedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Дата и время окончания раунда'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: 'Дата и время создания записи'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: 'Дата и время последнего обновления записи'
        }
    });
    await queryInterface.addIndex('rounds', ['gameId']);
    await queryInterface.addIndex('rounds', ['roundNumber']);
    await queryInterface.addIndex('rounds', ['type']);
    await queryInterface.addIndex('rounds', ['status']);
    await queryInterface.addIndex('rounds', ['startedAt']);
    await queryInterface.addIndex('rounds', ['finishedAt']);
    await queryInterface.addIndex('rounds', ['createdAt']);
    await queryInterface.addIndex('rounds', ['gameId', 'roundNumber'], {
        unique: true,
        name: 'rounds_game_number_unique'
    });
    console.log('✅ Migration: rounds table created');
}
async function down(queryInterface) {
    await queryInterface.dropTable('rounds');
    console.log('✅ Migration rollback: rounds table dropped');
}
//# sourceMappingURL=006-create-rounds.js.map