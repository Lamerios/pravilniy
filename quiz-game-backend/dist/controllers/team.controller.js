"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamController = exports.TeamController = void 0;
const team_service_1 = require("../services/team.service");
class TeamController {
    async getTeams(req, res) {
        try {
            const query = {
                page: req.query['page'] ? parseInt(req.query['page']) : undefined,
                limit: req.query['limit'] ? parseInt(req.query['limit']) : undefined,
                search: req.query['search'],
                sortBy: req.query['sortBy'],
                sortOrder: req.query['sortOrder'],
                isActive: req.query['isActive'] ? req.query['isActive'] === 'true' : undefined,
                organizationId: req.query['organizationId'] ? parseInt(req.query['organizationId']) : undefined
            };
            const result = await team_service_1.teamService.getTeams(query);
            res.json({
                success: true,
                data: result,
                message: 'Команды успешно получены'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка получения команд'
            });
        }
    }
    async getTeamById(req, res) {
        try {
            const { id } = req.params;
            const team = await team_service_1.teamService.getTeamById(id);
            if (!team) {
                res.status(404).json({
                    success: false,
                    message: 'Команда не найдена'
                });
                return;
            }
            res.json({
                success: true,
                data: team,
                message: 'Команда успешно получена'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка получения команды'
            });
        }
    }
    async createTeam(req, res) {
        try {
            const teamData = req.body;
            const organizationId = req.user?.organizationId;
            if (!organizationId) {
                res.status(400).json({
                    success: false,
                    message: 'ID организации не указан'
                });
                return;
            }
            const team = await team_service_1.teamService.createTeam(teamData, organizationId);
            res.status(201).json({
                success: true,
                data: team,
                message: 'Команда успешно создана'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка создания команды'
            });
        }
    }
    async updateTeam(req, res) {
        try {
            const { id } = req.params;
            const teamData = req.body;
            const team = await team_service_1.teamService.updateTeam(id, teamData);
            if (!team) {
                res.status(404).json({
                    success: false,
                    message: 'Команда не найдена'
                });
                return;
            }
            res.json({
                success: true,
                data: team,
                message: 'Команда успешно обновлена'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка обновления команды'
            });
        }
    }
    async deleteTeam(req, res) {
        try {
            const { id } = req.params;
            const deleted = await team_service_1.teamService.deleteTeam(id);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Команда не найдена'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Команда успешно удалена'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка удаления команды'
            });
        }
    }
    async searchTeams(req, res) {
        try {
            const query = {
                search: req.query['q'],
                limit: req.query['limit'] ? parseInt(req.query['limit']) : undefined,
                organizationId: req.query['organizationId'] ? parseInt(req.query['organizationId']) : undefined,
                isActive: req.query['isActive'] ? req.query['isActive'] === 'true' : undefined
            };
            const result = await team_service_1.teamService.searchTeams(query);
            res.json({
                success: true,
                data: result,
                message: 'Поиск команд выполнен успешно'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка поиска команд'
            });
        }
    }
    async getTeamStats(req, res) {
        try {
            const organizationId = req.user?.organizationId;
            const stats = await team_service_1.teamService.getTeamStats(organizationId);
            res.json({
                success: true,
                data: stats,
                message: 'Статистика команд получена успешно'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка получения статистики команд'
            });
        }
    }
    async getTeamsByOrganization(req, res) {
        try {
            const { organizationId } = req.params;
            const isActive = req.query['isActive'] ? req.query['isActive'] === 'true' : undefined;
            const teams = await team_service_1.teamService.getTeamsByOrganization(organizationId, isActive);
            res.json({
                success: true,
                data: teams,
                message: 'Команды организации получены успешно'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка получения команд организации'
            });
        }
    }
    async checkTableNumber(req, res) {
        try {
            const { tableNumber } = req.params;
            const organizationId = req.user?.organizationId;
            const excludeId = req.query['excludeId'];
            if (!organizationId) {
                res.status(400).json({
                    success: false,
                    message: 'ID организации не указан'
                });
                return;
            }
            const isUnique = await team_service_1.teamService.isTableNumberUnique(organizationId, parseInt(tableNumber), excludeId);
            res.json({
                success: true,
                data: { isUnique },
                message: isUnique ? 'Номер стола свободен' : 'Номер стола уже занят'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ошибка проверки номера стола'
            });
        }
    }
}
exports.TeamController = TeamController;
exports.teamController = new TeamController();
//# sourceMappingURL=team.controller.js.map