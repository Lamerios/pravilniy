"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const organization_model_1 = require("../models/organization.model");
const user_model_1 = require("../models/user.model");
const auth_types_1 = require("../types/auth.types");
const jwt_util_1 = require("../utils/jwt.util");
const password_util_1 = require("../utils/password.util");
class AuthService {
    async login(credentials) {
        const { email, password } = credentials;
        if (!email || !password) {
            throw new auth_types_1.ValidationError('Email и пароль обязательны');
        }
        if (!this.isValidEmail(email)) {
            throw new auth_types_1.ValidationError('Некорректный формат email');
        }
        const user = await user_model_1.User.findOne({
            where: { email: email.toLowerCase() },
            include: [{
                    model: organization_model_1.Organization,
                    as: 'organization',
                    attributes: ['id', 'name', 'isActive']
                }]
        });
        if (!user) {
            throw new auth_types_1.AuthError('Неверные учетные данные', 401);
        }
        if (!user.isActive) {
            throw new auth_types_1.AuthError('Аккаунт деактивирован', 403);
        }
        if (!user.organization?.isActive) {
            throw new auth_types_1.AuthError('Организация деактивирована', 403);
        }
        const isPasswordValid = await (0, password_util_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new auth_types_1.AuthError('Неверные учетные данные', 401);
        }
        await user.update({ lastLoginAt: new Date() });
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId
        };
        const { accessToken, refreshToken } = (0, jwt_util_1.generateTokenPair)(tokenPayload);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                organizationId: user.organizationId
            }
        };
    }
    async register(data) {
        const { email, password, firstName, lastName, organizationId, role = 'USER' } = data;
        this.validateRegistrationData(data);
        const existingUser = await user_model_1.User.findOne({
            where: { email: email.toLowerCase() }
        });
        if (existingUser) {
            throw new auth_types_1.ValidationError('Пользователь с таким email уже существует', 'email');
        }
        const organization = await organization_model_1.Organization.findByPk(organizationId);
        if (!organization) {
            throw new auth_types_1.ValidationError('Организация не найдена', 'organizationId');
        }
        if (!organization.isActive) {
            throw new auth_types_1.ValidationError('Организация деактивирована', 'organizationId');
        }
        const hashedPassword = await (0, password_util_1.hashPassword)(password);
        const user = await user_model_1.User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            role,
            organizationId,
            isActive: true
        });
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId
        };
        const { accessToken, refreshToken } = (0, jwt_util_1.generateTokenPair)(tokenPayload);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                organizationId: user.organizationId
            }
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = (0, jwt_util_1.verifyToken)(refreshToken);
            const user = await user_model_1.User.findByPk(payload.userId, {
                include: [{
                        model: organization_model_1.Organization,
                        as: 'organization',
                        attributes: ['id', 'name', 'isActive']
                    }]
            });
            if (!user) {
                throw new auth_types_1.AuthError('Пользователь не найден', 401);
            }
            if (!user.isActive) {
                throw new auth_types_1.AuthError('Аккаунт деактивирован', 403);
            }
            if (!user.organization?.isActive) {
                throw new auth_types_1.AuthError('Организация деактивирована', 403);
            }
            const tokenPayload = {
                userId: user.id,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId
            };
            return (0, jwt_util_1.generateTokenPair)(tokenPayload);
        }
        catch (error) {
            if (error instanceof auth_types_1.AuthError) {
                throw error;
            }
            throw new auth_types_1.AuthError('Недействительный refresh токен', 401);
        }
    }
    async changePassword(userId, data) {
        const { currentPassword, newPassword } = data;
        const passwordValidation = (0, password_util_1.validatePassword)(newPassword);
        if (!passwordValidation.isValid) {
            throw new auth_types_1.ValidationError(passwordValidation.errors.join(', '));
        }
        const user = await user_model_1.User.findByPk(userId);
        if (!user) {
            throw new auth_types_1.AuthError('Пользователь не найден', 404);
        }
        const isCurrentPasswordValid = await (0, password_util_1.comparePassword)(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new auth_types_1.AuthError('Неверный текущий пароль', 401);
        }
        const hashedNewPassword = await (0, password_util_1.hashPassword)(newPassword);
        await user.update({
            password: hashedNewPassword,
            passwordChangedAt: new Date()
        });
    }
    async requestPasswordReset(data) {
        const { email } = data;
        if (!this.isValidEmail(email)) {
            throw new auth_types_1.ValidationError('Некорректный формат email');
        }
        const user = await user_model_1.User.findOne({
            where: { email: email.toLowerCase() }
        });
        if (!user) {
            return;
        }
        console.log(`Password reset requested for user: ${user.email}`);
    }
    async setNewPassword(data) {
        const { token, newPassword } = data;
        const passwordValidation = (0, password_util_1.validatePassword)(newPassword);
        if (!passwordValidation.isValid) {
            throw new auth_types_1.ValidationError(passwordValidation.errors.join(', '));
        }
        console.log(`New password set with token: ${token}`);
    }
    validateRegistrationData(data) {
        const { email, password, firstName, lastName, organizationId } = data;
        if (!email || !password || !firstName || !lastName || !organizationId) {
            throw new auth_types_1.ValidationError('Все поля обязательны');
        }
        if (!this.isValidEmail(email)) {
            throw new auth_types_1.ValidationError('Некорректный формат email', 'email');
        }
        const passwordValidation = (0, password_util_1.validatePassword)(password);
        if (!passwordValidation.isValid) {
            throw new auth_types_1.ValidationError(passwordValidation.errors.join(', '), 'password');
        }
        if (firstName.length < 2 || firstName.length > 50) {
            throw new auth_types_1.ValidationError('Имя должно содержать от 2 до 50 символов', 'firstName');
        }
        if (lastName.length < 2 || lastName.length > 50) {
            throw new auth_types_1.ValidationError('Фамилия должна содержать от 2 до 50 символов', 'lastName');
        }
        if (!Number.isInteger(organizationId) || organizationId <= 0) {
            throw new auth_types_1.ValidationError('Некорректный ID организации', 'organizationId');
        }
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map