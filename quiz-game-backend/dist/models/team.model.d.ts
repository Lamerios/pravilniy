import { Model } from 'sequelize-typescript';
import { Game } from './game.model';
import { Organization } from './organization.model';
import { Score } from './score.model';
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
export declare class Team extends Model<Team> {
    id: string;
    organizationId: string;
    gameId: string;
    name: string;
    description?: string;
    captain?: string;
    tableNumber?: number;
    logoUrl?: string;
    members?: TeamMember[];
    contactInfo?: ContactInfo;
    totalScore: number;
    currentRound: number;
    position?: number;
    bonusPoints: number;
    penaltyPoints: number;
    statistics?: TeamStatistics;
    joinedAt?: Date;
    lastActivity?: Date;
    isActive: boolean;
    isReady: boolean;
    createdAt: Date;
    updatedAt: Date;
    organization: Organization;
    games: Game[];
    scores: Score[];
    getFinalScore(): number;
    getAverageScore(): number;
    getMemberCount(): number;
    addMember(member: TeamMember): void;
    removeMember(memberName: string): boolean;
    updateStatistics(roundScore: number): void;
    isEligibleForPlay(): boolean;
}
//# sourceMappingURL=team.model.d.ts.map