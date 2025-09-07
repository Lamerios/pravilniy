import React, { useCallback, useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileUpload: (file: File) => Promise<string>;
  accept?: string;
  maxSize?: number; // в байтах
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  showPreview?: boolean;
  currentUrl?: string | undefined;
}

/**
 * Компонент загрузки файлов
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileUpload,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
  disabled = false,
  placeholder = 'Выберите файл или перетащите сюда',
  showPreview = true,
  currentUrl
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Проверка размера файла
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return `Размер файла не должен превышать ${maxSizeMB}MB`;
    }

    // Проверка типа файла
    if (accept && accept !== '*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type);
        }
        if (type.includes('*')) {
          const baseType = type.replace('*', '');
          return fileType.startsWith(baseType);
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `Неподдерживаемый тип файла. Разрешены: ${accept}`;
      }
    }

    return null;
  }, [accept, maxSize]);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);

    // Валидация файла
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Создание превью
    if (showPreview && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    // Вызов callback для выбора файла
    onFileSelect(file);

    // Автоматическая загрузка файла
    try {
      setIsUploading(true);
      const uploadedUrl = await onFileUpload(file);
      setPreviewUrl(uploadedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, onFileSelect, onFileUpload, showPreview]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`file-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="file-upload__input"
        disabled={disabled}
      />

      <div
        className={`file-upload__dropzone ${
          isDragging ? 'file-upload__dropzone--dragging' : ''
        } ${disabled ? 'file-upload__dropzone--disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {showPreview && previewUrl ? (
          <div className="file-upload__preview">
            <img src={previewUrl} alt="Preview" className="file-upload__preview-image" />
            <div className="file-upload__preview-overlay">
              <button
                type="button"
                className="file-upload__remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled}
              >
                <i className="icon icon--close"></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="file-upload__placeholder">
            <div className="file-upload__icon">
              {isUploading ? (
                <div className="spinner spinner--sm"></div>
              ) : (
                <i className="icon icon--upload"></i>
              )}
            </div>
            <div className="file-upload__text">
              <p className="file-upload__primary-text">
                {isUploading ? 'Загрузка...' : placeholder}
              </p>
              <p className="file-upload__secondary-text">
                Максимальный размер: {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="file-upload__error">
          <i className="icon icon--warning"></i>
          <span>{error}</span>
        </div>
      )}

      {isUploading && (
        <div className="file-upload__progress">
          <div className="file-upload__progress-bar">
            <div className="file-upload__progress-fill"></div>
          </div>
          <span className="file-upload__progress-text">Загрузка файла...</span>
        </div>
      )}
    </div>
  );
};
