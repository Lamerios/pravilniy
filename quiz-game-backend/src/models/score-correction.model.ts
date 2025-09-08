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
} from 'sequelize-typescript';
import { Score } from './score.model';
import { User } from './user.model';

@Table({
  tableName: 'score_corrections',
  timestamps: true,
  createdAt: true,
  updatedAt: false,
})
export class ScoreCorrection extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Score)
  @Column(DataType.INTEGER)
  scoreId!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Старые баллы',
  })
  oldPoints!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Новые баллы',
  })
  newPoints!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Причина исправления',
  })
  reason!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Пользователь, который исправил баллы',
  })
  correctedBy!: number;

  @CreatedAt
  @Column(DataType.DATE)
  correctedAt!: Date;

  // Ассоциации
  @BelongsTo(() => Score)
  score?: Score;

  @BelongsTo(() => User)
  correctedByUser?: User;
}
