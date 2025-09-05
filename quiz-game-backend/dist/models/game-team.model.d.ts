import { Model } from 'sequelize-typescript';
import { Game } from './game.model';
import { Team } from './team.model';
export declare class GameTeam extends Model<GameTeam> {
    gameId: string;
    teamId: string;
    joinedAt?: number;
    isActive: boolean;
    joinedAtDate?: Date;
    leftAtDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    game: Game;
    team: Team;
}
//# sourceMappingURL=game-team.model.d.ts.map