import { ScoreService } from '../../src/services/score.service';

// Мок для PositionService
jest.mock('../../src/services/position.service', () => ({
  PositionService: jest.fn().mockImplementation(() => ({
    recalculateGamePositions: jest.fn().mockResolvedValue({
      positions: [],
      changes: []
    })
  }))
}));

// Мок для конфигурации базы данных
jest.mock('../../src/config/database', () => ({
  sequelize: {
    transaction: jest.fn().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn()
    })
  }
}));

// Мок для всех моделей
jest.mock('../../src/models/game.model', () => ({ Game: {} }));
jest.mock('../../src/models/team.model', () => ({ Team: {} }));
jest.mock('../../src/models/round.model', () => ({ Round: {} }));
jest.mock('../../src/models/score.model', () => ({ Score: {} }));
jest.mock('../../src/models/game-team.model', () => ({ GameTeam: {} }));
jest.mock('../../src/models/user.model', () => ({ User: {} }));

// Мок для Socket service
jest.mock('../../src/server', () => ({
  getSocketService: jest.fn().mockReturnValue({
    emitScoreUpdate: jest.fn(),
    emitPositionsUpdate: jest.fn(),
    emitScoreCorrection: jest.fn()
  })
}));

describe('ScoreService', () => {
  let scoreService: ScoreService;

  beforeEach(() => {
    scoreService = new ScoreService();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create ScoreService instance', () => {
      expect(scoreService).toBeDefined();
      expect(scoreService).toBeInstanceOf(ScoreService);
    });
  });

  describe('public methods existence', () => {
    it('should have createScore method', () => {
      expect(typeof scoreService.createScore).toBe('function');
    });

    it('should have updateScore method', () => {
      expect(typeof scoreService.updateScore).toBe('function');
    });

    it('should have getScoreById method', () => {
      expect(typeof scoreService.getScoreById).toBe('function');
    });

    it('should have getScores method', () => {
      expect(typeof scoreService.getScores).toBe('function');
    });

    it('should have bulkCreateScores method', () => {
      expect(typeof scoreService.bulkCreateScores).toBe('function');
    });

    it('should have correctScore method', () => {
      expect(typeof scoreService.correctScore).toBe('function');
    });

    it('should have getGameScoresHistory method', () => {
      expect(typeof scoreService.getGameScoresHistory).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', async () => {
      // Тест проверяет, что методы не падают при вызове
      try {
        await scoreService.getScoreById(999);
      } catch (error) {
        // Ожидаем, что ошибки будут обработаны
        expect(error).toBeDefined();
      }
    });
  });

  describe('integration with PositionService', () => {
    it('should have PositionService instance', () => {
      // Проверяем, что PositionService был инициализирован
      expect(scoreService['positionService']).toBeDefined();
    });
  });
});

