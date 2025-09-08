export interface Game {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  status: GameStatus;
  scheduledAt?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
  settings?: GameSettings;
  template?: GameTemplate;
  createdBy?: User;
  organization?: Organization;
}

export enum GameStatus {
  DRAFT = 'DRAFT',
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

export interface GameSettings {
  maxTeams?: number;
  allowLateJoin?: boolean;
  autoStart?: boolean;
  timeLimit?: number;
  customRules?: Record<string, any>;
}

export interface GameTemplate {
  id: string;
  name: string;
  description?: string;
  settings?: any;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface CreateGameDto {
  name: string;
  description?: string | undefined;
  templateId: number;
  scheduledAt?: string | undefined;
  settings?: GameSettings | undefined;
  teamIds?: number[] | undefined;
}

export interface UpdateGameDto {
  name?: string | undefined;
  description?: string | undefined;
  scheduledAt?: string | undefined;
  settings?: GameSettings | undefined;
}

export interface GameQueryDto {
  page?: number;
  limit?: number;
  search?: string | undefined;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: GameStatus | undefined;
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
    createdAt: string;
  }>;
  popularTemplates: Array<{
    templateId: number;
    templateName: string;
    usageCount: number;
  }>;
}

export interface GameStateChangeDto {
  action: 'start' | 'pause' | 'resume' | 'stop' | 'finish';
  reason?: string | undefined;
}

export interface GameFilters {
  search: string;
  status: GameStatus | '';
  templateId: number | '';
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  page: number;
  limit: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}
