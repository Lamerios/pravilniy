"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const template_controller_1 = require("../controllers/template.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const template_middleware_1 = require("../middleware/template.middleware");
const router = (0, express_1.Router)();
const templateController = new template_controller_1.TemplateController();
router.get('/', template_middleware_1.validateTemplateQuery, templateController.getTemplates);
router.get('/search', template_middleware_1.validateTemplateQuery, templateController.searchTemplates);
router.get('/stats', templateController.getTemplateStats);
router.get('/:id', templateController.getTemplateById);
router.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, auth_middleware_1.requireAdminOrModerator, template_middleware_1.validateCreateTemplate, templateController.createTemplate);
router.put('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, template_middleware_1.validateUpdateTemplate, templateController.updateTemplate);
router.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireActiveUser, templateController.deleteTemplate);
exports.default = router;
//# sourceMappingURL=template.routes.js.map