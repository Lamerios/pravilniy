import React, { useState, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { uploadService } from '../services/upload.service';

interface TeamLogoUploadProps {
  currentLogoUrl?: string;
  onLogoChange: (logoUrl: string | null) => void;
  teamId?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Компонент загрузки логотипа команды
 */
export const TeamLogoUpload: React.FC<TeamLogoUploadProps> = ({
  currentLogoUrl,
  onLogoChange,
  teamId,
  disabled = false,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    // Файл выбран, но еще не загружен
    // Загрузка произойдет автоматически в handleFileUpload
  }, []);

  const handleFileUpload = useCallback(async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      setError(null);

      // Загружаем файл
      const logoUrl = await uploadService.uploadTeamLogo(file);
      
      // Уведомляем родительский компонент об изменении
      onLogoChange(logoUrl);
      
      return logoUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки логотипа';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [onLogoChange]);

  const handleRemove = useCallback(async () => {
    try {
      if (currentLogoUrl) {
        // Удаляем файл с сервера
        await uploadService.deleteFile(currentLogoUrl);
      }
      
      // Уведомляем родительский компонент об удалении
      onLogoChange(null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления логотипа';
      setError(errorMessage);
    }
  }, [currentLogoUrl, onLogoChange]);

  return (
    <div className={`team-logo-upload ${className}`}>
      <div className="team-logo-upload__header">
        <h4 className="team-logo-upload__title">Логотип команды</h4>
        {currentLogoUrl && (
          <button
            type="button"
            className="btn btn--sm btn--ghost team-logo-upload__remove"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <i className="icon icon--trash"></i>
            Удалить
          </button>
        )}
      </div>

      <div className="team-logo-upload__content">
        <FileUpload
          onFileSelect={handleFileSelect}
          onFileUpload={handleFileUpload}
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          maxSize={2 * 1024 * 1024} // 2MB
          currentUrl={currentLogoUrl}
          disabled={disabled || isUploading}
          placeholder="Выберите логотип команды"
          showPreview={true}
          className="team-logo-upload__file-upload"
        />

        {error && (
          <div className="team-logo-upload__error">
            <i className="icon icon--warning"></i>
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="team-logo-upload__help">
        <p className="team-logo-upload__help-text">
          <strong>Требования к логотипу:</strong>
        </p>
        <ul className="team-logo-upload__help-list">
          <li>Формат: JPG, PNG, GIF, WebP</li>
          <li>Максимальный размер: 2MB</li>
          <li>Рекомендуемые размеры: 200x200px или больше</li>
          <li>Квадратное изображение предпочтительно</li>
        </ul>
      </div>
    </div>
  );
};
