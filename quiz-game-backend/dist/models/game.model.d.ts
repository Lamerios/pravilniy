import { Model } from 'sequelize-typescript';
import { GameTemplate } from './game-template.model';
import { Organization } from './organization.model';
import { Round } from './round.model';
import { Team } from './team.model';
import { User } from './user.model';
export declare enum GameStatus {
    DRAFT = "DRAFT",
    WAITING = "WAITING",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    FINISHED = "FINISHED",
    CANCELLED = "CANCELLED"
}
export interface ScoringSystem {
    basePoints: number;
    timeBonus: boolean;
    penaltyForWrong: boolean;
    streakBonus: boolean;
}
export interface GameSettings {
    allowLateJoin?: boolean;
    autoStart?: boolean;
    showScores?: boolean;
    allowHints?: boolean;
    [key: string]: any;
}
export interface GameData {
    configuration?: any;
    rules?: string;
    notes?: string;
    [key: string]: any;
}
export declare class Game extends Model<Game> {
    id: string;
    organizationId: string;
    templateId: string;
    createdBy: string;
    name: string;
    description?: string;
    gameCode: string;
    status: GameStatus;
    maxTeams: number;
    maxPlayersPerTeam: number;
    currentRound: number;
    totalRounds: number;
    timeLimit?: number;
    roundTimeLimit?: number;
    questionTimeLimit?: number;
    settings?: GameSettings;
    gameData?: GameData;
    scoringSystem?: ScoringSystem;
    startedAt?: Date;
    finishedAt?: Date;
    scheduledAt?: Date;
    isPublic: boolean;
    allowLateJoin: boolean;
    autoStart: boolean;
    createdAt: Date;
    updatedAt: Date;
    organization: Organization;
    template: GameTemplate;
    creator: User;
    teams: Team[];
    rounds: Round[];
    isActive(): boolean;
    isFinished(): boolean;
    canJoin(): boolean;
    getDuration(): number | null;
}
//# sourceMappingURL=game.model.d.ts.map