import { Game } from '../models/game.model';

export interface CreateGameDto {
  name: string;
  description?: string;
  templateId: number;
  scheduledAt?: Date;
  teamIds?: string[]; // ID команд для добавления в игру
  settings?: {
    maxTeams?: number;
    allowLateJoin?: boolean;
    autoStart?: boolean;
    timeLimit?: number;
    customRules?: Record<string, any>;
  };
}

export interface UpdateGameDto {
  name?: string;
  description?: string;
  scheduledAt?: Date;
  teamIds?: string[]; // ID команд для добавления/удаления из игры
  settings?: {
    maxTeams?: number;
    allowLateJoin?: boolean;
    autoStart?: boolean;
    timeLimit?: number;
    customRules?: Record<string, any>;
  };
}

export interface GameQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: 'draft' | 'scheduled' | 'active' | 'paused' | 'finished' | 'cancelled';
  templateId?: number | undefined;
  organizationId?: number | undefined;
}

export interface GameListResult {
  games: Game[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface GameStats {
  totalGames: number;
  activeGames: number;
  finishedGames: number;
  draftGames: number;
  scheduledGames: number;
  gamesByStatus: Array<{
    status: string;
    count: number;
  }>;
  recentGames: Array<{
    id: string;
    name: string;
    status: string;
    createdAt: Date;
  }>;
  popularTemplates: Array<{
    templateId: number;
    templateName: string;
    usageCount: number;
  }>;
}

export interface GameValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface GameStateChangeDto {
  action: 'start' | 'pause' | 'resume' | 'stop' | 'finish';
  reason?: string;
}
