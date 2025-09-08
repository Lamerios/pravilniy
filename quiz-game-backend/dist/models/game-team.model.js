"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameTeam = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const game_model_1 = require("./game.model");
const team_model_1 = require("./team.model");
let GameTeam = class GameTeam extends sequelize_typescript_1.Model {
    gameId;
    teamId;
    joinedAt;
    isActive = true;
    joinedAtDate;
    leftAtDate;
    game;
    team;
};
exports.GameTeam = GameTeam;
tslib_1.__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => game_model_1.Game),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], GameTeam.prototype, "gameId", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => team_model_1.Team),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], GameTeam.prototype, "teamId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], GameTeam.prototype, "joinedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    tslib_1.__metadata("design:type", Boolean)
], GameTeam.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], GameTeam.prototype, "joinedAtDate", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], GameTeam.prototype, "leftAtDate", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], GameTeam.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], GameTeam.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => game_model_1.Game),
    tslib_1.__metadata("design:type", game_model_1.Game)
], GameTeam.prototype, "game", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => team_model_1.Team),
    tslib_1.__metadata("design:type", team_model_1.Team)
], GameTeam.prototype, "team", void 0);
exports.GameTeam = GameTeam = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'game_teams',
        timestamps: true,
        paranoid: false,
    })
], GameTeam);
//# sourceMappingURL=game-team.model.js.map