# ⚙️ Backend разработка - Enterprise Guide

> **Для**: Backend разработчиков | **Стек**: Node.js + TypeScript + PostgreSQL | **Enterprise-ready**

## 🚀 Быстрый старт

### Структура проекта
```
quiz-game-backend/
├── src/
│   ├── controllers/        # HTTP контроллеры
│   │   ├── auth/          # Аутентификация
│   │   ├── games/         # Управление играми
│   │   ├── teams/         # Управление командами
│   │   ├── scores/        # Система баллов
│   │   └── admin/         # Админ функции
│   ├── services/          # Бизнес-логика
│   │   ├── gameService.ts
│   │   ├── scoreService.ts
│   │   ├── authService.ts
│   │   └── websocketService.ts
│   ├── models/            # Sequelize модели
│   │   ├── Organization.ts
│   │   ├── User.ts
│   │   ├── Game.ts
│   │   └── index.ts
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── rateLimit.ts
│   │   └── errorHandler.ts
│   ├── routes/            # API маршруты
│   │   ├── auth.ts
│   │   ├── games.ts
│   │   ├── teams.ts
│   │   └── index.ts
│   ├── utils/             # Утилиты
│   │   ├── logger.ts
│   │   ├── database.ts
│   │   └── validation.ts
│   ├── types/             # TypeScript типы
│   │   ├── api.ts
│   │   ├── database.ts
│   │   └── auth.ts
│   ├── config/            # Конфигурация
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── app.ts
│   └── tests/             # Тесты
│       ├── unit/
│       ├── integration/
│       └── fixtures/
├── database/              # Миграции и сиды
│   ├── migrations/
│   ├── seeders/
│   └── config.js
├── scripts/               # Утилитарные скрипты
│   ├── migrate.ts
│   ├── seed.ts
│   └── backup.ts
├── docs/                  # API документация
│   └── swagger.yml
└── docker/                # Docker конфигурация
    ├── Dockerfile
    └── docker-compose.yml
```

### Команды для разработки
```bash
# Установка зависимостей
npm install

# Разработка с hot reload
npm run dev

# Сборка TypeScript
npm run build

# Запуск в продакшене
npm start

# Тестирование
npm test
npm run test:watch
npm run test:coverage

# Линтинг
npm run lint
npm run lint:fix

# База данных
npm run db:migrate
npm run db:seed
npm run db:reset

# Документация API
npm run docs:generate
npm run docs:serve
```

## 🛠️ Технологический стек

### Основные технологии
| Технология | Версия | Назначение |
|------------|--------|------------|
| **Node.js** | 20.0+ LTS | Runtime |
| **TypeScript** | 5.8+ | Типизация |
| **Express.js** | 4.21+ | Web framework |
| **Sequelize** | 6.37+ | ORM |
| **PostgreSQL** | 15+ | База данных |
| **Redis** | 7.0+ | Кеширование и сессии |
| **Socket.IO** | 4.8+ | WebSocket сервер |
| **JWT** | 9.0+ | Аутентификация |

### Инструменты разработки
| Инструмент | Версия | Назначение |
|------------|--------|------------|
| **ESLint** | 9.0+ | Линтинг |
| **Prettier** | 3.4+ | Форматирование |
| **Jest** | 29.0+ | Тестирование |
| **Supertest** | 7.0+ | API тестирование |
| **Nodemon** | 3.1+ | Hot reload |
| **Winston** | 3.17+ | Логирование |
| **Joi** | 17.13+ | Валидация |
| **Swagger** | 3.0+ | API документация |

## 🏗️ Архитектура Backend

### Layered Architecture
```
┌─────────────────────────────────────────┐
│              Controllers                │  ← HTTP handlers
├─────────────────────────────────────────┤
│               Services                  │  ← Business logic
├─────────────────────────────────────────┤
│               Models                    │  ← Data access
├─────────────────────────────────────────┤
│              Database                   │  ← PostgreSQL
└─────────────────────────────────────────┘
```

### Dependency Injection Container
```typescript
// src/container.ts
import { Container } from 'inversify';
import { TYPES } from './types/container';
import { GameService, IGameService } from './services/GameService';
import { ScoreService, IScoreService } from './services/ScoreService';
import { AuthService, IAuthService } from './services/AuthService';
import { WebSocketService, IWebSocketService } from './services/WebSocketService';

const container = new Container();

// Services
container.bind<IGameService>(TYPES.GameService).to(GameService);
container.bind<IScoreService>(TYPES.ScoreService).to(ScoreService);
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IWebSocketService>(TYPES.WebSocketService).to(WebSocketService);

export { container };
```

