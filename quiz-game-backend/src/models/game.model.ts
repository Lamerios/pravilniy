import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
  Validate
} from 'sequelize-typescript';
import { Organization } from './organization.model';
import { User } from './user.model';
import { GameTemplate } from './game-template.model';
import { Team } from './team.model';
import { Round } from './round.model';

/**
 * Модель игровой сессии
 * Представляет конкретную игровую сессию, созданную на основе шаблона
 */

export enum GameStatus {
  DRAFT = 'DRAFT',
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

export interface ScoringSystem {
  basePoints: number;
  timeBonus: boolean;
  penaltyForWrong: boolean;
  streakBonus: boolean;
}

export interface GameSettings {
  allowLateJoin?: boolean;
  autoStart?: boolean;
  showScores?: boolean;
  allowHints?: boolean;
  [key: string]: any;
}

export interface GameData {
  configuration?: any;
  rules?: string;
  notes?: string;
  [key: string]: any;
}

@Table({
  tableName: 'games',
  timestamps: true,
  paranoid: false,
})
export class Game extends Model<Game> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Column(DataType.UUID)
  organizationId!: string;

  @AllowNull(false)
  @ForeignKey(() => GameTemplate)
  @Column(DataType.UUID)
  templateId!: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  createdBy!: string;

  @AllowNull(false)
  @Validate({
    len: [1, 255]
  })
  @Column(DataType.STRING(255))
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Unique
  @Validate({
    len: [4, 20]
  })
  @Column(DataType.STRING(20))
  gameCode!: string;

  @AllowNull(false)
  @Default(GameStatus.DRAFT)
  @Column(DataType.ENUM(...Object.values(GameStatus)))
  status!: GameStatus;

  @AllowNull(false)
  @Default(10)
  @Validate({
    min: 1,
    max: 100
  })
  @Column(DataType.INTEGER)
  maxTeams!: number;

  @AllowNull(false)
  @Default(5)
  @Validate({
    min: 1,
    max: 20
  })
  @Column(DataType.INTEGER)
  maxPlayersPerTeam!: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  currentRound!: number;

  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  totalRounds!: number;

  @Column(DataType.INTEGER)
  timeLimit?: number;

  @Column(DataType.INTEGER)
  roundTimeLimit?: number;

  @Column(DataType.INTEGER)
  questionTimeLimit?: number;

  @Default({})
  @Column(DataType.JSONB)
  settings?: GameSettings;

  @Default({})
  @Column(DataType.JSONB)
  gameData?: GameData;

  @Default({
    basePoints: 10,
    timeBonus: true,
    penaltyForWrong: false,
    streakBonus: false
  })
  @Column(DataType.JSONB)
  scoringSystem?: ScoringSystem;

  @Column(DataType.DATE)
  startedAt?: Date;

  @Column(DataType.DATE)
  finishedAt?: Date;

  @Column(DataType.DATE)
  scheduledAt?: Date;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isPublic!: boolean;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  allowLateJoin!: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  autoStart!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  // Ассоциации
  @BelongsTo(() => Organization)
  organization!: Organization;

  @BelongsTo(() => GameTemplate)
  template!: GameTemplate;

  @BelongsTo(() => User)
  creator!: User;

  @HasMany(() => Team)
  teams!: Team[];

  @HasMany(() => Round)
  rounds!: Round[];

  // Методы модели
  isActive(): boolean {
    return this.status === GameStatus.ACTIVE;
  }

  isFinished(): boolean {
    return this.status === GameStatus.FINISHED;
  }

  canJoin(): boolean {
    return this.status === GameStatus.WAITING || 
           (this.status === GameStatus.ACTIVE && this.allowLateJoin);
  }

  getDuration(): number | null {
    if (this.startedAt && this.finishedAt) {
      return this.finishedAt.getTime() - this.startedAt.getTime();
    }
    return null;
  }
}