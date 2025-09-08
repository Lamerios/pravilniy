"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenError = exports.ValidationError = exports.AuthError = void 0;
class AuthError extends Error {
    statusCode;
    constructor(message, statusCode = 401) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AuthError';
    }
}
exports.AuthError = AuthError;
class ValidationError extends Error {
    field;
    constructor(message, field) {
        super(message);
        this.field = field;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class TokenError extends Error {
    statusCode;
    constructor(message, statusCode = 403) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'TokenError';
    }
}
exports.TokenError = TokenError;
//# sourceMappingURL=auth.types.js.map