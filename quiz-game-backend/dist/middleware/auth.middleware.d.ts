import { NextFunction, Response } from 'express';
import { UserRole } from '../models/user.model';
import { AuthenticatedRequest } from '../types/auth.types';
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (requiredRole: UserRole) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAnyRole: (requiredRoles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdminOrModerator: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireOrganizationAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireResourceAccess: (resourceUserIdField?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireActiveUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireOwner: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireModeratorOrAbove: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireOwnerOrAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const authLogger: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map