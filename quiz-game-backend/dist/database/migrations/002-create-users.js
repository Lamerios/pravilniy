"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.createTable('users', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            comment: 'Уникальный идентификатор пользователя'
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
            comment: 'Ссылка на организацию пользователя'
        },
        username: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 50],
                isAlphanumeric: true
            },
            comment: 'Уникальное имя пользователя'
        },
        email: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            },
            comment: 'Email пользователя (уникальный)'
        },
        passwordHash: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: 'Хэш пароля пользователя'
        },
        firstName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: 'Имя пользователя'
        },
        lastName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: 'Фамилия пользователя'
        },
        middleName: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: true,
            comment: 'Отчество пользователя'
        },
        role: {
            type: sequelize_1.DataTypes.ENUM('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'),
            allowNull: false,
            defaultValue: 'USER',
            comment: 'Роль пользователя в системе'
        },
        avatar: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
            comment: 'URL аватара пользователя'
        },
        phone: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: true,
            comment: 'Телефон пользователя'
        },
        dateOfBirth: {
            type: sequelize_1.DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Дата рождения пользователя'
        },
        bio: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            comment: 'Биография пользователя'
        },
        preferences: {
            type: sequelize_1.DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
            comment: 'Пользовательские настройки в формате JSON'
        },
        lastLoginAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Дата и время последнего входа в систему'
        },
        emailVerifiedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            comment: 'Дата и время подтверждения email'
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Флаг активности пользователя'
        },
        isEmailVerified: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Флаг подтверждения email'
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
    await queryInterface.addIndex('users', ['organizationId']);
    await queryInterface.addIndex('users', ['username'], { unique: true });
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['isActive']);
    await queryInterface.addIndex('users', ['createdAt']);
    await queryInterface.addIndex('users', ['lastLoginAt']);
    console.log('✅ Migration: users table created');
}
async function down(queryInterface) {
    await queryInterface.dropTable('users');
    console.log('✅ Migration rollback: users table dropped');
}
//# sourceMappingURL=002-create-users.js.map