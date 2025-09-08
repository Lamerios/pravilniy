import { Request } from 'express';
import { UserRole } from '../models/user.model';

/**
 * Типы для системы аутентификации
 */

// JWT Payload
export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
  organizationId: number;
  iat?: number;
  exp?: number;
}

// Request с пользователем
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Ответ при логине
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

// Ответ при обновлении токена
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Данные для логина
export interface LoginCredentials {
  email: string;
  password: string;
}

// Данные для регистрации
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationId: number;
  role?: UserRole;
}

// Данные для смены пароля
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Данные для сброса пароля
export interface ResetPasswordData {
  email: string;
}

// Данные для установки нового пароля
export interface SetNewPasswordData {
  token: string;
  newPassword: string;
}

// Конфигурация JWT
export interface JWTConfig {
  secret: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  issuer: string;
  audience: string;
}

// Ошибки аутентификации
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TokenError extends Error {
  constructor(
    message: string,
    public statusCode: number = 403,
  ) {
    super(message);
    this.name = 'TokenError';
  }
}
