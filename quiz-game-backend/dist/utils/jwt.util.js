"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyToken = verifyToken;
exports.decodeToken = decodeToken;
exports.extractTokenFromHeader = extractTokenFromHeader;
exports.isTokenExpired = isTokenExpired;
exports.getTokenExpiration = getTokenExpiration;
exports.getTimeUntilExpiration = getTimeUntilExpiration;
exports.generateTokenPair = generateTokenPair;
exports.validateJWTConfig = validateJWTConfig;
const tslib_1 = require("tslib");
const jwt = tslib_1.__importStar(require("jsonwebtoken"));
const jwtConfig = {
    secret: process.env['JWT_SECRET'] || 'your-super-secret-jwt-key-change-in-production',
    accessTokenExpiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] || '15m',
    refreshTokenExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
    issuer: process.env['JWT_ISSUER'] || 'quiz-game-api',
    audience: process.env['JWT_AUDIENCE'] || 'quiz-game-client'
};
exports.jwtConfig = jwtConfig;
function generateAccessToken(payload) {
    try {
        return jwt.sign(payload, jwtConfig.secret, {
            expiresIn: jwtConfig.accessTokenExpiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
    }
    catch (error) {
        throw new Error(`Access token generation failed: ${error}`);
    }
}
function generateRefreshToken(payload) {
    try {
        return jwt.sign(payload, jwtConfig.secret, {
            expiresIn: jwtConfig.refreshTokenExpiresIn,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
    }
    catch (error) {
        throw new Error(`Refresh token generation failed: ${error}`);
    }
}
function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, jwtConfig.secret, {
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
        return decoded;
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token has expired');
        }
        else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        else {
            throw new Error(`Token verification failed: ${error}`);
        }
    }
}
function decodeToken(token) {
    try {
        return jwt.decode(token);
    }
    catch (error) {
        return null;
    }
}
function extractTokenFromHeader(authHeader) {
    if (!authHeader) {
        return null;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    return parts[1] || null;
}
function isTokenExpired(token) {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) {
            return true;
        }
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    }
    catch (error) {
        return true;
    }
}
function getTokenExpiration(token) {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) {
            return null;
        }
        return new Date(decoded.exp * 1000);
    }
    catch (error) {
        return null;
    }
}
function getTimeUntilExpiration(token) {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) {
            return null;
        }
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = decoded.exp - currentTime;
        return timeLeft > 0 ? timeLeft : 0;
    }
    catch (error) {
        return null;
    }
}
function generateTokenPair(payload) {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload)
    };
}
function validateJWTConfig() {
    const errors = [];
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
        errors
    };
}
//# sourceMappingURL=jwt.util.js.map