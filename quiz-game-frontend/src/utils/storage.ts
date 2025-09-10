/**
 * Утилиты для работы с localStorage
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'pravilniy_quiz_access_token',
  REFRESH_TOKEN: 'pravilniy_quiz_refresh_token',
  USER_DATA: 'pravilniy_quiz_user_data'
} as const;

/**
 * Безопасное получение данных из localStorage
 */
export function getStorageItem(key: string): string | null {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting item from localStorage: ${error}`);
    return null;
  }
}

/**
 * Безопасное сохранение данных в localStorage
 */
export function setStorageItem(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting item in localStorage: ${error}`);
  }
}

/**
 * Безопасное удаление данных из localStorage
 */
export function removeStorageItem(key: string): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from localStorage: ${error}`);
  }
}

/**
 * Очистка всех данных аутентификации
 */
export function clearAuthStorage(): void {
  removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
  removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
  removeStorageItem(STORAGE_KEYS.USER_DATA);
}

/**
 * Сохранение токенов аутентификации
 */
export function saveAuthTokens(accessToken: string, refreshToken: string): void {
  setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

/**
 * Получение access token
 */
export function getAccessToken(): string | null {
  return getStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Получение refresh token
 */
export function getRefreshToken(): string | null {
  return getStorageItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Сохранение данных пользователя
 */
export function saveUserData(user: any): void {
  setStorageItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
}

/**
 * Получение данных пользователя
 */
export function getUserData(): any | null {
  const userData = getStorageItem(STORAGE_KEYS.USER_DATA);
  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
}

/**
 * Проверка наличия токенов
 */
export function hasAuthTokens(): boolean {
  return !!(getAccessToken() && getRefreshToken());
}

/**
 * Проверка истечения токена (базовая проверка)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      return true;
    }
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Считаем токен истекшим при ошибке
  }
}

/**
 * Получение времени истечения токена
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      return null;
    }
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp * 1000; // Конвертируем в миллисекунды
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
}
