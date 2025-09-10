import {
  CreateTemplateDto,
  GameTemplate,
  TemplateListResult,
  TemplateQueryDto,
  TemplateStats,
  UpdateTemplateDto
} from '../types/template.types';
import { getAccessToken } from '../utils/storage';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

class TemplateService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAccessToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Получить список шаблонов с пагинацией и фильтрацией
   */
  async getTemplates(query: TemplateQueryDto = {}): Promise<TemplateListResult> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString();
    const endpoint = `/templates${queryString ? `?${queryString}` : ''}`;

    const response = await this.request<{ success: boolean; data: GameTemplate[]; pagination: any }>(endpoint);
    
    // Преобразуем ответ API в формат, ожидаемый frontend
    return {
      templates: response.data,
      currentPage: response.pagination.currentPage,
      totalPages: response.pagination.totalPages,
      totalItems: response.pagination.totalItems,
      itemsPerPage: response.pagination.itemsPerPage
    };
  }

  /**
   * Получить шаблон по ID
   */
  async getTemplateById(id: string): Promise<{ success: boolean; data: GameTemplate; message: string }> {
    return this.request<{ success: boolean; data: GameTemplate; message: string }>(`/templates/${id}`);
  }

  /**
   * Создать новый шаблон
   */
  async createTemplate(templateData: CreateTemplateDto): Promise<{ success: boolean; data: GameTemplate; message: string }> {
    return this.request<{ success: boolean; data: GameTemplate; message: string }>('/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  /**
   * Обновить шаблон
   */
  async updateTemplate(id: string, templateData: UpdateTemplateDto): Promise<{ success: boolean; data: GameTemplate; message: string }> {
    return this.request<{ success: boolean; data: GameTemplate; message: string }>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  }

  /**
   * Удалить шаблон
   */
  async deleteTemplate(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/templates/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Поиск шаблонов
   */
  async searchTemplates(query: TemplateQueryDto): Promise<TemplateListResult> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('q', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString();
    const endpoint = `/templates/search${queryString ? `?${queryString}` : ''}`;

    return this.request<TemplateListResult>(endpoint);
  }

  /**
   * Получить статистику шаблонов
   */
  async getTemplateStats(): Promise<{ success: boolean; data: TemplateStats; message: string }> {
    return this.request<{ success: boolean; data: TemplateStats; message: string }>('/templates/stats');
  }
}

export const templateService = new TemplateService();
