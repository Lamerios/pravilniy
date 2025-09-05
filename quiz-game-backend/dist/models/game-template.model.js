"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameTemplate = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const game_model_1 = require("./game.model");
const organization_model_1 = require("./organization.model");
const round_model_1 = require("./round.model");
let GameTemplate = class GameTemplate extends sequelize_typescript_1.Model {
    name;
    description;
    roundsCount;
    questionsPerRound;
    timePerQuestion;
    maxTeams;
    isActive = true;
    settings;
    organizationId;
    organization;
    games;
    rounds;
};
exports.GameTemplate = GameTemplate;
tslib_1.__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], GameTemplate.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(100)),
    tslib_1.__metadata("design:type", String)
], GameTemplate.prototype, "name", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    tslib_1.__metadata("design:type", String)
], GameTemplate.prototype, "description", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], GameTemplate.prototype, "roundsCount", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], GameTemplate.prototype, "questionsPerRound", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], GameTemplate.prototype, "timePerQuestion", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], GameTemplate.prototype, "maxTeams", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    tslib_1.__metadata("design:type", Boolean)
], GameTemplate.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    tslib_1.__metadata("design:type", Object)
], GameTemplate.prototype, "settings", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => organization_model_1.Organization),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], GameTemplate.prototype, "organizationId", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], GameTemplate.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], GameTemplate.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => organization_model_1.Organization),
    tslib_1.__metadata("design:type", organization_model_1.Organization)
], GameTemplate.prototype, "organization", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => game_model_1.Game),
    tslib_1.__metadata("design:type", Array)
], GameTemplate.prototype, "games", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => round_model_1.Round),
    tslib_1.__metadata("design:type", Array)
], GameTemplate.prototype, "rounds", void 0);
exports.GameTemplate = GameTemplate = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'game_templates',
        timestamps: true,
        underscored: true
    })
], GameTemplate);
//# sourceMappingURL=game-template.model.js.map