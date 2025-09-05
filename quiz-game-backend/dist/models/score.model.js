"use strict";
var Score_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Score = exports.ScoreType = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const game_model_1 = require("./game.model");
const round_model_1 = require("./round.model");
const team_model_1 = require("./team.model");
const user_model_1 = require("./user.model");
var ScoreType;
(function (ScoreType) {
    ScoreType["ROUND_SCORE"] = "ROUND_SCORE";
    ScoreType["BONUS"] = "BONUS";
    ScoreType["PENALTY"] = "PENALTY";
    ScoreType["PARTICIPATION"] = "PARTICIPATION";
    ScoreType["MANUAL"] = "MANUAL";
    ScoreType["ADJUSTMENT"] = "ADJUSTMENT";
})(ScoreType || (exports.ScoreType = ScoreType = {}));
let Score = Score_1 = class Score extends sequelize_typescript_1.Model {
    gameId;
    teamId;
    roundId;
    scoreType;
    points;
    basePoints;
    bonusPoints;
    multiplier;
    reason;
    description;
    questionNumber;
    roundNumber;
    isValid;
    isManual;
    metadata;
    awardedBy;
    awardedAt;
    game;
    team;
    round;
    awarder;
    isPositive() {
        return this.points > 0;
    }
    isNegative() {
        return this.points < 0;
    }
    isBonus() {
        return [
            ScoreType.BONUS,
            ScoreType.PARTICIPATION
        ].includes(this.scoreType);
    }
    isPenalty() {
        return this.scoreType === ScoreType.PENALTY;
    }
    getEffectivePoints() {
        if (!this.isValid)
            return 0;
        return Math.round(this.points * this.multiplier);
    }
    getScoreBreakdown() {
        return {
            base: this.basePoints,
            bonus: this.bonusPoints,
            multiplier: this.multiplier,
            total: this.getEffectivePoints()
        };
    }
    static async getTeamTotalScore(teamId, gameId) {
        const whereClause = {
            teamId,
            isValid: true
        };
        if (gameId) {
            whereClause.gameId = gameId;
        }
        const scores = await Score_1.findAll({
            where: whereClause,
            attributes: ['points', 'multiplier']
        });
        return scores.reduce((total, score) => {
            return total + Math.round(score.points * score.multiplier);
        }, 0);
    }
    static async getTeamScoreByRound(teamId, gameId) {
        const scores = await Score_1.findAll({
            where: {
                teamId,
                gameId,
                isValid: true,
                roundId: { [require('sequelize').Op.ne]: null }
            },
            attributes: ['roundId', 'points', 'multiplier']
        });
        const scoresByRound = new Map();
        scores.forEach(score => {
            if (score.roundId) {
                const currentScore = scoresByRound.get(score.roundId) || 0;
                scoresByRound.set(score.roundId, currentScore + Math.round(score.points * score.multiplier));
            }
        });
        return scoresByRound;
    }
};
exports.Score = Score;
tslib_1.__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Score.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => game_model_1.Game),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Score.prototype, "gameId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => team_model_1.Team),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Score.prototype, "teamId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => round_model_1.Round),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Score.prototype, "roundId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(ScoreType))),
    tslib_1.__metadata("design:type", String)
], Score.prototype, "scoreType", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "points", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "basePoints", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "bonusPoints", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(1.0),
    (0, sequelize_typescript_1.Validate)({
        min: 0.0,
        max: 100.0
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(5, 2)),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "multiplier", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Validate)({
        len: [0, 255]
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(255)),
    tslib_1.__metadata("design:type", String)
], Score.prototype, "reason", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    tslib_1.__metadata("design:type", String)
], Score.prototype, "description", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "questionNumber", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Score.prototype, "roundNumber", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    tslib_1.__metadata("design:type", Boolean)
], Score.prototype, "isValid", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    tslib_1.__metadata("design:type", Boolean)
], Score.prototype, "isManual", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Default)({}),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    tslib_1.__metadata("design:type", Object)
], Score.prototype, "metadata", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Score.prototype, "awardedBy", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.NOW),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Score.prototype, "awardedAt", void 0);
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
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User),
    tslib_1.__metadata("design:type", user_model_1.User)
], Score.prototype, "awarder", void 0);
exports.Score = Score = Score_1 = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'scores',
        timestamps: true,
        paranoid: false,
    })
], Score);
//# sourceMappingURL=score.model.js.map