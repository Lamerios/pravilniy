"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedBasicData = seedBasicData;
const game_template_model_1 = require("../../models/game-template.model");
const organization_model_1 = require("../../models/organization.model");
const user_model_1 = require("../../models/user.model");
async function seedBasicData() {
    try {
        console.log('🌱 Starting database seeding...');
        const organization = await organization_model_1.Organization.create({
            name: 'Quiz Game Demo Organization',
            description: 'Демонстрационная организация для тестирования',
            email: 'demo@quiz-game.com',
            website: 'https://quiz-game.com',
            isActive: true
        });
        console.log('✅ Organization created:', organization.name);
        const adminUser = await user_model_1.User.create({
            email: 'admin@quiz-game.com',
            password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq',
            firstName: 'Admin',
            lastName: 'User',
            role: user_model_1.UserRole.ADMIN,
            organizationId: organization.id,
            isActive: true
        });
        console.log('✅ Admin user created:', adminUser.email);
        const gameTemplate = await game_template_model_1.GameTemplate.create({
            name: 'Классическая викторина',
            description: 'Стандартный шаблон для проведения викторин. Администратор создает раунды и вносит баллы команд вручную.',
            roundsCount: 3,
            maxTeams: 20,
            organizationId: organization.id,
            createdBy: adminUser.id,
            isActive: true
        });
        console.log('✅ Game template created:', gameTemplate.name);
        console.log('ℹ️  Demo game, teams, rounds and scores will be created during actual usage');
        console.log('ℹ️  Seeder focuses on basic data: Organization, Admin user, and Game template');
        console.log('ℹ️  Business process: Admin creates games, teams register, admin enters round scores');
        console.log('🎉 Database seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Database seeding failed:', error);
        throw error;
    }
}
exports.default = seedBasicData;
//# sourceMappingURL=basic-seeder.js.map