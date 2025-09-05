"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const user_model_1 = require("../models/user.model");
const router = (0, express_1.Router)();
router.get('/profile', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({
            success: false,
            error: 'UnauthorizedError',
            message: 'Пользователь не аутентифицирован'
        });
        return;
    }
    res.json({
        success: true,
        message: 'Профиль пользователя получен',
        data: {
            user: {
                id: user.userId,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            }
        }
    });
}));
router.get('/admin', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, auth_middleware_1.requireAdmin, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        message: 'Добро пожаловать в административную панель',
        data: {
            adminInfo: {
                message: 'Вы имеете доступ к административным функциям',
                timestamp: new Date().toISOString()
            }
        }
    });
}));
router.get('/stats', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const stats = {
        totalUsers: 150,
        activeGames: 5,
        totalOrganizations: 10,
        lastUpdated: new Date().toISOString()
    };
    res.json({
        success: true,
        message: 'Статистика системы получена',
        data: { stats }
    });
}));
router.post('/test', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({
            success: false,
            error: 'UnauthorizedError',
            message: 'Пользователь не аутентифицирован'
        });
        return;
    }
    res.json({
        success: true,
        message: 'Тестовый запрос выполнен успешно',
        data: {
            user: user,
            requestBody: req.body,
            timestamp: new Date().toISOString()
        }
    });
}));
router.get('/owner-only', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, auth_middleware_1.requireOwner, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        message: 'Доступ разрешен только владельцам',
        data: {
            role: 'OWNER',
            timestamp: new Date().toISOString()
        }
    });
}));
router.get('/moderator-or-above', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, auth_middleware_1.requireModeratorOrAbove, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        message: 'Доступ разрешен модераторам и выше',
        data: {
            userRole: req.user?.role,
            allowedRoles: ['ADMIN', 'OWNER', 'MODERATOR'],
            timestamp: new Date().toISOString()
        }
    });
}));
router.get('/owner-or-admin', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, auth_middleware_1.requireOwnerOrAdmin, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    res.json({
        success: true,
        message: 'Доступ разрешен владельцам и администраторам',
        data: {
            userRole: req.user?.role,
            allowedRoles: ['ADMIN', 'OWNER'],
            timestamp: new Date().toISOString()
        }
    });
}));
router.get('/role/:role', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const requestedRole = req.params['role'];
    if (!Object.values(user_model_1.UserRole).includes(requestedRole)) {
        res.status(400).json({
            success: false,
            error: 'InvalidRoleError',
            message: 'Неверная роль'
        });
        return;
    }
    if (req.user?.role !== requestedRole) {
        res.status(403).json({
            success: false,
            error: 'InsufficientPermissionsError',
            message: `Требуется роль: ${requestedRole}`
        });
        return;
    }
    res.json({
        success: true,
        message: `Доступ разрешен для роли: ${requestedRole}`,
        data: {
            userRole: req.user.role,
            requestedRole: requestedRole,
            timestamp: new Date().toISOString()
        }
    });
}));
router.get('/roles-info', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({
            success: false,
            error: 'UnauthorizedError',
            message: 'Пользователь не аутентифицирован'
        });
        return;
    }
    const roleInfo = {
        currentRole: user.role,
        availableRoles: Object.values(user_model_1.UserRole),
        permissions: {
            canAccessAdmin: [user_model_1.UserRole.ADMIN].includes(user.role),
            canAccessOwner: [user_model_1.UserRole.OWNER].includes(user.role),
            canAccessModerator: [user_model_1.UserRole.ADMIN, user_model_1.UserRole.OWNER, user_model_1.UserRole.MODERATOR].includes(user.role),
            canAccessOwnerOrAdmin: [user_model_1.UserRole.ADMIN, user_model_1.UserRole.OWNER].includes(user.role)
        }
    };
    res.json({
        success: true,
        message: 'Информация о ролях получена',
        data: roleInfo
    });
}));
exports.default = router;
//# sourceMappingURL=protected.routes.js.map