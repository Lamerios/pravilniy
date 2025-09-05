import { DataTypes, QueryInterface } from 'sequelize';

/**
 * Миграция для создания таблицы users
 * Создает таблицу для хранения информации о пользователях
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: 'Уникальный идентификатор пользователя'
    },
    organizationId: {
      type: DataTypes.UUID,
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
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        isAlphanumeric: true
      },
      comment: 'Уникальное имя пользователя'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
      comment: 'Email пользователя (уникальный)'
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Хэш пароля пользователя'
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Имя пользователя'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Фамилия пользователя'
    },
    middleName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Отчество пользователя'
    },
    role: {
      type: DataTypes.ENUM('SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'),
      allowNull: false,
      defaultValue: 'USER',
      comment: 'Роль пользователя в системе'
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL аватара пользователя'
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Телефон пользователя'
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Дата рождения пользователя'
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Биография пользователя'
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Пользовательские настройки в формате JSON'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Дата и время последнего входа в систему'
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Дата и время подтверждения email'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Флаг активности пользователя'
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Флаг подтверждения email'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Дата и время создания записи'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Дата и время последнего обновления записи'
    }
  });

  // Создание индексов
  await queryInterface.addIndex('users', ['organizationId']);
  await queryInterface.addIndex('users', ['username'], { unique: true });
  await queryInterface.addIndex('users', ['email'], { unique: true });
  await queryInterface.addIndex('users', ['role']);
  await queryInterface.addIndex('users', ['isActive']);
  await queryInterface.addIndex('users', ['createdAt']);
  await queryInterface.addIndex('users', ['lastLoginAt']);

  console.log('✅ Migration: users table created');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('users');
  console.log('✅ Migration rollback: users table dropped');
}
