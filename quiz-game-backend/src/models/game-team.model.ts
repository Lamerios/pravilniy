import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Game } from './game.model';
import { Team } from './team.model';

/**
 * Промежуточная модель для связи многие-ко-многим между играми и командами
 */
@Table({
  tableName: 'game_teams',
  timestamps: true,
  paranoid: false,
})
export class GameTeam extends Model<GameTeam> {
  @PrimaryKey
  @ForeignKey(() => Game)
  @Column(DataType.UUID)
  gameId!: string;

  @PrimaryKey
  @ForeignKey(() => Team)
  @Column(DataType.UUID)
  teamId!: string;

  @Column(DataType.INTEGER)
  joinedAt?: number; // Порядок присоединения команды к игре

  @Column(DataType.BOOLEAN)
  isActive: boolean = true; // Активна ли команда в игре

  @Column(DataType.DATE)
  joinedAtDate?: Date; // Дата присоединения

  @Column(DataType.DATE)
  leftAtDate?: Date; // Дата выхода из игры

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
}
