"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkScoreAccess = exports.validateScoreQuery = exports.validateCorrectScore = exports.validateBulkScore = exports.validateUpdateScore = exports.validateCreateScore = void 0;
const zod_1 = require("zod");
const createScoreSchema = zod_1.z.object({
    gameId: zod_1.z.number().int().positive('ID игры должен быть положительным числом'),
    teamId: zod_1.z.number().int().positive('ID команды должен быть положительным числом'),
    roundId: zod_1.z.number().int().positive('ID раунда должен быть положительным числом'),
    points: zod_1.z.number().int().min(0, 'Баллы не могут быть отрицательными'),
    bet: zod_1.z.number().int().min(0, 'Ставка не может быть отрицательной').optional(),
    notes: zod_1.z.string().max(500, 'Заметки не могут превышать 500 символов').optional()
});
const updateScoreSchema = zod_1.z.object({
    points: zod_1.z.number().int().min(0, 'Баллы не могут быть отрицательными').optional(),
    bet: zod_1.z.number().int().min(0, 'Ставка не может быть отрицательной').optional(),
    notes: zod_1.z.string().max(500, 'Заметки не могут превышать 500 символов').optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'Необходимо указать хотя бы одно поле для обновления'
});
const bulkScoreSchema = zod_1.z.object({
    gameId: zod_1.z.number().int().positive('ID игры должен быть положительным числом'),
    roundId: zod_1.z.number().int().positive('ID раунда должен быть положительным числом'),
    scores: zod_1.z.array(zod_1.z.object({
        teamId: zod_1.z.number().int().positive('ID команды должен быть положительным числом'),
        points: zod_1.z.number().int().min(0, 'Баллы не могут быть отрицательными'),
        bet: zod_1.z.number().int().min(0, 'Ставка не может быть отрицательной').optional(),
        notes: zod_1.z.string().max(500, 'Заметки не могут превышать 500 символов').optional()
    })).min(1, 'Необходимо указать хотя бы одну команду')
});
const correctScoreSchema = zod_1.z.object({
    newPoints: zod_1.z.number().int().min(0, 'Баллы не могут быть отрицательными'),
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
//# sourceMappingURL=score.middleware.js.map