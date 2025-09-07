"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreService = exports.ScoreService = void 0;
const database_1 = require("../config/database");
const game_model_1 = require("../models/game.model");
const round_model_1 = require("../models/round.model");
const score_correction_model_1 = require("../models/score-correction.model");
const score_model_1 = require("../models/score.model");
const team_model_1 = require("../models/team.model");
const user_model_1 = require("../models/user.model");
class ScoreService {
    async createScore(scoreData, enteredBy) {
        const transaction = await database_1.sequelize.transaction();
        try {
            const [game, team, round] = await Promise.all([
                game_model_1.Game.findByPk(scoreData.gameId, { transaction }),
                team_model_1.Team.findByPk(scoreData.teamId, { transaction }),
                round_model_1.Round.findByPk(scoreData.roundId, { transaction })
            ]);
            if (!game) {
                throw new Error('Игра не найдена');
            }
            if (!team) {
                throw new Error('Команда не найдена');
            }
            if (!round) {
                throw new Error('Раунд не найден');
            }
            const gameTeam = await game.$get('teams', {
                where: { id: scoreData.teamId },
                transaction
            });
            if (gameTeam.length === 0) {
                throw new Error('Команда не участвует в данной игре');
            }
            if (parseInt(round.gameId.toString()) !== scoreData.gameId) {
                throw new Error('Раунд не принадлежит данной игре');
            }
            const existingScore = await score_model_1.Score.findOne({
                where: {
                    gameId: scoreData.gameId,
                    teamId: scoreData.teamId,
                    roundId: scoreData.roundId
                },
                transaction
            });
            if (existingScore) {
                throw new Error('Баллы для данной команды в этом раунде уже существуют');
            }
            const score = await score_model_1.Score.create({
                ...scoreData,
                enteredBy,
                totalPoints: this.calculateTotalPoints(scoreData.points, scoreData.bet)
            }, { transaction });
            await transaction.commit();
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
            const score = await score_model_1.Score.findByPk(scoreId, { transaction });
            if (!score) {
                await transaction.rollback();
                return null;
            }
            const oldPoints = score.points;
            const newPoints = scoreData.points ?? score.points;
            const newBet = scoreData.bet ?? score.bet;
            await score.update({
                ...scoreData,
                totalPoints: this.calculateTotalPoints(newPoints, newBet)
            }, { transaction });
            await transaction.commit();
            return this.getScoreById(scoreId);
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async getScoreById(scoreId) {
        return score_model_1.Score.findByPk(scoreId, {
            include: [
                {
                    model: game_model_1.Game,
                    attributes: ['id', 'name']
                },
                {
                    model: team_model_1.Team,
                    attributes: ['id', 'name', 'tableNumber']
                },
                {
                    model: round_model_1.Round,
                    attributes: ['id', 'name', 'roundNumber']
                },
                {
                    model: user_model_1.User,
                    as: 'enteredByUser',
                    attributes: ['id', 'username']
                }
            ]
        });
    }
    async getScores(query = {}) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', gameId, teamId, roundId } = query;
        const offset = (page - 1) * limit;
        const where = {};
        if (gameId)
            where['gameId'] = gameId;
        if (teamId)
            where['teamId'] = teamId;
        if (roundId)
            where['roundId'] = roundId;
        const { count, rows } = await score_model_1.Score.findAndCountAll({
            where,
            include: [
                {
                    model: game_model_1.Game,
                    attributes: ['id', 'name']
                },
                {
                    model: team_model_1.Team,
                    attributes: ['id', 'name', 'tableNumber']
                },
                {
                    model: round_model_1.Round,
                    attributes: ['id', 'name', 'roundNumber']
                },
                {
                    model: user_model_1.User,
                    as: 'enteredByUser',
                    attributes: ['id', 'username']
                }
            ],
            order: [[sortBy, sortOrder]],
            limit,
            offset
        });
        return {
            scores: rows.map(this.mapScoreToResponse),
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        };
    }
    async getTeamScores(gameId, teamId) {
        const scores = await score_model_1.Score.findAll({
            where: { gameId, teamId },
            include: [
                {
                    model: round_model_1.Round,
                    attributes: ['id', 'name', 'roundNumber']
                }
            ],
            order: [['roundId', 'ASC']]
        });
        return scores.map(this.mapScoreToResponse);
    }
    async getTeamScoreStats(gameId, teamId) {
        const [team, scores] = await Promise.all([
            team_model_1.Team.findByPk(teamId),
            this.getTeamScores(gameId, teamId)
        ]);
        if (!team) {
            throw new Error('Команда не найдена');
        }
        const totalPoints = scores.reduce((sum, score) => sum + score.totalPoints, 0);
        const roundsPlayed = scores.length;
        const averagePoints = roundsPlayed > 0 ? totalPoints / roundsPlayed : 0;
        const maxPoints = scores.length > 0 ? Math.max(...scores.map(s => s.totalPoints)) : 0;
        const minPoints = scores.length > 0 ? Math.min(...scores.map(s => s.totalPoints)) : 0;
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
        const [game, teams, rounds] = await Promise.all([
            game_model_1.Game.findByPk(gameId),
            game_model_1.Game.findByPk(gameId, {
                include: [{
                        model: team_model_1.Team,
                        attributes: ['id', 'name', 'tableNumber']
                    }]
            }).then(g => g?.teams || []),
            round_model_1.Round.findAll({
                where: { gameId },
                order: [['roundNumber', 'ASC']]
            })
        ]);
        if (!game) {
            throw new Error('Игра не найдена');
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
    async bulkCreateScores(bulkData, enteredBy) {
        const transaction = await database_1.sequelize.transaction();
        const result = {
            success: true,
            created: 0,
            updated: 0,
            errors: [],
            scores: []
        };
        try {
            for (const scoreData of bulkData.scores) {
                try {
                    const createData = {
                        gameId: bulkData.gameId,
                        roundId: bulkData.roundId,
                        teamId: scoreData.teamId,
                        points: scoreData.points,
                        bet: scoreData.bet,
                        notes: scoreData.notes
                    };
                    const score = await this.createScore(createData, enteredBy);
                    result.scores.push(this.mapScoreToResponse(score));
                    result.created++;
                }
                catch (error) {
                    result.errors.push({
                        teamId: scoreData.teamId,
                        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
                    });
                }
            }
            await transaction.commit();
            return result;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    async correctScore(correctionData) {
        const transaction = await database_1.sequelize.transaction();
        try {
            const score = await score_model_1.Score.findByPk(correctionData.scoreId, { transaction });
            if (!score) {
                throw new Error('Запись о баллах не найдена');
            }
            const oldPoints = score.points;
            await score_correction_model_1.ScoreCorrection.create({
                scoreId: correctionData.scoreId,
                oldPoints,
                newPoints: correctionData.newPoints,
                reason: correctionData.reason,
                correctedBy: correctionData.correctedBy
            }, { transaction });
            await score.update({
                points: correctionData.newPoints,
                totalPoints: this.calculateTotalPoints(correctionData.newPoints, score.bet)
            }, { transaction });
            await transaction.commit();
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
            include: [{
                    model: user_model_1.User,
                    attributes: ['id', 'username']
                }],
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
    async deleteScore(scoreId) {
        const transaction = await database_1.sequelize.transaction();
        try {
            const score = await score_model_1.Score.findByPk(scoreId, { transaction });
            if (!score) {
                await transaction.rollback();
                return false;
            }
            await score_correction_model_1.ScoreCorrection.destroy({
                where: { scoreId },
                transaction
            });
            await score.destroy({ transaction });
            await transaction.commit();
            return true;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    calculateTotalPoints(points, bet) {
        if (bet && bet > 0) {
            return points > 0 ? points + bet : 0;
        }
        return points;
    }
    mapScoreToResponse(score) {
        const response = {
            id: score.id,
            gameId: score.gameId,
            teamId: score.teamId,
            roundId: score.roundId,
            points: score.points,
            bet: score.bet || undefined,
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
}
exports.ScoreService = ScoreService;
exports.scoreService = new ScoreService();
//# sourceMappingURL=score.service.js.map