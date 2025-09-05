import { Request, Response } from 'express';
export declare class GameController {
    private gameService;
    constructor();
    getGames: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getGameById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    createGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
    deleteGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
    searchGames: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getGameStats: (req: Request, res: Response, next: import("express").NextFunction) => void;
    startGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
    stopGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
    pauseGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
    resumeGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
    addTeamsToGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
    removeTeamsFromGame: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getGameTeams: (req: Request, res: Response, next: import("express").NextFunction) => void;
}
//# sourceMappingURL=game.controller.d.ts.map