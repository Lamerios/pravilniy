import { Team } from '../models/team.model';
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
export interface CreateTeamDto {
    name: string;
    description?: string;
    captain?: string;
    members?: TeamMember[];
    contactInfo?: ContactInfo;
    tableNumber?: number;
    logoUrl?: string;
    isActive?: boolean;
}
export interface UpdateTeamDto {
    name?: string;
    description?: string;
    captain?: string;
    members?: TeamMember[];
    contactInfo?: ContactInfo;
    tableNumber?: number;
    logoUrl?: string;
    isActive?: boolean;
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
    averageMembersPerTeam: number;
    recentTeams: Array<{
        id: string;
        name: string;
        createdAt: string;
    }>;
    popularTeams: Array<{
        teamId: string;
        teamName: string;
        gamesPlayed: number;
    }>;
}
export interface TeamSearchResult {
    teams: Team[];
    total: number;
    query: string;
}
//# sourceMappingURL=team.types.d.ts.map