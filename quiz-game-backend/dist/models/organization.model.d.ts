import { Model } from 'sequelize-typescript';
import { GameTemplate } from './game-template.model';
import { User } from './user.model';
export declare class Organization extends Model {
    id: number;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    users: User[];
    gameTemplates: GameTemplate[];
}
//# sourceMappingURL=organization.model.d.ts.map