import { Model } from 'sequelize-typescript';
import { Score } from './score.model';
import { User } from './user.model';
export declare class ScoreCorrection extends Model {
    id: number;
    scoreId: number;
    oldPoints: number;
    newPoints: number;
    reason: string;
    correctedBy: number;
    correctedAt: Date;
    score?: Score;
    correctedByUser?: User;
}
//# sourceMappingURL=score-correction.model.d.ts.map