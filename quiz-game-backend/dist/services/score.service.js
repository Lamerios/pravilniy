"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreService = exports.ScoreService = void 0;
const database_1 = require("../config/database");
const game_team_model_1 = require("../models/game-team.model");
const game_model_1 = require("../models/game.model");
const round_model_1 = require("../models/round.model");
const score_correction_model_1 = require("../models/score-correction.model");
const score_model_1 = require("../models/score.model");
const team_model_1 = require("../models/team.model");
const user_model_1 = require("../models/user.model");
const position_service_1 = require("./position.service");
class ScoreService {
    positionService;
    constructor() {
        this.positionService = new position_service_1.PositionService();
    }
    async createScore(scoreData) {
        const transaction = await database_1.sequelize.transaction();
        try {
            const game = await game_model_1.Game.findByPk(scoreData.gameId);
            if (!game) {
                throw new Error('Игра не найдена');
            }
            const team = await team_model_1.Team.findByPk(scoreData.teamId);
            if (!team) {
                throw new Error('Команда не найдена');
            }
            const gameTeam = await game_team_model_1.GameTeam.findAll({
                where: {
                    gameId: scoreData.gameId,
                    teamId: scoreData.teamId
                }
            });
            if (gameTeam.length === 0) {
                throw new Error('Команда не участвует в данной игре');
            }
            const round = await round_model_1.Round.findByPk(scoreData.roundId);
            if (!round) {
                throw new Error('Раунд не найден');
            }
            if (parseInt(round.gameId.toString()) !== scoreData.gameId) {
                throw new Error('Раунд не принадлежит данной игре');
            }
            const existingScore = await score_model_1.Score.findOne({
                where: {
                    gameId: scoreData.gameId,
                    teamId: scoreData.teamId,
                    roundId: scoreData.roundId
                }
            });
            if (existingScore) {
                throw new Error('Баллы для этой команды в данном раунде уже введены');
            }
            const pointsValidation = this.validatePoints(scoreData.points);
            if (pointsValidation.warning) {
                console.warn(`Score validation warning: ${pointsValidation.warning}`, {
                    points: scoreData.points,
                    teamId: scoreData.teamId,
                    roundId: scoreData.roundId
                });
            }
            this.validateBet(scoreData.bet, scoreData.betType, scoreData.minBet, scoreData.maxBet);
            const totalPoints = this.calculateTotalPoints(scoreData.points, scoreData.bet, scoreData.betType || 'MULTIPLIER');
            const score = await score_model_1.Score.create({
                gameId: scoreData.gameId,
                teamId: scoreData.teamId,
                roundId: scoreData.roundId,
                points: scoreData.points,
                bet: scoreData.bet,
                betType: scoreData.betType || 'MULTIPLIER',
                minBet: scoreData.minBet,
                maxBet: scoreData.maxBet,
                totalPoints,
                notes: scoreData.notes,
                enteredBy: scoreData.enteredBy
            }, { transaction });
            await transaction.commit();
            try {
                await this.positionService.recalculateGamePositions(scoreData.gameId);
            }
            catch (positionError) {
                console.error('Failed to recalculate positions after score creation:', positionError);
            }
            const result = await this.getScoreById(score.id);
            if (!result) {
                throw new Error('Ошибка при получении созданной записи о баллах');
            }
            return result;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async updateScore(scoreId, scoreData) {
        const transaction = await database_1.sequelize.transaction();
        try {
            const score = await score_model_1.Score.findByPk(scoreId);
            if (!score) {
                return null;
            }
            const newPoints = scoreData.points !== undefined ? scoreData.points : score.points;
            const newBet = scoreData.bet !== undefined ? scoreData.bet : score.bet;
            const newBetType = scoreData.betType !== undefined ? scoreData.betType : (score.betType || 'MULTIPLIER');
            this.validateBet(newBet, newBetType, scoreData.minBet, scoreData.maxBet);
            const totalPoints = this.calculateTotalPoints(newPoints, newBet, newBetType);
            await score.update({
                ...scoreData,
                totalPoints
            }, { transaction });
            await transaction.commit();
            try {
                await this.positionService.recalculateGamePositions(score.gameId);
            }
            catch (positionError) {
                console.error('Failed to recalculate positions after score update:', positionError);
            }
            return this.getScoreById(scoreId);
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async getScoreById(scoreId) {
        const score = await score_model_1.Score.findByPk(scoreId, {
            include: [
                {
                    model: team_model_1.Team,
                    as: 'team',
                    attributes: ['id', 'name', 'tableNumber']
                },
                {
                    model: round_model_1.Round,
                    as: 'round',
                    attributes: ['id', 'name', 'roundNumber']
                },
                {
                    model: game_model_1.Game,
                    as: 'game',
                    attributes: ['id', 'name']
                }
            ]
        });
        return score ? this.mapScoreToResponse(score) : null;
    }
    async getScores(query) {
        const { gameId, teamId, roundId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const where = {};
        if (gameId)
            where['gameId'] = gameId;
        if (teamId)
            where['teamId'] = teamId;
        if (roundId)
            where['roundId'] = roundId;
        const offset = (page - 1) * limit;
        const { count, rows } = await score_model_1.Score.findAndCountAll({
            where,
            include: [
                {
                    model: team_model_1.Team,
                    as: 'team',
                    attributes: ['id', 'name', 'tableNumber']
                },
                {
                    model: round_model_1.Round,
                    as: 'round',
                    attributes: ['id', 'name', 'roundNumber']
                },
                {
                    model: game_model_1.Game,
                    as: 'game',
                    attributes: ['id', 'name']
                }
            ],
            order: [[sortBy, sortOrder]],
            limit,
            offset
        });
        return {
            scores: rows.map(score => this.mapScoreToResponse(score)),
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        };
    }
    async getTeamScores(gameId, teamId) {
        const scores = await score_model_1.Score.findAll({
            where: {
                gameId,
                teamId
            },
            include: [
                {
                    model: team_model_1.Team,
                    as: 'team',
                    attributes: ['id', 'name', 'tableNumber']
                },
                {
                    model: round_model_1.Round,
                    as: 'round',
                    attributes: ['id', 'name', 'roundNumber']
                },
                {
                    model: game_model_1.Game,
                    as: 'game',
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'ASC']]
        });
        return scores.map(score => this.mapScoreToResponse(score));
    }
    async getTeamScoreStats(gameId, teamId) {
        const team = await team_model_1.Team.findByPk(teamId);
        if (!team) {
            throw new Error('Команда не найдена');
        }
        const scores = await this.getTeamScores(gameId, teamId);
        const totalPoints = scores.reduce((sum, score) => sum + score.totalPoints, 0);
        const roundsPlayed = scores.length;
        const averagePoints = roundsPlayed > 0 ? totalPoints / roundsPlayed : 0;
        const maxPoints = roundsPlayed > 0 ? Math.max(...scores.map(s => s.totalPoints)) : 0;
        const minPoints = roundsPlayed > 0 ? Math.min(...scores.map(s => s.totalPoints)) : 0;
        const allTeamStats = await this.getGameScoreStats(gameId);
        const currentPosition = allTeamStats.leaderboard.findIndex(entry => entry.teamId === teamId) + 1;
        return {
            teamId: parseInt(team.id.toString()),
            teamName: team.name,
            tableNumber: team.tableNumber || undefined,
            totalPoints,
            roundsPlayed,
            averagePoints: Math.round(averagePoints * 100) / 100,
            maxPoints,
            minPoints,
            currentPosition,
            scores
        };
    }
    async getGameScoreStats(gameId) {
        const game = await game_model_1.Game.findByPk(gameId);
        if (!game) {
            throw new Error('Игра не найдена');
        }
        const teams = await team_model_1.Team.findAll({
            include: [{
                    model: game_model_1.Game,
                    as: 'games',
                    where: { id: gameId },
                    through: { attributes: [] }
                }]
        });
        const rounds = await round_model_1.Round.findAll({
            where: { gameId }
        });
        if (teams.length === 0) {
            throw new Error('В игре нет команд');
        }
        const teamStats = [];
        for (const team of teams) {
            const stats = await this.getTeamScoreStats(gameId, parseInt(team.id.toString()));
            teamStats.push(stats);
        }
        teamStats.sort((a, b) => b.totalPoints - a.totalPoints);
        const leaderboard = teamStats.map((stats, index) => ({
            position: index + 1,
            teamId: stats.teamId,
            teamName: stats.teamName,
            tableNumber: stats.tableNumber,
            totalPoints: stats.totalPoints
        }));
        const totalPoints = teamStats.reduce((sum, stats) => sum + stats.totalPoints, 0);
        const averagePointsPerRound = rounds.length > 0 ? totalPoints / rounds.length : 0;
        return {
            gameId: parseInt(game.id.toString()),
            gameName: game.name,
            totalRounds: rounds.length,
            totalTeams: teams.length,
            averagePointsPerRound: Math.round(averagePointsPerRound * 100) / 100,
            teamStats,
            leaderboard
        };
    }
    async bulkCreateScores(bulkData) {
        const transaction = await database_1.sequelize.transaction();
        try {
            const results = [];
            const errors = [];
            for (const scoreData of bulkData.scores) {
                try {
                    const createData = {
                        gameId: bulkData.gameId,
                        roundId: bulkData.roundId,
                        teamId: scoreData.teamId,
                        points: scoreData.points,
                        bet: scoreData.bet || undefined,
                        notes: scoreData.notes || undefined,
                        enteredBy: bulkData.enteredBy
                    };
                    const score = await this.createScore(createData);
                    results.push(score);
                }
                catch (error) {
                    errors.push({
                        teamId: scoreData.teamId,
                        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
                    });
                }
            }
            await transaction.commit();
            return {
                success: true,
                created: results.length,
                updated: 0,
                errors,
                scores: results
            };
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async correctScore(correctionData) {
        const transaction = await database_1.sequelize.transaction();
        try {
            const score = await score_model_1.Score.findByPk(correctionData.scoreId);
            if (!score) {
                throw new Error('Запись о баллах не найдена');
            }
            await score_correction_model_1.ScoreCorrection.create({
                scoreId: correctionData.scoreId,
                oldPoints: score.points,
                newPoints: correctionData.newPoints,
                reason: correctionData.reason,
                correctedBy: correctionData.correctedBy
            }, { transaction });
            const totalPoints = this.calculateTotalPoints(correctionData.newPoints, score.bet, score.betType || 'MULTIPLIER');
            await score.update({
                points: correctionData.newPoints,
                totalPoints
            }, { transaction });
            await transaction.commit();
            try {
                await this.positionService.recalculateGamePositions(score.gameId);
            }
            catch (positionError) {
                console.error('Failed to recalculate positions after score correction:', positionError);
            }
            const result = await this.getScoreById(correctionData.scoreId);
            if (!result) {
                throw new Error('Ошибка при получении исправленной записи о баллах');
            }
            return result;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async getScoreCorrectionHistory(scoreId) {
        const corrections = await score_correction_model_1.ScoreCorrection.findAll({
            where: { scoreId },
            include: [
                {
                    model: user_model_1.User,
                    as: 'correctedByUser',
                    attributes: ['id', 'email']
                }
            ],
            order: [['correctedAt', 'DESC']]
        });
        return corrections.map(correction => ({
            id: correction.id,
            scoreId: correction.scoreId,
            oldPoints: correction.oldPoints,
            newPoints: correction.newPoints,
            reason: correction.reason,
            correctedBy: correction.correctedBy,
            correctedAt: correction.correctedAt.toISOString(),
            correctedByUser: correction.correctedByUser ? {
                id: correction.correctedByUser.id,
                username: correction.correctedByUser.email
            } : undefined
        }));
    }
    async getGameScoresHistory(gameId, query) {
        const { teamId, roundId, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const where = { gameId };
        if (teamId)
            where['teamId'] = teamId;
        if (roundId)
            where['roundId'] = roundId;
        const offset = (page - 1) * limit;
        const { count, rows } = await score_model_1.Score.findAndCountAll({
            where,
            include: [
                {
                    model: team_model_1.Team,
                    as: 'team',
                    attributes: ['id', 'name', 'tableNumber']
                },
                {
                    model: round_model_1.Round,
                    as: 'round',
                    attributes: ['id', 'name', 'roundNumber']
                },
                {
                    model: game_model_1.Game,
                    as: 'game',
                    attributes: ['id', 'name']
                }
            ],
            order: [[sortBy, sortOrder]],
            limit,
            offset
        });
        return {
            scores: rows.map(score => this.mapScoreToResponse(score)),
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        };
    }
    async getRoundScores(gameId, roundId) {
        const scores = await score_model_1.Score.findAll({
            where: {
                gameId,
                roundId
            },
            include: [
                {
                    model: team_model_1.Team,
                    as: 'team',
                    attributes: ['id', 'name', 'tableNumber']
                },
                {
                    model: round_model_1.Round,
                    as: 'round',
                    attributes: ['id', 'name', 'roundNumber']
                },
                {
                    model: game_model_1.Game,
                    as: 'game',
                    attributes: ['id', 'name']
                }
            ],
            order: [['totalPoints', 'DESC'], ['createdAt', 'ASC']]
        });
        return scores.map(score => this.mapScoreToResponse(score));
    }
    async getGameLeaderboard(gameId) {
        const gameStats = await this.getGameScoreStats(gameId);
        const game = await game_model_1.Game.findByPk(gameId);
        if (!game) {
            throw new Error('Игра не найдена');
        }
        const rounds = await round_model_1.Round.findAll({
            where: { gameId }
        });
        const leaderboardWithActivity = [];
        for (const teamStats of gameStats.teamStats) {
            const lastScore = await score_model_1.Score.findOne({
                where: {
                    gameId,
                    teamId: teamStats.teamId
                },
                order: [['updatedAt', 'DESC']]
            });
            leaderboardWithActivity.push({
                position: teamStats.currentPosition,
                teamId: teamStats.teamId,
                teamName: teamStats.teamName,
                tableNumber: teamStats.tableNumber || undefined,
                totalPoints: teamStats.totalPoints,
                roundsPlayed: teamStats.roundsPlayed,
                averagePoints: teamStats.averagePoints,
                lastActivity: lastScore ? lastScore.updatedAt.toISOString() : new Date().toISOString()
            });
        }
        leaderboardWithActivity.sort((a, b) => a.position - b.position);
        return {
            leaderboard: leaderboardWithActivity,
            gameInfo: {
                gameId: parseInt(game.id.toString()),
                gameName: game.name,
                totalRounds: rounds.length,
                totalTeams: gameStats.totalTeams
            }
        };
    }
    async getGameRoundsSummary(gameId) {
        const rounds = await round_model_1.Round.findAll({
            where: { gameId },
            order: [['roundNumber', 'ASC']]
        });
        const roundsSummary = [];
        for (const round of rounds) {
            const roundScores = await score_model_1.Score.findAll({
                where: {
                    gameId,
                    roundId: round.id
                }
            });
            if (roundScores.length > 0) {
                const totalPoints = roundScores.reduce((sum, score) => sum + score.totalPoints, 0);
                const pointsArray = roundScores.map(score => score.totalPoints);
                roundsSummary.push({
                    roundId: parseInt(round.id.toString()),
                    roundName: round.name,
                    roundNumber: round.roundNumber,
                    totalScores: roundScores.length,
                    averagePoints: Math.round((totalPoints / roundScores.length) * 100) / 100,
                    maxPoints: Math.max(...pointsArray),
                    minPoints: Math.min(...pointsArray),
                    teamsParticipated: roundScores.length
                });
            }
            else {
                roundsSummary.push({
                    roundId: parseInt(round.id.toString()),
                    roundName: round.name,
                    roundNumber: round.roundNumber,
                    totalScores: 0,
                    averagePoints: 0,
                    maxPoints: 0,
                    minPoints: 0,
                    teamsParticipated: 0
                });
            }
        }
        return { rounds: roundsSummary };
    }
    async deleteScore(scoreId) {
        const score = await score_model_1.Score.findByPk(scoreId);
        if (!score) {
            return false;
        }
        await score.destroy();
        return true;
    }
    calculateTotalPoints(points, bet, betType = 'MULTIPLIER') {
        if (!bet) {
            return points;
        }
        let totalPoints;
        switch (betType) {
            case 'MULTIPLIER':
                totalPoints = points * bet;
                break;
            case 'BONUS':
                totalPoints = points + bet;
                break;
            case 'FIXED':
                totalPoints = bet;
                break;
            default:
                totalPoints = points;
        }
        return Math.round(totalPoints * 100) / 100;
    }
    validatePoints(points) {
        if (points < -100) {
            return {
                isValid: true,
                warning: 'Критически низкие баллы. Убедитесь в корректности ввода.'
            };
        }
        if (points > 1000) {
            return {
                isValid: true,
                warning: 'Критически высокие баллы. Убедитесь в корректности ввода.'
            };
        }
        return { isValid: true };
    }
    async validateEntities(gameId, teamId, roundId) {
        const game = await game_model_1.Game.findByPk(gameId);
        if (!game) {
            throw new Error('Игра не найдена');
        }
        const team = await team_model_1.Team.findByPk(teamId);
        if (!team) {
            throw new Error('Команда не найдена');
        }
        const round = await round_model_1.Round.findByPk(roundId);
        if (!round) {
            throw new Error('Раунд не найден');
        }
        if (parseInt(round.gameId.toString()) !== gameId) {
            throw new Error('Раунд не принадлежит указанной игре');
        }
    }
    validateBet(bet, betType, minBet, maxBet) {
        if (!bet) {
            return;
        }
        if (bet <= 0) {
            throw new Error('Ставка должна быть положительным числом');
        }
        if (minBet && bet < minBet) {
            throw new Error(`Ставка не может быть меньше ${minBet}`);
        }
        if (maxBet && bet > maxBet) {
            throw new Error(`Ставка не может быть больше ${maxBet}`);
        }
        if (betType === 'MULTIPLIER') {
            if (bet > 10) {
                throw new Error('Множитель не может быть больше 10');
            }
            if (bet < 0.1) {
                throw new Error('Множитель не может быть меньше 0.1');
            }
        }
        else if (betType === 'BONUS') {
            if (bet > 100) {
                throw new Error('Бонус не может быть больше 100 баллов');
            }
        }
        else if (betType === 'FIXED') {
            if (bet > 200) {
                throw new Error('Фиксированные баллы не могут быть больше 200');
            }
        }
    }
    mapScoreToResponse(score) {
        const response = {
            id: score.id,
            gameId: score.gameId,
            teamId: score.teamId,
            roundId: score.roundId,
            points: score.points,
            bet: score.bet || undefined,
            betType: score.betType || undefined,
            minBet: score.minBet || undefined,
            maxBet: score.maxBet || undefined,
            totalPoints: score.totalPoints,
            notes: score.notes || undefined,
            createdAt: score.createdAt.toISOString(),
            updatedAt: score.updatedAt.toISOString()
        };
        if (score.team) {
            response.team = {
                id: parseInt(score.team.id.toString()),
                name: score.team.name,
                tableNumber: score.team.tableNumber
            };
        }
        if (score.round) {
            response.round = {
                id: parseInt(score.round.id.toString()),
                name: score.round.name,
                roundNumber: score.round.roundNumber
            };
        }
        if (score.game) {
            response.game = {
                id: parseInt(score.game.id.toString()),
                name: score.game.name
            };
        }
        return response;
    }
    async getGameCorrections(gameId, options) {
        const { page, limit } = options;
        const offset = (page - 1) * limit;
        const { count, rows: corrections } = await score_correction_model_1.ScoreCorrection.findAndCountAll({
            include: [
                {
                    model: score_model_1.Score,
                    as: 'score',
                    where: { gameId },
                    include: [
                        {
                            model: team_model_1.Team,
                            as: 'team',
                            attributes: ['name']
                        },
                        {
                            model: round_model_1.Round,
                            as: 'round',
                            attributes: ['name', 'roundNumber']
                        }
                    ]
                },
                {
                    model: user_model_1.User,
                    as: 'corrector',
                    attributes: ['username', 'email']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });
        const formattedCorrections = corrections.map(correction => ({
            id: parseInt(correction.id.toString()),
            scoreId: parseInt(correction.scoreId.toString()),
            teamName: correction.score.team.name,
            roundName: `${correction.score.round.name} (Раунд ${correction.score.round.roundNumber})`,
            oldPoints: correction.oldPoints,
            newPoints: correction.newPoints,
            reason: correction.reason,
            correctedBy: String(correction.correctedBy || 'Система'),
            correctedAt: correction.createdAt
        }));
        const totalPages = Math.ceil(count / limit);
        return {
            corrections: formattedCorrections,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit
            }
        };
    }
}
exports.ScoreService = ScoreService;
exports.scoreService = new ScoreService();
//# sourceMappingURL=score.service.js.map