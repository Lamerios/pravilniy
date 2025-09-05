#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const database_1 = require("../config/database");
const associations_1 = require("../models/associations");
const seeders_1 = require("./seeders");
async function main() {
    try {
        console.log('🚀 Database seeding script started');
        const seedType = process.argv[2] || 'basic';
        console.log(`📋 Seed type: ${seedType}`);
        console.log('🔗 Connecting to database...');
        await database_1.sequelize.authenticate();
        console.log('✅ Database connection established');
        (0, associations_1.setupAssociations)();
        console.log('🔗 Model associations configured');
        console.log('🔄 Synchronizing database schema...');
        await database_1.sequelize.sync({ alter: false });
        console.log('✅ Database schema synchronized');
        switch (seedType.toLowerCase()) {
            case 'basic':
                console.log('\n📦 Running basic seeders only...');
                await (0, seeders_1.runBasicSeeders)();
                break;
            case 'demo':
                console.log('\n🎮 Running demo seeders only...');
                await (0, seeders_1.runDemoSeeders)();
                break;
            case 'full':
                console.log('\n🎯 Running all seeders...');
                await (0, seeders_1.runFullSeeders)();
                break;
            default:
                console.error(`❌ Unknown seed type: ${seedType}`);
                console.log('Available options: basic, demo, full');
                process.exit(1);
        }
        console.log('\n🎉 Database seeding completed successfully!');
        console.log('📊 Your database is ready to use');
    }
    catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    }
    finally {
        await database_1.sequelize.close();
        console.log('🔌 Database connection closed');
    }
}
main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map