## 📊 Модели данных (Sequelize)

### Base Model
```typescript
// src/models/BaseModel.ts
import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes
} from 'sequelize';
import { sequelize } from '../config/database';

export abstract class BaseModel<T extends Model> extends Model<
  InferAttributes<T>,
  InferCreationAttributes<T>
> {
  declare id: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initializeModel(modelClass: any, attributes: any, options: any = {}) {
    return modelClass.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        ...attributes,
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        ...options
      }
    );
  }
}
```

### Game Model
```typescript
// src/models/Game.ts
import {
  DataTypes,
  Association,
  HasManyGetAssociationsMixin,
  HasManyCreateAssociationMixin,
  NonAttribute
} from 'sequelize';
import { BaseModel } from './BaseModel';
import { TeamInstance } from './TeamInstance';
import { RoundInstance } from './RoundInstance';

export enum GameStatus {
  CREATED = 'created',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface GameAttributes {
  id: string;
  title: string;
  date: Date;
  status: GameStatus;
  currentRound: number;
  metadata: Record<string, any>;
  notes?: string;
  templateId: string;
  organizationId: string;
  createdBy?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Game extends BaseModel<Game> implements GameAttributes {
  declare id: string;
  declare title: string;
  declare date: Date;
  declare status: GameStatus;
  declare currentRound: number;
  declare metadata: Record<string, any>;
  declare notes?: string;
  declare templateId: string;
  declare organizationId: string;
  declare createdBy?: string;
  declare startedAt?: Date;
  declare completedAt?: Date;
  declare createdAt: Date;
  declare updatedAt: Date;

  // Associations
  declare getTeams: HasManyGetAssociationsMixin<TeamInstance>;
  declare createTeam: HasManyCreateAssociationMixin<TeamInstance>;
  declare getRounds: HasManyGetAssociationsMixin<RoundInstance>;
  declare createRound: HasManyCreateAssociationMixin<RoundInstance>;

  declare teams?: NonAttribute<TeamInstance[]>;
  declare rounds?: NonAttribute<RoundInstance[]>;

  static associations: {
    teams: Association<Game, TeamInstance>;
    rounds: Association<Game, RoundInstance>;
  };
}

BaseModel.initializeModel(
  Game,
  {
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [3, 200]
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(GameStatus)),
      allowNull: false,
      defaultValue: GameStatus.CREATED
    },
    currentRound: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'template_id'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'organization_id'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'created_by'
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'started_at'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at'
    }
  },
  {
    tableName: 'games',
    schema: 'core',
    indexes: [
      { fields: ['organization_id'] },
      { fields: ['date'] },
      { fields: ['status'] },
      { fields: ['template_id'] },
      { fields: ['organization_id', 'status', 'date'] }
    ]
  }
);
```

## 🎯 Services (Бизнес-логика)

