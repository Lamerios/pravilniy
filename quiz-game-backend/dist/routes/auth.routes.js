"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.use(auth_middleware_1.authLogger);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, authController.getCurrentUser);
router.get('/validate', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, authController.validateToken);
router.post('/change-password', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, authController.changePassword);
router.post('/logout', auth_middleware_1.authenticateToken, authController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map