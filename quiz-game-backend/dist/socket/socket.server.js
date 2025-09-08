"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
class SocketService {
    io;
    connectedClients = new Map();
    constructor(httpServer) {
        const config = {
            cors: {
                origin: process.env['FRONTEND_URL'] || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            },
            pingTimeout: 60000,
            pingInterval: 25000,
            maxHttpBufferSize: 1e6
        };
        this.io = new socket_io_1.Server(httpServer, config);
        this.setupEventHandlers();
        logger_1.logger.info(`Socket.IO server initialized. CORS Origin: ${config.cors.origin}, Ping Timeout: ${config.pingTimeout}`);
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`Client connected. Socket ID: ${socket.id}, Client Count: ${this.io.engine.clientsCount}`);
            socket.data.connectedGames = new Set();
            socket.on('join-game', (gameId) => {
                this.handleJoinGame(socket, gameId);
            });
            socket.on('leave-game', (gameId) => {
                this.handleLeaveGame(socket, gameId);
            });
            socket.on('ping', () => {
                socket.emit('pong');
            });
            socket.on('disconnect', (reason) => {
                this.handleDisconnect(socket, reason);
            });
            socket.on('error', (error) => {
                logger_1.logger.error(`Socket error. Socket ID: ${socket.id}, Error: ${error.message}`);
                socket.emit('error', {
                    message: 'Internal server error',
                    code: 'INTERNAL_ERROR',
                    timestamp: new Date().toISOString()
                });
            });
        });
    }
    handleJoinGame(socket, gameId) {
        try {
            if (!gameId || typeof gameId !== 'number') {
                socket.emit('error', {
                    message: 'Invalid game ID',
                    code: 'INVALID_GAME_ID',
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const roomName = `game-${gameId}`;
            socket.join(roomName);
            socket.data.connectedGames.add(gameId);
            logger_1.logger.info(`Client joined game. Socket ID: ${socket.id}, Game ID: ${gameId}, Room: ${roomName}, Total in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`);
            socket.emit('scoreboard-update', {
                gameId,
                leaderboard: [],
                lastUpdated: new Date().toISOString()
            });
        }
        catch (error) {
            logger_1.logger.error(`Error joining game. Socket ID: ${socket.id}, Game ID: ${gameId}, Error: ${error.message}`);
            socket.emit('error', {
                message: 'Failed to join game',
                code: 'JOIN_GAME_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }
    handleLeaveGame(socket, gameId) {
        try {
            const roomName = `game-${gameId}`;
            socket.leave(roomName);
            socket.data.connectedGames.delete(gameId);
            logger_1.logger.info(`Client left game. Socket ID: ${socket.id}, Game ID: ${gameId}, Room: ${roomName}, Total in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`);
        }
        catch (error) {
            logger_1.logger.error(`Error leaving game. Socket ID: ${socket.id}, Game ID: ${gameId}, Error: ${error.message}`);
        }
    }
    handleDisconnect(socket, reason) {
        logger_1.logger.info(`Client disconnected. Socket ID: ${socket.id}, Reason: ${reason}, Connected Games: ${Array.from(socket.data.connectedGames || []).join(', ')}`);
        this.connectedClients.delete(socket.id);
    }
    emitScoreUpdate(gameId, data) {
        const roomName = `game-${gameId}`;
        const eventData = {
            gameId,
            ...data,
            timestamp: new Date().toISOString()
        };
        this.io.to(roomName).emit('score-update', eventData);
        logger_1.logger.info(`Score update emitted. Game ID: ${gameId}, Room: ${roomName}, Team ID: ${data.teamId}, Points: ${data.points}, Total Points: ${data.totalPoints}, Clients in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`);
    }
    emitPositionsUpdate(gameId, positions, changes) {
        const roomName = `game-${gameId}`;
        const eventData = {
            gameId,
            positions,
            changes,
            timestamp: new Date().toISOString()
        };
        this.io.to(roomName).emit('positions-update', eventData);
        logger_1.logger.info(`Positions update emitted. Game ID: ${gameId}, Room: ${roomName}, Positions Count: ${positions.length}, Changes Count: ${changes.length}, Clients in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`);
    }
    emitScoreboardUpdate(gameId, leaderboard) {
        const roomName = `game-${gameId}`;
        const eventData = {
            gameId,
            leaderboard,
            lastUpdated: new Date().toISOString()
        };
        this.io.to(roomName).emit('scoreboard-update', eventData);
        logger_1.logger.info(`Scoreboard update emitted. Game ID: ${gameId}, Room: ${roomName}, Leaderboard Count: ${leaderboard.length}, Clients in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`);
    }
    emitScoreCorrection(gameId, data) {
        const roomName = `game-${gameId}`;
        const eventData = {
            gameId,
            ...data,
            timestamp: new Date().toISOString()
        };
        this.io.to(roomName).emit('score-correction', eventData);
        logger_1.logger.info(`Score correction emitted. Game ID: ${gameId}, Room: ${roomName}, Score ID: ${data.scoreId}, Team ID: ${data.teamId}, Old Points: ${data.oldPoints}, New Points: ${data.newPoints}, Clients in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`);
    }
    emitGameStatusChange(gameId, oldStatus, newStatus) {
        const roomName = `game-${gameId}`;
        const eventData = {
            gameId,
            oldStatus,
            newStatus,
            timestamp: new Date().toISOString()
        };
        this.io.to(roomName).emit('game-status-change', eventData);
        logger_1.logger.info(`Game status change emitted. Game ID: ${gameId}, Room: ${roomName}, Old Status: ${oldStatus}, New Status: ${newStatus}, Clients in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`);
    }
    getConnectionStats() {
        const rooms = this.io.sockets.adapter.rooms;
        const gameRooms = Array.from(rooms.keys()).filter(room => room.startsWith('game-'));
        return {
            totalClients: this.io.engine.clientsCount,
            totalRooms: rooms.size,
            gamesWithClients: gameRooms.map(room => parseInt(room.replace('game-', '')))
        };
    }
    close() {
        this.io.close();
        logger_1.logger.info('Socket.IO server closed');
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=socket.server.js.map