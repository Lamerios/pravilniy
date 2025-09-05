"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.createTable('teams', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            comment: 'Уникальный идентификатор команды'
        },
        organizationId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            comment: 'Ссылка на организацию'
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
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: 'Название команды'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Описание команды'
        },
        captain: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: 'Имя капитана команды'
        },
        members: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: [],
            comment: 'Список участников команды в формате JSON'
        },
        contactInfo: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
            comment: 'Контактная информация команды в формате JSON'
        },
        totalScore: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Общий счет команды'
        },
        currentRound: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Текущий раунд команды'
        },
        position: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: 'Позиция команды в рейтинге'
        },
        bonusPoints: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Бонусные очки команды'
        },
        penaltyPoints: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Штрафные очки команды'
        },
        statistics: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: {
                correctAnswers: 0,
                wrongAnswers: 0,
                totalAnswers: 0,
                averageTime: 0,
                streak: 0,
                maxStreak: 0
            },
            comment: 'Статистика команды в формате JSON'
        },
        joinedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Дата и время присоединения к игре'
        },
        lastActivity: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Дата и время последней активности'
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Флаг активности команды'
        },
        isReady: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Флаг готовности команды к игре'
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
    await queryInterface.addIndex('teams', ['organizationId']);
    await queryInterface.addIndex('teams', ['gameId']);
    await queryInterface.addIndex('teams', ['name']);
    await queryInterface.addIndex('teams', ['totalScore']);
    await queryInterface.addIndex('teams', ['position']);
    await queryInterface.addIndex('teams', ['isActive']);
    await queryInterface.addIndex('teams', ['isReady']);
    await queryInterface.addIndex('teams', ['joinedAt']);
    await queryInterface.addIndex('teams', ['lastActivity']);
    await queryInterface.addIndex('teams', ['createdAt']);
    await queryInterface.addIndex('teams', ['gameId', 'name'], {
        unique: true,
        name: 'teams_game_name_unique'
    });
    console.log('✅ Migration: teams table created');
}
async function down(queryInterface) {
    await queryInterface.dropTable('teams');
    console.log('✅ Migration rollback: teams table dropped');
}
//# sourceMappingURL=005-create-teams.js.map