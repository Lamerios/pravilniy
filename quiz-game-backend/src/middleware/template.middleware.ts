import { createQueryValidationMiddleware, createValidationMiddleware, templateValidationSchemas } from './validation.middleware';

/**
 * Middleware для валидации данных создания шаблона
 */
export const validateCreateTemplate = createValidationMiddleware(templateValidationSchemas.createTemplate);

/**
 * Middleware для валидации данных обновления шаблона
 */
export const validateUpdateTemplate = createValidationMiddleware(templateValidationSchemas.updateTemplate);

/**
 * Middleware для валидации параметров запроса
 */
export const validateTemplateQuery = createQueryValidationMiddleware(templateValidationSchemas.templateQuery);
