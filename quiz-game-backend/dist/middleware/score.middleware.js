"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRoundScoresParams = exports.validateGameScoresQuery = exports.checkScoreAccess = exports.validateScoreQuery = exports.validateCorrectScore = exports.validateBulkScore = exports.validateUpdateScore = exports.validateCreateScore = void 0;
const zod_1 = require("zod");
const createScoreSchema = zod_1.z.object({
    gameId: zod_1.z.number().int().positive('ID игры должен быть положительным числом'),
    teamId: zod_1.z.number().int().positive('ID команды должен быть положительным числом'),
    roundId: zod_1.z.number().int().positive('ID раунда должен быть положительным числом'),
    points: zod_1.z.number().int('Баллы должны быть целым числом'),
    bet: zod_1.z.number().min(0, 'Ставка не может быть отрицательной').optional(),
    betType: zod_1.z.enum(['MULTIPLIER', 'BONUS', 'FIXED']).optional(),
    minBet: zod_1.z.number().min(0, 'Минимальная ставка не может быть отрицательной').optional(),
    maxBet: zod_1.z.number().min(0, 'Максимальная ставка не может быть отрицательной').optional(),
    notes: zod_1.z.string().max(500, 'Заметки не могут превышать 500 символов').optional()
}).refine(data => {
    if (data.minBet !== undefined && data.maxBet !== undefined) {
        return data.minBet <= data.maxBet;
    }
    return true;
}, {
    message: 'Минимальная ставка должна быть меньше или равна максимальной'
}).refine(data => {
    if (data.bet !== undefined && data.betType) {
        switch (data.betType) {
            case 'MULTIPLIER':
                return data.bet >= 0.1 && data.bet <= 10;
            case 'BONUS':
                return data.bet >= -100 && data.bet <= 100;
            case 'FIXED':
                return data.bet >= 0 && data.bet <= 1000;
            default:
                return true;
        }
    }
    return true;
}, {
    message: 'Ставка не соответствует выбранному типу',
    path: ['bet']
});
const updateScoreSchema = zod_1.z.object({
    points: zod_1.z.number().int('Баллы должны быть целым числом').optional(),
    bet: zod_1.z.number().min(0, 'Ставка не может быть отрицательной').optional(),
    betType: zod_1.z.enum(['MULTIPLIER', 'BONUS', 'FIXED']).optional(),
    minBet: zod_1.z.number().min(0, 'Минимальная ставка не может быть отрицательной').optional(),
    maxBet: zod_1.z.number().min(0, 'Максимальная ставка не может быть отрицательной').optional(),
    notes: zod_1.z.string().max(500, 'Заметки не могут превышать 500 символов').optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Необходимо указать хотя бы одно поле для обновления'
}).refine(data => {
    if (data.minBet !== undefined && data.maxBet !== undefined) {
        return data.minBet <= data.maxBet;
    }
    return true;
}, {
    message: 'Минимальная ставка должна быть меньше или равна максимальной'
});
const bulkScoreSchema = zod_1.z.object({
    gameId: zod_1.z.number().int().positive('ID игры должен быть положительным числом'),
    roundId: zod_1.z.number().int().positive('ID раунда должен быть положительным числом'),
    scores: zod_1.z.array(zod_1.z.object({
        teamId: zod_1.z.number().int().positive('ID команды должен быть положительным числом'),
        points: zod_1.z.number().int('Баллы должны быть целым числом'),
        bet: zod_1.z.number().min(0, 'Ставка не может быть отрицательной').optional(),
        betType: zod_1.z.enum(['MULTIPLIER', 'BONUS', 'FIXED']).optional(),
        minBet: zod_1.z.number().min(0, 'Минимальная ставка не может быть отрицательной').optional(),
        maxBet: zod_1.z.number().min(0, 'Максимальная ставка не может быть отрицательной').optional(),
        notes: zod_1.z.string().max(500, 'Заметки не могут превышать 500 символов').optional()
    })).min(1, 'Необходимо указать хотя бы одну команду')
});
const correctScoreSchema = zod_1.z.object({
    newPoints: zod_1.z.number().int('Новые баллы должны быть целым числом'),
    reason: zod_1.z.string().min(1, 'Необходимо указать причину исправления').max(500, 'Причина не может превышать 500 символов')
});
const scoreQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val) : undefined),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val) : undefined),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['ASC', 'DESC']).optional(),
    gameId: zod_1.z.string().optional().transform(val => val ? parseInt(val) : undefined),
    teamId: zod_1.z.string().optional().transform(val => val ? parseInt(val) : undefined),
    roundId: zod_1.z.string().optional().transform(val => val ? parseInt(val) : undefined)
});
const validateCreateScore = (req, res, next) => {
    try {
        const body = {
            ...req.body,
            gameId: req.body.gameId ? parseInt(req.body.gameId) : undefined,
            teamId: req.body.teamId ? parseInt(req.body.teamId) : undefined,
            roundId: req.body.roundId ? parseInt(req.body.roundId) : undefined,
            points: req.body.points ? parseInt(req.body.points) : undefined,
            bet: req.body.bet ? parseInt(req.body.bet) : undefined
        };
        const validatedData = createScoreSchema.parse(body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Ошибка валидации данных',
                errors: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }
};
exports.validateCreateScore = validateCreateScore;
const validateUpdateScore = (req, res, next) => {
    try {
        const body = {
            ...req.body,
            points: req.body.points ? parseInt(req.body.points) : undefined,
            bet: req.body.bet ? parseInt(req.body.bet) : undefined
        };
        const validatedData = updateScoreSchema.parse(body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Ошибка валидации данных',
                errors: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }
};
exports.validateUpdateScore = validateUpdateScore;
const validateBulkScore = (req, res, next) => {
    try {
        const body = {
            ...req.body,
            gameId: req.body.gameId ? parseInt(req.body.gameId) : undefined,
            roundId: req.body.roundId ? parseInt(req.body.roundId) : undefined,
            scores: req.body.scores?.map((score) => ({
                ...score,
                teamId: score.teamId ? parseInt(score.teamId) : undefined,
                points: score.points ? parseInt(score.points) : undefined,
                bet: score.bet ? parseInt(score.bet) : undefined
            }))
        };
        const validatedData = bulkScoreSchema.parse(body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Ошибка валидации данных',
                errors: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }
};
exports.validateBulkScore = validateBulkScore;
const validateCorrectScore = (req, res, next) => {
    try {
        const body = {
            ...req.body,
            newPoints: req.body.newPoints ? parseInt(req.body.newPoints) : undefined
        };
        const validatedData = correctScoreSchema.parse(body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Ошибка валидации данных',
                errors: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }
};
exports.validateCorrectScore = validateCorrectScore;
const validateScoreQuery = (req, res, next) => {
    try {
        const validatedData = scoreQuerySchema.parse(req.query);
        req.query = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Ошибка валидации параметров запроса',
                errors: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Внутренняя ошибка сервера'
            });
        }
    }
};
exports.validateScoreQuery = validateScoreQuery;
const checkScoreAccess = (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Необходима аутентификация'
            });
            return;
        }
        if (!['admin', 'manager', 'user'].includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Недостаточно прав для доступа к баллам'
            });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};
