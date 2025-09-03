# 🧪 Тестирование - Enterprise Guide

> **Для**: QA Engineers, разработчиков | **Цель**: 90%+ покрытие | **Enterprise-ready**

## 🎯 Стратегия тестирования

### Пирамида тестирования
```
                    /\
                   /  \
                  /E2E \     ← 10% (критические пути)
                 /______\
                /        \
               /Integration\ ← 20% (API, компоненты)
              /__________\
             /            \
            /     Unit     \ ← 70% (функции, методы)
           /______________\
```

### Типы тестов по слоям
| Тип | Процент | Инструменты | Ответственность |
|-----|---------|-------------|-----------------|
| **Unit** | 70% | Jest, Vitest | Разработчики |
| **Integration** | 20% | Supertest, Testing Library | Разработчики + QA |
| **E2E** | 10% | Playwright, Cypress | QA Engineers |

### Цели покрытия (Enterprise)
| Компонент | Целевое покрытие | Критическое покрытие |
|-----------|------------------|----------------------|
| **Services** | 95% | 100% |
| **Controllers** | 90% | 95% |
| **Utils** | 95% | 100% |
| **Components** | 85% | 90% |
| **Hooks** | 90% | 95% |
| **API Endpoints** | 95% | 100% |

## 🔧 Настройка тестового окружения

### Backend Testing Stack
```json
{
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/supertest": "^6.0.0",
    "jest": "^29.7.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.1.0",
    "testcontainers": "^10.0.0",
    "factory-girl": "^5.0.4"
  }
}
```

### Frontend Testing Stack
```json
{
  "devDependencies": {
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/user-event": "^14.5.0",
    "vitest": "^2.1.0",
    "jsdom": "^25.0.0",
    "msw": "^2.8.0",
    "@playwright/test": "^1.49.0"
  }
}
```

