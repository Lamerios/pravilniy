"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_types_1 = require("../types/auth.types");
class AuthController {
    authService;
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    login = async (req, res) => {
        try {
            const credentials = req.body;
            const result = await this.authService.login(credentials);
            res.status(200).json({
                success: true,
                message: 'Успешная аутентификация',
                data: result
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    };
    register = async (req, res) => {
        try {
            const userData = req.body;
            const result = await this.authService.register(userData);
            res.status(201).json({
                success: true,
                message: 'Пользователь успешно зарегистрирован',
                data: result
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    };
    refreshToken = async (req, res) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    error: 'Refresh token required',
                    message: 'Требуется refresh токен'
                });
                return;
            }
            const result = await this.authService.refreshToken(refreshToken);
            res.status(200).json({
                success: true,
                message: 'Токен успешно обновлен',
                data: result
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    };
    changePassword = async (req, res) => {
        try {
            const passwordData = req.body;
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                    message: 'Требуется аутентификация'
                });
                return;
            }
            await this.authService.changePassword(req.user.userId, passwordData);
            res.status(200).json({
                success: true,
                message: 'Пароль успешно изменен'
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    };
    forgotPassword = async (req, res) => {
        try {
            const resetData = req.body;
            await this.authService.requestPasswordReset(resetData);
            res.status(200).json({
                success: true,
                message: 'Если пользователь с таким email существует, инструкции по сбросу пароля отправлены на почту'
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    };
    resetPassword = async (req, res) => {
        try {
            const resetData = req.body;
            await this.authService.setNewPassword(resetData);
            res.status(200).json({
                success: true,
                message: 'Пароль успешно сброшен'
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    };
    getCurrentUser = async (req, res) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required',
                    message: 'Требуется аутентификация'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Информация о пользователе получена',
                data: {
                    user: req.user
                }
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    };
    logout = async (req, res) => {
        try {
            res.status(200).json({
                success: true,
                message: 'Успешный выход из системы'
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    };
    validateToken = async (req, res) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid token',
                    message: 'Недействительный токен'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Токен действителен',
                data: {
                    user: req.user
                }
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    };
    handleError(error, res) {
        console.error('Auth Controller Error:', error);
        if (error instanceof auth_types_1.AuthError) {
            res.status(error.statusCode).json({
                success: false,
                error: error.name,
                message: error.message
            });
            return;
        }
        if (error instanceof auth_types_1.ValidationError) {
            res.status(400).json({
                success: false,
                error: error.name,
                message: error.message,
                field: error.field
            });
            return;
        }
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map((err) => err.message);
            res.status(400).json({
                success: false,
                error: 'ValidationError',
                message: 'Ошибка валидации данных',
                details: messages
            });
            return;
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(409).json({
                success: false,
                error: 'UniqueConstraintError',
                message: 'Пользователь с такими данными уже существует'
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'InternalServerError',
            message: 'Внутренняя ошибка сервера'
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map