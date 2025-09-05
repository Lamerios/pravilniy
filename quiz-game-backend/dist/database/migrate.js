"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
require("dotenv/config");
const database_1 = require("../config/database");
const migrations_1 = require("./migrations");
async function migrate() {
    try {
        console.log('🔗 Connecting to database...');
        await database_1.sequelize.authenticate();
        console.log('✅ Database connection established');
        const queryInterface = database_1.sequelize.getQueryInterface();
        const action = process.argv[2];
        switch (action) {
            case 'up':
                await (0, migrations_1.runAllMigrations)(queryInterface);
                break;
            case 'down':
                await (0, migrations_1.rollbackAllMigrations)(queryInterface);
                break;
            case 'reset':
                console.log('🔄 Resetting database (rollback + migrate)...');
                await (0, migrations_1.rollbackAllMigrations)(queryInterface);
                await (0, migrations_1.runAllMigrations)(queryInterface);
                break;
            default:
                console.log('📋 Usage:');
                console.log('  npm run migrate:up    - Run all migrations');
                console.log('  npm run migrate:down  - Rollback all migrations');
                console.log('  npm run migrate:reset - Reset database (rollback + migrate)');
                process.exit(1);
        }
        console.log('🎉 Migration process completed successfully!');
    }
    catch (error) {
        console.error('❌ Migration process failed:', error);
        process.exit(1);
    }
    finally {
        await database_1.sequelize.close();
        console.log('🔌 Database connection closed');
    }
}
if (require.main === module) {
    migrate();
}
//# sourceMappingURL=migrate.js.map