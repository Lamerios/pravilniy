"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_controller_1 = require("../controllers/health.controller");
const router = (0, express_1.Router)();
router.get('/', health_controller_1.HealthController.getHealth);
router.get('/database', health_controller_1.HealthController.getDatabaseHealth);
router.get('/memory', health_controller_1.HealthController.getMemoryHealth);
exports.default = router;
//# sourceMappingURL=health.routes.js.map