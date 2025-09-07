import { Transaction } from 'sequelize';
export interface TeamPosition {
    teamId: number;
    teamName: string;
    tableNumber?: number | undefined;
    totalPoints: number;
    position: number;
    previousPosition?: number | undefined;
    positionChange: 'up' | 'down' | 'same' | 'new';
    lastUpdated: Date;
}
export interface PositionCalculationResult {
    positions: TeamPosition[];
    changes: Array<{
        teamId: number;
        teamName: string;
        oldPosition?: number | undefined;
        newPosition: number;
        change: 'up' | 'down' | 'same' | 'new';
    }>;
}
export declare class PositionService {
    recalculateGamePositions(gameId: number, transaction?: Transaction): Promise<PositionCalculationResult>;
    private getCurrentPositions;
    private getTeamsWithTotalScores;
    private calculatePositions;
    private calculatePositionChanges;
    private updatePositionsInDatabase;
    getGameLeaderboard(gameId: number): Promise<TeamPosition[]>;
    getTeamPosition(gameId: number, teamId: number): Promise<number>;
}
//# sourceMappingURL=position.service.d.ts.map