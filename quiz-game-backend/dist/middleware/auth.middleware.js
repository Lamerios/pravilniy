"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLogger = exports.requireOwnerOrAdmin = exports.requireModeratorOrAbove = exports.requireOwner = exports.requireActiveUser = exports.optionalAuth = exports.requireResourceAccess = exports.requireOrganizationAccess = exports.requireAdminOrModerator = exports.requireAdmin = exports.requireAnyRole = exports.requireRole = exports.authenticateToken = void 0;
const user_model_1 = require("../models/user.model");
const jwt_util_1 = require("../utils/jwt.util");
const authenticateToken = async (req, res, next) => {
    try {
        const token = (0, jwt_util_1.extractTokenFromHeader)(req.headers.authorization);
        if (!token) {
            res.status(401).json({
                error: 'Access token required',
                message: 'Требуется токен доступа'
            });
            return;
        }
        const payload = (0, jwt_util_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Token has expired') {
                res.status(401).json({
                    error: 'Token expired',
                    message: 'Токен истек'
                });
                return;
            }
            else if (error.message === 'Invalid token') {
                res.status(403).json({
                    error: 'Invalid token',
                    message: 'Недействительный токен'
                });
                return;
            }
        }
        res.status(403).json({
            error: 'Token verification failed',
            message: 'Ошибка проверки токена'
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: 'Authentication required',
                message: 'Требуется аутентификация'
            });
            return;
        }
        if (req.user.role !== requiredRole) {
            res.status(403).json({
                error: 'Insufficient permissions',
                message: `Требуется роль: ${requiredRole}`
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireAnyRole = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: 'Authentication required',
                message: 'Требуется аутентификация'
            });
            return;
        }
        if (!requiredRoles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Insufficient permissions',
                message: `Требуется одна из ролей: ${requiredRoles.join(', ')}`
            });
            return;
        }
        next();
    };
};
exports.requireAnyRole = requireAnyRole;
exports.requireAdmin = (0, exports.requireRole)(user_model_1.UserRole.ADMIN);
exports.requireAdminOrModerator = (0, exports.requireAnyRole)([user_model_1.UserRole.ADMIN, user_model_1.UserRole.MODERATOR]);
const requireOrganizationAccess = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            error: 'Authentication required',
            message: 'Требуется аутентификация'
        });
        return;
    }
    if (req.user.role === user_model_1.UserRole.ADMIN) {
        next();
        return;
    }
    const organizationId = req.params['organizationId'] || req.body['organizationId'];
    if (!organizationId) {
        res.status(400).json({
            error: 'Organization ID required',
            message: 'Требуется ID организации'
        });
        return;
    }
    if (req.user.organizationId !== parseInt(organizationId)) {
        res.status(403).json({
            error: 'Access denied to organization',
            message: 'Нет доступа к данной организации'
        });
        return;
    }
    next();
};
exports.requireOrganizationAccess = requireOrganizationAccess;
const requireResourceAccess = (resourceUserIdField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: 'Authentication required',
                message: 'Требуется аутентификация'
            });
            return;
        }
        if (req.user.role === user_model_1.UserRole.ADMIN) {
            next();
            return;
        }
        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
        if (!resourceUserId) {
            res.status(400).json({
                error: 'Resource user ID required',
                message: 'Требуется ID пользователя ресурса'
            });
            return;
        }
        if (req.user.userId !== parseInt(resourceUserId)) {
            res.status(403).json({
                error: 'Access denied to resource',
                message: 'Нет доступа к данному ресурсу'
            });
            return;
        }
        next();
    };
};
exports.requireResourceAccess = requireResourceAccess;
const optionalAuth = async (req, res, next) => {
    try {
        const token = (0, jwt_util_1.extractTokenFromHeader)(req.headers.authorization);
        if (token) {
            const payload = (0, jwt_util_1.verifyToken)(token);
            req.user = payload;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireActiveUser = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            error: 'Authentication required',
            message: 'Требуется аутентификация'
        });
        return;
    }
    next();
};
exports.requireActiveUser = requireActiveUser;
const requireOwner = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            error: 'Authentication required',
            message: 'Требуется аутентификация'
        });
        return;
    }
    if (req.user.role !== user_model_1.UserRole.OWNER) {
        res.status(403).json({
            error: 'Owner access required',
            message: 'Требуется роль владельца'
        });
        return;
    }
    next();
};
exports.requireOwner = requireOwner;
const requireModeratorOrAbove = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            error: 'Authentication required',
            message: 'Требуется аутентификация'
        });
        return;
    }
    const allowedRoles = [user_model_1.UserRole.ADMIN, user_model_1.UserRole.OWNER, user_model_1.UserRole.MODERATOR];
    if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
            error: 'Moderator access required',
            message: 'Требуется роль модератора или выше'
        });
        return;
    }
    next();
};
exports.requireModeratorOrAbove = requireModeratorOrAbove;
const requireOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            error: 'Authentication required',
            message: 'Требуется аутентификация'
        });
        return;
    }
    const allowedRoles = [user_model_1.UserRole.ADMIN, user_model_1.UserRole.OWNER];
    if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
            error: 'Owner or Admin access required',
            message: 'Требуется роль владельца или администратора'
        });
        return;
    }
    next();
};
exports.requireOwnerOrAdmin = requireOwnerOrAdmin;
const authLogger = (req, res, next) => {
    const startTime = Date.now();
    console.log(`[AUTH] ${req.method} ${req.path} - User: ${req.user?.userId || 'Anonymous'}`);
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;
        console.log(`[AUTH] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
        return originalSend.call(this, data);
    };
    next();
};
exports.authLogger = authLogger;
//# sourceMappingURL=auth.middleware.js.map