"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabaseConnection = checkDatabaseConnection;
exports.getDatabaseInfo = getDatabaseInfo;
exports.checkTablesExist = checkTablesExist;
exports.cleanAllTables = cleanAllTables;
exports.dropAllTables = dropAllTables;
exports.getTableCounts = getTableCounts;
exports.checkDatabaseStatus = checkDatabaseStatus;
exports.waitForConfirmation = waitForConfirmation;
exports.formatDuration = formatDuration;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
async function checkDatabaseConnection() {
    try {
        await database_1.sequelize.authenticate();
        console.log('✅ Database connection is working');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
async function getDatabaseInfo() {
    const queryInterface = database_1.sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    return {
        dialect: database_1.sequelize.getDialect(),
        database: database_1.sequelize.getDatabaseName(),
        host: database_1.sequelize.config.host || 'localhost',
        port: Number(database_1.sequelize.config.port) || 5432,
        tables: tables
    };
}
async function checkTablesExist() {
    const queryInterface = database_1.sequelize.getQueryInterface();
    const existingTables = await queryInterface.showAllTables();
    const expectedTables = [
        'organizations',
        'users',
        'game_templates',
        'games',
        'teams',
        'rounds',
        'scores'
    ];
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    return {
        exists: missingTables.length === 0,
        tables: existingTables,
        missingTables
    };
}
async function cleanAllTables() {
    const queryInterface = database_1.sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('🧹 Cleaning all tables...');
    await database_1.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }).catch(() => {
        return database_1.sequelize.query('SET session_replication_role = replica', { raw: true });
    });
    try {
        const tablesToClean = [...tables].reverse();
        for (const table of tablesToClean) {
            try {
                await queryInterface.bulkDelete(table, {}, {});
                console.log(`  ✅ Cleaned table: ${table}`);
            }
            catch (error) {
                console.warn(`  ⚠️  Could not clean table ${table}:`, error.message);
            }
        }
    }
    finally {
        await database_1.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true }).catch(() => {
            return database_1.sequelize.query('SET session_replication_role = DEFAULT', { raw: true });
        });
    }
    console.log('✅ All tables cleaned');
}
async function dropAllTables() {
    const queryInterface = database_1.sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    if (tables.length === 0) {
        console.log('ℹ️  No tables to drop');
        return;
    }
    console.log('🗑️  Dropping all tables...');
    await database_1.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }).catch(() => {
        return database_1.sequelize.query('SET session_replication_role = replica', { raw: true });
    });
    try {
        const tablesToDrop = [...tables].reverse();
        for (const table of tablesToDrop) {
            try {
                await queryInterface.dropTable(table);
                console.log(`  ✅ Dropped table: ${table}`);
            }
            catch (error) {
                console.warn(`  ⚠️  Could not drop table ${table}:`, error.message);
            }
        }
    }
    finally {
        await database_1.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true }).catch(() => {
            return database_1.sequelize.query('SET session_replication_role = DEFAULT', { raw: true });
        });
    }
    console.log('✅ All tables dropped');
}
async function getTableCounts() {
    const queryInterface = database_1.sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    const counts = {};
    for (const table of tables) {
        try {
            const result = await database_1.sequelize.query(`SELECT COUNT(*) as count FROM ${table}`, { type: sequelize_1.QueryTypes.SELECT });
            counts[table] = result[0].count;
        }
        catch (error) {
            counts[table] = -1;
        }
    }
    return counts;
}
async function checkDatabaseStatus() {
    console.log('🔍 Checking database status...\n');
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
        console.log('❌ Cannot proceed - database connection failed');
        return;
    }
    const dbInfo = await getDatabaseInfo();
    console.log('📊 Database Information:');
    console.log(`   Dialect: ${dbInfo.dialect}`);
    console.log(`   Database: ${dbInfo.database}`);
    console.log(`   Host: ${dbInfo.host}:${dbInfo.port}`);
    console.log(`   Tables: ${dbInfo.tables.length}\n`);
    const tablesInfo = await checkTablesExist();
    console.log('📋 Tables Status:');
    if (tablesInfo.exists) {
        console.log('   ✅ All expected tables exist');
    }
    else {
        console.log('   ⚠️  Missing tables:', tablesInfo.missingTables.join(', '));
    }
    if (tablesInfo.tables.length > 0) {
        console.log('\n📈 Record Counts:');
        const counts = await getTableCounts();
        for (const [table, count] of Object.entries(counts)) {
            const status = count === -1 ? '❌ Error' : `${count} records`;
            console.log(`   ${table}: ${status}`);
        }
    }
    console.log('\n✅ Database status check completed');
}
async function waitForConfirmation(message) {
    if (process.env['NODE_ENV'] === 'production' || process.env['CI'] === 'true') {
        console.log(`⚠️  ${message} (auto-confirmed in ${process.env['NODE_ENV'] || 'CI'} environment)`);
        return true;
    }
    console.log(`⚠️  ${message}`);
    console.log('ℹ️  Proceeding automatically in development environment...');
    return true;
}
function formatDuration(startTime) {
    const duration = Date.now() - startTime;
    if (duration < 1000) {
        return `${duration}ms`;
    }
    else if (duration < 60000) {
        return `${(duration / 1000).toFixed(1)}s`;
    }
    else {
        return `${Math.floor(duration / 60000)}m ${((duration % 60000) / 1000).toFixed(1)}s`;
    }
}
//# sourceMappingURL=utils.js.map