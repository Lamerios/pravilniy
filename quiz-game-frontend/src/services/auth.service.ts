/**
 * Сервис для работы с API аутентификации
 */

import {
    ApiResponse,
    AuthTokens,
    LoginData,
    LoginResponse,
    RegisterData,
    User
} from '../types/auth.types';
import {
    clearAuthStorage,
    getAccessToken,
    getRefreshToken,
    saveAuthTokens,
    saveUserData
} from '../utils/storage';

// Базовый URL API (можно вынести в конфиг)
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Класс для работы с API аутентификации
 */
class AuthService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Выполнение HTTP запроса с обработкой ошибок
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Добавляем Authorization header если есть токен
    const token = getAccessToken();
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  /**
   * Вход в систему
   */
  async login(loginData: LoginData): Promise<LoginResponse> {
    const response = await this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    // Сохраняем токены и данные пользователя
    if (response.success && response.data) {
      saveAuthTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      saveUserData(response.data.user);
    }

    return response;
  }

  /**
   * Регистрация пользователя
   */
  async register(registerData: RegisterData): Promise<LoginResponse> {
    const response = await this.makeRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });

    // Сохраняем токены и данные пользователя
    if (response.success && response.data) {
      saveAuthTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      saveUserData(response.data.user);
    }

    return response;
  }

  /**
   * Обновление токена
   */
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.makeRequest<ApiResponse<AuthTokens>>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.success || !response.data) {
      throw new Error('Failed to refresh token');
    }

    // Сохраняем новые токены
    saveAuthTokens(
      response.data.accessToken,
      response.data.refreshToken
    );

    return response.data;
  }

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Игнорируем ошибки при выходе
      console.warn('Logout request failed:', error);
    } finally {
      // Всегда очищаем локальные данные
      clearAuthStorage();
    }
  }

  /**
   * Получение текущего пользователя
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.makeRequest<ApiResponse<User>>('/auth/me');

    if (!response.success || !response.data) {
      throw new Error('Failed to get current user');
    }

    // Обновляем данные пользователя в localStorage
    saveUserData(response.data);

    return response.data;
  }

  /**
   * Изменение пароля
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.makeRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
  }

  /**
   * Валидация токена
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.makeRequest('/auth/validate');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Проверка аутентификации
   */
  isAuthenticated(): boolean {
    const token = getAccessToken();
    return !!token;
  }

  /**
   * Получение токена для API запросов
   */
  getAuthToken(): string | null {
    return getAccessToken();
  }
}

// Экспортируем singleton instance
export const authService = new AuthService();
export default authService;
