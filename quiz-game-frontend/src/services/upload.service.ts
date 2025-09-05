import { API_BASE_URL } from '../config/api.config';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Сервис для загрузки файлов
 */
export class UploadService {
  private baseUrl = `${API_BASE_URL}/upload`;

  /**
   * Загрузить файл
   */
  async uploadFile(file: File, type: 'logo' | 'avatar' | 'document' = 'logo'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Ошибка загрузки файла: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Загрузить логотип команды
   */
  async uploadTeamLogo(file: File): Promise<string> {
    const result = await this.uploadFile(file, 'logo');
    return result.url;
  }

  /**
   * Загрузить аватар пользователя
   */
  async uploadUserAvatar(file: File): Promise<string> {
    const result = await this.uploadFile(file, 'avatar');
    return result.url;
  }

  /**
   * Загрузить документ
   */
  async uploadDocument(file: File): Promise<UploadResponse> {
    return this.uploadFile(file, 'document');
  }

  /**
   * Удалить файл
   */
  async deleteFile(url: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Ошибка удаления файла: ${response.statusText}`);
    }
  }

  /**
   * Получить информацию о файле
   */
  async getFileInfo(url: string): Promise<UploadResponse> {
    const response = await fetch(`${this.baseUrl}/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения информации о файле: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }
}

// Экспортируем экземпляр сервиса
export const uploadService = new UploadService();