### Game Service
```typescript
// src/services/GameService.ts
import { injectable, inject } from 'inversify';
import { Transaction } from 'sequelize';
import { Game, GameStatus } from '../models/Game';
import { TeamInstance } from '../models/TeamInstance';
import { RoundInstance } from '../models/RoundInstance';
import { GameTemplate } from '../models/GameTemplate';
import { sequelize } from '../config/database';
import { TYPES } from '../types/container';
import { IWebSocketService } from './WebSocketService';
import { Logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export interface CreateGameData {
  title: string;
  templateId: string;
  date: string;
  teams: Array<{
    name: string;
    tableNumber: number;
    teamDirectoryId?: string;
  }>;
  organizationId: string;
  createdBy: string;
}

export interface IGameService {
  createGame(data: CreateGameData): Promise<Game>;
  getGame(id: string, organizationId: string): Promise<Game | null>;
  updateGameStatus(
    gameId: string,
    status: GameStatus,
    organizationId: string
  ): Promise<Game>;
  getScoreboard(gameId: string): Promise<any>;
}

@injectable()
export class GameService implements IGameService {
  constructor(
    @inject(TYPES.WebSocketService)
    private webSocketService: IWebSocketService
  ) {}

  async createGame(data: CreateGameData): Promise<Game> {
    const transaction = await sequelize.transaction();

    try {
      // Проверяем существование шаблона
      const template = await GameTemplate.findOne({
        where: {
          id: data.templateId,
          organizationId: data.organizationId,
          isActive: true
        },
        include: ['roundTemplates'],
        transaction
      });

      if (!template) {
        throw new AppError('Game template not found', 404);
      }

      // Создаем игру
      const game = await Game.create(
        {
          title: data.title,
          templateId: data.templateId,
          date: new Date(data.date),
          organizationId: data.organizationId,
          createdBy: data.createdBy,
          metadata: {
            templateTitle: template.title,
            totalRounds: template.roundTemplates?.length || 0
          }
        },
        { transaction }
      );

      // Создаем команды
      const teams = await Promise.all(
        data.teams.map((teamData, index) =>
          TeamInstance.create(
            {
              name: teamData.name,
              tableNumber: teamData.tableNumber,
              gameId: game.id,
              teamDirectoryId: teamData.teamDirectoryId,
              totalPoints: 0
            },
            { transaction }
          )
        )
      );

      // Создаем раунды на основе шаблона
      if (template.roundTemplates) {
        await Promise.all(
          template.roundTemplates.map((roundTemplate) =>
            RoundInstance.create(
              {
                order: roundTemplate.order,
                gameId: game.id,
                roundTemplateId: roundTemplate.id,
                status: 'pending',
                roundData: {
                  name: roundTemplate.name,
                  questionCount: roundTemplate.questionCount,
                  pointsPerCorrect: roundTemplate.pointsPerCorrect,
                  stakeEnabled: roundTemplate.stakeEnabled,
                  stakeOptions: roundTemplate.stakeOptions
                }
              },
              { transaction }
            )
          )
        );
      }

      await transaction.commit();

      // Загружаем полную игру с ассоциациями
      const fullGame = await this.getGame(game.id, data.organizationId);
      
      if (fullGame) {
        // Уведомляем через WebSocket
        this.webSocketService.emitToOrganization(
          data.organizationId,
          'game:created',
          {
            gameId: fullGame.id,
            title: fullGame.title,
            teamCount: teams.length
          }
        );

        Logger.info('Game created', {
          gameId: fullGame.id,
          title: fullGame.title,
          organizationId: data.organizationId,
          createdBy: data.createdBy
        });
      }

      return fullGame!;
    } catch (error) {
      await transaction.rollback();
      Logger.error('Failed to create game', { error, data });
      throw error;
    }
  }

  async getGame(id: string, organizationId: string): Promise<Game | null> {
    return Game.findOne({
      where: { id, organizationId },
      include: [
        {
          model: TeamInstance,
          as: 'teams',
          order: [['tableNumber', 'ASC']]
        },
        {
          model: RoundInstance,
          as: 'rounds',
          order: [['order', 'ASC']]
        }
      ]
    });
  }

  async updateGameStatus(
    gameId: string,
    status: GameStatus,
    organizationId: string
  ): Promise<Game> {
    const game = await Game.findOne({
      where: { id: gameId, organizationId }
    });

    if (!game) {
      throw new AppError('Game not found', 404);
    }

    const oldStatus = game.status;
    
    // Обновляем статус и временные метки
    const updateData: Partial<GameAttributes> = { status };
    
    if (status === GameStatus.IN_PROGRESS && !game.startedAt) {
      updateData.startedAt = new Date();
    }
    
    if (status === GameStatus.COMPLETED && !game.completedAt) {
      updateData.completedAt = new Date();
    }

    await game.update(updateData);

    // Уведомляем через WebSocket
    this.webSocketService.emitToGame(gameId, 'game:status:changed', {
      gameId,
      oldStatus,
      newStatus: status,
      timestamp: new Date().toISOString()
    });

    Logger.info('Game status updated', {
      gameId,
      oldStatus,
      newStatus: status,
      organizationId
    });

    return game;
  }

  async getScoreboard(gameId: string): Promise<any> {
    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: TeamInstance,
          as: 'teams',
          order: [['totalPoints', 'DESC']],
          include: ['teamDirectory']
        },
        {
          model: RoundInstance,
          as: 'rounds',
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!game) {
      throw new AppError('Game not found', 404);
    }

    // Добавляем позиции командам
    const teamsWithPositions = game.teams?.map((team, index) => ({
      ...team.toJSON(),
      position: index + 1
    })) || [];

    return {
      gameId: game.id,
      gameTitle: game.title,
      status: game.status,
      currentRound: game.currentRound,
      teams: teamsWithPositions,
      rounds: game.rounds,
      lastUpdated: game.updatedAt
    };
  }
}
```

