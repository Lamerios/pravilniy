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
        console.log('🚀 Database Setup Script Started');
        console.log('='.repeat(50));
        const setupType = process.argv[2] || 'full';
        console.log(`📋 Setup type: ${setupType}`);
        console.log('\n🔗 Step 1: Checking database connection...');
        const isConnected = await (0, utils_1.checkDatabaseConnection)();
        if (!isConnected) {
            throw new Error('Cannot connect to database');
        }
        (0, associations_1.setupAssociations)();
        console.log('✅ Model associations configured');
        console.log('\n📊 Step 2: Checking existing tables...');
        const tablesInfo = await (0, utils_1.checkTablesExist)();
        if (!tablesInfo.exists) {
            console.log('⚠️  Missing tables detected, running migrations...');
            console.log(`   Missing: ${tablesInfo.missingTables.join(', ')}`);
            const queryInterface = database_1.sequelize.getQueryInterface();
            await (0, migrations_1.runAllMigrations)(queryInterface);
        }
        else {
            console.log('✅ All required tables exist');
        }
        console.log('\n🌱 Step 3: Running seeders...');
        switch (setupType.toLowerCase()) {
            case 'basic':
                console.log('📦 Running basic seeders only...');
                await (0, seeders_1.runBasicSeeders)();
                break;
            case 'demo':
                console.log('🎮 Running demo seeders only...');
                await (0, seeders_1.runDemoSeeders)();
                break;
            case 'full':
            default:
                console.log('🎯 Running all seeders...');
                await (0, seeders_1.runFullSeeders)();
                break;
        }
        console.log('\n🔍 Step 4: Verifying database state...');
        await (0, utils_1.checkDatabaseStatus)();
        const duration = (0, utils_1.formatDuration)(startTime);
        console.log('\n' + '='.repeat(50));
        console.log(`🎉 Database setup completed successfully in ${duration}!`);
        console.log('📊 Your database is ready to use');
        console.log('\n📝 Next steps:');
        console.log('   - Start your application: npm run dev');
        console.log('   - Check database status: npm run db:check');
        console.log('   - Reset if needed: npm run db:reset');
    }
    catch (error) {
        const duration = (0, utils_1.formatDuration)(startTime);
        console.error('\n' + '='.repeat(50));
        console.error(`❌ Database setup failed after ${duration}:`);
        console.error(error);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Check your database connection settings in .env');
        console.log('2. Ensure PostgreSQL is running and accessible');
        console.log('3. Verify database permissions for your user');
        console.log('4. Try running: npm run db:reset --force');
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
//# sourceMappingURL=setup.js.map