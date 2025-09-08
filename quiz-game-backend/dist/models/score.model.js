"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Score = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const game_model_1 = require("./game.model");
const round_model_1 = require("./round.model");
const team_model_1 = require("./team.model");
const user_model_1 = require("./user.model");
let Score = class Score extends sequelize_typescript_1.Model {
    gameId;
    teamId;
    roundId;
    points;
    bet;
    betType;
    minBet;
    maxBet;
    totalPoints;
    position;
    notes;
    enteredBy;
    game;
    team;
    round;
    enteredByUser;
    calculateTotalPoints() {
        if (this.bet && this.bet > 0) {
            return this.points > 0 ? this.points + this.bet : 0;
        }
        return this.points;
    }
    updateTotalPoints() {
        this.totalPoints = this.calculateTotalPoints();
    }
};
exports.Score = Score;
tslib_1.__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => game_model_1.Game),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "gameId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => team_model_1.Team),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "teamId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => round_model_1.Round),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "roundId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        comment: 'Количество баллов за раунд'
    }),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "points", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Ставка команды (множитель или бонус)'
    }),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "bet", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('MULTIPLIER', 'BONUS', 'FIXED'),
        allowNull: true,
        defaultValue: 'MULTIPLIER',
        comment: 'Тип ставки: MULTIPLIER (умножение), BONUS (добавление), FIXED (фиксированные баллы)'
    }),
    tslib_1.__metadata("design:type", String)
], Score.prototype, "betType", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Минимальная ставка для данного раунда'
    }),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "minBet", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Максимальная ставка для данного раунда'
    }),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "maxBet", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Общее количество баллов с учетом ставки'
    }),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "totalPoints", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        comment: 'Позиция команды в рейтинге на момент записи баллов'
    }),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "position", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
        comment: 'Дополнительные заметки'
    }),
    tslib_1.__metadata("design:type", String)
], Score.prototype, "notes", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        comment: 'Пользователь, который ввел баллы'
    }),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "enteredBy", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Score.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Score.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => game_model_1.Game),
    tslib_1.__metadata("design:type", game_model_1.Game)
], Score.prototype, "game", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => team_model_1.Team),
    tslib_1.__metadata("design:type", team_model_1.Team)
], Score.prototype, "team", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => round_model_1.Round),
    tslib_1.__metadata("design:type", round_model_1.Round)
], Score.prototype, "round", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User, 'enteredBy'),
    tslib_1.__metadata("design:type", user_model_1.User)
], Score.prototype, "enteredByUser", void 0);
exports.Score = Score = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'scores',
        timestamps: true,
        indexes: [
            {
                fields: ['gameId', 'teamId', 'roundId'],
                unique: true,
                name: 'unique_game_team_round'
            },
            {
                fields: ['gameId']
            },
            {
                fields: ['teamId']
            },
            {
                fields: ['roundId']
            },
            {
                fields: ['createdAt']
            }
        ]
    })
], Score);
//# sourceMappingURL=score.model.js.map