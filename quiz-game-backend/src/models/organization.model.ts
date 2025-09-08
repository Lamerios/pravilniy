import {
  AllowNull,
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { GameTemplate } from './game-template.model';
import { User } from './user.model';

@Table({
  tableName: 'organizations',
  timestamps: true,
  underscored: true,
})
export class Organization extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(100))
  name!: string;

  @Column(DataType.STRING(200))
  description?: string;

  @Column(DataType.STRING(100))
  address?: string;

  @Column(DataType.STRING(50))
  phone?: string;

  @Column(DataType.STRING(100))
  email?: string;

  @Column(DataType.STRING(200))
  website?: string;

  @Column(DataType.STRING(100))
  logo?: string;

  @Column(DataType.BOOLEAN)
  isActive: boolean = true;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  // Ассоциации
  @HasMany(() => User)
  users!: User[];

  @HasMany(() => GameTemplate)
  gameTemplates!: GameTemplate[];
}
