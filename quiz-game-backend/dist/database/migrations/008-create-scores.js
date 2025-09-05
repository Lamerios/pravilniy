"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.createTable('scores', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            comment: 'Уникальный идентификатор записи очков'
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
        teamId: {
            type: sequelize_1.DataTypes.UUID,
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
            type: sequelize_1.DataTypes.UUID,
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
            type: sequelize_1.DataTypes.UUID,
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
            type: sequelize_1.DataTypes.ENUM('ANSWER', 'BONUS', 'PENALTY', 'TIME_BONUS', 'STREAK_BONUS', 'PARTICIPATION', 'MANUAL', 'ADJUSTMENT'),
            allowNull: false,
            comment: 'Тип начисления очков'
        },
        points: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: 'Количество очков (может быть отрицательным для штрафов)'
        },
        basePoints: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Базовые очки без бонусов'
        },
        bonusPoints: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Бонусные очки'
        },
        multiplier: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 1.0,
            comment: 'Множитель очков'
        },
        reason: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: 'Причина начисления/снятия очков'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Подробное описание начисления очков'
        },
        questionNumber: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: 'Номер вопроса (если применимо)'
        },
        roundNumber: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: 'Номер раунда (для быстрого доступа)'
        },
        isValid: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Флаг валидности записи очков'
        },
        isManual: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Флаг ручного начисления очков'
        },
        metadata: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
            comment: 'Дополнительные данные начисления в формате JSON'
        },
        awardedBy: {
            type: sequelize_1.DataTypes.UUID,
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
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: 'Дата и время начисления очков'
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
    await queryInterface.addIndex('scores', ['gameId', 'teamId']);
    await queryInterface.addIndex('scores', ['teamId', 'roundId']);
    await queryInterface.addIndex('scores', ['gameId', 'roundId']);
    await queryInterface.addIndex('scores', ['teamId', 'scoreType']);
    await queryInterface.addIndex('scores', ['roundNumber', 'questionNumber']);
    await queryInterface.addIndex('scores', ['teamId', 'isValid', 'points']);
    console.log('✅ Migration: scores table created');
}
async function down(queryInterface) {
    await queryInterface.dropTable('scores');
    console.log('✅ Migration rollback: scores table dropped');
}
//# sourceMappingURL=008-create-scores.js.map