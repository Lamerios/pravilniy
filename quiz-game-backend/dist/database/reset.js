#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const database_1 = require("../config/database");
const associations_1 = require("../models/associations");
const migrations_1 = require("./migrations");
const seeders_1 = require("./seeders");
const utils_1 = require("./utils");
async function main() {
    const startTime = Date.now();
    try {
        console.log('🔄 Database Reset Script Started');
        console.log('='.repeat(50));
        const forceReset = process.argv.includes('--force');
        if (!forceReset) {
            console.log('⚠️  WARNING: This will completely reset your database!');
            console.log('   - All tables will be dropped');
            console.log('   - All data will be lost');
            console.log('   - Database will be recreated from scratch');
            console.log('');
            const confirmed = await (0, utils_1.waitForConfirmation)('Are you sure you want to proceed with database reset?');
            if (!confirmed) {
                console.log('❌ Database reset cancelled by user');
                process.exit(0);
            }
        }
        else {
            console.log('⚡ Force reset mode enabled');
        }
        console.log('\n🔗 Step 1: Checking database connection...');
        const isConnected = await (0, utils_1.checkDatabaseConnection)();
        if (!isConnected) {
            throw new Error('Cannot connect to database');
        }
        (0, associations_1.setupAssociations)();
        console.log('✅ Model associations configured');
        console.log('\n🗑️  Step 2: Dropping all existing tables...');
        await (0, utils_1.dropAllTables)();
        console.log('\n📊 Step 3: Running migrations...');
        const queryInterface = database_1.sequelize.getQueryInterface();
        await (0, migrations_1.runAllMigrations)(queryInterface);
        console.log('\n🌱 Step 4: Running seeders...');
        await (0, seeders_1.runFullSeeders)();
        console.log('\n🔍 Step 5: Verifying database state...');
        await (0, utils_1.checkDatabaseStatus)();
        const duration = (0, utils_1.formatDuration)(startTime);
        console.log('\n' + '='.repeat(50));
        console.log(`🎉 Database reset completed successfully in ${duration}!`);
        console.log('📊 Your database is now ready to use with fresh test data');
    }
    catch (error) {
        const duration = (0, utils_1.formatDuration)(startTime);
        console.error('\n' + '='.repeat(50));
        console.error(`❌ Database reset failed after ${duration}:`);
        console.error(error);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Check your database connection settings');
        console.log('2. Ensure PostgreSQL is running');
        console.log('3. Verify database permissions');
        console.log('4. Check the logs above for specific errors');
        process.exit(1);
    }
    finally {
        await database_1.sequelize.close();
        console.log('🔌 Database connection closed');
    }
}
process.on('SIGINT', async () => {
    console.log('\n⚠️  Received SIGINT, cleaning up...');
    await database_1.sequelize.close();
    process.exit(130);
});
process.on('SIGTERM', async () => {
    console.log('\n⚠️  Received SIGTERM, cleaning up...');
    await database_1.sequelize.close();
    process.exit(143);
});
main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=reset.js.map