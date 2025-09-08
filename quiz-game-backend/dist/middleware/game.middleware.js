"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRemoveTeamsFromGame = exports.validateAddTeamsToGame = exports.validateGameStateChange = exports.validateGameQuery = exports.validateUpdateGame = exports.validateCreateGame = void 0;
const validation_middleware_1 = require("./validation.middleware");
exports.validateCreateGame = (0, validation_middleware_1.createValidationMiddleware)(validation_middleware_1.gameValidationSchemas.createGame);
exports.validateUpdateGame = (0, validation_middleware_1.createValidationMiddleware)(validation_middleware_1.gameValidationSchemas.updateGame);
exports.validateGameQuery = (0, validation_middleware_1.createQueryValidationMiddleware)(validation_middleware_1.gameValidationSchemas.gameQuery);
const validateGameStateChange = (req, res, next) => {
    const errors = [];
    const allowedActions = ['start', 'pause', 'resume', 'stop', 'finish'];
    const action = req.body.action;
    if (!action) {
        errors.push('Действие обязательно');
    }
    else if (!allowedActions.includes(action)) {
        errors.push(`Действие должно быть одним из: ${allowedActions.join(', ')}`);
    }
    if (req.body.reason && typeof req.body.reason !== 'string') {
        errors.push('Причина должна быть строкой');
    }
    if (req.body.reason && req.body.reason.length > 200) {
        errors.push('Причина не должна превышать 200 символов');
    }
    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            error: 'ValidationError',
            message: 'Ошибка валидации данных',
            details: errors
        });
        return;
    }
    next();
};
exports.validateGameStateChange = validateGameStateChange;
const validateAddTeamsToGame = (req, res, next) => {
    const errors = [];
    const { teamIds } = req.body;
    if (!teamIds) {
        errors.push('Список ID команд обязателен');
    }
    else if (!Array.isArray(teamIds)) {
        errors.push('teamIds должен быть массивом');
    }
    else if (teamIds.length === 0) {
        errors.push('Список команд не может быть пустым');
    }
    else if (teamIds.length > 20) {
        errors.push('Максимум 20 команд за раз');
    }
    else {
        for (let i = 0; i < teamIds.length; i++) {
            if (typeof teamIds[i] !== 'string' || teamIds[i].trim() === '') {
                errors.push(`ID команды ${i + 1} должен быть непустой строкой`);
            }
        }
    }
    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            error: 'ValidationError',
            message: 'Ошибка валидации данных',
            details: errors
        });
        return;
    }
    next();
};
exports.validateAddTeamsToGame = validateAddTeamsToGame;
const validateRemoveTeamsFromGame = (req, res, next) => {
    const errors = [];
    const { teamIds } = req.body;
    if (!teamIds) {
        errors.push('Список ID команд обязателен');
    }
    else if (!Array.isArray(teamIds)) {
        errors.push('teamIds должен быть массивом');
    }
    else if (teamIds.length === 0) {
        errors.push('Список команд не может быть пустым');
    }
    else {
        for (let i = 0; i < teamIds.length; i++) {
            if (typeof teamIds[i] !== 'string' || teamIds[i].trim() === '') {
                errors.push(`ID команды ${i + 1} должен быть непустой строкой`);
            }
        }
    }
    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            error: 'ValidationError',
            message: 'Ошибка валидации данных',
            details: errors
        });
        return;
    }
    next();
};
exports.validateRemoveTeamsFromGame = validateRemoveTeamsFromGame;
//# sourceMappingURL=game.middleware.js.map