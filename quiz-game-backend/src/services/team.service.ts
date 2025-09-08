import { Op, WhereOptions } from 'sequelize';
import { Game } from '../models/game.model';
import { Organization } from '../models/organization.model';
import { Team } from '../models/team.model';
import {
  CreateTeamDto,
  TeamListResult,
  TeamQueryDto,
  TeamSearchResult,
  TeamStats,
  UpdateTeamDto,
} from '../types/team.types';

export class TeamService {
  /**
   * Получить список команд с пагинацией и фильтрацией
   */
  async getTeams(query: TeamQueryDto = {}): Promise<TeamListResult> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      isActive,
      organizationId,
    } = query;

    const offset = (page - 1) * limit;
    const where: WhereOptions = {};

    // Фильтр по организации
    if (organizationId) {
      where['organizationId'] = organizationId;
    }

    // Фильтр по активности
    if (isActive !== undefined) {
      where['isActive'] = isActive;
    }

    // Поиск по названию или капитану
    if (search) {
      (where as any)[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { captain: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Team.findAndCountAll({
      where,
      include: [
        {
          model: Organization,
          attributes: ['id', 'name'],
        },
        {
          model: Game,
          attributes: ['id', 'name', 'status'],
          required: false,
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      teams: rows,
      currentPage: page,
      totalPages,
      totalItems: count,
      itemsPerPage: limit,
    };
  }

  /**
   * Получить команду по ID
   */
  async getTeamById(id: string): Promise<Team | null> {
    return Team.findByPk(id, {
      include: [
        {
          model: Organization,
          attributes: ['id', 'name'],
        },
        {
          model: Game,
          attributes: ['id', 'name', 'status'],
          required: false,
        },
      ],
    });
  }

  /**
   * Создать новую команду
   */
  async createTeam(teamData: CreateTeamDto, organizationId: number): Promise<Team> {
    // Проверяем уникальность номера стола в организации
    if (teamData.tableNumber) {
      const existingTeam = await Team.findOne({
        where: {
          organizationId,
          tableNumber: teamData.tableNumber,
        },
      });

      if (existingTeam) {
        throw new Error(
          `Команда с номером стола ${teamData.tableNumber} уже существует в этой организации`,
        );
      }
    }

    const team = await Team.create({
      name: teamData.name,
      description: teamData.description,
      captain: teamData.captain,
      members: teamData.members,
      contactInfo: teamData.contactInfo,
      tableNumber: teamData.tableNumber,
      logoUrl: teamData.logoUrl,
      organizationId,
      totalScore: 0,
      currentRound: 0,
      bonusPoints: 0,
      penaltyPoints: 0,
      isActive: teamData.isActive ?? true,
      isReady: false,
      statistics: {
        roundsPlayed: 0,
        totalScore: 0,
        averageScore: 0,
        bestRound: 0,
        worstRound: 0,
      },
    } as any);

    return this.getTeamById(team.id) as Promise<Team>;
  }

  /**
   * Обновить команду
   */
  async updateTeam(id: string, teamData: UpdateTeamDto): Promise<Team | null> {
    const team = await Team.findByPk(id);
    if (!team) {
      return null;
    }

    // Проверяем уникальность номера стола при обновлении
    if (teamData.tableNumber && teamData.tableNumber !== team.tableNumber) {
      const existingTeam = await Team.findOne({
        where: {
          organizationId: team.organizationId,
          tableNumber: teamData.tableNumber,
          id: { [Op.ne]: id },
        },
      });

      if (existingTeam) {
        throw new Error(
          `Команда с номером стола ${teamData.tableNumber} уже существует в этой организации`,
        );
      }
    }

    await team.update(teamData);
    return this.getTeamById(id);
  }

  /**
   * Удалить команду
   */
  async deleteTeam(id: string): Promise<boolean> {
    const team = await Team.findByPk(id);
    if (!team) {
      return false;
    }

    await team.destroy();
    return true;
  }

  /**
   * Поиск команд
   */
  async searchTeams(query: TeamQueryDto): Promise<TeamSearchResult> {
    const { search = '', limit = 20, organizationId, isActive } = query;

    const where: WhereOptions = {};

    if (organizationId) {
      where['organizationId'] = organizationId;
    }

    if (isActive !== undefined) {
      where['isActive'] = isActive;
    }

    if (search) {
      (where as any)[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { captain: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const teams = await Team.findAll({
      where,
      include: [
        {
          model: Organization,
          attributes: ['id', 'name'],
        },
      ],
      limit,
      order: [['name', 'ASC']],
    });

    return {
      teams,
      total: teams.length,
      query: search,
    };
  }

  /**
   * Получить статистику команд
   */
  async getTeamStats(organizationId?: number): Promise<TeamStats> {
    const where: WhereOptions = {};
    if (organizationId) {
      where['organizationId'] = organizationId;
    }

    const [totalTeams, activeTeams, inactiveTeams, recentTeams, popularTeams] = await Promise.all([
      Team.count({ where }),
      Team.count({ where: { ...where, isActive: true } }),
      Team.count({ where: { ...where, isActive: false } }),
      Team.findAll({
        where,
        attributes: ['id', 'name', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
      Team.findAll({
        where,
        attributes: ['id', 'name'],
        include: [
          {
            model: Game,
            attributes: ['id'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),
    ]);

    // Подсчитываем среднее количество участников
    const teamsWithMembers = await Team.findAll({
      where,
      attributes: ['members'],
    });

    const averageMembersPerTeam =
      teamsWithMembers.length > 0
        ? teamsWithMembers.reduce((sum, team) => {
            const memberCount = team.members ? team.members.length : 0;
            return sum + memberCount;
          }, 0) / teamsWithMembers.length
        : 0;

    return {
      totalTeams,
      activeTeams,
      inactiveTeams,
      averageMembersPerTeam: Math.round(averageMembersPerTeam * 100) / 100,
      recentTeams: recentTeams.map(team => ({
        id: team.id,
        name: team.name,
        createdAt: team.createdAt.toISOString(),
      })),
      popularTeams: popularTeams.map(team => ({
        teamId: team.id,
        teamName: team.name,
        gamesPlayed: team.games ? team.games.length : 0, // Упрощенная логика
      })),
    };
  }

  /**
   * Получить команды по организации
   */
  async getTeamsByOrganization(organizationId: string, isActive?: boolean): Promise<Team[]> {
    const where: WhereOptions = { organizationId };
    if (isActive !== undefined) {
      where['isActive'] = isActive;
    }

    return Team.findAll({
      where,
      include: [
        {
          model: Organization,
          attributes: ['id', 'name'],
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  /**
   * Проверить уникальность номера стола
   */
  async isTableNumberUnique(
    organizationId: number,
    tableNumber: number,
    excludeId?: string,
  ): Promise<boolean> {
    const where: WhereOptions = {
      organizationId,
      tableNumber,
    };

    if (excludeId) {
      where['id'] = { [Op.ne]: excludeId };
    }

    const existingTeam = await Team.findOne({ where });
    return !existingTeam;
  }

  /**
   * Проверить уникальность номера стола с детальной информацией
   */
  async checkTableNumber(
    tableNumber: number,
    organizationId: number,
    excludeTeamId?: string,
  ): Promise<{ isUnique: boolean; existingTeam?: Team | undefined }> {
    const where: WhereOptions = {
      tableNumber,
      organizationId,
    };

    // Исключаем текущую команду при обновлении
    if (excludeTeamId) {
      where['id'] = { [Op.ne]: excludeTeamId };
    }

    const existingTeam = await Team.findOne({ where });

    return {
      isUnique: !existingTeam,
      existingTeam: existingTeam ? existingTeam : undefined,
    };
  }

  /**
   * Получить следующий доступный номер стола в организации
   */
  async getNextAvailableTableNumber(organizationId: number): Promise<number> {
    const maxTableNumber = await Team.max('tableNumber', {
      where: { organizationId },
    });

    return ((maxTableNumber as number) || 0) + 1;
  }

  /**
   * Валидировать номера столов для множественного создания команд
   */
  async validateTableNumbers(
    tableNumbers: number[],
    organizationId: number,
  ): Promise<{ valid: boolean; conflicts: Array<{ tableNumber: number; team: Team }> }> {
    const conflicts: Array<{ tableNumber: number; team: Team }> = [];

    for (const tableNumber of tableNumbers) {
      const { isUnique, existingTeam } = await this.checkTableNumber(tableNumber, organizationId);

      if (!isUnique && existingTeam) {
        conflicts.push({ tableNumber, team: existingTeam });
      }
    }

    // Проверяем дубликаты внутри самого массива
    const duplicates = tableNumbers.filter((num, index) => tableNumbers.indexOf(num) !== index);
    for (const duplicate of duplicates) {
      const existingTeam = await Team.findOne({
        where: { tableNumber: duplicate, organizationId },
      });
      if (existingTeam) {
        conflicts.push({ tableNumber: duplicate, team: existingTeam });
      }
    }

    return {
      valid: conflicts.length === 0,
      conflicts,
    };
  }
}

export const teamService = new TeamService();
