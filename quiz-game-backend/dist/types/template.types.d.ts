import { GameTemplate } from '../models/game-template.model';
export interface CreateTemplateDto {
    name: string;
    description?: string;
    settings: {
        rounds: number;
        questionsPerRound: number;
        timePerQuestion: number;
        scoringSystem: 'standard' | 'bonus' | 'penalty';
        bonusPoints?: number;
        penaltyPoints?: number;
        categories?: string[];
        difficulty?: 'easy' | 'medium' | 'hard';
    };
    isPublic?: boolean;
    tags?: string[];
}
export interface UpdateTemplateDto {
    name?: string;
    description?: string;
    settings?: {
        rounds?: number;
        questionsPerRound?: number;
        timePerQuestion?: number;
        scoringSystem?: 'standard' | 'bonus' | 'penalty';
        bonusPoints?: number;
        penaltyPoints?: number;
        categories?: string[];
        difficulty?: 'easy' | 'medium' | 'hard';
    };
    isPublic?: boolean;
    tags?: string[];
}
export interface TemplateQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    isPublic?: boolean;
    tags?: string[];
    difficulty?: string;
}
export interface TemplateListResult {
    templates: GameTemplate[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}
export interface TemplateStats {
    totalTemplates: number;
    publicTemplates: number;
    privateTemplates: number;
    mostUsedTemplates: Array<{
        id: string;
        name: string;
        usageCount: number;
    }>;
    recentTemplates: Array<{
        id: string;
        name: string;
        createdAt: Date;
    }>;
}
export interface TemplateValidationResult {
    isValid: boolean;
    errors: string[];
}
//# sourceMappingURL=template.types.d.ts.map