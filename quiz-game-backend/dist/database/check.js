#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const database_1 = require("../config/database");
const utils_1 = require("./utils");
async function main() {
    try {
        console.log('🔍 Database Status Check');
        console.log('='.repeat(50));
        await (0, utils_1.checkDatabaseStatus)();
        console.log('\n✅ Database check completed');
    }
    catch (error) {
        console.error('\n❌ Database check failed:', error);
        console.log('\n🔧 Possible solutions:');
        console.log('1. Check if PostgreSQL is running');
        console.log('2. Verify your .env configuration');
        console.log('3. Run: npm run db:setup');
        process.exit(1);
    }
    finally {
        await database_1.sequelize.close();
    }
}
main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=check.js.map