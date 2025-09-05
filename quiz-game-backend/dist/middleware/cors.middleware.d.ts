import { NextFunction, Request, Response } from 'express';
export declare const corsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityHeaders: (req: Request, res: Response, next: NextFunction) => void;
export declare const contentTypeValidator: (req: Request, res: Response, next: NextFunction) => void;
export declare const bodySizeLimit: (req: Request, res: Response, next: NextFunction) => void;
export declare const corsLogger: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=cors.middleware.d.ts.map