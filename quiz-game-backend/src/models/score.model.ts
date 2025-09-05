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
import { Round } from './round.model';
import { Team } from './team.model';
// Answer модель удалена - ответы не хранятся в системе
import { User } from './user.model';

/**
 * Модель очков команды
 * Детализированная информация о начислении и снятии очков
 */

export enum ScoreType {
  ROUND_SCORE = 'ROUND_SCORE',
  BONUS = 'BONUS',
  PENALTY = 'PENALTY',
  PARTICIPATION = 'PARTICIPATION',
  MANUAL = 'MANUAL',
  ADJUSTMENT = 'ADJUSTMENT'
}

export interface ScoreMetadata {
  calculationMethod?: string;
  originalPoints?: number;
  adjustmentReason?: string;
  automaticCalculation?: boolean;
  [key: string]: any;
}

@Table({
  tableName: 'scores',
  timestamps: true,
  paranoid: false,
})
export class Score extends Model<Score> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Game)
  @Column(DataType.UUID)
  gameId!: string;

  @AllowNull(false)
  @ForeignKey(() => Team)
  @Column(DataType.UUID)
  teamId!: string;

  @ForeignKey(() => Round)
  @Column(DataType.UUID)
  roundId?: string;

  // answerId удален - связь с ответами не нужна

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(ScoreType)))
  scoreType!: ScoreType;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  points!: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  basePoints!: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  bonusPoints!: number;

  @AllowNull(false)
  @Default(1.0)
  @Validate({
    min: 0.0,
    max: 100.0
  })
  @Column(DataType.DECIMAL(5, 2))
  multiplier!: number;

  @Validate({
    len: [0, 255]
  })
  @Column(DataType.STRING(255))
  reason?: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.INTEGER)
  questionNumber?: number;

  @Column(DataType.INTEGER)
  roundNumber?: number;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  isValid!: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isManual!: boolean;

  @Default({})
  @Column(DataType.JSONB)
  metadata?: ScoreMetadata;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  awardedBy?: string;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  awardedAt!: Date;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  // Ассоциации
  @BelongsTo(() => Game)
  game!: Game;

  @BelongsTo(() => Team)
  team!: Team;

  @BelongsTo(() => Round)
  round?: Round;

  // Связь с Answer удалена

  @BelongsTo(() => User)
  awarder?: User;

  // Методы модели
  isPositive(): boolean {
    return this.points > 0;
  }

  isNegative(): boolean {
    return this.points < 0;
  }

  isBonus(): boolean {
    return [
      ScoreType.BONUS,
      ScoreType.PARTICIPATION
    ].includes(this.scoreType);
  }

  isPenalty(): boolean {
    return this.scoreType === ScoreType.PENALTY;
  }

  getEffectivePoints(): number {
    if (!this.isValid) return 0;
    return Math.round(this.points * this.multiplier);
  }

  getScoreBreakdown(): {
    base: number;
    bonus: number;
    multiplier: number;
    total: number;
  } {
    return {
      base: this.basePoints,
      bonus: this.bonusPoints,
      multiplier: this.multiplier,
      total: this.getEffectivePoints()
    };
  }

  static async getTeamTotalScore(teamId: string, gameId?: string): Promise<number> {
    const whereClause: any = {
      teamId,
      isValid: true
    };

    if (gameId) {
      whereClause.gameId = gameId;
    }

    const scores = await Score.findAll({
      where: whereClause,
      attributes: ['points', 'multiplier']
    });

    return scores.reduce((total, score) => {
      return total + Math.round(score.points * score.multiplier);
    }, 0);
  }

  static async getTeamScoreByRound(teamId: string, gameId: string): Promise<Map<string, number>> {
    const scores = await Score.findAll({
      where: {
        teamId,
        gameId,
        isValid: true,
        roundId: { [require('sequelize').Op.ne]: null }
      },
      attributes: ['roundId', 'points', 'multiplier']
    });

    const scoresByRound = new Map<string, number>();

    scores.forEach(score => {
      if (score.roundId) {
        const currentScore = scoresByRound.get(score.roundId) || 0;
        scoresByRound.set(score.roundId, currentScore + Math.round(score.points * score.multiplier));
      }
    });

    return scoresByRound;
  }
}
