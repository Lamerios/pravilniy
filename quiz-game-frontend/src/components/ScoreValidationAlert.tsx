import React from 'react';

export interface ValidationAlert {
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  details?: string;
}

interface ScoreValidationAlertProps {
  alerts: ValidationAlert[];
  onDismiss?: (index: number) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
  className?: string;
}

export const ScoreValidationAlert: React.FC<ScoreValidationAlertProps> = ({
  alerts,
  onDismiss,
  onConfirm,
  onCancel,
  showActions = false,
  className = ''
}) => {
  if (alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type: ValidationAlert['type']): string => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const getAlertClass = (type: ValidationAlert['type']): string => {
    switch (type) {
      case 'warning':
        return 'alert-warning';
      case 'error':
        return 'alert-error';
      case 'info':
        return 'alert-info';
      case 'success':
        return 'alert-success';
      default:
        return 'alert-info';
    }
  };

  return (
    <div className={`score-validation-alerts ${className}`}>
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`validation-alert ${getAlertClass(alert.type)}`}
        >
          <div className="alert-content">
            <div className="alert-header">
              <span className="alert-icon">{getAlertIcon(alert.type)}</span>
              <span className="alert-message">{alert.message}</span>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(index)}
                  className="alert-dismiss"
                  title="Закрыть"
                >
                  ×
                </button>
              )}
            </div>
            {alert.details && (
              <div className="alert-details">{alert.details}</div>
            )}
          </div>
        </div>
      ))}

      {showActions && (onConfirm || onCancel) && (
        <div className="alert-actions">
          {onCancel && (
            <button
              onClick={onCancel}
              className="btn btn--secondary"
            >
              Отмена
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="btn btn--primary"
            >
              Продолжить
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Компонент для критических предупреждений с подтверждением
interface CriticalScoreAlertProps {
  points: number;
  teamName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const CriticalScoreAlert: React.FC<CriticalScoreAlertProps> = ({
  points,
  teamName,
  onConfirm,
  onCancel,
  isVisible
}) => {
  if (!isVisible) {
    return null;
  }

  const isCriticallyLow = points < -50;
  const isCriticallyHigh = points > 500;
  const isNegative = points < 0;

  const getAlertTitle = (): string => {
    if (isCriticallyLow) {
      return 'Критически низкие баллы';
    }
    if (isCriticallyHigh) {
      return 'Критически высокие баллы';
    }
    if (isNegative) {
      return 'Отрицательные баллы';
    }
    return 'Подтверждение ввода';
  };

  const getAlertMessage = (): string => {
    const teamText = teamName ? ` для команды "${teamName}"` : '';

    if (isCriticallyLow) {
      return `Вы вводите ${points} баллов${teamText}. Это критически низкое значение. Убедитесь в корректности данных.`;
    }
    if (isCriticallyHigh) {
      return `Вы вводите ${points} баллов${teamText}. Это критически высокое значение. Убедитесь в корректности данных.`;
    }
    if (isNegative) {
      return `Вы вводите ${points} баллов${teamText}. Отрицательные баллы обычно используются для штрафов.`;
    }
    return `Подтвердите ввод ${points} баллов${teamText}.`;
  };

  return (
    <div className="critical-score-overlay">
      <div className="critical-score-modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {isCriticallyLow || isCriticallyHigh ? '⚠️' : '❓'} {getAlertTitle()}
          </h3>
        </div>

        <div className="modal-content">
          <p className="alert-message">{getAlertMessage()}</p>

          <div className="score-preview">
            <div className="preview-label">Вводимые баллы:</div>
            <div className={`preview-value ${points < 0 ? 'negative' : 'positive'}`}>
              {points}
            </div>
          </div>

          {(isCriticallyLow || isCriticallyHigh) && (
            <div className="warning-tips">
              <p><strong>Возможные причины:</strong></p>
              <ul>
                <li>Ошибка при вводе данных</li>
                <li>Неправильная интерпретация результатов</li>
                <li>Технический сбой в подсчете</li>
              </ul>
              <p><strong>Рекомендуем:</strong> проверить исходные данные перед подтверждением.</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button
            onClick={onCancel}
            className="btn btn--secondary"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="btn btn--warning"
          >
            Подтвердить ввод
          </button>
        </div>
      </div>
    </div>
  );
};

// Хук для управления валидационными алертами
export const useValidationAlerts = () => {
  const [alerts, setAlerts] = React.useState<ValidationAlert[]>([]);

  const addAlert = (alert: ValidationAlert) => {
    setAlerts(prev => [...prev, alert]);
  };

  const removeAlert = (index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const validatePoints = (points: number): ValidationAlert[] => {
    const validationAlerts: ValidationAlert[] = [];

    if (points < -100) {
      validationAlerts.push({
        type: 'warning',
        message: 'Критически низкие баллы',
        details: 'Убедитесь в корректности ввода данных'
      });
    } else if (points < 0) {
      validationAlerts.push({
        type: 'info',
        message: 'Отрицательные баллы',
        details: 'Обычно используются для штрафов'
      });
    }

    if (points > 1000) {
      validationAlerts.push({
        type: 'warning',
        message: 'Критически высокие баллы',
        details: 'Убедитесь в корректности ввода данных'
      });
    }

    return validationAlerts;
  };

  const validateBet = (bet: number, betType: string): ValidationAlert[] => {
    const validationAlerts: ValidationAlert[] = [];

    switch (betType) {
      case 'MULTIPLIER':
        if (bet < 0.1 || bet > 10) {
          validationAlerts.push({
            type: 'error',
            message: 'Неверный множитель',
            details: 'Множитель должен быть от 0.1 до 10'
          });
        }
        break;
      case 'BONUS':
        if (bet < -100 || bet > 100) {
          validationAlerts.push({
            type: 'error',
            message: 'Неверный бонус',
            details: 'Бонус должен быть от -100 до 100'
          });
        }
        break;
      case 'FIXED':
        if (bet < 0 || bet > 1000) {
          validationAlerts.push({
            type: 'error',
            message: 'Неверные фиксированные баллы',
            details: 'Фиксированные баллы должны быть от 0 до 1000'
          });
        }
        break;
    }

    return validationAlerts;
  };

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    validatePoints,
    validateBet
  };
};


