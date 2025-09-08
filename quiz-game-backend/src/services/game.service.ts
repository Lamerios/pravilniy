import { Op } from 'sequelize';
import { GameTeam } from '../models/game-team.model';
import { GameTemplate } from '../models/game-template.model';
import { Game, GameStatus } from '../models/game.model';
import { Organization } from '../models/organization.model';
import { Team } from '../models/team.model';
import { User } from '../models/user.model';
import {
  CreateGameDto,
  GameListResult,
  GameQueryDto,
  GameStateChangeDto,
  GameStats,
  GameValidationResult,
  UpdateGameDto,
} from '../types/game.types';
import { logger } from '../utils/logger.util';

export class GameService {
  /**
   * Получить список игр с пагинацией и фильтрацией
   */
  async getGames(query: GameQueryDto): Promise<GameListResult> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        status,
        templateId,
        organizationId,
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

      // Фильтр по статусу
      if (status) {
        where.status = status;
      }

      // Фильтр по шаблону
      if (templateId) {
        where.templateId = templateId;
      }

      // Фильтр по организации
      if (organizationId) {
        where.organizationId = organizationId;
      }

      const { count, rows } = await Game.findAndCountAll({
        where,
        include: [
          {
            model: GameTemplate,
            as: 'template',
            attributes: ['id', 'name', 'description'],
          },
          {
            model: User,
            as: 'createdBy',
            attributes: ['id', 'username', 'email'],
          },
          {
            model: Organization,
            as: 'organization',
            attributes: ['id', 'name'],
          },
        ],
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      return {
        games: rows,
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
      };
    } catch (error) {
      logger.error('Error getting games:', error);
      throw new Error('Ошибка получения игр');
    }
  }

  /**
   * Получить игру по ID
   */
  async getGameById(id: number): Promise<Game | null> {
    try {
      const game = await Game.findByPk(id, {
        include: [
          {
            model: GameTemplate,
            as: 'template',
            attributes: ['id', 'name', 'description', 'settings'],
          },
          {
            model: User,
            as: 'createdBy',
            attributes: ['id', 'username', 'email'],
          },
          {
            model: Organization,
            as: 'organization',
            attributes: ['id', 'name'],
          },
        ],
      });

      return game;
    } catch (error) {
      logger.error('Error getting game by ID:', error);
      throw new Error('Ошибка получения игры');
    }
  }

  /**
   * Создать новую игру
   */
  async createGame(
    createData: CreateGameDto,
    userId: string,
    organizationId: number,
  ): Promise<Game> {
    try {
      // Валидация данных
      const validation = this.validateGameData(createData);
      if (!validation.isValid) {
        throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
      }

      // Проверяем существование шаблона
      const template = await GameTemplate.findByPk(createData.templateId);
      if (!template) {
        throw new Error('Шаблон не найден');
      }

      const gameData: any = {
        name: createData.name,
        templateId: createData.templateId.toString(),
        status: GameStatus.DRAFT,
        settings: createData.settings || {},
        createdBy: userId,
        organizationId: organizationId.toString(),
      };

      if (createData.description) {
        gameData.description = createData.description;
      }

      if (createData.scheduledAt) {
        gameData.scheduledAt = createData.scheduledAt;
      }

      const game = await Game.create(gameData);

      // Добавляем команды в игру, если они указаны
      if (createData.teamIds && createData.teamIds.length > 0) {
        await this.addTeamsToGame(game.id, createData.teamIds, organizationId);
      }

      logger.info(`Game created: ${game.id} by user: ${userId}`);

      return game;
    } catch (error) {
      logger.error('Error creating game:', error);
      throw new Error('Ошибка создания игры');
    }
  }

  /**
   * Обновить игру
   */
  async updateGame(id: number, updateData: UpdateGameDto, userId: string): Promise<Game | null> {
    try {
      const game = await Game.findByPk(id);

      if (!game) {
        return null;
      }

      // Проверка прав доступа (пока заглушка, будет реализовано в Sprint 4)
      // if (game.organizationId !== userOrganizationId) {
      //   throw new Error('Недостаточно прав для редактирования игры');
      // }

      // Проверка статуса игры
      if (game.status === GameStatus.ACTIVE || game.status === GameStatus.FINISHED) {
        throw new Error('Нельзя редактировать активную или завершенную игру');
      }

      // Валидация данных
      if (updateData.settings) {
        const validation = this.validateGameSettings(updateData.settings);
        if (!validation.isValid) {
          throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
        }
      }

      await game.update(updateData);

      logger.info(`Game updated: ${id} by user: ${userId}`);

      return game;
    } catch (error) {
      logger.error('Error updating game:', error);
      throw new Error('Ошибка обновления игры');
    }
  }

