import { GameTemplate } from './game-template.model';
import { Game } from './game.model';
import { Organization } from './organization.model';
import { Round } from './round.model';
import { Team } from './team.model';
import { User } from './user.model';
// Answer модель удалена
import { Score } from './score.model';

/**
 * Настройка всех ассоциаций между моделями
 * Определяет связи между таблицами базы данных
 */
export function setupAssociations(): void {

  // ===== ORGANIZATION ASSOCIATIONS =====
  Organization.hasMany(User, {
    foreignKey: 'organizationId',
    as: 'users',
    onDelete: 'CASCADE'
  });

  Organization.hasMany(GameTemplate, {
    foreignKey: 'organizationId',
    as: 'gameTemplates',
    onDelete: 'CASCADE'
  });

  Organization.hasMany(Game, {
    foreignKey: 'organizationId',
    as: 'games',
    onDelete: 'CASCADE'
  });

  Organization.hasMany(Team, {
    foreignKey: 'organizationId',
    as: 'teams',
    onDelete: 'CASCADE'
  });

  // ===== USER ASSOCIATIONS =====
  User.belongsTo(Organization, {
    foreignKey: 'organizationId',
    as: 'organization'
  });

  User.hasMany(GameTemplate, {
    foreignKey: 'createdBy',
    as: 'createdGameTemplates',
    onDelete: 'RESTRICT'
  });

  User.hasMany(Game, {
    foreignKey: 'createdBy',
    as: 'createdGames',
    onDelete: 'RESTRICT'
  });

  // Связь с Answer удалена

  User.hasMany(Score, {
    foreignKey: 'awardedBy',
    as: 'awardedScores',
    onDelete: 'SET NULL'
  });

  // ===== GAME TEMPLATE ASSOCIATIONS =====
  GameTemplate.belongsTo(Organization, {
    foreignKey: 'organizationId',
    as: 'organization'
  });

  GameTemplate.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  GameTemplate.hasMany(Game, {
    foreignKey: 'templateId',
    as: 'games',
    onDelete: 'RESTRICT'
  });

  // ===== GAME ASSOCIATIONS =====
  Game.belongsTo(Organization, {
    foreignKey: 'organizationId',
    as: 'organization'
  });

  Game.belongsTo(GameTemplate, {
    foreignKey: 'templateId',
    as: 'template'
  });

  Game.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  Game.hasMany(Team, {
    foreignKey: 'gameId',
    as: 'teams',
    onDelete: 'CASCADE'
  });

  Game.hasMany(Round, {
    foreignKey: 'gameId',
    as: 'rounds',
    onDelete: 'CASCADE'
  });

  // Связь Game -> Answer удалена

  Game.hasMany(Score, {
    foreignKey: 'gameId',
    as: 'scores',
    onDelete: 'CASCADE'
  });

  // ===== TEAM ASSOCIATIONS =====
  Team.belongsTo(Organization, {
    foreignKey: 'organizationId',
    as: 'organization'
  });

  Team.belongsTo(Game, {
    foreignKey: 'gameId',
    as: 'game'
  });

  // Связь Team -> Answer удалена

  Team.hasMany(Score, {
    foreignKey: 'teamId',
    as: 'scores',
    onDelete: 'CASCADE'
  });

  // ===== ROUND ASSOCIATIONS =====
  Round.belongsTo(Game, {
    foreignKey: 'gameId',
    as: 'game'
  });

  // Связь Round -> Answer удалена

  Round.hasMany(Score, {
    foreignKey: 'roundId',
    as: 'scores',
    onDelete: 'CASCADE'
  });

  // ===== ANSWER ASSOCIATIONS УДАЛЕНЫ =====
  // Answer модель полностью удалена из системы

  // ===== SCORE ASSOCIATIONS =====
  Score.belongsTo(Game, {
    foreignKey: 'gameId',
    as: 'game'
  });

  Score.belongsTo(Team, {
    foreignKey: 'teamId',
    as: 'team'
  });

  Score.belongsTo(Round, {
    foreignKey: 'roundId',
    as: 'round'
  });

  // Связь Score -> Answer удалена

  Score.belongsTo(User, {
    foreignKey: 'awardedBy',
    as: 'awarder'
  });

  console.log('✅ All model associations have been set up');
}

/**
 * Функция для проверки корректности ассоциаций
 * Полезна для отладки и тестирования
 */
export function validateAssociations(): boolean {
  try {
    const models = [Organization, User, GameTemplate, Game, Team, Round, Score];

    for (const model of models) {
      // Проверяем, что модель имеет ассоциации
      const associations = (model as any).associations;
      if (!associations || Object.keys(associations).length === 0) {
        console.warn(`⚠️  Model ${model.name} has no associations`);
      }
    }

    console.log('✅ Association validation completed');
    return true;
  } catch (error) {
    console.error('❌ Association validation failed:', error);
    return false;
  }
}
