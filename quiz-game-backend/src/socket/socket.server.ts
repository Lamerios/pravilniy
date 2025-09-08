/**
 * Socket.IO сервер для real-time обновлений
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketConfig,
  SocketData,
} from './socket.types';

export class SocketService {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
  private connectedClients: Map<string, SocketData> = new Map();

  constructor(httpServer: HTTPServer) {
    const config: SocketConfig = {
      cors: {
        origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6,
    };

    this.io = new SocketIOServer(httpServer, config);
    this.setupEventHandlers();

    logger.info(
      `Socket.IO server initialized. CORS Origin: ${config.cors.origin}, Ping Timeout: ${config.pingTimeout}`,
    );
  }

  /**
   * Настройка обработчиков событий
   */
  private setupEventHandlers(): void {
    this.io.on('connection', socket => {
      logger.info(
        `Client connected. Socket ID: ${socket.id}, Client Count: ${this.io.engine.clientsCount}`,
      );

      // Инициализация данных сокета
      socket.data.connectedGames = new Set();

      // Обработка подключения к игре
      socket.on('join-game', (gameId: number) => {
        this.handleJoinGame(socket, gameId);
      });

      // Обработка отключения от игры
      socket.on('leave-game', (gameId: number) => {
        this.handleLeaveGame(socket, gameId);
      });

      // Обработка ping
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Обработка отключения
      socket.on('disconnect', reason => {
        this.handleDisconnect(socket, reason);
      });

      // Обработка ошибок
      socket.on('error', error => {
        logger.error(`Socket error. Socket ID: ${socket.id}, Error: ${error.message}`);
        socket.emit('error', {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          timestamp: new Date().toISOString(),
        });
      });
    });
  }

  /**
   * Подключение к игре
   */
  private handleJoinGame(socket: any, gameId: number): void {
    try {
      if (!gameId || typeof gameId !== 'number') {
        socket.emit('error', {
          message: 'Invalid game ID',
          code: 'INVALID_GAME_ID',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const roomName = `game-${gameId}`;
      socket.join(roomName);
      socket.data.connectedGames.add(gameId);

      logger.info(
        `Client joined game. Socket ID: ${socket.id}, Game ID: ${gameId}, Room: ${roomName}, Total in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`,
      );

      // Отправляем подтверждение
      socket.emit('scoreboard-update', {
        gameId,
        leaderboard: [],
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(
        `Error joining game. Socket ID: ${socket.id}, Game ID: ${gameId}, Error: ${(error as Error).message}`,
      );
      socket.emit('error', {
        message: 'Failed to join game',
        code: 'JOIN_GAME_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Отключение от игры
   */
  private handleLeaveGame(socket: any, gameId: number): void {
    try {
      const roomName = `game-${gameId}`;
      socket.leave(roomName);
      socket.data.connectedGames.delete(gameId);

      logger.info(
        `Client left game. Socket ID: ${socket.id}, Game ID: ${gameId}, Room: ${roomName}, Total in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`,
      );
    } catch (error) {
      logger.error(
        `Error leaving game. Socket ID: ${socket.id}, Game ID: ${gameId}, Error: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Обработка отключения клиента
   */
  private handleDisconnect(socket: any, reason: string): void {
    logger.info(
      `Client disconnected. Socket ID: ${socket.id}, Reason: ${reason}, Connected Games: ${Array.from(socket.data.connectedGames || []).join(', ')}`,
    );

    // Очищаем данные клиента
    this.connectedClients.delete(socket.id);
  }

  /**
   * Отправить обновление баллов
   */
  public emitScoreUpdate(
    gameId: number,
    data: {
      teamId: number;
      teamName: string;
      roundId: number;
      points: number;
      totalPoints: number;
    },
  ): void {
    const roomName = `game-${gameId}`;
    const eventData = {
      gameId,
      ...data,
      timestamp: new Date().toISOString(),
    };

    this.io.to(roomName).emit('score-update', eventData);

    logger.info(
      `Score update emitted. Game ID: ${gameId}, Room: ${roomName}, Team ID: ${data.teamId}, Points: ${data.points}, Total Points: ${data.totalPoints}, Clients in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`,
    );
  }

  /**
   * Отправить обновление позиций
   */
  public emitPositionsUpdate(gameId: number, positions: any[], changes: any[]): void {
    const roomName = `game-${gameId}`;
    const eventData = {
      gameId,
      positions,
      changes,
      timestamp: new Date().toISOString(),
    };

    this.io.to(roomName).emit('positions-update', eventData);

    logger.info(
      `Positions update emitted. Game ID: ${gameId}, Room: ${roomName}, Positions Count: ${positions.length}, Changes Count: ${changes.length}, Clients in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`,
    );
  }

  /**
   * Отправить обновление табло
   */
  public emitScoreboardUpdate(gameId: number, leaderboard: any[]): void {
    const roomName = `game-${gameId}`;
    const eventData = {
      gameId,
      leaderboard,
      lastUpdated: new Date().toISOString(),
    };

    this.io.to(roomName).emit('scoreboard-update', eventData);

    logger.info(
      `Scoreboard update emitted. Game ID: ${gameId}, Room: ${roomName}, Leaderboard Count: ${leaderboard.length}, Clients in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`,
    );
  }

  /**
   * Отправить коррекцию баллов
   */
  public emitScoreCorrection(
    gameId: number,
    data: {
      scoreId: number;
      teamId: number;
      teamName: string;
      oldPoints: number;
      newPoints: number;
      reason: string;
      correctedBy: string;
    },
  ): void {
    const roomName = `game-${gameId}`;
    const eventData = {
      gameId,
      ...data,
      timestamp: new Date().toISOString(),
    };

    this.io.to(roomName).emit('score-correction', eventData);

    logger.info(
      `Score correction emitted. Game ID: ${gameId}, Room: ${roomName}, Score ID: ${data.scoreId}, Team ID: ${data.teamId}, Old Points: ${data.oldPoints}, New Points: ${data.newPoints}, Clients in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`,
    );
  }

  /**
   * Отправить изменение статуса игры
   */
  public emitGameStatusChange(gameId: number, oldStatus: string, newStatus: string): void {
    const roomName = `game-${gameId}`;
    const eventData = {
      gameId,
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString(),
    };

    this.io.to(roomName).emit('game-status-change', eventData);

    logger.info(
      `Game status change emitted. Game ID: ${gameId}, Room: ${roomName}, Old Status: ${oldStatus}, New Status: ${newStatus}, Clients in Room: ${this.io.sockets.adapter.rooms.get(roomName)?.size || 0}`,
    );
  }

  /**
   * Получить статистику подключений
   */
  public getConnectionStats(): {
    totalClients: number;
    totalRooms: number;
    gamesWithClients: number[];
  } {
    const rooms = this.io.sockets.adapter.rooms;
    const gameRooms = Array.from(rooms.keys()).filter(room => room.startsWith('game-'));

    return {
      totalClients: this.io.engine.clientsCount,
      totalRooms: rooms.size,
      gamesWithClients: gameRooms.map(room => parseInt(room.replace('game-', ''))),
    };
  }

  /**
   * Закрыть сервер
   */
  public close(): void {
    this.io.close();
    logger.info('Socket.IO server closed');
  }
}
