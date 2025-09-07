// Экспорт всех моделей
export { GameTemplate } from './game-template.model';
export { Game } from './game.model';
export { Organization } from './organization.model';
export { Round } from './round.model';
export { Team } from './team.model';
export { User } from './user.model';
// Answer модель удалена
export { Score } from './score.model';

// Экспорт типов и интерфейсов
export { GameData, GameSettings, GameStatus, ScoringSystem } from './game.model';
export { RoundSettings, RoundStatistics, RoundStatus, RoundType } from './round.model';
// AnswerMetadata удален вместе с Answer моделью
// ScoreMetadata, ScoreType не экспортируются из score.model
export { ContactInfo, TeamMember, TeamStatistics } from './team.model';

// Экспорт ассоциаций
export { setupAssociations } from './associations';
