import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
export declare class AuthController {
    private authService;
    constructor();
    login: (req: Request, res: Response) => Promise<void>;
    register: (req: Request, res: Response) => Promise<void>;
    refreshToken: (req: Request, res: Response) => Promise<void>;
    changePassword: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    forgotPassword: (req: Request, res: Response) => Promise<void>;
    resetPassword: (req: Request, res: Response) => Promise<void>;
    getCurrentUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    logout: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    validateToken: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    private handleError;
}
//# sourceMappingURL=auth.controller.d.ts.map