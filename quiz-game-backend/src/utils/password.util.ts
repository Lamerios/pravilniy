import * as bcrypt from 'bcrypt';

/**
 * Утилиты для работы с паролями
 * Использует bcrypt для безопасного хеширования
 */

// Конфигурация bcrypt
const SALT_ROUNDS = 12;

/**
 * Хеширует пароль
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error}`);
  }
}

/**
 * Проверяет пароль
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error}`);
  }
}

/**
 * Валидирует пароль по требованиям безопасности
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Минимальная длина
  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  }

  // Максимальная длина
  if (password.length > 128) {
    errors.push('Пароль не должен превышать 128 символов');
  }

  // Содержит заглавную букву
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать минимум одну заглавную букву');
  }

  // Содержит строчную букву
  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать минимум одну строчную букву');
  }

  // Содержит цифру
  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать минимум одну цифру');
  }

  // Содержит специальный символ
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Пароль должен содержать минимум один специальный символ');
  }

  // Проверка на простые пароли
  const commonPasswords = [
    'password',
    '123456',
    '123456789',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Пароль слишком простой, выберите более сложный');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Генерирует случайный пароль
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';

  // Гарантируем наличие разных типов символов
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';

  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Заполняем остальные символы
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Перемешиваем символы
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Проверяет, не был ли пароль скомпрометирован
 * (заглушка для будущей интеграции с HaveIBeenPwned API)
 */
export async function isPasswordCompromised(password: string): Promise<boolean> {
  // TODO: Интеграция с HaveIBeenPwned API
  // Пока возвращаем false
  return false;
}
