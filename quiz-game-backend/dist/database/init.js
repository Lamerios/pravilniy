"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.syncDatabase = syncDatabase;
exports.setupDatabase = setupDatabase;
const database_1 = require("../config/database");
const associations_1 = require("../models/associations");
const game_template_model_1 = require("../models/game-template.model");
const game_model_1 = require("../models/game.model");
const organization_model_1 = require("../models/organization.model");
const round_model_1 = require("../models/round.model");
const score_model_1 = require("../models/score.model");
const team_model_1 = require("../models/team.model");
const user_model_1 = require("../models/user.model");
const seeders_1 = require("./seeders");
async function initializeDatabase() {
    try {
        database_1.sequelize.addModels([
            organization_model_1.Organization,
            user_model_1.User,
            game_template_model_1.GameTemplate,
            game_model_1.Game,
            team_model_1.Team,
            round_model_1.Round,
            score_model_1.Score
        ]);
        (0, associations_1.setupAssociations)();
        console.log('✅ Database models initialized');
    }
    catch (error) {
        console.error('❌ Failed to initialize database models:', error);
        throw error;
    }
}
async function syncDatabase() {
    try {
        await database_1.sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');
    }
    catch (error) {
        console.error('❌ Failed to sync database:', error);
        throw error;
    }
}
async function setupDatabase() {
    try {
        await initializeDatabase();
        await syncDatabase();
        const orgCount = await organization_model_1.Organization.count();
        if (orgCount === 0) {
            await (0, seeders_1.runAllSeeders)();
        }
        console.log('✅ Database setup completed');
    }
    catch (error) {
        console.error('❌ Database setup failed:', error);
        throw error;
    }
}
//# sourceMappingURL=init.js.map