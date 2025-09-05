"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Team = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const game_team_model_1 = require("./game-team.model");
const game_model_1 = require("./game.model");
const organization_model_1 = require("./organization.model");
const score_model_1 = require("./score.model");
let Team = class Team extends sequelize_typescript_1.Model {
    organizationId;
    gameId;
    name;
    description;
    captain;
    tableNumber;
    logoUrl;
    members;
    contactInfo;
    totalScore;
    currentRound;
    position;
    bonusPoints;
    penaltyPoints;
    statistics;
    joinedAt;
    lastActivity;
    isActive;
    isReady;
    organization;
    games;
    scores;
    getFinalScore() {
        return this.totalScore + this.bonusPoints - this.penaltyPoints;
    }
    getAverageScore() {
        if (!this.statistics || this.statistics.roundsPlayed === 0)
            return 0;
        return Math.round(this.statistics.totalScore / this.statistics.roundsPlayed);
    }
    getMemberCount() {
        return this.members ? this.members.length : 0;
    }
    addMember(member) {
        if (!this.members) {
            this.members = [];
        }
        this.members.push({
            ...member,
            joinedAt: new Date()
        });
    }
    removeMember(memberName) {
        if (!this.members)
            return false;
        const initialLength = this.members.length;
        this.members = this.members.filter(member => member.name !== memberName);
        return this.members.length < initialLength;
    }
    updateStatistics(roundScore) {
        if (!this.statistics) {
            this.statistics = {
                roundsPlayed: 0,
                totalScore: 0,
                averageScore: 0,
                bestRound: 0,
                worstRound: 0
            };
        }
        this.statistics.roundsPlayed++;
        this.statistics.totalScore += roundScore;
        this.statistics.averageScore = Math.round(this.statistics.totalScore / this.statistics.roundsPlayed);
        if (roundScore > this.statistics.bestRound) {
            this.statistics.bestRound = roundScore;
        }
        if (this.statistics.worstRound === 0 || roundScore < this.statistics.worstRound) {
            this.statistics.worstRound = roundScore;
        }
    }
    isEligibleForPlay() {
        return this.isActive && this.isReady && this.getMemberCount() > 0;
    }
};
exports.Team = Team;
tslib_1.__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Team.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => organization_model_1.Organization),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Team.prototype, "organizationId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => game_model_1.Game),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    tslib_1.__metadata("design:type", String)
], Team.prototype, "gameId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Validate)({
        len: [1, 100]
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(100)),
    tslib_1.__metadata("design:type", String)
], Team.prototype, "name", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    tslib_1.__metadata("design:type", String)
], Team.prototype, "description", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Validate)({
        len: [0, 100]
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(100)),
    tslib_1.__metadata("design:type", String)
], Team.prototype, "captain", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Team.prototype, "tableNumber", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(500)),
    tslib_1.__metadata("design:type", String)
], Team.prototype, "logoUrl", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Default)([]),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    tslib_1.__metadata("design:type", Array)
], Team.prototype, "members", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Default)({}),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    tslib_1.__metadata("design:type", Object)
], Team.prototype, "contactInfo", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Team.prototype, "totalScore", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Team.prototype, "currentRound", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Team.prototype, "position", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Team.prototype, "bonusPoints", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Team.prototype, "penaltyPoints", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Default)({
        roundsPlayed: 0,
        totalScore: 0,
        averageScore: 0,
        bestRound: 0,
        worstRound: 0
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    tslib_1.__metadata("design:type", Object)
], Team.prototype, "statistics", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Team.prototype, "joinedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Team.prototype, "lastActivity", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    tslib_1.__metadata("design:type", Boolean)
], Team.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    tslib_1.__metadata("design:type", Boolean)
], Team.prototype, "isReady", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Team.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Team.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => organization_model_1.Organization),
    tslib_1.__metadata("design:type", organization_model_1.Organization)
], Team.prototype, "organization", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => game_model_1.Game, () => game_team_model_1.GameTeam),
    tslib_1.__metadata("design:type", Array)
], Team.prototype, "games", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => score_model_1.Score),
    tslib_1.__metadata("design:type", Array)
], Team.prototype, "scores", void 0);
exports.Team = Team = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'teams',
        timestamps: true,
        paranoid: false,
    })
], Team);
//# sourceMappingURL=team.model.js.map