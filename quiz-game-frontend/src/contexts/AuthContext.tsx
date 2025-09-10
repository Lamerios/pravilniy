/**
 * Контекст для управления аутентификацией
 */

import { createContext, ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { AuthContextType } from '../types/auth.types';

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Провайдер контекста аутентификации
 */
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Хук для использования контекста аутентификации
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

/**
 * HOC для защищенных компонентов
 */
interface WithAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function WithAuth({ children, fallback = null }: WithAuthProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * HOC для компонентов, доступных только неаутентифицированным пользователям
 */
export function WithoutAuth({ children, fallback = null }: WithAuthProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Загрузка...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
