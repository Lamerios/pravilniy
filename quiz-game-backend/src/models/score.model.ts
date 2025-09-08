import {
  AutoIncrement,
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
import { Round } from './round.model';
import { Team } from './team.model';
import { User } from './user.model';

@Table({
  tableName: 'scores',
  timestamps: true,
  indexes: [
    {
      fields: ['gameId', 'teamId', 'roundId'],
      unique: true,
      name: 'unique_game_team_round',
    },
    {
      fields: ['gameId'],
    },
    {
      fields: ['teamId'],
    },
    {
      fields: ['roundId'],
    },
    {
      fields: ['createdAt'],
    },
  ],
})
export class Score extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Game)
  @Column(DataType.INTEGER)
  gameId!: number;

  @ForeignKey(() => Team)
  @Column(DataType.INTEGER)
  teamId!: number;

  @ForeignKey(() => Round)
  @Column(DataType.INTEGER)
  roundId!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Количество баллов за раунд',
  })
  points!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Ставка команды (множитель или бонус)',
  })
  bet?: number;

  @Column({
    type: DataType.ENUM('MULTIPLIER', 'BONUS', 'FIXED'),
    allowNull: true,
    defaultValue: 'MULTIPLIER',
    comment: 'Тип ставки: MULTIPLIER (умножение), BONUS (добавление), FIXED (фиксированные баллы)',
  })
  betType?: 'MULTIPLIER' | 'BONUS' | 'FIXED';

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Минимальная ставка для данного раунда',
  })
  minBet?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Максимальная ставка для данного раунда',
  })
  maxBet?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Общее количество баллов с учетом ставки',
  })
  totalPoints!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Позиция команды в рейтинге на момент записи баллов',
  })
  position?: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Дополнительные заметки',
  })
  notes?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Пользователь, который ввел баллы',
  })
  enteredBy?: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  // Ассоциации
  @BelongsTo(() => Game)
  game?: Game;

  @BelongsTo(() => Team)
  team?: Team;

  @BelongsTo(() => Round)
  round?: Round;

  @BelongsTo(() => User, 'enteredBy')
  enteredByUser?: User;

  /**
   * Вычисляет общие баллы с учетом ставки
   */
  calculateTotalPoints(): number {
    if (this.bet && this.bet > 0) {
      // Если ставка есть и команда ответила правильно, добавляем ставку к баллам
      return this.points > 0 ? this.points + this.bet : 0;
    }
    return this.points;
  }

  /**
   * Обновляет общие баллы
   */
  updateTotalPoints(): void {
    this.totalPoints = this.calculateTotalPoints();
  }
}
