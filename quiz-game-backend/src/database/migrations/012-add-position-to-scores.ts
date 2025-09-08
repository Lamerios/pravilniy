import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('scores', 'position', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Позиция команды в рейтинге на момент записи баллов',
  });

  // Добавляем индекс для быстрого поиска по позициям
  await queryInterface.addIndex('scores', ['gameId', 'position'], {
    name: 'idx_scores_game_position',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('scores', 'idx_scores_game_position');
  await queryInterface.removeColumn('scores', 'position');
}