### Score Service
```typescript
// src/services/ScoreService.ts
import { injectable, inject } from 'inversify';
import { Transaction } from 'sequelize';
import { Answer } from '../models/Answer';
import { TeamInstance } from '../models/TeamInstance';
import { RoundInstance } from '../models/RoundInstance';
import { sequelize } from '../config/database';
import { TYPES } from '../types/container';
import { IWebSocketService } from './WebSocketService';
import { Logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export interface UpdateScoreData {
  gameId: string;
  roundId: string;
  teamId: string;
  questionNumber: number;
  isCorrect: boolean;
  stake?: number;
  notes?: string;
  createdBy: string;
}

export interface IScoreService {
  updateScore(data: UpdateScoreData): Promise<{
    answer: Answer;
    teamTotalPoints: number;
    position: number;
  }>;
  calculatePoints(
    isCorrect: boolean,
    pointsPerCorrect: number,
    stake?: number
  ): number;
}

@injectable()
export class ScoreService implements IScoreService {
  constructor(
    @inject(TYPES.WebSocketService)
    private webSocketService: IWebSocketService
  ) {}

  async updateScore(data: UpdateScoreData): Promise<{
    answer: Answer;
    teamTotalPoints: number;
    position: number;
  }> {
    const transaction = await sequelize.transaction();

    try {
      // Получаем информацию о раунде
      const round = await RoundInstance.findByPk(data.roundId, {
        include: ['roundTemplate'],
        transaction
      });

      if (!round) {
        throw new AppError('Round not found', 404);
      }

      // Проверяем существование команды
      const team = await TeamInstance.findOne({
        where: { id: data.teamId, gameId: data.gameId },
        transaction
      });

      if (!team) {
        throw new AppError('Team not found', 404);
      }

      // Проверяем, нет ли уже ответа на этот вопрос
      const existingAnswer = await Answer.findOne({
        where: {
          roundId: data.roundId,
          teamId: data.teamId,
          questionNumber: data.questionNumber
        },
        transaction
      });

      if (existingAnswer) {
        throw new AppError('Answer already exists for this question', 409);
      }

      // Рассчитываем баллы
      const pointsPerCorrect = round.roundData?.pointsPerCorrect || 1.0;
      const pointsAwarded = this.calculatePoints(
        data.isCorrect,
        pointsPerCorrect,
        data.stake
      );

      // Создаем ответ
      const answer = await Answer.create(
        {
          roundId: data.roundId,
          teamId: data.teamId,
          questionNumber: data.questionNumber,
          isCorrect: data.isCorrect,
          stake: data.isCorrect ? data.stake : null,
          pointsAwarded,
          notes: data.notes,
          createdBy: data.createdBy,
          answerMetadata: {
            roundName: round.roundData?.name,
            pointsPerCorrect
          }
        },
        { transaction }
      );

      // Обновляем общий счет команды
      await team.update(
        {
          totalPoints: sequelize.literal(`total_points + ${pointsAwarded}`)
        },
        { transaction }
      );

      // Получаем обновленную команду
      await team.reload({ transaction });

      // Определяем позицию команды
      const position = await this.getTeamPosition(
        data.gameId,
        data.teamId,
        transaction
      );

      await transaction.commit();

      // Уведомляем через WebSocket
      this.webSocketService.emitToGame(data.gameId, 'score:updated', {
        gameId: data.gameId,
        teamId: data.teamId,
        teamName: team.name,
        roundId: data.roundId,
        questionNumber: data.questionNumber,
        isCorrect: data.isCorrect,
        pointsAwarded,
        teamTotalPoints: team.totalPoints,
        position,
        timestamp: new Date().toISOString()
      });

      Logger.info('Score updated', {
        gameId: data.gameId,
        teamId: data.teamId,
        questionNumber: data.questionNumber,
        pointsAwarded,
        totalPoints: team.totalPoints
      });

      return {
        answer,
        teamTotalPoints: team.totalPoints,
        position
      };
    } catch (error) {
      await transaction.rollback();
      Logger.error('Failed to update score', { error, data });
      throw error;
    }
  }

  calculatePoints(
    isCorrect: boolean,
    pointsPerCorrect: number,
    stake?: number
  ): number {
    if (!isCorrect) {
      return 0;
    }

    if (stake && stake > 0) {
      return pointsPerCorrect * stake;
    }

    return pointsPerCorrect;
  }

  private async getTeamPosition(
    gameId: string,
    teamId: string,
    transaction: Transaction
  ): Promise<number> {
    const teams = await TeamInstance.findAll({
      where: { gameId },
      order: [['totalPoints', 'DESC']],
      transaction
    });

    const position = teams.findIndex(team => team.id === teamId) + 1;
    return position;
  }
}
```

