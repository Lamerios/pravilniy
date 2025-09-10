import { Op } from 'sequelize';
import { GameTemplate } from '../models/game-template.model';
import { User } from '../models/user.model';
import {
  CreateTemplateDto,
  TemplateListResult,
  TemplateQueryDto,
  TemplateStats,
  TemplateValidationResult,
  UpdateTemplateDto,
} from '../types/template.types';
import { logger } from '../utils/logger.util';

export class TemplateService {
  /**
   * Получить список шаблонов с пагинацией и фильтрацией
   */
  async getTemplates(query: TemplateQueryDto): Promise<TemplateListResult> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        isPublic,
        tags,
        difficulty,
      } = query;

      const offset = (page - 1) * limit;
      const where: any = {};

      // Поиск по названию и описанию
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Фильтр по публичности (пока заглушка, поле будет добавлено в миграции)
      // if (isPublic !== undefined) {
      //   where.isPublic = isPublic;
      // }

      // Фильтр по тегам (пока отключен, так как поле tags не существует в БД)
      // if (tags && tags.length > 0) {
      //   where.tags = { [Op.contains]: tags };
      // }

      // Фильтр по сложности (пока отключен, так как поле settings не существует в БД)
      // if (difficulty) {
      //   where['settings.difficulty'] = difficulty;
      // }

      const { count, rows } = await GameTemplate.findAndCountAll({
        where,
        // include: [
        //   {
        //     model: User,
        //     as: 'creator',
        //     attributes: ['id', 'username', 'email'],
        //   },
        // ],
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      return {
        templates: rows,
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
      };
    } catch (error) {
      logger.error('Error getting templates:', error);
      throw new Error('Ошибка получения шаблонов');
    }
  }

  /**
   * Получить шаблон по ID
   */
  async getTemplateById(id: string): Promise<GameTemplate | null> {
    try {
      const template = await GameTemplate.findByPk(id, {
        // include: [
        //   {
        //     model: User,
        //     as: 'creator',
        //     attributes: ['id', 'username', 'email'],
        //   },
        // ],
      });

      return template;
    } catch (error) {
      logger.error('Error getting template by ID:', error);
      throw new Error('Ошибка получения шаблона');
    }
  }

  /**
   * Создать новый шаблон
   */
  async createTemplate(createData: CreateTemplateDto, userId: string): Promise<GameTemplate> {
    try {
      // Валидация данных
      const validation = this.validateTemplateData(createData);
      if (!validation.isValid) {
        throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
      }

      const template = await GameTemplate.create({
        name: createData.name,
        description: createData.description,
        roundsCount: createData.settings.rounds,
        questionsPerRound: createData.settings.questionsPerRound,
        timePerQuestion: createData.settings.timePerQuestion,
        settings: createData.settings,
        organizationId: 1, // TODO: Получать из контекста пользователя
      });

      logger.info(`Template created: ${template.id} by user: ${userId}`);

      return template;
    } catch (error) {
      logger.error('Error creating template:', error);
      throw new Error('Ошибка создания шаблона');
    }
  }

  /**
   * Обновить шаблон
   */
  async updateTemplate(
    id: string,
    updateData: UpdateTemplateDto,
    userId: string,
  ): Promise<GameTemplate | null> {
    try {
      const template = await GameTemplate.findByPk(id);

      if (!template) {
        return null;
      }

      // Проверка прав доступа (пока заглушка, будет реализовано в Sprint 4)
      // if (template.organizationId !== userOrganizationId) {
      //   throw new Error('Недостаточно прав для редактирования шаблона');
      // }

      // Валидация данных
      if (updateData.settings) {
        const validation = this.validateTemplateSettings(updateData.settings);
        if (!validation.isValid) {
          throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
        }
      }

      await template.update(updateData);

      logger.info(`Template updated: ${id} by user: ${userId}`);

      return template;
    } catch (error) {
      logger.error('Error updating template:', error);
      throw new Error('Ошибка обновления шаблона');
    }
  }

  /**
   * Удалить шаблон
   */
  async deleteTemplate(id: string, userId: string): Promise<boolean> {
    try {
      const template = await GameTemplate.findByPk(id);

      if (!template) {
        return false;
      }

      // Проверка прав доступа (пока заглушка, будет реализовано в Sprint 4)
      // if (template.organizationId !== userOrganizationId) {
      //   throw new Error('Недостаточно прав для удаления шаблона');
      // }

      await template.destroy();

      logger.info(`Template deleted: ${id} by user: ${userId}`);

      return true;
    } catch (error) {
      logger.error('Error deleting template:', error);
      throw new Error('Ошибка удаления шаблона');
    }
  }

  /**
   * Поиск шаблонов
   */
  async searchTemplates(query: TemplateQueryDto): Promise<TemplateListResult> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

      const offset = (page - 1) * limit;
      const where: any = {};

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { tags: { [Op.contains]: [search] } },
        ];
      }

      const { count, rows } = await GameTemplate.findAndCountAll({
        where,
        // include: [
        //   {
        //     model: User,
        //     as: 'creator',
        //     attributes: ['id', 'username', 'email'],
        //   },
        // ],
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      return {
        templates: rows,
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
      };
    } catch (error) {
      logger.error('Error searching templates:', error);
      throw new Error('Ошибка поиска шаблонов');
    }
  }

  /**
   * Получить статистику шаблонов
   */
  async getTemplateStats(): Promise<TemplateStats> {
    try {
      const totalTemplates = await GameTemplate.count();
      // const publicTemplates = await GameTemplate.count({ where: { isPublic: true } });
      const publicTemplates = 0; // Пока заглушка
      const privateTemplates = totalTemplates - publicTemplates;

      // Самые используемые шаблоны (пока заглушка, будет реализовано в Sprint 5)
      const mostUsedTemplates: Array<{
        id: string;
        name: string;
        usageCount: number;
      }> = [];

      // Последние созданные шаблоны
      const recentTemplates = await GameTemplate.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'createdAt'],
      });

      return {
        totalTemplates,
        publicTemplates,
        privateTemplates,
        mostUsedTemplates,
        recentTemplates: recentTemplates.map(t => ({
          id: t.id.toString(),
          name: t.name,
          createdAt: t.createdAt,
        })),
      };
    } catch (error) {
      logger.error('Error getting template stats:', error);
      throw new Error('Ошибка получения статистики');
    }
  }

  /**
   * Валидация данных шаблона
   */
  private validateTemplateData(data: CreateTemplateDto): TemplateValidationResult {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Название шаблона обязательно');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Название шаблона не должно превышать 100 символов');
    }

    if (data.description && data.description.length > 500) {
      errors.push('Описание не должно превышать 500 символов');
    }

    if (!data.settings) {
      errors.push('Настройки шаблона обязательны');
    } else {
      const settingsValidation = this.validateTemplateSettings(data.settings);
      if (!settingsValidation.isValid) {
        errors.push(...settingsValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Валидация настроек шаблона
   */
  private validateTemplateSettings(settings: any): TemplateValidationResult {
    const errors: string[] = [];

    if (settings.rounds && (settings.rounds < 1 || settings.rounds > 20)) {
      errors.push('Количество раундов должно быть от 1 до 20');
    }

    if (
      settings.questionsPerRound &&
      (settings.questionsPerRound < 1 || settings.questionsPerRound > 50)
    ) {
      errors.push('Количество вопросов в раунде должно быть от 1 до 50');
    }

    if (
      settings.timePerQuestion &&
      (settings.timePerQuestion < 10 || settings.timePerQuestion > 300)
    ) {
      errors.push('Время на вопрос должно быть от 10 до 300 секунд');
    }

    if (
      settings.scoringSystem &&
      !['standard', 'bonus', 'penalty'].includes(settings.scoringSystem)
    ) {
      errors.push('Неверная система подсчета очков');
    }

    if (settings.bonusPoints && (settings.bonusPoints < 0 || settings.bonusPoints > 100)) {
      errors.push('Бонусные очки должны быть от 0 до 100');
    }

    if (settings.penaltyPoints && (settings.penaltyPoints < 0 || settings.penaltyPoints > 100)) {
      errors.push('Штрафные очки должны быть от 0 до 100');
    }

    if (settings.difficulty && !['easy', 'medium', 'hard'].includes(settings.difficulty)) {
      errors.push('Неверный уровень сложности');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
