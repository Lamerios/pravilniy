import { Response } from 'express';
import { teamService } from '../services/team.service';
import {
    CreateTeamDto,
    TeamQueryDto,
    UpdateTeamDto
} from '../types/team.types';

// Используем существующий тип AuthenticatedRequest
import { AuthenticatedRequest } from '../types/auth.types';

export class TeamController {
  /**
   * Получить список команд
   * GET /api/teams
   */
  async getTeams(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query: TeamQueryDto = {
        page: req.query['page'] ? parseInt(req.query['page'] as string) : undefined,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : undefined,
        search: req.query['search'] as string,
        sortBy: req.query['sortBy'] as string,
        sortOrder: req.query['sortOrder'] as 'ASC' | 'DESC',
        isActive: req.query['isActive'] ? req.query['isActive'] === 'true' : undefined,
        organizationId: req.query['organizationId'] ? parseInt(req.query['organizationId'] as string) : undefined
      };

      const result = await teamService.getTeams(query);

      res.json({
        success: true,
        data: result,
        message: 'Команды успешно получены'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения команд'
      });
    }
  }

  /**
   * Получить команду по ID
   * GET /api/teams/:id
   */
  async getTeamById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const team = await teamService.getTeamById(id!);

      if (!team) {
        res.status(404).json({
          success: false,
          message: 'Команда не найдена'
        });
        return;
      }

      res.json({
        success: true,
        data: team,
        message: 'Команда успешно получена'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения команды'
      });
    }
  }

  /**
   * Создать новую команду
   * POST /api/teams
   */
  async createTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const teamData: CreateTeamDto = req.body;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'ID организации не указан'
        });
        return;
      }

      // Валидация уникальности номера стола
      if (teamData.tableNumber) {
        const isUnique = await teamService.isTableNumberUnique(organizationId, teamData.tableNumber);
        if (!isUnique) {
          res.status(400).json({
            success: false,
            message: `Номер стола ${teamData.tableNumber} уже используется в вашей организации`
          });
          return;
        }
      }

      const team = await teamService.createTeam(teamData, organizationId);

      res.status(201).json({
        success: true,
        data: team,
        message: 'Команда успешно создана'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка создания команды'
      });
    }
  }

  /**
   * Обновить команду
   * PUT /api/teams/:id
   */
  async updateTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const teamData: UpdateTeamDto = req.body;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'ID организации не указан'
        });
        return;
      }

      // Валидация уникальности номера стола при обновлении
      if (teamData.tableNumber) {
        const isUnique = await teamService.isTableNumberUnique(organizationId, teamData.tableNumber, id);
        if (!isUnique) {
          res.status(400).json({
            success: false,
            message: `Номер стола ${teamData.tableNumber} уже используется в вашей организации`
          });
          return;
        }
      }

      const team = await teamService.updateTeam(id!, teamData);

      if (!team) {
        res.status(404).json({
          success: false,
          message: 'Команда не найдена'
        });
        return;
      }

      res.json({
        success: true,
        data: team,
        message: 'Команда успешно обновлена'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка обновления команды'
      });
    }
  }

  /**
   * Удалить команду
   * DELETE /api/teams/:id
   */
  async deleteTeam(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await teamService.deleteTeam(id!);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Команда не найдена'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Команда успешно удалена'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка удаления команды'
      });
    }
  }


  /**
   * Получить следующий доступный номер стола
   * GET /api/teams/next-table-number
   */
  async getNextTableNumber(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'ID организации не указан'
        });
        return;
      }

      const nextNumber = await teamService.getNextAvailableTableNumber(organizationId);

      res.json({
        success: true,
        data: { nextTableNumber: nextNumber },
        message: 'Следующий номер стола получен'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения номера стола'
      });
    }
  }

  /**
   * Валидировать номера столов
   * POST /api/teams/validate-table-numbers
   */
  async validateTableNumbers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tableNumbers } = req.body;
      const organizationId = req.user?.organizationId;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'ID организации не указан'
        });
        return;
      }

      if (!Array.isArray(tableNumbers)) {
        res.status(400).json({
          success: false,
          message: 'Номера столов должны быть переданы в виде массива'
        });
        return;
      }

      const result = await teamService.validateTableNumbers(tableNumbers, organizationId);

      res.json({
        success: true,
        data: result,
        message: result.valid ? 'Все номера столов свободны' : 'Найдены конфликты номеров столов'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка валидации номеров столов'
      });
    }
  }

  /**
   * Поиск команд
   * GET /api/teams/search
   */
  async searchTeams(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query: TeamQueryDto = {
        search: req.query['q'] as string,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : undefined,
        organizationId: req.query['organizationId'] ? parseInt(req.query['organizationId'] as string) : undefined,
        isActive: req.query['isActive'] ? req.query['isActive'] === 'true' : undefined
      };

      const result = await teamService.searchTeams(query);

      res.json({
        success: true,
        data: result,
        message: 'Поиск команд выполнен успешно'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка поиска команд'
      });
    }
  }

  /**
   * Получить статистику команд
   * GET /api/teams/stats
   */
  async getTeamStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const organizationId = req.user?.organizationId;
      const stats = await teamService.getTeamStats(organizationId);

      res.json({
        success: true,
        data: stats,
        message: 'Статистика команд получена успешно'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения статистики команд'
      });
    }
  }

  /**
   * Получить команды по организации
   * GET /api/teams/organization/:organizationId
   */
  async getTeamsByOrganization(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { organizationId } = req.params;
      const isActive = req.query['isActive'] ? req.query['isActive'] === 'true' : undefined;

      const teams = await teamService.getTeamsByOrganization(organizationId!, isActive);

      res.json({
        success: true,
        data: teams,
        message: 'Команды организации получены успешно'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка получения команд организации'
      });
    }
  }

  /**
   * Проверить уникальность номера стола
   * GET /api/teams/check-table/:tableNumber
   */
  async checkTableNumber(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tableNumber } = req.params;
      const organizationId = req.user?.organizationId;
      const excludeId = req.query['excludeId'] as string;

      if (!organizationId) {
        res.status(400).json({
          success: false,
          message: 'ID организации не указан'
        });
        return;
      }

      const isUnique = await teamService.isTableNumberUnique(
        organizationId,
        parseInt(tableNumber!),
        excludeId
      );

      res.json({
        success: true,
        data: { isUnique },
        message: isUnique ? 'Номер стола свободен' : 'Номер стола уже занят'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Ошибка проверки номера стола'
      });
    }
  }
}

export const teamController = new TeamController();