  /**
   * Удалить игру
   */
  async deleteGame(id: number, userId: string): Promise<boolean> {
    try {
      const game = await Game.findByPk(id);

      if (!game) {
        return false;
      }

      // Проверка прав доступа (пока заглушка, будет реализовано в Sprint 4)
      // if (game.organizationId !== userOrganizationId) {
      //   throw new Error('Недостаточно прав для удаления игры');
      // }

      // Проверка статуса игры
      if (game.status === GameStatus.ACTIVE) {
        throw new Error('Нельзя удалить активную игру');
      }

      await game.destroy();

      logger.info(`Game deleted: ${id} by user: ${userId}`);

      return true;
    } catch (error) {
      logger.error('Error deleting game:', error);
      throw new Error('Ошибка удаления игры');
    }
  }

  /**
   * Поиск игр
   */
  async searchGames(query: GameQueryDto): Promise<GameListResult> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

      const offset = (page - 1) * limit;
      const where: any = {};

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Game.findAndCountAll({
        where,
        include: [
          {
            model: GameTemplate,
            as: 'template',
            attributes: ['id', 'name', 'description'],
          },
          {
            model: User,
            as: 'createdBy',
            attributes: ['id', 'username', 'email'],
          },
        ],
        order: [[sortBy, sortOrder]],
        limit,
        offset,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      return {
        games: rows,
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
      };
    } catch (error) {
      logger.error('Error searching games:', error);
      throw new Error('Ошибка поиска игр');
    }
  }

