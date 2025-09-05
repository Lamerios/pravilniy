"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDemoGame = seedDemoGame;
const game_template_model_1 = require("../../models/game-template.model");
const game_model_1 = require("../../models/game.model");
const organization_model_1 = require("../../models/organization.model");
const round_model_1 = require("../../models/round.model");
const score_model_1 = require("../../models/score.model");
const team_model_1 = require("../../models/team.model");
const user_model_1 = require("../../models/user.model");
async function seedDemoGame() {
    try {
        console.log('🎮 Starting demo game seeding...');
        const organization = await organization_model_1.Organization.findOne({ where: { name: 'Quiz Game Demo Organization' } });
        if (!organization) {
            throw new Error('Organization not found. Run basic seeder first.');
        }
        const adminUser = await user_model_1.User.findOne({ where: { email: 'admin@quiz-game.com' } });
        if (!adminUser) {
            throw new Error('Admin user not found. Run basic seeder first.');
        }
        const gameTemplate = await game_template_model_1.GameTemplate.findOne({
            where: { name: 'Классическая викторина' }
        });
        if (!gameTemplate) {
            throw new Error('Game template not found. Run basic seeder first.');
        }
        const demoGame = await game_model_1.Game.create({
            organizationId: organization.id.toString(),
            templateId: gameTemplate.id.toString(),
            createdBy: adminUser.id.toString(),
            name: 'Демонстрационная викторина "Знания без границ"',
            description: 'Завершенная игра с результатами для демонстрации системы',
            gameCode: 'DEMO2024',
            status: game_model_1.GameStatus.FINISHED,
            maxTeams: 10,
            maxPlayersPerTeam: 4,
            currentRound: 3,
            totalRounds: 3,
            startedAt: new Date(Date.now() - 7200000),
            finishedAt: new Date(Date.now() - 3600000),
            isPublic: true,
            allowLateJoin: false,
            autoStart: false,
            settings: {
                allowLateJoin: false,
                autoStart: false,
                showScores: true
            },
            gameData: {
                rules: 'Стандартные правила викторины',
                notes: 'Демонстрационная игра для показа возможностей системы'
            }
        });
        console.log('✅ Demo game created:', demoGame.name);
        const teams = await team_model_1.Team.bulkCreate([
            {
                organizationId: organization.id.toString(),
                gameId: demoGame.id,
                name: 'Знатоки',
                description: 'Команда опытных игроков с большим стажем',
                captain: 'Иван Петров',
                members: [
                    { name: 'Иван Петров', role: 'капитан', joinedAt: new Date() },
                    { name: 'Мария Сидорова', role: 'игрок', joinedAt: new Date() },
                    { name: 'Алексей Козлов', role: 'игрок', joinedAt: new Date() }
                ],
                contactInfo: {
                    email: 'znatoki@example.com',
                    phone: '+7-900-111-22-33'
                },
                totalScore: 85,
                currentRound: 3,
                position: 1,
                bonusPoints: 5,
                penaltyPoints: 0,
                statistics: {
                    roundsPlayed: 3,
                    totalScore: 85,
                    averageScore: 28,
                    bestRound: 35,
                    worstRound: 25
                },
                joinedAt: new Date(Date.now() - 7200000),
                lastActivity: new Date(Date.now() - 3600000),
                isActive: true,
                isReady: true
            },
            {
                organizationId: organization.id.toString(),
                gameId: demoGame.id,
                name: 'Эрудиты',
                description: 'Молодая амбициозная команда студентов',
                captain: 'Анна Волкова',
                members: [
                    { name: 'Анна Волкова', role: 'капитан', joinedAt: new Date() },
                    { name: 'Дмитрий Новиков', role: 'игрок', joinedAt: new Date() },
                    { name: 'Елена Морозова', role: 'игрок', joinedAt: new Date() },
                    { name: 'Павел Лебедев', role: 'игрок', joinedAt: new Date() }
                ],
                contactInfo: {
                    email: 'erudity@example.com',
                    phone: '+7-900-123-45-67'
                },
                totalScore: 78,
                currentRound: 3,
                position: 2,
                bonusPoints: 3,
                penaltyPoints: 0,
                statistics: {
                    roundsPlayed: 3,
                    totalScore: 78,
                    averageScore: 26,
                    bestRound: 30,
                    worstRound: 22
                },
                joinedAt: new Date(Date.now() - 7200000),
                lastActivity: new Date(Date.now() - 3600000),
                isActive: true,
                isReady: true
            },
            {
                organizationId: organization.id.toString(),
                gameId: demoGame.id,
                name: 'Мудрецы',
                description: 'Команда с большим жизненным опытом',
                captain: 'Сергей Белов',
                members: [
                    { name: 'Сергей Белов', role: 'капитан', joinedAt: new Date() },
                    { name: 'Ольга Зайцева', role: 'игрок', joinedAt: new Date() }
                ],
                contactInfo: {
                    email: 'mudrecy@example.com'
                },
                totalScore: 72,
                currentRound: 3,
                position: 3,
                bonusPoints: 2,
                penaltyPoints: 0,
                statistics: {
                    roundsPlayed: 3,
                    totalScore: 72,
                    averageScore: 24,
                    bestRound: 28,
                    worstRound: 20
                },
                joinedAt: new Date(Date.now() - 7200000),
                lastActivity: new Date(Date.now() - 3600000),
                isActive: true,
                isReady: true
            },
            {
                organizationId: organization.id.toString(),
                gameId: demoGame.id,
                name: 'Новички',
                description: 'Команда начинающих игроков',
                captain: 'Татьяна Смирнова',
                members: [
                    { name: 'Татьяна Смирнова', role: 'капитан', joinedAt: new Date() },
                    { name: 'Андрей Попов', role: 'игрок', joinedAt: new Date() },
                    { name: 'Юлия Васильева', role: 'игрок', joinedAt: new Date() }
                ],
                contactInfo: {
                    email: 'novichki@example.com',
                    phone: '+7-900-555-66-77'
                },
                totalScore: 65,
                currentRound: 3,
                position: 4,
                bonusPoints: 0,
                penaltyPoints: 2,
                statistics: {
                    roundsPlayed: 3,
                    totalScore: 65,
                    averageScore: 22,
                    bestRound: 25,
                    worstRound: 18
                },
                joinedAt: new Date(Date.now() - 7200000),
                lastActivity: new Date(Date.now() - 3600000),
                isActive: true,
                isReady: true
            }
        ]);
        console.log('✅ Teams created:', teams.length);
        const rounds = await round_model_1.Round.bulkCreate([
            {
                gameId: demoGame.id,
                roundNumber: 1,
                name: 'Разминка',
                description: 'Простые вопросы для начала игры',
                type: round_model_1.RoundType.STANDARD,
                status: round_model_1.RoundStatus.FINISHED,
                timeLimit: 300,
                totalQuestions: 10,
                currentQuestion: 10,
                maxPoints: 30,
                multiplier: 1.0,
                settings: {
                    allowHints: false,
                    showAnswers: true
                },
                statistics: {
                    totalAnswers: 40,
                    correctAnswers: 32,
                    averageTime: 18,
                    participatingTeams: 4
                },
                startedAt: new Date(Date.now() - 7200000),
                finishedAt: new Date(Date.now() - 6600000)
            },
            {
                gameId: demoGame.id,
                roundNumber: 2,
                name: 'Основной раунд',
                description: 'Вопросы средней сложности',
                type: round_model_1.RoundType.STANDARD,
                status: round_model_1.RoundStatus.FINISHED,
                timeLimit: 600,
                totalQuestions: 15,
                currentQuestion: 15,
                maxPoints: 45,
                multiplier: 1.5,
                settings: {
                    allowHints: false,
                    showAnswers: true
                },
                statistics: {
                    totalAnswers: 60,
                    correctAnswers: 42,
                    averageTime: 25,
                    participatingTeams: 4
                },
                startedAt: new Date(Date.now() - 6600000),
                finishedAt: new Date(Date.now() - 5400000)
            },
            {
                gameId: demoGame.id,
                roundNumber: 3,
                name: 'Финальный раунд',
                description: 'Самые сложные вопросы',
                type: round_model_1.RoundType.FINAL,
                status: round_model_1.RoundStatus.FINISHED,
                timeLimit: 900,
                totalQuestions: 10,
                currentQuestion: 10,
                maxPoints: 50,
                multiplier: 2.0,
                settings: {
                    allowHints: false,
                    showAnswers: true
                },
                statistics: {
                    totalAnswers: 40,
                    correctAnswers: 25,
                    averageTime: 42,
                    participatingTeams: 4
                },
                startedAt: new Date(Date.now() - 5400000),
                finishedAt: new Date(Date.now() - 3600000)
            }
        ]);
        console.log('✅ Rounds created:', rounds.length);
        const scores = await score_model_1.Score.bulkCreate([
            {
                gameId: demoGame.id,
                teamId: teams[0].id,
                roundId: rounds[0].id,
                scoreType: score_model_1.ScoreType.ROUND_SCORE,
                points: 25,
                basePoints: 25,
                multiplier: 1.0,
                roundNumber: 1,
                reason: 'Отличные знания в разминочном раунде',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 6600000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[0].id,
                roundId: rounds[1].id,
                scoreType: score_model_1.ScoreType.ROUND_SCORE,
                points: 35,
                basePoints: 35,
                multiplier: 1.0,
                roundNumber: 2,
                reason: 'Лучший результат в основном раунде',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 5400000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[0].id,
                roundId: rounds[2].id,
                scoreType: score_model_1.ScoreType.ROUND_SCORE,
                points: 25,
                basePoints: 25,
                multiplier: 1.0,
                roundNumber: 3,
                reason: 'Стабильный результат в финале',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 3600000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[1].id,
                roundId: rounds[0].id,
                scoreType: score_model_1.ScoreType.ROUND_SCORE,
                points: 22,
                basePoints: 22,
                multiplier: 1.0,
                roundNumber: 1,
                reason: 'Хороший старт',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 6600000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[1].id,
                roundId: rounds[1].id,
                scoreType: score_model_1.ScoreType.ROUND_SCORE,
                points: 30,
                basePoints: 30,
                multiplier: 1.0,
                roundNumber: 2,
                reason: 'Сильный результат в основном раунде',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 5400000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[1].id,
                roundId: rounds[2].id,
                scoreType: score_model_1.ScoreType.ROUND_SCORE,
                points: 26,
                basePoints: 26,
                multiplier: 1.0,
                roundNumber: 3,
                reason: 'Хороший финиш',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 3600000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[2].id,
                roundId: rounds[0].id,
                scoreType: score_model_1.ScoreType.ROUND_SCORE,
                points: 20,
                basePoints: 20,
                multiplier: 1.0,
                roundNumber: 1,
                reason: 'Неспешный старт',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 6600000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[2].id,
                roundId: rounds[1].id,
                scoreType: score_model_1.ScoreType.ROUND_SCORE,
                points: 28,
                basePoints: 28,
                multiplier: 1.0,
                roundNumber: 2,
                reason: 'Опыт дает о себе знать',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 5400000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[2].id,
                roundId: rounds[2].id,
                scoreType: score_model_1.ScoreType.ROUND_SCORE,
                points: 24,
                basePoints: 24,
                multiplier: 1.0,
                roundNumber: 3,
                reason: 'Достойное завершение',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 3600000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[3].id,
                roundId: rounds[0].id,
                scoreType: score_model_1.ScoreType.ROUND_SCORE,
                points: 18,
                basePoints: 18,
                multiplier: 1.0,
                roundNumber: 1,
                reason: 'Первый опыт',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 6600000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[3].id,
                roundId: rounds[1].id,
                scoreType: score_model_1.ScoreType.ROUND_SCORE,
                points: 22,
                basePoints: 22,
                multiplier: 1.0,
                roundNumber: 2,
                reason: 'Прогресс налицо',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 5400000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[3].id,
                roundId: rounds[2].id,
                scoreType: score_model_1.ScoreType.ROUND_SCORE,
                points: 25,
                basePoints: 25,
                multiplier: 1.0,
                roundNumber: 3,
                reason: 'Сильное завершение!',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 3600000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[0].id,
                scoreType: score_model_1.ScoreType.BONUS,
                points: 5,
                basePoints: 5,
                multiplier: 1.0,
                reason: 'Бонус за лидерство',
                description: 'Дополнительные очки за лучший результат',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 3600000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[1].id,
                scoreType: score_model_1.ScoreType.BONUS,
                points: 3,
                basePoints: 3,
                multiplier: 1.0,
                reason: 'Бонус за активность',
                description: 'Дополнительные очки за активное участие',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 3600000)
            },
            {
                gameId: demoGame.id,
                teamId: teams[2].id,
                scoreType: score_model_1.ScoreType.BONUS,
                points: 2,
                basePoints: 2,
                multiplier: 1.0,
                reason: 'Бонус за опыт',
                description: 'Дополнительные очки за мудрые ответы',
                isValid: true,
                awardedBy: adminUser.id.toString(),
                awardedAt: new Date(Date.now() - 3600000)
            }
        ]);
        console.log('✅ Scores created:', scores.length);
        console.log('ℹ️  Created complete demo game:');
        console.log('   📊 Game: "Знания без границ" (FINISHED)');
        console.log('   👥 Teams: 4 teams with different compositions');
        console.log('   🎯 Rounds: 3 rounds (Разминка, Основной, Финал)');
        console.log('   🏆 Results: Знатоки (85), Эрудиты (78), Мудрецы (72), Новички (65)');
        console.log('   💯 Scores: Admin entered scores for each team per round + bonuses');
        console.log('   🎮 Business process: No questions/answers stored - only admin-entered scores');
        console.log('🎉 Demo game seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Demo game seeding failed:', error);
        throw error;
    }
}
exports.default = seedDemoGame;
//# sourceMappingURL=demo-game-seeder.js.map