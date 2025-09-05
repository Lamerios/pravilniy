import { Model } from 'sequelize-typescript';
import { Game } from './game.model';
import { Round } from './round.model';
import { Team } from './team.model';
import { User } from './user.model';
export declare enum ScoreType {
    ROUND_SCORE = "ROUND_SCORE",
    BONUS = "BONUS",
    PENALTY = "PENALTY",
    PARTICIPATION = "PARTICIPATION",
    MANUAL = "MANUAL",
    ADJUSTMENT = "ADJUSTMENT"
}
export interface ScoreMetadata {
    calculationMethod?: string;
    originalPoints?: number;
    adjustmentReason?: string;
    automaticCalculation?: boolean;
    [key: string]: any;
}
export declare class Score extends Model<Score> {
    id: string;
    gameId: string;
    teamId: string;
    roundId?: string;
    scoreType: ScoreType;
    points: number;
    basePoints: number;
    bonusPoints: number;
    multiplier: number;
    reason?: string;
    description?: string;
    questionNumber?: number;
    roundNumber?: number;
    isValid: boolean;
    isManual: boolean;
    metadata?: ScoreMetadata;
    awardedBy?: string;
    awardedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    game: Game;
    team: Team;
    round?: Round;
    awarder?: User;
    isPositive(): boolean;
    isNegative(): boolean;
    isBonus(): boolean;
    isPenalty(): boolean;
    getEffectivePoints(): number;
    getScoreBreakdown(): {
        base: number;
        bonus: number;
        multiplier: number;
        total: number;
    };
    static getTeamTotalScore(teamId: string, gameId?: string): Promise<number>;
    static getTeamScoreByRound(teamId: string, gameId: string): Promise<Map<string, number>>;
}
//# sourceMappingURL=score.model.d.ts.map