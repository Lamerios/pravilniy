"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const sequelize_1 = require("sequelize");
const up = async (queryInterface) => {
    await queryInterface.changeColumn('scores', 'bet', {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Ставка команды (множитель или бонус)'
    });
    await queryInterface.changeColumn('scores', 'totalPoints', {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Общее количество баллов с учетом ставки'
    });
    await queryInterface.addColumn('scores', 'betType', {
        type: sequelize_1.DataTypes.ENUM('MULTIPLIER', 'BONUS', 'FIXED'),
        allowNull: true,
        defaultValue: 'MULTIPLIER',
        comment: 'Тип ставки: MULTIPLIER (умножение), BONUS (добавление), FIXED (фиксированные баллы)'
    });
    await queryInterface.addColumn('scores', 'minBet', {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Минимальная ставка для данного раунда'
    });
    await queryInterface.addColumn('scores', 'maxBet', {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Максимальная ставка для данного раунда'
    });
};
exports.up = up;
const down = async (queryInterface) => {
    await queryInterface.removeColumn('scores', 'maxBet');
    await queryInterface.removeColumn('scores', 'minBet');
    await queryInterface.removeColumn('scores', 'betType');
    await queryInterface.changeColumn('scores', 'totalPoints', {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Общее количество баллов с учетом ставки'
    });
    await queryInterface.changeColumn('scores', 'bet', {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: 'Ставка команды (если есть)'
    });
};
exports.down = down;
//# sourceMappingURL=009-update-scores-betting.js.map