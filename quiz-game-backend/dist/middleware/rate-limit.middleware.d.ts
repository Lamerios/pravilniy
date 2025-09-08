import { NextFunction, Request, Response } from 'express';
export declare const rateLimitMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const authRateLimit: (req: Request, res: Response, next: NextFunction) => void;
export declare const apiRateLimit: (req: Request, res: Response, next: NextFunction) => void;
export declare const rateLimitLogger: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rate-limit.middleware.d.ts.map