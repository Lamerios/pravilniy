import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from 'sequelize-typescript';
import { Game } from './game.model';
import { Organization } from './organization.model';
import { Round } from './round.model';

@Table({
  tableName: 'game_templates',
  timestamps: true,
  underscored: true
})
export class GameTemplate extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  roundsCount!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  questionsPerRound!: number;

  @Column(DataType.INTEGER)
  timePerQuestion?: number; // в секундах

  @Column(DataType.INTEGER)
  maxTeams?: number;

  @Column(DataType.BOOLEAN)
  isActive: boolean = true;

  @Column(DataType.JSONB)
  settings?: Record<string, any>; // дополнительные настройки

  @ForeignKey(() => Organization)
  @Column(DataType.INTEGER)
  organizationId!: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  // Ассоциации
  @BelongsTo(() => Organization)
  organization!: Organization;

  @HasMany(() => Game)
  games!: Game[];

  @HasMany(() => Round)
  rounds!: Round[];
}
