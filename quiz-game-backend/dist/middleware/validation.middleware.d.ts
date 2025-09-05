import { NextFunction, Request, Response } from 'express';
export interface ValidationRule {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    enum?: any[];
    custom?: (value: any) => string | null;
}
export interface ValidationSchema {
    [key: string]: ValidationRule;
}
export declare function createValidationMiddleware(schema: ValidationSchema): (req: Request, res: Response, next: NextFunction) => void;
export declare function createQueryValidationMiddleware(schema: ValidationSchema): (req: Request, res: Response, next: NextFunction) => void;
export declare const gameValidationSchemas: {
    createGame: {
        name: {
            required: boolean;
            type: "string";
            minLength: number;
            maxLength: number;
        };
        description: {
            type: "string";
            maxLength: number;
        };
        templateId: {
            required: boolean;
            type: "string";
            custom: (value: string) => "ID шаблона обязателен" | null;
        };
        scheduledAt: {
            type: "string";
            custom: (value: string) => "Неверный формат даты планирования" | "Дата планирования не может быть в прошлом" | null;
        };
        settings: {
            type: "object";
            custom: (value: any) => string | null;
        };
    };
    updateGame: {
        name: {
            type: "string";
            minLength: number;
            maxLength: number;
            custom: (value: string) => "Название игры не может быть пустым" | null;
        };
        description: {
            type: "string";
            maxLength: number;
        };
        templateId: {
            type: "string";
            custom: (value: string) => "ID шаблона не может быть пустым" | null;
        };
        scheduledAt: {
            type: "string";
            custom: (value: string) => "Неверный формат даты планирования" | "Дата планирования не может быть в прошлом" | null;
        };
        settings: {
            type: "object";
            custom: (value: any) => string | null;
        };
    };
    gameQuery: {
        page: {
            type: "string";
            custom: (value: string) => "Номер страницы должен быть положительным числом" | null;
        };
        limit: {
            type: "string";
            custom: (value: string) => "Лимит должен быть числом от 1 до 100" | null;
        };
        search: {
            type: "string";
            maxLength: number;
        };
        sortBy: {
            type: "string";
            custom: (value: string) => "Неверное поле для сортировки" | null;
        };
        sortOrder: {
            type: "string";
            custom: (value: string) => "Порядок сортировки должен быть ASC или DESC" | null;
        };
        status: {
            type: "string";
            custom: (value: string) => "Неверный статус игры" | null;
        };
        templateId: {
            type: "string";
            custom: (value: string) => "Неверный формат ID шаблона" | null;
        };
    };
};
export declare const templateValidationSchemas: {
    createTemplate: {
        name: {
            required: boolean;
            type: "string";
            minLength: number;
            maxLength: number;
        };
        description: {
            type: "string";
            maxLength: number;
        };
        settings: {
            required: boolean;
            type: "object";
            custom: (value: any) => string | null;
        };
        tags: {
            type: "array";
            custom: (value: any[]) => "Максимум 10 тегов" | "Тег должен быть строкой не более 20 символов" | null;
        };
    };
    updateTemplate: {
        name: {
            type: "string";
            minLength: number;
            maxLength: number;
            custom: (value: string) => "Название шаблона не может быть пустым" | null;
        };
        description: {
            type: "string";
            maxLength: number;
        };
        settings: {
            type: "object";
            custom: (value: any) => string | null;
        };
        tags: {
            type: "array";
            custom: (value: any[]) => "Максимум 10 тегов" | "Тег должен быть строкой не более 20 символов" | null;
        };
    };
    templateQuery: {
        page: {
            type: "string";
            custom: (value: string) => "Номер страницы должен быть положительным числом" | null;
        };
        limit: {
            type: "string";
            custom: (value: string) => "Лимит должен быть числом от 1 до 100" | null;
        };
        search: {
            type: "string";
            maxLength: number;
        };
        sortBy: {
            type: "string";
            custom: (value: string) => "Неверное поле для сортировки" | null;
        };
        sortOrder: {
            type: "string";
            custom: (value: string) => "Порядок сортировки должен быть ASC или DESC" | null;
        };
        difficulty: {
            type: "string";
            custom: (value: string) => "Уровень сложности должен быть easy, medium или hard" | null;
        };
    };
};
export declare const teamValidationSchemas: {
    createTeam: {
        name: {
            required: boolean;
            type: "string";
            minLength: number;
            maxLength: number;
            custom: (value: string) => "Название команды обязательно" | null;
        };
        description: {
            type: "string";
            maxLength: number;
        };
        captain: {
            type: "string";
            maxLength: number;
        };
        members: {
            type: "array";
            custom: (value: any[]) => "Максимум 20 участников в команде" | "Каждый участник должен иметь имя" | "Email участника должен быть строкой" | null;
        };
        contactInfo: {
            type: "object";
            custom: (value: any) => "Email должен быть строкой" | "Телефон должен быть строкой" | "Адрес должен быть строкой" | null;
        };
        tableNumber: {
            type: "number";
            custom: (value: number) => "Номер стола должен быть от 1 до 999" | null;
        };
        logoUrl: {
            type: "string";
            custom: (value: string) => "Неверный формат URL логотипа" | null;
        };
        isActive: {
            type: "boolean";
        };
    };
    updateTeam: {
        name: {
            type: "string";
            minLength: number;
            maxLength: number;
            custom: (value: string) => "Название команды не может быть пустым" | null;
        };
        description: {
            type: "string";
            maxLength: number;
        };
        captain: {
            type: "string";
            maxLength: number;
        };
        members: {
            type: "array";
            custom: (value: any[]) => "Максимум 20 участников в команде" | "Каждый участник должен иметь имя" | "Email участника должен быть строкой" | null;
        };
        contactInfo: {
            type: "object";
            custom: (value: any) => "Email должен быть строкой" | "Телефон должен быть строкой" | "Адрес должен быть строкой" | null;
        };
        tableNumber: {
            type: "number";
            custom: (value: number) => "Номер стола должен быть от 1 до 999" | null;
        };
        logoUrl: {
            type: "string";
            custom: (value: string) => "Неверный формат URL логотипа" | null;
        };
        isActive: {
            type: "boolean";
        };
    };
    teamQuery: {
        page: {
            type: "string";
            custom: (value: string) => "Номер страницы должен быть положительным числом" | null;
        };
        limit: {
            type: "string";
            custom: (value: string) => "Лимит должен быть числом от 1 до 100" | null;
        };
        search: {
            type: "string";
            maxLength: number;
        };
        sortBy: {
            type: "string";
            custom: (value: string) => "Неверное поле для сортировки" | null;
        };
        sortOrder: {
            type: "string";
            custom: (value: string) => "Порядок сортировки должен быть ASC или DESC" | null;
        };
        isActive: {
            type: "string";
            custom: (value: string) => "Фильтр активности должен быть true или false" | null;
        };
        organizationId: {
            type: "string";
            custom: (value: string) => "Неверный формат ID организации" | null;
        };
    };
};
//# sourceMappingURL=validation.middleware.d.ts.map