## 🌐 Controllers

### Game Controller
```typescript
// src/controllers/GameController.ts
import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import { body, param, query, validationResult } from 'express-validator';
import { TYPES } from '../types/container';
import { IGameService } from '../services/GameService';
import { GameStatus } from '../models/Game';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/auth';

@injectable()
export class GameController {
  constructor(
    @inject(TYPES.GameService)
    private gameService: IGameService
  ) {}

  // Валидация для создания игры
  static createGameValidation = [
    body('title')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    body('templateId')
      .isUUID()
      .withMessage('Template ID must be a valid UUID'),
    body('date')
      .isISO8601()
      .withMessage('Date must be in ISO format'),
    body('teams')
      .isArray({ min: 2, max: 20 })
      .withMessage('Must have between 2 and 20 teams'),
    body('teams.*.name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Team name must be between 2 and 100 characters'),
    body('teams.*.tableNumber')
      .isInt({ min: 1, max: 999 })
      .withMessage('Table number must be between 1 and 999')
  ];

  async createGame(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
      }

      const game = await this.gameService.createGame({
        ...req.body,
        organizationId: req.user!.organizationId,
        createdBy: req.user!.id
      });

      res.status(201).json({
        success: true,
        data: game,
        message: 'Game created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getGames(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as GameStatus;

      const games = await this.gameService.getGames({
        organizationId: req.user!.organizationId,
        page,
        limit,
        status
      });

      res.json({
        success: true,
        data: games
      });
    } catch (error) {
      next(error);
    }
  }

  async getGame(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      
      const game = await this.gameService.getGame(
        id,
        req.user!.organizationId
      );

      if (!game) {
        throw new AppError('Game not found', 404);
      }

      res.json({
        success: true,
        data: game
      });
    } catch (error) {
      next(error);
    }
  }

  async getScoreboard(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      
      const scoreboard = await this.gameService.getScoreboard(id);

      res.json({
        success: true,
        data: scoreboard
      });
    } catch (error) {
      next(error);
    }
  }

  async updateGameStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const game = await this.gameService.updateGameStatus(
        id,
        status,
        req.user!.organizationId
      );

      res.json({
        success: true,
        data: game,
        message: 'Game status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
```

## 🔌 WebSocket Service

