import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
export declare class ScoreController {
    createScore(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateScore(req: AuthenticatedRequest, res: Response): Promise<void>;
    getScoreById(req: AuthenticatedRequest, res: Response): Promise<void>;
    getScores(req: AuthenticatedRequest, res: Response): Promise<void>;
    getTeamScores(req: AuthenticatedRequest, res: Response): Promise<void>;
    getTeamScoreStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    getGameScoreStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    bulkCreateScores(req: AuthenticatedRequest, res: Response): Promise<void>;
    correctScore(req: AuthenticatedRequest, res: Response): Promise<void>;
    getScoreCorrectionHistory(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteScore(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const scoreController: ScoreController;
//# sourceMappingURL=score.controller.d.ts.map