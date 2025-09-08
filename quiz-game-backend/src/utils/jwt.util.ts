import * as jwt from 'jsonwebtoken';
import { JWTConfig, JWTPayload } from '../types/auth.types';

/**
 * Утилиты для работы с JWT токенами
 */

// Конфигурация JWT
const jwtConfig: JWTConfig = {
  secret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production',
  accessTokenExpiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] || '15m',
  refreshTokenExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
  issuer: process.env['JWT_ISSUER'] || 'quiz-game-api',
  audience: process.env['JWT_AUDIENCE'] || 'quiz-game-client',
};

/**
 * Генерирует access токен
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  try {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.accessTokenExpiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    } as jwt.SignOptions);
  } catch (error) {
    throw new Error(`Access token generation failed: ${error}`);
  }
}

/**
 * Генерирует refresh токен
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  try {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.refreshTokenExpiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    } as jwt.SignOptions);
  } catch (error) {
    throw new Error(`Refresh token generation failed: ${error}`);
  }
}

/**
 * Верифицирует токен
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error(`Token verification failed: ${error}`);
    }
  }
}

/**
 * Декодирует токен без верификации (для отладки)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Извлекает токен из заголовка Authorization
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
}

/**
 * Проверяет, истек ли токен
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded?.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

/**
 * Получает время истечения токена
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = decodeToken(token);
    if (!decoded?.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
}

/**
 * Получает время до истечения токена в секундах
 */
export function getTimeUntilExpiration(token: string): number | null {
  try {
    const decoded = decodeToken(token);
    if (!decoded?.exp) {
      return null;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - currentTime;

    return timeLeft > 0 ? timeLeft : 0;
  } catch (error) {
    return null;
  }
}

/**
 * Генерирует пару токенов (access + refresh)
 */
export function generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Проверяет конфигурацию JWT
 */
export function validateJWTConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!jwtConfig.secret || jwtConfig.secret === 'your-super-secret-jwt-key-change-in-production') {
    errors.push('JWT_SECRET не установлен или использует значение по умолчанию');
  }

  if (jwtConfig.secret.length < 32) {
    errors.push('JWT_SECRET должен содержать минимум 32 символа');
  }

  if (!jwtConfig.accessTokenExpiresIn) {
    errors.push('JWT_ACCESS_EXPIRES_IN не установлен');
  }

  if (!jwtConfig.refreshTokenExpiresIn) {
    errors.push('JWT_REFRESH_EXPIRES_IN не установлен');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export { jwtConfig };
