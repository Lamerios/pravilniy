import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
export declare const roleMiddleware: (allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const adminMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const managerMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const userMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=role.middleware.d.ts.map