"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_service_1 = require("../services/game.service");
const async_handler_util_1 = require("../utils/async-handler.util");
class GameController {
    gameService;
    constructor() {
        this.gameService = new game_service_1.GameService();
    }
    getGames = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const query = {
            page: parseInt(req.query['page']) || 1,
            limit: parseInt(req.query['limit']) || 10,
            search: req.query['search'],
            sortBy: req.query['sortBy'] || 'createdAt',
            sortOrder: req.query['sortOrder'] || 'DESC',
            status: req.query['status']
        };
        if (req.query['templateId']) {
            query.templateId = parseInt(req.query['templateId']);
        }
        if (req.query['organizationId']) {
            query.organizationId = parseInt(req.query['organizationId']);
        }
        const result = await this.gameService.getGames(query);
        res.json({
            success: true,
            message: 'Игры получены успешно',
            data: result.games,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: result.itemsPerPage
            }
        });
    });
    getGameById = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры обязателен'
            });
            return;
        }
        const gameId = parseInt(id);
        if (isNaN(gameId)) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры должен быть числом'
            });
            return;
        }
        const game = await this.gameService.getGameById(gameId);
        if (!game) {
            res.status(404).json({
                success: false,
                error: 'GameNotFoundError',
                message: 'Игра не найдена'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Игра получена успешно',
            data: game
        });
    });
    createGame = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const createData = req.body;
        const userId = req.user?.userId;
        const organizationId = req.user?.organizationId;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'UnauthorizedError',
                message: 'Пользователь не аутентифицирован'
            });
            return;
        }
        if (!organizationId) {
            res.status(400).json({
                success: false,
                error: 'BadRequestError',
                message: 'ID организации не указан'
            });
            return;
        }
        const game = await this.gameService.createGame(createData, userId.toString(), organizationId);
        res.status(201).json({
            success: true,
            message: 'Игра создана успешно',
            data: game
        });
    });
    updateGame = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
        const userId = req.user?.userId;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры обязателен'
            });
            return;
        }
        const gameId = parseInt(id);
        if (isNaN(gameId)) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры должен быть числом'
            });
            return;
        }
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'UnauthorizedError',
                message: 'Пользователь не аутентифицирован'
            });
            return;
        }
        const game = await this.gameService.updateGame(gameId, updateData, userId.toString());
        if (!game) {
            res.status(404).json({
                success: false,
                error: 'GameNotFoundError',
                message: 'Игра не найдена'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Игра обновлена успешно',
            data: game
        });
    });
    deleteGame = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры обязателен'
            });
            return;
        }
        const gameId = parseInt(id);
        if (isNaN(gameId)) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры должен быть числом'
            });
            return;
        }
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'UnauthorizedError',
                message: 'Пользователь не аутентифицирован'
            });
            return;
        }
        const deleted = await this.gameService.deleteGame(gameId, userId.toString());
        if (!deleted) {
            res.status(404).json({
                success: false,
                error: 'GameNotFoundError',
                message: 'Игра не найдена'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Игра удалена успешно'
        });
    });
    searchGames = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const query = {
            page: parseInt(req.query['page']) || 1,
            limit: parseInt(req.query['limit']) || 10,
            search: req.query['q'],
            sortBy: req.query['sortBy'] || 'createdAt',
            sortOrder: req.query['sortOrder'] || 'DESC'
        };
        if (!query.search) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'Параметр поиска обязателен'
            });
            return;
        }
        const result = await this.gameService.searchGames(query);
        res.json({
            success: true,
            message: 'Поиск выполнен успешно',
            data: result.games,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: result.itemsPerPage
            }
        });
    });
    getGameStats = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const stats = await this.gameService.getGameStats();
        res.json({
            success: true,
            message: 'Статистика получена успешно',
            data: stats
        });
    });
    startGame = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры обязателен'
            });
            return;
        }
        const gameId = parseInt(id);
        if (isNaN(gameId)) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры должен быть числом'
            });
            return;
        }
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'UnauthorizedError',
                message: 'Пользователь не аутентифицирован'
            });
            return;
        }
        const stateChange = {
            action: 'start',
            reason: req.body.reason
        };
        const game = await this.gameService.changeGameState(gameId, stateChange, userId.toString());
        if (!game) {
            res.status(404).json({
                success: false,
                error: 'GameNotFoundError',
                message: 'Игра не найдена'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Игра запущена успешно',
            data: game
        });
    });
    stopGame = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры обязателен'
            });
            return;
        }
        const gameId = parseInt(id);
        if (isNaN(gameId)) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры должен быть числом'
            });
            return;
        }
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'UnauthorizedError',
                message: 'Пользователь не аутентифицирован'
            });
            return;
        }
        const stateChange = {
            action: 'finish',
            reason: req.body.reason
        };
        const game = await this.gameService.changeGameState(gameId, stateChange, userId.toString());
        if (!game) {
            res.status(404).json({
                success: false,
                error: 'GameNotFoundError',
                message: 'Игра не найдена'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Игра остановлена успешно',
            data: game
        });
    });
    pauseGame = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры обязателен'
            });
            return;
        }
        const gameId = parseInt(id);
        if (isNaN(gameId)) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры должен быть числом'
            });
            return;
        }
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'UnauthorizedError',
                message: 'Пользователь не аутентифицирован'
            });
            return;
        }
        const stateChange = {
            action: 'pause',
            reason: req.body.reason
        };
        const game = await this.gameService.changeGameState(gameId, stateChange, userId.toString());
        if (!game) {
            res.status(404).json({
                success: false,
                error: 'GameNotFoundError',
                message: 'Игра не найдена'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Игра приостановлена успешно',
            data: game
        });
    });
    resumeGame = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры обязателен'
            });
            return;
        }
        const gameId = parseInt(id);
        if (isNaN(gameId)) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID игры должен быть числом'
            });
            return;
        }
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'UnauthorizedError',
                message: 'Пользователь не аутентифицирован'
            });
            return;
        }
        const stateChange = {
            action: 'resume',
            reason: req.body.reason
        };
        const game = await this.gameService.changeGameState(gameId, stateChange, userId.toString());
        if (!game) {
            res.status(404).json({
                success: false,
                error: 'GameNotFoundError',
                message: 'Игра не найдена'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Игра возобновлена успешно',
            data: game
        });
    });
    addTeamsToGame = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { teamIds } = req.body;
        const organizationId = req.user?.organizationId;
        if (!organizationId) {
            res.status(400).json({
                success: false,
                error: 'BadRequestError',
                message: 'ID организации не указан'
            });
            return;
        }
        if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
            res.status(400).json({
                success: false,
                error: 'BadRequestError',
                message: 'Список ID команд обязателен'
            });
            return;
        }
        await this.gameService.addTeamsToGame(id, teamIds, organizationId);
        res.json({
            success: true,
            message: 'Команды добавлены в игру успешно'
        });
    });
    removeTeamsFromGame = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { teamIds } = req.body;
        if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
            res.status(400).json({
                success: false,
                error: 'BadRequestError',
                message: 'Список ID команд обязателен'
            });
            return;
        }
        await this.gameService.removeTeamsFromGame(id, teamIds);
        res.json({
            success: true,
            message: 'Команды удалены из игры успешно'
        });
    });
    getGameTeams = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const teams = await this.gameService.getGameTeams(id);
        res.json({
            success: true,
            message: 'Команды игры получены успешно',
            data: teams
        });
    });
}
exports.GameController = GameController;
//# sourceMappingURL=game.controller.js.map