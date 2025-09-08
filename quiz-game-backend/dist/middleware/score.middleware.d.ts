import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
export declare const validateCreateScore: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateUpdateScore: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateBulkScore: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateCorrectScore: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateScoreQuery: (req: Request, res: Response, next: NextFunction) => void;
export declare const checkScoreAccess: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const validateGameScoresQuery: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateRoundScoresParams: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=score.middleware.d.ts.map