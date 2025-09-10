/**
 * Страница дашборда (главная страница после входа)
 */

import { Link } from 'react-router-dom';

import { useAuthContext } from '../contexts/AuthContext';
import { useRole } from '../hooks/useRole';

export function DashboardPage() {
  const { user, logout } = useAuthContext();
  const { getRoleInfo } = useRole();

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
              <div className="card-icon">🎮</div>
              <h3>Игры</h3>
              <p>Создание и управление играми</p>
              <div className="card-stats">
                <span className="stat-number">0</span>
                <span className="stat-label">Активных игр</span>
              </div>
              <div className="card-actions">
                <span className="action-text">Создать игру</span>
              </div>
            </div>
          </Link>

          <Link to="/templates" className="dashboard-card-link">
            <div className="dashboard-card">
              <div className="card-icon">📋</div>
              <h3>Шаблоны</h3>
              <p>Создание и управление шаблонами игр</p>
              <div className="card-stats">
                <span className="stat-number">0</span>
                <span className="stat-label">Доступных шаблонов</span>
              </div>
              <div className="card-actions">
                <span className="action-text">Создать шаблон</span>
              </div>
            </div>
          </Link>

          <Link to="/teams" className="dashboard-card-link">
            <div className="dashboard-card">
              <div className="card-icon">👥</div>
              <h3>Команды</h3>
              <p>Управление командами участников</p>
              <div className="card-stats">
                <span className="stat-number">0</span>
                <span className="stat-label">Зарегистрированных команд</span>
              </div>
              <div className="card-actions">
                <span className="action-text">Управление командами</span>
              </div>
            </div>
          </Link>

          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>Статистика</h3>
            <p>Аналитика и отчеты по играм</p>
            <div className="card-stats">
              <span className="stat-number">0</span>
              <span className="stat-label">Проведенных игр</span>
            </div>
            <div className="card-actions">
              <span className="action-text">Просмотр отчетов</span>
            </div>
          </div>
        </div>

        <div className="dashboard-recent">
          <h2>Быстрые действия</h2>
          <div className="quick-actions">
            <Link to="/games" className="quick-action-btn">
              <span className="action-icon">🎮</span>
              <span className="action-text">Создать игру</span>
            </Link>
            <Link to="/templates" className="quick-action-btn">
              <span className="action-icon">📋</span>
              <span className="action-text">Создать шаблон</span>
            </Link>
            <Link to="/teams" className="quick-action-btn">
              <span className="action-icon">👥</span>
              <span className="action-text">Управление командами</span>
            </Link>
            <div className="quick-action-btn disabled">
              <span className="action-icon">📊</span>
              <span className="action-text">Просмотр статистики</span>
            </div>
          </div>
        </div>

        <div className="dashboard-info">
          <h2>Информация о системе</h2>
          <div className="info-cards">
            <div className="info-card">
              <h3>Ваша роль</h3>
              <p className="role-badge">{roleInfo.currentRole}</p>
              <p className="role-description">
                {roleInfo.currentRole === 'admin' && 'Полный доступ ко всем функциям системы'}
                {roleInfo.currentRole === 'owner' && 'Права владельца организации'}
                {roleInfo.currentRole === 'moderator' && 'Права модератора игр'}
                {!['admin', 'owner', 'moderator'].includes(roleInfo.currentRole || '') && 'Базовые права пользователя'}
              </p>
            </div>

            <div className="info-card">
              <h3>Статус системы</h3>
              <div className="status-indicators">
                <div className="status-item">
                  <span className="status-dot active"></span>
                  <span>Система работает</span>
                </div>
                <div className="status-item">
                  <span className="status-dot active"></span>
                  <span>База данных подключена</span>
                </div>
                <div className="status-item">
                  <span className="status-dot active"></span>
                  <span>API доступен</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Полезные ссылки</h3>
              <div className="help-links">
                <a href="/games" className="help-link">📖 Документация по играм</a>
                <a href="/templates" className="help-link">📋 Руководство по шаблонам</a>
                <a href="/teams" className="help-link">👥 Управление командами</a>
                <div className="help-link disabled">📊 Аналитика и отчеты</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
