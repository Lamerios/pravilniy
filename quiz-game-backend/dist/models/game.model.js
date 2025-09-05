"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = exports.GameStatus = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const game_team_model_1 = require("./game-team.model");
const game_template_model_1 = require("./game-template.model");
const organization_model_1 = require("./organization.model");
const round_model_1 = require("./round.model");
const team_model_1 = require("./team.model");
const user_model_1 = require("./user.model");
var GameStatus;
(function (GameStatus) {
    GameStatus["DRAFT"] = "DRAFT";
    GameStatus["WAITING"] = "WAITING";
    GameStatus["ACTIVE"] = "ACTIVE";
    GameStatus["PAUSED"] = "PAUSED";
    GameStatus["FINISHED"] = "FINISHED";
    GameStatus["CANCELLED"] = "CANCELLED";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
let Game = class Game extends sequelize_typescript_1.Model {
    organizationId;
    templateId;
    createdBy;
    name;
    description;
    gameCode;
    status;
    maxTeams;
    maxPlayersPerTeam;
    currentRound;
    totalRounds;
    timeLimit;
    roundTimeLimit;
    questionTimeLimit;
    settings;
    gameData;
    scoringSystem;
    startedAt;
    finishedAt;
    scheduledAt;
    isPublic;
    allowLateJoin;
    autoStart;
    organization;
    template;
    creator;
    teams;
    rounds;
    isActive() {
        return this.status === GameStatus.ACTIVE;
    }
    isFinished() {
        return this.status === GameStatus.FINISHED;
    }
    canJoin() {
        return this.status === GameStatus.WAITING ||
            (this.status === GameStatus.ACTIVE && this.allowLateJoin);
    }
    getDuration() {
        if (this.startedAt && this.finishedAt) {
            return this.finishedAt.getTime() - this.startedAt.getTime();
        }
        return null;
    }
};
exports.Game = Game;
tslib_1.__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Game.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => organization_model_1.Organization),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Game.prototype, "organizationId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => game_template_model_1.GameTemplate),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Game.prototype, "templateId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Game.prototype, "createdBy", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Validate)({
        len: [1, 255]
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(255)),
    tslib_1.__metadata("design:type", String)
], Game.prototype, "name", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    tslib_1.__metadata("design:type", String)
], Game.prototype, "description", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Validate)({
        len: [4, 20]
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(20)),
    tslib_1.__metadata("design:type", String)
], Game.prototype, "gameCode", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(GameStatus.DRAFT),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(GameStatus))),
    tslib_1.__metadata("design:type", String)
], Game.prototype, "status", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(10),
    (0, sequelize_typescript_1.Validate)({
        min: 1,
        max: 100
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Game.prototype, "maxTeams", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(5),
    (0, sequelize_typescript_1.Validate)({
        min: 1,
        max: 20
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Game.prototype, "maxPlayersPerTeam", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Game.prototype, "currentRound", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(1),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Game.prototype, "totalRounds", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Game.prototype, "timeLimit", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Game.prototype, "roundTimeLimit", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Game.prototype, "questionTimeLimit", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Default)({}),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    tslib_1.__metadata("design:type", Object)
], Game.prototype, "settings", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Default)({}),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    tslib_1.__metadata("design:type", Object)
], Game.prototype, "gameData", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Default)({
        basePoints: 10,
        timeBonus: true,
        penaltyForWrong: false,
        streakBonus: false
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    tslib_1.__metadata("design:type", Object)
], Game.prototype, "scoringSystem", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Game.prototype, "startedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Game.prototype, "finishedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Game.prototype, "scheduledAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    tslib_1.__metadata("design:type", Boolean)
], Game.prototype, "isPublic", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    tslib_1.__metadata("design:type", Boolean)
], Game.prototype, "allowLateJoin", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    tslib_1.__metadata("design:type", Boolean)
], Game.prototype, "autoStart", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Game.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Game.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => organization_model_1.Organization),
    tslib_1.__metadata("design:type", organization_model_1.Organization)
], Game.prototype, "organization", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => game_template_model_1.GameTemplate),
    tslib_1.__metadata("design:type", game_template_model_1.GameTemplate)
], Game.prototype, "template", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User),
    tslib_1.__metadata("design:type", user_model_1.User)
], Game.prototype, "creator", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => team_model_1.Team, () => game_team_model_1.GameTeam),
    tslib_1.__metadata("design:type", Array)
], Game.prototype, "teams", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => round_model_1.Round),
    tslib_1.__metadata("design:type", Array)
], Game.prototype, "rounds", void 0);
exports.Game = Game = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'games',
        timestamps: true,
        paranoid: false,
    })
], Game);
//# sourceMappingURL=game.model.js.map