import { API_BASE_URL } from '../config/api.config';
import {
    CreateTeamDto,
    Team,
    TeamListResult,
    TeamQueryDto,
    TeamSearchResult,
    TeamStats,
    UpdateTeamDto
} from '../types/team.types';

/**
 * Сервис для работы с командами
 */
export class TeamService {
  private baseUrl = `${API_BASE_URL}/teams`;

  /**
   * Получить список команд с пагинацией и фильтрацией
   */
  async getTeams(query: TeamQueryDto = {}): Promise<TeamListResult> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.organizationId) params.append('organizationId', query.organizationId.toString());

    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения команд: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Получить команду по ID
   */
  async getTeamById(id: string): Promise<Team> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения команды: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Создать новую команду
   */
  async createTeam(teamData: CreateTeamDto): Promise<Team> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(teamData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Ошибка создания команды: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Обновить команду
   */
  async updateTeam(id: string, teamData: UpdateTeamDto): Promise<Team> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(teamData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Ошибка обновления команды: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Удалить команду
   */
  async deleteTeam(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Ошибка удаления команды: ${response.statusText}`);
    }
  }

  /**
   * Поиск команд
   */
  async searchTeams(query: string, limit: number = 10): Promise<TeamSearchResult> {
    const params = new URLSearchParams();
    params.append('search', query);
    params.append('limit', limit.toString());

    const response = await fetch(`${this.baseUrl}/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка поиска команд: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Получить статистику команд
   */
  async getTeamStats(): Promise<TeamStats> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения статистики команд: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Получить команды организации
   */
  async getTeamsByOrganization(organizationId: number): Promise<Team[]> {
    const response = await fetch(`${this.baseUrl}/organization/${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения команд организации: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Проверить уникальность номера стола
   */
  async checkTableNumber(tableNumber: number, organizationId: number, excludeTeamId?: string): Promise<boolean> {
    const params = new URLSearchParams();
    if (excludeTeamId) {
      params.append('excludeId', excludeTeamId);
    }

    const response = await fetch(`${this.baseUrl}/check-table/${tableNumber}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка проверки номера стола: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.isUnique;
  }

  /**
   * Получить следующий доступный номер стола
   */
  async getNextTableNumber(): Promise<number> {
    const response = await fetch(`${this.baseUrl}/next-table-number`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Ошибка получения номера стола: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.nextTableNumber;
  }

  /**
   * Валидировать номера столов
   */
  async validateTableNumbers(tableNumbers: number[]): Promise<{ valid: boolean; conflicts: Array<{ tableNumber: number; team: Team }> }> {
    const response = await fetch(`${this.baseUrl}/validate-table-numbers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ tableNumbers })
    });

    if (!response.ok) {
      throw new Error(`Ошибка валидации номеров столов: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }
}

// Экспортируем экземпляр сервиса
export const teamService = new TeamService();
