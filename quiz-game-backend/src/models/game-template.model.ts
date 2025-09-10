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
  UpdatedAt,
} from 'sequelize-typescript';
import { Game } from './game.model';
import { Organization } from './organization.model';
import { Round } from './round.model';
import { User } from './user.model';

@Table({
  tableName: 'game_templates',
  timestamps: true,
  underscored: true,
})
export class GameTemplate extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255), field: 'title' })
  name!: string;

  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'rounds_count' })
  roundsCount!: number;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER, field: 'questions_per_round' })
  questionsPerRound!: number;

  @Column({ type: DataType.INTEGER, field: 'time_per_question' })
  timePerQuestion?: number; // в секундах

  @Column({ type: DataType.INTEGER, field: 'max_teams' })
  maxTeams?: number;

  @Column({ type: DataType.BOOLEAN, field: 'is_active' })
  isActive: boolean = true;

  // @Column(DataType.JSONB)
  // settings?: Record<string, any>; // дополнительные настройки (пока отключено, так как поля нет в БД)

  @ForeignKey(() => Organization)
  @Column({ type: DataType.INTEGER, field: 'organization_id' })
  organizationId!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, field: 'created_by' })
  createdBy!: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  // Ассоциации
  @BelongsTo(() => Organization)
  organization!: Organization;

  @BelongsTo(() => User)
  creator!: User;

  @HasMany(() => Game)
  games!: Game[];

  @HasMany(() => Round)
  rounds!: Round[];
}
