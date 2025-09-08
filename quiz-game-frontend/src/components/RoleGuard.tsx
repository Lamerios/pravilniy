/**
 * Компонент для защиты по ролям
 */

import React, { ReactNode } from 'react';

import { useRole } from '../hooks/useRole';
import { UserRole } from '../types/auth.types';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  requireAll?: boolean; // true = все роли, false = любая роль
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

/**
 * Компонент для условного рендеринга на основе ролей пользователя
 */
export function RoleGuard({
  children,
  requiredRole,
  requiredRoles,
  requireAll = false,
  fallback = null,
  showAccessDenied = false
}: RoleGuardProps) {
  const { hasRole, hasAnyRole, userRole } = useRole();

  // Проверяем доступ
  let hasAccess = false;

  if (requiredRole) {
    hasAccess = hasRole(requiredRole);
  } else if (requiredRoles && requiredRoles.length > 0) {
    if (requireAll) {
      // Пользователь должен иметь все указанные роли
      hasAccess = requiredRoles.every(role => hasRole(role));
    } else {
      // Пользователь должен иметь любую из указанных ролей
      hasAccess = hasAnyRole(requiredRoles);
    }
  } else {
    // Если роли не указаны, разрешаем доступ
    hasAccess = true;
  }

  // Если нет доступа
  if (!hasAccess) {
    if (showAccessDenied) {
      return (
        <div className="access-denied">
          <div className="access-denied-content">
            <h3>Доступ запрещен</h3>
            <p>У вас недостаточно прав для просмотра этого контента.</p>
            {userRole && (
              <p className="user-role-info">
                Ваша роль: <strong>{userRole}</strong>
              </p>
            )}
            {requiredRole && (
              <p className="required-role-info">
                Требуется роль: <strong>{requiredRole}</strong>
              </p>
            )}
            {requiredRoles && requiredRoles.length > 0 && (
              <p className="required-roles-info">
                Требуется {requireAll ? 'все роли' : 'одна из ролей'}: <strong>{requiredRoles.join(', ')}</strong>
              </p>
            )}
          </div>
        </div>
      );
    }

    return <>{fallback}</>;
  }

  // Если есть доступ, рендерим детей
  return <>{children}</>;
}

/**
 * HOC для защиты компонентов по ролям
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  roleConfig: Omit<RoleGuardProps, 'children'>
) {
  return function RoleGuardedComponent(props: P) {
    return (
      <RoleGuard {...roleConfig}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}

/**
 * Специализированные компоненты для конкретных ролей
 */
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <RoleGuard requiredRole={UserRole.ADMIN} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const OwnerOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <RoleGuard requiredRole={UserRole.OWNER} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ModeratorOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <RoleGuard requiredRole={UserRole.MODERATOR} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ModeratorOrAbove: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <RoleGuard
    requiredRoles={[UserRole.ADMIN, UserRole.OWNER, UserRole.MODERATOR]}
    fallback={fallback}
  >
    {children}
  </RoleGuard>
);

export const OwnerOrAdmin: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <RoleGuard
    requiredRoles={[UserRole.ADMIN, UserRole.OWNER]}
    fallback={fallback}
  >
    {children}
  </RoleGuard>
);

export default RoleGuard;
