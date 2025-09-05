import { Game } from '../models/game.model';
import { Team } from '../models/team.model';
import { CreateGameDto, GameListResult, GameQueryDto, GameStateChangeDto, GameStats, UpdateGameDto } from '../types/game.types';
export declare class GameService {
    getGames(query: GameQueryDto): Promise<GameListResult>;
    getGameById(id: number): Promise<Game | null>;
    createGame(createData: CreateGameDto, userId: string, organizationId: number): Promise<Game>;
    updateGame(id: number, updateData: UpdateGameDto, userId: string): Promise<Game | null>;
    deleteGame(id: number, userId: string): Promise<boolean>;
    searchGames(query: GameQueryDto): Promise<GameListResult>;
    getGameStats(): Promise<GameStats>;
    changeGameState(id: number, stateChange: GameStateChangeDto, userId: string): Promise<Game | null>;
    private validateGameData;
    private validateGameSettings;
    addTeamsToGame(gameId: string, teamIds: string[], organizationId: number): Promise<void>;
    removeTeamsFromGame(gameId: string, teamIds: string[]): Promise<void>;
    getGameTeams(gameId: string): Promise<Team[]>;
}
//# sourceMappingURL=game.service.d.ts.map