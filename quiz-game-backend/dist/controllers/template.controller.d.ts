import { Request, Response } from 'express';
export declare class TemplateController {
    private templateService;
    constructor();
    getTemplates: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTemplateById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createTemplate: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateTemplate: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteTemplate: (req: Request, res: Response, next: import("express").NextFunction) => void;
    searchTemplates: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getTemplateStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=template.controller.d.ts.map