/**
 * Типы для работы с командами
 */

export interface TeamMember {
  name: string;
  email?: string;
  role?: string;
  joinedAt?: Date;
  [key: string]: any;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
}

export interface TeamStatistics {
  roundsPlayed: number;
  totalScore: number;
  averageScore: number;
  bestRound: number;
  worstRound: number;
  [key: string]: any;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  tableNumber?: number;
  logoUrl?: string;
  members: TeamMember[];
  contactInfo?: ContactInfo;
  statistics?: TeamStatistics;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  tableNumber?: number;
  logoUrl?: string;
  members?: TeamMember[];
  contactInfo?: ContactInfo;
}

export interface UpdateTeamDto {
  name?: string;
  description?: string;
  tableNumber?: number;
  logoUrl?: string;
  members?: TeamMember[];
  contactInfo?: ContactInfo;
  isActive?: boolean;
}

export interface TeamQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  isActive?: boolean;
  organizationId?: number;
}

export interface TeamListResult {
  teams: Team[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface TeamStats {
  totalTeams: number;
  activeTeams: number;
  inactiveTeams: number;
  teamsByStatus: Array<{
    status: string;
    count: number;
  }>;
  recentTeams: Array<{
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
  }>;
  popularTeams: Array<{
    teamId: string;
    teamName: string;
    gamesPlayed: number;
  }>;
}

export interface TeamSearchResult {
  teams: Team[];
  totalCount: number;
  hasMore: boolean;
}

export interface TeamFilters {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface TeamSelection {
  teamId: string;
  team: Team;
  selected: boolean;
}
