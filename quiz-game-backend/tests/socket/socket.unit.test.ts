/**
 * Unit тесты для WebSocket соединений
 * Тестируют основную функциональность SocketService
 */

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { SocketService } from '../../src/socket/socket.server';

describe('WebSocket Unit Tests', () => {
  let httpServer: any;
  let socketService: SocketService;
  let io: SocketIOServer;

  beforeAll((done) => {
    httpServer = createServer();
    socketService = new SocketService(httpServer);
    io = socketService['io'];

    httpServer.listen(() => {
      done();
    });
  });

  afterAll((done) => {
    socketService.close();
    httpServer.close(done);
  });

  describe('SocketService Initialization', () => {
    it('should initialize with HTTP server', () => {
      expect(socketService).toBeInstanceOf(SocketService);
      expect(io).toBeInstanceOf(SocketIOServer);
    });

    it('should have connection stats method', () => {
      const stats = socketService.getConnectionStats();
      expect(stats).toHaveProperty('totalClients');
      expect(stats).toHaveProperty('totalRooms');
      expect(stats).toHaveProperty('gamesWithClients');
      expect(typeof stats.totalClients).toBe('number');
      expect(Array.isArray(stats.gamesWithClients)).toBe(true);
    });
  });

  describe('Event Broadcasting', () => {
    it('should emit score update without errors', () => {
      expect(() => {
        socketService.emitScoreUpdate(1, {
          teamId: 1,
          teamName: 'Test Team',
          roundId: 1,
          points: 10,
          totalPoints: 25
        });
      }).not.toThrow();
    });

    it('should emit positions update without errors', () => {
      expect(() => {
        socketService.emitPositionsUpdate(1, [], []);
      }).not.toThrow();
    });

    it('should emit scoreboard update without errors', () => {
      expect(() => {
        socketService.emitScoreboardUpdate(1, []);
      }).not.toThrow();
    });

    it('should emit score correction without errors', () => {
      expect(() => {
        socketService.emitScoreCorrection(1, {
          scoreId: 1,
          teamId: 1,
          teamName: 'Test Team',
          oldPoints: 10,
          newPoints: 15,
          reason: 'Test correction',
          correctedBy: 'admin'
        });
      }).not.toThrow();
    });

    it('should emit game status change without errors', () => {
      expect(() => {
        socketService.emitGameStatusChange(1, 'WAITING', 'ACTIVE');
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid game IDs gracefully', () => {
      expect(() => {
        socketService.emitScoreUpdate(-1, {
          teamId: 1,
          teamName: 'Test',
          roundId: 1,
          points: 10,
          totalPoints: 10
        });
      }).not.toThrow();
    });

    it('should handle empty data gracefully', () => {
      expect(() => {
        socketService.emitPositionsUpdate(1, [], []);
        socketService.emitScoreboardUpdate(1, []);
      }).not.toThrow();
    });
  });

  describe('Service Management', () => {
    it('should close service properly', () => {
      const testService = new SocketService(createServer());
      expect(() => {
        testService.close();
      }).not.toThrow();
    });
  });
});
