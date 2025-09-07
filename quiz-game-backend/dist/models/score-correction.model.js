"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreCorrection = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const score_model_1 = require("./score.model");
const user_model_1 = require("./user.model");
let ScoreCorrection = class ScoreCorrection extends sequelize_typescript_1.Model {
    scoreId;
    oldPoints;
    newPoints;
    reason;
    correctedBy;
    correctedAt;
    score;
    correctedByUser;
};
exports.ScoreCorrection = ScoreCorrection;
tslib_1.__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], ScoreCorrection.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => score_model_1.Score),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], ScoreCorrection.prototype, "scoreId", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        comment: 'Старые баллы'
    }),
    tslib_1.__metadata("design:type", Number)
], ScoreCorrection.prototype, "oldPoints", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        comment: 'Новые баллы'
    }),
    tslib_1.__metadata("design:type", Number)
], ScoreCorrection.prototype, "newPoints", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
        comment: 'Причина исправления'
    }),
    tslib_1.__metadata("design:type", String)
], ScoreCorrection.prototype, "reason", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        comment: 'Пользователь, который исправил баллы'
    }),
    tslib_1.__metadata("design:type", Number)
], ScoreCorrection.prototype, "correctedBy", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], ScoreCorrection.prototype, "correctedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => score_model_1.Score),
    tslib_1.__metadata("design:type", score_model_1.Score)
], ScoreCorrection.prototype, "score", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.User),
    tslib_1.__metadata("design:type", user_model_1.User)
], ScoreCorrection.prototype, "correctedByUser", void 0);
exports.ScoreCorrection = ScoreCorrection = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'score_corrections',
        timestamps: true,
        createdAt: true,
        updatedAt: false
    })
], ScoreCorrection);
//# sourceMappingURL=score-correction.model.js.map