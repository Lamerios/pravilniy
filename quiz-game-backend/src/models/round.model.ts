import {
    AllowNull,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    Default,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
    Validate
} from 'sequelize-typescript';
import { Game } from './game.model';
import { GameTemplate } from './game-template.model';
// Answer модель удалена

/**
 * Модель раунда игры
 * Представляет отдельный раунд в игровой сессии
 */

export enum RoundType {
  STANDARD = 'STANDARD',
  BLITZ = 'BLITZ',
  BONUS = 'BONUS',
  FINAL = 'FINAL',
  TIEBREAKER = 'TIEBREAKER'
}

export enum RoundStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

// Интерфейс Question удален - вопросы не хранятся в системе
// Команды отвечают на бумаге, администратор вносит результаты

export interface RoundSettings {
  shuffleQuestions?: boolean;
  showAnswers?: boolean;
  allowRetries?: boolean;
  [key: string]: any;
}

export interface RoundStatistics {
  totalAnswers: number;
  correctAnswers: number;
  averageTime: number;
  participatingTeams: number;
  [key: string]: any;
}

@Table({
  tableName: 'rounds',
  timestamps: true,
  paranoid: false,
})
export class Round extends Model<Round> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Game)
  @Column(DataType.UUID)
  gameId!: string;

  @ForeignKey(() => GameTemplate)
  @Column(DataType.INTEGER)
  templateId?: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  roundNumber!: number;

  @AllowNull(false)
  @Validate({
    len: [1, 255]
  })
  @Column(DataType.STRING(255))
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Default(RoundType.STANDARD)
  @Column(DataType.ENUM(...Object.values(RoundType)))
  type!: RoundType;

  @AllowNull(false)
  @Default(RoundStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(RoundStatus)))
  status!: RoundStatus;

  @Column(DataType.INTEGER)
  timeLimit?: number;

  @Column(DataType.INTEGER)
  questionTimeLimit?: number;

  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  totalQuestions!: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  currentQuestion!: number;

  @AllowNull(false)
  @Default(10)
  @Column(DataType.INTEGER)
  maxPoints!: number;

  @AllowNull(false)
  @Default(1.0)
  @Validate({
    min: 0.1,
    max: 10.0
  })
  @Column(DataType.DECIMAL(3, 2))
  multiplier!: number;

  // Поле questions удалено - вопросы не хранятся в системе

  @Default({})
  @Column(DataType.JSONB)
  settings?: RoundSettings;

  @Default({
    totalAnswers: 0,
    correctAnswers: 0,
    averageTime: 0,
    participatingTeams: 0
  })
  @Column(DataType.JSONB)
  statistics?: RoundStatistics;

  @Column(DataType.DATE)
  startedAt?: Date;

  @Column(DataType.DATE)
  finishedAt?: Date;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  // Ассоциации
  @BelongsTo(() => Game)
  game!: Game;

  @BelongsTo(() => GameTemplate)
  template?: GameTemplate;

  // Связь с Answer удалена

  // Методы модели
  isActive(): boolean {
    return this.status === RoundStatus.ACTIVE;
  }

  isFinished(): boolean {
    return this.status === RoundStatus.FINISHED;
  }

  getDuration(): number | null {
    if (this.startedAt && this.finishedAt) {
      return this.finishedAt.getTime() - this.startedAt.getTime();
    }
    return null;
  }

  getProgressPercentage(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round((this.currentQuestion / this.totalQuestions) * 100);
  }

  // Метод getCurrentQuestion удален - вопросы не хранятся в системе
}
