import { Server as HTTPServer } from 'http';
export declare class SocketService {
    private io;
    private connectedClients;
    constructor(httpServer: HTTPServer);
    private setupEventHandlers;
    private handleJoinGame;
    private handleLeaveGame;
    private handleDisconnect;
    emitScoreUpdate(gameId: number, data: {
        teamId: number;
        teamName: string;
        roundId: number;
        points: number;
        totalPoints: number;
    }): void;
    emitPositionsUpdate(gameId: number, positions: any[], changes: any[]): void;
    emitScoreboardUpdate(gameId: number, leaderboard: any[]): void;
    emitScoreCorrection(gameId: number, data: {
        scoreId: number;
        teamId: number;
        teamName: string;
        oldPoints: number;
        newPoints: number;
        reason: string;
        correctedBy: string;
    }): void;
    emitGameStatusChange(gameId: number, oldStatus: string, newStatus: string): void;
    getConnectionStats(): {
        totalClients: number;
        totalRooms: number;
        gamesWithClients: number[];
    };
    close(): void;
}
//# sourceMappingURL=socket.server.d.ts.map