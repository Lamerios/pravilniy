import { Model } from 'sequelize-typescript';
import { Organization } from './organization.model';
export declare enum UserRole {
    ADMIN = "admin",
    OWNER = "owner",
    MODERATOR = "moderator"
}
export declare const USER_ROLES: UserRole[];
export declare class User extends Model {
    static readonly ROLES: UserRole[];
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
    organizationId: number;
    createdAt: Date;
    updatedAt: Date;
    organization: Organization;
}
//# sourceMappingURL=user.model.d.ts.map