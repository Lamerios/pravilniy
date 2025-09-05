"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTemplateQuery = exports.validateUpdateTemplate = exports.validateCreateTemplate = void 0;
const validation_middleware_1 = require("./validation.middleware");
exports.validateCreateTemplate = (0, validation_middleware_1.createValidationMiddleware)(validation_middleware_1.templateValidationSchemas.createTemplate);
exports.validateUpdateTemplate = (0, validation_middleware_1.createValidationMiddleware)(validation_middleware_1.templateValidationSchemas.updateTemplate);
exports.validateTemplateQuery = (0, validation_middleware_1.createQueryValidationMiddleware)(validation_middleware_1.templateValidationSchemas.templateQuery);
//# sourceMappingURL=template.middleware.js.map