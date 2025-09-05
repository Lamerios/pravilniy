"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
const tslib_1 = require("tslib");
const sequelize_typescript_1 = require("sequelize-typescript");
const game_template_model_1 = require("./game-template.model");
const user_model_1 = require("./user.model");
let Organization = class Organization extends sequelize_typescript_1.Model {
    name;
    description;
    address;
    phone;
    email;
    website;
    logo;
    isActive = true;
    users;
    gameTemplates;
};
exports.Organization = Organization;
tslib_1.__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    tslib_1.__metadata("design:type", Number)
], Organization.prototype, "id", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(100)),
    tslib_1.__metadata("design:type", String)
], Organization.prototype, "name", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(200)),
    tslib_1.__metadata("design:type", String)
], Organization.prototype, "description", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(100)),
    tslib_1.__metadata("design:type", String)
], Organization.prototype, "address", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(50)),
    tslib_1.__metadata("design:type", String)
], Organization.prototype, "phone", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(100)),
    tslib_1.__metadata("design:type", String)
], Organization.prototype, "email", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(200)),
    tslib_1.__metadata("design:type", String)
], Organization.prototype, "website", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(100)),
    tslib_1.__metadata("design:type", String)
], Organization.prototype, "logo", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    tslib_1.__metadata("design:type", Boolean)
], Organization.prototype, "isActive", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Organization.prototype, "createdAt", void 0);
tslib_1.__decorate([
    sequelize_typescript_1.UpdatedAt,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    tslib_1.__metadata("design:type", Date)
], Organization.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => user_model_1.User),
    tslib_1.__metadata("design:type", Array)
], Organization.prototype, "users", void 0);
tslib_1.__decorate([
    (0, sequelize_typescript_1.HasMany)(() => game_template_model_1.GameTemplate),
    tslib_1.__metadata("design:type", Array)
], Organization.prototype, "gameTemplates", void 0);
exports.Organization = Organization = tslib_1.__decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'organizations',
        timestamps: true,
        underscored: true
    })
], Organization);
//# sourceMappingURL=organization.model.js.map