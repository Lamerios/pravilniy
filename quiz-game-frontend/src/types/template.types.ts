export interface GameTemplate {
  id: string;
  name: string;
  description?: string;
  roundsCount: number;
  questionsPerRound: number;
  timePerQuestion: number;
  settings: TemplateSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSettings {
  rounds: number;
  questionsPerRound: number;
  timePerQuestion: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  categories?: string[];
  customRules?: Record<string, any>;
}

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
  maxTeams: number;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  roundsCount?: number;
  maxTeams?: number;
}

export interface TemplateQueryDto {
  page?: number;
  limit?: number;
  search?: string | undefined;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
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
  recentTemplates: Array<{
    id: string;
    name: string;
    createdAt: string;
  }>;
  popularTemplates: Array<{
    templateId: number;
    templateName: string;
    usageCount: number;
  }>;
}
