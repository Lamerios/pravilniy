"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.addColumn('scores', 'position', {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: 'Позиция команды в рейтинге на момент записи баллов'
    });
    await queryInterface.addIndex('scores', ['gameId', 'position'], {
        name: 'idx_scores_game_position'
    });
}
async function down(queryInterface) {
    await queryInterface.removeIndex('scores', 'idx_scores_game_position');
    await queryInterface.removeColumn('scores', 'position');
}
//# sourceMappingURL=012-add-position-to-scores.js.map