import { Request } from 'express';
import { UserRole } from '../models/user.model';
export interface JWTPayload {
    userId: number;
    email: string;
    role: UserRole;
    organizationId: number;
    iat?: number;
    exp?: number;
}
export interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
}
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        organizationId: number;
    };
}
export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationId: number;
    role?: UserRole;
}
export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}
export interface ResetPasswordData {
    email: string;
}
export interface SetNewPasswordData {
    token: string;
    newPassword: string;
}
export interface JWTConfig {
    secret: string;
    accessTokenExpiresIn: string;
    refreshTokenExpiresIn: string;
    issuer: string;
    audience: string;
}
export declare class AuthError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export declare class ValidationError extends Error {
    field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
export declare class TokenError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
//# sourceMappingURL=auth.types.d.ts.map