```typescript
// src/services/WebSocketService.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { injectable } from 'inversify';
import { Logger } from '../utils/logger';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';

export interface IWebSocketService {
  initialize(httpServer: HttpServer): void;
  emitToGame(gameId: string, event: string, data: any): void;
  emitToOrganization(organizationId: string, event: string, data: any): void;
  emitToUser(userId: string, event: string, data: any): void;
}

@injectable()
export class WebSocketService implements IWebSocketService {
  private io?: SocketIOServer;
  private gameRooms = new Map<string, Set<string>>(); // gameId -> socketIds
  private organizationRooms = new Map<string, Set<string>>(); // orgId -> socketIds
  private userSockets = new Map<string, string>(); // userId -> socketId

  initialize(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
      },
      transports: ['websocket']
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = verifyToken(token);
        const user = await User.findByPk(decoded.id);
        
        if (!user || !user.isActive) {
          return next(new Error('User not found or inactive'));
        }

        socket.data = {
          userId: user.id,
          organizationId: user.organizationId,
          role: user.role
        };

        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      const { userId, organizationId } = socket.data;

      Logger.info('WebSocket connection established', {
        socketId: socket.id,
        userId,
        organizationId
      });

      // Присоединяем к комнате организации
      socket.join(`org:${organizationId}`);
      this.addToOrganizationRoom(organizationId, socket.id);
      this.userSockets.set(userId, socket.id);

      // Обработка присоединения к игре
      socket.on('game:join', (data) => {
        const { gameId } = data;
        socket.join(`game:${gameId}`);
        this.addToGameRoom(gameId, socket.id);

        Logger.info('User joined game', {
          userId,
          gameId,
          socketId: socket.id
        });

        socket.emit('game:joined', { gameId });
      });

      // Обработка покидания игры
      socket.on('game:leave', (data) => {
        const { gameId } = data;
        socket.leave(`game:${gameId}`);
        this.removeFromGameRoom(gameId, socket.id);

        Logger.info('User left game', {
          userId,
          gameId,
          socketId: socket.id
        });
      });

      // Обработка отключения
      socket.on('disconnect', (reason) => {
        Logger.info('WebSocket disconnected', {
          socketId: socket.id,
          userId,
          reason
        });

        // Очищаем все комнаты
        this.removeFromOrganizationRoom(organizationId, socket.id);
        this.userSockets.delete(userId);

        // Удаляем из всех игровых комнат
        this.gameRooms.forEach((socketIds, gameId) => {
          if (socketIds.has(socket.id)) {
            socketIds.delete(socket.id);
          }
        });
      });

      // Ping/Pong для поддержания соединения
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });

    Logger.info('WebSocket server initialized');
  }

  emitToGame(gameId: string, event: string, data: any): void {
    if (!this.io) return;

    this.io.to(`game:${gameId}`).emit(event, data);
    
    Logger.debug('Event emitted to game', {
      gameId,
      event,
      recipientCount: this.gameRooms.get(gameId)?.size || 0
    });
  }

  emitToOrganization(organizationId: string, event: string, data: any): void {
    if (!this.io) return;

    this.io.to(`org:${organizationId}`).emit(event, data);
    
    Logger.debug('Event emitted to organization', {
      organizationId,
      event,
      recipientCount: this.organizationRooms.get(organizationId)?.size || 0
    });
  }

  emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;

    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      
      Logger.debug('Event emitted to user', {
        userId,
        event,
        socketId
      });
    }
  }

  private addToGameRoom(gameId: string, socketId: string): void {
    if (!this.gameRooms.has(gameId)) {
      this.gameRooms.set(gameId, new Set());
    }
    this.gameRooms.get(gameId)!.add(socketId);
  }

  private removeFromGameRoom(gameId: string, socketId: string): void {
    const room = this.gameRooms.get(gameId);
    if (room) {
      room.delete(socketId);
      if (room.size === 0) {
        this.gameRooms.delete(gameId);
      }
    }
  }

  private addToOrganizationRoom(organizationId: string, socketId: string): void {
    if (!this.organizationRooms.has(organizationId)) {
      this.organizationRooms.set(organizationId, new Set());
    }
    this.organizationRooms.get(organizationId)!.add(socketId);
  }

  private removeFromOrganizationRoom(organizationId: string, socketId: string): void {
    const room = this.organizationRooms.get(organizationId);
    if (room) {
      room.delete(socketId);
      if (room.size === 0) {
        this.organizationRooms.delete(organizationId);
      }
    }
  }
}
```

## 🧪 Тестирование

