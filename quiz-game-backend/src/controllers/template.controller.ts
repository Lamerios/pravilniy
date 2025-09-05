import { Request, Response } from 'express';
import { TemplateService } from '../services/template.service';
import { AuthenticatedRequest } from '../types/auth.types';
import { CreateTemplateDto, TemplateQueryDto, UpdateTemplateDto } from '../types/template.types';
import { asyncHandler } from '../utils/async-handler.util';

export class TemplateController {
  private templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
  }

  /**
   * Получить список шаблонов с пагинацией и фильтрацией
   */
  getTemplates = asyncHandler(async (req: Request, res: Response) => {
    const query: TemplateQueryDto = {
      page: parseInt(req.query['page'] as string) || 1,
      limit: parseInt(req.query['limit'] as string) || 10,
      search: req.query['search'] as string,
      sortBy: req.query['sortBy'] as string || 'createdAt',
      sortOrder: req.query['sortOrder'] as 'ASC' | 'DESC' || 'DESC'
    };

    const result = await this.templateService.getTemplates(query);

    res.json({
      success: true,
      message: 'Шаблоны получены успешно',
      data: result.templates,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        itemsPerPage: result.itemsPerPage
      }
    });
  });

  /**
   * Получить шаблон по ID
   */
  getTemplateById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID шаблона обязателен'
      });
      return;
    }

    const template = await this.templateService.getTemplateById(id);

    if (!template) {
      res.status(404).json({
        success: false,
        error: 'TemplateNotFoundError',
        message: 'Шаблон не найден'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Шаблон получен успешно',
      data: template
    });
  });

  /**
   * Создать новый шаблон
   */
  createTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const createData: CreateTemplateDto = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'UnauthorizedError',
        message: 'Пользователь не аутентифицирован'
      });
      return;
    }

    const template = await this.templateService.createTemplate(createData, userId.toString());

    res.status(201).json({
      success: true,
      message: 'Шаблон создан успешно',
      data: template
    });
  });

  /**
   * Обновить шаблон
   */
  updateTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const updateData: UpdateTemplateDto = req.body;
    const userId = req.user?.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID шаблона обязателен'
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

    const template = await this.templateService.updateTemplate(id, updateData, userId.toString());

    if (!template) {
      res.status(404).json({
        success: false,
        error: 'TemplateNotFoundError',
        message: 'Шаблон не найден'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Шаблон обновлен успешно',
      data: template
    });
  });

  /**
   * Удалить шаблон
   */
  deleteTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'ID шаблона обязателен'
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

    const deleted = await this.templateService.deleteTemplate(id, userId.toString());

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'TemplateNotFoundError',
        message: 'Шаблон не найден'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Шаблон удален успешно'
    });
  });

  /**
   * Поиск шаблонов
   */
  searchTemplates = asyncHandler(async (req: Request, res: Response) => {
    const query: TemplateQueryDto = {
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

    const result = await this.templateService.searchTemplates(query);

    res.json({
      success: true,
      message: 'Поиск выполнен успешно',
      data: result.templates,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems,
        itemsPerPage: result.itemsPerPage
      }
    });
  });

  /**
   * Получить статистику шаблонов
   */
  getTemplateStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.templateService.getTemplateStats();

    res.json({
      success: true,
      message: 'Статистика получена успешно',
      data: stats
    });
  });
}