  /**
   * Получить статистику игр
   */
  async getGameStats(): Promise<GameStats> {
    try {
      const totalGames = await Game.count();
      const activeGames = await Game.count({ where: { status: GameStatus.ACTIVE } });
      const finishedGames = await Game.count({ where: { status: GameStatus.FINISHED } });
      const draftGames = await Game.count({ where: { status: GameStatus.DRAFT } });
      const scheduledGames = await Game.count({ where: { status: GameStatus.WAITING } });

      // Статистика по статусам
      const gamesByStatus = [
        { status: 'draft', count: draftGames },
        { status: 'scheduled', count: scheduledGames },
        { status: 'active', count: activeGames },
        { status: 'finished', count: finishedGames },
      ];

      // Последние созданные игры
      const recentGames = await Game.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'status', 'createdAt'],
      });

      // Популярные шаблоны (пока заглушка, будет реализовано в Sprint 5)
      const popularTemplates: Array<{
        templateId: number;
        templateName: string;
        usageCount: number;
      }> = [];

      return {
        totalGames,
        activeGames,
        finishedGames,
        draftGames,
        scheduledGames,
        gamesByStatus,
        recentGames: recentGames.map(g => ({
          id: g.id,
          name: g.name,
          status: g.status.toString(),
          createdAt: g.createdAt,
        })),
        popularTemplates,
      };
    } catch (error) {
      logger.error('Error getting game stats:', error);
      throw new Error('Ошибка получения статистики');
    }
  }

  /**
   * Изменить состояние игры
   */
  async changeGameState(
    id: number,
    stateChange: GameStateChangeDto,
    userId: string,
  ): Promise<Game | null> {
    try {
      const game = await Game.findByPk(id);

      if (!game) {
        return null;
      }

      // Проверка прав доступа (пока заглушка, будет реализовано в Sprint 4)
      // if (game.organizationId !== userOrganizationId) {
      //   throw new Error('Недостаточно прав для управления игрой');
      // }

      const { action, reason } = stateChange;
      let newStatus: GameStatus;

      // Валидация перехода состояний
      switch (action) {
        case 'start':
          if (game.status !== GameStatus.DRAFT && game.status !== GameStatus.WAITING) {
            throw new Error('Можно запустить только черновик или запланированную игру');
          }
          newStatus = GameStatus.ACTIVE;
          break;
        case 'pause':
          if (game.status !== GameStatus.ACTIVE) {
            throw new Error('Можно приостановить только активную игру');
          }
          newStatus = GameStatus.PAUSED;
          break;
        case 'resume':
          if (game.status !== GameStatus.PAUSED) {
            throw new Error('Можно возобновить только приостановленную игру');
          }
          newStatus = GameStatus.ACTIVE;
          break;
        case 'stop':
        case 'finish':
          if (game.status !== GameStatus.ACTIVE && game.status !== GameStatus.PAUSED) {
            throw new Error('Можно завершить только активную или приостановленную игру');
          }
          newStatus = GameStatus.FINISHED;
          break;
        default:
          throw new Error('Неверное действие');
      }

      const updateData: any = {
        status: newStatus,
      };

      if (newStatus === GameStatus.FINISHED) {
        updateData.finishedAt = new Date();
      }

      await game.update(updateData);

      logger.info(
        `Game state changed: ${id} to ${newStatus} by user: ${userId}, reason: ${reason || 'none'}`,
      );

      return game;
    } catch (error) {
      logger.error('Error changing game state:', error);
      throw new Error('Ошибка изменения состояния игры');
    }
  }

  /**
   * Валидация данных игры
   */
  private validateGameData(data: CreateGameDto): GameValidationResult {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Название игры обязательно');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Название игры не должно превышать 100 символов');
    }

    if (data.description && data.description.length > 500) {
      errors.push('Описание не должно превышать 500 символов');
    }

    if (!data.templateId) {
      errors.push('ID шаблона обязателен');
    }

    if (data.settings) {
      const settingsValidation = this.validateGameSettings(data.settings);
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
   * Валидация настроек игры
   */
  private validateGameSettings(settings: any): GameValidationResult {
    const errors: string[] = [];

    if (settings.maxTeams !== undefined) {
      if (
        typeof settings.maxTeams !== 'number' ||
        settings.maxTeams < 1 ||
        settings.maxTeams > 50
      ) {
        errors.push('Максимальное количество команд должно быть числом от 1 до 50');
      }
    }

    if (settings.timeLimit !== undefined) {
      if (
        typeof settings.timeLimit !== 'number' ||
        settings.timeLimit < 60 ||
        settings.timeLimit > 1440
      ) {
        errors.push('Временной лимит должен быть числом от 60 до 1440 минут');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Добавить команды в игру
   */
  async addTeamsToGame(gameId: string, teamIds: string[], organizationId: number): Promise<void> {
    try {
      // Проверяем существование команд и их принадлежность к организации
      const teams = await Team.findAll({
        where: {
          id: { [Op.in]: teamIds },
          organizationId,
        },
      });

      if (teams.length !== teamIds.length) {
        throw new Error('Некоторые команды не найдены или не принадлежат организации');
      }

      // Проверяем, что команды еще не добавлены в игру
      const existingGameTeams = await GameTeam.findAll({
        where: {
          gameId,
          teamId: { [Op.in]: teamIds },
        },
      });

      if (existingGameTeams.length > 0) {
        throw new Error('Некоторые команды уже добавлены в игру');
      }

      // Добавляем команды в игру
      const gameTeams = teamIds.map((teamId, index) => ({
        gameId,
        teamId,
        joinedAt: index + 1,
        isActive: true,
        joinedAtDate: new Date(),
      }));

      await GameTeam.bulkCreate(gameTeams as any);

      logger.info(`Added ${teamIds.length} teams to game: ${gameId}`);
    } catch (error) {
      logger.error('Error adding teams to game:', error);
      throw error;
    }
  }

  /**
   * Удалить команды из игры
   */
  async removeTeamsFromGame(gameId: string, teamIds: string[]): Promise<void> {
    try {
      await GameTeam.destroy({
        where: {
          gameId,
          teamId: { [Op.in]: teamIds },
        },
      });

      logger.info(`Removed ${teamIds.length} teams from game: ${gameId}`);
    } catch (error) {
      logger.error('Error removing teams from game:', error);
      throw error;
    }
  }

  /**
   * Получить команды игры
   */
  async getGameTeams(gameId: string): Promise<Team[]> {
    try {
      const game = await Game.findByPk(gameId, {
        include: [
          {
            model: Team,
            through: {
              where: { isActive: true },
            },
          },
        ],
      });

      if (!game) {
        throw new Error('Игра не найдена');
      }

      return game.teams || [];
    } catch (error) {
      logger.error('Error getting game teams:', error);
      throw error;
    }
  }
}
