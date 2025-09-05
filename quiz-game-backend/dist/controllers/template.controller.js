"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateController = void 0;
const template_service_1 = require("../services/template.service");
const async_handler_util_1 = require("../utils/async-handler.util");
class TemplateController {
    templateService;
    constructor() {
        this.templateService = new template_service_1.TemplateService();
    }
    getTemplates = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const query = {
            page: parseInt(req.query['page']) || 1,
            limit: parseInt(req.query['limit']) || 10,
            search: req.query['search'],
            sortBy: req.query['sortBy'] || 'createdAt',
            sortOrder: req.query['sortOrder'] || 'DESC'
        };
        const result = await this.templateService.getTemplates(query);
        res.json({
            success: true,
            message: 'Шаблоны получены успешно',
            data: result.templates,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: result.itemsPerPage
            }
        });
    });
    getTemplateById = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID шаблона обязателен'
            });
            return;
        }
        const template = await this.templateService.getTemplateById(id);
        if (!template) {
            res.status(404).json({
                success: false,
                error: 'TemplateNotFoundError',
                message: 'Шаблон не найден'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Шаблон получен успешно',
            data: template
        });
    });
    createTemplate = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const createData = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'UnauthorizedError',
                message: 'Пользователь не аутентифицирован'
            });
            return;
        }
        const template = await this.templateService.createTemplate(createData, userId.toString());
        res.status(201).json({
            success: true,
            message: 'Шаблон создан успешно',
            data: template
        });
    });
    updateTemplate = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
        const userId = req.user?.userId;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID шаблона обязателен'
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
        const template = await this.templateService.updateTemplate(id, updateData, userId.toString());
        if (!template) {
            res.status(404).json({
                success: false,
                error: 'TemplateNotFoundError',
                message: 'Шаблон не найден'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Шаблон обновлен успешно',
            data: template
        });
    });
    deleteTemplate = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!id) {
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'ID шаблона обязателен'
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
        const deleted = await this.templateService.deleteTemplate(id, userId.toString());
        if (!deleted) {
            res.status(404).json({
                success: false,
                error: 'TemplateNotFoundError',
                message: 'Шаблон не найден'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Шаблон удален успешно'
        });
    });
    searchTemplates = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
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
        const result = await this.templateService.searchTemplates(query);
        res.json({
            success: true,
            message: 'Поиск выполнен успешно',
            data: result.templates,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: result.itemsPerPage
            }
        });
    });
    getTemplateStats = (0, async_handler_util_1.asyncHandler)(async (req, res) => {
        const stats = await this.templateService.getTemplateStats();
        res.json({
            success: true,
            message: 'Статистика получена успешно',
            data: stats
        });
    });
}
exports.TemplateController = TemplateController;
//# sourceMappingURL=template.controller.js.map