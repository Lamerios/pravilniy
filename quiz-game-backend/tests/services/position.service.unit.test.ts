import { Transaction } from 'sequelize';
import { PositionService } from '../../src/services/position.service';

// Моки модулей
jest.mock('../../src/models/score.model', () => ({
  Score: {
    findAll: jest.fn(),
    update: jest.fn(),
    sequelize: {
      fn: jest.fn(),
      col: jest.fn()
    }
  }
}));

jest.mock('../../src/models/team.model', () => ({
  Team: {
    findAll: jest.fn()
  }
}));

jest.mock('../../src/models/game-team.model', () => ({
  GameTeam: {}
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

// Импортируем моки после их определения
const { Score } = require('../../src/models/score.model');
const { Team } = require('../../src/models/team.model');
const { logger } = require('../../src/utils/logger');

describe('PositionService Unit Tests', () => {
  let positionService: PositionService;
  let mockTransaction: Transaction;

  beforeEach(() => {
    positionService = new PositionService();
    mockTransaction = {} as Transaction;

    // Сбрасываем все моки
    jest.clearAllMocks();

    // Настраиваем базовые моки для Sequelize функций
    Score.sequelize.fn.mockImplementation((fnName: string, ...args: any[]) => {
      if (fnName === 'COALESCE') {
        return `COALESCE(${args.join(', ')})`;
      }
      if (fnName === 'SUM') {
        return `SUM(${args[0]})`;
      }
      if (fnName === 'MAX') {
        return `MAX(${args[0]})`;
      }
      return `${fnName}(${args.join(', ')})`;
    });

    Score.sequelize.col.mockImplementation((col: string) => col);
  });

  describe('recalculateGamePositions', () => {
    it('должен успешно пересчитать позиции для игры', async () => {
      const gameId = 1;

      // Мокаем getCurrentPositions (возвращает пустую Map для новых команд)
      Score.findAll.mockResolvedValueOnce([]);

      // Мокаем getTeamsWithTotalScores
      const mockTeamsData = [
        {
          id: 1,
          name: 'Team A',
          tableNumber: 1,
          dataValues: {
            totalPoints: 100,
            lastUpdated: new Date('2024-01-15T10:00:00Z')
          }
        },
        {
          id: 2,
          name: 'Team B',
          tableNumber: 2,
          dataValues: {
            totalPoints: 80,
            lastUpdated: new Date('2024-01-15T11:00:00Z')
          }
        }
      ];

      Team.findAll.mockResolvedValueOnce(mockTeamsData);

      // Мокаем updatePositionsInDatabase
      Score.update.mockResolvedValue([1]);

      const result = await positionService.recalculateGamePositions(gameId);

      expect(result).toHaveProperty('positions');
      expect(result).toHaveProperty('changes');
      expect(result.positions).toHaveLength(2);
      expect(result.positions[0]?.teamName).toBe('Team A');
      expect(result.positions[0]?.position).toBe(1);
      expect(result.positions[0]?.totalPoints).toBe(100);
      expect(result.positions[1]?.teamName).toBe('Team B');
      expect(result.positions[1]?.position).toBe(2);
      expect(result.positions[1]?.totalPoints).toBe(80);

      expect(logger.info).toHaveBeenCalledWith(`Starting position recalculation for game ${gameId}`);
      expect(logger.info).toHaveBeenCalledWith(`Position recalculation completed for game ${gameId}: 2 teams, 2 changes`);
    });

    it('должен обработать ошибку при пересчете позиций', async () => {
      const gameId = 1;
      const error = new Error('Database error');

      Score.findAll.mockRejectedValueOnce(error);

      await expect(positionService.recalculateGamePositions(gameId)).rejects.toThrow('Database error');
      expect(logger.error).toHaveBeenCalledWith(`Failed to recalculate positions for game ${gameId}: ${error}`);
    });

    it('должен использовать транзакцию если предоставлена', async () => {
      const gameId = 1;

      Score.findAll.mockResolvedValueOnce([]);
      Team.findAll.mockResolvedValueOnce([]);
      Score.update.mockResolvedValue([1]);

      await positionService.recalculateGamePositions(gameId, mockTransaction);

      expect(Score.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: mockTransaction
        })
      );
      expect(Team.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          transaction: mockTransaction
        })
      );
    });
  });

  describe('getGameLeaderboard', () => {
    it('должен возвращать leaderboard игры', async () => {
      const gameId = 1;

      Score.findAll.mockResolvedValueOnce([]);
      Team.findAll.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Team A',
          tableNumber: 1,
          dataValues: {
            totalPoints: 100,
            lastUpdated: new Date('2024-01-15T10:00:00Z')
          }
        }
      ]);
      Score.update.mockResolvedValue([1]);

      const result = await positionService.getGameLeaderboard(gameId);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('teamId');
      expect(result[0]).toHaveProperty('teamName');
      expect(result[0]).toHaveProperty('position');
      expect(result[0]).toHaveProperty('totalPoints');
    });
  });

  describe('getTeamPosition', () => {
    it('должен возвращать позицию команды', async () => {
      const gameId = 1;
      const teamId = 1;

      Score.findAll.mockResolvedValueOnce([]);
      Team.findAll.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Team A',
          tableNumber: 1,
          dataValues: {
            totalPoints: 100,
            lastUpdated: new Date('2024-01-15T10:00:00Z')
          }
        },
        {
          id: 2,
          name: 'Team B',
          tableNumber: 2,
          dataValues: {
            totalPoints: 80,
            lastUpdated: new Date('2024-01-15T11:00:00Z')
          }
        }
      ]);
      Score.update.mockResolvedValue([1]);

      const position = await positionService.getTeamPosition(gameId, teamId);

      expect(position).toBe(1);
    });

    it('должен возвращать 0 если команда не найдена', async () => {
      const gameId = 1;
      const teamId = 999;

      Score.findAll.mockResolvedValueOnce([]);
      Team.findAll.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Team A',
          tableNumber: 1,
          dataValues: {
            totalPoints: 100,
            lastUpdated: new Date('2024-01-15T10:00:00Z')
          }
        }
      ]);
      Score.update.mockResolvedValue([1]);

      const position = await positionService.getTeamPosition(gameId, teamId);

      expect(position).toBe(0);
    });
  });

  describe('calculatePositions (private method testing through public interface)', () => {
    it('должен правильно рассчитывать позиции по баллам', async () => {
      const gameId = 1;

      Score.findAll.mockResolvedValueOnce([]);
      Team.findAll.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Team A',
          tableNumber: 1,
          dataValues: {
            totalPoints: 80,
            lastUpdated: new Date('2024-01-15T11:00:00Z')
          }
        },
        {
          id: 2,
          name: 'Team B',
          tableNumber: 2,
          dataValues: {
            totalPoints: 100,
            lastUpdated: new Date('2024-01-15T10:00:00Z')
          }
        },
        {
          id: 3,
          name: 'Team C',
          tableNumber: 3,
          dataValues: {
            totalPoints: 100,
            lastUpdated: new Date('2024-01-15T09:00:00Z') // раньше обновилась
          }
        }
      ]);
      Score.update.mockResolvedValue([1]);

      const result = await positionService.recalculateGamePositions(gameId);

      // Team C должна быть первой (100 баллов, раньше обновилась)
      expect(result.positions[0]?.teamName).toBe('Team C');
      expect(result.positions[0]?.position).toBe(1);
      expect(result.positions[0]?.totalPoints).toBe(100);

      // Team B должна быть второй (100 баллов, позже обновилась)
      expect(result.positions[1]?.teamName).toBe('Team B');
      expect(result.positions[1]?.position).toBe(2);
      expect(result.positions[1]?.totalPoints).toBe(100);

      // Team A должна быть третьей (80 баллов)
      expect(result.positions[2]?.teamName).toBe('Team A');
      expect(result.positions[2]?.position).toBe(3);
      expect(result.positions[2]?.totalPoints).toBe(80);
    });
  });

  describe('calculatePositionChanges (private method testing through public interface)', () => {
    it('должен правильно определять изменения позиций', async () => {
      const gameId = 1;

      // Мокаем текущие позиции (Team A была 1-й, Team B была 2-й)
      Score.findAll.mockResolvedValueOnce([
        { teamId: 1, position: 2 },
        { teamId: 2, position: 1 }
      ]);

      // Новые результаты (Team A стала 1-й, Team B стала 2-й)
      Team.findAll.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Team A',
          tableNumber: 1,
          dataValues: {
            totalPoints: 100,
            lastUpdated: new Date('2024-01-15T10:00:00Z')
          }
        },
        {
          id: 2,
          name: 'Team B',
          tableNumber: 2,
          dataValues: {
            totalPoints: 80,
            lastUpdated: new Date('2024-01-15T11:00:00Z')
          }
        }
      ]);
      Score.update.mockResolvedValue([1]);

      const result = await positionService.recalculateGamePositions(gameId);

      expect(result.changes).toHaveLength(2);

      // Team A: с 2-й позиции на 1-ю = 'up'
      const teamAChange = result.changes.find(c => c.teamId === 1);
      expect(teamAChange?.change).toBe('up');
      expect(teamAChange?.oldPosition).toBe(2);
      expect(teamAChange?.newPosition).toBe(1);

      // Team B: с 1-й позиции на 2-ю = 'down'
      const teamBChange = result.changes.find(c => c.teamId === 2);
      expect(teamBChange?.change).toBe('down');
      expect(teamBChange?.oldPosition).toBe(1);
      expect(teamBChange?.newPosition).toBe(2);
    });

    it('должен определять новые команды как "new"', async () => {
      const gameId = 1;

      // Пустые текущие позиции
      Score.findAll.mockResolvedValueOnce([]);

      Team.findAll.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Team A',
          tableNumber: 1,
          dataValues: {
            totalPoints: 100,
            lastUpdated: new Date('2024-01-15T10:00:00Z')
          }
        }
      ]);
      Score.update.mockResolvedValue([1]);

      const result = await positionService.recalculateGamePositions(gameId);

      expect(result.changes[0]?.change).toBe('new');
      expect(result.changes[0]?.oldPosition).toBeUndefined();
      expect(result.changes[0]?.newPosition).toBe(1);
    });

    it('должен определять команды без изменений как "same"', async () => {
      const gameId = 1;

      // Team A остается на 1-й позиции
      Score.findAll.mockResolvedValueOnce([
        { teamId: 1, position: 1 }
      ]);

      Team.findAll.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Team A',
          tableNumber: 1,
          dataValues: {
            totalPoints: 100,
            lastUpdated: new Date('2024-01-15T10:00:00Z')
          }
        }
      ]);
      Score.update.mockResolvedValue([1]);

      const result = await positionService.recalculateGamePositions(gameId);

      expect(result.changes[0]?.change).toBe('same');
      expect(result.changes[0]?.oldPosition).toBe(1);
      expect(result.changes[0]?.newPosition).toBe(1);
    });
  });

  describe('updatePositionsInDatabase (private method testing through public interface)', () => {
    it('должен обновлять позиции в базе данных', async () => {
      const gameId = 1;

      Score.findAll.mockResolvedValueOnce([]);
      Team.findAll.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Team A',
          tableNumber: 1,
          dataValues: {
            totalPoints: 100,
            lastUpdated: new Date('2024-01-15T10:00:00Z')
          }
        }
      ]);
      Score.update.mockResolvedValue([1]);

      await positionService.recalculateGamePositions(gameId);

      expect(Score.update).toHaveBeenCalledWith(
        { position: 1 },
        {
          where: {
            gameId: 1,
            teamId: 1
          },
          transaction: null
        }
      );
    });
  });

  describe('edge cases', () => {
    it('должен обрабатывать пустой список команд', async () => {
      const gameId = 1;

      Score.findAll.mockResolvedValueOnce([]);
      Team.findAll.mockResolvedValueOnce([]);
      Score.update.mockResolvedValue([0]);

      const result = await positionService.recalculateGamePositions(gameId);

      expect(result.positions).toHaveLength(0);
      expect(result.changes).toHaveLength(0);
    });

    it('должен обрабатывать команды с нулевыми баллами', async () => {
      const gameId = 1;

      Score.findAll.mockResolvedValueOnce([]);
      Team.findAll.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Team A',
          tableNumber: 1,
          dataValues: {
            totalPoints: 0,
            lastUpdated: new Date('2024-01-15T10:00:00Z')
          }
        }
      ]);
      Score.update.mockResolvedValue([1]);

      const result = await positionService.recalculateGamePositions(gameId);

      expect(result.positions[0]?.totalPoints).toBe(0);
      expect(result.positions[0]?.position).toBe(1);
    });

    it('должен обрабатывать команды без номера стола', async () => {
      const gameId = 1;

      Score.findAll.mockResolvedValueOnce([]);
      Team.findAll.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Team A',
          tableNumber: undefined,
          dataValues: {
            totalPoints: 100,
            lastUpdated: new Date('2024-01-15T10:00:00Z')
          }
        }
      ]);
      Score.update.mockResolvedValue([1]);

      const result = await positionService.recalculateGamePositions(gameId);

      expect(result.positions[0]?.tableNumber).toBeUndefined();
      expect(result.positions[0]?.position).toBe(1);
    });
  });
});