### Конфигурация Jest (Backend)
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Пути
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Покрытие
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/tests/**',
    '!src/types/**',
    '!src/migrations/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    // Критические сервисы
    './src/services/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  
  // Настройки
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testTimeout: 10000,
  maxWorkers: 4,
  
  // Моки
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Конфигурация Vitest (Frontend)
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    
    // Покрытие
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.stories.tsx',
        'src/main.tsx'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    
    // Параллельность
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1
      }
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

## 🏗️ Архитектура тестов

### Структура тестов
```
src/tests/
├── unit/                  # Unit тесты
│   ├── services/         # Тесты сервисов
│   ├── utils/            # Тесты утилит
│   └── models/           # Тесты моделей
├── integration/          # Integration тесты
│   ├── api/              # API тесты
│   ├── database/         # БД тесты
│   └── websocket/        # WebSocket тесты
├── e2e/                  # E2E тесты
│   ├── admin/            # Админ панель
│   ├── public/           # Публичные страницы
│   └── game-flow/        # Игровые сценарии
├── fixtures/             # Тестовые данные
│   ├── games.json
│   ├── teams.json
│   └── users.json
├── factories/            # Фабрики объектов
│   ├── GameFactory.ts
│   ├── UserFactory.ts
│   └── TeamFactory.ts
├── helpers/              # Вспомогательные функции
│   ├── testDb.ts
│   ├── testServer.ts
│   └── mockData.ts
├── mocks/                # Моки
│   ├── websocket.ts
│   ├── database.ts
│   └── external-apis.ts
└── setup.ts              # Настройка тестов
```

### Test Factories
```typescript
// src/tests/factories/GameFactory.ts
import { Factory } from 'factory-girl';
import { Game, GameStatus } from '../../models/Game';
import { TeamInstance } from '../../models/TeamInstance';

Factory.define('Game', Game, {
  id: Factory.seq('Game.id', (n) => `game-${n}`),
  title: Factory.seq('Game.title', (n) => `Test Game ${n}`),
  date: new Date(),
  status: GameStatus.CREATED,
  currentRound: 1,
  metadata: {},
  organizationId: 'org-123',
  templateId: 'template-123',
  createdBy: 'user-123'
});

Factory.define('TeamInstance', TeamInstance, {
  id: Factory.seq('TeamInstance.id', (n) => `team-${n}`),
  name: Factory.seq('TeamInstance.name', (n) => `Team ${n}`),
  tableNumber: Factory.seq('TeamInstance.tableNumber', (n) => n),
  totalPoints: 0,
  gameId: Factory.assoc('Game', 'id')
});

// Использование
export const GameFactory = {
  create: (attrs = {}) => Factory.create('Game', attrs),
  build: (attrs = {}) => Factory.build('Game', attrs),
  createWithTeams: async (teamCount = 2, attrs = {}) => {
    const game = await Factory.create('Game', attrs);
    const teams = await Promise.all(
      Array.from({ length: teamCount }, (_, i) =>
        Factory.create('TeamInstance', {
          gameId: game.id,
          tableNumber: i + 1
        })
      )
    );
    return { game, teams };
  }
};
```

### Database Test Helper
```typescript
// src/tests/helpers/testDb.ts
import { Sequelize } from 'sequelize';
import { sequelize } from '../../config/database';
import { initModels } from '../../models';

class TestDatabase {
  private static instance: TestDatabase;
  
  static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase();
    }
    return TestDatabase.instance;
  }

  async setup(): Promise<void> {
    // Создаем тестовую БД
    await sequelize.authenticate();
    
    // Инициализируем модели
    initModels();
    
    // Синхронизируем схему
    await sequelize.sync({ force: true });
    
    console.log('Test database setup completed');
  }

  async cleanup(): Promise<void> {
    // Очищаем все таблицы
    const models = Object.values(sequelize.models);
    
    for (const model of models) {
      await model.destroy({ where: {}, force: true });
    }
  }

  async teardown(): Promise<void> {
    await sequelize.close();
    console.log('Test database teardown completed');
  }

  async transaction<T>(callback: (transaction: any) => Promise<T>): Promise<T> {
    const transaction = await sequelize.transaction();
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export const testDb = TestDatabase.getInstance();

// Jest setup
beforeAll(async () => {
  await testDb.setup();
});

afterAll(async () => {
  await testDb.teardown();
});

beforeEach(async () => {
  await testDb.cleanup();
});
```

## 🔬 Unit тестирование

### Service Tests
```typescript
// src/tests/unit/services/GameService.test.ts
import { GameService } from '../../../services/GameService';
import { Game } from '../../../models/Game';
import { GameTemplate } from '../../../models/GameTemplate';
import { TeamInstance } from '../../../models/TeamInstance';
import { testDb } from '../../helpers/testDb';
import { GameFactory } from '../../factories/GameFactory';

// Мокаем WebSocket сервис
const mockWebSocketService = {
  emitToOrganization: jest.fn(),
  emitToGame: jest.fn()
};

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService(mockWebSocketService as any);
    jest.clearAllMocks();
  });

  describe('createGame', () => {
    const createGameData = {
      title: 'Test Game',
      templateId: 'template-123',
      date: '2025-01-27',
      teams: [
        { name: 'Team Alpha', tableNumber: 1 },
        { name: 'Team Beta', tableNumber: 2 }
      ],
      organizationId: 'org-123',
      createdBy: 'user-123'
    };

    it('should create game with teams and rounds', async () => {
      // Arrange
      const mockTemplate = await GameTemplate.create({
        id: 'template-123',
        title: 'Test Template',
        organizationId: 'org-123',
        roundsConfig: [
          {
            name: 'Round 1',
            questionCount: 10,
            pointsPerCorrect: 1.0,
            order: 1
          }
        ]
      });

      // Act
      const result = await gameService.createGame(createGameData);

      // Assert
      expect(result).toBeDefined();
      expect(result.title).toBe('Test Game');
      expect(result.organizationId).toBe('org-123');
      
      // Проверяем создание команд
      const teams = await TeamInstance.findAll({
        where: { gameId: result.id }
      });
      expect(teams).toHaveLength(2);
      expect(teams[0].name).toBe('Team Alpha');
      expect(teams[1].name).toBe('Team Beta');

      // Проверяем WebSocket уведомление
      expect(mockWebSocketService.emitToOrganization).toHaveBeenCalledWith(
        'org-123',
        'game:created',
        expect.objectContaining({
          gameId: result.id,
          title: 'Test Game'
        })
      );
    });

    it('should throw error if template not found', async () => {
      // Act & Assert
      await expect(
        gameService.createGame(createGameData)
      ).rejects.toThrow('Game template not found');
    });

    it('should validate team names uniqueness', async () => {
      // Arrange
      const invalidData = {
        ...createGameData,
        teams: [
          { name: 'Team Alpha', tableNumber: 1 },
          { name: 'Team Alpha', tableNumber: 2 } // Duplicate name
        ]
      };

      // Act & Assert
      await expect(
        gameService.createGame(invalidData)
      ).rejects.toThrow('Team names must be unique');
    });
  });

  describe('calculateTeamPosition', () => {
    it('should calculate correct positions', async () => {
      // Arrange
      const { game, teams } = await GameFactory.createWithTeams(3);
      
      // Устанавливаем разные баллы
      await teams[0].update({ totalPoints: 15.5 });
      await teams[1].update({ totalPoints: 20.0 });
      await teams[2].update({ totalPoints: 10.0 });

      // Act
      const positions = await Promise.all([
        gameService.getTeamPosition(game.id, teams[0].id),
        gameService.getTeamPosition(game.id, teams[1].id),
        gameService.getTeamPosition(game.id, teams[2].id)
      ]);

      // Assert
      expect(positions[0]).toBe(2); // 15.5 points - 2nd place
      expect(positions[1]).toBe(1); // 20.0 points - 1st place
      expect(positions[2]).toBe(3); // 10.0 points - 3rd place
    });
  });
});
```

### Utility Tests
```typescript
// src/tests/unit/utils/scoreCalculator.test.ts
import { ScoreCalculator } from '../../../utils/scoreCalculator';

describe('ScoreCalculator', () => {
  describe('calculatePoints', () => {
    it('should calculate correct points for correct answer without stake', () => {
      // Arrange
      const calculator = new ScoreCalculator();

      // Act
      const result = calculator.calculatePoints({
        isCorrect: true,
        pointsPerCorrect: 2.0,
        stake: null
      });

      // Assert
      expect(result).toBe(2.0);
    });

    it('should calculate correct points with stake multiplier', () => {
      // Arrange
      const calculator = new ScoreCalculator();

      // Act
      const result = calculator.calculatePoints({
        isCorrect: true,
        pointsPerCorrect: 2.0,
        stake: 3
      });

      // Assert
      expect(result).toBe(6.0);
    });

    it('should return 0 for incorrect answer regardless of stake', () => {
      // Arrange
      const calculator = new ScoreCalculator();

      // Act
      const result = calculator.calculatePoints({
        isCorrect: false,
        pointsPerCorrect: 2.0,
        stake: 5
      });

      // Assert
      expect(result).toBe(0);
    });

    it('should throw error for invalid stake value', () => {
      // Arrange
      const calculator = new ScoreCalculator();

      // Act & Assert
      expect(() => {
        calculator.calculatePoints({
          isCorrect: true,
          pointsPerCorrect: 2.0,
          stake: 0 // Invalid stake
        });
      }).toThrow('Stake must be between 1 and 5');
    });
  });

  describe('calculateTeamTotal', () => {
    it('should sum all team points correctly', () => {
      // Arrange
      const calculator = new ScoreCalculator();
      const answers = [
        { pointsAwarded: 2.0 },
        { pointsAwarded: 4.0 },
        { pointsAwarded: 1.5 },
        { pointsAwarded: 0 }
      ];

      // Act
      const result = calculator.calculateTeamTotal(answers);

      // Assert
      expect(result).toBe(7.5);
    });

    it('should handle empty answers array', () => {
      // Arrange
      const calculator = new ScoreCalculator();

      // Act
      const result = calculator.calculateTeamTotal([]);

      // Assert
      expect(result).toBe(0);
    });
  });
});
```

## 🔗 Integration тестирование

### API Tests
```typescript
// src/tests/integration/api/games.test.ts
import request from 'supertest';
import { app } from '../../../app';
import { testDb } from '../../helpers/testDb';
import { User } from '../../../models/User';
import { GameTemplate } from '../../../models/GameTemplate';
import { generateToken } from '../../../utils/jwt';

describe('Games API Integration', () => {
  let authToken: string;
  let user: User;
  let gameTemplate: GameTemplate;

  beforeEach(async () => {
    // Создаем тестового пользователя
    user = await User.create({
      email: 'test@example.com',
      passwordHash: 'hashed_password',
      role: 'admin',
      organizationId: 'org-123',
      isActive: true
    });

    // Создаем шаблон игры
    gameTemplate = await GameTemplate.create({
      title: 'Test Template',
      organizationId: 'org-123',
      isActive: true,
      roundsConfig: [
        {
          name: 'Round 1',
          questionCount: 10,
          pointsPerCorrect: 1.0,
          order: 1
        }
      ]
    });

    authToken = generateToken({
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role
    });
  });

  describe('POST /api/games', () => {
    const gameData = {
      title: 'Integration Test Game',
      templateId: '',
      date: '2025-01-27',
      teams: [
        { name: 'Team Alpha', tableNumber: 1 },
        { name: 'Team Beta', tableNumber: 2 }
      ]
    };

    beforeEach(() => {
      gameData.templateId = gameTemplate.id;
    });

    it('should create game successfully', async () => {
      // Act
      const response = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gameData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: 'Integration Test Game',
        organizationId: user.organizationId,
        status: 'created'
      });

      // Проверяем команды
      expect(response.body.data.teams).toHaveLength(2);
      expect(response.body.data.teams[0].name).toBe('Team Alpha');
      expect(response.body.data.teams[1].name).toBe('Team Beta');
    });

    it('should return 401 without auth token', async () => {
      // Act & Assert
      await request(app)
        .post('/api/games')
        .send(gameData)
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      // Arrange
      const invalidData = { ...gameData, title: 'A' }; // Too short

      // Act
      const response = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 404 for non-existent template', async () => {
      // Arrange
      const invalidData = { ...gameData, templateId: 'non-existent' };

      // Act
      const response = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Game template not found');
    });
  });

  describe('GET /api/games/:id/scoreboard', () => {
    it('should return scoreboard data', async () => {
      // Arrange - создаем игру
      const createResponse = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Scoreboard Test Game',
          templateId: gameTemplate.id,
          date: '2025-01-27',
          teams: [
            { name: 'Team Alpha', tableNumber: 1 },
            { name: 'Team Beta', tableNumber: 2 }
          ]
        });

      const gameId = createResponse.body.data.id;

      // Act
      const response = await request(app)
        .get(`/api/games/${gameId}/scoreboard`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        gameId,
        gameTitle: 'Scoreboard Test Game',
        status: 'created',
        teams: expect.arrayContaining([
          expect.objectContaining({
            name: 'Team Alpha',
            totalPoints: 0,
            position: expect.any(Number)
          })
        ])
      });
    });
  });
});
```

### WebSocket Tests
```typescript
// src/tests/integration/websocket/events.test.ts
import { Server } from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { app } from '../../../app';
import { WebSocketService } from '../../../services/WebSocketService';
import { generateToken } from '../../../utils/jwt';

describe('WebSocket Events Integration', () => {
  let httpServer: Server;
  let clientSocket: ClientSocket;
  let serverAddress: string;
  let authToken: string;

  beforeAll((done) => {
    httpServer = app.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      serverAddress = `http://localhost:${port}`;
      
      authToken = generateToken({
        id: 'user-123',
        email: 'test@example.com',
        organizationId: 'org-123',
        role: 'admin'
      });

      done();
    });
  });

  afterAll(() => {
    httpServer.close();
  });

  beforeEach((done) => {
    clientSocket = Client(serverAddress, {
      auth: { token: authToken },
      transports: ['websocket']
    });

    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  describe('Game Events', () => {
    it('should join game room and receive events', (done) => {
      const gameId = 'game-123';

      // Подписываемся на событие
      clientSocket.on('game:joined', (data) => {
        expect(data.gameId).toBe(gameId);
        done();
      });

      // Присоединяемся к игре
      clientSocket.emit('game:join', { gameId });
    });

    it('should receive score update events', (done) => {
      const gameId = 'game-123';
      const scoreData = {
        gameId,
        teamId: 'team-123',
        pointsAwarded: 5.0,
        teamTotalPoints: 15.0
      };

      // Присоединяемся к игре
      clientSocket.emit('game:join', { gameId });

      // Подписываемся на обновление счета
      clientSocket.on('score:updated', (data) => {
        expect(data).toMatchObject(scoreData);
        done();
      });

      // Симулируем обновление счета (через другой сервис)
      setTimeout(() => {
        const wsService = new WebSocketService();
        wsService.emitToGame(gameId, 'score:updated', scoreData);
      }, 100);
    });
  });

  describe('Authentication', () => {
    it('should reject connection without token', (done) => {
      const unauthorizedClient = Client(serverAddress, {
        transports: ['websocket']
      });

      unauthorizedClient.on('connect_error', (error) => {
        expect(error.message).toContain('Authentication error');
        done();
      });
    });

    it('should reject connection with invalid token', (done) => {
      const unauthorizedClient = Client(serverAddress, {
        auth: { token: 'invalid-token' },
        transports: ['websocket']
      });

      unauthorizedClient.on('connect_error', (error) => {
        expect(error.message).toContain('Authentication error');
        done();
      });
    });
  });
});
```

## 🎭 Frontend тестирование

### Component Tests
```typescript
// src/components/Scoreboard/__tests__/Scoreboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Scoreboard } from '../Scoreboard';
import { GameProvider } from '../../../contexts/GameContext';
import { mockGameData } from '../../../tests/mocks/gameData';

// Мокаем WebSocket hook
vi.mock('../../../hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    connected: true,
    emitEvent: vi.fn()
  })
}));

// Мокаем API сервис
vi.mock('../../../services/gameService', () => ({
  gameService: {
    getScoreboard: vi.fn()
  }
}));

describe('Scoreboard Component', () => {
  const mockProps = {
    gameId: 'game-123',
    autoRefresh: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders game title and teams', async () => {
    // Arrange
    const { gameService } = await import('../../../services/gameService');
    vi.mocked(gameService.getScoreboard).mockResolvedValue({
      data: mockGameData
    });

    // Act
    render(
      <GameProvider>
        <Scoreboard {...mockProps} />
      </GameProvider>
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Test Game')).toBeInTheDocument();
      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
      expect(screen.getByText('Team Beta')).toBeInTheDocument();
    });
  });

  it('displays teams sorted by score', async () => {
    // Arrange
    const gameDataWithScores = {
      ...mockGameData,
      teams: [
        { id: 'team-1', name: 'Team Alpha', totalPoints: 10.5 },
        { id: 'team-2', name: 'Team Beta', totalPoints: 15.0 },
        { id: 'team-3', name: 'Team Gamma', totalPoints: 8.0 }
      ]
    };

    const { gameService } = await import('../../../services/gameService');
    vi.mocked(gameService.getScoreboard).mockResolvedValue({
      data: gameDataWithScores
    });

    // Act
    render(
      <GameProvider>
        <Scoreboard {...mockProps} />
      </GameProvider>
    );

    // Assert
    await waitFor(() => {
      const teamRows = screen.getAllByTestId('team-row');
      const firstTeamScore = teamRows[0].querySelector('[data-testid="team-score"]');
      expect(firstTeamScore).toHaveTextContent('15.0'); // Team Beta first
    });
  });

  it('shows connection status indicator', () => {
    // Act
    render(
      <GameProvider>
        <Scoreboard {...mockProps} />
      </GameProvider>
    );

    // Assert
    expect(screen.getByText('Подключено')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    // Arrange
    const { gameService } = await import('../../../services/gameService');
    vi.mocked(gameService.getScoreboard).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    // Act
    render(
      <GameProvider>
        <Scoreboard {...mockProps} />
      </GameProvider>
    );

    // Assert
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });
});
```

### Hook Tests
```typescript
// src/hooks/__tests__/useGameState.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useGameState } from '../useGameState';
import { gameService } from '../../services/gameService';

// Мокаем сервис
vi.mock('../../services/gameService');

describe('useGameState Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load game data on mount', async () => {
    // Arrange
    const mockGame = {
      id: 'game-123',
      title: 'Test Game',
      teams: []
    };

    vi.mocked(gameService.getGame).mockResolvedValue({
      data: mockGame
    });

    // Act
    const { result } = renderHook(() => useGameState('game-123'));

    // Assert
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.game).toEqual(mockGame);
      expect(result.current.error).toBe(null);
    });
  });

  it('should handle API errors', async () => {
    // Arrange
    const errorMessage = 'Game not found';
    vi.mocked(gameService.getGame).mockRejectedValue(
      new Error(errorMessage)
    );

    // Act
    const { result } = renderHook(() => useGameState('invalid-id'));

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.game).toBe(null);
    });
  });

  it('should update game when updateGame is called', async () => {
    // Arrange
    const initialGame = { id: 'game-123', title: 'Initial Title' };
    const updatedGame = { id: 'game-123', title: 'Updated Title' };

    vi.mocked(gameService.getGame).mockResolvedValue({ data: initialGame });
    vi.mocked(gameService.updateGame).mockResolvedValue({ data: updatedGame });

    const { result } = renderHook(() => useGameState('game-123'));

    await waitFor(() => {
      expect(result.current.game).toEqual(initialGame);
    });

    // Act
    await act(async () => {
      await result.current.updateGame({ title: 'Updated Title' });
    });

    // Assert
    expect(result.current.game).toEqual(updatedGame);
  });
});
```

## 🎪 E2E тестирование

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    }
  ],

  webServer: [
    {
      command: 'npm run dev:backend',
      url: 'http://localhost:5001/api/health',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev:frontend',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    }
  ],
});
```

### E2E Test Example
```typescript
// src/tests/e2e/game-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Game Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Авторизация
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL('/admin');
  });

  test('complete game creation and scoring flow', async ({ page }) => {
    // 1. Создание игры
    await page.click('[data-testid="create-game-button"]');
    await expect(page).toHaveURL('/admin/games/create');

    // Заполняем форму
    await page.fill('[data-testid="game-title-input"]', 'E2E Test Game');
    await page.selectOption('[data-testid="template-select"]', 'template-123');
    await page.fill('[data-testid="game-date-input"]', '2025-01-27');

    // Добавляем команды
    await page.fill('[data-testid="team-name-input"]', 'E2E Team Alpha');
    await page.fill('[data-testid="table-number-input"]', '1');

    await page.click('[data-testid="add-team-button"]');
    const teamInputs = page.locator('[data-testid="team-name-input"]');
    await teamInputs.nth(1).fill('E2E Team Beta');
    await page.locator('[data-testid="table-number-input"]').nth(1).fill('2');

    // Создаем игру
    await page.click('[data-testid="create-game-submit"]');
    await expect(page).toHaveURL(/\/admin\/games\/[a-f0-9-]+/);

    // 2. Проверяем создание игры
    await expect(page.locator('[data-testid="game-title"]')).toContainText('E2E Test Game');
    await expect(page.locator('[data-testid="team-row"]')).toHaveCount(2);

    // 3. Начинаем игру
    await page.click('[data-testid="start-game-button"]');
    await expect(page.locator('[data-testid="scoring-form"]')).toBeVisible();

    // 4. Вводим баллы
    await page.click('[data-testid="team-alpha-question-1"]');
    await page.click('[data-testid="correct-answer"]');
    await page.click('[data-testid="stake-2"]');
    await page.fill('[data-testid="notes-input"]', 'Correct answer with stake');
    await page.click('[data-testid="save-score"]');

    // Проверяем обновление баллов
    await expect(page.locator('[data-testid="team-alpha-total-score"]')).toContainText('4.0');

    // 5. Открываем публичное табло в новой вкладке
    const [scoreboardPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.click('[data-testid="open-scoreboard"]')
    ]);

    await scoreboardPage.waitForLoadState();
    await expect(scoreboardPage.locator('[data-testid="scoreboard-title"]')).toContainText('E2E Test Game');
    await expect(scoreboardPage.locator('[data-testid="team-alpha-score"]')).toContainText('4.0');

    // 6. Проверяем real-time обновление
    // Вводим еще баллы на админской странице
    await page.fill('[data-testid="team-beta-question-1"]', 'Team Beta');
    await page.click('[data-testid="correct-answer"]');
    await page.click('[data-testid="save-score"]');

    // Проверяем, что табло обновилось автоматически
    await expect(scoreboardPage.locator('[data-testid="team-beta-score"]')).toContainText('2.0', { timeout: 5000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Блокируем API запросы
    await page.route('**/api/**', route => route.abort());

    await page.goto('/admin/games');

    // Проверяем отображение ошибки
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Ошибка загрузки данных');
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    // Открываем публичное табло
    await page.goto('/scoreboard/game-123');

    // Проверяем адаптивность
    await expect(page.locator('[data-testid="mobile-scoreboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="team-list"]')).toBeVisible();

    // Проверяем скролл
    await page.locator('[data-testid="team-list"]').scroll({ top: 100 });
    await expect(page.locator('[data-testid="team-row"]').first()).toBeVisible();
  });
});
```

## 📊 Мониторинг тестов

### Test Metrics Dashboard
```typescript
// src/tests/utils/testMetrics.ts
interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  duration: number;
  flaky: string[];
}

export class TestMetricsCollector {
  private metrics: TestMetrics = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    coverage: {
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0
    },
    duration: 0,
    flaky: []
  };

  collect(testResults: any): void {
    // Собираем метрики из результатов тестов
    this.metrics.totalTests = testResults.numTotalTests;
    this.metrics.passedTests = testResults.numPassedTests;
    this.metrics.failedTests = testResults.numFailedTests;
    this.metrics.skippedTests = testResults.numPendingTests;
    
    if (testResults.coverageMap) {
      const coverage = testResults.coverageMap.getCoverageSummary();
      this.metrics.coverage = {
        lines: coverage.lines.pct,
        functions: coverage.functions.pct,
        branches: coverage.branches.pct,
        statements: coverage.statements.pct
      };
    }
  }

  generateReport(): string {
    return `
Test Results Summary:
- Total: ${this.metrics.totalTests}
- Passed: ${this.metrics.passedTests}
- Failed: ${this.metrics.failedTests}
- Skipped: ${this.metrics.skippedTests}

Coverage:
- Lines: ${this.metrics.coverage.lines}%
- Functions: ${this.metrics.coverage.functions}%
- Branches: ${this.metrics.coverage.branches}%
- Statements: ${this.metrics.coverage.statements}%
    `;
  }
}
```

## 🚀 CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: quiz_game_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd quiz-game-backend && npm ci
        cd ../quiz-game-frontend && npm ci
    
    - name: Run backend tests
      run: |
        cd quiz-game-backend
        npm run test:coverage
      env:
        NODE_ENV: test
        DB_HOST: localhost
        DB_PORT: 5432
        DB_NAME: quiz_game_test
        DB_USER: postgres
        DB_PASSWORD: postgres
    
    - name: Run frontend tests
      run: |
        cd quiz-game-frontend
        npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v4
      with:
        files: |
          quiz-game-backend/coverage/lcov.info
          quiz-game-frontend/coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        npx playwright install --with-deps
    
    - name: Start services
      run: |
        npm run dev:backend &
        npm run dev:frontend &
        sleep 30
    
    - name: Run E2E tests
      run: npx playwright test
    
    - name: Upload E2E results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

## 🔧 Полезные команды

### Основные команды
```bash
# Backend тестирование
npm test                     # Все тесты
npm run test:unit           # Unit тесты
npm run test:integration    # Integration тесты
npm run test:watch          # Watch режим
npm run test:coverage       # С покрытием кода
npm run test:debug          # Debug режим

# Frontend тестирование
npm run test                # Все тесты (Vitest)
npm run test:ui             # UI режим
npm run test:coverage       # С покрытием
npm run test:e2e            # E2E тесты (Playwright)

# E2E тестирование
npx playwright test         # Все E2E тесты
npx playwright test --headed    # С браузером
npx playwright test --debug     # Debug режим
npx playwright show-report     # Отчет

# Утилиты
npm run test:lint           # Линтинг тестов
npm run test:format         # Форматирование тестов
npm run test:clean          # Очистка кеша
```

### Отладка тестов
```bash
# Jest debug
node --inspect-brk node_modules/.bin/jest --runInBand

# Vitest debug
npx vitest --inspect-brk

# Playwright debug
npx playwright test --debug
npx playwright test --ui
```

---

## 🔗 Следующие шаги

1. 🚀 [Деплой и CI/CD](./deployment-guide.md)
2. 🚨 [Troubleshooting](./troubleshooting.md)
3. 👥 [Contributing Guide](./contributing.md)

---

> 💡 **Enterprise совет**: Настройте автоматический запуск тестов при каждом коммите, мониторинг покрытия кода и интеграцию с системами оповещения. Качество кода = качество продукта!
