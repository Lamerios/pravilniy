/**
 * Страница дашборда (главная страница после входа)
 */

import { Link } from 'react-router-dom';
import { AdminOnly, ModeratorOrAbove, OwnerOnly, OwnerOrAdmin, RoleGuard } from '../components/RoleGuard';
import { useAuthContext } from '../contexts/AuthContext';
import { useRole } from '../hooks/useRole';

export function DashboardPage() {
  const { user, logout } = useAuthContext();
  const { getRoleInfo, isAdmin, isOwner, isModerator } = useRole();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Панель управления</h1>
          <p>Добро пожаловать, {user?.firstName} {user?.lastName}!</p>
        </div>

        <div className="dashboard-actions">
          <div className="user-info">
            <span className="user-email">{user?.email}</span>
            <span className="user-role">{user?.role}</span>
          </div>

          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-cards">
          <Link to="/games" className="dashboard-card-link">
            <div className="dashboard-card">
              <h3>Игры</h3>
              <p>Управление играми и шаблонами</p>
              <div className="card-stats">
                <span className="stat-number">0</span>
                <span className="stat-label">Активных игр</span>
              </div>
            </div>
          </Link>

          <div className="dashboard-card">
            <h3>Команды</h3>
            <p>Управление командами</p>
            <div className="card-stats">
              <span className="stat-number">0</span>
              <span className="stat-label">Зарегистрированных команд</span>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Статистика</h3>
            <p>Аналитика и отчеты</p>
            <div className="card-stats">
              <span className="stat-number">0</span>
              <span className="stat-label">Проведенных игр</span>
            </div>
          </div>
        </div>

        <div className="dashboard-recent">
          <h2>Последние действия</h2>
          <div className="recent-actions">
            <p className="no-actions">Пока нет действий</p>
          </div>
        </div>

        {/* Демонстрация ролей */}
        <div className="dashboard-roles">
          <h2>Информация о ролях</h2>
          <div className="role-info">
            <div className="role-info-card">
              <h3>Текущая роль</h3>
              <p className="current-role">{roleInfo.currentRole}</p>
              <p className="role-level">Уровень: {roleInfo.roleLevel}</p>
            </div>

            <div className="role-permissions">
              <h3>Разрешения</h3>
              <ul>
                <li className={roleInfo.permissions.canAccessAdmin ? 'allowed' : 'denied'}>
                  Доступ к админ панели: {roleInfo.permissions.canAccessAdmin ? '✅' : '❌'}
                </li>
                <li className={roleInfo.permissions.canAccessOwner ? 'allowed' : 'denied'}>
                  Доступ владельца: {roleInfo.permissions.canAccessOwner ? '✅' : '❌'}
                </li>
                <li className={roleInfo.permissions.canAccessModerator ? 'allowed' : 'denied'}>
                  Доступ модератора: {roleInfo.permissions.canAccessModerator ? '✅' : '❌'}
                </li>
                <li className={roleInfo.permissions.canAccessOwnerOrAdmin ? 'allowed' : 'denied'}>
                  Доступ владельца/админа: {roleInfo.permissions.canAccessOwnerOrAdmin ? '✅' : '❌'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Демонстрация компонентов с защитой по ролям */}
        <div className="dashboard-role-demo">
          <h2>Демонстрация защиты по ролям</h2>

          <div className="role-demo-section">
            <h3>Секция только для администраторов</h3>
            <AdminOnly fallback={<p className="access-denied">❌ Доступ только для администраторов</p>}>
              <div className="admin-section">
                <p>✅ Вы администратор! Эта секция видна только вам.</p>
                <button className="admin-button">Админская кнопка</button>
              </div>
            </AdminOnly>
          </div>

          <div className="role-demo-section">
            <h3>Секция только для владельцев</h3>
            <OwnerOnly fallback={<p className="access-denied">❌ Доступ только для владельцев</p>}>
              <div className="owner-section">
                <p>✅ Вы владелец! Эта секция видна только вам.</p>
                <button className="owner-button">Кнопка владельца</button>
              </div>
            </OwnerOnly>
          </div>

          <div className="role-demo-section">
            <h3>Секция для модераторов и выше</h3>
            <ModeratorOrAbove fallback={<p className="access-denied">❌ Доступ только для модераторов и выше</p>}>
              <div className="moderator-section">
                <p>✅ У вас есть права модератора или выше!</p>
                <button className="moderator-button">Кнопка модератора</button>
              </div>
            </ModeratorOrAbove>
          </div>

          <div className="role-demo-section">
            <h3>Секция для владельцев и администраторов</h3>
            <OwnerOrAdmin fallback={<p className="access-denied">❌ Доступ только для владельцев и администраторов</p>}>
              <div className="owner-admin-section">
                <p>✅ Вы владелец или администратор!</p>
                <button className="owner-admin-button">Кнопка владельца/админа</button>
              </div>
            </OwnerOrAdmin>
          </div>

          <div className="role-demo-section">
            <h3>Гибкая проверка ролей</h3>
            <RoleGuard
              requiredRoles={[roleInfo.currentRole as any]}
              fallback={<p className="access-denied">❌ Доступ запрещен</p>}
            >
              <div className="flexible-section">
                <p>✅ Эта секция видна только пользователям с вашей ролью: <strong>{roleInfo.currentRole}</strong></p>
                <button className="flexible-button">Кнопка для {roleInfo.currentRole}</button>
              </div>
            </RoleGuard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
