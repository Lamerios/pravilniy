"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Round = exports.RoundStatus = exports.RoundType = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const game_model_1 = require("./game.model");
const game_template_model_1 = require("./game-template.model");
var RoundType;
(function (RoundType) {
    RoundType["STANDARD"] = "STANDARD";
    RoundType["BLITZ"] = "BLITZ";
    RoundType["BONUS"] = "BONUS";
    RoundType["FINAL"] = "FINAL";
    RoundType["TIEBREAKER"] = "TIEBREAKER";
})(RoundType || (exports.RoundType = RoundType = {}));
var RoundStatus;
(function (RoundStatus) {
    RoundStatus["PENDING"] = "PENDING";
    RoundStatus["ACTIVE"] = "ACTIVE";
    RoundStatus["PAUSED"] = "PAUSED";
    RoundStatus["FINISHED"] = "FINISHED";
    RoundStatus["CANCELLED"] = "CANCELLED";
})(RoundStatus || (exports.RoundStatus = RoundStatus = {}));
let Round = class Round extends sequelize_typescript_1.Model {
    gameId;
    templateId;
    roundNumber;
    name;
    description;
    type;
    status;
    timeLimit;
    questionTimeLimit;
    totalQuestions;
    currentQuestion;
    maxPoints;
    multiplier;
    settings;
    statistics;
    startedAt;
    finishedAt;
    game;
    template;
    isActive() {
        return this.status === RoundStatus.ACTIVE;
    }
    isFinished() {
        return this.status === RoundStatus.FINISHED;
    }
    getDuration() {
        if (this.startedAt && this.finishedAt) {
            return this.finishedAt.getTime() - this.startedAt.getTime();
        }
        return null;
    }
    getProgressPercentage() {
        if (this.totalQuestions === 0)
            return 0;
        return Math.round((this.currentQuestion / this.totalQuestions) * 100);
    }
};
exports.Round = Round;
tslib_1.__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Round.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => game_model_1.Game),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Round.prototype, "gameId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => game_template_model_1.GameTemplate),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Round.prototype, "templateId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Round.prototype, "roundNumber", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Validate)({
        len: [1, 255]
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(255)),
    tslib_1.__metadata("design:type", String)
], Round.prototype, "name", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    tslib_1.__metadata("design:type", String)
], Round.prototype, "description", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(RoundType.STANDARD),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(RoundType))),
    tslib_1.__metadata("design:type", String)
], Round.prototype, "type", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(RoundStatus.PENDING),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(RoundStatus))),
    tslib_1.__metadata("design:type", String)
], Round.prototype, "status", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Round.prototype, "timeLimit", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Round.prototype, "questionTimeLimit", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(1),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Round.prototype, "totalQuestions", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Round.prototype, "currentQuestion", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(10),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Round.prototype, "maxPoints", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(1.0),
    (0, sequelize_typescript_1.Validate)({
        min: 0.1,
        max: 10.0
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(3, 2)),
    tslib_1.__metadata("design:type", Number)
], Round.prototype, "multiplier", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Default)({}),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    tslib_1.__metadata("design:type", Object)
], Round.prototype, "settings", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Default)({
        totalAnswers: 0,
        correctAnswers: 0,
        averageTime: 0,
        participatingTeams: 0
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    tslib_1.__metadata("design:type", Object)
], Round.prototype, "statistics", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Round.prototype, "startedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Round.prototype, "finishedAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Round.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Round.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => game_model_1.Game),
    tslib_1.__metadata("design:type", game_model_1.Game)
], Round.prototype, "game", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => game_template_model_1.GameTemplate),
    tslib_1.__metadata("design:type", game_template_model_1.GameTemplate)
], Round.prototype, "template", void 0);
exports.Round = Round = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'rounds',
        timestamps: true,
        paranoid: false,
    })
], Round);
//# sourceMappingURL=round.model.js.map