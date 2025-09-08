"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDemoGame = exports.seedBasicData = void 0;
exports.runAllSeeders = runAllSeeders;
exports.runBasicSeeders = runBasicSeeders;
exports.runFullSeeders = runFullSeeders;
exports.runDemoSeeders = runDemoSeeders;
const basic_seeder_1 = require("./basic-seeder");
const demo_game_seeder_1 = require("./demo-game-seeder");
async function runAllSeeders(options = {}) {
    const { basic = true, demo = false, reset = false } = options;
    try {
        console.log('🌱 Starting database seeding...');
        console.log(`📋 Options: basic=${basic}, demo=${demo}, reset=${reset}`);
        if (reset) {
            console.log('🔄 Reset option enabled - this would clear existing data first');
        }
        if (basic) {
            console.log('\n📦 Running basic seeder...');
            await (0, basic_seeder_1.seedBasicData)();
        }
        if (demo) {
            console.log('\n🎮 Running demo game seeder...');
            await (0, demo_game_seeder_1.seedDemoGame)();
        }
        console.log('\n🎉 All seeders completed successfully!');
        console.log('📊 Database is ready for use');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}
async function runBasicSeeders() {
    return runAllSeeders({ basic: true, demo: false });
}
async function runFullSeeders() {
    return runAllSeeders({ basic: true, demo: true });
}
async function runDemoSeeders() {
    return runAllSeeders({ basic: false, demo: true });
}
var basic_seeder_2 = require("./basic-seeder");
Object.defineProperty(exports, "seedBasicData", { enumerable: true, get: function () { return basic_seeder_2.seedBasicData; } });
var demo_game_seeder_2 = require("./demo-game-seeder");
Object.defineProperty(exports, "seedDemoGame", { enumerable: true, get: function () { return demo_game_seeder_2.seedDemoGame; } });
exports.default = runAllSeeders;
//# sourceMappingURL=index.js.map