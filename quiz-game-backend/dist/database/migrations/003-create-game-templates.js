"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.createTable('game_templates', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            comment: 'Уникальный идентификатор шаблона игры'
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
            comment: 'Ссылка на организацию-владельца шаблона'
        },
        createdBy: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
            comment: 'Ссылка на пользователя, создавшего шаблон'
        },
        name: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: 'Название шаблона игры'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Описание шаблона игры'
        },
        category: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: 'Категория шаблона игры'
        },
        difficulty: {
            type: sequelize_1.DataTypes.ENUM('EASY', 'MEDIUM', 'HARD', 'EXPERT'),
            allowNull: false,
            defaultValue: 'MEDIUM',
            comment: 'Уровень сложности игры'
        },
        type: {
            type: sequelize_1.DataTypes.ENUM('QUIZ', 'SURVEY', 'TRIVIA', 'COMPETITION'),
            allowNull: false,
            defaultValue: 'QUIZ',
            comment: 'Тип игры'
        },
        maxTeams: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 10,
            validate: {
                min: 1,
                max: 100
            },
            comment: 'Максимальное количество команд'
        },
        maxPlayersPerTeam: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5,
            validate: {
                min: 1,
                max: 20
            },
            comment: 'Максимальное количество игроков в команде'
        },
        timeLimit: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: 'Общее время игры в минутах'
        },
        roundTimeLimit: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: 'Время на раунд в минутах'
        },
        questionTimeLimit: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: 'Время на вопрос в секундах'
        },
        scoringSystem: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: {
                basePoints: 10,
                timeBonus: true,
                penaltyForWrong: false,
                streakBonus: false
            },
            comment: 'Система подсчета очков в формате JSON'
        },
        rules: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
            comment: 'Правила игры в формате JSON'
        },
        settings: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
            comment: 'Дополнительные настройки шаблона в формате JSON'
        },
        tags: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
            allowNull: true,
            defaultValue: [],
            comment: 'Теги для категоризации шаблона'
        },
        thumbnail: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: 'URL изображения-превью шаблона'
        },
        isPublic: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Флаг публичности шаблона'
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Флаг активности шаблона'
        },
        version: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: 'Версия шаблона'
        },
        publishedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Дата и время публикации шаблона'
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
    await queryInterface.addIndex('game_templates', ['organizationId']);
    await queryInterface.addIndex('game_templates', ['createdBy']);
    await queryInterface.addIndex('game_templates', ['name']);
    await queryInterface.addIndex('game_templates', ['category']);
    await queryInterface.addIndex('game_templates', ['difficulty']);
    await queryInterface.addIndex('game_templates', ['type']);
    await queryInterface.addIndex('game_templates', ['isPublic']);
    await queryInterface.addIndex('game_templates', ['isActive']);
    await queryInterface.addIndex('game_templates', ['createdAt']);
    await queryInterface.addIndex('game_templates', ['publishedAt']);
    try {
        await queryInterface.sequelize.query('CREATE INDEX game_templates_tags_idx ON game_templates USING GIN (tags)');
    }
    catch (error) {
        console.warn('⚠️  GIN index for tags not created (may not be supported)');
    }
    console.log('✅ Migration: game_templates table created');
}
async function down(queryInterface) {
    await queryInterface.dropTable('game_templates');
    console.log('✅ Migration rollback: game_templates table dropped');
}
//# sourceMappingURL=003-create-game-templates.js.map