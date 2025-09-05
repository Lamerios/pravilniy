"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrations = void 0;
exports.runAllMigrations = runAllMigrations;
exports.rollbackAllMigrations = rollbackAllMigrations;
const tslib_1 = require("tslib");
const createOrganizations = tslib_1.__importStar(require("./001-create-organizations"));
const createUsers = tslib_1.__importStar(require("./002-create-users"));
const createGameTemplates = tslib_1.__importStar(require("./003-create-game-templates"));
const createGames = tslib_1.__importStar(require("./004-create-games"));
const createTeams = tslib_1.__importStar(require("./005-create-teams"));
const createRounds = tslib_1.__importStar(require("./006-create-rounds"));
const createScores = tslib_1.__importStar(require("./008-create-scores"));
exports.migrations = [
    {
        name: '001-create-organizations',
        up: createOrganizations.up,
        down: createOrganizations.down
    },
    {
        name: '002-create-users',
        up: createUsers.up,
        down: createUsers.down
    },
    {
        name: '003-create-game-templates',
        up: createGameTemplates.up,
        down: createGameTemplates.down
    },
    {
        name: '004-create-games',
        up: createGames.up,
        down: createGames.down
    },
    {
        name: '005-create-teams',
        up: createTeams.up,
        down: createTeams.down
    },
    {
        name: '006-create-rounds',
        up: createRounds.up,
        down: createRounds.down
    },
    {
        name: '008-create-scores',
        up: createScores.up,
        down: createScores.down
    }
];
async function runAllMigrations(queryInterface) {
    console.log('🚀 Starting database migrations...');
    for (const migration of exports.migrations) {
        try {
            console.log(`📝 Running migration: ${migration.name}`);
            await migration.up(queryInterface);
            console.log(`✅ Migration completed: ${migration.name}`);
        }
        catch (error) {
            console.error(`❌ Migration failed: ${migration.name}`, error);
            throw error;
        }
    }
    console.log('🎉 All migrations completed successfully!');
}
async function rollbackAllMigrations(queryInterface) {
    console.log('🔄 Starting database migrations rollback...');
    const reversedMigrations = [...exports.migrations].reverse();
    for (const migration of reversedMigrations) {
        try {
            console.log(`📝 Rolling back migration: ${migration.name}`);
            await migration.down(queryInterface);
            console.log(`✅ Migration rollback completed: ${migration.name}`);
        }
        catch (error) {
            console.error(`❌ Migration rollback failed: ${migration.name}`, error);
            throw error;
        }
    }
    console.log('🎉 All migrations rolled back successfully!');
}
exports.default = exports.migrations;
//# sourceMappingURL=index.js.map