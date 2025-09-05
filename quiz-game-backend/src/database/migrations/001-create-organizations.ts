import { DataTypes, QueryInterface } from 'sequelize';

/**
 * Миграция для создания таблицы organizations
 * Создает таблицу для хранения информации об организациях
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('organizations', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      comment: 'Уникальный идентификатор организации'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Название организации'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Описание организации'
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true
      },
      comment: 'Веб-сайт организации'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      },
      comment: 'Контактный email организации'
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Контактный телефон организации'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Адрес организации'
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Настройки организации в формате JSON'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Флаг активности организации'
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

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('organizations');
  console.log('✅ Migration rollback: organizations table dropped');
}
