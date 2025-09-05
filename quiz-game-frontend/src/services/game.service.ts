import {
    CreateGameDto,
    Game,
    GameListResult,
    GameQueryDto,
    GameStateChangeDto,
    GameStats,
    UpdateGameDto
} from '../types/game.types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

class GameService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('accessToken');

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
   * Получить список игр с пагинацией и фильтрацией
   */
  async getGames(query: GameQueryDto = {}): Promise<GameListResult> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query.status) params.append('status', query.status);
    if (query.templateId) params.append('templateId', query.templateId.toString());
    if (query.organizationId) params.append('organizationId', query.organizationId.toString());

    const queryString = params.toString();
    const endpoint = `/games${queryString ? `?${queryString}` : ''}`;

    return this.request<GameListResult>(endpoint);
  }

  /**
   * Получить игру по ID
   */
  async getGameById(id: string): Promise<{ success: boolean; data: Game; message: string }> {
    return this.request<{ success: boolean; data: Game; message: string }>(`/games/${id}`);
  }

  /**
   * Создать новую игру
   */
  async createGame(gameData: CreateGameDto): Promise<{ success: boolean; data: Game; message: string }> {
    return this.request<{ success: boolean; data: Game; message: string }>('/games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  /**
   * Обновить игру
   */
  async updateGame(id: string, gameData: UpdateGameDto): Promise<{ success: boolean; data: Game; message: string }> {
    return this.request<{ success: boolean; data: Game; message: string }>(`/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gameData),
    });
  }

  /**
   * Удалить игру
   */
  async deleteGame(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/games/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Поиск игр
   */
  async searchGames(query: GameQueryDto): Promise<GameListResult> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('q', query.search);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString();
    const endpoint = `/games/search${queryString ? `?${queryString}` : ''}`;

    return this.request<GameListResult>(endpoint);
  }

  /**
   * Получить статистику игр
   */
  async getGameStats(): Promise<{ success: boolean; data: GameStats; message: string }> {
    return this.request<{ success: boolean; data: GameStats; message: string }>('/games/stats');
  }

  /**
   * Запустить игру
   */
  async startGame(id: string, reason?: string): Promise<{ success: boolean; data: Game; message: string }> {
    return this.request<{ success: boolean; data: Game; message: string }>(`/games/${id}/start`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Остановить игру
   */
  async stopGame(id: string, reason?: string): Promise<{ success: boolean; data: Game; message: string }> {
    return this.request<{ success: boolean; data: Game; message: string }>(`/games/${id}/stop`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Приостановить игру
   */
  async pauseGame(id: string, reason?: string): Promise<{ success: boolean; data: Game; message: string }> {
    return this.request<{ success: boolean; data: Game; message: string }>(`/games/${id}/pause`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Возобновить игру
   */
  async resumeGame(id: string, reason?: string): Promise<{ success: boolean; data: Game; message: string }> {
    return this.request<{ success: boolean; data: Game; message: string }>(`/games/${id}/resume`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Изменить состояние игры
   */
  async changeGameState(id: string, stateChange: GameStateChangeDto): Promise<{ success: boolean; data: Game; message: string }> {
    const actionMap: Record<string, string> = {
      start: 'start',
      pause: 'pause',
      resume: 'resume',
      stop: 'stop',
      finish: 'stop'
    };

    const endpoint = actionMap[stateChange.action];
    if (!endpoint) {
      throw new Error('Неверное действие');
    }

    return this.request<{ success: boolean; data: Game; message: string }>(`/games/${id}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify({ reason: stateChange.reason }),
    });
  }
}

export const gameService = new GameService();
