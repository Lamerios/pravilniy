import React from 'react';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  connected: boolean;
  connecting: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  onReconnect: () => void;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connected,
  connecting,
  reconnectAttempts,
  maxReconnectAttempts,
  onReconnect,
  className = ''
}) => {
  const getStatusText = () => {
    if (connecting) {
      return 'Подключение...';
    }

    if (connected) {
      return '🟢 Подключено';
    }

    if (reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts) {
      return `🟡 Переподключение (${reconnectAttempts}/${maxReconnectAttempts})`;
    }

    if (reconnectAttempts >= maxReconnectAttempts) {
      return '🔴 Ошибка подключения';
    }

    return '🔴 Отключено';
  };

  const getStatusClass = () => {
    if (connecting) return 'connecting';
    if (connected) return 'connected';
    if (reconnectAttempts >= maxReconnectAttempts) return 'error';
    return 'disconnected';
  };

  const showReconnectButton = !connected && !connecting && reconnectAttempts >= maxReconnectAttempts;

  return (
    <div className={`connection-status ${className} ${getStatusClass()}`}>
      <div className="status-indicator">
        <span className="status-text">{getStatusText()}</span>
        {connecting && <div className="loading-dots">
          <span />
          <span />
          <span />
        </div>}
      </div>

      {showReconnectButton && (
        <button
          className="reconnect-button"
          onClick={onReconnect}
          title="Попробовать переподключиться"
        >
          Переподключиться
        </button>
      )}

      {!connected && reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts && (
        <div className="reconnect-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(reconnectAttempts / maxReconnectAttempts) * 100}%` }}
             />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
