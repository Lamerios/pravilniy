import {
    AllowNull,
    BelongsTo,
    BelongsToMany,
    Column,
    CreatedAt,
    DataType,
    Default,
    ForeignKey,
    HasMany,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt,
    Validate
} from 'sequelize-typescript';
import { GameTeam } from './game-team.model';
import { Game } from './game.model';
import { Organization } from './organization.model';
// Answer модель удалена
import { Score } from './score.model';

/**
 * Модель команды в игре
 * Представляет команду, участвующую в игровой сессии
 */

export interface TeamMember {
  name: string;
  email?: string;
  role?: string;
  joinedAt?: Date;
  [key: string]: any;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
}

export interface TeamStatistics {
  roundsPlayed: number;
  totalScore: number;
  averageScore: number;
  bestRound: number;
  worstRound: number;
  [key: string]: any;
}

@Table({
  tableName: 'teams',
  timestamps: true,
  paranoid: false,
})
export class Team extends Model<Team> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Column(DataType.UUID)
  organizationId!: string;

  @AllowNull(false)
  @ForeignKey(() => Game)
  @Column(DataType.UUID)
  gameId!: string;

  @AllowNull(false)
  @Validate({
    len: [1, 100]
  })
  @Column(DataType.STRING(100))
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Validate({
    len: [0, 100]
  })
  @Column(DataType.STRING(100))
  captain?: string;

  @Column(DataType.INTEGER)
  tableNumber?: number;

  @Column(DataType.STRING(500))
  logoUrl?: string;

  @Default([])
  @Column(DataType.JSONB)
  members?: TeamMember[];

  @Default({})
  @Column(DataType.JSONB)
  contactInfo?: ContactInfo;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  totalScore!: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  currentRound!: number;

  @Column(DataType.INTEGER)
  position?: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  bonusPoints!: number;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  penaltyPoints!: number;

  @Default({
    roundsPlayed: 0,
    totalScore: 0,
    averageScore: 0,
    bestRound: 0,
    worstRound: 0
  })
  @Column(DataType.JSONB)
  statistics?: TeamStatistics;

  @Column(DataType.DATE)
  joinedAt?: Date;

  @Column(DataType.DATE)
  lastActivity?: Date;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isReady!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  // Ассоциации
  @BelongsTo(() => Organization)
  organization!: Organization;

  @BelongsToMany(() => Game, () => GameTeam)
  games!: Game[];

  // Связь с Answer удалена

  @HasMany(() => Score)
  scores!: Score[];

  // Методы модели
  getFinalScore(): number {
    return this.totalScore + this.bonusPoints - this.penaltyPoints;
  }

  getAverageScore(): number {
    if (!this.statistics || this.statistics.roundsPlayed === 0) return 0;
    return Math.round(this.statistics.totalScore / this.statistics.roundsPlayed);
  }

  getMemberCount(): number {
    return this.members ? this.members.length : 0;
  }

  addMember(member: TeamMember): void {
    if (!this.members) {
      this.members = [];
    }
    this.members.push({
      ...member,
      joinedAt: new Date()
    });
  }

  removeMember(memberName: string): boolean {
    if (!this.members) return false;

    const initialLength = this.members.length;
    this.members = this.members.filter(member => member.name !== memberName);

    return this.members.length < initialLength;
  }

  updateStatistics(roundScore: number): void {
    if (!this.statistics) {
      this.statistics = {
        roundsPlayed: 0,
        totalScore: 0,
        averageScore: 0,
        bestRound: 0,
        worstRound: 0
      };
    }

    this.statistics.roundsPlayed++;
    this.statistics.totalScore += roundScore;
    this.statistics.averageScore = Math.round(this.statistics.totalScore / this.statistics.roundsPlayed);

    if (roundScore > this.statistics.bestRound) {
      this.statistics.bestRound = roundScore;
    }

    if (this.statistics.worstRound === 0 || roundScore < this.statistics.worstRound) {
      this.statistics.worstRound = roundScore;
    }
  }

  isEligibleForPlay(): boolean {
    return this.isActive && this.isReady && this.getMemberCount() > 0;
  }
}
