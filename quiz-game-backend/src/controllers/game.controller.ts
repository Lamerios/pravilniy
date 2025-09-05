import { Request, Response } from 'express';
import { GameService } from '../services/game.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { CreateGameDto, GameQueryDto, GameStateChangeDto, UpdateGameDto } from '../types/game.types';
import { asyncHandler } from '../utils/async-handler.util';

export class GameController {
  private gameService: GameService;

  constructor() {
    this.gameService = new GameService();
  }

  /**
   * Получить список игр с пагинацией и фильтрацией
   */
  getGames = asyncHandler(async (req: Request, res: Response) => {
    const query: GameQueryDto = {
      page: parseInt(req.query['page'] as string) || 1,
      limit: parseInt(req.query['limit'] as string) || 10,
      search: req.query['search'] as string,
      sortBy: req.query['sortBy'] as string || 'createdAt',
      sortOrder: req.query['sortOrder'] as 'ASC' | 'DESC' || 'DESC',
      status: req.query['status'] as any
    };

    // Добавляем опциональные поля только если они есть
    if (req.query['templateId']) {
      query.templateId = parseInt(req.query['templateId'] as string);
    }
    if (req.query['organizationId']) {
      query.organizationId = parseInt(req.query['organizationId'] as string);
    }

    const result = await this.gameService.getGames(query);

    res.json({
      success: true,
      message: 'Игры получены успешно',
      data: result.games,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        itemsPerPage: result.itemsPerPage
      }
    });
  });

  /**
   * Получить игру по ID
   */
  getGameById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры обязателен'
      });
      return;
    }

    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры должен быть числом'
      });
      return;
    }

    const game = await this.gameService.getGameById(gameId);

    if (!game) {
      res.status(404).json({
        success: false,
        error: 'GameNotFoundError',
        message: 'Игра не найдена'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Игра получена успешно',
      data: game
    });
  });

  /**
   * Создать новую игру
   */
  createGame = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const createData: CreateGameDto = req.body;
    const userId = req.user?.userId;
    const organizationId = req.user?.organizationId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Пользователь не аутентифицирован'
      });
      return;
    }

    if (!organizationId) {
      res.status(400).json({
        success: false,
        error: 'BadRequestError',
        message: 'ID организации не указан'
      });
      return;
    }

    const game = await this.gameService.createGame(createData, userId.toString(), organizationId);

    res.status(201).json({
      success: true,
      message: 'Игра создана успешно',
      data: game
    });
  });

  /**
   * Обновить игру
   */
  updateGame = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const updateData: UpdateGameDto = req.body;
    const userId = req.user?.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры обязателен'
      });
      return;
    }

    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры должен быть числом'
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Пользователь не аутентифицирован'
      });
      return;
    }

    const game = await this.gameService.updateGame(gameId, updateData, userId.toString());

    if (!game) {
      res.status(404).json({
        success: false,
        error: 'GameNotFoundError',
        message: 'Игра не найдена'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Игра обновлена успешно',
      data: game
    });
  });

  /**
   * Удалить игру
   */
  deleteGame = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры обязателен'
      });
      return;
    }

    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры должен быть числом'
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Пользователь не аутентифицирован'
      });
      return;
    }

    const deleted = await this.gameService.deleteGame(gameId, userId.toString());

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'GameNotFoundError',
        message: 'Игра не найдена'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Игра удалена успешно'
    });
  });

  /**
   * Поиск игр
   */
  searchGames = asyncHandler(async (req: Request, res: Response) => {
    const query: GameQueryDto = {
      page: parseInt(req.query['page'] as string) || 1,
      limit: parseInt(req.query['limit'] as string) || 10,
      search: req.query['q'] as string,
      sortBy: req.query['sortBy'] as string || 'createdAt',
      sortOrder: req.query['sortOrder'] as 'ASC' | 'DESC' || 'DESC'
    };

    if (!query.search) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Параметр поиска обязателен'
      });
      return;
    }

    const result = await this.gameService.searchGames(query);

    res.json({
      success: true,
      message: 'Поиск выполнен успешно',
      data: result.games,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        itemsPerPage: result.itemsPerPage
      }
    });
  });

  /**
   * Получить статистику игр
   */
  getGameStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.gameService.getGameStats();

    res.json({
      success: true,
      message: 'Статистика получена успешно',
      data: stats
    });
  });

  /**
   * Запустить игру
   */
  startGame = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры обязателен'
      });
      return;
    }

    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры должен быть числом'
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Пользователь не аутентифицирован'
      });
      return;
    }

    const stateChange: GameStateChangeDto = {
      action: 'start',
      reason: req.body.reason
    };

    const game = await this.gameService.changeGameState(gameId, stateChange, userId.toString());

    if (!game) {
      res.status(404).json({
        success: false,
        error: 'GameNotFoundError',
        message: 'Игра не найдена'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Игра запущена успешно',
      data: game
    });
  });

  /**
   * Остановить игру
   */
  stopGame = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры обязателен'
      });
      return;
    }

    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры должен быть числом'
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Пользователь не аутентифицирован'
      });
      return;
    }

    const stateChange: GameStateChangeDto = {
      action: 'finish',
      reason: req.body.reason
    };

    const game = await this.gameService.changeGameState(gameId, stateChange, userId.toString());

    if (!game) {
      res.status(404).json({
        success: false,
        error: 'GameNotFoundError',
        message: 'Игра не найдена'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Игра остановлена успешно',
      data: game
    });
  });

  /**
   * Приостановить игру
   */
  pauseGame = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры обязателен'
      });
      return;
    }

    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры должен быть числом'
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Пользователь не аутентифицирован'
      });
      return;
    }

    const stateChange: GameStateChangeDto = {
      action: 'pause',
      reason: req.body.reason
    };

    const game = await this.gameService.changeGameState(gameId, stateChange, userId.toString());

    if (!game) {
      res.status(404).json({
        success: false,
        error: 'GameNotFoundError',
        message: 'Игра не найдена'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Игра приостановлена успешно',
      data: game
    });
  });

  /**
   * Возобновить игру
   */
  resumeGame = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры обязателен'
      });
      return;
    }

    const gameId = parseInt(id);
    if (isNaN(gameId)) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID игры должен быть числом'
      });
      return;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Пользователь не аутентифицирован'
      });
      return;
    }

    const stateChange: GameStateChangeDto = {
      action: 'resume',
      reason: req.body.reason
    };

    const game = await this.gameService.changeGameState(gameId, stateChange, userId.toString());

    if (!game) {
      res.status(404).json({
        success: false,
        error: 'GameNotFoundError',
        message: 'Игра не найдена'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Игра возобновлена успешно',
      data: game
    });
  });

  /**
   * Добавить команды в игру
   */
  addTeamsToGame = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { teamIds } = req.body;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      res.status(400).json({
        success: false,
        error: 'BadRequestError',
        message: 'ID организации не указан'
      });
      return;
    }

    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'BadRequestError',
        message: 'Список ID команд обязателен'
      });
      return;
    }

    await this.gameService.addTeamsToGame(id!, teamIds, organizationId);

    res.json({
      success: true,
      message: 'Команды добавлены в игру успешно'
    });
  });

  /**
   * Удалить команды из игры
   */
  removeTeamsFromGame = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { teamIds } = req.body;

    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'BadRequestError',
        message: 'Список ID команд обязателен'
      });
      return;
    }

    await this.gameService.removeTeamsFromGame(id!, teamIds);

    res.json({
      success: true,
      message: 'Команды удалены из игры успешно'
    });
  });

  /**
   * Получить команды игры
   */
  getGameTeams = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const teams = await this.gameService.getGameTeams(id!);

    res.json({
      success: true,
      message: 'Команды игры получены успешно',
      data: teams
    });
  });
}
