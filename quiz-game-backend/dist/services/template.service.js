"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const sequelize_1 = require("sequelize");
const game_template_model_1 = require("../models/game-template.model");
const user_model_1 = require("../models/user.model");
const logger_util_1 = require("../utils/logger.util");
class TemplateService {
    async getTemplates(query) {
        try {
            const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC', isPublic, tags, difficulty } = query;
            const offset = (page - 1) * limit;
            const where = {};
            if (search) {
                where[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { description: { [sequelize_1.Op.iLike]: `%${search}%` } }
                ];
            }
            if (tags && tags.length > 0) {
                where.tags = { [sequelize_1.Op.contains]: tags };
            }
            if (difficulty) {
                where['settings.difficulty'] = difficulty;
            }
            const { count, rows } = await game_template_model_1.GameTemplate.findAndCountAll({
                where,
                include: [
                    {
                        model: user_model_1.User,
                        as: 'creator',
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
                templates: rows,
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit
            };
        }
        catch (error) {
            logger_util_1.logger.error('Error getting templates:', error);
            throw new Error('Ошибка получения шаблонов');
        }
    }
    async getTemplateById(id) {
        try {
            const template = await game_template_model_1.GameTemplate.findByPk(id, {
                include: [
                    {
                        model: user_model_1.User,
                        as: 'creator',
                        attributes: ['id', 'username', 'email']
                    }
                ]
            });
            return template;
        }
        catch (error) {
            logger_util_1.logger.error('Error getting template by ID:', error);
            throw new Error('Ошибка получения шаблона');
        }
    }
    async createTemplate(createData, userId) {
        try {
            const validation = this.validateTemplateData(createData);
            if (!validation.isValid) {
                throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
            }
            const template = await game_template_model_1.GameTemplate.create({
                name: createData.name,
                description: createData.description,
                roundsCount: createData.settings.rounds,
                questionsPerRound: createData.settings.questionsPerRound,
                timePerQuestion: createData.settings.timePerQuestion,
                settings: createData.settings,
                organizationId: 1
            });
            logger_util_1.logger.info(`Template created: ${template.id} by user: ${userId}`);
            return template;
        }
        catch (error) {
            logger_util_1.logger.error('Error creating template:', error);
            throw new Error('Ошибка создания шаблона');
        }
    }
    async updateTemplate(id, updateData, userId) {
        try {
            const template = await game_template_model_1.GameTemplate.findByPk(id);
            if (!template) {
                return null;
            }
            if (updateData.settings) {
                const validation = this.validateTemplateSettings(updateData.settings);
                if (!validation.isValid) {
                    throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
                }
            }
            await template.update(updateData);
            logger_util_1.logger.info(`Template updated: ${id} by user: ${userId}`);
            return template;
        }
        catch (error) {
            logger_util_1.logger.error('Error updating template:', error);
            throw new Error('Ошибка обновления шаблона');
        }
    }
    async deleteTemplate(id, userId) {
        try {
            const template = await game_template_model_1.GameTemplate.findByPk(id);
            if (!template) {
                return false;
            }
            await template.destroy();
            logger_util_1.logger.info(`Template deleted: ${id} by user: ${userId}`);
            return true;
        }
        catch (error) {
            logger_util_1.logger.error('Error deleting template:', error);
            throw new Error('Ошибка удаления шаблона');
        }
    }
    async searchTemplates(query) {
        try {
            const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
            const offset = (page - 1) * limit;
            const where = {};
            if (search) {
                where[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { description: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { tags: { [sequelize_1.Op.contains]: [search] } }
                ];
            }
            const { count, rows } = await game_template_model_1.GameTemplate.findAndCountAll({
                where,
                include: [
                    {
                        model: user_model_1.User,
                        as: 'creator',
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
                templates: rows,
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit
            };
        }
        catch (error) {
            logger_util_1.logger.error('Error searching templates:', error);
            throw new Error('Ошибка поиска шаблонов');
        }
    }
    async getTemplateStats() {
        try {
            const totalTemplates = await game_template_model_1.GameTemplate.count();
            const publicTemplates = 0;
            const privateTemplates = totalTemplates - publicTemplates;
            const mostUsedTemplates = [];
            const recentTemplates = await game_template_model_1.GameTemplate.findAll({
                order: [['createdAt', 'DESC']],
                limit: 5,
                attributes: ['id', 'name', 'createdAt']
            });
            return {
                totalTemplates,
                publicTemplates,
                privateTemplates,
                mostUsedTemplates,
                recentTemplates: recentTemplates.map(t => ({
                    id: t.id.toString(),
                    name: t.name,
                    createdAt: t.createdAt
                }))
            };
        }
        catch (error) {
            logger_util_1.logger.error('Error getting template stats:', error);
            throw new Error('Ошибка получения статистики');
        }
    }
    validateTemplateData(data) {
        const errors = [];
        if (!data.name || data.name.trim().length === 0) {
            errors.push('Название шаблона обязательно');
        }
        if (data.name && data.name.length > 100) {
            errors.push('Название шаблона не должно превышать 100 символов');
        }
        if (data.description && data.description.length > 500) {
            errors.push('Описание не должно превышать 500 символов');
        }
        if (!data.settings) {
            errors.push('Настройки шаблона обязательны');
        }
        else {
            const settingsValidation = this.validateTemplateSettings(data.settings);
            if (!settingsValidation.isValid) {
                errors.push(...settingsValidation.errors);
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateTemplateSettings(settings) {
        const errors = [];
        if (settings.rounds && (settings.rounds < 1 || settings.rounds > 20)) {
            errors.push('Количество раундов должно быть от 1 до 20');
        }
        if (settings.questionsPerRound && (settings.questionsPerRound < 1 || settings.questionsPerRound > 50)) {
            errors.push('Количество вопросов в раунде должно быть от 1 до 50');
        }
        if (settings.timePerQuestion && (settings.timePerQuestion < 10 || settings.timePerQuestion > 300)) {
            errors.push('Время на вопрос должно быть от 10 до 300 секунд');
        }
        if (settings.scoringSystem && !['standard', 'bonus', 'penalty'].includes(settings.scoringSystem)) {
            errors.push('Неверная система подсчета очков');
        }
        if (settings.bonusPoints && (settings.bonusPoints < 0 || settings.bonusPoints > 100)) {
            errors.push('Бонусные очки должны быть от 0 до 100');
        }
        if (settings.penaltyPoints && (settings.penaltyPoints < 0 || settings.penaltyPoints > 100)) {
            errors.push('Штрафные очки должны быть от 0 до 100');
        }
        if (settings.difficulty && !['easy', 'medium', 'hard'].includes(settings.difficulty)) {
            errors.push('Неверный уровень сложности');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.TemplateService = TemplateService;
//# sourceMappingURL=template.service.js.map