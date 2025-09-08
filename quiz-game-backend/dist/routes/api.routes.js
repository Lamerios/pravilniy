"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const game_scores_routes_1 = tslib_1.__importDefault(require("./game-scores.routes"));
const game_routes_1 = tslib_1.__importDefault(require("./game.routes"));
const protected_routes_1 = tslib_1.__importDefault(require("./protected.routes"));
const score_routes_1 = tslib_1.__importDefault(require("./score.routes"));
const team_routes_1 = tslib_1.__importDefault(require("./team.routes"));
const template_routes_1 = tslib_1.__importDefault(require("./template.routes"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({
        name: 'Quiz Game API',
        version: '1.0.0',
        description: 'API для управления викторинами и играми',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            protected: '/api/protected',
            organizations: '/api/organizations',
            users: '/api/users',
            games: '/api/games',
            templates: '/api/templates',
            teams: '/api/teams',
            scores: '/api/scores'
        },
        documentation: '/api/docs',
        timestamp: new Date().toISOString()
    });
});
router.get('/status', (req, res) => {
    res.json({
        status: 'operational',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development'
    });
});
router.get('/organizations', (req, res) => {
    res.json({
        message: 'Organizations endpoint - coming soon',
        timestamp: new Date().toISOString()
    });
});
router.get('/users', (req, res) => {
    res.json({
        message: 'Users endpoint - coming soon',
        timestamp: new Date().toISOString()
    });
});
router.use('/games', game_routes_1.default);
router.use('/games', game_scores_routes_1.default);
router.use('/templates', template_routes_1.default);
router.use('/teams', team_routes_1.default);
router.use('/scores', score_routes_1.default);
router.use('/protected', protected_routes_1.default);
exports.default = router;
//# sourceMappingURL=api.routes.js.map