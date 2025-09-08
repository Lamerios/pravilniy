"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.createTable('organizations', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            comment: 'Уникальный идентификатор организации'
        },
        name: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: 'Название организации'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Описание организации'
        },
        website: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            validate: {
                isUrl: true
            },
            comment: 'Веб-сайт организации'
        },
        email: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            validate: {
                isEmail: true
            },
            comment: 'Контактный email организации'
        },
        phone: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: 'Контактный телефон организации'
        },
        address: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Адрес организации'
        },
        settings: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
            comment: 'Настройки организации в формате JSON'
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Флаг активности организации'
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
    await queryInterface.addIndex('organizations', ['name'], {
        name: 'organizations_name_idx'
    });
    await queryInterface.addIndex('organizations', ['isActive'], {
        name: 'organizations_is_active_idx'
    });
    await queryInterface.addIndex('organizations', ['createdAt'], {
        name: 'organizations_created_at_idx'
    });
    console.log('✅ Migration: organizations table created');
}
async function down(queryInterface) {
    await queryInterface.dropTable('organizations');
    console.log('✅ Migration rollback: organizations table dropped');
}
//# sourceMappingURL=001-create-organizations.js.map