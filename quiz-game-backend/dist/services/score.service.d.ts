import { BulkScoreDto, BulkScoreResult, CreateScoreDto, GameScoreStats, ScoreCorrectionDto, ScoreCorrectionHistory, ScoreListResult, ScoreQueryDto, ScoreResponse, TeamScoreStats, UpdateScoreDto } from '../types/score.types';
export declare class ScoreService {
    private positionService;
    constructor();
    createScore(scoreData: CreateScoreDto): Promise<ScoreResponse>;
    updateScore(scoreId: number, scoreData: UpdateScoreDto): Promise<ScoreResponse | null>;
    getScoreById(scoreId: number): Promise<ScoreResponse | null>;
    getScores(query: ScoreQueryDto): Promise<ScoreListResult>;
    getTeamScores(gameId: number, teamId: number): Promise<ScoreResponse[]>;
    getTeamScoreStats(gameId: number, teamId: number): Promise<TeamScoreStats>;
    getGameScoreStats(gameId: number): Promise<GameScoreStats>;
    bulkCreateScores(bulkData: BulkScoreDto): Promise<BulkScoreResult>;
    correctScore(correctionData: ScoreCorrectionDto): Promise<ScoreResponse>;
    getScoreCorrectionHistory(scoreId: number): Promise<ScoreCorrectionHistory[]>;
    getGameScoresHistory(gameId: number, query: ScoreQueryDto): Promise<ScoreListResult>;
    getRoundScores(gameId: number, roundId: number): Promise<ScoreResponse[]>;
    getGameLeaderboard(gameId: number): Promise<{
        leaderboard: Array<{
            position: number;
            teamId: number;
            teamName: string;
            tableNumber?: number | undefined;
            totalPoints: number;
            roundsPlayed: number;
            averagePoints: number;
            lastActivity: string;
        }>;
        gameInfo: {
            gameId: number;
            gameName: string;
            totalRounds: number;
            totalTeams: number;
        };
    }>;
    getGameRoundsSummary(gameId: number): Promise<{
        rounds: Array<{
            roundId: number;
            roundName: string;
            roundNumber: number;
            totalScores: number;
            averagePoints: number;
            maxPoints: number;
            minPoints: number;
            teamsParticipated: number;
        }>;
    }>;
    deleteScore(scoreId: number): Promise<boolean>;
    private calculateTotalPoints;
    private validatePoints;
    private validateEntities;
    private validateBet;
    private mapScoreToResponse;
    getGameCorrections(gameId: number, options: {
        page: number;
        limit: number;
    }): Promise<{
        corrections: Array<{
            id: number;
            scoreId: number;
            teamName: string;
            roundName: string;
            oldPoints: number;
            newPoints: number;
            reason: string;
            correctedBy: string;
            correctedAt: Date;
        }>;
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    }>;
}
export declare const scoreService: ScoreService;
//# sourceMappingURL=score.service.d.ts.map