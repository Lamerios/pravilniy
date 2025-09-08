import { TeamPosition } from '../services/position.service';
export interface ClientToServerEvents {
    'join-game': (gameId: number) => void;
    'leave-game': (gameId: number) => void;
    'ping': () => void;
}
export interface ServerToClientEvents {
    'score-update': (data: {
        gameId: number;
        teamId: number;
        teamName: string;
        roundId: number;
        points: number;
        totalPoints: number;
        timestamp: string;
    }) => void;
    'positions-update': (data: {
        gameId: number;
        positions: TeamPosition[];
        changes: Array<{
            teamId: number;
            teamName: string;
            oldPosition?: number;
            newPosition: number;
            change: 'up' | 'down' | 'same' | 'new';
        }>;
        timestamp: string;
    }) => void;
    'scoreboard-update': (data: {
        gameId: number;
        leaderboard: TeamPosition[];
        lastUpdated: string;
    }) => void;
    'score-correction': (data: {
        gameId: number;
        scoreId: number;
        teamId: number;
        teamName: string;
        oldPoints: number;
        newPoints: number;
        reason: string;
        correctedBy: string;
        timestamp: string;
    }) => void;
    'game-status-change': (data: {
        gameId: number;
        oldStatus: string;
        newStatus: string;
        timestamp: string;
    }) => void;
    'pong': () => void;
    'error': (error: {
        message: string;
        code?: string;
        timestamp: string;
    }) => void;
}
export interface SocketData {
    userId?: number;
    userRole?: string;
    organizationId?: number;
    connectedGames: Set<number>;
}
export interface SocketConfig {
    cors: {
        origin: string | string[];
        methods: string[];
        credentials: boolean;
    };
    pingTimeout: number;
    pingInterval: number;
    maxHttpBufferSize: number;
}
//# sourceMappingURL=socket.types.d.ts.map