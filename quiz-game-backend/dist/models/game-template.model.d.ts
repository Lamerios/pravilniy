import { Model } from 'sequelize-typescript';
import { Game } from './game.model';
import { Organization } from './organization.model';
import { Round } from './round.model';
export declare class GameTemplate extends Model {
    id: number;
    name: string;
    description?: string;
    roundsCount: number;
    questionsPerRound: number;
    timePerQuestion?: number;
    maxTeams?: number;
    isActive: boolean;
    settings?: Record<string, any>;
    organizationId: number;
    createdAt: Date;
    updatedAt: Date;
    organization: Organization;
    games: Game[];
    rounds: Round[];
}
//# sourceMappingURL=game-template.model.d.ts.map