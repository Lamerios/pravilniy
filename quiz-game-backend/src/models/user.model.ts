/* eslint-disable no-unused-vars */
import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { Organization } from './organization.model';

export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  MODERATOR = 'moderator',
}

// Используем все значения в коде
export const USER_ROLES = Object.values(UserRole);

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model {
  static readonly ROLES = USER_ROLES;
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(100))
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  password!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  firstName!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  lastName!: string;

  @Column(DataType.STRING(50))
  phone?: string;

  @Column(DataType.ENUM(...USER_ROLES))
  role: UserRole = UserRole.ADMIN;

  @Column(DataType.BOOLEAN)
  isActive: boolean = true;

  @Column(DataType.DATE)
  lastLoginAt?: Date;

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
}
