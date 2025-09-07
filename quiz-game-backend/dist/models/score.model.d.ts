import { Model } from 'sequelize-typescript';
import { Game } from './game.model';
import { Round } from './round.model';
import { Team } from './team.model';
import { User } from './user.model';
export declare class Score extends Model {
    id: number;
    gameId: number;
    teamId: number;
    roundId: number;
    points: number;
    bet?: number;
    totalPoints: number;
    notes?: string;
    enteredBy?: number;
    createdAt: Date;
    updatedAt: Date;
    game?: Game;
    team?: Team;
    round?: Round;
    enteredByUser?: User;
    calculateTotalPoints(): number;
    updateTotalPoints(): void;
}
//# sourceMappingURL=score.model.d.ts.map