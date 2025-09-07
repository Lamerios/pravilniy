import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Изменяем тип поля bet с INTEGER на DECIMAL
  await queryInterface.changeColumn('scores', 'bet', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Ставка команды (множитель или бонус)'
  });

  // Изменяем тип поля totalPoints с INTEGER на DECIMAL
  await queryInterface.changeColumn('scores', 'totalPoints', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Общее количество баллов с учетом ставки'
  });

  // Добавляем новые поля для системы ставок
  await queryInterface.addColumn('scores', 'betType', {
    type: DataTypes.ENUM('MULTIPLIER', 'BONUS', 'FIXED'),
    allowNull: true,
    defaultValue: 'MULTIPLIER',
    comment: 'Тип ставки: MULTIPLIER (умножение), BONUS (добавление), FIXED (фиксированные баллы)'
  });

  await queryInterface.addColumn('scores', 'minBet', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Минимальная ставка для данного раунда'
  });

  await queryInterface.addColumn('scores', 'maxBet', {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Максимальная ставка для данного раунда'
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  // Удаляем добавленные поля
  await queryInterface.removeColumn('scores', 'maxBet');
  await queryInterface.removeColumn('scores', 'minBet');
  await queryInterface.removeColumn('scores', 'betType');

  // Возвращаем исходные типы полей
  await queryInterface.changeColumn('scores', 'totalPoints', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Общее количество баллов с учетом ставки'
  });

  await queryInterface.changeColumn('scores', 'bet', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Ставка команды (если есть)'
  });
};