exports.checkScoreAccess = checkScoreAccess;
const validateGameScoresQuery = (req, res, next) => {
    try {
        const gameId = parseInt(req.params['gameId']);
        if (isNaN(gameId) || gameId <= 0) {
            res.status(400).json({
                success: false,
                message: 'ID игры должен быть положительным числом',
                errors: [{ field: 'gameId', message: 'Неверный формат ID игры' }]
            });
            return;
        }
        const querySchema = zod_1.z.object({
            teamId: zod_1.z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0).optional(),
            roundId: zod_1.z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0).optional(),
            page: zod_1.z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0).optional(),
            limit: zod_1.z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0 && val <= 100).optional(),
            sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'points', 'totalPoints', 'teamId', 'roundId']).optional(),
            sortOrder: zod_1.z.enum(['ASC', 'DESC']).optional()
        });
        querySchema.parse(req.query);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Ошибка валидации параметров запроса',
                errors: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Ошибка валидации'
        });
    }
};
exports.validateGameScoresQuery = validateGameScoresQuery;
const validateRoundScoresParams = (req, res, next) => {
    try {
        const gameId = parseInt(req.params['gameId']);
        const roundId = parseInt(req.params['roundId']);
        if (isNaN(gameId) || gameId <= 0) {
            res.status(400).json({
                success: false,
                message: 'ID игры должен быть положительным числом'
            });
            return;
        }
        if (isNaN(roundId) || roundId <= 0) {
            res.status(400).json({
                success: false,
                message: 'ID раунда должен быть положительным числом'
            });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка валидации параметров'
        });
    }
};
exports.validateRoundScoresParams = validateRoundScoresParams;
//# sourceMappingURL=score.middleware.js.map