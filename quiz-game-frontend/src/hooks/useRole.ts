/**
 * Хук для работы с ролями пользователей
 */

import { useAuthContext } from '../contexts/AuthContext';
import { UserRole } from '../types/auth.types';

/**
 * Хук для проверки ролей пользователя
 */
export function useRole() {
  const { user } = useAuthContext();

  /**
   * Проверяет, имеет ли пользователь конкретную роль
   */
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  /**
   * Проверяет, имеет ли пользователь любую из указанных ролей
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  /**
   * Проверяет, является ли пользователь администратором
   */
  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  /**
   * Проверяет, является ли пользователь владельцем
   */
  const isOwner = (): boolean => {
    return hasRole(UserRole.OWNER);
  };

  /**
   * Проверяет, является ли пользователь модератором
   */
  const isModerator = (): boolean => {
    return hasRole(UserRole.MODERATOR);
  };

  /**
   * Проверяет, является ли пользователь модератором или выше
   */
  const isModeratorOrAbove = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.OWNER, UserRole.MODERATOR]);
  };

  /**
   * Проверяет, является ли пользователь владельцем или администратором
   */
  const isOwnerOrAdmin = (): boolean => {
    return hasAnyRole([UserRole.ADMIN, UserRole.OWNER]);
  };

  /**
   * Получает уровень роли (число для сравнения)
   */
  const getRoleLevel = (): number => {
    if (!user) return 0;

    switch (user.role) {
      case UserRole.ADMIN:
        return 3;
      case UserRole.OWNER:
        return 2;
      case UserRole.MODERATOR:
        return 1;
      default:
        return 0;
    }
  };

  /**
   * Проверяет, имеет ли пользователь роль выше указанной
   */
  const hasHigherRole = (role: UserRole): boolean => {
    const userLevel = getRoleLevel();
    const requiredLevel = getRoleLevelForRole(role);
    return userLevel > requiredLevel;
  };

  /**
   * Проверяет, имеет ли пользователь роль выше или равную указанной
   */
  const hasRoleOrHigher = (role: UserRole): boolean => {
    const userLevel = getRoleLevel();
    const requiredLevel = getRoleLevelForRole(role);
    return userLevel >= requiredLevel;
  };

  /**
   * Получает все доступные роли
   */
  const getAvailableRoles = (): UserRole[] => {
    return Object.values(UserRole);
  };

  /**
   * Получает информацию о ролях пользователя
   */
  const getRoleInfo = () => {
    return {
      currentRole: user?.role,
      roleLevel: getRoleLevel(),
      permissions: {
        canAccessAdmin: isAdmin(),
        canAccessOwner: isOwner(),
        canAccessModerator: isModeratorOrAbove(),
        canAccessOwnerOrAdmin: isOwnerOrAdmin(),
      },
      availableRoles: getAvailableRoles()
    };
  };

  return {
    // Основные проверки
    hasRole,
    hasAnyRole,

    // Специфичные проверки ролей
    isAdmin,
    isOwner,
    isModerator,
    isModeratorOrAbove,
    isOwnerOrAdmin,

    // Уровни ролей
    getRoleLevel,
    hasHigherRole,
    hasRoleOrHigher,

    // Информация
    getAvailableRoles,
    getRoleInfo,

    // Данные пользователя
    userRole: user?.role,
    user: user
  };
}

/**
 * Вспомогательная функция для получения уровня роли
 */
function getRoleLevelForRole(role: UserRole): number {
  switch (role) {
    case UserRole.ADMIN:
      return 3;
    case UserRole.OWNER:
      return 2;
    case UserRole.MODERATOR:
      return 1;
    default:
      return 0;
  }
}
