import { Model } from 'sequelize-typescript';
import { Game } from './game.model';
import { GameTemplate } from './game-template.model';
export declare enum RoundType {
    STANDARD = "STANDARD",
    BLITZ = "BLITZ",
    BONUS = "BONUS",
    FINAL = "FINAL",
    TIEBREAKER = "TIEBREAKER"
}
export declare enum RoundStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    FINISHED = "FINISHED",
    CANCELLED = "CANCELLED"
}
export interface RoundSettings {
    shuffleQuestions?: boolean;
    showAnswers?: boolean;
    allowRetries?: boolean;
    [key: string]: any;
}
export interface RoundStatistics {
    totalAnswers: number;
    correctAnswers: number;
    averageTime: number;
    participatingTeams: number;
    [key: string]: any;
}
export declare class Round extends Model<Round> {
    id: string;
    gameId: string;
    templateId?: number;
    roundNumber: number;
    name: string;
    description?: string;
    type: RoundType;
    status: RoundStatus;
    timeLimit?: number;
    questionTimeLimit?: number;
    totalQuestions: number;
    currentQuestion: number;
    maxPoints: number;
    multiplier: number;
    settings?: RoundSettings;
    statistics?: RoundStatistics;
    startedAt?: Date;
    finishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    game: Game;
    template?: GameTemplate;
    isActive(): boolean;
    isFinished(): boolean;
    getDuration(): number | null;
    getProgressPercentage(): number;
}
//# sourceMappingURL=round.model.d.ts.map