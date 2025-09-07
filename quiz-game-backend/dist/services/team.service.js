"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamService = exports.TeamService = void 0;
const sequelize_1 = require("sequelize");
const game_model_1 = require("../models/game.model");
const organization_model_1 = require("../models/organization.model");
const team_model_1 = require("../models/team.model");
class TeamService {
    async getTeams(query = {}) {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC', isActive, organizationId } = query;
        const offset = (page - 1) * limit;
        const where = {};
        if (organizationId) {
            where['organizationId'] = organizationId;
        }
        if (isActive !== undefined) {
            where['isActive'] = isActive;
        }
        if (search) {
            where[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { captain: { [sequelize_1.Op.iLike]: `%${search}%` } }
            ];
        }
        const { count, rows } = await team_model_1.Team.findAndCountAll({
            where,
            include: [
                {
                    model: organization_model_1.Organization,
                    attributes: ['id', 'name']
                },
                {
                    model: game_model_1.Game,
                    attributes: ['id', 'name', 'status'],
                    required: false
                }
            ],
            order: [[sortBy, sortOrder]],
            limit,
            offset,
            distinct: true
        });
        const totalPages = Math.ceil(count / limit);
        return {
            teams: rows,
            currentPage: page,
            totalPages,
            totalItems: count,
            itemsPerPage: limit
        };
    }
    async getTeamById(id) {
        return team_model_1.Team.findByPk(id, {
            include: [
                {
                    model: organization_model_1.Organization,
                    attributes: ['id', 'name']
                },
                {
                    model: game_model_1.Game,
                    attributes: ['id', 'name', 'status'],
                    required: false
                }
            ]
        });
    }
    async createTeam(teamData, organizationId) {
        if (teamData.tableNumber) {
            const existingTeam = await team_model_1.Team.findOne({
                where: {
                    organizationId,
                    tableNumber: teamData.tableNumber
                }
            });
            if (existingTeam) {
                throw new Error(`Команда с номером стола ${teamData.tableNumber} уже существует в этой организации`);
            }
        }
        const team = await team_model_1.Team.create({
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
                worstRound: 0
            }
        });
        return this.getTeamById(team.id);
    }
    async updateTeam(id, teamData) {
        const team = await team_model_1.Team.findByPk(id);
        if (!team) {
            return null;
        }
        if (teamData.tableNumber && teamData.tableNumber !== team.tableNumber) {
            const existingTeam = await team_model_1.Team.findOne({
                where: {
                    organizationId: team.organizationId,
                    tableNumber: teamData.tableNumber,
                    id: { [sequelize_1.Op.ne]: id }
                }
            });
            if (existingTeam) {
                throw new Error(`Команда с номером стола ${teamData.tableNumber} уже существует в этой организации`);
            }
        }
        await team.update(teamData);
        return this.getTeamById(id);
    }
    async deleteTeam(id) {
        const team = await team_model_1.Team.findByPk(id);
        if (!team) {
            return false;
        }
        await team.destroy();
        return true;
    }
    async searchTeams(query) {
        const { search = '', limit = 20, organizationId, isActive } = query;
        const where = {};
        if (organizationId) {
            where['organizationId'] = organizationId;
        }
        if (isActive !== undefined) {
            where['isActive'] = isActive;
        }
        if (search) {
            where[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${search}%` } },
                { captain: { [sequelize_1.Op.iLike]: `%${search}%` } }
            ];
        }
        const teams = await team_model_1.Team.findAll({
            where,
            include: [
                {
                    model: organization_model_1.Organization,
                    attributes: ['id', 'name']
                }
            ],
            limit,
            order: [['name', 'ASC']]
        });
        return {
            teams,
            total: teams.length,
            query: search
        };
    }
    async getTeamStats(organizationId) {
        const where = {};
        if (organizationId) {
            where['organizationId'] = organizationId;
        }
        const [totalTeams, activeTeams, inactiveTeams, recentTeams, popularTeams] = await Promise.all([
            team_model_1.Team.count({ where }),
            team_model_1.Team.count({ where: { ...where, isActive: true } }),
            team_model_1.Team.count({ where: { ...where, isActive: false } }),
            team_model_1.Team.findAll({
                where,
                attributes: ['id', 'name', 'createdAt'],
                order: [['createdAt', 'DESC']],
                limit: 5
            }),
            team_model_1.Team.findAll({
                where,
                attributes: ['id', 'name'],
                include: [
                    {
                        model: game_model_1.Game,
                        attributes: ['id'],
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 5
            })
        ]);
        const teamsWithMembers = await team_model_1.Team.findAll({
            where,
            attributes: ['members']
        });
        const averageMembersPerTeam = teamsWithMembers.length > 0
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
                createdAt: team.createdAt.toISOString()
            })),
            popularTeams: popularTeams.map(team => ({
                teamId: team.id,
                teamName: team.name,
                gamesPlayed: team.games ? team.games.length : 0
            }))
        };
    }
    async getTeamsByOrganization(organizationId, isActive) {
        const where = { organizationId };
        if (isActive !== undefined) {
            where['isActive'] = isActive;
        }
        return team_model_1.Team.findAll({
            where,
            include: [
                {
                    model: organization_model_1.Organization,
                    attributes: ['id', 'name']
                }
            ],
            order: [['name', 'ASC']]
        });
    }
    async isTableNumberUnique(organizationId, tableNumber, excludeId) {
        const where = {
            organizationId,
            tableNumber
        };
        if (excludeId) {
            where['id'] = { [sequelize_1.Op.ne]: excludeId };
        }
        const existingTeam = await team_model_1.Team.findOne({ where });
        return !existingTeam;
    }
    async checkTableNumber(tableNumber, organizationId, excludeTeamId) {
        const where = {
            tableNumber,
            organizationId
        };
        if (excludeTeamId) {
            where['id'] = { [sequelize_1.Op.ne]: excludeTeamId };
        }
        const existingTeam = await team_model_1.Team.findOne({ where });
        return {
            isUnique: !existingTeam,
            existingTeam: existingTeam ? existingTeam : undefined
        };
    }
    async getNextAvailableTableNumber(organizationId) {
        const maxTableNumber = await team_model_1.Team.max('tableNumber', {
            where: { organizationId }
        });
        return (maxTableNumber || 0) + 1;
    }
    async validateTableNumbers(tableNumbers, organizationId) {
        const conflicts = [];
        for (const tableNumber of tableNumbers) {
            const { isUnique, existingTeam } = await this.checkTableNumber(tableNumber, organizationId);
            if (!isUnique && existingTeam) {
                conflicts.push({ tableNumber, team: existingTeam });
            }
        }
        const duplicates = tableNumbers.filter((num, index) => tableNumbers.indexOf(num) !== index);
        for (const duplicate of duplicates) {
            const existingTeam = await team_model_1.Team.findOne({
                where: { tableNumber: duplicate, organizationId }
            });
            if (existingTeam) {
                conflicts.push({ tableNumber: duplicate, team: existingTeam });
            }
        }
        return {
            valid: conflicts.length === 0,
            conflicts
        };
    }
}
exports.TeamService = TeamService;
exports.teamService = new TeamService();
//# sourceMappingURL=team.service.js.map