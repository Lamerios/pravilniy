"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreController = exports.ScoreController = void 0;
const score_service_1 = require("../services/score.service");
class ScoreController {
    async createScore(req, res) {
        try {
            const scoreData = req.body;
            const enteredBy = req.user?.userId;
            const score = await score_service_1.scoreService.createScore(scoreData, enteredBy);
            res.status(201).json({
                success: true,
                data: score,
                message: 'Баллы успешно добавлены'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка создания баллов'
            });
        }
    }
    async updateScore(req, res) {
        try {
            const { id } = req.params;
            const scoreData = req.body;
            const score = await score_service_1.scoreService.updateScore(parseInt(id), scoreData);
            if (!score) {
                res.status(404).json({
                    success: false,
                    message: 'Запись о баллах не найдена'
                });
                return;
            }
            res.json({
                success: true,
                data: score,
                message: 'Баллы успешно обновлены'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка обновления баллов'
            });
        }
    }
    async getScoreById(req, res) {
        try {
            const { id } = req.params;
            const score = await score_service_1.scoreService.getScoreById(parseInt(id));
            if (!score) {
                res.status(404).json({
                    success: false,
                    message: 'Запись о баллах не найдена'
                });
                return;
            }
            res.json({
                success: true,
                data: score,
                message: 'Баллы успешно получены'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка получения баллов'
            });
        }
    }
    async getScores(req, res) {
        try {
            const query = {
                page: req.query['page'] ? parseInt(req.query['page']) : undefined,
                limit: req.query['limit'] ? parseInt(req.query['limit']) : undefined,
                sortBy: req.query['sortBy'],
                sortOrder: req.query['sortOrder'],
                gameId: req.query['gameId'] ? parseInt(req.query['gameId']) : undefined,
                teamId: req.query['teamId'] ? parseInt(req.query['teamId']) : undefined,
                roundId: req.query['roundId'] ? parseInt(req.query['roundId']) : undefined
            };
            const result = await score_service_1.scoreService.getScores(query);
            res.json({
                success: true,
                data: result,
                message: 'Баллы успешно получены'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка получения баллов'
            });
        }
    }
    async getTeamScores(req, res) {
        try {
            const { gameId, teamId } = req.params;
            const scores = await score_service_1.scoreService.getTeamScores(parseInt(gameId), parseInt(teamId));
            res.json({
                success: true,
                data: scores,
                message: 'Баллы команды успешно получены'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка получения баллов команды'
            });
        }
    }
    async getTeamScoreStats(req, res) {
        try {
            const { gameId, teamId } = req.params;
            const stats = await score_service_1.scoreService.getTeamScoreStats(parseInt(gameId), parseInt(teamId));
            res.json({
                success: true,
                data: stats,
                message: 'Статистика баллов команды успешно получена'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка получения статистики команды'
            });
        }
    }
    async getGameScoreStats(req, res) {
        try {
            const { gameId } = req.params;
            const stats = await score_service_1.scoreService.getGameScoreStats(parseInt(gameId));
            res.json({
                success: true,
                data: stats,
                message: 'Статистика баллов игры успешно получена'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка получения статистики игры'
            });
        }
    }
    async bulkCreateScores(req, res) {
        try {
            const bulkData = req.body;
            const enteredBy = req.user?.userId;
            const result = await score_service_1.scoreService.bulkCreateScores(bulkData, enteredBy);
            res.status(201).json({
                success: true,
                data: result,
                message: `Массовый ввод завершен. Создано: ${result.created}, ошибок: ${result.errors.length}`
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка массового ввода баллов'
            });
        }
    }
    async correctScore(req, res) {
        try {
            const { id } = req.params;
            const correctionData = {
                ...req.body,
                scoreId: parseInt(id),
                correctedBy: req.user?.userId
            };
            const score = await score_service_1.scoreService.correctScore(correctionData);
            res.json({
                success: true,
                data: score,
                message: 'Баллы успешно исправлены'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка исправления баллов'
            });
        }
    }
    async getScoreCorrectionHistory(req, res) {
        try {
            const { id } = req.params;
            const history = await score_service_1.scoreService.getScoreCorrectionHistory(parseInt(id));
            res.json({
                success: true,
                data: history,
                message: 'История исправлений успешно получена'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка получения истории исправлений'
            });
        }
    }
    async deleteScore(req, res) {
        try {
            const { id } = req.params;
            const success = await score_service_1.scoreService.deleteScore(parseInt(id));
            if (!success) {
                res.status(404).json({
                    success: false,
                    message: 'Запись о баллах не найдена'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Баллы успешно удалены'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка удаления баллов'
            });
        }
    }
}
exports.ScoreController = ScoreController;
exports.scoreController = new ScoreController();
//# sourceMappingURL=score.controller.js.map