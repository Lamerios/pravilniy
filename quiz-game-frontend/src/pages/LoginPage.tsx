/**
 * Страница входа в систему
 */

import { useNavigate } from 'react-router-dom';

import LoginForm from '../components/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();

  /**
   * Обработка успешного входа
   */
  const handleLoginSuccess = () => {
    // Перенаправляем на главную страницу после успешного входа
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-page-container">
        <div className="login-page-content">
          <div className="login-page-header">
            <div className="logo">
              <h1>Правильный Квиз</h1>
              <p>Система управления викторинами</p>
            </div>
          </div>

          <div className="login-page-form">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>

          <div className="login-page-footer">
            <div className="footer-info">
              <p>© 2024 Правильный Квиз. Все права защищены.</p>
              <p>Версия 1.0.0</p>
            </div>
          </div>
        </div>

        <div className="login-page-background">
          <div className="background-pattern" />
          <div className="background-overlay" />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
