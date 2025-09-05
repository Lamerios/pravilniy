"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAssociations = setupAssociations;
exports.validateAssociations = validateAssociations;
const game_template_model_1 = require("./game-template.model");
const game_model_1 = require("./game.model");
const organization_model_1 = require("./organization.model");
const round_model_1 = require("./round.model");
const team_model_1 = require("./team.model");
const user_model_1 = require("./user.model");
const score_model_1 = require("./score.model");
function setupAssociations() {
    organization_model_1.Organization.hasMany(user_model_1.User, {
        foreignKey: 'organizationId',
        as: 'users',
        onDelete: 'CASCADE'
    });
    organization_model_1.Organization.hasMany(game_template_model_1.GameTemplate, {
        foreignKey: 'organizationId',
        as: 'gameTemplates',
        onDelete: 'CASCADE'
    });
    organization_model_1.Organization.hasMany(game_model_1.Game, {
        foreignKey: 'organizationId',
        as: 'games',
        onDelete: 'CASCADE'
    });
    organization_model_1.Organization.hasMany(team_model_1.Team, {
        foreignKey: 'organizationId',
        as: 'teams',
        onDelete: 'CASCADE'
    });
    user_model_1.User.belongsTo(organization_model_1.Organization, {
        foreignKey: 'organizationId',
        as: 'organization'
    });
    user_model_1.User.hasMany(game_template_model_1.GameTemplate, {
        foreignKey: 'createdBy',
        as: 'createdGameTemplates',
        onDelete: 'RESTRICT'
    });
    user_model_1.User.hasMany(game_model_1.Game, {
        foreignKey: 'createdBy',
        as: 'createdGames',
        onDelete: 'RESTRICT'
    });
    user_model_1.User.hasMany(score_model_1.Score, {
        foreignKey: 'awardedBy',
        as: 'awardedScores',
        onDelete: 'SET NULL'
    });
    game_template_model_1.GameTemplate.belongsTo(organization_model_1.Organization, {
        foreignKey: 'organizationId',
        as: 'organization'
    });
    game_template_model_1.GameTemplate.belongsTo(user_model_1.User, {
        foreignKey: 'createdBy',
        as: 'creator'
    });
    game_template_model_1.GameTemplate.hasMany(game_model_1.Game, {
        foreignKey: 'templateId',
        as: 'games',
        onDelete: 'RESTRICT'
    });
    game_model_1.Game.belongsTo(organization_model_1.Organization, {
        foreignKey: 'organizationId',
        as: 'organization'
    });
    game_model_1.Game.belongsTo(game_template_model_1.GameTemplate, {
        foreignKey: 'templateId',
        as: 'template'
    });
    game_model_1.Game.belongsTo(user_model_1.User, {
        foreignKey: 'createdBy',
        as: 'creator'
    });
    game_model_1.Game.hasMany(team_model_1.Team, {
        foreignKey: 'gameId',
        as: 'teams',
        onDelete: 'CASCADE'
    });
    game_model_1.Game.hasMany(round_model_1.Round, {
        foreignKey: 'gameId',
        as: 'rounds',
        onDelete: 'CASCADE'
    });
    game_model_1.Game.hasMany(score_model_1.Score, {
        foreignKey: 'gameId',
        as: 'scores',
        onDelete: 'CASCADE'
    });
    team_model_1.Team.belongsTo(organization_model_1.Organization, {
        foreignKey: 'organizationId',
        as: 'organization'
    });
    team_model_1.Team.belongsTo(game_model_1.Game, {
        foreignKey: 'gameId',
        as: 'game'
    });
    team_model_1.Team.hasMany(score_model_1.Score, {
        foreignKey: 'teamId',
        as: 'scores',
        onDelete: 'CASCADE'
    });
    round_model_1.Round.belongsTo(game_model_1.Game, {
        foreignKey: 'gameId',
        as: 'game'
    });
    round_model_1.Round.hasMany(score_model_1.Score, {
        foreignKey: 'roundId',
        as: 'scores',
        onDelete: 'CASCADE'
    });
    score_model_1.Score.belongsTo(game_model_1.Game, {
        foreignKey: 'gameId',
        as: 'game'
    });
    score_model_1.Score.belongsTo(team_model_1.Team, {
        foreignKey: 'teamId',
        as: 'team'
    });
    score_model_1.Score.belongsTo(round_model_1.Round, {
        foreignKey: 'roundId',
        as: 'round'
    });
    score_model_1.Score.belongsTo(user_model_1.User, {
        foreignKey: 'awardedBy',
        as: 'awarder'
    });
    console.log('✅ All model associations have been set up');
}
function validateAssociations() {
    try {
        const models = [organization_model_1.Organization, user_model_1.User, game_template_model_1.GameTemplate, game_model_1.Game, team_model_1.Team, round_model_1.Round, score_model_1.Score];
        for (const model of models) {
            const associations = model.associations;
            if (!associations || Object.keys(associations).length === 0) {
                console.warn(`⚠️  Model ${model.name} has no associations`);
            }
        }
        console.log('✅ Association validation completed');
        return true;
    }
    catch (error) {
        console.error('❌ Association validation failed:', error);
        return false;
    }
}
//# sourceMappingURL=associations.js.map