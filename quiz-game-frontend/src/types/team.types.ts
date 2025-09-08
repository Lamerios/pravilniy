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
  email?: string | undefined;
  phone?: string | undefined;
  address?: string | undefined;
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
  description?: string | undefined;
  tableNumber?: number | undefined;
  logoUrl?: string | undefined;
  members?: TeamMember[] | undefined;
  contactInfo?: ContactInfo | undefined;
}

export interface UpdateTeamDto {
  name?: string | undefined;
  description?: string | undefined;
  tableNumber?: number | undefined;
  logoUrl?: string | undefined;
  members?: TeamMember[] | undefined;
  contactInfo?: ContactInfo | undefined;
  isActive?: boolean | undefined;
}

export interface TeamQueryDto {
  page?: number | undefined;
  limit?: number | undefined;
  search?: string | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'ASC' | 'DESC' | undefined;
  isActive?: boolean | undefined;
  organizationId?: number | undefined;
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
  search?: string | undefined;
  isActive?: boolean | undefined;
  sortBy?: string | undefined;
  sortOrder?: 'ASC' | 'DESC' | undefined;
}

export interface TeamSelection {
  teamId: string;
  team: Team;
  selected: boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}
