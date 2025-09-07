import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { teamService } from '../services/team.service';

interface TableNumberValidatorProps {
  tableNumber: number | null;
  excludeTeamId?: string;
  onValidationChange?: (isValid: boolean, message?: string) => void;
  debounceMs?: number;
  showMessage?: boolean;
  className?: string;
}

interface ValidationState {
  isValid: boolean;
  isChecking: boolean;
  message: string;
  lastChecked: number | null;
}

/**
 * Компонент для валидации уникальности номера стола
 */
export const TableNumberValidator: React.FC<TableNumberValidatorProps> = ({
  tableNumber,
  excludeTeamId,
  onValidationChange,
  debounceMs = 500,
  showMessage = true,
  className = ''
}) => {
  const { user } = useAuth();
  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    isChecking: false,
    message: '',
    lastChecked: null
  });

  const validateTableNumber = useCallback(async (number: number) => {
    if (!user?.organizationId || number <= 0) {
      setValidation({
        isValid: true,
        isChecking: false,
        message: '',
        lastChecked: Date.now()
      });
      onValidationChange?.(true);
      return;
    }

    setValidation(prev => ({ ...prev, isChecking: true }));

    try {
      const isUnique = await teamService.checkTableNumber(number, parseInt(user.organizationId), excludeTeamId);

      const newValidation: ValidationState = {
        isValid: isUnique,
        isChecking: false,
        message: isUnique ? 'Номер стола свободен' : `Номер стола ${number} уже используется`,
        lastChecked: Date.now()
      };

      setValidation(newValidation);
      onValidationChange?.(isUnique, newValidation.message);
    } catch (error) {
      const newValidation: ValidationState = {
        isValid: false,
        isChecking: false,
        message: 'Ошибка проверки номера стола',
        lastChecked: Date.now()
      };

      setValidation(newValidation);
      onValidationChange?.(false, newValidation.message);
    }
  }, [user?.organizationId, excludeTeamId, onValidationChange]);

  // Debounced validation
  useEffect(() => {
    if (!tableNumber || tableNumber <= 0) {
      setValidation({
        isValid: true,
        isChecking: false,
        message: '',
        lastChecked: null
      });
      onValidationChange?.(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      validateTableNumber(tableNumber);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [tableNumber, debounceMs, validateTableNumber, onValidationChange]);

  if (!showMessage) {
    return null;
  }

  return (
    <div className={`table-number-validator ${className}`}>
      {validation.isChecking && (
        <div className="table-number-validator__checking">
          <div className="spinner spinner--sm"></div>
          <span>Проверка...</span>
        </div>
      )}

      {!validation.isChecking && validation.message && (
        <div className={`table-number-validator__message ${
          validation.isValid ? 'table-number-validator__message--valid' : 'table-number-validator__message--invalid'
        }`}>
          <i className={`icon icon--${validation.isValid ? 'check' : 'warning'}`}></i>
          <span>{validation.message}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Хук для валидации номера стола
 */
export const useTableNumberValidation = (
  tableNumber: number | null,
  excludeTeamId?: string,
  debounceMs: number = 500
) => {
  const { user } = useAuth();
  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    isChecking: false,
    message: '',
    lastChecked: null
  });

  const validateTableNumber = useCallback(async (number: number) => {
    if (!user?.organizationId || number <= 0) {
      setValidation({
        isValid: true,
        isChecking: false,
        message: '',
        lastChecked: Date.now()
      });
      return;
    }

    setValidation(prev => ({ ...prev, isChecking: true }));

    try {
      const isUnique = await teamService.checkTableNumber(number, parseInt(user.organizationId), excludeTeamId);

      setValidation({
        isValid: isUnique,
        isChecking: false,
        message: isUnique ? 'Номер стола свободен' : `Номер стола ${number} уже используется`,
        lastChecked: Date.now()
      });
    } catch (error) {
      setValidation({
        isValid: false,
        isChecking: false,
        message: 'Ошибка проверки номера стола',
        lastChecked: Date.now()
      });
    }
  }, [user?.organizationId, excludeTeamId]);

  useEffect(() => {
    if (!tableNumber || tableNumber <= 0) {
      setValidation({
        isValid: true,
        isChecking: false,
        message: '',
        lastChecked: null
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      validateTableNumber(tableNumber);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [tableNumber, debounceMs, validateTableNumber]);

  return validation;
};