### Unit тесты
```typescript
// src/tests/unit/services/GameService.test.ts
import { GameService } from '../../../services/GameService';
import { Game } from '../../../models/Game';
import { GameTemplate } from '../../../models/GameTemplate';
import { sequelize } from '../../../config/database';

// Мокаем зависимости
jest.mock('../../../models/Game');
jest.mock('../../../models/GameTemplate');
jest.mock('../../../config/database');

const mockWebSocketService = {
  emitToOrganization: jest.fn(),
  emitToGame: jest.fn()
};

describe('GameService', () => {
  let gameService: GameService;
  let mockTransaction: any;

  beforeEach(() => {
    gameService = new GameService(mockWebSocketService as any);
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn()
    };
    (sequelize.transaction as jest.Mock).mockResolvedValue(mockTransaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGame', () => {
    const createGameData = {
      title: 'Test Game',
      templateId: 'template-123',
      date: '2025-01-27',
      teams: [
        { name: 'Team A', tableNumber: 1 },
        { name: 'Team B', tableNumber: 2 }
      ],
      organizationId: 'org-123',
      createdBy: 'user-123'
    };

    it('should create game with teams and rounds', async () => {
      const mockTemplate = {
        id: 'template-123',
        title: 'Test Template',
        roundTemplates: [
          {
            id: 'round-1',
            name: 'Round 1',
            order: 1,
            questionCount: 10,
            pointsPerCorrect: 1.0
          }
        ]
      };

      const mockGame = {
        id: 'game-123',
        title: 'Test Game',
        templateId: 'template-123'
      };

      (GameTemplate.findOne as jest.Mock).mockResolvedValue(mockTemplate);
      (Game.create as jest.Mock).mockResolvedValue(mockGame);

      const result = await gameService.createGame(createGameData);

      expect(GameTemplate.findOne).toHaveBeenCalledWith({
        where: {
          id: 'template-123',
          organizationId: 'org-123',
          isActive: true
        },
        include: ['roundTemplates'],
        transaction: mockTransaction
      });

      expect(Game.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Game',
          templateId: 'template-123',
          organizationId: 'org-123',
          createdBy: 'user-123'
        }),
        { transaction: mockTransaction }
      );

      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockWebSocketService.emitToOrganization).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      (GameTemplate.findOne as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(gameService.createGame(createGameData)).rejects.toThrow(
        'Database error'
      );

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
```

### Integration тесты
```typescript
// src/tests/integration/controllers/GameController.test.ts
import request from 'supertest';
import { app } from '../../../app';
import { sequelize } from '../../../config/database';
import { Game } from '../../../models/Game';
import { User } from '../../../models/User';
import { generateToken } from '../../../utils/jwt';

describe('GameController Integration', () => {
  let authToken: string;
  let user: User;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Создаем тестового пользователя
    user = await User.create({
      email: 'test@example.com',
      passwordHash: 'hashed_password',
      role: 'admin',
      organizationId: 'org-123'
    });

    authToken = generateToken({
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Game.destroy({ where: {}, force: true });
  });

  describe('POST /api/games', () => {
    const gameData = {
      title: 'Integration Test Game',
      templateId: 'template-123',
      date: '2025-01-27',
      teams: [
        { name: 'Team Alpha', tableNumber: 1 },
        { name: 'Team Beta', tableNumber: 2 }
      ]
    };

    it('should create game successfully', async () => {
      const response = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gameData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: 'Integration Test Game',
        organizationId: user.organizationId
      });

      // Проверяем, что игра создалась в БД
      const gameInDb = await Game.findByPk(response.body.data.id);
      expect(gameInDb).toBeTruthy();
    });

    it('should return 401 without auth token', async () => {
      await request(app)
        .post('/api/games')
        .send(gameData)
        .expect(401);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'A' }) // Слишком короткое название
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });
});
```

## 🔧 Полезные команды

### Разработка
```bash
# Создание нового контроллера
npm run generate:controller ControllerName

# Создание нового сервиса
npm run generate:service ServiceName

# Создание новой модели
npm run generate:model ModelName

# Создание миграции
npm run db:migration:generate -- --name add-new-feature

# Запуск миграций
npm run db:migrate

# Откат миграции
npm run db:migrate:undo

# Создание сида
npm run db:seed:generate -- --name demo-data

# Запуск сидов
npm run db:seed:all
```

### Тестирование
```bash
# Все тесты
npm test

# Watch режим
npm run test:watch

# Покрытие кода
npm run test:coverage

# Только unit тесты
npm run test:unit

# Только integration тесты
npm run test:integration

# Определенный файл
npm test -- GameService.test.ts
```

### Утилиты
```bash
# Генерация API документации
npm run docs:generate

# Проверка типов TypeScript
npm run type-check

# Анализ безопасности
npm audit

# Обновление зависимостей
npm run deps:update
```

---

## 🔗 Следующие шаги

1. 🧪 [Тестирование Backend](./testing-guide.md)
2. 🚀 [Деплой Backend](./deployment-guide.md)
3. 📊 [Мониторинг и логирование](./troubleshooting.md)

---

> 💡 **Enterprise совет**: Используйте dependency injection, пишите тесты для всех сервисов, логируйте все важные операции и настройте мониторинг производительности с самого начала.
