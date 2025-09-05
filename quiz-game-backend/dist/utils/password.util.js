"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.validatePassword = validatePassword;
exports.generateRandomPassword = generateRandomPassword;
exports.isPasswordCompromised = isPasswordCompromised;
const tslib_1 = require("tslib");
const bcrypt = tslib_1.__importStar(require("bcrypt"));
const SALT_ROUNDS = 12;
async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    }
    catch (error) {
        throw new Error(`Password hashing failed: ${error}`);
    }
}
async function comparePassword(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    }
    catch (error) {
        throw new Error(`Password comparison failed: ${error}`);
    }
}
function validatePassword(password) {
    const errors = [];
    if (password.length < 8) {
        errors.push('Пароль должен содержать минимум 8 символов');
    }
    if (password.length > 128) {
        errors.push('Пароль не должен превышать 128 символов');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Пароль должен содержать минимум одну заглавную букву');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Пароль должен содержать минимум одну строчную букву');
    }
    if (!/\d/.test(password)) {
        errors.push('Пароль должен содержать минимум одну цифру');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Пароль должен содержать минимум один специальный символ');
    }
    const commonPasswords = [
        'password', '123456', '123456789', 'qwerty', 'abc123',
        'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('Пароль слишком простой, выберите более сложный');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
function generateRandomPassword(length = 12) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    for (let i = 4; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }
    return password.split('').sort(() => Math.random() - 0.5).join('');
}
async function isPasswordCompromised(password) {
    return false;
}
//# sourceMappingURL=password.util.js.map