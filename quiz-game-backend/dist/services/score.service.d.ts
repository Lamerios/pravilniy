import { Score } from '../models/score.model';
import { BulkScoreDto, BulkScoreResult, CreateScoreDto, GameScoreStats, ScoreCorrectionDto, ScoreCorrectionHistory, ScoreListResult, ScoreQueryDto, ScoreResponse, TeamScoreStats, UpdateScoreDto } from '../types/score.types';
export declare class ScoreService {
    createScore(scoreData: CreateScoreDto, enteredBy?: number): Promise<Score>;
    updateScore(scoreId: number, scoreData: UpdateScoreDto): Promise<Score | null>;
    getScoreById(scoreId: number): Promise<Score | null>;
    getScores(query?: ScoreQueryDto): Promise<ScoreListResult>;
    getTeamScores(gameId: number, teamId: number): Promise<ScoreResponse[]>;
    getTeamScoreStats(gameId: number, teamId: number): Promise<TeamScoreStats>;
    getGameScoreStats(gameId: number): Promise<GameScoreStats>;
    bulkCreateScores(bulkData: BulkScoreDto, enteredBy?: number): Promise<BulkScoreResult>;
    correctScore(correctionData: ScoreCorrectionDto): Promise<Score>;
    getScoreCorrectionHistory(scoreId: number): Promise<ScoreCorrectionHistory[]>;
    deleteScore(scoreId: number): Promise<boolean>;
    private calculateTotalPoints;
    private mapScoreToResponse;
}
export declare const scoreService: ScoreService;
//# sourceMappingURL=score.service.d.ts.map