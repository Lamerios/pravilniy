"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = exports.managerMiddleware = exports.adminMiddleware = exports.roleMiddleware = void 0;
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Пользователь не аутентифицирован'
            });
            return;
        }
        if (!user.role) {
            res.status(403).json({
                success: false,
                message: 'Роль пользователя не определена'
            });
            return;
        }
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({
                success: false,
                message: 'Недостаточно прав для выполнения операции'
            });
            return;
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
exports.adminMiddleware = (0, exports.roleMiddleware)(['admin']);
exports.managerMiddleware = (0, exports.roleMiddleware)(['admin', 'manager']);
exports.userMiddleware = (0, exports.roleMiddleware)(['admin', 'manager', 'user']);
//# sourceMappingURL=role.middleware.js.map