"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const sequelize_1 = require("sequelize");
const game_team_model_1 = require("../models/game-team.model");
const game_template_model_1 = require("../models/game-template.model");
const game_model_1 = require("../models/game.model");
const organization_model_1 = require("../models/organization.model");
const team_model_1 = require("../models/team.model");
const user_model_1 = require("../models/user.model");
const logger_util_1 = require("../utils/logger.util");
class GameService {
    async getGames(query) {
        try {
            const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC', status, templateId, organizationId } = query;
            const offset = (page - 1) * limit;
            const where = {};
            if (search) {
                where[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { description: { [sequelize_1.Op.iLike]: `%${search}%` } }
                ];
            }
            if (status) {
                where.status = status;
            }
            if (templateId) {
                where.templateId = templateId;
            }
            if (organizationId) {
                where.organizationId = organizationId;
            }
            const { count, rows } = await game_model_1.Game.findAndCountAll({
                where,
                include: [
                    {
                        model: game_template_model_1.GameTemplate,
                        as: 'template',
                        attributes: ['id', 'name', 'description']
                    },
                    {
                        model: user_model_1.User,
                        as: 'createdBy',
                        attributes: ['id', 'username', 'email']
                    },
                    {
                        model: organization_model_1.Organization,
                        as: 'organization',
                        attributes: ['id', 'name']
                    }
                ],
                order: [[sortBy, sortOrder]],
                limit,
                offset,
                distinct: true
            });
            const totalPages = Math.ceil(count / limit);
            return {
                games: rows,
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit
            };
        }
        catch (error) {
            logger_util_1.logger.error('Error getting games:', error);
            throw new Error('Ошибка получения игр');
        }
    }
    async getGameById(id) {
        try {
            const game = await game_model_1.Game.findByPk(id, {
                include: [
                    {
                        model: game_template_model_1.GameTemplate,
                        as: 'template',
                        attributes: ['id', 'name', 'description', 'settings']
                    },
                    {
                        model: user_model_1.User,
                        as: 'createdBy',
                        attributes: ['id', 'username', 'email']
                    },
                    {
                        model: organization_model_1.Organization,
                        as: 'organization',
                        attributes: ['id', 'name']
                    }
                ]
            });
            return game;
        }
        catch (error) {
            logger_util_1.logger.error('Error getting game by ID:', error);
            throw new Error('Ошибка получения игры');
        }
    }
    async createGame(createData, userId, organizationId) {
        try {
            const validation = this.validateGameData(createData);
            if (!validation.isValid) {
                throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
            }
            const template = await game_template_model_1.GameTemplate.findByPk(createData.templateId);
            if (!template) {
                throw new Error('Шаблон не найден');
            }
            const gameData = {
                name: createData.name,
                templateId: createData.templateId.toString(),
                status: game_model_1.GameStatus.DRAFT,
                settings: createData.settings || {},
                createdBy: userId,
                organizationId: organizationId.toString()
            };
            if (createData.description) {
                gameData.description = createData.description;
            }
            if (createData.scheduledAt) {
                gameData.scheduledAt = createData.scheduledAt;
            }
            const game = await game_model_1.Game.create(gameData);
            if (createData.teamIds && createData.teamIds.length > 0) {
                await this.addTeamsToGame(game.id, createData.teamIds, organizationId);
            }
            logger_util_1.logger.info(`Game created: ${game.id} by user: ${userId}`);
            return game;
        }
        catch (error) {
            logger_util_1.logger.error('Error creating game:', error);
            throw new Error('Ошибка создания игры');
        }
    }
    async updateGame(id, updateData, userId) {
        try {
            const game = await game_model_1.Game.findByPk(id);
            if (!game) {
                return null;
            }
            if (game.status === game_model_1.GameStatus.ACTIVE || game.status === game_model_1.GameStatus.FINISHED) {
                throw new Error('Нельзя редактировать активную или завершенную игру');
            }
            if (updateData.settings) {
                const validation = this.validateGameSettings(updateData.settings);
                if (!validation.isValid) {
                    throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
                }
            }
            await game.update(updateData);
            logger_util_1.logger.info(`Game updated: ${id} by user: ${userId}`);
            return game;
        }
        catch (error) {
            logger_util_1.logger.error('Error updating game:', error);
            throw new Error('Ошибка обновления игры');
        }
    }
    async deleteGame(id, userId) {
        try {
            const game = await game_model_1.Game.findByPk(id);
            if (!game) {
                return false;
            }
            if (game.status === game_model_1.GameStatus.ACTIVE) {
                throw new Error('Нельзя удалить активную игру');
            }
            await game.destroy();
            logger_util_1.logger.info(`Game deleted: ${id} by user: ${userId}`);
            return true;
        }
        catch (error) {
            logger_util_1.logger.error('Error deleting game:', error);
            throw new Error('Ошибка удаления игры');
        }
    }
    async searchGames(query) {
        try {
            const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
            const offset = (page - 1) * limit;
            const where = {};
            if (search) {
                where[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { description: { [sequelize_1.Op.iLike]: `%${search}%` } }
                ];
            }
            const { count, rows } = await game_model_1.Game.findAndCountAll({
                where,
                include: [
                    {
                        model: game_template_model_1.GameTemplate,
                        as: 'template',
                        attributes: ['id', 'name', 'description']
                    },
                    {
                        model: user_model_1.User,
                        as: 'createdBy',
                        attributes: ['id', 'username', 'email']
                    }
                ],
                order: [[sortBy, sortOrder]],
                limit,
                offset,
                distinct: true
            });
            const totalPages = Math.ceil(count / limit);
            return {
                games: rows,
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit
            };
        }
        catch (error) {
            logger_util_1.logger.error('Error searching games:', error);
            throw new Error('Ошибка поиска игр');
        }
    }
    async getGameStats() {
        try {
            const totalGames = await game_model_1.Game.count();
            const activeGames = await game_model_1.Game.count({ where: { status: game_model_1.GameStatus.ACTIVE } });
            const finishedGames = await game_model_1.Game.count({ where: { status: game_model_1.GameStatus.FINISHED } });
            const draftGames = await game_model_1.Game.count({ where: { status: game_model_1.GameStatus.DRAFT } });
            const scheduledGames = await game_model_1.Game.count({ where: { status: game_model_1.GameStatus.WAITING } });
            const gamesByStatus = [
                { status: 'draft', count: draftGames },
                { status: 'scheduled', count: scheduledGames },
                { status: 'active', count: activeGames },
                { status: 'finished', count: finishedGames }
            ];
            const recentGames = await game_model_1.Game.findAll({
                order: [['createdAt', 'DESC']],
                limit: 5,
                attributes: ['id', 'name', 'status', 'createdAt']
            });
            const popularTemplates = [];
            return {
                totalGames,
                activeGames,
                finishedGames,
                draftGames,
                scheduledGames,
                gamesByStatus,
                recentGames: recentGames.map(g => ({
                    id: g.id,
                    name: g.name,
                    status: g.status.toString(),
                    createdAt: g.createdAt
                })),
                popularTemplates
            };
        }
        catch (error) {
            logger_util_1.logger.error('Error getting game stats:', error);
            throw new Error('Ошибка получения статистики');
        }
    }
    async changeGameState(id, stateChange, userId) {
        try {
            const game = await game_model_1.Game.findByPk(id);
            if (!game) {
                return null;
            }
            const { action, reason } = stateChange;
            let newStatus;
            switch (action) {
                case 'start':
                    if (game.status !== game_model_1.GameStatus.DRAFT && game.status !== game_model_1.GameStatus.WAITING) {
                        throw new Error('Можно запустить только черновик или запланированную игру');
                    }
                    newStatus = game_model_1.GameStatus.ACTIVE;
                    break;
                case 'pause':
                    if (game.status !== game_model_1.GameStatus.ACTIVE) {
                        throw new Error('Можно приостановить только активную игру');
                    }
                    newStatus = game_model_1.GameStatus.PAUSED;
                    break;
                case 'resume':
                    if (game.status !== game_model_1.GameStatus.PAUSED) {
                        throw new Error('Можно возобновить только приостановленную игру');
                    }
                    newStatus = game_model_1.GameStatus.ACTIVE;
                    break;
                case 'stop':
                case 'finish':
                    if (game.status !== game_model_1.GameStatus.ACTIVE && game.status !== game_model_1.GameStatus.PAUSED) {
                        throw new Error('Можно завершить только активную или приостановленную игру');
                    }
                    newStatus = game_model_1.GameStatus.FINISHED;
                    break;
                default:
                    throw new Error('Неверное действие');
            }
            const updateData = {
                status: newStatus
            };
            if (newStatus === game_model_1.GameStatus.FINISHED) {
                updateData.finishedAt = new Date();
            }
            await game.update(updateData);
            logger_util_1.logger.info(`Game state changed: ${id} to ${newStatus} by user: ${userId}, reason: ${reason || 'none'}`);
            return game;
        }
        catch (error) {
            logger_util_1.logger.error('Error changing game state:', error);
            throw new Error('Ошибка изменения состояния игры');
        }
    }
    validateGameData(data) {
        const errors = [];
        if (!data.name || data.name.trim().length === 0) {
            errors.push('Название игры обязательно');
        }
        if (data.name && data.name.length > 100) {
            errors.push('Название игры не должно превышать 100 символов');
        }
        if (data.description && data.description.length > 500) {
            errors.push('Описание не должно превышать 500 символов');
        }
        if (!data.templateId) {
            errors.push('ID шаблона обязателен');
        }
        if (data.settings) {
            const settingsValidation = this.validateGameSettings(data.settings);
            if (!settingsValidation.isValid) {
                errors.push(...settingsValidation.errors);
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateGameSettings(settings) {
        const errors = [];
        if (settings.maxTeams !== undefined) {
            if (typeof settings.maxTeams !== 'number' || settings.maxTeams < 1 || settings.maxTeams > 50) {
                errors.push('Максимальное количество команд должно быть числом от 1 до 50');
            }
        }
        if (settings.timeLimit !== undefined) {
            if (typeof settings.timeLimit !== 'number' || settings.timeLimit < 60 || settings.timeLimit > 1440) {
                errors.push('Временной лимит должен быть числом от 60 до 1440 минут');
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    async addTeamsToGame(gameId, teamIds, organizationId) {
        try {
            const teams = await team_model_1.Team.findAll({
                where: {
                    id: { [sequelize_1.Op.in]: teamIds },
                    organizationId: organizationId
                }
            });
            if (teams.length !== teamIds.length) {
                throw new Error('Некоторые команды не найдены или не принадлежат организации');
            }
            const existingGameTeams = await game_team_model_1.GameTeam.findAll({
                where: {
                    gameId: gameId,
                    teamId: { [sequelize_1.Op.in]: teamIds }
                }
            });
            if (existingGameTeams.length > 0) {
                throw new Error('Некоторые команды уже добавлены в игру');
            }
            const gameTeams = teamIds.map((teamId, index) => ({
                gameId: gameId,
                teamId: teamId,
                joinedAt: index + 1,
                isActive: true,
                joinedAtDate: new Date()
            }));
            await game_team_model_1.GameTeam.bulkCreate(gameTeams);
            logger_util_1.logger.info(`Added ${teamIds.length} teams to game: ${gameId}`);
        }
        catch (error) {
            logger_util_1.logger.error('Error adding teams to game:', error);
            throw error;
        }
    }
    async removeTeamsFromGame(gameId, teamIds) {
        try {
            await game_team_model_1.GameTeam.destroy({
                where: {
                    gameId: gameId,
                    teamId: { [sequelize_1.Op.in]: teamIds }
                }
            });
            logger_util_1.logger.info(`Removed ${teamIds.length} teams from game: ${gameId}`);
        }
        catch (error) {
            logger_util_1.logger.error('Error removing teams from game:', error);
            throw error;
        }
    }
    async getGameTeams(gameId) {
        try {
            const game = await game_model_1.Game.findByPk(gameId, {
                include: [{
                        model: team_model_1.Team,
                        through: {
                            where: { isActive: true }
                        }
                    }]
            });
            if (!game) {
                throw new Error('Игра не найдена');
            }
            return game.teams || [];
        }
        catch (error) {
            logger_util_1.logger.error('Error getting game teams:', error);
            throw error;
        }
    }
}
exports.GameService = GameService;
//# sourceMappingURL=game.service.js.map