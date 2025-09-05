import { GameTemplate } from '../models/game-template.model';
import { CreateTemplateDto, TemplateListResult, TemplateQueryDto, TemplateStats, UpdateTemplateDto } from '../types/template.types';
export declare class TemplateService {
    getTemplates(query: TemplateQueryDto): Promise<TemplateListResult>;
    getTemplateById(id: string): Promise<GameTemplate | null>;
    createTemplate(createData: CreateTemplateDto, userId: string): Promise<GameTemplate>;
    updateTemplate(id: string, updateData: UpdateTemplateDto, userId: string): Promise<GameTemplate | null>;
    deleteTemplate(id: string, userId: string): Promise<boolean>;
    searchTemplates(query: TemplateQueryDto): Promise<TemplateListResult>;
    getTemplateStats(): Promise<TemplateStats>;
    private validateTemplateData;
    private validateTemplateSettings;
}
//# sourceMappingURL=template.service.d.ts.map