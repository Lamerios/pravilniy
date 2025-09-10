/**
 * Хук для управления аутентификацией
 */

import { useCallback, useEffect, useState } from 'react';

import { authService } from '../services/auth.service';
import {
    AuthState,
    LoginData,
    RegisterData
} from '../types/auth.types';
import {
    clearAuthStorage,
    getAccessToken,
    getRefreshToken,
    getUserData,
    isTokenExpired
} from '../utils/storage';

/**
 * Хук для управления состоянием аутентификации
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Обновление состояния
   */
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Очистка ошибки
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  /**
   * Вход в систему
   */
  const login = useCallback(async (loginData: LoginData) => {
    try {
      updateState({ isLoading: true, error: null });

      const response = await authService.login(loginData);

      if (response.success && response.data) {
        updateState({
          user: response.data.user,
          tokens: response.data.tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка входа';
      updateState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, [updateState]);

  /**
   * Регистрация пользователя
   */
  const register = useCallback(async (registerData: RegisterData) => {
    try {
      updateState({ isLoading: true, error: null });

      const response = await authService.register(registerData);

      if (response.success && response.data) {
        updateState({
          user: response.data.user,
          tokens: response.data.tokens,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка регистрации';
      updateState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, [updateState]);

  /**
   * Выход из системы
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      clearAuthStorage();
      updateState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [updateState]);

  /**
   * Обновление токена
   */
  const refreshToken = useCallback(async () => {
    try {
      const tokens = await authService.refreshToken();
      updateState({ tokens });
      return tokens;
    } catch (error) {
      console.warn('Token refresh failed:', error);
      // При неудачном обновлении токена выходим из системы
      await logout();
      throw error;
    }
  }, [updateState, logout]);

  /**
   * Проверка и обновление токена при необходимости
   */
  const checkAndRefreshToken = useCallback(async () => {
    const accessToken = getAccessToken();
    const refreshTokenValue = getRefreshToken();

    if (!accessToken || !refreshTokenValue) {
      return false;
    }

    // Проверяем, не истек ли токен
    if (isTokenExpired(accessToken)) {
      try {
        await refreshToken();
        return true;
      } catch (error) {
        return false;
      }
    }

    return true;
  }, [refreshToken]);

  /**
   * Инициализация аутентификации при загрузке приложения
   */
  const initializeAuth = useCallback(async () => {
    try {
      updateState({ isLoading: true });

      const accessToken = getAccessToken();
      const refreshTokenValue = getRefreshToken();
      const userData = getUserData();

      // Дополнительная отладка
      console.log('Auth initialization:', {
        accessToken: accessToken ? 'present' : 'missing',
        refreshToken: refreshTokenValue ? 'present' : 'missing',
        userData: userData ? 'present' : 'missing',
        localStorageKeys: Object.keys(localStorage).filter(key => key.includes('pravilniy'))
      });

      if (!accessToken || !refreshTokenValue || !userData) {
        console.log('Missing auth data, setting unauthenticated state');
        updateState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Проверяем валидность токена
      const isTokenValid = await checkAndRefreshToken();

      if (isTokenValid) {
        console.log('Token is valid, getting current user...');
        // Получаем актуальные данные пользователя
        try {
          const currentUser = await authService.getCurrentUser();
          console.log('Current user retrieved:', currentUser);
          updateState({
            user: currentUser,
            tokens: {
              accessToken: getAccessToken() ?? '',
              refreshToken: getRefreshToken() ?? '',
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          console.log('Auth state updated to authenticated');
        } catch (error) {
          console.error('Failed to get current user:', error);
          // Если не удалось получить данные пользователя, очищаем состояние
          clearAuthStorage();
          updateState({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        console.log('Token is invalid, setting unauthenticated state');
        updateState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      updateState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [updateState, checkAndRefreshToken]);

  /**
   * Инициализация при монтировании компонента
   * Временно отключено для отладки
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
  };
}
