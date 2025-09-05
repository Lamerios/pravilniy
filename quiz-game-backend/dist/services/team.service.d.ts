import { Team } from '../models/team.model';
import { CreateTeamDto, TeamListResult, TeamQueryDto, TeamSearchResult, TeamStats, UpdateTeamDto } from '../types/team.types';
export declare class TeamService {
    getTeams(query?: TeamQueryDto): Promise<TeamListResult>;
    getTeamById(id: string): Promise<Team | null>;
    createTeam(teamData: CreateTeamDto, organizationId: number): Promise<Team>;
    updateTeam(id: string, teamData: UpdateTeamDto): Promise<Team | null>;
    deleteTeam(id: string): Promise<boolean>;
    searchTeams(query: TeamQueryDto): Promise<TeamSearchResult>;
    getTeamStats(organizationId?: number): Promise<TeamStats>;
    getTeamsByOrganization(organizationId: string, isActive?: boolean): Promise<Team[]>;
    isTableNumberUnique(organizationId: number, tableNumber: number, excludeId?: string): Promise<boolean>;
}
export declare const teamService: TeamService;
//# sourceMappingURL=team.service.d.ts.map