import { Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
export declare class TeamController {
    getTeams(req: AuthenticatedRequest, res: Response): Promise<void>;
    getTeamById(req: AuthenticatedRequest, res: Response): Promise<void>;
    createTeam(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateTeam(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteTeam(req: AuthenticatedRequest, res: Response): Promise<void>;
    getNextTableNumber(req: AuthenticatedRequest, res: Response): Promise<void>;
    validateTableNumbers(req: AuthenticatedRequest, res: Response): Promise<void>;
    searchTeams(req: AuthenticatedRequest, res: Response): Promise<void>;
    getTeamStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    getTeamsByOrganization(req: AuthenticatedRequest, res: Response): Promise<void>;
    checkTableNumber(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const teamController: TeamController;
//# sourceMappingURL=team.controller.d.ts.map