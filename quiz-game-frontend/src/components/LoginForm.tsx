/**
 * Компонент формы входа
 */

import React, { FormEvent, useState } from 'react';

import { useAuthContext } from '../contexts/AuthContext';
import { LoginData } from '../types/auth.types';

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function LoginForm({ onSuccess, className = '' }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuthContext();

  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState<Partial<LoginData>>({});

  /**
   * Обработка изменения полей формы
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Очищаем ошибку валидации для этого поля
    if (validationErrors[name as keyof LoginData]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Очищаем общую ошибку
    if (error) {
      clearError();
    }
  };

  /**
   * Валидация формы
   */
  const validateForm = (): boolean => {
    const errors: Partial<LoginData> = {};

    // Валидация email
    if (!formData.email) {
      errors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Введите корректный email';
    }

    // Валидация пароля
    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Обработка отправки формы
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      onSuccess?.();
    } catch (error) {
      // Ошибка уже обработана в хуке useAuth
      console.error('Login error:', error);
    }
  };

  return (
    <div className={`login-form-container ${className}`}>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-header">
          <h2>Вход в систему</h2>
          <p>Введите ваши данные для входа</p>
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${validationErrors.email ? 'error' : ''}`}
            placeholder="Введите ваш email"
            disabled={isLoading}
            autoComplete="email"
          />
          {validationErrors.email && (
            <span className="error-message">{validationErrors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`form-input ${validationErrors.password ? 'error' : ''}`}
            placeholder="Введите ваш пароль"
            disabled={isLoading}
            autoComplete="current-password"
          />
          {validationErrors.password && (
            <span className="error-message">{validationErrors.password}</span>
          )}
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner" />
              Вход...
            </>
          ) : (
            'Войти'
          )}
        </button>

        <div className="form-footer">
          <p className="help-text">
            Нет аккаунта? Обратитесь к администратору
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
