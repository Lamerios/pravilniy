"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionService = void 0;
const score_model_1 = require("../models/score.model");
const team_model_1 = require("../models/team.model");
const logger_1 = require("../utils/logger");
class PositionService {
    async recalculateGamePositions(gameId, transaction) {
        try {
            logger_1.logger.info(`Starting position recalculation for game ${gameId}`);
            const currentPositions = await this.getCurrentPositions(gameId, transaction);
            const teamsWithScores = await this.getTeamsWithTotalScores(gameId, transaction);
            const newPositions = this.calculatePositions(teamsWithScores);
            const changes = this.calculatePositionChanges(currentPositions, newPositions);
            await this.updatePositionsInDatabase(gameId, newPositions, transaction);
            logger_1.logger.info(`Position recalculation completed for game ${gameId}: ${newPositions.length} teams, ${changes.filter(c => c.change !== 'same').length} changes`);
            return {
                positions: newPositions,
                changes
            };
        }
        catch (error) {
            logger_1.logger.error(`Failed to recalculate positions for game ${gameId}: ${error}`);
            throw error;
        }
    }
    async getCurrentPositions(gameId, transaction) {
        const scores = await score_model_1.Score.findAll({
            where: { gameId },
            attributes: ['teamId', 'position'],
            group: ['teamId', 'position'],
            transaction: transaction || null
        });
        const positions = new Map();
        scores.forEach(score => {
            if (score.position) {
                positions.set(score.teamId, score.position);
            }
        });
        return positions;
    }
    async getTeamsWithTotalScores(gameId, transaction) {
        const { GameTeam } = await Promise.resolve().then(() => __importStar(require('../models/game-team.model')));
        const teams = await team_model_1.Team.findAll({
            include: [
                {
                    model: GameTeam,
                    as: 'GameTeams',
                    where: { gameId },
                    attributes: [],
                    required: true
                },
                {
                    model: score_model_1.Score,
                    as: 'scores',
                    where: { gameId },
                    attributes: [],
                    required: false
                }
            ],
            attributes: [
                'id',
                'name',
                'tableNumber',
                [
                    score_model_1.Score.sequelize.fn('COALESCE', score_model_1.Score.sequelize.fn('SUM', score_model_1.Score.sequelize.col('scores.totalPoints')), 0),
                    'totalPoints'
                ],
                [
                    score_model_1.Score.sequelize.fn('COALESCE', score_model_1.Score.sequelize.fn('MAX', score_model_1.Score.sequelize.col('scores.updatedAt')), score_model_1.Score.sequelize.col('Team.createdAt')),
                    'lastUpdated'
                ]
            ],
            group: ['Team.id', 'Team.name', 'Team.tableNumber', 'Team.createdAt'],
            transaction: transaction || null
        });
        return teams.map(team => ({
            teamId: parseInt(team.id.toString()),
            teamName: team.name,
            tableNumber: team.tableNumber,
            totalPoints: parseFloat(team.dataValues.totalPoints) || 0,
            lastUpdated: new Date(team.dataValues.lastUpdated)
        }));
    }
    calculatePositions(teams) {
        const sortedTeams = teams.sort((a, b) => {
            if (a.totalPoints !== b.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            return a.lastUpdated.getTime() - b.lastUpdated.getTime();
        });
        return sortedTeams.map((team, index) => ({
            teamId: team.teamId,
            teamName: team.teamName,
            tableNumber: team.tableNumber,
            totalPoints: team.totalPoints,
            position: index + 1,
            positionChange: 'same',
            lastUpdated: team.lastUpdated
        }));
    }
    calculatePositionChanges(currentPositions, newPositions) {
        return newPositions.map(team => {
            const oldPosition = currentPositions.get(team.teamId);
            let change;
            if (oldPosition === undefined) {
                change = 'new';
            }
            else if (oldPosition > team.position) {
                change = 'up';
            }
            else if (oldPosition < team.position) {
                change = 'down';
            }
            else {
                change = 'same';
            }
            team.previousPosition = oldPosition || undefined;
            team.positionChange = change;
            return {
                teamId: team.teamId,
                teamName: team.teamName,
                oldPosition: oldPosition || undefined,
                newPosition: team.position,
                change
            };
        });
    }
    async updatePositionsInDatabase(gameId, positions, transaction) {
        for (const position of positions) {
            await score_model_1.Score.update({ position: position.position }, {
                where: {
                    gameId,
                    teamId: position.teamId
                },
                transaction: transaction || null
            });
        }
    }
    async getGameLeaderboard(gameId) {
        const result = await this.recalculateGamePositions(gameId);
        return result.positions;
    }
    async getTeamPosition(gameId, teamId) {
        const leaderboard = await this.getGameLeaderboard(gameId);
        const team = leaderboard.find(t => t.teamId === teamId);
        return team ? team.position : 0;
    }
}
exports.PositionService = PositionService;
//# sourceMappingURL=position.service.js.map