"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
exports.connectDatabase = connectDatabase;
exports.closeDatabase = closeDatabase;
require("dotenv/config");
const sequelize_typescript_1 = require("sequelize-typescript");
const config_1 = require("./config");
const game_team_model_1 = require("../models/game-team.model");
const game_template_model_1 = require("../models/game-template.model");
const game_model_1 = require("../models/game.model");
const organization_model_1 = require("../models/organization.model");
const round_model_1 = require("../models/round.model");
const score_model_1 = require("../models/score.model");
const team_model_1 = require("../models/team.model");
const user_model_1 = require("../models/user.model");
const dbConfig = {
    host: config_1.config.db.host === 'localhost' ? '127.0.0.1' : config_1.config.db.host,
    port: config_1.config.db.port,
    database: config_1.config.db.name,
    username: config_1.config.db.user,
    password: config_1.config.db.password,
    dialect: 'postgres',
    logging: config_1.config.db.logging,
    pool: {
        min: config_1.config.db.pool.min,
        max: config_1.config.db.pool.max,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        ssl: false,
        connectTimeout: 60000,
    },
    models: [organization_model_1.Organization, user_model_1.User, game_template_model_1.GameTemplate, game_model_1.Game, game_team_model_1.GameTeam, team_model_1.Team, round_model_1.Round, score_model_1.Score]
};
console.log('🔍 Database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    username: dbConfig.username,
    password: dbConfig.password ? '***' : 'undefined'
});
exports.sequelize = new sequelize_typescript_1.Sequelize(dbConfig);
async function connectDatabase() {
    try {
        await exports.sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        if (config_1.config.server.env === 'development') {
            await exports.sequelize.sync({ alter: true });
            console.log('✅ Database models synchronized.');
        }
    }
    catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        throw error;
    }
}
async function closeDatabase() {
    try {
        await exports.sequelize.close();
        console.log('✅ Database connection closed.');
    }
    catch (error) {
        console.error('❌ Error closing database connection:', error);
        throw error;
    }
}
exports.default = exports.sequelize;
//# sourceMappingURL=database.js.map